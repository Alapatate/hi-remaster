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
  /** Dark-scheme accent — the light one is too dark to read on a dark ground. */
  colorDark: string;
  /** Dark-scheme tint — deep enough for the cream foreground to sit on it. */
  tintDark: string;
};

export const PHASES: Record<VideoType, PhaseConfig> = {
  start: {
    type: 'start',
    emoji: '☀️',
    titleKey: 'phasePreparation',
    subtitleKey: 'phasePreparationSub',
    color: '#cf8a1d',
    tint: '#f3e9d2',
    colorDark: '#e3a93f',
    tintDark: '#3a2e1a',
  },
  core: {
    type: 'core',
    emoji: '💚',
    titleKey: 'phasePractice',
    subtitleKey: 'phasePracticeSub',
    color: '#4f7d3f',
    tint: '#e6ecdb',
    colorDark: '#8ab873',
    tintDark: '#25301f',
  },
  end: {
    type: 'end',
    emoji: '🌙',
    titleKey: 'phaseRelaxation',
    subtitleKey: 'phaseRelaxationSub',
    color: '#8a6cae',
    tint: '#ebe5f1',
    colorDark: '#b69ad6',
    tintDark: '#2d2739',
  },
};

/**
 * The phase's accent and tint for the active colour scheme.
 *
 * The light tints are pale pastels: leaving them in place under a dark theme
 * puts the cream foreground on a near-white card, which is unreadable. The dark
 * pair keeps the same phase identity at inverted lightness.
 */
export function phasePalette(type: VideoType, dark: boolean): { color: string; tint: string } {
  const phase = PHASES[type];
  if (!phase)
    return dark ? { color: '#d9832a', tint: '#332a20' } : { color: '#bf6e1a', tint: '#f3e9d2' };
  return dark
    ? { color: phase.colorDark, tint: phase.tintDark }
    : { color: phase.color, tint: phase.tint };
}

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
  return [...items].sort((a, b) => PHASE_ORDER.indexOf(a.type) - PHASE_ORDER.indexOf(b.type));
}
