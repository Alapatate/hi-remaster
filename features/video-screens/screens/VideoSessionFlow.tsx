import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlayIcon,
  RotateCcwIcon,
  UsersIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton } from '../components/ActionButton';
import { ImmersionHeader } from '../components/ImmersionHeader';
import { LastSessionCard } from '../components/LastSessionCard';
import { PhaseSection } from '../components/PhaseSection';
import { SessionSummaryCard } from '../components/SessionSummaryCard';
import { StepProgressBar } from '../components/StepProgressBar';
import { SummaryExerciseList } from '../components/SummaryExerciseList';
import { TeacherHeroCard } from '../components/TeacherHeroCard';
import { TeacherPickerSheet } from '../components/TeacherPickerSheet';
import { AboutTeacherSheet } from '../components/player/AboutTeacherSheet';
import { useTeachers } from '../hooks/useTeachers';
import { useTeacherVideos } from '../hooks/useTeacherVideos';
import { IS_CONFIGURED, readLastSession, teacherFullName } from '../lib/data';
import { totalDuration } from '../lib/format';
import { orderByPhase, PHASE_ORDER } from '../lib/phases';
import type { Video } from '../lib/types';

const FOOTER_HEIGHT = 80;

/** Shared style: absolute fill so entering/exiting steps overlap during crossfade. */
const FILL = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

type Step = 1 | 2 | 3;

