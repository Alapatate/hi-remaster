/**
 * The player overlay sits on video, not on the app's themed surfaces, so its
 * colours are fixed rather than theme-driven — taken from the Claude Design comp.
 */
export const PLAYER = {
  /** Primary text on the overlay. */
  text: '#f9f4ed',
  /** Secondary text: teacher, timings, labels. */
  textMuted: '#dcd3c4',
  /** The eyebrow above the title ("EXERCISE 2 OF 3"). */
  eyebrow: '#f6a06b',
  /** Filled controls and played progress. */
  accent: '#bf6e1a',
  /** Lighter accent used for the played portion of the track. */
  accentTrack: '#d98b3a',
  /** Circular control backgrounds. */
  chip: 'rgba(249,244,237,0.14)',
  /** Up-next card background. */
  card: 'rgba(249,244,237,0.12)',
  /** Unplayed track. */
  track: 'rgba(249,244,237,0.22)',
  /** Buffered-but-unplayed track. */
  trackBuffered: 'rgba(249,244,237,0.40)',
} as const;

/** Scrim geometry and stops, so the controls stay legible over any frame. */
export const SCRIM = {
  color: '#181614',
  topOpacity: 0.72,
  topHeight: 230,
  bottomHeight: 400,
} as const;
