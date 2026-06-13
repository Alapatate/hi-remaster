import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { pathSegments, type Point } from '../lib/layout';

/**
 * The winding trail drawn behind the waypoints. Completed segments (up to the
 * furthest unlocked waypoint) are stroked solid in the accent colour; upcoming
 * segments are drawn as a faint dashed line.
 */
export function JourneyPath({
  points,
  frontierIndex,
  width,
  height,
  doneColor,
  todoColor,
}: {
  points: Point[];
  frontierIndex: number;
  width: number;
  height: number;
  doneColor: string;
  todoColor: string;
}) {
  const segments = React.useMemo(() => pathSegments(points), [points]);

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none">
      {segments.map((d, i) => {
        // Segment i connects waypoint i -> i+1; it's "done" once its end is reached.
        const done = i + 1 <= frontierIndex;
        return (
          <Path
            key={i}
            d={d}
            fill="none"
            stroke={done ? doneColor : todoColor}
            strokeWidth={done ? 6 : 5}
            strokeLinecap="round"
            strokeDasharray={done ? undefined : [2, 14]}
            opacity={done ? 1 : 0.7}
          />
        );
      })}
    </Svg>
  );
}
