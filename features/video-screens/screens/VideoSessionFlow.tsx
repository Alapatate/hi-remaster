import { useBottomDockSpace } from '@/components/navigation/FloatingTabBar';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/lib/auth';
import { languageBase } from '@/lib/langFlags';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlayIcon,
  RotateCcwIcon,
  UsersIcon,
} from 'lucide-react-native';
import * as React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { Easing, FadeIn, FadeOut, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton } from '../components/ActionButton';
import { ImmersionHeader } from '../components/ImmersionHeader';
import { LastSessionCard } from '../components/LastSessionCard';
import { PhaseSection } from '../components/PhaseSection';
import { FooterTally, PillButton } from '../components/PillButton';
import { SessionRecapCard } from '../components/SessionRecapCard';
import { StepHeader } from '../components/StepHeader';
import { TeacherHeroCard } from '../components/TeacherHeroCard';
import { XpRewardNote } from '../components/XpRewardNote';
import { TeacherPickerSheet } from '../components/TeacherPickerSheet';
import { AboutTeacherSheet } from '../components/player/AboutTeacherSheet';
import { useTeachers } from '../hooks/useTeachers';
import { useTeacherVideos } from '../hooks/useTeacherVideos';
import { useJourney } from '@/features/journey-screen/hooks/useJourney';
import { IS_CONFIGURED, readLastSession, teacherFullName } from '../lib/data';
import { totalDuration } from '../lib/format';
import { orderByPhase, PHASES, PHASE_ORDER } from '../lib/phases';
import type { Video } from '../lib/types';

const FOOTER_HEIGHT = 80;
const FOOTER_LIFT = 4;

/** Shared style: absolute fill so entering/exiting steps overlap during crossfade. */
const FILL = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

const STEP_DURATION = 280;
const STEP_SLIDE = 44;
/** The incoming step waits until the outgoing one has mostly left to avoid overlap. */
const STEP_ENTER_DELAY = 210;

/**
 * Custom entering animation: stays invisible during `STEP_ENTER_DELAY` (so the
 * exiting step leaves first), then slides in from `dx` while fading + scaling up.
 */
function makeEnter(dx: number) {
  return () => {
    'worklet';
    const timing = { duration: STEP_DURATION, easing: Easing.out(Easing.cubic) };
    return {
      initialValues: { opacity: 0, transform: [{ translateX: dx }, { scale: 0.97 }] },
      animations: {
        opacity: withDelay(STEP_ENTER_DELAY, withTiming(1, timing)),
        transform: [
          { translateX: withDelay(STEP_ENTER_DELAY, withTiming(0, timing)) },
          { scale: withDelay(STEP_ENTER_DELAY, withTiming(1, timing)) },
        ],
      },
    };
  };
}

/** Custom exiting animation: slide out toward `dx` while fading + scaling down. */
function makeExit(dx: number) {
  return () => {
    'worklet';
    const timing = { duration: STEP_DURATION, easing: Easing.in(Easing.cubic) };
    return {
      initialValues: { opacity: 1, transform: [{ translateX: 0 }, { scale: 1 }] },
      animations: {
        opacity: withTiming(0, timing),
        transform: [{ translateX: withTiming(dx, timing) }, { scale: withTiming(0.97, timing) }],
      },
    };
  };
}

type Step = 1 | 2 | 3;

