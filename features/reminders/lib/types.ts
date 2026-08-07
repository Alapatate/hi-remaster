/** The two reminders offered on the profile screen. */
export type ReminderId = 'dailySit' | 'windDown';

export type Reminder = {
  enabled: boolean;
  /** 0–23, local time on the device. */
  hour: number;
  /** 0–59, local time on the device. */
  minute: number;
  /**
   * Weekdays the reminder fires on, using the expo-notifications convention:
   * 1 = Sunday … 7 = Saturday. An empty list means the reminder never fires.
   */
  days: number[];
};

export type Reminders = Record<ReminderId, Reminder>;
