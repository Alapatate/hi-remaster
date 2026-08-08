import { Text } from '@/components/ui/text';
import * as React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { formatDuration } from '../lib/format';

const TWEEN_MS = 420;

/**
 * A duration that counts to its new value instead of snapping, so adding or
 * removing an exercise reads as the total moving rather than replacing itself.
 *
 * The reaction watches whole seconds rather than the raw value, so it crosses
 * to JS once per changed second instead of once per frame.
 */
export function AnimatedDuration({
  seconds,
  className,
  style,
}: {
  seconds: number;
  className?: string;
  style?: StyleProp<TextStyle>;
}) {
  const animated = useSharedValue(seconds);
  const [display, setDisplay] = React.useState(() => formatDuration(seconds));

  const update = React.useCallback((value: number) => {
    setDisplay(formatDuration(value));
  }, []);

  React.useEffect(() => {
    animated.value = withTiming(seconds, {
      duration: TWEEN_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [seconds, animated]);

  useAnimatedReaction(
    () => Math.round(animated.value),
    (current, previous) => {
      if (current !== previous) runOnJS(update)(current);
    }
  );

  return (
    <Text className={className} style={style}>
      {display}
    </Text>
  );
}
