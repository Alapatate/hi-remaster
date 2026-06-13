import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDuration } from '../lib/format';
import { groupByPhase, PHASE_ORDER, PHASES } from '../lib/phases';
import type { Video } from '../lib/types';

/** Card listing the selected exercises, grouped by phase and numbered per phase. */
export function SummaryExerciseList({ videos }: { videos: Video[] }) {
  const { t } = useTranslation();
  const grouped = groupByPhase(videos);

  return (
    <View className="rounded-2xl bg-card p-5">
      {PHASE_ORDER.map((type) => {
        const items = grouped[type];
        if (items.length === 0) return null;
        const phase = PHASES[type];

        return (
          <View key={type} className="mb-3 last:mb-0">
            <View className="mb-1 flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: phase.color }} />
              <Text
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: phase.color }}>
                {t(phase.titleKey)}
              </Text>
              <View className="h-px flex-1 bg-border" />
            </View>

            {items.map((video, index) => (
              <View key={video.$id} className="flex-row items-center py-2.5">
                <Text className="w-7 text-base font-bold" style={{ color: phase.color }}>
                  {index + 1}
                </Text>
                <Text className="flex-1 text-base text-foreground" numberOfLines={1}>
                  {video.title}
                </Text>
                <Text className="text-base text-muted-foreground">
                  {formatDuration(video.duration ?? 0)}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}
