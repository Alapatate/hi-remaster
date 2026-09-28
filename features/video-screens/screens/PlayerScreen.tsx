import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/errors';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEvent, useEventListener } from 'expo';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LogOutIcon } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, View } from 'react-native';
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
import { fetchVideo, teacherFullName, teacherLanguage } from '../lib/data';
import { totalDuration } from '../lib/format';
import { buildVideoSource, resolvePlayableVideo, type PlayableVideo } from '../lib/hls';
import { exerciseDescriptionKey } from '../lib/tools';
import type { Video } from '../lib/types';

const AUTO_HIDE_MS = 3500;

export function PlayerScreen() {
  const {
    id,
    session,
    t: resumeParam,
  } = useLocalSearchParams<{
    id: string;
    session?: string;
    /** Seconds to resume `id` from, set by the continue-watching card. */
    t?: string;
  }>();
  const [video, setVideo] = React.useState<Video | null>(null);
  const [sessionVideos, setSessionVideos] = React.useState<Video[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [focused, setFocused] = React.useState(true);
  const { user, updatePrefs } = useAuth();
  const { t } = useTranslation();
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
      .catch((e: unknown) => setError(errorMessage(e, 'errorVideos')))
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
        <CenteredMessage message={t('noVideoUrl')} />
      ) : focused ? (
        <PlayerView
          video={video}
          sessionVideos={sessionVideos}
          sessionParam={sessionParam}
          resumeAt={Number(resumeParam ?? 0) || 0}
          onProgress={(progress, total, teacherName, seconds) =>
            updatePrefs({
              lastVideoId: video.$id,
              lastSessionParam: sessionParam,
              lastSessionTeacher: teacherName,
              lastSessionProgress: progress,
              lastSessionTotal: total,
              // Exact position, so resuming returns to the second it stopped on
              // rather than the start of the video.
              lastSessionSeconds: Math.floor(seconds),
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
  resumeAt = 0,
  onProgress,
  onXpEarned,
}: {
  video: Video;
  sessionVideos: Video[];
  sessionParam: string;
  /** Seconds to jump to once the source is ready (resuming a session). */
  resumeAt?: number;
  onProgress: (progress: number, total: number, teacherName: string, seconds: number) => void;
  onXpEarned?: (minutes: number) => void;
}) {
  // Follow redirects / normalise the URI on iOS before AVPlayer touches it.
  const [playable, setPlayable] = React.useState<PlayableVideo | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    setPlayable(null);
    resolvePlayableVideo(video.url!).then((resolved) => {
      if (!cancelled) setPlayable(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [video.url]);

  if (!playable) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#bf6e1a" />
      </View>
    );
  }

  return (
    <ActivePlayer
      video={video}
      sessionVideos={sessionVideos}
      sessionParam={sessionParam}
      resumeAt={resumeAt}
      onProgress={onProgress}
      onXpEarned={onXpEarned}
      playable={playable}
    />
  );
}

function ActivePlayer({
  video,
  sessionVideos,
  sessionParam,
  resumeAt = 0,
  onProgress,
  onXpEarned,
  playable,
}: {
  video: Video;
  sessionVideos: Video[];
  sessionParam: string;
  resumeAt?: number;
  onProgress: (progress: number, total: number, teacherName: string, seconds: number) => void;
  onXpEarned?: (minutes: number) => void;
  playable: PlayableVideo;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const title = video.title;
  const url = playable.uri;
  const variants = playable.variants;
  const [activeQuality, setActiveQuality] = React.useState<string | null>(null);
  const [viewKey, setViewKey] = React.useState(0);
  // Reuses the seek-on-ready path already used by quality switches.
  const pendingSeek = React.useRef<number | null>(resumeAt > 0 ? resumeAt : null);

  const [leaveVisible, setLeaveVisible] = React.useState(false);

  const leaveSession = React.useCallback(() => {
    setLeaveVisible(false);
    router.replace({
      pathname: '/(protected)/videos',
      params: { resetAt: String(Date.now()) },
    });
  }, []);

  // Hardware back gets the same confirmation as the close button. Registered
  // only while focused so it does not outlive the screen.
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== 'android') return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        setLeaveVisible(true);
        return true; // handled — never pop straight out of a running session
      });
      return () => sub.remove();
    }, [])
  );

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
  const prevVideo = hasSession && currentIndex > 0 ? sessionVideos[currentIndex - 1] : null;

  const sessionTotal = hasSession ? totalDuration(sessionVideos) : (video.duration ?? 0);

  const player = useVideoPlayer(buildVideoSource(url, title, playable.contentType), (p) => {
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

  // The last exercise playing to its end closes the session on the wrap-up
  // screen. Earlier exercises keep waiting on the up-next card.
  useEventListener(player, 'playToEnd', () => {
    if (!nextVideo) router.replace('/session-complete' as never);
  });

  // Adaptive HLS can swap rendition mid-playback. A pure resolution change needs
  // nothing, but if the *aspect ratio* changes the Android surface can keep the
  // old one and render the frame distorted. Remount only in that case, so the
  // common resolution swap stays flicker-free.
  useEventListener(player, 'videoTrackChange', ({ videoTrack, oldVideoTrack }) => {
    const next = videoTrack?.size;
    const prev = oldVideoTrack?.size;
    if (!next?.width || !next.height || !prev?.width || !prev.height) return;
    const changed = Math.abs(next.width / next.height - prev.width / prev.height) > 0.01;
    if (changed) setViewKey((k) => k + 1);
  });

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

  /** Seconds of session that precede the current exercise. */
  const elapsedBeforeCurrent = React.useMemo(
    () => sessionVideos.slice(0, currentIndex).reduce((sum, v) => sum + (v.duration ?? 0), 0),
    [sessionVideos, currentIndex]
  );

  // Persist progress for the "continue watching" card (throttled).
  const lastWrite = React.useRef(0);
  React.useEffect(() => {
    if (duration <= 0 || sessionTotal <= 0) return;
    const now = Date.now();
    if (now - lastWrite.current < 5000) return;
    lastWrite.current = now;
    // Progress across the whole session, not just the current exercise: the
    // exercises already played count toward it.
    const elapsed = elapsedBeforeCurrent + currentTime;
    const progress = Math.min(100, Math.round((elapsed / sessionTotal) * 100));
    onProgress(progress, sessionTotal, teacherFullName(video.teacher), currentTime);
  }, [currentTime, duration, sessionTotal, elapsedBeforeCurrent, onProgress, video.teacher]);

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
      player.replace(buildVideoSource(newUrl, title, playable.contentType));
      setActiveQuality(label);
      setViewKey((k) => k + 1);
    },
    [activeQuality, player, title, url, variants, playable.contentType]
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
        contentFit="cover"
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
            onBack={() => setLeaveVisible(true)}
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
              onPrev={() => prevVideo && goToVideo(prevVideo.$id)}
              onNext={() => nextVideo && goToVideo(nextVideo.$id)}
              hasPrev={!!prevVideo}
              hasNext={!!nextVideo}
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
          <Text className="text-center text-white">{t('playbackError')}</Text>
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
        description={t(exerciseDescriptionKey(video))}
      />

      <ConfirmDialog
        visible={leaveVisible}
        icon={<LogOutIcon size={26} color="#bf6e1a" />}
        title={t('leaveSessionTitle')}
        message={t('leaveSessionMessage')}
        confirmLabel={t('leaveSessionConfirm')}
        cancelLabel={t('leaveSessionCancel')}
        onConfirm={leaveSession}
        onCancel={() => setLeaveVisible(false)}
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
