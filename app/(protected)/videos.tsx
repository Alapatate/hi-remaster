import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  DATABASE_ID,
  TEACHERS_COLLECTION_ID,
  VIDEOS_COLLECTION_ID,
  databases,
} from '@/lib/appwrite';
import { router } from 'expo-router';
import {
  ArrowLeftIcon,
  CheckIcon,
  ClipboardListIcon,
  ClockIcon,
  GraduationCapIcon,
  PlayCircleIcon,
  PlayIcon,
  RotateCcwIcon,
  SparklesIcon,
  UserIcon,
} from 'lucide-react-native';
import * as React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInRight,
  FadeOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Query, type Models } from 'react-native-appwrite';

type TeacherDoc = Models.Document & {
  firstname: string;
  lastname: string;
  lang: string;
  presentation?: string;
};

type VideoType = 'start' | 'core' | 'end';

type VideoDoc = Models.Document & {
  title: string;
  url?: string;
  duration?: number;
  type: VideoType;
  teacher?: TeacherDoc;
};

const VIDEO_TYPE_ORDER: VideoType[] = ['start', 'core', 'end'];

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const IS_CONFIGURED =
  DATABASE_ID !== 'YOUR_DATABASE_ID' && VIDEOS_COLLECTION_ID !== 'YOUR_VIDEOS_COLLECTION_ID';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 12;
const GRID_PADDING = 24;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

export default function Videos() {
  const { t } = useTranslation();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [selectedTeacher, setSelectedTeacher] = React.useState<TeacherDoc | null>(null);
  const [selectedVideos, setSelectedVideos] = React.useState<VideoDoc[]>([]);
  const [allVideos, setAllVideos] = React.useState<VideoDoc[]>([]);

  const selectedIds = React.useMemo(
    () => new Set(selectedVideos.map((v) => v.$id)),
    [selectedVideos]
  );

  const sessionDuration = React.useMemo(
    () => selectedVideos.reduce((sum, v) => sum + (v.duration ?? 0), 0),
    [selectedVideos]
  );

  const handleSelectTeacher = React.useCallback((teacher: TeacherDoc) => {
    setSelectedTeacher(teacher);
    setStep(2);
  }, []);

  const handleToggleVideo = React.useCallback((video: VideoDoc) => {
    setSelectedVideos((prev) => {
      const exists = prev.some((v) => v.$id === video.$id);
      return exists ? prev.filter((v) => v.$id !== video.$id) : [...prev, video];
    });
  }, []);

  const handleValidate = React.useCallback(() => {
    setStep(3);
  }, []);

  const handleBackToTeachers = React.useCallback(() => {
    setSelectedTeacher(null);
    setSelectedVideos([]);
    setAllVideos([]);
    setStep(1);
  }, []);

  const handleBackToVideos = React.useCallback(() => {
    setStep(2);
  }, []);

  const handleReset = React.useCallback(() => {
    setSelectedTeacher(null);
    setSelectedVideos([]);
    setAllVideos([]);
    setStep(1);
  }, []);

  if (!IS_CONFIGURED) return <SetupPlaceholder />;

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pb-1 pt-8">
        <View className="flex-row items-center gap-2">
          <SparklesIcon size={22} className="text-primary" />
          <Text variant="h2" className="border-0 pb-0 text-2xl">
            {t('videos')}
          </Text>
        </View>
      </View>

      <StepIndicator currentStep={step} />

      {step === 1 && (
        <Animated.View
          key="step-1"
          entering={FadeInRight.duration(250)}
          exiting={FadeOutLeft.duration(150)}
          className="flex-1">
          <View className="px-6 pb-3 pt-1">
            <Text className="text-base font-medium text-muted-foreground">
              {t('selectTeacher')}
            </Text>
          </View>
          <TeacherList onSelect={handleSelectTeacher} />
        </Animated.View>
      )}

      {step === 2 && (
        <Animated.View
          key="step-2"
          entering={FadeInRight.duration(250)}
          exiting={FadeOutLeft.duration(150)}
          className="flex-1">
          <View className="flex-row items-center gap-3 px-6 pb-3 pt-1">
            <TouchableOpacity
              onPress={handleBackToTeachers}
              activeOpacity={0.7}
              hitSlop={12}
              className="h-8 w-8 items-center justify-center rounded-full bg-muted">
              <ArrowLeftIcon size={16} className="text-foreground" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-base font-medium text-muted-foreground">
                {t('selectVideos')}
              </Text>
              {selectedTeacher && (
                <Text className="text-sm font-semibold text-primary">
                  {selectedTeacher.firstname} {selectedTeacher.lastname}
                </Text>
              )}
            </View>
          </View>
          <VideoList
            teacherId={selectedTeacher!.$id}
            selectedIds={selectedIds}
            onToggle={handleToggleVideo}
            onVideosLoaded={setAllVideos}
          />
          <SessionBar
            count={selectedVideos.length}
            duration={sessionDuration}
            onValidate={handleValidate}
          />
        </Animated.View>
      )}

      {step === 3 && (
        <Animated.View
          key="step-3"
          entering={FadeInRight.duration(250)}
          exiting={FadeOutLeft.duration(150)}
          className="flex-1">
          <SessionSummary
            teacher={selectedTeacher!}
            videos={selectedVideos}
            totalDuration={sessionDuration}
            onBack={handleBackToVideos}
            onReset={handleReset}
            onStart={() => {
              const ordered = [...selectedVideos].sort((a, b) => {
                return VIDEO_TYPE_ORDER.indexOf(a.type) - VIDEO_TYPE_ORDER.indexOf(b.type);
              });
              if (ordered.length > 0) {
                const sessionIds = ordered.map((v) => v.$id).join(',');
                router.push(`/video/${ordered[0].$id}?session=${sessionIds}`);
              }
            }}
          />
        </Animated.View>
      )}
    </View>
  );
}

