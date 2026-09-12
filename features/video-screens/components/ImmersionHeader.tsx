import { Text } from '@/components/ui/text';
import { ReminderQuickButton } from '@/features/reminders';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BirdBadge } from './BirdBadge';

/**
 * Top bar of the immersion home: wordmark on the left, with the daily-sit alarm
 * and the progression badge stacked in the top-right corner. Stacked rather
 * than side by side so both keep their full label — a long bird name used to
 * squeeze the title out of the row.
 */
export function ImmersionHeader() {
  const { t } = useTranslation();
  // Broken at the space so the wordmark runs over two lines and fills the
  // height the stacked badges take opposite it. Titles without a space (zh, ja)
  // just wrap on their own, and `adjustsFontSizeToFit` keeps a long word from
  // pushing into the badges.
  const title = t('immersionTitle').replace(' ', '\n');
  return (
    <View className="flex-row items-start justify-between gap-3 px-5 pt-2">
      <Text
        className="flex-1 font-heading text-primary"
        numberOfLines={2}
        adjustsFontSizeToFit
        style={{ fontSize: 34, lineHeight: 37 }}>
        {title}
      </Text>
      <View className="items-end gap-2">
        <ReminderQuickButton />
        <BirdBadge />
      </View>
    </View>
  );
}
