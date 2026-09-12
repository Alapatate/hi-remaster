import type { Video } from './types';

/**
 * What to have within reach before a session starts. Fixed list, shown by the
 * tools popup on the way into the player — the exercises themselves do not
 * carry an equipment field in Appwrite, so this is the app's own checklist.
 */
export const SESSION_TOOLS = [
  { key: 'mat', emoji: '🧘', labelKey: 'toolMat' },
  { key: 'blanket', emoji: '🛋️', labelKey: 'toolBlanket' },
  { key: 'chair', emoji: '🪑', labelKey: 'toolChair' },
  { key: 'cushion', emoji: '🛏️', labelKey: 'toolCushion' },
] as const;

/**
 * `type_exercice` is free text typed by whoever fills the collection, so it
 * arrives with any casing, accents or a "savasana" spelling. Normalise before
 * matching rather than testing for one exact string.
 */
function normalize(value?: string): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');
}

/** Whether a single exercise is a Shavasana (both common spellings). */
export function isShavasana(video: Pick<Video, 'type_exercice'>): boolean {
  const value = normalize(video.type_exercice);
  return value.includes('shavasana') || value.includes('savasana');
}

/** Whether any exercise in the session is a Shavasana. */
export function hasShavasana(videos: Pick<Video, 'type_exercice'>[]): boolean {
  return videos.some(isShavasana);
}