const SPRING_CONFIG = { damping: 15, stiffness: 120, mass: 0.8 };

function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const { t } = useTranslation();
  const progress12 = useSharedValue(0);
  const progress23 = useSharedValue(0);
  const step1Scale = useSharedValue(1);
  const step2Scale = useSharedValue(1);
  const step3Scale = useSharedValue(1);

  const easeOut = { duration: 400, easing: Easing.out(Easing.cubic) };

  React.useEffect(() => {
    progress12.value = withTiming(currentStep >= 2 ? 1 : 0, easeOut);
    progress23.value = withTiming(currentStep >= 3 ? 1 : 0, easeOut);

    const scales = [step1Scale, step2Scale, step3Scale];
    scales.forEach((s, i) => {
      const stepNum = i + 1;
      if (stepNum === currentStep) {
        s.value = withSpring(1.12, SPRING_CONFIG);
        setTimeout(() => {
          s.value = withSpring(1, SPRING_CONFIG);
        }, 300);
      } else {
        s.value = withSpring(currentStep > stepNum ? 1 : 0.92, SPRING_CONFIG);
      }
    });
  }, [currentStep, progress12, progress23, step1Scale, step2Scale, step3Scale]);

  const line12Style = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress12.value }],
  }));
  const line23Style = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress23.value }],
  }));
  const s1Style = useAnimatedStyle(() => ({ transform: [{ scale: step1Scale.value }] }));
  const s2Style = useAnimatedStyle(() => ({ transform: [{ scale: step2Scale.value }] }));
  const s3Style = useAnimatedStyle(() => ({ transform: [{ scale: step3Scale.value }] }));

  const steps = [
    { style: s1Style, icon: UserIcon, done: currentStep > 1, active: currentStep === 1 },
    { style: s2Style, icon: PlayCircleIcon, done: currentStep > 2, active: currentStep === 2 },
    { style: s3Style, icon: ClipboardListIcon, done: false, active: currentStep === 3 },
  ];

  const lines = [line12Style, line23Style];

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="mx-6 my-3 overflow-hidden rounded-2xl bg-card p-5"
      style={{ elevation: 2 }}>
      <View className="flex-row items-center justify-between">
        {steps.map(({ style, icon: Icon, done, active }, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <View className="mx-2 h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <Animated.View
                  style={[lines[i - 1], { transformOrigin: 'left' }]}
                  className={`h-full w-full rounded-full ${
                    done || active ? (done ? 'bg-green-500' : 'bg-primary') : 'bg-primary'
                  }`}
                />
              </View>
            )}
            <Animated.View
              style={style}
              className={`h-12 w-12 items-center justify-center rounded-full ${
                done ? 'bg-green-500' : active ? 'bg-primary' : 'bg-muted'
              }`}>
              {done ? (
                <CheckIcon size={22} color="white" />
              ) : (
                <Icon
                  size={22}
                  color={active ? 'white' : undefined}
                  className={active ? '' : 'text-muted-foreground'}
                />
              )}
            </Animated.View>
          </React.Fragment>
        ))}
      </View>

      <View className="mt-2 flex-row items-center justify-between">
        {[1, 2, 3].map((n) => (
          <Text
            key={n}
            className={`w-12 text-center text-xs font-semibold ${
              currentStep === n
                ? 'text-primary'
                : currentStep > n
                  ? 'text-green-500'
                  : 'text-muted-foreground'
            }`}>
            {t('step')} {n}
          </Text>
        ))}
      </View>
    </Animated.View>
  );
}

