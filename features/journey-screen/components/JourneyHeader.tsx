import { Text } from '@/components/ui/text';
import { SparklesIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';

/** Top card: current XP, an animated bar toward the next waypoint, and a tally. */
export function JourneyHeader({
  xp,
  unlockedCount,
  total,
  progressToNext,
  xpToNext,
  nextBirdName,
  accent,
}: {
  xp: number;
  unlockedCount: number;
  total: number;
  progressToNext: number;
  xpToNext: number;
  nextBirdName: string | null;
  accent: string;
}) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const fill = useSharedValue(0);

  React.useEffect(() => {
    fill.value = withTiming(progressToNext, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [progressToNext, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(4, fill.value * 100)}%`,
  }));

  const cardBg = colorScheme === 'dark' ? 'rgba(40, 35, 31, 0.72)' : 'rgba(242, 232, 214, 0.72)';

  return (
    <BlurView
      intensity={0}
      tint={colorScheme === 'dark' ? 'dark' : 'light'}
      className="flex-row gap-3 px-6 pb-2 pt-10">
      <View
        className="flex-1 rounded-2xl border border-border p-4"
        style={{ backgroundColor: cardBg }}>
        <View className="mb-3 flex-row items-center gap-2">
          <View
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: accent }}>
            <SparklesIcon size={18} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold leading-7 text-foreground">
              {xp} <Text className="text-base font-semibold text-muted-foreground">XP</Text>
            </Text>
          </View>
          <Text className="text-sm font-semibold text-muted-foreground">
            {t('discovered', { count: unlockedCount, total })}
          </Text>
        </View>

        <View className="h-2.5 overflow-hidden rounded-full bg-muted">
          <Animated.View
            style={[{ height: '100%', borderRadius: 999, backgroundColor: accent }, fillStyle]}
          />
        </View>

        <Text className="mt-2 text-xs text-muted-foreground">
          {nextBirdName
            ? t('xpToUnlock', { xp: xpToNext, name: nextBirdName })
            : t('allDiscovered')}
        </Text>
      </View>
    </BlurView>
  );
}
