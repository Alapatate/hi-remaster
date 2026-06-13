import { Text } from '@/components/ui/text';
import {
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  SkipForwardIcon,
} from 'lucide-react-native';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

const SEEK_SECONDS = 15;

/**
 * Center transport row: -15s, play/pause, +15s, and (when in a session) skip
 * to next. All controls sit on a single evenly-spaced row, matching the mockup.
 */
export function PlayerControls({
  playing,
  loading,
  onPlayPause,
  onSeekBack,
  onSeekForward,
  onNext,
  hasNext,
}: {
  playing: boolean;
  loading: boolean;
  onPlayPause: () => void;
  onSeekBack: () => void;
  onSeekForward: () => void;
  onNext: () => void;
  hasNext: boolean;
}) {
  return (
    <View
      className="w-full flex-row items-center px-6"
      style={{ justifyContent: hasNext ? 'space-between' : 'center', gap: hasNext ? 0 : 28 }}>
      <SeekButton direction="back" onPress={onSeekBack} />

      <TouchableOpacity
        onPress={onPlayPause}
        activeOpacity={0.85}
        disabled={loading}
        className="h-[76px] w-[76px] items-center justify-center rounded-full bg-primary"
        style={{
          shadowColor: '#bf6e1a',
          shadowOpacity: 0.65,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 0 },
          elevation: 12,
        }}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : playing ? (
          <PauseIcon size={30} color="white" fill="white" />
        ) : (
          <PlayIcon size={30} color="white" fill="white" style={{ marginLeft: 3 }} />
        )}
      </TouchableOpacity>

      <SeekButton direction="forward" onPress={onSeekForward} />

      {hasNext ? (
        <TouchableOpacity
          onPress={onNext}
          activeOpacity={0.7}
          className="h-14 w-14 items-center justify-center rounded-full bg-white/10">
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
      <Icon size={26} color="white" />
      <Text className="absolute text-[10px] font-bold text-white" style={{ marginTop: 2 }}>
        {SEEK_SECONDS}
      </Text>
    </TouchableOpacity>
  );
}
