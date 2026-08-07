import { Text } from '@/components/ui/text';
import * as React from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';

export const ITEM_HEIGHT = 46;
export const WHEEL_WIDTH = 84;
const VISIBLE_ITEMS = 5;
export const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PAD = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

/**
 * A snapping scroll column, the way a clock picker behaves: the value under the
 * centre band is the selection. Plain ScrollView rather than a virtualized list —
 * 24 or 60 short rows are cheap, and it keeps the snap maths exact.
 */
export function TimeWheel({
  values,
  value,
  onChange,
}: {
  values: number[];
  value: number;
  onChange: (value: number) => void;
}) {
  const ref = React.useRef<ScrollView>(null);
  /** Last value this wheel reported, so external updates and self-updates stay distinct. */
  const reported = React.useRef(value);
  const positioned = React.useRef(false);

  const offsetFor = React.useCallback(
    (v: number) => Math.max(0, values.indexOf(v)) * ITEM_HEIGHT,
    [values]
  );

  // Land on the initial value once the content has a measurable height.
  const handleContentSize = React.useCallback(() => {
    if (positioned.current) return;
    positioned.current = true;
    ref.current?.scrollTo({ y: offsetFor(value), animated: false });
  }, [offsetFor, value]);

  // Follow the value when it is changed from outside (a preset, or a reset).
  React.useEffect(() => {
    if (!positioned.current || reported.current === value) return;
    reported.current = value;
    ref.current?.scrollTo({ y: offsetFor(value), animated: false });
  }, [value, offsetFor]);

  const settle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const next = values[Math.min(values.length - 1, Math.max(0, index))];
    if (next === reported.current) return;
    reported.current = next;
    onChange(next);
  };

  return (
    <ScrollView
      ref={ref}
      style={{ height: WHEEL_HEIGHT, width: WHEEL_WIDTH }}
      contentContainerStyle={{ paddingVertical: PAD }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      nestedScrollEnabled
      onContentSizeChange={handleContentSize}
      onMomentumScrollEnd={settle}
      // A slow drag can end without momentum, which would otherwise leave the
      // wheel snapped to a value it never reported.
      onScrollEndDrag={settle}>
      {values.map((v) => {
        const distance = Math.abs(values.indexOf(v) - values.indexOf(value));
        const selected = distance === 0;
        return (
          <View key={v} style={{ height: ITEM_HEIGHT }} className="items-center justify-center">
            <Text
              className={`font-heading ${
                selected ? 'text-[30px] text-foreground' : 'text-[21px] text-muted-foreground'
              }`}
              // Neighbours dim with distance so the column reads as a wheel
              // rather than a flat list.
              style={{ opacity: selected ? 1 : distance === 1 ? 0.55 : 0.28 }}>
              {String(v).padStart(2, '0')}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
