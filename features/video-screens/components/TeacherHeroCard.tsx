import { Text } from '@/components/ui/text';
import { languageBase } from '@/lib/langFlags';
import { InfoIcon } from 'lucide-react-native';
import * as React from 'react';
import {
  FlatList,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
  ViewToken,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { teacherFlag, teacherFullName, teacherLanguage, teacherPhotoSource } from '../lib/data';
import type { Teacher } from '../lib/types';

/** Gap between adjacent cards. */
const GAP = 14;

/**
 * Horizontal teacher carousel (finite, with a peek of the next card).
 *
 * The resting card matches the page content width (same left/right edges as
 * the Practice / Change row). The next card peeks into the page's right gutter.
 *
 * Uses FlatList + getItemLayout so the restored/selected teacher is the one
 * you land on, keeps every card mounted so photos stay warm, and snaps with
 * normal momentum (no one-page-only locking) so swipes feel fluid.
 */
export function TeacherHeroCard({
  teacher,
  langTeachers,
  onSelect,
  onInfo,
  pagePadding = 20,
  style,
}: {
  teacher: Teacher;
  /** All same-language teachers, in a stable order. */
  langTeachers: Teacher[];
  /** Called when a swipe settles on a different teacher. */
  onSelect?: (t: Teacher) => void;
  onInfo?: () => void;
  /** Horizontal padding of the page this sits in, so the bleed can undo it. */
  pagePadding?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const listRef = React.useRef<FlatList<Teacher>>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const { w, h } = size;

  const count = langTeachers.length;
  const canSwipe = count > 1;
  // Full content width: aligns with the buttons below (pagePadding on each side).
  const cardWidth = Math.max(0, w - pagePadding * 2);
  const stride = cardWidth + GAP;
  const ready = cardWidth > 0 && h > 0;

  const index = React.useMemo(() => {
    const i = langTeachers.findIndex((t) => t.$id === teacher.$id);
    return i < 0 ? 0 : i;
  }, [langTeachers, teacher.$id]);

  // Remount only when the language set changes — not on every swipe.
  const listKey = languageBase(teacher.lang ?? '') || 'teachers';

  // Track what we last told the parent / scrolled to, so picker/prefs updates
  // sync the list without fighting an in-progress user swipe.
  const settledIdRef = React.useRef(teacher.$id);
  const draggingRef = React.useRef(false);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== w || height !== h) setSize({ w: width, h: height });
  };

  const scrollToIndex = React.useCallback(
    (i: number, animated = false) => {
      if (!ready || stride <= 0) return;
      listRef.current?.scrollToOffset({ offset: i * stride, animated });
    },
    [ready, stride]
  );

  // FlatList's initialScrollIndex is unreliable on Android — re-assert after layout
  // and whenever the language set remounts.
  React.useEffect(() => {
    if (!ready) return;
    const frame = requestAnimationFrame(() => {
      scrollToIndex(index, false);
      settledIdRef.current = teacher.$id;
    });
    return () => cancelAnimationFrame(frame);
    // Only when the list becomes measurable or remounts for a new language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, listKey, scrollToIndex]);

  // External selection (prefs restore, picker): jump without animation.
  React.useEffect(() => {
    if (!ready || draggingRef.current) return;
    if (teacher.$id === settledIdRef.current) return;
    settledIdRef.current = teacher.$id;
    scrollToIndex(index, false);
  }, [teacher.$id, index, ready, scrollToIndex]);

  const settleFromOffset = React.useCallback(
    (x: number) => {
      if (!canSwipe || stride <= 0) return;
      const next = Math.min(count - 1, Math.max(0, Math.round(x / stride)));
      const settled = langTeachers[next];
      if (!settled) return;
      settledIdRef.current = settled.$id;
      draggingRef.current = false;
      if (settled.$id !== teacher.$id) onSelect?.(settled);
    },
    [canSwipe, stride, count, langTeachers, teacher.$id, onSelect]
  );

  const onScrollBeginDrag = React.useCallback(() => {
    draggingRef.current = true;
  }, []);

  const onMomentumScrollEnd = React.useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      settleFromOffset(e.nativeEvent.contentOffset.x);
    },
    [settleFromOffset]
  );

  // Slow drag with no fling still needs to commit the snapped page.
  const onScrollEndDrag = React.useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const vx = e.nativeEvent.velocity?.x ?? 0;
      if (Math.abs(vx) < 0.15) settleFromOffset(e.nativeEvent.contentOffset.x);
    },
    [settleFromOffset]
  );

  const getItemLayout = React.useCallback(
    (_: ArrayLike<Teacher> | null | undefined, i: number) => ({
      length: i === count - 1 ? cardWidth : stride,
      offset: i * stride,
      index: i,
    }),
    [cardWidth, stride, count]
  );

  // Explicit offsets so snap never aims past the last card (which eats the end bounce).
  const snapToOffsets = React.useMemo(
    () => Array.from({ length: count }, (_, i) => i * stride),
    [count, stride]
  );

  const renderItem = React.useCallback(
    ({ item, index: i }: { item: Teacher; index: number }) => (
      <View
        style={{
          width: cardWidth,
          height: h,
          marginRight: i === count - 1 ? 0 : GAP,
        }}>
        <TeacherCard
          teacher={item}
          active={item.$id === teacher.$id}
          onInfo={item.$id === teacher.$id ? onInfo : undefined}
        />
      </View>
    ),
    [cardWidth, h, count, teacher.$id, onInfo]
  );

  // Keep dots in sync even mid-fling via viewability (optional polish).
  const [dotIndex, setDotIndex] = React.useState(index);
  React.useEffect(() => {
    setDotIndex(index);
  }, [index]);

  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems.find((v) => v.isViewable && v.index != null);
      if (first?.index != null) setDotIndex(first.index);
    }
  ).current;

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  return (
    <View style={[style, { marginHorizontal: -pagePadding }]}>
      <View style={{ flex: 1 }} className="overflow-hidden" onLayout={onLayout}>
        {ready ? (
          <FlatList
            key={listKey}
            ref={listRef}
            data={langTeachers}
            horizontal
            keyExtractor={(t) => t.$id}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            initialScrollIndex={index}
            // Soft snap onto each card; explicit offsets preserve end rubber-banding.
            snapToOffsets={snapToOffsets}
            decelerationRate="normal"
            bounces
            alwaysBounceHorizontal={canSwipe}
            overScrollMode="always"
            scrollEnabled={canSwipe}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: pagePadding, paddingRight: pagePadding }}
            onScrollBeginDrag={onScrollBeginDrag}
            onScrollEndDrag={onScrollEndDrag}
            onMomentumScrollEnd={onMomentumScrollEnd}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            // Small teacher lists — keep every photo mounted.
            removeClippedSubviews={false}
            initialNumToRender={count}
            maxToRenderPerBatch={count}
            windowSize={Math.max(count, 3)}
          />
        ) : null}
      </View>

      {canSwipe ? <PageDots count={count} index={dotIndex} /> : null}
    </View>
  );
}

