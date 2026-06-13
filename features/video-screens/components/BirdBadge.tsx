import { Text } from '@/components/ui/text';
import { BirdIcon } from 'lucide-react-native';
import { View } from 'react-native';

/**
 * Progression badge (gamification). Static for now — the bird name is
 * hard-coded until the level system is wired to user progress.
 */
export function BirdBadge({ name = 'Rouge-gorge' }: { name?: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-card px-3 py-2">
      <BirdIcon size={16} color="#bf6e1a" />
      <Text className="text-sm font-semibold text-foreground">{name}</Text>
    </View>
  );
}
