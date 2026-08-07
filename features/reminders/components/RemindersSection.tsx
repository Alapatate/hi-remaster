import { Text } from '@/components/ui/text';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { Alert, Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useReminders } from '../hooks/useReminders';
import { describeSchedule, REMINDER_IDS } from '../lib/schedule';
import type { ReminderId } from '../lib/types';
import { ReminderRow } from './ReminderRow';
import { ReminderSheet } from './ReminderSheet';

const TITLE_KEY: Record<ReminderId, string> = {
  dailySit: 'reminderDailySit',
  windDown: 'reminderWindDown',
};

export function RemindersSection() {
  const { t } = useTranslation();
  const { reminders, busy, setEnabled, setSchedule } = useReminders();
  const [editing, setEditing] = React.useState<ReminderId>('dailySit');
  const sheetRef = React.useRef<BottomSheetModal>(null);

  const dayName = React.useCallback((weekday: number) => t(`dayShort${weekday}`), [t]);

  const labels = React.useMemo(
    () => ({
      everyDay: t('reminderEveryDay'),
      weekdays: t('reminderWeekdays'),
      weekends: t('reminderWeekends'),
      noDays: t('reminderNoDays'),
      dayName,
    }),
    [t, dayName]
  );

  const handleToggle = async (id: ReminderId, value: boolean) => {
    // A failed save leaves prefs untouched, so the switch simply falls back to
    // the stored value on the next render — nothing to roll back by hand.
    const applied = await setEnabled(id, value).catch(() => true);
    if (!applied) {
      Alert.alert(t('reminderPermissionTitle'), t('reminderPermissionBody'), [
        { text: t('quitCancel'), style: 'cancel' },
        { text: t('reminderOpenSettings'), onPress: () => Linking.openSettings() },
      ]);
    }
  };

  const openSheet = (id: ReminderId) => {
    setEditing(id);
    sheetRef.current?.present();
  };

  return (
    <View className="mb-7">
      <Text className="mb-3 font-heading text-lg">{t('reminders')}</Text>

      <View className="overflow-hidden rounded-2xl border border-border bg-card">
        {REMINDER_IDS.map((id, index) => (
          <React.Fragment key={id}>
            {index > 0 && <View className="h-px bg-border" />}
            <ReminderRow
              id={id}
              title={t(TITLE_KEY[id])}
              subtitle={
                reminders[id].enabled ? describeSchedule(reminders[id], labels) : t('reminderOff')
              }
              enabled={reminders[id].enabled}
              busy={busy === id}
              onToggle={(value) => handleToggle(id, value)}
              onPress={() => openSheet(id)}
            />
          </React.Fragment>
        ))}
      </View>

      <ReminderSheet
        ref={sheetRef}
        id={editing}
        title={t(TITLE_KEY[editing])}
        reminder={reminders[editing]}
        dayName={dayName}
        onSave={(schedule) => {
          sheetRef.current?.dismiss();
          setSchedule(editing, schedule).catch(() => {});
        }}
      />
    </View>
  );
}
