import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEvent } from 'expo';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AboutTeacherSheet } from '../components/player/AboutTeacherSheet';
import { PlayerControls } from '../components/player/PlayerControls';
import { PlayerScrubBar } from '../components/player/PlayerScrubBar';
import { PlayerTopBar } from '../components/player/PlayerTopBar';
import { QualitySheet, type QualityOption } from '../components/player/QualitySheet';
import { SessionPlaylistSheet } from '../components/player/SessionPlaylistSheet';
import { useHlsVariants } from '../hooks/useHlsVariants';
import { fetchVideo, teacherFullName } from '../lib/data';
import { totalDuration } from '../lib/format';
import type { Video } from '../lib/types';

const SEEK = 15;

export function PlayerScreen() {
  const { id, session } = useLocalSearchParams<{ id: string; session?: string }>();
  const [video, setVideo] = React.useState<Video | null>(null);
  const [sessionVideos, setSessionVideos] = React.useState<Video[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [focused, setFocused] = React.useState(true);
  const { updatePrefs } = useAuth();

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
      ) : (
        focused && (
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
          />
        )
      )}
    </View>
  );
}

function PlayerView({
  video,
  sessionVideos,
  sessionParam,
  onProgress,
}: {
  video: Video;
  sessionVideos: Video[];
  sessionParam: string;
  onProgress: (progress: number, total: number, teacherName: string) => void;
}) {
  const { t } = useTranslation();
  const url = video.url!;
  const title = video.title;

  const variants = useHlsVariants(url);
  const [activeQuality, setActiveQuality] = React.useState<string | null>(null);
  const [qualityOpen, setQualityOpen] = React.useState(false);
  const [viewKey, setViewKey] = React.useState(0);
  const pendingSeek = React.useRef<number | null>(null);

  const playlistRef = React.useRef<BottomSheetModal>(null);
  const aboutRef = React.useRef<BottomSheetModal>(null);

  const hasSession = sessionVideos.length > 1;
  const currentIndex = Math.max(
    0,
    sessionVideos.findIndex((v) => v.$id === video.$id)
  );
  const nextVideo =
    hasSession && currentIndex < sessionVideos.length - 1
      ? sessionVideos[currentIndex + 1]
      : null;

  const sessionTotal = hasSession ? totalDuration(sessionVideos) : video.duration ?? 0;

  const player = useVideoPlayer({ uri: url, metadata: { title } }, (p) => {
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

  const { status, error } = useEvent(player, 'statusChange', { status: player.status });
  const duration = player.duration ?? 0;

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

  const switchQuality = React.useCallback(
    (label: string | null) => {
      setQualityOpen(false);
      if (label === activeQuality) return;
      pendingSeek.current = player.currentTime;
      const newUrl = label ? variants.find((v) => v.label === label)?.url ?? url : url;
      player.replace({ uri: newUrl, metadata: { title } });
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
    () => [{ label: t('auto', 'Auto'), value: null }, ...variants.map((v) => ({ label: v.label, value: v.label }))],
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

      {/* Loading / error overlays */}
      {status === 'loading' ? (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : null}
      {status === 'error' ? (
        <View className="absolute inset-0 items-center justify-center px-6">
          <Text className="text-center text-white">{error?.message ?? t('playbackError')}</Text>
        </View>
      ) : null}

      {/* Controls overlay */}
      <View className="absolute inset-0 justify-between pb-6 pt-12">
        <PlayerTopBar
          onBack={() => router.back()}
          index={currentIndex}
          total={sessionVideos.length}
          hasSession={hasSession}
          onPlaylist={() => playlistRef.current?.present()}
          qualityLabel={activeQuality ?? t('auto', 'Auto')}
          onQuality={() => setQualityOpen(true)}
          hasVariants={variants.length > 1}
        />

        <View className="px-6">
          <PlayerControls
            playing={isPlaying}
            onPlayPause={() => (isPlaying ? player.pause() : player.play())}
            onSeekBack={() => (player.currentTime = Math.max(0, player.currentTime - SEEK))}
            onSeekForward={() => (player.currentTime = player.currentTime + SEEK)}
            onNext={() => nextVideo && goToVideo(nextVideo.$id)}
            hasNext={!!nextVideo}
          />
        </View>

        <PlayerScrubBar
          title={title}
          subtitle={`${teacherFullName(video.teacher)}${
            duration > 0 ? `  ·  ${formatClock(duration)}` : ''
          }`}
          currentTime={currentTime}
          duration={duration}
          onSeek={(s) => (player.currentTime = s)}
          onInfo={() => aboutRef.current?.present()}
          onPlaylist={() => playlistRef.current?.present()}
          hasSession={hasSession}
        />
      </View>

      <QualitySheet
        visible={qualityOpen}
        options={qualityOptions}
        active={activeQuality}
        onSelect={switchQuality}
        onClose={() => setQualityOpen(false)}
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

function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function CenteredMessage({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-white/80">{message}</Text>
    </View>
  );
}
