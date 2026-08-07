import { Text } from '@/components/ui/text';
import { renderBackdrop, SHEET_SHADOW } from '@/features/video-screens/components/player/sheetHelpers';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { BellIcon, ClockIcon, MoonIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  DAY_ORDER,
  describeSchedule,
  EVERY_DAY,
  formatTime,
  nextOccurrence,
  WEEKDAYS,
  WEEKENDS,
} from '../lib/schedule';
import { SHEET_THEME } from '../lib/sheetTheme';
import type { Reminder, ReminderId } from '../lib/types';
import { ITEM_HEIGHT, TimeWheel, WHEEL_HEIGHT, WHEEL_WIDTH } from './TimeWheel';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
/** How far the fade masks reach in from the top and bottom of the wheel. */
const FADE = ITEM_HEIGHT * 1.6;
/** Gap between the two columns, so the hour and minute never crowd each other. */
const COLON_WIDTH = 46;
/** Breathing room between the outermost digits and the selection band's edge. */
const BAND_INSET = 28;
const BAND_WIDTH = WHEEL_WIDTH * 2 + COLON_WIDTH + BAND_INSET * 2;

const sameDays = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort((x, y) => x - y).every((d, i) => d === b[i]);

export const ReminderSheet = React.forwardRef<
  BottomSheetModal,
  {
    id: ReminderId;
    title: string;
    reminder: Reminder;
    dayName: (weekday: number) => string;
    onSave: (schedule: Pick<Reminder, 'hour' | 'minute' | 'days'>) => void;
  }
>(function ReminderSheet({ id, title, reminder, dayName, onSave }, ref) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const palette = SHEET_THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const [hour, setHour] = React.useState(reminder.hour);
  const [minute, setMinute] = React.useState(reminder.minute);
  const [days, setDays] = React.useState(reminder.days);

  // Reset the draft whenever a different reminder is put in the sheet, or the
  // stored value changes underneath it.
  React.useEffect(() => {
    setHour(reminder.hour);
    setMinute(reminder.minute);
    setDays(reminder.days);
  }, [reminder]);

  const toggleDay = (weekday: number) =>
    setDays((current) =>
      current.includes(weekday)
        ? current.filter((d) => d !== weekday)
        : [...current, weekday].sort((a, b) => a - b)
    );

  const presets = [
    { label: t('reminderEveryDay'), value: EVERY_DAY },
    { label: t('reminderWeekdays'), value: WEEKDAYS },
    { label: t('reminderWeekends'), value: WEEKENDS },
  ];

  const draft = { hour, minute, days };

  const scheduleLabel = describeSchedule(
    { ...reminder, ...draft },
    {
      everyDay: t('reminderEveryDay'),
      weekdays: t('reminderWeekdays'),
      weekends: t('reminderWeekends'),
      noDays: t('reminderNoDays'),
      dayName,
    }
  );

  // Recomputed on every change so the consequence of picking a time that has
  // already passed today is visible before saving, not a week later.
  const next = nextOccurrence(draft);
  const nextLabel = React.useMemo(() => {
    if (!next) return t('reminderNoDays');
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const dayGap = Math.round((new Date(next).setHours(0, 0, 0, 0) - +midnight) / 86400000);
    const when =
      dayGap === 0
        ? t('reminderToday')
        : dayGap === 1
          ? t('reminderTomorrow')
          : dayName(next.getDay() + 1);
    return `${t('reminderNext')}: ${when}, ${formatTime(next.getHours(), next.getMinutes())}`;
  }, [next, t, dayName]);

  const HeaderIcon = id === 'dailySit' ? BellIcon : MoonIcon;

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      // The wheels own vertical drags; without this the sheet swallows them.
      enableContentPanningGesture={false}
      backdropComponent={renderBackdrop}
      style={SHEET_SHADOW}
      backgroundStyle={{ backgroundColor: palette.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: palette.handle, width: 44 }}>
      <BottomSheetView className="px-6 pb-9 pt-2">
        {/* Header — badge, name, and the schedule the draft currently describes */}
        <View className="mb-6 flex-row items-center gap-3.5">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <HeaderIcon size={22} color={palette.accent} />
          </View>
          <View className="flex-1">
            <Text className="font-heading text-xl leading-tight">{title}</Text>
            <Text className="mt-0.5 font-body text-[13px] text-muted-foreground">
              {scheduleLabel}
            </Text>
          </View>
        </View>

        {/* Time wheels, with a highlighted centre band and edges that fade out */}
        <View className="items-center justify-center" style={{ height: WHEEL_HEIGHT }}>
          <View
            pointerEvents="none"
            className="absolute rounded-2xl border border-primary/25 bg-primary/10"
            style={{ height: ITEM_HEIGHT, width: BAND_WIDTH }}
          />
          <View className="flex-row items-center">
            <TimeWheel values={HOURS} value={hour} onChange={setHour} />
            <View style={{ width: COLON_WIDTH }} className="items-center">
              <Text className="pb-1 font-heading text-[28px] text-foreground/40">:</Text>
            </View>
            <TimeWheel values={MINUTES} value={minute} onChange={setMinute} />
          </View>
          <LinearGradient
            pointerEvents="none"
            colors={[palette.bg, `${palette.bg}00`]}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: FADE }}
          />
          <LinearGradient
            pointerEvents="none"
            colors={[`${palette.bg}00`, palette.bg]}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: FADE }}
          />
        </View>

        {/* Next firing — the answer to "so when does this actually go off" */}
        <View className="mb-7 mt-4 flex-row items-center justify-center gap-2 self-center rounded-full bg-primary/10 px-4 py-2">
          <ClockIcon size={14} color={palette.accent} />
          <Text className="font-body-medium text-[13px] text-primary">{nextLabel}</Text>
        </View>

        <Text className="mb-2.5 font-body-semibold text-[11px] uppercase tracking-widest text-muted-foreground">
          {t('reminderDays')}
        </Text>
        <View className="mb-3 flex-row justify-between">
          {DAY_ORDER.map((weekday) => {
            const active = days.includes(weekday);
            return (
              <TouchableOpacity
                key={weekday}
                onPress={() => toggleDay(weekday)}
                activeOpacity={0.75}
                className={`h-11 w-11 items-center justify-center rounded-full border ${
                  active ? 'border-primary bg-primary' : 'border-border bg-card'
                }`}>
                <Text
                  className={`font-body-semibold text-[11px] ${
                    active ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                  {dayName(weekday)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mb-7 flex-row gap-2">
          {presets.map((preset) => {
            const active = sameDays(days, preset.value);
            return (
              <TouchableOpacity
                key={preset.label}
                onPress={() => setDays(preset.value)}
                activeOpacity={0.75}
                className={`rounded-full border px-3.5 py-1.5 ${
                  active ? 'border-primary/40 bg-primary/15' : 'border-border bg-card'
                }`}>
                <Text
                  className={`font-body-medium text-xs ${
                    active ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => onSave(draft)}
          activeOpacity={0.85}
          className="items-center rounded-2xl bg-primary py-4">
          <Text className="font-heading text-base text-primary-foreground">{t('reminderDone')}</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
