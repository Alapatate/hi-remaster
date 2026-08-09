import { PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from 'lucide-react-native';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { PLAYER } from './playerTheme';

/**
 * Centre transport: previous exercise, play/pause, next exercise. The side
 * controls move between the session's exercises rather than scrubbing within
 * one — scrubbing is what the bar underneath is for.
 */
export function PlayerControls({
  playing,
  loading,
  onPlayPause,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  playing: boolean;
  loading: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  return (
    <View className="w-full flex-row items-center justify-center" style={{ gap: 30 }}>
      <SkipButton direction="prev" onPress={onPrev} enabled={hasPrev} />

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

      <SkipButton direction="next" onPress={onNext} enabled={hasNext} />
    </View>
  );
}

/**
 * Unfilled skip control. Kept mounted but dimmed at the ends of the session so
 * the transport row does not reflow between exercises.
 */
function SkipButton({
  direction,
  onPress,
  enabled,
}: {
  direction: 'prev' | 'next';
  onPress: () => void;
  enabled: boolean;
}) {
  const Icon = direction === 'prev' ? SkipBackIcon : SkipForwardIcon;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!enabled}
      activeOpacity={0.7}
      hitSlop={10}
      className="items-center justify-center"
      style={{ width: 52, height: 52, opacity: enabled ? 1 : 0.3 }}>
      <Icon size={26} color={PLAYER.text} fill={PLAYER.text} />
    </TouchableOpacity>
  );
}