function TeacherList({ onSelect }: { onSelect: (t: TeacherDoc) => void }) {
  const { t } = useTranslation();
  const [teachers, setTeachers] = React.useState<TeacherDoc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');

  const fetchTeachers = React.useCallback(async () => {
    setError('');
    try {
      const res = await databases.listDocuments(DATABASE_ID, TEACHERS_COLLECTION_ID);
      setTeachers(res.documents as unknown as TeacherDoc[]);
    } catch (e: any) {
      setError(e?.message ?? t('errorTeachers'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  React.useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeachers();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Text variant="muted" className="text-center">
          {error}
        </Text>
        <Button
          variant="outline"
          onPress={() => {
            setLoading(true);
            fetchTeachers();
          }}>
          <Text>{t('retry')}</Text>
        </Button>
      </View>
    );
  }

  return (
    <FlatList
      data={teachers}
      keyExtractor={(item) => item.$id}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
      ItemSeparatorComponent={() => <View className="h-3" />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center gap-3 py-24">
          <GraduationCapIcon size={48} className="text-muted-foreground" />
          <Text variant="muted">{t('noTeachers')}</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <TeacherCard teacher={item} index={index} onPress={() => onSelect(item)} />
      )}
    />
  );
}

const EASE_OUT_TIMING = { duration: 350, easing: Easing.out(Easing.quad) };

function useCardEntrance(index: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);

  React.useEffect(() => {
    const delay = Math.min(index * 50, 300);
    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, EASE_OUT_TIMING);
      translateY.value = withTiming(0, EASE_OUT_TIMING);
    }, delay);
    return () => clearTimeout(timeout);
  }, [index, opacity, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#10b981', '#ec4899'] as const;

function TeacherCard({
  teacher,
  index,
  onPress,
}: {
  teacher: TeacherDoc;
  index: number;
  onPress: () => void;
}) {
  const initials = `${teacher.firstname?.[0] ?? ''}${teacher.lastname?.[0] ?? ''}`.toUpperCase();
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const animStyle = useCardEntrance(index);

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <View
          className="flex-row items-center gap-4 rounded-2xl bg-card px-4 py-3.5"
          style={{ borderLeftWidth: 3, borderLeftColor: color }}>
          <View
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: color + '18' }}>
            <Text style={{ color, fontSize: 15, fontWeight: '700' }}>{initials}</Text>
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-[15px] font-semibold leading-5">
              {teacher.firstname} {teacher.lastname}
            </Text>
            {teacher.lang ? (
              <Text className="text-xs text-muted-foreground">{teacher.lang}</Text>
            ) : null}
          </View>
          <View
            className="h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: color + '15' }}>
            <ArrowLeftIcon size={13} color={color} style={{ transform: [{ rotate: '180deg' }] }} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const TYPE_I18N_KEY: Record<VideoType, string> = {
  start: 'videoTypeStart',
  core: 'videoTypeCore',
  end: 'videoTypeEnd',
};

const TYPE_COLORS: Record<VideoType, string> = {
  start: '#3b82f6',
  core: '#f97316',
  end: '#10b981',
};

