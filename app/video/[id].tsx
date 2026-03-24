import { Text } from '@/components/ui/text';
import { DATABASE_ID, VIDEOS_COLLECTION_ID, databases } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeftIcon,
  CheckIcon,
  InfoIcon,
  ListMusicIcon,
  PlayIcon,
  SettingsIcon,
  SkipForwardIcon,
} from 'lucide-react-native';
import * as React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Query, type Models } from 'react-native-appwrite';

type TeacherDoc = Models.Document & {
  firstname: string;
  lastname: string;
  lang: string;
  presentation?: string;
};

type VideoDoc = Models.Document & {
  title: string;
  url?: string;
  duration?: number;
  teacher?: TeacherDoc;
};

type HLSVariant = {
  bandwidth: number;
  height: number;
  url: string;
  label: string;
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function resolveUrl(base: string, relative: string): string {
  if (relative.startsWith('http://') || relative.startsWith('https://')) return relative;
  return base.substring(0, base.lastIndexOf('/') + 1) + relative;
}

async function parseHLSVariants(masterUrl: string): Promise<HLSVariant[]> {
  try {
    const res = await fetch(masterUrl);
    const text = await res.text();
    if (!text.includes('#EXT-X-STREAM-INF')) return [];

    const lines = text.split('\n').map((l) => l.trim());
    const variants: HLSVariant[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith('#EXT-X-STREAM-INF')) continue;
      const info = lines[i];
      const urlLine = lines[i + 1];
      if (!urlLine || urlLine.startsWith('#')) continue;

      const bwMatch = info.match(/BANDWIDTH=(\d+)/);
      const resMatch = info.match(/RESOLUTION=(\d+)x(\d+)/);
      if (!bwMatch) continue;

      const bandwidth = parseInt(bwMatch[1], 10);
      const height = resMatch ? parseInt(resMatch[2], 10) : 0;
      const url = resolveUrl(masterUrl, urlLine);
      const label = height ? `${height}p` : `${Math.round(bandwidth / 1000)} kbps`;

      variants.push({ bandwidth, height, url, label });
    }

    variants.sort((a, b) => b.bandwidth - a.bandwidth);

    const seen = new Set<string>();
    return variants.filter((v) => {
      if (seen.has(v.label)) return false;
      seen.add(v.label);
      return true;
    });
  } catch {
    return [];
  }
}

