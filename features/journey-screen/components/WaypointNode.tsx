import { Text } from '@/components/ui/text';
import { LockIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { NODE_R } from '../lib/layout';
import type { Waypoint } from '../lib/types';

const LABEL_W = 132;

/**
 * A single bird stop on the trail. Unlocked nodes show the bird emoji and are
 * tappable to open its detail sheet; locked nodes are dimmed with a padlock.
 * The frontier (latest unlocked) node gently pulses to draw the eye.
 */
export function WaypointNode({
  waypoint,
  isFrontier,
  accent,
  onPress,
}: {
  waypoint: Waypoint;
  isFrontier: boolean;
  accent: string;
  onPress: (w: Waypoint) => void;
}) {
  const { x, y, unlocked, bird } = waypoint;

  const pulse = useSharedValue(0);
  React.useEffect(() => {
    if (!isFrontier || !unlocked) return;
    pulse.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1100, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 0 })
        ),
        -1
      )
    );
  }, [isFrontier, unlocked, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.6 }],
    opacity: 0.5 * (1 - pulse.value),
  }));

  return (
    <View
      style={{
        position: 'absolute',
        left: x - LABEL_W / 2,
        top: y - NODE_R,
        width: LABEL_W,
        alignItems: 'center',
      }}>
      {/* Pulsing halo on the current frontier node */}
      {isFrontier && unlocked ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              width: NODE_R * 2,
              height: NODE_R * 2,
              borderRadius: NODE_R,
              backgroundColor: accent,
            },
            pulseStyle,
          ]}
        />
      ) : null}

      <Pressable
        disabled={!unlocked}
        onPress={() => onPress(waypoint)}
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.94 : 1 }] })}>
        <View
          className={unlocked ? 'bg-card' : 'bg-muted'}
          style={{
            width: NODE_R * 2,
            height: NODE_R * 2,
            borderRadius: NODE_R,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: unlocked ? accent : 'transparent',
          }}>
          {unlocked ? (
            <Text style={{ fontSize: 30 }}>{bird.emoji}</Text>
          ) : (
            <LockIcon size={24} color="#9a8470" />
          )}
        </View>
      </Pressable>

      <Text
        numberOfLines={1}
        className={`mt-1.5 text-center text-xs font-semibold ${
          unlocked ? 'text-foreground' : 'text-muted-foreground'
        }`}>
        {unlocked ? bird.name : '???'}
      </Text>
    </View>
  );
}