function VideoList({
  teacherId,
  selectedIds,
  onToggle,
  onVideosLoaded,
}: {
  teacherId: string;
  selectedIds: Set<string>;
  onToggle: (video: VideoDoc) => void;
  onVideosLoaded: (videos: VideoDoc[]) => void;
}) {
  const { t } = useTranslation();
  const [videos, setVideos] = React.useState<VideoDoc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');

  const fetchVideos = React.useCallback(async () => {
    setError('');
    try {
      const res = await databases.listDocuments(DATABASE_ID, VIDEOS_COLLECTION_ID, [
        Query.equal('teacher', teacherId),
      ]);
      const docs = res.documents as unknown as VideoDoc[];
      setVideos(docs);
      onVideosLoaded(docs);
    } catch (e: any) {
      setError(e?.message ?? t('errorVideos'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [teacherId, t, onVideosLoaded]);

  React.useEffect(() => {
    setLoading(true);
    fetchVideos();
  }, [fetchVideos]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVideos();
  };

  const grouped = React.useMemo(() => {
    const map: Record<VideoType, VideoDoc[]> = { start: [], core: [], end: [] };
    for (const v of videos) {
      const bucket = map[v.type];
      if (bucket) bucket.push(v);
    }
    return map;
  }, [videos]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Text variant="muted" className="text-center">
          {error}
        </Text>
        <Button
          variant="outline"
          onPress={() => {
            setLoading(true);
            fetchVideos();
          }}>
          <Text>{t('retry')}</Text>
        </Button>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-3 py-24">
        <PlayCircleIcon size={48} className="text-muted-foreground" />
        <Text variant="muted">{t('noVideos')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: GRID_PADDING, paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {VIDEO_TYPE_ORDER.map((type) => {
        const items = grouped[type];
        if (items.length === 0) return null;
        return (
          <View key={type} className="mb-5">
            <SectionHeader type={type} count={items.length} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP }}>
              {items.map((video, idx) => (
                <VideoCard
                  key={video.$id}
                  video={video}
                  index={idx}
                  selected={selectedIds.has(video.$id)}
                  onToggle={() => onToggle(video)}
                />
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function SectionHeader({ type, count }: { type: VideoType; count: number }) {
  const { t } = useTranslation();
  const color = TYPE_COLORS[type];

  return (
    <View className="mb-3 flex-row items-center gap-2.5">
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="text-sm font-bold" style={{ color }}>
        {t(TYPE_I18N_KEY[type])}
      </Text>
      <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: color + '15' }}>
        <Text className="text-[11px] font-semibold" style={{ color }}>
          {count}
        </Text>
      </View>
    </View>
  );
}

function VideoCard({
  video,
  index,
  selected,
  onToggle,
}: {
  video: VideoDoc;
  index: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const animStyle = useCardEntrance(index);

  return (
    <Animated.View style={[animStyle, { width: CARD_WIDTH }]}>
      <TouchableOpacity activeOpacity={0.7} onPress={onToggle}>
        <View
          className={`overflow-hidden rounded-xl ${selected ? 'bg-primary/5' : 'bg-card'}`}
          style={selected ? { borderWidth: 2, borderColor: '#3b82f6' } : {}}>
          <View
            className="items-center justify-center bg-muted"
            style={{ height: CARD_WIDTH * 0.56 }}>
            <PlayCircleIcon size={28} className="text-muted-foreground/40" />
            {video.duration != null && video.duration > 0 && (
              <View className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5">
                <Text className="text-[10px] font-semibold text-white">
                  {formatDuration(video.duration)}
                </Text>
              </View>
            )}
            {selected && (
              <View className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full bg-primary">
                <CheckIcon size={14} color="white" />
              </View>
            )}
          </View>
          <View className="px-2.5 pb-2.5 pt-2">
            <Text className="text-[13px] font-semibold leading-4" numberOfLines={2}>
              {video.title}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function SessionBar({
  count,
  duration,
  onValidate,
}: {
  count: number;
  duration: number;
  onValidate: () => void;
}) {
  const { t } = useTranslation();

  if (count === 0) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      className="absolute bottom-0 left-0 right-0 border-t border-border bg-card px-6 pb-8 pt-4"
      style={{ elevation: 8 }}>
      <View className="flex-row items-center justify-between">
        <View className="gap-0.5">
          <Text className="text-sm font-bold text-foreground">
            {count} {t('exercises')} {t('selected')}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <ClockIcon size={13} className="text-muted-foreground" />
            <Text className="text-xs text-muted-foreground">
              {t('sessionTime')}: {formatDuration(duration)}
            </Text>
          </View>
        </View>
        <Button onPress={onValidate}>
          <Text>{t('validateSession')}</Text>
        </Button>
      </View>
    </Animated.View>
  );
}

function SessionSummary({
  teacher,
  videos,
  totalDuration,
  onBack,
  onReset,
  onStart,
}: {
  teacher: TeacherDoc;
  videos: VideoDoc[];
  totalDuration: number;
  onBack: () => void;
  onReset: () => void;
  onStart: () => void;
}) {
  const { t } = useTranslation();

  const grouped = React.useMemo(() => {
    const map: Record<VideoType, VideoDoc[]> = { start: [], core: [], end: [] };
    for (const v of videos) {
      const bucket = map[v.type];
      if (bucket) bucket.push(v);
    }
    return map;
  }, [videos]);

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
      <View className="flex-row items-center gap-3 pb-4 pt-1">
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={12}
          className="h-8 w-8 items-center justify-center rounded-full bg-muted">
          <ArrowLeftIcon size={16} className="text-foreground" />
        </TouchableOpacity>
        <Text className="flex-1 text-base font-medium text-muted-foreground">
          {t('sessionSummary')}
        </Text>
      </View>

      {/* Summary card */}
      <View className="mb-5 rounded-2xl bg-card p-5" style={{ elevation: 1 }}>
        <View className="mb-4 flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <GraduationCapIcon size={20} className="text-primary" />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted-foreground">{t('teacher')}</Text>
            <Text className="text-base font-bold">
              {teacher.firstname} {teacher.lastname}
            </Text>
          </View>
        </View>

        <View className="h-px bg-border" />

        <View className="mt-4 flex-row">
          <View className="flex-1 items-center gap-1">
            <Text className="text-2xl font-bold text-primary">{videos.length}</Text>
            <Text className="text-xs text-muted-foreground">{t('exercises')}</Text>
          </View>
          <View className="w-px bg-border" />
          <View className="flex-1 items-center gap-1">
            <Text className="text-2xl font-bold text-primary">{formatDuration(totalDuration)}</Text>
            <Text className="text-xs text-muted-foreground">{t('totalDuration')}</Text>
          </View>
        </View>
      </View>

      {/* Exercises by type */}
      {VIDEO_TYPE_ORDER.map((type) => {
        const items = grouped[type];
        if (items.length === 0) return null;
        const color = TYPE_COLORS[type];
        return (
          <View key={type} className="mb-4">
            <View className="mb-2 flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <Text className="text-sm font-bold" style={{ color }}>
                {t(TYPE_I18N_KEY[type])}
              </Text>
            </View>
            {items.map((video, idx) => (
              <View
                key={video.$id}
                className={`flex-row items-center gap-3 py-2.5 ${
                  idx < items.length - 1 ? 'border-b border-border' : ''
                }`}>
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: color + '15' }}>
                  <Text className="text-xs font-bold" style={{ color }}>
                    {idx + 1}
                  </Text>
                </View>
                <Text className="flex-1 text-sm font-medium" numberOfLines={1}>
                  {video.title}
                </Text>
                {video.duration != null && video.duration > 0 && (
                  <Text className="text-xs text-muted-foreground">
                    {formatDuration(video.duration)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        );
      })}

      {/* Action buttons */}
      <View className="mt-4 gap-3">
        <Button onPress={onStart} size="lg" className="flex-row gap-2">
          <PlayIcon size={18} color="white" />
          <Text>{t('startSession')}</Text>
        </Button>
        <Button variant="outline" onPress={onReset} className="flex-row gap-2">
          <RotateCcwIcon size={16} className="text-foreground" />
          <Text>{t('startNewSession')}</Text>
        </Button>
      </View>
    </ScrollView>
  );
}

function SetupPlaceholder() {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8">
      <PlayCircleIcon size={48} className="text-muted-foreground" />
      <Text variant="muted" className="text-center leading-6">
        Set <Text variant="code">DATABASE_ID</Text> and{' '}
        <Text variant="code">VIDEOS_COLLECTION_ID</Text> in{' '}
        <Text variant="code">lib/appwrite.ts</Text> to connect to your Appwrite videos collection.
      </Text>
    </View>
  );
}