export function VideoSessionFlow() {
  const { t } = useTranslation();
  const { user, updatePrefs } = useAuth();
  const { teachers, loading, error, reload } = useTeachers();
  const insets = useSafeAreaInsets();

  const [featuredIndex, setFeaturedIndex] = React.useState(0);
  const [step, setStep] = React.useState<Step>(1);
  const [selected, setSelected] = React.useState<Video[]>([]);

  // Restore last teacher from prefs once the list has loaded.
  const restoredRef = React.useRef(false);
  React.useEffect(() => {
    if (restoredRef.current || teachers.length === 0) return;
    const lastTeacherId = (user?.prefs as Record<string, unknown>)?.lastTeacherId as string | undefined;
    if (lastTeacherId) {
      const idx = teachers.findIndex((t) => t.$id === lastTeacherId);
      if (idx !== -1) setFeaturedIndex(idx);
    }
    restoredRef.current = true;
  }, [teachers, user?.prefs]);

  const aboutRef = React.useRef<BottomSheetModal>(null);
  const pickerRef = React.useRef<BottomSheetModal>(null);

  const teacher = teachers[featuredIndex];
  const { videos, loading: videosLoading } = useTeacherVideos(step >= 2 ? teacher?.$id : undefined);

  const selectedIds = React.useMemo(() => new Set(selected.map((v) => v.$id)), [selected]);
  const total = React.useMemo(() => totalDuration(selected), [selected]);
  const lastSession = React.useMemo(
    () => readLastSession(user?.prefs as Record<string, unknown>),
    [user?.prefs]
  );

  const goHome = React.useCallback(() => {
    setStep(1);
    setSelected([]);
  }, []);

  const pickTeacher = React.useCallback(
    (t: (typeof teachers)[number]) => {
      const idx = teachers.findIndex((x) => x.$id === t.$id);
      if (idx !== -1) setFeaturedIndex(idx);
      setSelected([]);
      pickerRef.current?.dismiss();
      updatePrefs({ lastTeacherId: t.$id }).catch(() => {});
    },
    [teachers, updatePrefs]
  );

  const toggleVideo = React.useCallback((video: Video) => {
    setSelected((prev) =>
      prev.some((v) => v.$id === video.$id)
        ? prev.filter((v) => v.$id !== video.$id)
        : [...prev, video]
    );
  }, []);

  const startSession = React.useCallback(() => {
    const ordered = orderByPhase(selected);
    if (ordered.length === 0) return;
    const ids = ordered.map((v) => v.$id).join(',');
    if (teacher) {
      updatePrefs({ lastTeacherId: teacher.$id }).catch(() => {});
    }
    router.push(`/video/${ordered[0].$id}?session=${ids}`);
  }, [selected, teacher, updatePrefs]);

  const resumeLastSession = React.useCallback(() => {
    if (!lastSession) return;
    const query = lastSession.sessionParam ? `?session=${lastSession.sessionParam}` : '';
    router.push(`/video/${lastSession.videoId}${query}`);
  }, [lastSession]);

  if (!IS_CONFIGURED) return <SetupPlaceholder />;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="pt-2">
        <ImmersionHeader onHome={goHome} />
      </View>

      {step > 1 ? (
        <Animated.View exiting={FadeOut.duration(180)} className="pt-4">
          <StepProgressBar
            current={step}
            total={3}
            onBack={() => setStep((s) => (s === 3 ? 2 : 1) as Step)}
          />
        </Animated.View>
      ) : null}

      {/* Relative container so entering/exiting steps overlap during crossfade */}
      <View style={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <Animated.View key="loading" exiting={FadeOut.duration(180)} style={FILL}>
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#bf6e1a" />
            </View>
          </Animated.View>
        ) : error ? (
          <Animated.View key="error" exiting={FadeOut.duration(180)} style={FILL}>
            <ErrorState message={error} onRetry={reload} />
          </Animated.View>
        ) : !teacher ? (
          <Animated.View key="empty" exiting={FadeOut.duration(180)} style={FILL}>
            <EmptyState message={t('noTeachers')} />
          </Animated.View>
        ) : step === 1 ? (
          <Animated.View key="step-1" exiting={FadeOut.duration(200)} style={FILL}>
            <View
              style={{
                flex: 1,
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: Math.max(insets.bottom, 10),
                gap: 12,
              }}>
              <TeacherHeroCard
                teacher={teacher}
                onInfo={() => aboutRef.current?.present()}
                style={{ flex: 1 }}
              />
              <View className="flex-row gap-3">
                <ActionButton
                  className="flex-1"
                  label={t('practice')}
                  onPress={() => setStep(2)}
                  iconRight={<ArrowRightIcon size={18} color="white" />}
                />
                <ActionButton
                  variant="secondary"
                  label={t('change')}
                  onPress={() => pickerRef.current?.present()}
                  iconLeft={<UsersIcon size={16} color="#4a3826" />}
                />
              </View>
              {lastSession ? (
                <LastSessionCard
                  teacherName={lastSession.teacherName || teacherFullName(teacher)}
                  progress={lastSession.progress}
                  totalSeconds={lastSession.totalSeconds}
                  onPress={resumeLastSession}
                />
              ) : null}
            </View>
          </Animated.View>
        ) : step === 2 ? (
          <Animated.View key="step-2" exiting={FadeOut.duration(200)} style={FILL}>
            {videosLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#bf6e1a" />
              </View>
            ) : (
              <ScrollView
                contentContainerStyle={{
                  padding: 20,
                  paddingBottom: FOOTER_HEIGHT + Math.max(insets.bottom, 16),
                }}>
                {PHASE_ORDER.map((type) => (
                  <PhaseSection
                    key={type}
                    type={type}
                    videos={videos.filter((v) => v.type === type)}
                    selectedIds={selectedIds}
                    onToggle={toggleVideo}
                  />
                ))}
              </ScrollView>
            )}
            <FooterBar insetBottom={insets.bottom}>
              <ActionButton
                variant="secondary"
                label={t('back')}
                onPress={() => setStep(1)}
                iconLeft={<ArrowLeftIcon size={18} color="#4a3826" />}
              />
              <ActionButton
                className="flex-1"
                label={t('nextStep')}
                disabled={selected.length === 0}
                onPress={() => setStep(3)}
                iconRight={<ArrowRightIcon size={18} color="white" />}
              />
            </FooterBar>
          </Animated.View>
        ) : (
          <Animated.View key="step-3" exiting={FadeOut.duration(200)} style={FILL}>
            <ScrollView
              contentContainerStyle={{
                padding: 20,
                paddingBottom: FOOTER_HEIGHT + Math.max(insets.bottom, 16),
                gap: 16,
              }}>
              <SessionSummaryCard
                teacherName={teacherFullName(teacher)}
                totalDuration={total}
                exerciseCount={selected.length}
              />
              <SummaryExerciseList videos={selected} />
            </ScrollView>
            <FooterBar insetBottom={insets.bottom}>
              <ActionButton
                variant="secondary"
                label={t('startNewSession')}
                onPress={goHome}
                iconLeft={<RotateCcwIcon size={16} color="#4a3826" />}
              />
              <ActionButton
                className="flex-1"
                label={t('startSession')}
                onPress={startSession}
                iconLeft={<PlayIcon size={18} color="white" fill="white" />}
              />
            </FooterBar>
          </Animated.View>
        )}
      </View>

      <TeacherPickerSheet
        ref={pickerRef}
        teachers={teachers}
        currentId={teacher?.$id}
        onSelect={pickTeacher}
      />
      {teacher ? (
        <AboutTeacherSheet ref={aboutRef} title={teacherFullName(teacher)} teacher={teacher} />
      ) : null}
    </View>
  );
}

function FooterBar({
  children,
  insetBottom = 0,
}: {
  children: React.ReactNode;
  insetBottom?: number;
}) {
  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row gap-3 bg-background px-5 pt-3"
      style={{ paddingBottom: Math.max(insetBottom, 16) + 8 }}>
      {children}
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8">
      <Text className="text-center text-muted-foreground">{message}</Text>
      <ActionButton label={t('retry')} onPress={onRetry} />
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center text-muted-foreground">{message}</Text>
    </View>
  );
}

function SetupPlaceholder() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-center leading-6 text-muted-foreground">
        Configure DATABASE_ID and VIDEOS_COLLECTION_ID in lib/appwrite.ts.
      </Text>
    </View>
  );
}
