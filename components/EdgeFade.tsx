import { useColorScheme } from 'nativewind';
import { useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/**
 * `THEME.background` in hex: react-native-svg does not parse the
 * space-separated `hsl()` syntax the theme is written in.
 */
const BACKGROUND = { light: '#E9E3D2', dark: '#1D1A16' };

/**
 * Fades scrolling content into the page background along a screen edge, so it
 * never runs under the status bar or a floating bar. `solid` is the band at the
 * very edge that stays fully opaque, before the fade begins.
 */
export function EdgeFade({
  edge,
  height,
  solid = 0,
}: {
  edge: 'top' | 'bottom';
  height: number;
  solid?: number;
}) {
  const { width } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const color = BACKGROUND[colorScheme === 'dark' ? 'dark' : 'light'];
  const id = `edgeFade-${edge}`;
  const solidStop = Math.min(1, solid / height);
  const top = edge === 'top';

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, height, [edge]: 0 }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={id} x1="0" y1={top ? '0' : '1'} x2="0" y2={top ? '1' : '0'}>
            <Stop offset="0" stopColor={color} stopOpacity={1} />
            <Stop offset={solidStop} stopColor={color} stopOpacity={1} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
