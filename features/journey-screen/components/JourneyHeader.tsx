import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';

/** Top card: current XP, an animated bar toward the next waypoint, and a tally. */
export function JourneyHeader({
  xp,
  unlockedCount,
  total,
  progressToNext,
  xpToNext,
  nextBirdNameKey,
  accent,
}: {
  xp: number;
  unlockedCount: number;
  total: number;
  progressToNext: number;
  xpToNext: number;
  /** i18n key of the next bird to unlock, or null once every bird is found. */
  nextBirdNameKey: string | null;
  accent: string;
}) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fill = useSharedValue(0);

  // Short follow so the bar tracks the reveal's animated XP closely (and softens
  // the snap back to empty each time a waypoint threshold is crossed).
  React.useEffect(() => {
    fill.value = withTiming(progressToNext, { duration: 250, easing: Easing.out(Easing.cubic) });
  }, [progressToNext, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(4, fill.value * 100)}%`,
  }));

  const cardBg = isDark ? 'rgba(36, 30, 24, 0.78)' : 'rgba(250, 243, 228, 0.82)';

  return (
    <View className="px-5 pb-3 pt-10">
      <View
        className="rounded-3xl px-4 pb-3.5 pt-3.5"
        style={{
          backgroundColor: cardBg,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(191, 166, 120, 0.28)',
          shadowColor: isDark ? '#000' : '#8a6a3a',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.35 : 0.12,
          shadowRadius: 14,
        }}>
        <Text className="mb-1 font-heading text-[15px] leading-5 text-foreground/70">
          {t('journeyTitle')}
        </Text>

        <View className="mb-3 flex-row items-end gap-3">
          <View className="flex-1 flex-row items-baseline gap-1.5">
            <Text className="font-heading text-[34px] leading-9 text-foreground">{xp}</Text>
            <Text className="font-heading text-base text-muted-foreground">XP</Text>
          </View>

          <Text className="mb-1 font-heading text-sm text-muted-foreground">
            {unlockedCount}/{total}
          </Text>
        </View>

        <View
          className="h-2 overflow-hidden rounded-full"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(191, 166, 120, 0.22)',
          }}>
          <Animated.View
            style={[
              {
                height: '100%',
                borderRadius: 999,
                backgroundColor: accent,
              },
              fillStyle,
            ]}
          />
        </View>

        <Text className="mt-2.5 font-heading text-[13px] leading-4 text-muted-foreground">
          {nextBirdNameKey
            ? t('xpToUnlock', { xp: xpToNext, name: t(nextBirdNameKey) })
            : t('allDiscovered')}
        </Text>
      </View>
    </View>
  );
}
