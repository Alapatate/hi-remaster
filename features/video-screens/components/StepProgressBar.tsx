import { Text } from '@/components/ui/text';
import { ArrowLeftIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { RoundIconButton } from './RoundIconButton';

/** Back button + "Step X of Y" pill with an animated progress fill. */
export function StepProgressBar({
  current,
  total,
  onBack,
}: {
  current: number;
  total: number;
  onBack?: () => void;
}) {
  const { t } = useTranslation();
  const progress = useSharedValue(current / total);

  React.useEffect(() => {
    progress.value = withTiming(current / total, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [current, total, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <View className="flex-row items-center gap-3 px-5">
      <RoundIconButton size={44} onPress={onBack} className="bg-muted">
        <ArrowLeftIcon size={18} color="#bf6e1a" />
      </RoundIconButton>
      <View className="flex-1 flex-row items-center gap-3 rounded-full bg-muted px-4 py-3">
        <Text className="text-sm font-semibold text-foreground">
          {t('stepProgress', { current, total })}
        </Text>
        <View className="h-2 flex-1 overflow-hidden rounded-full bg-sand-dark">
          <Animated.View
            style={[fillStyle, { transformOrigin: 'left' }]}
            className="h-full w-full rounded-full bg-primary"
          />
        </View>
      </View>
    </View>
  );
}
