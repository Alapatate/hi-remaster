import { Text } from '@/components/ui/text';
import { ArrowLeftIcon, ClockIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { formatDuration } from '../lib/format';
import { RoundIconButton } from './RoundIconButton';

/** Back button + "Step X of Y" pill with an animated progress fill and session duration. */
export function StepProgressBar({
  current,
  total,
  sessionDuration = 0,
  onBack,
}: {
  current: number;
  total: number;
  sessionDuration?: number;
  onBack?: () => void;
}) {
  const { t } = useTranslation();
  const progress = useSharedValue(current / total);
  const animatedDuration = useSharedValue(sessionDuration);
  const [displayDuration, setDisplayDuration] = React.useState(() =>
    formatDuration(sessionDuration)
  );

  const updateDisplayDuration = React.useCallback((seconds: number) => {
    setDisplayDuration(formatDuration(seconds));
  }, []);

  React.useEffect(() => {
    progress.value = withTiming(current / total, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [current, total, progress]);

  React.useEffect(() => {
    animatedDuration.value = withTiming(sessionDuration, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
  }, [sessionDuration, animatedDuration]);

  useAnimatedReaction(
    () => animatedDuration.value,
    (value) => {
      runOnJS(updateDisplayDuration)(Math.round(value));
    }
  );

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
      <View className="flex-row items-center gap-1.5 rounded-full bg-primary px-3 py-1">
        <ClockIcon size={14} color="white" />
        <Text className="min-w-[36px] text-lg font-bold text-primary-foreground">
          {displayDuration}
        </Text>
      </View>
    </View>
  );
}
