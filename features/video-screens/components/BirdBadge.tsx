import { Text } from '@/components/ui/text';
import { useJourney } from '@/features/journey-screen/hooks/useJourney';
import { router } from 'expo-router';
import { BirdIcon } from 'lucide-react-native';
import { Pressable, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

/**
 * Progression badge (gamification). Reflects the user's current spot on the
 * bird journey (the furthest bird reached) and taps through to the journey
 * screen. The bird shown is derived from `xpPoints`, so it stays in sync.
 */
export function BirdBadge({ compact = false }: { compact?: boolean }) {
  const { width } = useWindowDimensions();
  const { waypoints, frontierIndex } = useJourney(width);
  const bird = waypoints[frontierIndex]?.bird;
  const { t } = useTranslation();
  const birdName = bird ? t(bird.nameKey) : '';

  // Compact drops the name and sits in a 44pt circle, so it fits the stepper's
  // single header row without unbalancing the centred wordmark.
  if (compact) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={birdName}
        onPress={() => router.push('/dashboard')}
        className="items-center justify-center rounded-full bg-card active:opacity-70"
        style={{ width: 44, height: 44 }}>
        <BirdIcon size={19} color="#bf6e1a" />
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/dashboard')}
      className="flex-row items-center gap-1.5 rounded-full bg-card px-3 py-2 active:opacity-70">
      <BirdIcon size={16} color="#bf6e1a" />
      <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
        {birdName}
      </Text>
    </Pressable>
  );
}
