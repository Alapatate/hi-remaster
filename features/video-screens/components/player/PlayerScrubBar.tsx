import { Text } from '@/components/ui/text';
import { InfoIcon, ListMusicIcon } from 'lucide-react-native';
import * as React from 'react';
import { PanResponder, TouchableOpacity, View } from 'react-native';
import { formatDuration } from '../../lib/format';

const THUMB = 14;

/** Bottom overlay: title, info/playlist actions, and a draggable progress bar. */
export function PlayerScrubBar({
  title,
  subtitle,
  currentTime,
  duration,
  onSeek,
  onInfo,
  onPlaylist,
  hasSession,
}: {
  title: string;
  subtitle: string;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  onInfo: () => void;
  onPlaylist: () => void;
  hasSession: boolean;
}) {
  const [trackWidth, setTrackWidth] = React.useState(0);
  const [dragRatio, setDragRatio] = React.useState<number | null>(null);

  const widthRef = React.useRef(0);
  const durationRef = React.useRef(duration);
  const dragRef = React.useRef<number | null>(null);
  const onSeekRef = React.useRef(onSeek);
  durationRef.current = duration;
  onSeekRef.current = onSeek;

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
      onPanResponderGrant: (e) => setFromX(e.nativeEvent.locationX),
      onPanResponderMove: (e) => setFromX(e.nativeEvent.locationX),
      onPanResponderRelease: commit,
      onPanResponderTerminate: commit,
    })
  ).current;

  const ratio =
    dragRatio != null ? dragRatio : duration > 0 ? currentTime / duration : 0;
  const clamped = Math.min(1, Math.max(0, ratio));
  const displayedTime = dragRatio != null ? dragRatio * duration : currentTime;

  return (
    <View className="px-5 pb-2">
      {/* Title row */}
      <View className="mb-3 flex-row items-end justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-2xl font-bold text-white" numberOfLines={1}>
            {title}
          </Text>
          <Text className="mt-0.5 text-sm text-white/60" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={onInfo}
            activeOpacity={0.7}
            className="h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <InfoIcon size={18} color="white" />
          </TouchableOpacity>
          {hasSession ? (
            <TouchableOpacity
              onPress={onPlaylist}
              activeOpacity={0.7}
              className="h-11 w-11 items-center justify-center rounded-full bg-white/15">
              <ListMusicIcon size={18} color="white" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Draggable track */}
      <View
        className="justify-center py-3"
        {...pan.panHandlers}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          widthRef.current = w;
          setTrackWidth(w);
        }}>
        <View className="h-1.5 w-full rounded-full bg-white/25">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${clamped * 100}%` }}
          />
        </View>
        <View
          className="absolute rounded-full border-2 border-primary bg-white"
          style={{
            width: THUMB,
            height: THUMB,
            left: Math.max(0, clamped * trackWidth - THUMB / 2),
          }}
        />
      </View>

      {/* Times */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-white/70">{formatDuration(displayedTime)}</Text>
        <Text className="text-xs text-white/70">{formatDuration(duration)}</Text>
      </View>
    </View>
  );
}
