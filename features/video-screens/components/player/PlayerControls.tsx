import { Text } from '@/components/ui/text';
import { ChevronsLeftIcon, ChevronsRightIcon, PauseIcon, PlayIcon } from 'lucide-react-native';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { PLAYER } from './playerTheme';

const SEEK_SECONDS = 15;

/**
 * Centre transport: -15s, play/pause, +15s. Skipping to the next exercise lives
 * on the up-next card rather than here, matching the comp.
 */
export function PlayerControls({
  playing,
  loading,
  onPlayPause,
  onSeekBack,
  onSeekForward,
}: {
  playing: boolean;
  loading: boolean;
  onPlayPause: () => void;
  onSeekBack: () => void;
  onSeekForward: () => void;
}) {
  return (
    <View className="w-full flex-row items-center justify-center" style={{ gap: 30 }}>
      <SeekButton direction="back" onPress={onSeekBack} />

      <TouchableOpacity
        onPress={onPlayPause}
        activeOpacity={0.85}
        disabled={loading}
        className="items-center justify-center"
        style={{
          // Explicit rather than arbitrary utility classes: bracket sizes were
          // not being applied here, leaving the button a third of its size.
          width: 84,
          height: 84,
          borderRadius: 42,
          backgroundColor: PLAYER.accent,
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12,
        }}>
        {loading ? (
          <ActivityIndicator color={PLAYER.text} />
        ) : playing ? (
          <PauseIcon size={30} color="#f5ead8" fill="#f5ead8" />
        ) : (
          <PlayIcon size={30} color="#f5ead8" fill="#f5ead8" style={{ marginLeft: 3 }} />
        )}
      </TouchableOpacity>

      <SeekButton direction="forward" onPress={onSeekForward} />
    </View>
  );
}

/** Unfilled seek control: a double chevron with the step size beneath it. */
function SeekButton({
  direction,
  onPress,
}: {
  direction: 'back' | 'forward';
  onPress: () => void;
}) {
  const Icon = direction === 'back' ? ChevronsLeftIcon : ChevronsRightIcon;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={10}
      className="items-center justify-center"
      style={{ width: 52, height: 52 }}>
      <Icon size={26} color={PLAYER.text} />
      <Text className="font-body-bold" style={{ color: PLAYER.text, fontSize: 10 }}>
        {SEEK_SECONDS}
      </Text>
    </TouchableOpacity>
  );
}
