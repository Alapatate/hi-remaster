import { Text } from '@/components/ui/text';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AlarmClockIcon } from 'lucide-react-native';
import * as React from 'react';
import { Alert, Linking, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useReminders } from '../hooks/useReminders';
import { describeSchedule, formatTime } from '../lib/schedule';
import { ReminderSheet } from './ReminderSheet';

/**
 * Compact alarm control for the home screen: shows the daily sit time at a
 * glance and opens the same editor the profile uses.
 *
 * State comes from `useReminders`, which reads and writes the account prefs, so
 * the profile screen and this button are always looking at the same value —
 * there is no second copy to keep in sync.
 */
export function ReminderQuickButton() {
  const { t } = useTranslation();
  const { reminders, setEnabled, setSchedule } = useReminders();
  const sheetRef = React.useRef<BottomSheetModal>(null);

  const reminder = reminders.dailySit;
  const dayName = React.useCallback((weekday: number) => t(`dayShort${weekday}`), [t]);

  const label = reminder.enabled
    ? formatTime(reminder.hour, reminder.minute)
    : t('reminderOff');

  const schedule = describeSchedule(reminder, {
    everyDay: t('reminderEveryDay'),
    weekdays: t('reminderWeekdays'),
    weekends: t('reminderWeekends'),
    noDays: t('reminderNoDays'),
    dayName,
  });

  return (
    <>
      <TouchableOpacity
        onPress={() => sheetRef.current?.present()}
        activeOpacity={0.75}
        accessibilityLabel={reminder.enabled ? schedule : t('reminderOff')}
        className={`flex-row items-center gap-2 rounded-full px-3 py-2 ${
          reminder.enabled ? 'bg-primary/15' : 'bg-card'
        }`}>
        <AlarmClockIcon size={17} color="#bf6e1a" />
        <Text
          className={`font-body-semibold text-sm ${
            reminder.enabled ? 'text-primary' : 'text-muted-foreground'
          }`}>
          {label}
        </Text>
      </TouchableOpacity>

      <ReminderSheet
        ref={sheetRef}
        id="dailySit"
        title={t('reminderDailySit')}
        reminder={reminder}
        dayName={dayName}
        onSave={(next) => {
          sheetRef.current?.dismiss();
          // Saving from here also turns the reminder on — the point of setting a
          // time from the home screen is to have it ring.
          setSchedule('dailySit', next)
            .then(() => {
              if (reminder.enabled) return;
              return setEnabled('dailySit', true).then((applied) => {
                if (!applied) {
                  Alert.alert(t('reminderPermissionTitle'), t('reminderPermissionBody'), [
                    { text: t('quitCancel'), style: 'cancel' },
                    { text: t('reminderOpenSettings'), onPress: () => Linking.openSettings() },
                  ]);
                }
              });
            })
            .catch(() => {});
        }}
      />

    </>
  );
}
