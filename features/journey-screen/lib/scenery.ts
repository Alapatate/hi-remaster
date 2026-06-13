/** Deterministic placement of flat nature decorations along the trail.
 *  Pure functions, no React — the same XP/size always yields the same layout. */

import { NODE_R, SEGMENT_H, TOP_PAD, type Point } from './layout';

export type SceneryKind =
  | 'pine'
  | 'tree'
  | 'bush'
  | 'grass'
  | 'rock'
  | 'flower'
  | 'mushroom'
  | 'butterfly'
  | 'pond';

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
  if (r < 0.2) return 'grass';
  if (r < 0.34) return 'bush';
  if (r < 0.46) return 'pine';
  if (r < 0.58) return 'tree';
  if (r < 0.7) return 'flower';
  if (r < 0.79) return 'rock';
  if (r < 0.86) return 'mushroom';
  if (r < 0.92) return 'butterfly';
  return 'pond';
}

/** A soft watercolor splotch making up the uneven prairie background. */
export type Splotch = { x: number; y: number; d: string; tone: number };

/**
 * Scatter large, overlapping translucent blobs across the whole canvas to fake
 * an uneven, hand-painted meadow wash. Edges run off-canvas so the colour
 * bleeds to the borders. `toneCount` is how many tints the caller will cycle.
 */
export function scatterMeadow(width: number, height: number, toneCount: number): Splotch[] {
  const rng = mulberry32(0x4d656164); // "Mead"
  const out: Splotch[] = [];
  const step = 104;

  for (let y = -20; y < height + 20; y += step) {
    const perRow = 2 + (rng() < 0.5 ? 1 : 0);
    for (let k = 0; k < perRow; k++) {
      const rx = 60 + rng() * 70;
      const ry = 46 + rng() * 44;
      out.push({
        x: rng() * width,
        y: y + (rng() - 0.5) * 60,
        d: blobPath(rx, ry, rng),
        tone: Math.floor(rng() * toneCount),
      });
    }
  }

  return out;
}

/** A star in the night sky over the undiscovered region. `b` is base brightness. */
export type Star = { x: number; y: number; r: number; b: number };

/** Sprinkle a faint starfield across the canvas; only those deep in the unlit
 *  region are actually shown (the overlay fades them in by depth). */
export function scatterStars(width: number, height: number): Star[] {
  const rng = mulberry32(0x53746172); // "Star"
  const count = Math.floor((width * height) / 8200);
  const out: Star[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      x: rng() * width,
      y: rng() * height,
      r: 0.6 + rng() * 1.2,
      b: 0.5 + rng() * 0.5,
    });
  }
  return out;
}

/** A pebble scattered on the dirt trail. */
export type Pebble = { x: number; y: number; r: number; dark: boolean };

/** Half-width of the dirt band; pebbles stay within this perpendicular offset. */
const PEBBLE_OFFSET = 11;

/**
 * Sprinkle small pebbles roughly along the trail. Sampled per chord between
 * waypoints (the curve stays close to its chord) and nudged perpendicular so
 * they sit across the dirt band rather than on the centre line.
 */
export function scatterPebbles(points: Point[]): Pebble[] {
  if (points.length < 2) return [];
  const rng = mulberry32(0x50656262); // "Pebb"
  const step = 19;
  const out: Pebble[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const perpX = -dy / len;
    const perpY = dx / len;
    const count = Math.max(1, Math.floor(len / step));

    for (let s = 0; s < count; s++) {
      if (rng() < 0.32) continue; // leave gaps
      const t = (s + rng()) / count;
      const off = (rng() * 2 - 1) * PEBBLE_OFFSET;
      out.push({
        x: a.x + dx * t + perpX * off,
        y: a.y + dy * t + perpY * off,
        r: 1.4 + rng() * 1.8,
        dark: rng() < 0.45,
      });
    }
  }

  return out;
}

/** A large background region the trail passes by (water or a grassy clearing). */
export type ZoneKind = 'lake' | 'grass';
export type ZoneItem = {
  kind: ZoneKind;
  x: number;
  y: number;
  /** Closed organic blob path, centred on the origin (placed via transform). */
  d: string;
};

/** Build a smooth, irregular closed blob centred at the origin (Catmull-Rom). */
export function blobPath(rx: number, ry: number, rng: () => number): string {
  const n = 9;
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const j = 0.76 + rng() * 0.4;
    pts.push({ x: Math.cos(a) * rx * j, y: Math.sin(a) * ry * j });
  }
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return `${d} Z`;
}

const ZONE_GUTTER = 92; // minimum open gutter to drop a zone into
const LAKE_GUTTER = 150; // a lake needs a roomier gutter than a grassy patch

/**
 * Sparse large background regions — lakes and grassy clearings — dropped into
 * whichever gutter is widest as the trail winds down. Far fewer than the small
 * sprites, and drawn behind everything else.
 */
export function scatterZones(points: Point[], width: number, height: number): ZoneItem[] {
  if (points.length < 2) return [];
  const rng = mulberry32(0x4c616b65); // "Lake"
  const zones: ZoneItem[] = [];

  let y = TOP_PAD + 50;
  while (y < height - 70) {
    const px = pathXAt(points, y);
    const leftW = px - CLEAR - EDGE;
    const rightW = width - EDGE - (px + CLEAR);
    const side: 'left' | 'right' = leftW >= rightW ? 'left' : 'right';
    const gutter = Math.max(leftW, rightW);

    if (gutter >= ZONE_GUTTER) {
      const cx = side === 'left' ? EDGE + gutter / 2 : px + CLEAR + gutter / 2;
      const isLake = gutter >= LAKE_GUTTER && rng() < 0.5;
      const rx = Math.min(gutter / 2 - 6, isLake ? 66 : 54) * (0.85 + rng() * 0.3);
      const ry = (isLake ? 24 : 30) * (0.85 + rng() * 0.3);
      zones.push({ kind: isLake ? 'lake' : 'grass', x: cx, y, d: blobPath(rx, ry, rng) });
    }

    y += 196 + rng() * 70;
  }

  return zones;
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
