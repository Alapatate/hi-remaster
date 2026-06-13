import type { Bird } from './types';

/**
 * PLACEHOLDER bird data — chosen at random to wire up the journey UI.
 * Real birds (names, art, descriptions, XP curve) will come from Appwrite
 * later, so everything content-related lives here, isolated from the screens.
 *
 * Order matters: `xpRequired` must be strictly increasing. The first waypoint
 * sits at 0 XP so a brand-new user always has an unlocked starting point.
 */
export const BIRDS: Bird[] = [
  {
    id: 'robin',
    name: 'European Robin',
    scientificName: 'Erithacus rubecula',
    emoji: '🐦',
    habitat: 'Woodland',
    description:
      'A small, round bird with a bright orange breast, famously bold around gardeners. Robins are highly territorial and sing year-round, even in winter.',
    funFact: 'Robins often follow gardeners to snatch worms turned up by the spade.',
    xpRequired: 0,
  },
  {
    id: 'kingfisher',
    name: 'Common Kingfisher',
    scientificName: 'Alcedo atthis',
    emoji: '🪶',
    habitat: 'Riverbanks',
    description:
      'A jewel-bright bird that hunts by diving headfirst into water to catch small fish. Its electric blue and orange plumage is unmistakable along slow rivers.',
    funFact: 'A kingfisher can dive and resurface with a fish in under a second.',
    xpRequired: 80,
  },
  {
    id: 'goldfinch',
    name: 'European Goldfinch',
    scientificName: 'Carduelis carduelis',
    emoji: '🐤',
    habitat: 'Meadows',
    description:
      'A delicate finch with a red face and golden wing bars. They feed on thistle and teasel seeds, often in cheerful, twittering flocks.',
    funFact: 'A flock of goldfinches is poetically called a "charm".',
    xpRequired: 180,
  },
  {
    id: 'owl',
    name: 'Tawny Owl',
    scientificName: 'Strix aluco',
    emoji: '🦉',
    habitat: 'Old forest',
    description:
      'A stocky, nocturnal owl best known for its haunting "twit-twoo" call — actually a duet between two birds. It hunts in near-total darkness.',
    funFact: 'Its asymmetric ears let it pinpoint prey by sound alone.',
    xpRequired: 320,
  },
  {
    id: 'swallow',
    name: 'Barn Swallow',
    scientificName: 'Hirundo rustica',
    emoji: '🕊️',
    habitat: 'Open sky',
    description:
      'A graceful aerial acrobat with a deeply forked tail, catching insects on the wing. Swallows migrate thousands of kilometres each year.',
    funFact: 'A single swallow can travel over 300 km in a day during migration.',
    xpRequired: 500,
  },
  {
    id: 'woodpecker',
    name: 'Great Spotted Woodpecker',
    scientificName: 'Dendrocopos major',
    emoji: '🐦‍⬛',
    habitat: 'Woodland',
    description:
      'A bold black-and-white bird with a flash of red, famous for drumming on tree trunks to mark territory and find insects under the bark.',
    funFact: 'Its skull has built-in shock absorbers to survive constant drumming.',
    xpRequired: 720,
  },
  {
    id: 'heron',
    name: 'Grey Heron',
    scientificName: 'Ardea cinerea',
    emoji: '🦢',
    habitat: 'Wetlands',
    description:
      'A tall, patient wader that stands motionless at the water’s edge before striking at fish with lightning speed. A familiar sight on lakes and rivers.',
    funFact: 'Herons fly with their neck folded into an S-shape, not stretched out.',
    xpRequired: 1000,
  },
  {
    id: 'eagle',
    name: 'Golden Eagle',
    scientificName: 'Aquila chrysaetos',
    emoji: '🦅',
    habitat: 'Mountains',
    description:
      'A powerful raptor of remote uplands, soaring on broad wings as it scans vast territories for prey. Long revered as a symbol of wild places.',
    funFact: 'A golden eagle can spot a rabbit from over three kilometres away.',
    xpRequired: 1350,
  },
  {
    id: 'kestrel',
    name: 'Common Kestrel',
    scientificName: 'Falco tinnunculus',
    emoji: '🪽',
    habitat: 'Grassland',
    description:
      'A small falcon famous for hovering on the spot above fields, head perfectly still, as it watches for voles in the grass below.',
    funFact: 'Kestrels can see ultraviolet light, tracking the urine trails of prey.',
    xpRequired: 1800,
  },
];
