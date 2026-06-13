import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlayIcon,
  RotateCcwIcon,
  ShuffleIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ActionButton } from '../components/ActionButton';
import { ImmersionHeader } from '../components/ImmersionHeader';
import { LastSessionCard } from '../components/LastSessionCard';
import { PhaseSection } from '../components/PhaseSection';
import { SessionSummaryCard } from '../components/SessionSummaryCard';
import { StepProgressBar } from '../components/StepProgressBar';
import { SummaryExerciseList } from '../components/SummaryExerciseList';
import { TeacherHeroCard } from '../components/TeacherHeroCard';
import { AboutTeacherSheet } from '../components/player/AboutTeacherSheet';
import { useTeachers } from '../hooks/useTeachers';
import { useTeacherVideos } from '../hooks/useTeacherVideos';
import { IS_CONFIGURED, readLastSession, teacherFullName } from '../lib/data';
import { totalDuration } from '../lib/format';
import { orderByPhase, PHASE_ORDER } from '../lib/phases';
import type { Video } from '../lib/types';

const BOTTOM_INSET = 120;

type Step = 1 | 2 | 3;

export function VideoSessionFlow() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { teachers, loading, error, reload } = useTeachers();

  const [featuredIndex, setFeaturedIndex] = React.useState(0);
  const [step, setStep] = React.useState<Step>(1);
  const [selected, setSelected] = React.useState<Video[]>([]);

  const aboutRef = React.useRef<BottomSheetModal>(null);

  const teacher = teachers[featuredIndex];
  const { videos, loading: videosLoading } = useTeacherVideos(
    step >= 2 ? teacher?.$id : undefined
  );

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

  const shuffleTeacher = React.useCallback(() => {
    if (teachers.length < 2) return;
    setFeaturedIndex((i) => (i + 1) % teachers.length);
    setSelected([]);
  }, [teachers.length]);

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
    router.push(`/video/${ordered[0].$id}?session=${ids}`);
  }, [selected]);

  const resumeLastSession = React.useCallback(() => {
    if (!lastSession) return;
    const query = lastSession.sessionParam ? `?session=${lastSession.sessionParam}` : '';
    router.push(`/video/${lastSession.videoId}${query}`);
  }, [lastSession]);

  if (!IS_CONFIGURED) return <SetupPlaceholder />;

  return (
    <View className="flex-1 bg-background">
      <View className="pt-8" />
      <ImmersionHeader onHome={goHome} />

      {step > 1 ? (
        <View className="pt-4">
          <StepProgressBar
            current={step}
            total={3}
            onBack={() => setStep((s) => (s === 3 ? 2 : 1) as Step)}
          />
        </View>
      ) : null}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#bf6e1a" />
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !teacher ? (
        <EmptyState message={t('noTeachers')} />
      ) : step === 1 ? (
        <Animated.View key="step-1" entering={FadeIn.duration(250)} className="flex-1">
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: BOTTOM_INSET, gap: 16 }}>
            <View className="pt-2">
              <TeacherHeroCard teacher={teacher} onInfo={() => aboutRef.current?.present()} />
            </View>
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
                onPress={shuffleTeacher}
                iconLeft={<ShuffleIcon size={16} color="#4a3826" />}
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
          </ScrollView>
        </Animated.View>
      ) : step === 2 ? (
        <Animated.View key="step-2" entering={FadeIn.duration(250)} className="flex-1">
          {videosLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#bf6e1a" />
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: BOTTOM_INSET }}>
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
          <FooterBar>
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
        <Animated.View key="step-3" entering={FadeIn.duration(250)} className="flex-1">
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: BOTTOM_INSET, gap: 16 }}>
            <SessionSummaryCard
              teacherName={teacherFullName(teacher)}
              totalDuration={total}
              exerciseCount={selected.length}
            />
            <SummaryExerciseList videos={selected} />
          </ScrollView>
          <FooterBar>
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

      <AboutTeacherSheet ref={aboutRef} title={teacherFullName(teacher)} teacher={teacher} />
    </View>
  );
}

function FooterBar({ children }: { children: React.ReactNode }) {
  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row gap-3 px-5 pb-8 pt-3">
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