export function VideoSessionFlow() {
  const { t } = useTranslation();
  const { resetAt } = useLocalSearchParams<{ resetAt?: string }>();
  const { user, updatePrefs } = useAuth();
  const dockSpace = useBottomDockSpace();
  const { teachers, loading, error, reload } = useTeachers();
  const insets = useSafeAreaInsets();

  const [featuredIndex, setFeaturedIndex] = React.useState(0);
  const [step, setStep] = React.useState<Step>(1);
  const [direction, setDirection] = React.useState<'forward' | 'back'>('forward');
  const [selected, setSelected] = React.useState<Video[]>([]);
  const [incompleteVisible, setIncompleteVisible] = React.useState(false);

  // Navigate between steps while tracking direction so transitions slide the right way.
  const stepRef = React.useRef<Step>(step);
  stepRef.current = step;
  const go = React.useCallback((next: Step) => {
    setDirection(next >= stepRef.current ? 'forward' : 'back');
    setStep(next);
  }, []);

  // Restore last teacher from prefs once the list has loaded.
  const [teacherReady, setTeacherReady] = React.useState(false);
  React.useEffect(() => {
    if (teachers.length === 0) return;
    const lastTeacherId = (user?.prefs as Record<string, unknown>)?.lastTeacherId as
      | string
      | undefined;
    if (lastTeacherId) {
      const idx = teachers.findIndex((t) => t.$id === lastTeacherId);
      if (idx !== -1) setFeaturedIndex(idx);
    }
    setTeacherReady(true);
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

  // XP is awarded one per minute of playback, so the session is worth its own
  // length in minutes. The next bird is named only when this session actually
  // covers the XP still needed to reach it.
  const { width } = useWindowDimensions();
  const { waypoints, frontierIndex, xpToNext } = useJourney(width);
  const sessionXp = Math.floor(total / 60);
  const reachableBird =
    xpToNext > 0 && sessionXp >= xpToNext ? waypoints[frontierIndex + 1]?.bird.name : undefined;

  const goHome = React.useCallback(() => {
    go(1);
    setSelected([]);
  }, [go]);

  const lastResetAt = React.useRef<string | null>(null);
  useFocusEffect(
    React.useCallback(() => {
      if (!resetAt || resetAt === lastResetAt.current) return;
      lastResetAt.current = resetAt;
      goHome();
    }, [resetAt, goHome])
  );

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

  // Teachers sharing the current teacher's language — the swipe loops within this set.
  const sameLangTeachers = React.useMemo(() => {
    if (!teacher) return [];
    const base = languageBase(teacher.lang ?? '');
    return teachers.filter((x) => languageBase(x.lang ?? '') === base);
  }, [teachers, teacher]);

  // Switch to a specific teacher (driven by the hero pager's swipe).
  const selectTeacher = React.useCallback(
    (target: (typeof teachers)[number]) => {
      const idx = teachers.findIndex((x) => x.$id === target.$id);
      if (idx === -1) return;
      setFeaturedIndex(idx);
      setSelected([]);
      updatePrefs({ lastTeacherId: target.$id }).catch(() => {});
    },
    [teachers, updatePrefs]
  );

  // Phases that have available videos but no selection — triggers the warning popup.
  const missingPhases = React.useMemo(
    () =>
      PHASE_ORDER.filter(
        (type) => videos.some((v) => v.type === type) && !selected.some((v) => v.type === type)
      ),
    [videos, selected]
  );

  const handleNextStep = React.useCallback(() => {
    if (missingPhases.length > 0) {
      setIncompleteVisible(true);
    } else {
      go(3);
    }
  }, [missingPhases, go]);

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

  // Direction-aware step transitions: forward slides in from the right, back from the left.
  const stepEntering = makeEnter(direction === 'forward' ? STEP_SLIDE : -STEP_SLIDE);
  const stepExiting = makeExit(direction === 'forward' ? -STEP_SLIDE : STEP_SLIDE);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Step 1 keeps the full page header; the later steps collapse it into a
          single row so the grid and recap get the vertical space. */}
      {step === 1 ? (
        <Animated.View
          key="header-1"
          className="pt-2"
          entering={FadeIn.delay(STEP_ENTER_DELAY).duration(STEP_DURATION)}
          exiting={FadeOut.duration(STEP_DURATION)}>
          <ImmersionHeader />
        </Animated.View>
      ) : (
        <Animated.View
          key="step-header"
          className="pt-2"
          entering={FadeIn.delay(STEP_ENTER_DELAY).duration(STEP_DURATION)}
          exiting={FadeOut.duration(STEP_DURATION)}>
          <StepHeader
            current={step}
            total={3}
            onBack={() => go((step === 3 ? 2 : 1) as Step)}
          />
        </Animated.View>
      )}

      {/* Relative container so entering/exiting steps overlap during crossfade */}
      <View style={{ flex: 1, position: 'relative' }}>
        {loading || !teacherReady ? (
          <Animated.View key="loading" style={FILL} entering={FadeIn} exiting={FadeOut}>
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#bf6e1a" />
            </View>
          </Animated.View>
        ) : error ? (
          <Animated.View key="error" style={FILL} entering={FadeIn} exiting={FadeOut}>
            <ErrorState message={error} onRetry={reload} />
          </Animated.View>
        ) : !teacher ? (
          <Animated.View key="empty" style={FILL} entering={FadeIn} exiting={FadeOut}>
            <EmptyState message={t('noTeachers')} />
          </Animated.View>
        ) : step === 1 ? (
          <Animated.View
            key="step-1"
            className="bg-background"
            style={FILL}
            entering={stepEntering}
            exiting={stepExiting}>
            <View
              style={{
                flex: 1,
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: Math.max(dockSpace + 10, 20),
                gap: 12,
              }}>
              <TeacherHeroCard
                teacher={teacher}
                langTeachers={sameLangTeachers}
                onInfo={() => aboutRef.current?.present()}
                onSelect={selectTeacher}
                style={{ flex: 1 }}
              />
              <View className="flex-row gap-3">
                <ActionButton
                  className="flex-1"
                  label={t('practice')}
                  onPress={() => go(2)}
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
          <Animated.View
            key="step-2"
            className="bg-background"
            style={[FILL, { flexDirection: 'column' }]}
            entering={stepEntering}
            exiting={stepExiting}>
            <View className="px-5 pb-1 pt-3.5">
              <Text className="font-heading" style={{ fontSize: 27, lineHeight: 29 }}>
                {t('teacherLibrary', { name: teacherFullName(teacher) })}
              </Text>
              <Text
                className="mt-1 font-body text-muted-foreground"
                style={{ fontSize: 13.5, lineHeight: 19 }}>
                {t('libraryIntro', { count: videos.length })}
              </Text>
            </View>

            {videosLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#bf6e1a" />
              </View>
            ) : (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
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

            <FooterBar insetBottom={dockSpace}>
              <FooterTally
                caption={t('chosenCount', { count: selected.length })}
                seconds={total}
              />
              <PillButton
                className="flex-1"
                label={t('review')}
                disabled={selected.length === 0}
                onPress={handleNextStep}
                iconRight={<ArrowRightIcon size={18} color="white" />}
              />
            </FooterBar>
          </Animated.View>
        ) : (
          <Animated.View
            key="step-3"
            className="bg-background"
            style={[FILL, { flexDirection: 'column' }]}
            entering={stepEntering}
            exiting={stepExiting}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20, paddingBottom: 8, gap: 18 }}>
              <Text className="font-heading" style={{ fontSize: 34, lineHeight: 37 }}>
                {t('readyWhenYouAre')}
              </Text>

              <SessionRecapCard
                teacher={teacher}
                teacherName={teacherFullName(teacher)}
                videos={selected}
                total={total}
              />

              {sessionXp > 0 ? <XpRewardNote xp={sessionXp} nextBird={reachableBird} /> : null}
            </ScrollView>

            <FooterBar insetBottom={dockSpace} stacked>
              <PillButton
                label={t('startSession')}
                onPress={startSession}
                iconLeft={<PlayIcon size={18} color="white" fill="white" />}
              />
              <PillButton
                variant="outline"
                label={t('startNewSession')}
                onPress={goHome}
                iconLeft={<RotateCcwIcon size={16} color="#4a3826" />}
              />
            </FooterBar>
          </Animated.View>
        )}
      </View>

      <Modal
        visible={incompleteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIncompleteVisible(false)}>
        <Pressable
          onPress={() => setIncompleteVisible(false)}
          className="flex-1 items-center justify-center px-8"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Pressable
            onPress={() => {}}
            className="w-full max-w-sm rounded-3xl bg-card p-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 8,
            }}>
            <Text className="mb-1 text-xl font-bold text-foreground">
              {t('incompleteSessionTitle')}
            </Text>
            <Text className="mb-3 text-base text-muted-foreground">
              {t('incompleteSessionMessage')}
            </Text>
            <View className="mb-6 gap-1.5">
              {missingPhases.map((type) => (
                <View key={type} className="flex-row items-center gap-2">
                  <Text style={{ fontSize: 16 }}>{PHASES[type].emoji}</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {t(PHASES[type].titleKey)}
                  </Text>
                </View>
              ))}
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setIncompleteVisible(false)}
                activeOpacity={0.85}
                className="flex-1 items-center justify-center rounded-2xl bg-secondary px-4 py-3">
                <Text className="text-sm font-bold text-secondary-foreground">
                  {t('incompleteSessionBack')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIncompleteVisible(false);
                  go(3);
                }}
                activeOpacity={0.85}
                className="flex-1 items-center justify-center rounded-2xl px-4 py-3"
                style={{ backgroundColor: '#bf6e1a' }}>
                <Text className="text-sm font-bold text-white">
                  {t('incompleteSessionContinue')}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
  stacked = false,
}: {
  children: React.ReactNode;
  insetBottom?: number;
  /** Step 3 stacks its two CTAs; step 2 sits the tally beside its button. */
  stacked?: boolean;
}) {
  return (
    <View
      className={`mb-3 bg-background px-5 py-3 ${stacked ? 'gap-2.5' : 'flex-row items-center gap-3.5'}`}
      style={{ paddingBottom: insetBottom + FOOTER_LIFT }}>
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
