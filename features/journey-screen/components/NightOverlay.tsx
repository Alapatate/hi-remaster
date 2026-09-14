import * as React from 'react';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { SvgLayer } from './SvgLayer';
import { scatterStars } from '../lib/scenery';

/** How far below the frontier the night reaches full depth (for star fade-in). */
const NIGHT_DEPTH = 260;

export type NightStop = { offset: number; color: string; opacity: number };

/**
 * Casts the undiscovered region into shadow / night. A vertical gradient runs
 * from fully transparent at the current position (`cutoffY`) to a deep night
 * tint further down, and a faint starfield fades in with depth. As the user
 * unlocks waypoints, `cutoffY` moves down and the world below is revealed.
 *
 * Uses an SVG gradient (no native module) so it works in any dev client.
 */
export function NightOverlay({
  width,
  height,
  cutoffY,
  stops,
  starColor,
}: {
  width: number;
  height: number;
  cutoffY: number;
  stops: readonly NightStop[];
  starColor: string;
}) {
  const stars = React.useMemo(() => scatterStars(width, height), [width, height]);
  const veilHeight = Math.max(0, height - cutoffY);
  if (veilHeight <= 1) return null;

  return (
    <SvgLayer>
      <Svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
        pointerEvents="none">
        <Defs>
          {/* Gradient mapped to the veil rect (objectBoundingBox: y 0→1). */}
          <LinearGradient id="journeyNight" x1="0" y1="0" x2="0" y2="1">
            {stops.map((s, i) => (
              <Stop key={i} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity} />
            ))}
          </LinearGradient>
        </Defs>

        <Rect x={0} y={cutoffY} width={width} height={veilHeight} fill="url(#journeyNight)" />

        {stars.map((s, i) => {
          const depth = (s.y - cutoffY) / NIGHT_DEPTH;
          const opacity = Math.max(0, Math.min(0.9, depth)) * s.b;
          if (opacity <= 0.03) return null;
          return <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={starColor} opacity={opacity} />;
        })}
      </Svg>
    </SvgLayer>
  );
}
