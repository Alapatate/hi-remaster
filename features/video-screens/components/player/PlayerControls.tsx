import { Text } from '@/components/ui/text';
import {
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  SkipForwardIcon,
} from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

const SEEK_SECONDS = 15;

/** Center transport controls: ±15s, play/pause, skip to next. */
export function PlayerControls({
  playing,
  onPlayPause,
  onSeekBack,
  onSeekForward,
  onNext,
  hasNext,
}: {
  playing: boolean;
  onPlayPause: () => void;
  onSeekBack: () => void;
  onSeekForward: () => void;
  onNext: () => void;
  hasNext: boolean;
}) {
  return (
    <View className="w-full items-center justify-center">
      <View className="flex-row items-center justify-center gap-6">
        <SeekButton direction="back" onPress={onSeekBack} />

        <TouchableOpacity
          onPress={onPlayPause}
          activeOpacity={0.85}
          className="h-20 w-20 items-center justify-center rounded-full bg-primary"
          style={{
            shadowColor: '#bf6e1a',
            shadowOpacity: 0.6,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 0 },
            elevation: 10,
          }}>
          {playing ? (
            <PauseIcon size={32} color="white" fill="white" />
          ) : (
            <PlayIcon size={32} color="white" fill="white" style={{ marginLeft: 3 }} />
          )}
        </TouchableOpacity>

        <SeekButton direction="forward" onPress={onSeekForward} />
      </View>

      {hasNext ? (
        <TouchableOpacity
          onPress={onNext}
          activeOpacity={0.7}
          className="absolute right-1 h-14 w-14 items-center justify-center rounded-full bg-white/10">
          <SkipForwardIcon size={22} color="white" fill="white" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function SeekButton({
  direction,
  onPress,
}: {
  direction: 'back' | 'forward';
  onPress: () => void;
}) {
  const Icon = direction === 'back' ? RotateCcwIcon : RotateCwIcon;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="h-14 w-14 items-center justify-center rounded-full bg-white/10">
      <Icon size={28} color="white" />
      <Text className="absolute text-[9px] font-bold text-white" style={{ marginTop: 1 }}>
        {SEEK_SECONDS}
      </Text>
    </TouchableOpacity>
  );
}
