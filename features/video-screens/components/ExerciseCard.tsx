import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { CheckIcon, ClockIcon } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { formatDuration } from '../lib/format';
import { CARD_WIDTH } from '../lib/layout';
import { PHASES } from '../lib/phases';
import type { Video } from '../lib/types';

/** Selectable exercise tile shown in the 2-column builder grid. */
export function ExerciseCard({
  video,
  selected,
  onToggle,
}: {
  video: Video;
  selected: boolean;
  onToggle: () => void;
}) {
  const phaseColor = PHASES[video.type]?.color ?? '#7a5b3a';

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onToggle} style={{ width: CARD_WIDTH }}>
      <View
        className={cn('rounded-2xl bg-card p-4', selected && 'border-2 border-primary')}
        style={{ elevation: 1 }}>
        <View className="mb-3 flex-row items-center justify-between">
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: phaseColor }} />
          {selected ? (
            <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
              <CheckIcon size={14} color="white" />
            </View>
          ) : null}
        </View>

        <Text className="text-base font-bold leading-5 text-foreground" numberOfLines={2}>
          {video.title}
        </Text>

        <View className="mt-3 flex-row items-center gap-1.5">
          <ClockIcon size={14} color="#9b8a72" />
          <Text className="text-sm text-muted-foreground">
            {formatDuration(video.duration ?? 0)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
