import type { Models } from 'react-native-appwrite';

/** A video's role within a session, in chronological order. */
export type VideoType = 'start' | 'core' | 'end';

export type Teacher = Models.Document & {
  firstname: string;
  lastname: string;
  lang: string;
  presentation?: string;
  /**
   * Optional media/meta fields. Resolution is centralized in `lib/data.ts`
   * (teacherPhotoSource / teacherFlag) so the exact attribute name can change
   * in one place once confirmed in Appwrite.
   */
  photo?: string;
  photoUrl?: string;
  image?: string;
  country?: string;
};

export type Video = Models.Document & {
  title: string;
  url?: string;
  duration?: number;
  type: VideoType;
  teacher?: Teacher;
};

/** A built session: an ordered list of videos for a given teacher. */
export type Session = {
  teacher: Teacher;
  videos: Video[];
  totalDuration: number;
};
