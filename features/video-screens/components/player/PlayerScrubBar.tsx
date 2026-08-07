import { Text } from '@/components/ui/text';
import * as React from 'react';
import { PanResponder, View } from 'react-native';
import { formatDuration } from '../../lib/format';
import { PLAYER } from './playerTheme';

const THUMB = 15;
const TRACK_HEIGHT = 5;
const TRACK_PAD_V = 14; // vertical touch padding around the thin track

/** Draggable progress track with buffered fill, plus elapsed / remaining times. */
export function PlayerScrubBar({
  currentTime,
  duration,
  buffered,
  onSeek,
  onScrubStart,
}: {
  currentTime: number;
  duration: number;
  /** Seconds buffered ahead, drawn behind the played portion. */
  buffered?: number;
  onSeek: (seconds: number) => void;
  onScrubStart?: () => void;
}) {
  const [trackWidth, setTrackWidth] = React.useState(0);
  const [dragRatio, setDragRatio] = React.useState<number | null>(null);

  const widthRef = React.useRef(0);
  const durationRef = React.useRef(duration);
  const dragRef = React.useRef<number | null>(null);
  const onSeekRef = React.useRef(onSeek);
  const onScrubStartRef = React.useRef(onScrubStart);
  durationRef.current = duration;
  onSeekRef.current = onSeek;
  onScrubStartRef.current = onScrubStart;

  const setFromX = React.useCallback((x: number) => {
    const w = widthRef.current;
    if (!w) return;
    const r = Math.min(1, Math.max(0, x / w));
    dragRef.current = r;
    setDragRatio(r);
  }, []);

  const commit = React.useCallback(() => {
    const r = dragRef.current;
    if (r != null && durationRef.current > 0) {
      onSeekRef.current(r * durationRef.current);
    }
    dragRef.current = null;
    setDragRatio(null);
  }, []);

  const pan = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        onScrubStartRef.current?.();
        setFromX(e.nativeEvent.locationX);
      },
      onPanResponderMove: (e) => setFromX(e.nativeEvent.locationX),
      onPanResponderRelease: commit,
      onPanResponderTerminate: commit,
    })
  ).current;

  const ratio = dragRatio != null ? dragRatio : duration > 0 ? currentTime / duration : 0;
  const clamped = Math.min(1, Math.max(0, ratio));
  const displayedTime = dragRatio != null ? dragRatio * duration : currentTime;
  const bufferedRatio =
    duration > 0 && buffered ? Math.min(1, Math.max(clamped, buffered / duration)) : 0;
  const remaining = Math.max(0, duration - displayedTime);

  return (
    <View className="px-6 pt-4">
      <View
        {...pan.panHandlers}
        style={{ paddingVertical: TRACK_PAD_V, justifyContent: 'center' }}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          widthRef.current = w;
          setTrackWidth(w);
        }}>
        <View
          className="w-full overflow-hidden rounded-full"
          style={{ height: TRACK_HEIGHT, backgroundColor: PLAYER.track }}>
          <View
            className="absolute h-full rounded-full"
            style={{ width: `${bufferedRatio * 100}%`, backgroundColor: PLAYER.trackBuffered }}
          />
          <View
            className="absolute h-full rounded-full"
            style={{ width: `${clamped * 100}%`, backgroundColor: PLAYER.accentTrack }}
          />
        </View>
        <View
          className="absolute rounded-full"
          style={{
            width: THUMB,
            height: THUMB,
            backgroundColor: PLAYER.text,
            top: '50%',
            marginTop: -THUMB / 2,
            left: Math.max(0, Math.min(trackWidth - THUMB, clamped * trackWidth - THUMB / 2)),
          }}
        />
      </View>

      <View className="mt-1 flex-row items-center justify-between">
        <Text className="font-body-semibold" style={{ color: PLAYER.textMuted, fontSize: 13 }}>
          {formatDuration(displayedTime)}
        </Text>
        <Text className="font-body-semibold" style={{ color: PLAYER.textMuted, fontSize: 13 }}>
          -{formatDuration(remaining)}
        </Text>
      </View>
    </View>
  );
}
