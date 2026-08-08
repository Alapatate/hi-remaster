import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BirdBadge } from './BirdBadge';

/** Top bar of the immersion home: wordmark + progression badge. */
export function ImmersionHeader() {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between gap-3 px-5 pt-2">
      <Text className="flex-1 font-heading text-xl leading-7 text-primary">
        {t('immersionTitle')}
      </Text>
      <BirdBadge />
    </View>
  );
}
