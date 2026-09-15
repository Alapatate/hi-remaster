import { Text } from '@/components/ui/text';
import * as React from 'react';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

/** How long the toast stays on screen before hiding itself. */
const TOAST_DURATION = 2000;

/**
 * A short, non-blocking message pill that floats above the bottom of the screen
 * and hides itself. Render it as a sibling of the screen's scroll view so it
 * stays put while the content scrolls.
 */
export function Toast({
  visible,
  message,
  icon,
  bottom,
  onHide,
}: {
  visible: boolean;
  message: string;
  icon?: React.ReactNode;
  /** Distance from the bottom edge, e.g. to clear a floating tab bar. */
  bottom: number;
  onHide: () => void;
}) {
  // A new message restarts the countdown so it gets its full time on screen.
  React.useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [visible, message, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(180)}
      pointerEvents="none"
      className="absolute flex-row items-center gap-2 self-center rounded-full bg-foreground px-5 py-3"
      style={{
        bottom,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}>
      {icon}
      <Text className="font-body-semibold text-base text-background">{message}</Text>
    </Animated.View>
  );
}
