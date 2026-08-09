import {
  DATABASE_ID,
  TEACHERS_COLLECTION_ID,
  VIDEOS_COLLECTION_ID,
  databases,
} from '@/lib/appwrite';
import { flagEmoji, languageName } from '@/lib/langFlags';
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

/** Regional flag emoji derived from `lang`. */
export function teacherFlag(teacher?: Teacher): string {
  return flagEmoji(teacher?.lang ?? '');
}

/** Readable language name (no country code) derived from `lang`. */
export function teacherLanguage(teacher?: Teacher): string {
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
  };
}
