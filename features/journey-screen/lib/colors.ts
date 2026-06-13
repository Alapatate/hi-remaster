/** Accent colours for the journey, kept in one place so the path, nodes,
 *  marker and scenery stay in sync. Mirrors the app's amber primary token. */
export const JOURNEY_COLORS = {
  light: {
    accent: '#bf6e1a',
    trailTodo: '#cbbfa6',
    marker: '#bf6e1a',
    scenery: {
      leaf: '#86a361',
      leafDark: '#6b8a4a',
      trunk: '#9c7a55',
      grass: '#7fa05c',
      rock: '#bcb29c',
      rockHi: '#cdc4b1',
      flower: '#d98aa0',
      flowerCenter: '#e8c45a',
      pond: '#9cc3cc',
      pondHi: '#bfe0e6',
    },
  },
  dark: {
    accent: '#d4a574',
    trailTodo: '#4a3f31',
    marker: '#d4a574',
    scenery: {
      leaf: '#4d6b3a',
      leafDark: '#3c5530',
      trunk: '#6e5640',
      grass: '#4f6b3c',
      rock: '#5a5345',
      rockHi: '#6b6353',
      flower: '#9c6678',
      flowerCenter: '#b89a4a',
      pond: '#3a5258',
      pondHi: '#4d6b72',
    },
  },
} as const;

export type JourneyPalette = (typeof JOURNEY_COLORS)['light'];
/** Scenery colour keys with widened string values (light & dark share the shape). */
export type SceneryPalette = Record<keyof JourneyPalette['scenery'], string>;
