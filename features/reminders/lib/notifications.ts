import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Reminder, ReminderId } from './types';

/**
 * Reminders are plain scheduled *local* notifications: once handed to the OS
 * they are owned by the OS, so they fire with the app backgrounded, swiped away
 * or never opened since boot. expo-notifications registers a BOOT_COMPLETED /
 * MY_PACKAGE_REPLACED receiver on Android, so schedules also survive a reboot
 * and an app update. Nothing here needs a server or a push token.
 */

export const REMINDER_CHANNEL_ID = 'reminders';

/** Identifiers are `reminder:<id>:<weekday>` so a reminder's schedules are cancellable as a group. */
const PREFIX = 'reminder:';

function identifierFor(id: ReminderId, weekday: number): string {
  return `${PREFIX}${id}:${weekday}`;
}

/**
 * Controls how a reminder is presented while the app is in the foreground.
 * Without it a notification that fires during use is delivered silently.
 * Registered at module load — import this module once from the root layout.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channelReady: Promise<void> | null = null;

/** Android 8+ drops notifications posted to a channel that does not exist yet. */
export function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return Promise.resolve();
  channelReady ??= Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  }).then(() => undefined);
  return channelReady;
}

/**
 * Asks for notification permission, prompting only when it has not been decided
 * yet — iOS ignores repeat requests and Android 13+ stops showing the dialog
 * after two dismissals, so a denied answer has to be resolved in system settings.
 */
export async function requestPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

/** Removes every pending schedule belonging to one reminder. */
export async function cancelReminder(id: ReminderId): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(`${PREFIX}${id}:`))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/**
 * Makes the OS schedule match `reminder`: one repeating weekly notification per
 * selected day. Always clears the reminder's existing schedules first, so this
 * is safe to call on every change and never leaves an orphan from a day that
 * was just deselected.
 */
export async function syncReminder(
  id: ReminderId,
  reminder: Reminder,
  content: { title: string; body: string }
): Promise<void> {
  await cancelReminder(id);
  if (!reminder.enabled || reminder.days.length === 0) return;

  await ensureChannel();
  await Promise.all(
    reminder.days.map((weekday) =>
      Notifications.scheduleNotificationAsync({
        identifier: identifierFor(id, weekday),
        content: {
          title: content.title,
          body: content.body,
          sound: 'default',
          data: { reminderId: id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour: reminder.hour,
          minute: reminder.minute,
          channelId: REMINDER_CHANNEL_ID,
        },
      })
    )
  );
}