function PageDots({ count, index }: { count: number; index: number }) {
  return (
    <View className="flex-row items-center justify-center pt-3" style={{ gap: 7 }}>
      {Array.from({ length: count }, (_, i) => {
        const active = i === index;
        return (
          <View
            key={i}
            className={active ? 'bg-primary' : 'bg-sand-dark'}
            style={{ width: active ? 22 : 7, height: 7, borderRadius: 999 }}
          />
        );
      })}
    </View>
  );
}

/**
 * Full-bleed photo with name / bio / language on a fading black scrim.
 * Active ring is an overlay so selection never relayouts the image.
 */
const TeacherCard = React.memo(function TeacherCard({
  teacher,
  active,
  onInfo,
}: {
  teacher: Teacher;
  active: boolean;
  onInfo?: () => void;
}) {
  const flag = teacherFlag(teacher);
  const language = teacherLanguage(teacher);
  const source = teacherPhotoSource(teacher);
  const subtitle = teacher.presentation?.trim();
  const gradId = `teacherScrim-${teacher.$id}`;
  const [scrimSize, setScrimSize] = React.useState({ w: 0, h: 0 });

  return (
    <View className="flex-1 overflow-hidden rounded-3xl bg-card">
      <Image
        source={source}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        resizeMode="cover"
      />

      {/* Bottom fade — transparent → black behind the copy. */}
      <View
        pointerEvents="none"
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width !== scrimSize.w || height !== scrimSize.h) {
            setScrimSize({ w: width, h: height });
          }
        }}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' }}>
        {scrimSize.w > 0 && scrimSize.h > 0 ? (
          <Svg width={scrimSize.w} height={scrimSize.h}>
            <Defs>
              <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#000" stopOpacity={0} />
                <Stop offset="0.45" stopColor="#000" stopOpacity={0.45} />
                <Stop offset="1" stopColor="#000" stopOpacity={0.88} />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width={scrimSize.w} height={scrimSize.h} fill={`url(#${gradId})`} />
          </Svg>
        ) : null}
      </View>

      {/* Name, subtitle, language + info */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-8" style={{ gap: 6 }}>
        <Text
          className="font-heading text-white"
          style={{ fontSize: 26, lineHeight: 28 }}
          numberOfLines={1}>
          {teacherFullName(teacher)}
        </Text>

        {subtitle ? (
          <Text
            className="font-body"
            style={{ fontSize: 14, lineHeight: 19, color: 'rgba(255,255,255,0.82)' }}
            numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}

        <View className="mt-0.5 min-h-11 flex-row items-center justify-between" style={{ gap: 12 }}>
          <View className="min-w-0 flex-1 flex-row items-center" style={{ gap: 8 }}>
            {flag ? <Text style={{ fontSize: 18 }}>{flag}</Text> : null}
            {language ? (
              <Text
                className="font-body font-semibold text-white"
                style={{ fontSize: 14, lineHeight: 18 }}
                numberOfLines={1}>
                {language}
              </Text>
            ) : null}
          </View>

          {onInfo ? (
            <Animated.View entering={FadeIn.duration(280)} exiting={FadeOut.duration(160)}>
              <TouchableOpacity
                onPress={onInfo}
                activeOpacity={0.8}
                className="h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <InfoIcon size={18} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          ) : null}
        </View>
      </View>

      {active ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 24,
            borderWidth: 2,
            borderColor: '#bf6e1a',
          }}
        />
      ) : null}
    </View>
  );
});
