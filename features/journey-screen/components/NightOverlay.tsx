import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { scatterStars } from '../lib/scenery';

/** How far below the frontier the night reaches full depth (for star fade-in). */
const NIGHT_DEPTH = 260;

/**
 * Casts the undiscovered region into shadow / night. A vertical gradient runs
 * from fully transparent at the current position (`cutoffY`) to a deep night
 * tint further down, and a faint starfield fades in with depth. As the user
 * unlocks waypoints, `cutoffY` moves down and the world below is revealed.
 */
export function NightOverlay({
  width,
  height,
  cutoffY,
  colors,
  locations,
  starColor,
}: {
  width: number;
  height: number;
  cutoffY: number;
  colors: readonly string[];
  locations: readonly number[];
  starColor: string;
}) {
  const stars = React.useMemo(() => scatterStars(width, height), [width, height]);
  const veilHeight = Math.max(0, height - cutoffY);
  if (veilHeight <= 1) return null;

  return (
    <>
      <LinearGradient
        pointerEvents="none"
        // expo-linear-gradient wants a fixed-length tuple; our config is dynamic.
        colors={colors as unknown as readonly [string, string, ...string[]]}
        locations={locations as unknown as readonly [number, number, ...number[]]}
        style={{ position: 'absolute', left: 0, right: 0, top: cutoffY, height: veilHeight }}
      />
      <Svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
        pointerEvents="none">
        {stars.map((s, i) => {
          const depth = (s.y - cutoffY) / NIGHT_DEPTH;
          const opacity = Math.max(0, Math.min(0.9, depth)) * s.b;
          if (opacity <= 0.03) return null;
          return <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={starColor} opacity={opacity} />;
        })}
      </Svg>
    </>
  );
}
