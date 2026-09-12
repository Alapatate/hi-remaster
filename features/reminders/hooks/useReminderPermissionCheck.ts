import { useAuth } from '@/lib/auth';
import * as React from 'react';
import { requestPermission } from '../lib/notifications';
import { parseReminders, REMINDER_IDS, REMINDERS_PREF_KEY } from '../lib/schedule';

/**
 * Reminders live in the account prefs, but the OS permission does not travel
 * with them — it can be revoked in system settings, or never have been granted
 * on this device. So once per signed-in user (app launch or sign-in), check
 * that an enabled reminder can actually ring.
 *
 * `requestPermission` re-prompts when the OS still allows it, so the dialog is
 * only reported for the case the app cannot fix on its own: a hard denial that
 * has to be undone in system settings.
 */
export function useReminderPermissionCheck() {
  const { user } = useAuth();
  const [blocked, setBlocked] = React.useState(false);
  const checkedFor = React.useRef<string | null>(null);

  React.useEffect(() => {
    const userId = user?.$id;
    if (!userId || checkedFor.current === userId) return;

    const reminders = parseReminders(
      (user?.prefs as Record<string, unknown>)?.[REMINDERS_PREF_KEY]
    );
    // Nothing scheduled: stay silent, and leave the check open in case a
    // reminder is switched on later in this session.
    if (!REMINDER_IDS.some((id) => reminders[id].enabled)) return;
    checkedFor.current = userId;

    let cancelled = false;
    requestPermission()
      .then((granted) => {
        if (!cancelled && !granted) setBlocked(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user?.$id, user?.prefs]);

  const dismiss = React.useCallback(() => setBlocked(false), []);

  return { blocked, dismiss };
}
