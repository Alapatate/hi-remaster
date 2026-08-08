import { Text } from '@/components/ui/text';
import { InfoIcon } from 'lucide-react-native';
import * as React from 'react';
import {
  ImageBackground,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { teacherFlag, teacherFullName, teacherPhotoSource } from '../lib/data';
import type { Teacher } from '../lib/types';

/** Gap between adjacent cards so they read as separate cards while sliding. */
const GAP = 16;

/**
 * Horizontal pager of same-language teachers. Uses a native paging ScrollView so
 * the scroll position is owned by the OS (no JS/UI-thread races → no flash). All
 * cards — including the loop clones at each end — stay mounted, so every photo is
 * preloaded. Looping is a silent native jump from a clone to its identical real
 * card, which is invisible because they show the same teacher.
 */
export function TeacherHeroCard({
  teacher,
  langTeachers,
  onSelect,
  onInfo,
  style,
}: {
  teacher: Teacher;
  /** All same-language teachers, in a stable order; the pager loops within this. */
  langTeachers: Teacher[];
  /** Called when a swipe settles on a different teacher. */
  onSelect?: (t: Teacher) => void;
  onInfo?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const scrollRef = React.useRef<ScrollView>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const { w, h } = size;
  const stride = w + GAP;
  const canSwipe = langTeachers.length > 1;
  const n = langTeachers.length;

  // Clone the last teacher before the first and the first after the last so a
  // swipe past either end has a real card to slide to before we silently jump.
  const data = React.useMemo(() => {
    if (!canSwipe) return langTeachers;
    return [langTeachers[n - 1], ...langTeachers, langTeachers[0]];
  }, [langTeachers, canSwipe, n]);

  const realIndex = Math.max(
    0,
    langTeachers.findIndex((t) => t.$id === teacher.$id)
  );
  /** Scroll x for a real teacher index (leading clone shifts everything by one). */
  const offsetFor = (ri: number) => (canSwipe ? ri + 1 : ri) * stride;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== w || height !== h) setSize({ w: width, h: height });
  };

  // Keep the scroll aligned with the current teacher for external changes
  // (initial mount, picking from the sheet, restoring from prefs).
  React.useEffect(() => {
    if (w === 0) return;
    scrollRef.current?.scrollTo({ x: offsetFor(realIndex), animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, realIndex]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!canSwipe || w === 0) return;
    const page = Math.round(e.nativeEvent.contentOffset.x / stride); // 0..n+1
    let ri = page - 1;
    if (page === 0)
      ri = n - 1; // leading clone (last)
    else if (page === n + 1) ri = 0; // trailing clone (first)
    // Silent jump from a clone to its real counterpart (same photo → invisible).
    if (page === 0 || page === n + 1) {
      scrollRef.current?.scrollTo({ x: offsetFor(ri), animated: false });
    }
    const selected = langTeachers[ri];
    if (selected && selected.$id !== teacher.$id) onSelect?.(selected);
  };

  return (
    <View className="overflow-hidden" style={style} onLayout={onLayout}>
      {w > 0 ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          scrollEnabled={canSwipe}
          showsHorizontalScrollIndicator={false}
          snapToInterval={stride}
          snapToAlignment="start"
          disableIntervalMomentum
          decelerationRate="fast"
          contentOffset={{ x: offsetFor(realIndex), y: 0 }}
          onMomentumScrollEnd={onMomentumEnd}>
          {data.map((t, i) => (
            <View key={`${t.$id}-${i}`} style={{ width: w, height: h, marginRight: GAP }}>
              <TeacherCard teacher={t} />
            </View>
          ))}
        </ScrollView>
      ) : null}

      {/* Info button — fixed over the current card, outside the scroll. */}
      {onInfo ? (
        <TouchableOpacity
          onPress={onInfo}
          activeOpacity={0.8}
          className="absolute bottom-4 left-4 h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(247,241,227,0.92)' }}>
          <InfoIcon size={20} color="#bf6e1a" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

/** A single rounded teacher card: photo, name banner and flag. */
function TeacherCard({ teacher }: { teacher: Teacher }) {
  const flag = teacherFlag(teacher);
  return (
    <View className="flex-1 overflow-hidden rounded-3xl bg-card">
      <ImageBackground
        source={teacherPhotoSource(teacher)}
        style={{ flex: 1, minHeight: 180 }}
        resizeMode="cover">
        {/* Name banner */}
        <View className="absolute left-4 right-4 top-4 items-center py-3">
          <Text className="font-heading text-3xl uppercase tracking-wide text-white">
            {teacherFullName(teacher)}
          </Text>
        </View>

        {/* Country flag */}
        {flag ? (
          <View
            className="absolute bottom-4 right-4 h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(247,241,227,0.92)' }}>
            <Text style={{ fontSize: 24 }}>{flag}</Text>
          </View>
        ) : null}
      </ImageBackground>
    </View>
  );
}
