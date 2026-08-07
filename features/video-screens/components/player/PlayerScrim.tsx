import { useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { SCRIM } from './playerTheme';

/**
 * Gradient scrims top and bottom. Replaces a flat wash so the middle of the
 * frame stays clear while the controls keep their contrast.
 *
 * Drawn with react-native-svg, which the journey screen already relies on. An
 * expo-linear-gradient version of this rendered nothing on the device, and
 * react-native-svg is the path already proven in this app.
 *
 * Sized from useWindowDimensions rather than absolute insets so the gradient
 * rects have a real box to resolve against.
 * Non-interactive — taps fall through to the layer below.
 */
export function PlayerScrim() {
  const { width, height } = useWindowDimensions();
  const bottomTop = Math.max(0, height - SCRIM.bottomHeight);

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none">
      <Defs>
        <LinearGradient id="playerScrimTop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={SCRIM.color} stopOpacity={SCRIM.topOpacity} />
          <Stop offset="1" stopColor={SCRIM.color} stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="playerScrimBottom" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={SCRIM.color} stopOpacity={0} />
          <Stop offset="0.58" stopColor={SCRIM.color} stopOpacity={0.55} />
          <Stop offset="1" stopColor={SCRIM.color} stopOpacity={0.86} />
        </LinearGradient>
      </Defs>

      <Rect x={0} y={0} width={width} height={SCRIM.topHeight} fill="url(#playerScrimTop)" />
      <Rect
        x={0}
        y={bottomTop}
        width={width}
        height={SCRIM.bottomHeight}
        fill="url(#playerScrimBottom)"
      />
    </Svg>
  );
}
