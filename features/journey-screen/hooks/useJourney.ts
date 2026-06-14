import { useAuth } from '@/lib/auth';
import * as React from 'react';
import { BIRDS } from '../lib/birds';
import {
  journeyHeight,
  journeyPositions,
  lerpPoint,
  type Point,
} from '../lib/layout';
import type { Waypoint } from '../lib/types';

export type JourneyState = {
  /** Current XP read from Appwrite prefs (`xpPoints`). */
  xp: number;
  /** All waypoints with positions + unlock flags. */
  waypoints: Waypoint[];
  /** How many waypoints are unlocked (>= 1, the start is always open). */
  unlockedCount: number;
  /** Index of the furthest unlocked waypoint. */
  frontierIndex: number;
  /** 0..1 progress from the frontier toward the next waypoint. */
  progressToNext: number;
  /** XP still needed to reach the next waypoint (0 if fully complete). */
  xpToNext: number;
  /** Interpolated screen position of the "you are here" marker. */
  markerPosition: Point;
  /** Total height of the scrollable canvas. */
  canvasHeight: number;
};

/**
 * Reads `xpPoints` from the signed-in user and derives the whole journey layout.
 * `xpOverride` lets a caller drive the derivation from an animated value (used by
 * the header during the reveal) instead of the live prefs value.
 */
export function useJourney(width: number, topOffset = 0, xpOverride?: number): JourneyState {
  const { user } = useAuth();
  const contextXp = Number((user?.prefs as Record<string, unknown>)?.xpPoints ?? 0) || 0;
  const xp = xpOverride ?? contextXp;

  return React.useMemo(() => {
    const positions = journeyPositions(BIRDS.length, width, topOffset);
    const waypoints: Waypoint[] = BIRDS.map((bird, index) => ({
      bird,
      index,
      x: positions[index].x,
      y: positions[index].y,
      unlocked: xp >= bird.xpRequired,
    }));

    const unlockedCount = waypoints.filter((w) => w.unlocked).length || 1;
    const frontierIndex = unlockedCount - 1;
    const next = BIRDS[frontierIndex + 1];

    let progressToNext = 1;
    let xpToNext = 0;
    if (next) {
      const base = BIRDS[frontierIndex].xpRequired;
      const span = next.xpRequired - base;
      progressToNext = span > 0 ? Math.min(1, Math.max(0, (xp - base) / span)) : 0;
      xpToNext = Math.max(0, next.xpRequired - xp);
    }

    const from = positions[frontierIndex];
    const to = positions[frontierIndex + 1] ?? from;
    const markerPosition = lerpPoint(from, to, progressToNext);

    return {
      xp,
      waypoints,
      unlockedCount,
      frontierIndex,
      progressToNext,
      xpToNext,
      markerPosition,
      canvasHeight: journeyHeight(BIRDS.length, topOffset),
    };
  }, [xp, width, topOffset]);
}
