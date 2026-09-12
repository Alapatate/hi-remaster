import { useAuth } from '@/lib/auth';
import * as Notifications from 'expo-notifications';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { syncReminder, requestPermission } from '../lib/notifications';
import {
  DEFAULT_REMINDERS,
  parseReminders,
  REMINDER_IDS,
  REMINDERS_PREF_KEY,
  serializeReminders,
} from '../lib/schedule';
import type { Reminder, ReminderId, Reminders } from '../lib/types';

export type ReminderCopy = { title: string; body: string };

export function useReminders() {
  const { user, updatePrefs } = useAuth();
  const { t } = useTranslation();
  const [busy, setBusy] = React.useState<ReminderId | null>(null);

  const reminders: Reminders = React.useMemo(
    () => parseReminders((user?.prefs as Record<string, unknown>)?.[REMINDERS_PREF_KEY]),
    [user?.prefs]
  );

  // The notification text is baked in when the reminder is scheduled, since the
  // OS delivers it with the app closed and cannot call back into i18n.
  const copyFor = React.useCallback(
    (id: ReminderId): ReminderCopy => ({
      title: t(id === 'dailySit' ? 'reminderDailySit' : 'reminderWindDown'),
      body: t(id === 'dailySit' ? 'reminderDailySitBody' : 'reminderWindDownBody'),
    }),
    [t]
  );

  // Keep the latest values reachable from the one-shot reconcile below without
  // making it re-run on every prefs write.
  const remindersRef = React.useRef(reminders);
  const copyRef = React.useRef(copyFor);
  React.useEffect(() => {
    remindersRef.current = reminders;
    copyRef.current = copyFor;
  }, [reminders, copyFor]);

  /**
   * Prefs travel with the account but OS schedules do not. On a reinstall or a
   * second device a reminder can read as enabled with nothing actually queued,
   * so reconcile once per signed-in user.
   */
  const reconciledFor = React.useRef<string | null>(null);
  React.useEffect(() => {
    const userId = user?.$id;
    if (!userId || reconciledFor.current === userId) return;
    reconciledFor.current = userId;

    let cancelled = false;
    (async () => {
      const current = remindersRef.current;
      if (!REMINDER_IDS.some((id) => current[id].enabled)) return;
      const scheduled = await Notifications.getAllScheduledNotificationsAsync().catch(() => null);
      if (!scheduled || cancelled) return;
      for (const id of REMINDER_IDS) {
        const reminder = current[id];
        if (!reminder.enabled) continue;
        const queued = scheduled.filter((n) => n.identifier.startsWith(`reminder:${id}:`)).length;
        if (queued === reminder.days.length) continue;
        await syncReminder(id, reminder, copyRef.current(id)).catch(() => {});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.$id]);

  const persist = React.useCallback(
    async (id: ReminderId, next: Reminder) => {
      const updated: Reminders = { ...reminders, [id]: next };
      await syncReminder(id, next, copyFor(id));
      await updatePrefs({ [REMINDERS_PREF_KEY]: serializeReminders(updated) });
    },
    [reminders, copyFor, updatePrefs]
  );

  /**
   * Turns a reminder on or off. Returns `false` when the OS refused permission,
   * leaving the reminder untouched so the switch can snap back.
   */
  const setEnabled = React.useCallback(
    async (id: ReminderId, enabled: boolean): Promise<boolean> => {
      if (enabled && !(await requestPermission())) return false;
      setBusy(id);
      try {
        await persist(id, { ...reminders[id], enabled });
        return true;
      } finally {
        setBusy(null);
      }
    },
    [reminders, persist]
  );

  /** Applies a new time / day selection, keeping the reminder's enabled state. */
  const setSchedule = React.useCallback(
    async (id: ReminderId, schedule: Pick<Reminder, 'hour' | 'minute' | 'days'>) => {
      setBusy(id);
      try {
        await persist(id, { ...reminders[id], ...schedule });
      } finally {
        setBusy(null);
      }
    },
    [reminders, persist]
  );

  return { reminders, defaults: DEFAULT_REMINDERS, busy, setEnabled, setSchedule };
}
