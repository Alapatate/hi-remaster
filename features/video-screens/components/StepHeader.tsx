import { Text } from '@/components/ui/text';
import { ArrowLeftIcon } from 'lucide-react-native';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { BirdBadge } from './BirdBadge';
import { RoundIconButton } from './RoundIconButton';

const ROW_HEIGHT = 44;
const SEGMENT_HEIGHT = 6;
/** Lets the header's own fade-in start before the bar fill becomes visible. */
const SEGMENT_FILL_DELAY = 180;

/**
 * The stepper's whole header: back, wordmark, progression badge, and one bar
 * per step. A single row rather than a page title stacked above a step row —
 * steps 2 and 3 need the vertical space for their content.
 */
export function StepHeader({
  current,
  total,
  onBack,
}: {
  current: number;
  total: number;
  onBack?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <View className="gap-3 px-5">
      <View className="flex-row items-center justify-between" style={{ height: ROW_HEIGHT }}>
        <RoundIconButton size={ROW_HEIGHT} onPress={onBack} className="bg-muted">
          <ArrowLeftIcon size={18} color="#bf6e1a" />
        </RoundIconButton>

        {/* Absolutely centred so the wordmark stays optically centred whatever
            the widths of the controls on either side. */}
        <View
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          className="flex-row items-center justify-center">
          <Text className="font-heading" style={{ fontSize: 17 }} numberOfLines={1}>
            {t('immersionTitle')}
          </Text>
        </View>

        <BirdBadge compact />
      </View>

      <View className="flex-row" style={{ gap: 6 }}>
        {Array.from({ length: total }, (_, i) => (
          // Only the just-reached bar (the one for the step we're arriving on)
          // animates its fill — earlier ones are already-completed steps and
          // should just read as solid immediately, no matter how it mounts.
          <Segment key={i} filled={i < current} animateIn={i === current - 1} />
        ))}
      </View>
    </View>
  );
}

/** One progress segment, its fill growing from the left as the step is reached. */
function Segment({ filled, animateIn }: { filled: boolean; animateIn: boolean }) {
  const progress = useSharedValue(animateIn ? 0 : filled ? 1 : 0);

  React.useEffect(() => {
    const timing = withTiming(filled ? 1 : 0, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
    progress.value = animateIn ? withDelay(SEGMENT_FILL_DELAY, timing) : timing;
  }, [filled, animateIn, progress]);

  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));

  return (
    <View
      className="flex-1 overflow-hidden bg-sand-dark"
      style={{ height: SEGMENT_HEIGHT, borderRadius: 999 }}>
      <Animated.View
        className="h-full w-full bg-primary"
        style={[fillStyle, { transformOrigin: 'left', borderRadius: 999 }]}
      />
    </View>
  );
}
