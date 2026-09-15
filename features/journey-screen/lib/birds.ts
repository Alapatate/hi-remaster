import type { Bird } from './types';

/**
 * The birds of the journey, in the order they are reached.
 *
 * Only language-independent data sits here: names and descriptions are the
 * `bird*` keys in `lib/i18n.ts`.
 *
 * Order matters: `xpRequired` must be strictly increasing. The first waypoint
 * sits at 1 XP so a brand-new account starts with nothing unlocked, and the
 * last stays at 1800 XP so the length of the whole journey is unchanged.
 */
export const BIRDS: Bird[] = [
  {
    id: 'blackGrouse',
    nameKey: 'birdBlackGrouse',
    descriptionKey: 'birdBlackGrouseDesc',
    scientificName: 'Lyrurus tetrix',
    xpRequired: 1,
  },
  {
    id: 'robin',
    nameKey: 'birdRobin',
    descriptionKey: 'birdRobinDesc',
    scientificName: 'Erithacus rubecula',
    xpRequired: 120,
  },
  {
    id: 'blackbird',
    nameKey: 'birdBlackbird',
    descriptionKey: 'birdBlackbirdDesc',
    scientificName: 'Turdus merula',
    xpRequired: 300,
  },
  {
    id: 'woodcock',
    nameKey: 'birdWoodcock',
    descriptionKey: 'birdWoodcockDesc',
    scientificName: 'Scolopax rusticola',
    xpRequired: 550,
  },
  {
    id: 'raven',
    nameKey: 'birdRaven',
    descriptionKey: 'birdRavenDesc',
    scientificName: 'Corvus corax',
    xpRequired: 850,
  },
  {
    id: 'curlew',
    nameKey: 'birdCurlew',
    descriptionKey: 'birdCurlewDesc',
    scientificName: 'Numenius arquata',
    xpRequired: 1250,
  },
  {
    id: 'gardenWarbler',
    nameKey: 'birdGardenWarbler',
    descriptionKey: 'birdGardenWarblerDesc',
    scientificName: 'Sylvia borin',
    xpRequired: 1800,
  },
];
