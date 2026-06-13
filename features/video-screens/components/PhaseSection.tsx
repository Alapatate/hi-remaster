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

  const selectedCount = videos.reduce(
    (count, video) => count + (selectedIds.has(video.$id) ? 1 : 0),
    0
  );

  return (
    <View className="mb-7">
      <View
        className="mb-4 flex-row items-center gap-3 rounded-2xl px-3 py-2.5"
        style={{ backgroundColor: phase.tint }}>
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-background">
          <Text style={{ fontSize: 20 }}>{phase.emoji}</Text>
        </View>

        <View className="flex-1">
          <Text
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: phase.color }}>
            {t(phase.titleKey)}
          </Text>
          <Text className="text-xs text-muted-foreground">{t(phase.subtitleKey)}</Text>
        </View>

        <View
          className="items-center justify-center rounded-full px-2.5 py-1"
          style={{ backgroundColor: phase.color, minWidth: 36 }}>
          <Text className="text-xs font-bold" style={{ color: '#fff' }}>
            {selectedCount > 0 ? `${selectedCount}/${videos.length}` : videos.length}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP }}>
        {videos.map((video, index) => (
          <ExerciseCard
            key={video.$id}
            video={video}
            index={index}
            selected={selectedIds.has(video.$id)}
            onToggle={() => onToggle(video)}
          />
        ))}
      </View>
    </View>
  );
}
