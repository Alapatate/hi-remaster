import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ClockIcon } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { formatDuration } from '../lib/format';
import { shadeColor } from '../lib/colors';
import { CARD_WIDTH } from '../lib/layout';
import { PHASES } from '../lib/phases';
import type { Video } from '../lib/types';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/** Selectable exercise tile shown in the 2-column builder grid. */
export function ExerciseCard({
  video,
  selected,
  onToggle,
  index = 0,
}: {
  video: Video;
  selected: boolean;
  onToggle: () => void;
  index?: number;
}) {
  const phase = PHASES[video.type];
  const color = phase?.color ?? '#7a5b3a';
  const tint = phase?.tint ?? '#f3e9d2';

  return (
    <AnimatedTouchable
      entering={FadeInDown.duration(280).delay(index * 55)}
      activeOpacity={0.85}
      onPress={onToggle}
      style={{ width: CARD_WIDTH }}>
      <View
        className={cn('overflow-hidden rounded-2xl', !selected && 'bg-card')}
        style={{
          borderWidth: 2,
          borderColor: selected ? color : shadeColor(tint, -12),
          backgroundColor: selected ? shadeColor(tint, +7) : tint,
        }}>
        <View className="p-4">
          <View className="mb-3 flex-row justify-between">
            <Text className="text-base font-bold leading-5 text-foreground" numberOfLines={2}>
              {video.title}
            </Text>
          </View>

          <View
            className="mt-1 flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1"
            style={{ backgroundColor: selected ? '#ffffffaa' : tint }}>
            <ClockIcon size={13} color={color} />
            <Text className="text-xs font-semibold" style={{ color }}>
              {formatDuration(video.duration ?? 0)}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedTouchable>
  );
}
