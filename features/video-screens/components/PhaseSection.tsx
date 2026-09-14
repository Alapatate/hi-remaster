import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GRID_GAP } from '../lib/layout';
import { PHASES, phasePalette } from '../lib/phases';
import type { Video } from '../lib/types';
import { ExerciseCard } from './ExerciseCard';

/**
 * A phase group: a quiet dot-and-rule header over its grid of exercises. The
 * cards carry the emphasis, so the heading stays out of their way.
 */
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
  const { colorScheme } = useColorScheme();
  const phase = PHASES[type];
  const { color } = phasePalette(type, colorScheme === 'dark');
  if (videos.length === 0) return null;

  return (
    <View className="mb-5">
      <View className="mb-2.5 flex-row items-center gap-2">
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
        <Text
          className="font-body-bold uppercase tracking-widest text-muted-foreground"
          style={{ fontSize: 11 }}>
          {t(phase.titleKey)}
        </Text>
        <View className="h-px flex-1 bg-border" />
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
