/** Accent colours for the journey, kept in one place so the path, nodes,
 *  marker and scenery stay in sync. Mirrors the app's amber primary token. */
export const JOURNEY_COLORS = {
  light: {
    accent: '#bf6e1a',
    trailTodo: '#cbbfa6',
    marker: '#bf6e1a',
    dirt: '#bfa06a',
    dirtEdge: '#a6854f',
    pebbleLight: '#e2d4b2',
    pebbleDark: '#8f7a55',
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
      grassZone: '#b9cf94',
      grassZoneHi: '#cadfa9',
    },
  },
  dark: {
    accent: '#d4a574',
    trailTodo: '#4a3f31',
    marker: '#d4a574',
    dirt: '#4a3d2a',
    dirtEdge: '#5c4d36',
    pebbleLight: '#6e5d42',
    pebbleDark: '#33291d',
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
      grassZone: '#36482a',
      grassZoneHi: '#425733',
    },
  },
} as const;

export type JourneyPalette = (typeof JOURNEY_COLORS)['light'];
/** Scenery colour keys with widened string values (light & dark share the shape). */
export type SceneryPalette = Record<keyof JourneyPalette['scenery'], string>;
