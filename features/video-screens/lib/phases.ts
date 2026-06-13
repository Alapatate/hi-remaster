import type { VideoType } from './types';

/** Chronological order phases are presented and played in. */
export const PHASE_ORDER: VideoType[] = ['start', 'core', 'end'];

export type PhaseConfig = {
  type: VideoType;
  /** Emoji shown next to the section title in the builder. */
  emoji: string;
  /** i18n key for the phase name (e.g. "Préparation"). */
  titleKey: string;
  /** i18n key for the phase subtitle (e.g. "Centrage et respiration"). */
  subtitleKey: string;
  /** Accent color for the phase dot / title. */
  color: string;
  /** Soft background tint for chips/badges of this phase. */
  tint: string;
};

export const PHASES: Record<VideoType, PhaseConfig> = {
  start: {
    type: 'start',
    emoji: '☀️',
    titleKey: 'phasePreparation',
    subtitleKey: 'phasePreparationSub',
    color: '#cf8a1d',
    tint: '#f3e9d2',
  },
  core: {
    type: 'core',
    emoji: '💚',
    titleKey: 'phasePractice',
    subtitleKey: 'phasePracticeSub',
    color: '#4f7d3f',
    tint: '#e6ecdb',
  },
  end: {
    type: 'end',
    emoji: '🌙',
    titleKey: 'phaseRelaxation',
    subtitleKey: 'phaseRelaxationSub',
    color: '#8a6cae',
    tint: '#ebe5f1',
  },
};

/** Group videos into their phase buckets, preserving input order. */
export function groupByPhase<T extends { type: VideoType }>(items: T[]): Record<VideoType, T[]> {
  const map: Record<VideoType, T[]> = { start: [], core: [], end: [] };
  for (const item of items) {
    const bucket = map[item.type];
    if (bucket) bucket.push(item);
  }
  return map;
}

/** Order a list of videos by phase (start → core → end), stable within a phase. */
export function orderByPhase<T extends { type: VideoType }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => PHASE_ORDER.indexOf(a.type) - PHASE_ORDER.indexOf(b.type)
  );
}
