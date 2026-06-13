/** Accent colours for the journey, kept in one place so the path, nodes and
 *  marker stay in sync. Mirrors the app's amber primary token. */
export const JOURNEY_COLORS = {
  light: {
    accent: '#bf6e1a',
    trailTodo: '#cbbfa6',
    marker: '#bf6e1a',
  },
  dark: {
    accent: '#d4a574',
    trailTodo: '#4a3f31',
    marker: '#d4a574',
  },
} as const;

export type JourneyPalette = (typeof JOURNEY_COLORS)['light'];
