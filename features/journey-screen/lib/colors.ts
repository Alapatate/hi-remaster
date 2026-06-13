/** Colours for the journey. Two worlds: the **discovered** trail (vivid, alive)
 *  and everything **beyond** the current position (muted, awaiting discovery).
 *  Kept in one place so the path, nodes, marker and scenery stay in sync. */

const LIGHT_SCENERY = {
  leaf: '#86a361',
  leafDark: '#6b8a4a',
  leafHi: '#a6c47a',
  trunk: '#9c7a55',
  grass: '#7fa05c',
  rock: '#bcb29c',
  rockHi: '#cdc4b1',
  flower: '#e07a98',
  flower2: '#e0a14c',
  flowerCenter: '#f0d05a',
  mushroomCap: '#d9694e',
  mushroomStem: '#efe6d2',
  pond: '#7fb8c4',
  pondHi: '#aadbe4',
  grassZone: '#b9cf94',
  grassZoneHi: '#cadfa9',
};

const LIGHT_SCENERY_MUTED = {
  leaf: '#a6ab93',
  leafDark: '#8f9479',
  leafHi: '#bcbfa6',
  trunk: '#9c9381',
  grass: '#a0a78d',
  rock: '#b8b1a1',
  rockHi: '#c7c1b3',
  flower: '#bda9b0',
  flower2: '#c3b39a',
  flowerCenter: '#ccc5a8',
  mushroomCap: '#b8a59a',
  mushroomStem: '#ddd7c8',
  pond: '#aebcc0',
  pondHi: '#c8d2d4',
  grassZone: '#b6bca6',
  grassZoneHi: '#c6ccb8',
};

const DARK_SCENERY = {
  leaf: '#4d6b3a',
  leafDark: '#3c5530',
  leafHi: '#5f8347',
  trunk: '#6e5640',
  grass: '#4f6b3c',
  rock: '#5a5345',
  rockHi: '#6b6353',
  flower: '#a05c72',
  flower2: '#b07a3c',
  flowerCenter: '#c0a248',
  mushroomCap: '#a85542',
  mushroomStem: '#cfc4ad',
  pond: '#3f6168',
  pondHi: '#56808a',
  grassZone: '#36482a',
  grassZoneHi: '#425733',
};

const DARK_SCENERY_MUTED = {
  leaf: '#3f453a',
  leafDark: '#33382f',
  leafHi: '#4a503f',
  trunk: '#48413a',
  grass: '#41463b',
  rock: '#46443e',
  rockHi: '#54514a',
  flower: '#574c52',
  flower2: '#5a4f40',
  flowerCenter: '#5e5944',
  mushroomCap: '#564a44',
  mushroomStem: '#5a5446',
  pond: '#3a4548',
  pondHi: '#49565a',
  grassZone: '#363b31',
  grassZoneHi: '#414637',
};

export const JOURNEY_COLORS = {
  light: {
    accent: '#bf6e1a',
    trailTodo: '#cbbfa6',
    marker: '#bf6e1a',
    dirt: '#bfa06a',
    dirtEdge: '#a6854f',
    pebbleLight: '#e2d4b2',
    pebbleDark: '#8f7a55',
    dirtMuted: '#b0a791',
    dirtEdgeMuted: '#9c937e',
    pebbleLightMuted: '#cfc8b6',
    pebbleDarkMuted: '#9a9384',
    meadow: {
      base: '#e9f1da',
      blobs: ['#dde9c4', '#e3edcd', '#d2e2b4', '#cfe3c0'],
    },
    night: {
      stops: [
        { offset: 0, color: '#1e2d5c', opacity: 0 },
        { offset: 0.22, color: '#182a5a', opacity: 0.36 },
        { offset: 1, color: '#0a1640', opacity: 0.68 },
      ],
      star: '#f4f5ff',
    },
    scenery: LIGHT_SCENERY,
    sceneryMuted: LIGHT_SCENERY_MUTED,
  },
  dark: {
    accent: '#d4a574',
    trailTodo: '#4a3f31',
    marker: '#d4a574',
    dirt: '#4a3d2a',
    dirtEdge: '#5c4d36',
    pebbleLight: '#6e5d42',
    pebbleDark: '#33291d',
    dirtMuted: '#3c352a',
    dirtEdgeMuted: '#4a4236',
    pebbleLightMuted: '#534b3e',
    pebbleDarkMuted: '#2c271f',
    meadow: {
      base: '#161c11',
      blobs: ['#1f2915', '#1b2412', '#26331a', '#202c18'],
    },
    night: {
      stops: [
        { offset: 0, color: '#0b1538', opacity: 0 },
        { offset: 0.2, color: '#0b1538', opacity: 0.48 },
        { offset: 1, color: '#060e2a', opacity: 0.8 },
      ],
      star: '#cfe0ff',
    },
    scenery: DARK_SCENERY,
    sceneryMuted: DARK_SCENERY_MUTED,
  },
} as const;

export type JourneyPalette = (typeof JOURNEY_COLORS)['light'];
/** Scenery colour keys with widened string values (vivid & muted share the shape). */
export type SceneryPalette = Record<keyof typeof LIGHT_SCENERY, string>;
