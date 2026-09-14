import { Text } from '@/components/ui/text';
import { CheckIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { formatDuration } from '../lib/format';
import { CARD_WIDTH } from '../lib/layout';
import { phasePalette } from '../lib/phases';
import type { Video } from '../lib/types';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Selectable exercise tile in the 2-column builder grid. Quiet by default and
 * tinted with a check badge once chosen, so the selection reads at a glance.
 * Colours come from the phase rather than a single accent, keeping the app's
 * existing phase palette.
 */
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { color, tint } = phasePalette(video.type, isDark);

  return (
    <AnimatedTouchable
      entering={FadeInDown.duration(260).delay(index * 45)}
      activeOpacity={0.85}
      onPress={onToggle}
      style={{ width: CARD_WIDTH }}>
      <View
        // Unselected takes its 1px border from the theme token via className;
        // selected sets a 2px phase-coloured border inline.
        className={selected ? undefined : 'border border-border bg-card'}
        style={
          selected
            ? {
                borderRadius: 20,
                paddingVertical: 12,
                paddingHorizontal: 13,
                borderWidth: 2,
                borderColor: color,
                backgroundColor: tint,
              }
            : { borderRadius: 20, paddingVertical: 12, paddingHorizontal: 13 }
        }>
        <Text
          className={selected ? 'font-body-semibold' : 'font-body-medium'}
          numberOfLines={2}
          style={{ fontSize: 14, lineHeight: 17.5, paddingRight: selected ? 22 : 0 }}>
          {video.title}
        </Text>

        <Text
          className={selected ? 'font-heading' : 'font-heading text-muted-foreground'}
          style={{ fontSize: 15, marginTop: 5, color: selected ? color : undefined }}>
          {formatDuration(video.duration ?? 0)}
        </Text>

        {selected ? (
          <View
            className="absolute items-center justify-center"
            style={{
              top: 11,
              right: 11,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: color,
            }}>
            <CheckIcon size={12} color={isDark ? tint : '#fff'} strokeWidth={3} />
          </View>
        ) : null}
      </View>
    </AnimatedTouchable>
  );
}
