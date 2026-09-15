/**
 * A bird tied to a waypoint on the journey. Text lives in `lib/i18n.ts` and is
 * referenced by key, so it follows the account's language (and cat mode).
 */
export type Bird = {
  id: string;
  /** i18n key of the display name. */
  nameKey: string;
  /** i18n key of the description shown in the bird's detail sheet. */
  descriptionKey: string;
  /** Latin / scientific name, shown as a subtitle. The same in every language. */
  scientificName: string;
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
