import { useAuth } from '@/lib/auth';
import { useFocusEffect } from 'expo-router';
import * as React from 'react';
import { BIRDS } from '../lib/birds';
import type { Bird } from '../lib/types';

/** How long the XP count-up animation runs, in ms. */
const REVEAL_DURATION = 1500;

export type JourneyReveal = {
  /**
   * XP to display in the header. `null` until the fresh value is fetched, then
   * counts up from the last-seen value to the current total during a reveal.
   */
  displayXp: number | null;
  /** True while the count-up animation is running. */
  revealing: boolean;
  /** Next bird whose threshold was just crossed and awaits celebration. */
  pendingBird: Bird | null;
  /** Dismiss the current popup and advance to the next crossed bird, if any. */
  dismissBird: () => void;
};

/**
 * On every focus of the journey screen, fetches the freshest XP from the server,
 * animates the header value up from what the user last saw, and queues a popup
 * for each bird threshold crossed in between. The last-seen value is persisted
 * as `xpSeen` so progress is only ever revealed once.
 */
export function useJourneyReveal(): JourneyReveal {
  const { refreshUser, updatePrefs } = useAuth();
  const [displayXp, setDisplayXp] = React.useState<number | null>(null);
  const [revealing, setRevealing] = React.useState(false);
  const [queue, setQueue] = React.useState<Bird[]>([]);
  const rafRef = React.useRef<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;

      (async () => {
        const fresh = await refreshUser();
        if (cancelled || !fresh) return;

        const prefs = fresh.prefs as Record<string, unknown>;
        const target = Number(prefs?.xpPoints ?? 0) || 0;
        // First ever visit (no baseline) starts from the current total so we
        // don't replay the user's entire history as one giant animation.
        const seen = prefs?.xpSeen === undefined ? target : Number(prefs.xpSeen) || 0;

        // Nothing new to reveal: show the final value and stop.
        if (target <= seen) {
          setDisplayXp(target);
          return;
        }

        // Birds whose unlock threshold falls in (seen, target], oldest first.
        const crossed = BIRDS.filter((b) => b.xpRequired > seen && b.xpRequired <= target);

        setDisplayXp(seen);
        setRevealing(true);
        const start = Date.now();
        const step = () => {
          if (cancelled) return;
          const t = Math.min(1, (Date.now() - start) / REVEAL_DURATION);
          const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
          setDisplayXp(Math.round(seen + (target - seen) * eased));
          if (t < 1) {
            rafRef.current = requestAnimationFrame(step);
            return;
          }
          setDisplayXp(target);
          setRevealing(false);
          if (crossed.length) setQueue(crossed);
          updatePrefs({ xpSeen: target }).catch(() => {});
        };
        rafRef.current = requestAnimationFrame(step);
      })();

      return () => {
        cancelled = true;
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      };
    }, [refreshUser, updatePrefs])
  );

  const dismissBird = React.useCallback(() => setQueue((q) => q.slice(1)), []);

  return { displayXp, revealing, pendingBird: queue[0] ?? null, dismissBird };
}
