import { useBottomDockSpace } from '@/components/navigation/FloatingTabBar';
import { Text } from '@/components/ui/text';
import { DATABASE_ID, VIDEOS_COLLECTION_ID, databases } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth';
import { router } from 'expo-router';
import {
  LayoutDashboardIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  ZapIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Models } from 'react-native-appwrite';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  ZoomIn,
} from 'react-native-reanimated';

const ACCENT_COLORS = {
  purple: { bg: '#ede9fe', border: '#8b5cf6', dot: '#7c3aed' },
  teal: { bg: '#ccfbf1', border: '#14b8a6', dot: '#0d9488' },
  amber: { bg: '#fef3c7', border: '#f59e0b', dot: '#d97706' },
  rose: { bg: '#ffe4e6', border: '#f43f5e', dot: '#e11d48' },
} as const;

const ACCENT_COLORS_DARK = {
  purple: { bg: '#2e1065', border: '#8b5cf6', dot: '#a78bfa' },
  teal: { bg: '#042f2e', border: '#14b8a6', dot: '#2dd4bf' },
  amber: { bg: '#451a03', border: '#f59e0b', dot: '#fbbf24' },
  rose: { bg: '#4c0519', border: '#f43f5e', dot: '#fb7185' },
} as const;

type VideoDoc = Models.Document & {
  title: string;
  url?: string;
  duration?: number;
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

function PulsingDot({ color, delay = 0 }: { color: string; delay?: number }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.4, { duration: 800, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [delay, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const dockSpace = useBottomDockSpace();

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const joinDate = user?.$createdAt ? new Date(user.$createdAt).toLocaleDateString() : '—';

  const lastVideoId = (user?.prefs as Record<string, string>)?.lastVideoId;
  const [lastVideo, setLastVideo] = React.useState<VideoDoc | null>(null);
  const [lastVideoLoading, setLastVideoLoading] = React.useState(false);

  React.useEffect(() => {
    if (!lastVideoId) return;
    setLastVideoLoading(true);
    databases
      .getDocument(DATABASE_ID, VIDEOS_COLLECTION_ID, lastVideoId)
      .then((doc) => setLastVideo(doc as unknown as VideoDoc))
      .catch(() => setLastVideo(null))
      .finally(() => setLastVideoLoading(false));
  }, [lastVideoId]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-6"
      contentContainerStyle={{ paddingBottom: dockSpace }}>
      <Animated.View entering={FadeInDown.duration(500).springify()} className="mb-8 mt-4">
        <View className="mb-2 flex-row items-center gap-2">
          <Animated.Text
            entering={ZoomIn.delay(400).duration(400)}
            style={{ fontSize: 28 }}>
            {'👋'}
          </Animated.Text>
          <Text variant="muted" className="text-base">
            {t('hello', { name: firstName })}
          </Text>
        </View>
        <Text variant="h2" className="border-0 pb-0 text-2xl">
          {t('dashboard')}
        </Text>
      </Animated.View>

      {lastVideoId && (
        <Animated.View entering={FadeInUp.delay(200).duration(500).springify()} className="mb-5">
          <View className="mb-2 flex-row items-center gap-2">
            <PulsingDot color={ACCENT_COLORS.rose.dot} />
            <Text className="text-sm font-semibold text-muted-foreground">
              {t('continueWatching')}
            </Text>
          </View>
          {lastVideoLoading ? (
            <View className="items-center justify-center rounded-xl border border-border bg-card p-6">
              <ActivityIndicator />
            </View>
          ) : lastVideo ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/video/${lastVideo.$id}`)}
              style={{
                borderLeftWidth: 3,
                borderLeftColor: ACCENT_COLORS.rose.border,
              }}
              className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-3">
              <View
                style={{ backgroundColor: ACCENT_COLORS.rose.bg }}
                className="h-16 w-28 items-center justify-center rounded-lg">
                <PlayCircleIcon size={28} color={ACCENT_COLORS.rose.dot} />
                {lastVideo.duration != null && lastVideo.duration > 0 && (
                  <View className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5">
                    <Text className="text-xs font-medium text-white">
                      {formatDuration(lastVideo.duration)}
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-1 gap-1">
                <Text className="font-semibold leading-5" numberOfLines={2}>
                  {lastVideo.title}
                </Text>
                <Text variant="muted" className="text-xs">
                  {new Date(lastVideo.$createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </Animated.View>
      )}

      <View className="gap-3">
        <Card
          index={0}
          accent="purple"
          icon={<LayoutDashboardIcon size={20} color={ACCENT_COLORS.purple.dot} />}
          title={t('overview')}
          description={t('overviewDesc')}
        />
        <Card
          index={1}
          accent="teal"
          icon={<ShieldCheckIcon size={20} color={ACCENT_COLORS.teal.dot} />}
          title={t('security')}
          description={
            user?.emailVerification ? t('emailVerifiedDesc') : t('emailNotVerifiedDesc')
          }
        />
        <Card
          index={2}
          accent="amber"
          icon={<ZapIcon size={20} color={ACCENT_COLORS.amber.dot} />}
          title={t('activity')}
          description={t('activityDesc', { date: joinDate })}
        />
      </View>
    </ScrollView>
  );
}

function Card({
  icon,
  title,
  description,
  index = 0,
  accent = 'purple',
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index?: number;
  accent?: keyof typeof ACCENT_COLORS;
}) {
  const colors = ACCENT_COLORS[accent];

  return (
    <Animated.View
      entering={FadeInUp.delay(300 + index * 120)
        .duration(500)
        .springify()}
      style={{
        borderLeftWidth: 3,
        borderLeftColor: colors.border,
      }}
      className="rounded-xl border border-border bg-card p-4">
      <View className="mb-2 flex-row items-center gap-3">
        <View
          style={{ backgroundColor: colors.bg }}
          className="h-8 w-8 items-center justify-center rounded-full">
          {icon}
        </View>
        <Text className="font-semibold">{title}</Text>
        <View className="flex-1" />
        <PulsingDot color={colors.dot} delay={index * 300} />
      </View>
      <Text variant="muted" className="ml-11 text-sm leading-5">
        {description}
      </Text>
    </Animated.View>
  );
}
