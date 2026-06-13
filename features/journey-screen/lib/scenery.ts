/** Deterministic placement of flat nature decorations along the trail.
 *  Pure functions, no React — the same XP/size always yields the same layout. */

import { NODE_R, SEGMENT_H, TOP_PAD, type Point } from './layout';

export type SceneryKind = 'pine' | 'bush' | 'grass' | 'rock' | 'flower' | 'pond';

export type SceneryItem = {
  kind: SceneryKind;
  x: number;
  y: number;
  scale: number;
  flip: boolean;
};

/** Small seeded PRNG (mulberry32) so scenery is stable across re-renders. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Path x at an arbitrary y, linearly interpolated between waypoints. */
function pathXAt(points: Point[], y: number): number {
  if (points.length === 0) return 0;
  const raw = (y - TOP_PAD) / SEGMENT_H;
  const i = Math.max(0, Math.min(points.length - 2, Math.floor(raw)));
  const a = points[i];
  const b = points[i + 1] ?? a;
  const t = Math.max(0, Math.min(1, raw - i));
  return a.x + (b.x - a.x) * t;
}

/** Pick a decoration kind from a weighted table. */
function pickKind(r: number): SceneryKind {
  if (r < 0.3) return 'grass';
  if (r < 0.52) return 'bush';
  if (r < 0.72) return 'pine';
  if (r < 0.86) return 'rock';
  if (r < 0.96) return 'flower';
  return 'pond';
}

const ROW_STEP = 74; // vertical spacing between decoration rows
const EDGE = 16; // keep clear of the screen edges
const CLEAR = NODE_R + 26; // keep clear of the trail / node on the path side
const MIN_GUTTER = 48; // need at least this much room to place anything

/**
 * Walk down the canvas placing 1–2 decorations per row in whichever gutter the
 * winding path leaves open, so greenery hugs the trail like a real walk.
 */
export function scatterScenery(points: Point[], width: number, height: number): SceneryItem[] {
  if (points.length < 2) return [];
  const rng = mulberry32(0x4a6f7572); // "Jour"
  const items: SceneryItem[] = [];

  for (let y = TOP_PAD - 6; y < height - 40; y += ROW_STEP) {
    const px = pathXAt(points, y);
    const leftGutter = px - CLEAR - EDGE;
    const rightGutter = width - EDGE - (px + CLEAR);

    const sides: ('left' | 'right')[] = [];
    if (leftGutter >= MIN_GUTTER) sides.push('left');
    if (rightGutter >= MIN_GUTTER) sides.push('right');
    if (sides.length === 0) continue;

    // Usually decorate the roomier side; occasionally both.
    const both = sides.length === 2 && rng() < 0.35;
    const chosen = both
      ? sides
      : [leftGutter >= rightGutter ? 'left' : ('right' as 'left' | 'right')];

    for (const side of chosen) {
      const lo = side === 'left' ? EDGE : px + CLEAR;
      const hi = side === 'left' ? px - CLEAR : width - EDGE;
      const span = hi - lo;
      if (span < 20) continue;

      const x = lo + 10 + rng() * (span - 20);
      const jitterY = y + (rng() - 0.5) * 22;
      items.push({
        kind: pickKind(rng()),
        x,
        y: jitterY,
        scale: 0.72 + rng() * 0.5,
        flip: rng() < 0.5,
      });
    }
  }

  return items;
}
