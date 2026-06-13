import { Text } from '@/components/ui/text';
import { HomeIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BirdBadge } from './BirdBadge';
import { RoundIconButton } from './RoundIconButton';

/** Top bar of the immersion home: home button + title + progression badge. */
export function ImmersionHeader({ onHome }: { onHome?: () => void }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between px-5 pt-2">
      <View className="flex-1 flex-row items-center gap-3 pr-3">
        <RoundIconButton size={48} onPress={onHome} className="bg-card" style={{ elevation: 1 }}>
          <HomeIcon size={22} color="#bf6e1a" />
        </RoundIconButton>
        <Text
          className="flex-1 text-2xl font-extrabold leading-7 text-primary"
          numberOfLines={2}>
          {t('immersionTitle')}
        </Text>
      </View>
      <BirdBadge />
    </View>
  );
}
