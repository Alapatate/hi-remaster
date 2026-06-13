import * as React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { pathSegments, type Point } from '../lib/layout';
import { scatterPebbles } from '../lib/scenery';

/**
 * The winding trail behind the waypoints. A wide dirt band runs the full length
 * with pebbles scattered across it; the accent "progress" line is drawn on top,
 * solid up to the furthest unlocked waypoint and dashed beyond it. Everything
 * past the discovered region (`cutoffY`) uses muted earth tones.
 */
export function JourneyPath({
  points,
  frontierIndex,
  width,
  height,
  cutoffY,
  doneColor,
  todoColor,
  dirt,
  dirtMuted,
}: {
  points: Point[];
  frontierIndex: number;
  width: number;
  height: number;
  cutoffY: number;
  doneColor: string;
  todoColor: string;
  dirt: { fill: string; edge: string; pebbleLight: string; pebbleDark: string };
  dirtMuted: { fill: string; edge: string; pebbleLight: string; pebbleDark: string };
}) {
  const segments = React.useMemo(() => pathSegments(points), [points]);
  const pebbles = React.useMemo(() => scatterPebbles(points), [points]);

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none">
      {/* Dirt band — darker edge then lighter fill; vivid on the discovered side. */}
      <G strokeLinecap="round" strokeLinejoin="round" fill="none">
        {segments.map((d, i) => {
          const done = i + 1 <= frontierIndex;
          const c = done ? dirt : dirtMuted;
          return <Path key={`e${i}`} d={d} stroke={c.edge} strokeWidth={30} />;
        })}
        {segments.map((d, i) => {
          const done = i + 1 <= frontierIndex;
          const c = done ? dirt : dirtMuted;
          return <Path key={`f${i}`} d={d} stroke={c.fill} strokeWidth={24} />;
        })}
      </G>

      {/* Pebbles, coloured by whether they sit in the discovered region. */}
      {pebbles.map((pb, i) => {
        const c = pb.y <= cutoffY ? dirt : dirtMuted;
        return (
          <Circle
            key={`p${i}`}
            cx={pb.x}
            cy={pb.y}
            r={pb.r}
            fill={pb.dark ? c.pebbleDark : c.pebbleLight}
          />
        );
      })}

      {/* Accent progress line. */}
      {segments.map((d, i) => {
        const done = i + 1 <= frontierIndex;
        return (
          <Path
            key={`a${i}`}
            d={d}
            fill="none"
            stroke={done ? doneColor : todoColor}
            strokeWidth={done ? 6 : 5}
            strokeLinecap="round"
            strokeDasharray={done ? undefined : [2, 14]}
            opacity={done ? 1 : 0.75}
          />
        );
      })}
    </Svg>
  );
}
