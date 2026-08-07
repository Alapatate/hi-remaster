import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEvent, useEventListener } from 'expo';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AboutTeacherSheet } from '../components/player/AboutTeacherSheet';
import { PlayerControls } from '../components/player/PlayerControls';
import { PlayerScrim } from '../components/player/PlayerScrim';
import { PlayerScrubBar } from '../components/player/PlayerScrubBar';
import { PlayerTitleBlock } from '../components/player/PlayerTitleBlock';
import { PlayerTopBar } from '../components/player/PlayerTopBar';
import { QualitySheet, type QualityOption } from '../components/player/QualitySheet';
import { SessionPlaylistSheet } from '../components/player/SessionPlaylistSheet';
import { UpNextCard } from '../components/player/UpNextCard';
import { useHlsVariants } from '../hooks/useHlsVariants';
import { fetchVideo, teacherFullName, teacherLanguage } from '../lib/data';
import { totalDuration } from '../lib/format';
import type { Video } from '../lib/types';

const SEEK = 15;
const AUTO_HIDE_MS = 3500;

function buildVideoSource(uri: string, title: string) {
  return {
    uri,
    ...(uri.includes('.m3u8') ? { contentType: 'hls' as const } : {}),
    metadata: { title },
  };
}

export function PlayerScreen() {
  const { id, session } = useLocalSearchParams<{ id: string; session?: string }>();
  const [video, setVideo] = React.useState<Video | null>(null);
  const [sessionVideos, setSessionVideos] = React.useState<Video[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [focused, setFocused] = React.useState(true);
  const { user, updatePrefs } = useAuth();
  // Keep a ref so the XP callback always reads the latest user without being
  // recreated on every prefs update (which would restart the accumulator effect).
  const userRef = React.useRef(user);
  React.useEffect(() => {
    userRef.current = user;
  }, [user]);

  const handleXpEarned = React.useCallback(
    (minutes: number) => {
      const currentXp = Number((userRef.current?.prefs as Record<string, unknown>)?.xpPoints ?? 0);
      updatePrefs({ xpPoints: currentXp + minutes }).catch(() => {});
    },
    [updatePrefs]
  );

  const sessionParam = session ?? '';

  useFocusEffect(
    React.useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  React.useEffect(() => {
    setLoading(true);
    fetchVideo(id)
      .then((doc) => setVideo(doc))
      .catch((e: any) => setError(e?.message ?? 'Failed to load video.'))
      .finally(() => setLoading(false));
  }, [id]);

  React.useEffect(() => {
    if (!session) {
      setSessionVideos([]);
      return;
    }
    const ids = session.split(',').filter(Boolean);
    if (ids.length <= 1) {
      setSessionVideos([]);
      return;
    }
    Promise.all(ids.map((vid) => fetchVideo(vid).catch(() => null))).then((docs) =>
      setSessionVideos(docs.filter((d): d is Video => d !== null))
    );
  }, [session]);

  return (
    <View className="flex-1 bg-black">
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#bf6e1a" />
        </View>
      ) : error ? (
        <CenteredMessage message={error} />
      ) : !video?.url ? (
        <CenteredMessage message="No video URL available for this entry." />
      ) : focused ? (
        <PlayerView
          video={video}
          sessionVideos={sessionVideos}
          sessionParam={sessionParam}
          onProgress={(progress, total, teacherName) =>
            updatePrefs({
              lastVideoId: video.$id,
              lastSessionParam: sessionParam,
              lastSessionTeacher: teacherName,
              lastSessionProgress: progress,
              lastSessionTotal: total,
            }).catch(() => {})
          }
          onXpEarned={handleXpEarned}
        />
      ) : null}
    </View>
  );
}

