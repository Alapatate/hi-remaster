import type { Reminder, ReminderId, Reminders } from './types';

export const REMINDER_IDS: ReminderId[] = ['dailySit', 'windDown'];

/** Sunday-first, matching the weekday numbers expo-notifications expects. */
export const EVERY_DAY = [1, 2, 3, 4, 5, 6, 7];
export const WEEKDAYS = [2, 3, 4, 5, 6];
export const WEEKENDS = [1, 7];

/** Display order — weeks read Monday-first here, even though 1 is Sunday. */
export const DAY_ORDER = [2, 3, 4, 5, 6, 7, 1];

export const DEFAULT_REMINDERS: Reminders = {
  dailySit: { enabled: false, hour: 7, minute: 0, days: WEEKDAYS },
  windDown: { enabled: false, hour: 21, minute: 30, days: EVERY_DAY },
};

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function normalizeDays(days: unknown, fallback: number[]): number[] {
  if (!Array.isArray(days)) return fallback;
  const kept = [...new Set(days.filter((d): d is number => Number.isInteger(d) && d >= 1 && d <= 7))];
  return kept.sort((a, b) => a - b);
}

function normalizeReminder(raw: unknown, fallback: Reminder): Reminder {
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Record<string, unknown>;
  return {
    enabled: r.enabled === true,
    hour: clamp(Number(r.hour), 0, 23, fallback.hour),
    minute: clamp(Number(r.minute), 0, 59, fallback.minute),
    days: normalizeDays(r.days, fallback.days),
  };
}

/**
 * Reads the reminders back out of Appwrite prefs. Stored as a JSON string so the
 * whole feature occupies a single pref key, and tolerant of anything malformed —
 * a bad value falls back to the defaults rather than breaking the profile screen.
 */
export function parseReminders(raw: unknown): Reminders {
  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return DEFAULT_REMINDERS;
    }
  }
  if (!parsed || typeof parsed !== 'object') return DEFAULT_REMINDERS;
  const source = parsed as Record<string, unknown>;
  return {
    dailySit: normalizeReminder(source.dailySit, DEFAULT_REMINDERS.dailySit),
    windDown: normalizeReminder(source.windDown, DEFAULT_REMINDERS.windDown),
  };
}

export function serializeReminders(reminders: Reminders): string {
  return JSON.stringify(reminders);
}

/** "7:00", "21:30" — 24-hour, matching the design. */
export function formatTime(hour: number, minute: number): string {
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

function sameDays(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((d, i) => d === b[i]);
}

/**
 * When the reminder will next fire, or `null` if no day is selected.
 *
 * A weekly repeat only fires on a matching weekday, so a time that has already
 * passed today waits a full week rather than a few minutes — surfacing this is
 * the difference between "reminder set" and "reminder set, but not until Monday".
 */
export function nextOccurrence(
  reminder: Pick<Reminder, 'hour' | 'minute' | 'days'>,
  from: Date = new Date()
): Date | null {
  if (reminder.days.length === 0) return null;
  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(from);
    candidate.setDate(candidate.getDate() + offset);
    candidate.setHours(reminder.hour, reminder.minute, 0, 0);
    // Date#getDay is 0-based from Sunday; weekday numbers here are 1-based.
    if (candidate > from && reminder.days.includes(candidate.getDay() + 1)) return candidate;
  }
  return null;
}

/**
 * "Weekdays, 7:00" — the label under a reminder's name. `dayName` resolves a
 * weekday number to a short localized name.
 */
export function describeSchedule(
  reminder: Reminder,
  labels: {
    everyDay: string;
    weekdays: string;
    weekends: string;
    noDays: string;
    dayName: (weekday: number) => string;
  }
): string {
  const days = [...reminder.days].sort((a, b) => a - b);
  const time = formatTime(reminder.hour, reminder.minute);
  if (days.length === 0) return labels.noDays;
  if (sameDays(days, EVERY_DAY)) return `${labels.everyDay}, ${time}`;
  if (sameDays(days, WEEKDAYS)) return `${labels.weekdays}, ${time}`;
  if (sameDays(days, WEEKENDS)) return `${labels.weekends}, ${time}`;
  const names = DAY_ORDER.filter((d) => days.includes(d)).map(labels.dayName);
  return `${names.join(' ')}, ${time}`;
}
