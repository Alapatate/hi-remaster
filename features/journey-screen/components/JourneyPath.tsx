import * as React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { pathSegments, type Point } from '../lib/layout';
import { scatterPebbles } from '../lib/scenery';

/**
 * The winding trail behind the waypoints. A wide dirt band runs the full length
 * with pebbles scattered across it; the accent "progress" line is drawn on top,
 * solid up to the furthest unlocked waypoint and dashed beyond it.
 */
export function JourneyPath({
  points,
  frontierIndex,
  width,
  height,
  doneColor,
  todoColor,
  dirtColor,
  dirtEdgeColor,
  pebbleLight,
  pebbleDark,
}: {
  points: Point[];
  frontierIndex: number;
  width: number;
  height: number;
  doneColor: string;
  todoColor: string;
  dirtColor: string;
  dirtEdgeColor: string;
  pebbleLight: string;
  pebbleDark: string;
}) {
  const segments = React.useMemo(() => pathSegments(points), [points]);
  const pebbles = React.useMemo(() => scatterPebbles(points), [points]);

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none">
      {/* Dirt band — darker edge then lighter fill for a soft border. */}
      <G fill="none" strokeLinecap="round" strokeLinejoin="round">
        {segments.map((d, i) => (
          <Path key={`e${i}`} d={d} stroke={dirtEdgeColor} strokeWidth={30} />
        ))}
        {segments.map((d, i) => (
          <Path key={`d${i}`} d={d} stroke={dirtColor} strokeWidth={24} />
        ))}
      </G>

      {/* Scattered pebbles sitting on the dirt. */}
      {pebbles.map((p, i) => (
        <Circle key={`p${i}`} cx={p.x} cy={p.y} r={p.r} fill={p.dark ? pebbleDark : pebbleLight} />
      ))}

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
