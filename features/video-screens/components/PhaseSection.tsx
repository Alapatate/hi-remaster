import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GRID_GAP } from '../lib/layout';
import { PHASES } from '../lib/phases';
import type { Video } from '../lib/types';
import { ExerciseCard } from './ExerciseCard';

/** A titled phase group (emoji + name + subtitle) with its grid of exercises. */
export function PhaseSection({
  type,
  videos,
  selectedIds,
  onToggle,
}: {
  type: Video['type'];
  videos: Video[];
  selectedIds: Set<string>;
  onToggle: (video: Video) => void;
}) {
  const { t } = useTranslation();
  const phase = PHASES[type];
  if (videos.length === 0) return null;

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row flex-wrap items-center gap-2">
        <Text style={{ fontSize: 18 }}>{phase.emoji}</Text>
        <Text
          className="text-base font-bold uppercase tracking-wide"
          style={{ color: phase.color }}>
          {t(phase.titleKey)}
        </Text>
        <Text className="text-sm text-muted-foreground">· {t(phase.subtitleKey)}</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP }}>
        {videos.map((video) => (
          <ExerciseCard
            key={video.$id}
            video={video}
            selected={selectedIds.has(video.$id)}
            onToggle={() => onToggle(video)}
          />
        ))}
      </View>
    </View>
  );
}
