import {
  DATABASE_ID,
  TEACHERS_COLLECTION_ID,
  VIDEOS_COLLECTION_ID,
  databases,
} from '@/lib/appwrite';
import i18n, { meowWord } from '@/lib/i18n';
import { flagEmoji, isCatLanguage, languageName } from '@/lib/langFlags';
import { Image } from 'react-native';
import { Query } from 'react-native-appwrite';
import type { Teacher, Video } from './types';

export const IS_CONFIGURED = Boolean(DATABASE_ID && VIDEOS_COLLECTION_ID);

// ─────────────────────────────────────────────────────────────
// Fetchers
// ─────────────────────────────────────────────────────────────

export async function fetchTeachers(): Promise<Teacher[]> {
  const res = await databases.listDocuments(DATABASE_ID, TEACHERS_COLLECTION_ID);
  return res.documents as unknown as Teacher[];
}

export async function fetchVideosByTeacher(teacherId: string): Promise<Video[]> {
  const res = await databases.listDocuments(DATABASE_ID, VIDEOS_COLLECTION_ID, [
    Query.equal('teacher', teacherId),
  ]);
  return res.documents as unknown as Video[];
}

export async function fetchVideo(id: string): Promise<Video> {
  const doc = await databases.getDocument(DATABASE_ID, VIDEOS_COLLECTION_ID, id, [
    Query.select(['*', 'teacher.*']),
  ]);
  return doc as unknown as Video;
}

// ─────────────────────────────────────────────────────────────
// Teacher media resolution
//
// NOTE: the exact Appwrite attribute names for the teacher photo and
// country are not yet confirmed. All resolution is funnelled through the
// two helpers below so wiring the real fields is a one-place change.
// Until then we fall back to bundled local photos keyed by first name.
// ─────────────────────────────────────────────────────────────

const LOCAL_TEACHER_PHOTOS: Record<string, ReturnType<typeof require>> = {
  rita: require('@/assets/images/rita.jpeg'),
  miguel: require('@/assets/images/miguelLH.jpeg'),
};

const FALLBACK_PHOTO = require('@/assets/images/phi.png');

/** Stable `{ uri }` objects — a fresh object each call makes Image remount/reload. */
const REMOTE_PHOTO_CACHE = new Map<string, { uri: string }>();

export function teacherPhotoSource(teacher?: Teacher) {
  const url = teacher?.profilepic;
  if (url && /^https?:\/\//.test(url)) {
    let cached = REMOTE_PHOTO_CACHE.get(url);
    if (!cached) {
      cached = { uri: url };
      REMOTE_PHOTO_CACHE.set(url, cached);
    }
    return cached;
  }
  const key = teacher?.firstname?.toLowerCase().trim() ?? '';
  return LOCAL_TEACHER_PHOTOS[key] ?? FALLBACK_PHOTO;
}

/** Kick off network fetch for every remote profile pic (fire-and-forget). */
export function prefetchTeacherPhotos(teachers: Teacher[]) {
  for (const t of teachers) {
    const src = teacherPhotoSource(t);
    if (typeof src === 'object' && 'uri' in src && typeof src.uri === 'string') {
      Image.prefetch(src.uri).catch(() => {});
    }
  }
}

/**
 * Instagram handle for a teacher, without the leading "@".
 *
 * PLACEHOLDER: the Appwrite documents do not carry `instagram` yet, so this
 * falls back to a handle derived from the name. Remove the fallback once the
 * field is populated — until then every teacher shows a plausible-looking but
 * unreal account.
 */
export function teacherInstagram(teacher?: Teacher): string | null {
  if (!teacher) return null;
  const stored = teacher.instagram?.trim().replace(/^@/, '');
  if (stored) return stored;
  const slug = `${teacher.firstname ?? ''}${teacher.lastname ?? ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
  return slug ? `${slug}.hi` : null;
}

/** Public profile URL for a handle. */
export function instagramUrl(handle: string): string {
  return `https://instagram.com/${handle}`;
}

/**
 * Whether this teacher is the cat-mode easter egg — hidden from the roster
 * unless the account has the mode switched on.
 */
export function isCatTeacher(teacher?: Teacher): boolean {
  return isCatLanguage(teacher?.lang);
}

/** Regional flag emoji derived from `lang` — a cat for the easter-egg teacher. */
export function teacherFlag(teacher?: Teacher): string {
  return flagEmoji(teacher?.lang ?? '');
}

/** Readable language name (no country code) derived from `lang`. */
export function teacherLanguage(teacher?: Teacher): string {
  // The easter-egg teacher speaks cat, and a cat says something different in
  // every language — so this label follows the reader rather than the record.
  if (isCatTeacher(teacher)) {
    const meow = meowWord(i18n.language);
    return `${meow[0].toUpperCase()}${meow.slice(1)}`;
  }
  return languageName(teacher?.lang ?? '');
}

export function teacherFullName(teacher?: Teacher): string {
  if (!teacher) return '';
  return `${teacher.firstname ?? ''} ${teacher.lastname ?? ''}`.trim();
}

// ─────────────────────────────────────────────────────────────
// Last session (continue-watching) — stored in account prefs.
// Keys are written by the player; isolated here for the same reason.
// ─────────────────────────────────────────────────────────────

export type LastSession = {
  videoId: string;
  sessionParam: string;
  teacherName: string;
  /** 0–100. */
  progress: number;
  /** Total session length in seconds. */
  totalSeconds: number;
  /** Playback position within `videoId`, in seconds, so resuming picks up where it stopped. */
  resumeAt: number;
};

export function readLastSession(prefs?: Record<string, unknown>): LastSession | null {
  if (!prefs) return null;
  const videoId = prefs.lastVideoId as string | undefined;
  if (!videoId) return null;
  return {
    videoId,
    sessionParam: (prefs.lastSessionParam as string) ?? '',
    teacherName: (prefs.lastSessionTeacher as string) ?? '',
    progress: Number(prefs.lastSessionProgress ?? 0),
    totalSeconds: Number(prefs.lastSessionTotal ?? 0),
    resumeAt: Number(prefs.lastSessionSeconds ?? 0) || 0,
  };
}