function Player({
  video,
  sessionVideos,
  sessionParam,
}: {
  video: VideoDoc;
  sessionVideos: VideoDoc[];
  sessionParam: string;
}) {
  const { t } = useTranslation();
  const url = video.url!;
  const title = video.title;

  const [variants, setVariants] = React.useState<HLSVariant[]>([]);
  const [activeQuality, setActiveQuality] = React.useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = React.useState(false);
  const pendingSeek = React.useRef<number | null>(null);
  const [viewKey, setViewKey] = React.useState(0);
  const infoSheetRef = React.useRef<BottomSheetModal>(null);
  const playlistSheetRef = React.useRef<BottomSheetModal>(null);

  const hasSession = sessionVideos.length > 1;
  const currentIndex = sessionVideos.findIndex((v) => v.$id === video.$id);
  const nextVideo = currentIndex >= 0 && currentIndex < sessionVideos.length - 1
    ? sessionVideos[currentIndex + 1]
    : null;

  const player = useVideoPlayer({ uri: url, metadata: { title } }, (p) => {
    p.play();
  });

  const { status, error } = useEvent(player, 'statusChange', {
    status: player.status,
  });

  React.useEffect(() => {
    if (url.includes('.m3u8')) {
      parseHLSVariants(url).then(setVariants);
    }
  }, [url]);

  React.useEffect(() => {
    if (status === 'readyToPlay' && pendingSeek.current != null) {
      player.currentTime = pendingSeek.current;
      pendingSeek.current = null;
    }
  }, [status, player]);

  const switchQuality = React.useCallback(
    (label: string | null) => {
      setPickerVisible(false);
      if (label === activeQuality) return;

      pendingSeek.current = player.currentTime;
      const newUrl = label ? (variants.find((v) => v.label === label)?.url ?? url) : url;
      player.replace({ uri: newUrl, metadata: { title } });
      setActiveQuality(label);
      setViewKey((k) => k + 1);
    },
    [activeQuality, player, title, url, variants]
  );

  const navigateToVideo = React.useCallback(
    (targetId: string) => {
      playlistSheetRef.current?.dismiss();
      router.replace(`/video/${targetId}?session=${sessionParam}`);
    },
    [sessionParam]
  );

  return (
    <View style={{ flex: 1 }} className="items-center justify-center bg-black">
      <VideoView
        key={viewKey}
        player={player}
        style={{ flex: 1, alignSelf: 'stretch' }}
        allowsPictureInPicture
        contentFit="cover"
        fullscreenOptions={{ enable: true }}
      />

      {status === 'loading' && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {status === 'error' && (
        <View className="absolute inset-0 items-center justify-center px-6">
          <Text className="text-center text-white">{error?.message ?? 'Playback error.'}</Text>
        </View>
      )}

      {/* Top-right controls */}
      <View className="absolute right-4 top-12 z-10 flex-row items-center gap-2">
        {hasSession && (
          <TouchableOpacity
            onPress={() => playlistSheetRef.current?.present()}
            activeOpacity={0.7}
            className="flex-row items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5">
            <ListMusicIcon size={14} color="white" />
            <Text className="text-xs font-medium text-white">
              {currentIndex + 1}/{sessionVideos.length}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => infoSheetRef.current?.present()}
          activeOpacity={0.7}
          className="h-8 w-8 items-center justify-center rounded-full bg-black/60">
          <InfoIcon size={14} color="white" />
        </TouchableOpacity>

        {variants.length > 1 && (
          <TouchableOpacity
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.7}
            className="flex-row items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5">
            <SettingsIcon size={14} color="white" />
            <Text className="text-xs font-medium text-white">{activeQuality ?? 'Auto'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Next video button */}
      {hasSession && nextVideo && (
        <TouchableOpacity
          onPress={() => navigateToVideo(nextVideo.$id)}
          activeOpacity={0.7}
          className="absolute bottom-8 right-4 z-10 flex-row items-center gap-2 rounded-full bg-white/20 px-4 py-2.5">
          <Text className="text-sm font-semibold text-white">{t('nextVideo')}</Text>
          <SkipForwardIcon size={16} color="white" />
        </TouchableOpacity>
      )}

      {/* Quality picker modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/60"
          onPress={() => setPickerVisible(false)}>
          <Pressable className="w-64 overflow-hidden rounded-2xl bg-neutral-900">
            <Text className="px-4 pb-2 pt-4 text-center text-base font-semibold text-white">
              Qualité
            </Text>

            <TouchableOpacity
              onPress={() => switchQuality(null)}
              className="flex-row items-center justify-between px-4 py-3">
              <Text className="text-sm text-white">Auto</Text>
              {activeQuality === null && <CheckIcon size={16} color="#22c55e" />}
            </TouchableOpacity>

            {variants.map((v) => (
              <TouchableOpacity
                key={v.label}
                onPress={() => switchQuality(v.label)}
                className="flex-row items-center justify-between px-4 py-3">
                <Text className="text-sm text-white">{v.label}</Text>
                {activeQuality === v.label && <CheckIcon size={16} color="#22c55e" />}
              </TouchableOpacity>
            ))}

            <View className="h-2" />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Info bottom sheet */}
      <BottomSheetModal
        ref={infoSheetRef}
        enableDynamicSizing
        backgroundStyle={{ backgroundColor: '#171717' }}
        handleIndicatorStyle={{ backgroundColor: '#525252' }}>
        <BottomSheetView className="px-5 pb-12 pt-2">
          <Text className="mb-4 text-lg font-semibold text-white">{title}</Text>

          <View className="gap-3">
            {video.teacher && (
              <InfoRow
                label="Enseignant"
                value={`${video.teacher.firstname} ${video.teacher.lastname}`}
              />
            )}
            {video.duration != null && video.duration > 0 && (
              <InfoRow label="Durée" value={formatDuration(video.duration)} />
            )}
            <InfoRow label="Ajoutée le" value={new Date(video.$createdAt).toLocaleDateString()} />
            <InfoRow label="Qualité" value={activeQuality ?? 'Auto (adaptatif)'} />
            {variants.length > 0 && (
              <InfoRow
                label="Qualités disponibles"
                value={variants.map((v) => v.label).join(', ')}
              />
            )}
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      {/* Session playlist bottom sheet */}
      {hasSession && (
        <BottomSheetModal
          ref={playlistSheetRef}
          enableDynamicSizing
          backgroundStyle={{ backgroundColor: '#171717' }}
          handleIndicatorStyle={{ backgroundColor: '#525252' }}>
          <BottomSheetScrollView className="px-5 pb-12 pt-2">
            <Text className="mb-4 text-lg font-semibold text-white">
              {t('sessionPlaylist')}
            </Text>

            {sessionVideos.map((sv, idx) => {
              const isCurrent = sv.$id === video.$id;
              return (
                <TouchableOpacity
                  key={sv.$id}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!isCurrent) navigateToVideo(sv.$id);
                  }}
                  className={`flex-row items-center gap-3 rounded-xl px-3 py-3 ${
                    isCurrent ? 'bg-white/10' : ''
                  }`}>
                  <View
                    className={`h-7 w-7 items-center justify-center rounded-full ${
                      isCurrent ? 'bg-primary' : 'bg-white/10'
                    }`}>
                    {isCurrent ? (
                      <PlayIcon size={12} color="white" />
                    ) : (
                      <Text className="text-xs font-bold text-neutral-400">{idx + 1}</Text>
                    )}
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text
                      className={`text-sm font-medium ${isCurrent ? 'text-white' : 'text-neutral-300'}`}
                      numberOfLines={1}>
                      {sv.title}
                    </Text>
                    {isCurrent && (
                      <Text className="text-[11px] font-semibold text-primary">
                        {t('nowPlaying')}
                      </Text>
                    )}
                  </View>
                  {sv.duration != null && sv.duration > 0 && (
                    <Text className="text-xs text-neutral-500">
                      {formatDuration(sv.duration)}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </BottomSheetScrollView>
        </BottomSheetModal>
      )}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm text-neutral-400">{label}</Text>
      <Text className="text-sm font-medium text-white">{value}</Text>
    </View>
  );
}

export default function VideoPlayerScreen() {
  const { id, session } = useLocalSearchParams<{ id: string; session?: string }>();
  const { updatePrefs } = useAuth();
  const [video, setVideo] = React.useState<VideoDoc | null>(null);
  const [sessionVideos, setSessionVideos] = React.useState<VideoDoc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [focused, setFocused] = React.useState(true);

  const sessionParam = session ?? '';

  useFocusEffect(
    React.useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  React.useEffect(() => {
    databases
      .getDocument(DATABASE_ID, VIDEOS_COLLECTION_ID, id, [Query.select(['*', 'teacher.*'])])
      .then((doc) => {
        setVideo(doc as unknown as VideoDoc);
        updatePrefs({ lastVideoId: id }).catch(() => {});
      })
      .catch((e: any) => setError(e?.message ?? 'Failed to load video.'))
      .finally(() => setLoading(false));
  }, [id]);

  React.useEffect(() => {
    if (!session) {
      setSessionVideos([]);
      return;
    }
    const ids = session.split(',').filter(Boolean);
    if (ids.length <= 1) return;

    Promise.all(
      ids.map((vid) =>
        databases
          .getDocument(DATABASE_ID, VIDEOS_COLLECTION_ID, vid, [Query.select(['*', 'teacher.*'])])
          .then((doc) => doc as unknown as VideoDoc)
          .catch(() => null)
      )
    ).then((docs) => {
      setSessionVideos(docs.filter((d): d is VideoDoc => d !== null));
    });
  }, [session]);

  return (
    <View className="flex-1 bg-background">
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        className="absolute left-4 top-12 z-10 h-9 w-9 items-center justify-center rounded-full bg-black/50">
        <ArrowLeftIcon size={18} color="white" />
      </TouchableOpacity>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text variant="muted" className="text-center">
            {error}
          </Text>
        </View>
      ) : !video?.url ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text variant="muted" className="text-center">
            No video URL available for this entry.
          </Text>
        </View>
      ) : (
        focused && (
          <Player
            video={video}
            sessionVideos={sessionVideos}
            sessionParam={sessionParam}
          />
        )
      )}
    </View>
  );
}
