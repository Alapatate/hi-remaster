/** A bird tied to a waypoint on the journey. Content is placeholder for now
 *  and will be sourced from Appwrite in a later iteration. */
export type Bird = {
  id: string;
  /** Display name. */
  name: string;
  /** Latin / scientific name, shown as a subtitle. */
  scientificName: string;
  /** Emoji used as the node glyph until real artwork is wired in. */
  emoji: string;
  /** Short habitat label (one or two words). */
  habitat: string;
  /** A couple of sentences describing the bird. */
  description: string;
  /** A single light "did you know" line. */
  funFact: string;
  /** Total XP the user must reach for this waypoint to unlock. */
  xpRequired: number;
};

/** A bird placed on the path with its computed screen position + unlock state. */
export type Waypoint = {
  bird: Bird;
  index: number;
  x: number;
  y: number;
  unlocked: boolean;
};