function PlayerView({
  video,
  sessionVideos,
  sessionParam,
  onProgress,
  onXpEarned,
}: {
  video: Video;
  sessionVideos: Video[];
  sessionParam: string;
  onProgress: (progress: number, total: number, teacherName: string) => void;
  onXpEarned?: (minutes: number) => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const url = video.url!;
  const title = video.title;

  const variants = useHlsVariants(url);
  const [activeQuality, setActiveQuality] = React.useState<string | null>(null);
  const [viewKey, setViewKey] = React.useState(0);
  const pendingSeek = React.useRef<number | null>(null);

  const playlistRef = React.useRef<BottomSheetModal>(null);
  const aboutRef = React.useRef<BottomSheetModal>(null);
  const qualityRef = React.useRef<BottomSheetModal>(null);

  const hasSession = sessionVideos.length > 1;
  const currentIndex = Math.max(
    0,
    sessionVideos.findIndex((v) => v.$id === video.$id)
  );
  const nextVideo =
    hasSession && currentIndex < sessionVideos.length - 1 ? sessionVideos[currentIndex + 1] : null;

  const sessionTotal = hasSession ? totalDuration(sessionVideos) : (video.duration ?? 0);

  const player = useVideoPlayer(buildVideoSource(url, title), (p) => {
    p.timeUpdateEventInterval = 0.5;
    p.play();
  });

  const playingEvent = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const isPlaying = playingEvent?.isPlaying ?? player.playing;

  const timeEvent = useEvent(player, 'timeUpdate', {
    currentTime: player.currentTime,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    bufferedPosition: 0,
  });
  const currentTime = timeEvent?.currentTime ?? 0;

  const statusEvent = useEvent(player, 'statusChange', { status: player.status });
  const status = statusEvent?.status ?? player.status;

  // Adaptive HLS can swap rendition mid-playback. With contentFit="contain" a
  // pure resolution change needs nothing, but if the *aspect ratio* changes the
  // Android surface can keep the old one and render the frame distorted. Remount
  // only in that case, so the common resolution swap stays flicker-free.
  useEventListener(player, 'videoTrackChange', ({ videoTrack, oldVideoTrack }) => {
    const next = videoTrack?.size;
    const prev = oldVideoTrack?.size;
    if (!next?.width || !next.height || !prev?.width || !prev.height) return;
    const changed = Math.abs(next.width / next.height - prev.width / prev.height) > 0.01;
    if (changed) setViewKey((k) => k + 1);
  });

  const statusError = (statusEvent as { error?: { message?: string } } | undefined)?.error;
  const duration = player.duration ?? 0;
  const isBuffering = status === 'loading';

  // ── Controls visibility (tap to toggle, auto-hide while playing) ──
  const overlay = useSharedValue(1);
  const [interactive, setInteractive] = React.useState(true);
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = React.useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const hideControls = React.useCallback(() => {
    clearHideTimer();
    overlay.value = withTiming(0, { duration: 250 });
    setInteractive(false);
  }, [overlay, clearHideTimer]);

  const scheduleHide = React.useCallback(() => {
    clearHideTimer();
    hideTimer.current = setTimeout(hideControls, AUTO_HIDE_MS);
  }, [clearHideTimer, hideControls]);

  const showControls = React.useCallback(
    (autoHide = true) => {
      overlay.value = withTiming(1, { duration: 200 });
      setInteractive(true);
      if (autoHide && isPlaying) scheduleHide();
      else clearHideTimer();
    },
    [overlay, isPlaying, scheduleHide, clearHideTimer]
  );

  // Keep controls up while paused; resume auto-hide when playing.
  React.useEffect(() => {
    if (isPlaying) scheduleHide();
    else {
      clearHideTimer();
      overlay.value = withTiming(1, { duration: 200 });
      setInteractive(true);
    }
    return clearHideTimer;
  }, [isPlaying, scheduleHide, clearHideTimer, overlay]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));

  // Re-seek after a quality swap (source replace) lands.
  React.useEffect(() => {
    if (status === 'readyToPlay' && pendingSeek.current != null) {
      player.currentTime = pendingSeek.current;
      pendingSeek.current = null;
    }
  }, [status, player]);

  // Persist progress for the "continue watching" card (throttled).
  const lastWrite = React.useRef(0);
  React.useEffect(() => {
    if (duration <= 0) return;
    const now = Date.now();
    if (now - lastWrite.current < 5000) return;
    lastWrite.current = now;
    const progress = Math.min(100, Math.round((currentTime / duration) * 100));
    onProgress(progress, sessionTotal, teacherFullName(video.teacher));
  }, [currentTime, duration, sessionTotal, onProgress, video.teacher]);

  // XP: +1 per minute of actual playback (not scrubbed time).
  // Compares consecutive timeUpdate deltas while playing; >2 s delta = seek → skip.
  const xpLastTimeRef = React.useRef<number | null>(null);
  const xpWatchedSecsRef = React.useRef(0);
  const xpAwardedMinutesRef = React.useRef(0);
  React.useEffect(() => {
    if (!isPlaying) {
      xpLastTimeRef.current = null;
      return;
    }
    const prev = xpLastTimeRef.current;
    xpLastTimeRef.current = currentTime;
    if (prev === null) return;
    const delta = currentTime - prev;
    // Skip negative deltas and scrubs (a 0.5 s tick can't advance > 2 s normally).
    if (delta <= 0 || delta > 2) return;
    xpWatchedSecsRef.current += delta;
    const minutesEarned = Math.floor(xpWatchedSecsRef.current / 60);
    if (minutesEarned > xpAwardedMinutesRef.current) {
      const toAward = minutesEarned - xpAwardedMinutesRef.current;
      xpAwardedMinutesRef.current = minutesEarned;
      onXpEarned?.(toAward);
    }
  }, [currentTime, isPlaying, onXpEarned]);

  const switchQuality = React.useCallback(
    (label: string | null) => {
      qualityRef.current?.dismiss();
      if (label === activeQuality) return;
      pendingSeek.current = player.currentTime;
      const newUrl = label ? (variants.find((v) => v.label === label)?.url ?? url) : url;
      player.replace(buildVideoSource(newUrl, title));
      setActiveQuality(label);
      setViewKey((k) => k + 1);
    },
    [activeQuality, player, title, url, variants]
  );

  const goToVideo = React.useCallback(
    (targetId: string) => {
      playlistRef.current?.dismiss();
      router.replace(`/video/${targetId}?session=${sessionParam}`);
    },
    [sessionParam]
  );

  const qualityOptions: QualityOption[] = React.useMemo(
    () => [
      { label: t('auto', 'Auto'), value: null },
      ...variants.map((v) => ({ label: v.label, value: v.label })),
    ],
    [variants, t]
  );

  return (
    <View className="flex-1 bg-black">
      <VideoView
        key={viewKey}
        player={player}
        style={{ flex: 1, alignSelf: 'stretch' }}
        nativeControls={false}
        contentFit="contain"
        allowsPictureInPicture
      />

      {/* Tap layer (below overlay) — shows controls when they are hidden */}
      <Pressable
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents={interactive ? 'none' : 'auto'}
        onPress={() => showControls()}
      />

      {/* Controls overlay */}
      <Animated.View
        style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, overlayStyle]}
        pointerEvents={interactive ? 'auto' : 'none'}>
        {/* Tapping empty space hides the controls; the scrim above it is
            purely decorative and lets the press through. */}
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={() => hideControls()}
        />
        <PlayerScrim />

        <View
          pointerEvents="box-none"
          style={{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 10 }}>
          <PlayerTopBar
            onBack={() =>
              router.replace({
                pathname: '/(protected)/videos',
                params: { resetAt: String(Date.now()) },
              })
            }
            index={currentIndex}
            total={sessionVideos.length}
            hasSession={hasSession}
            onPlaylist={() => playlistRef.current?.present()}
            onQuality={() => qualityRef.current?.present()}
            hasVariants={variants.length > 1}
          />

          <View pointerEvents="box-none" className="flex-1 items-center justify-center">
            <PlayerControls
              playing={isPlaying}
              loading={isBuffering}
              onPlayPause={() => {
                if (isPlaying) player.pause();
                else player.play();
                showControls();
              }}
              onSeekBack={() => {
                player.currentTime = Math.max(0, player.currentTime - SEEK);
                showControls();
              }}
              onSeekForward={() => {
                player.currentTime = player.currentTime + SEEK;
                showControls();
              }}
            />
          </View>

          <View pointerEvents="box-none">
            <PlayerTitleBlock
              title={title}
              teacher={teacherFullName(video.teacher)}
              language={teacherLanguage(video.teacher)}
              onInfo={() => aboutRef.current?.present()}
            />

            <PlayerScrubBar
              currentTime={currentTime}
              duration={duration}
              buffered={timeEvent?.bufferedPosition ?? 0}
              onScrubStart={() => showControls(false)}
              onSeek={(s) => {
                player.currentTime = s;
                showControls();
              }}
            />

            {nextVideo ? (
              <UpNextCard video={nextVideo} onPress={() => goToVideo(nextVideo.$id)} />
            ) : null}
          </View>
        </View>
      </Animated.View>

      {/* Playback error (always on top, not tied to controls) */}
      {status === 'error' ? (
        <View pointerEvents="none" className="absolute inset-0 items-center justify-center px-6">
          <Text className="text-center text-white">
            {statusError?.message ?? t('playbackError')}
          </Text>
        </View>
      ) : null}

      <QualitySheet
        ref={qualityRef}
        options={qualityOptions}
        active={activeQuality}
        onSelect={switchQuality}
      />

      {hasSession ? (
        <SessionPlaylistSheet
          ref={playlistRef}
          videos={sessionVideos}
          currentId={video.$id}
          onSelect={goToVideo}
        />
      ) : null}

      <AboutTeacherSheet
        ref={aboutRef}
        title={title}
        teacher={video.teacher}
        duration={video.duration}
      />
    </View>
  );
}

function CenteredMessage({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-white/80">{message}</Text>
    </View>
  );
}
