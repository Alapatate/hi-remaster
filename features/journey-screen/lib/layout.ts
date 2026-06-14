/** Geometry for the winding journey path. Pure functions, no React. */

export type Point = { x: number; y: number };

/** Radius of a waypoint node circle. */
export const NODE_R = 34;
/** Vertical distance between two consecutive waypoints. */
export const SEGMENT_H = 156;
/** Empty space above the first node and below the last. */
export const TOP_PAD = 48;
export const BOTTOM_PAD = 120;
/** Side gutters the path is kept within. */
export const SIDE_PAD = 28;

/**
 * Lay the waypoints out down the screen on an irregular, organic weave.
 * Two sine waves of different frequencies are summed so the path looks like a
 * real winding trail rather than a perfect, repeating S-curve. The horizontal
 * position is clamped so nodes never clip the screen edges.
 *
 * `topOffset` shifts every node down by that many pixels (used to push the
 * first node below a fixed header).
 */
export function journeyPositions(count: number, width: number, topOffset = 0): Point[] {
  const centerX = width / 2;
  const maxSwing = Math.max(0, centerX - SIDE_PAD - NODE_R);
  const a1 = maxSwing * 0.72;
  const a2 = maxSwing * 0.26;

  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const raw = centerX + a1 * Math.sin(i * 0.9 + 0.6) + a2 * Math.sin(i * 2.3 + 1.7);
    const x = Math.min(width - SIDE_PAD - NODE_R, Math.max(SIDE_PAD + NODE_R, raw));
    const y = TOP_PAD + topOffset + i * SEGMENT_H;
    points.push({ x, y });
  }
  return points;
}

/** Total height the scrollable journey canvas needs. */
export function journeyHeight(count: number, topOffset = 0): number {
  if (count === 0) return TOP_PAD + topOffset + BOTTOM_PAD;
  return TOP_PAD + topOffset + (count - 1) * SEGMENT_H + BOTTOM_PAD;
}

/** Linear interpolation between two points (used for the progress marker). */
export function lerpPoint(a: Point, b: Point, t: number): Point {
  const c = Math.min(1, Math.max(0, t));
  return { x: a.x + (b.x - a.x) * c, y: a.y + (b.y - a.y) * c };
}

/**
 * Build one smooth cubic-bezier segment per gap between consecutive points,
 * using a Catmull-Rom spline so the curve passes through every waypoint.
 * Returned as separate segments so each can be stroked independently
 * (completed vs. upcoming portions of the trail).
 */
export function pathSegments(points: Point[]): string[] {
  if (points.length < 2) return [];
  const segs: string[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };

    segs.push(
      `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`
    );
  }
  return segs;
}
