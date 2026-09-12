import type { Models } from 'react-native-appwrite';

/** A video's role within a session, in chronological order. */
export type VideoType = 'start' | 'core' | 'end';

export type Teacher = Models.Document & {
  firstname: string;
  lastname: string;
  lang?: string;
  presentation?: string;
  profilepic?: string;
  /** Instagram handle, with or without the leading "@". */
  instagram?: string;
};

export type Video = Models.Document & {
  title: string;
  url?: string;
  duration?: number;
  type: VideoType;
  /**
   * The posture family this exercise belongs to, as stored in Appwrite
   * (e.g. "shavasana"). Free text there, so never compare it raw — go through
   * the helpers in `./tools`.
   */
  type_exercice?: string;
  teacher?: Teacher;
};

/** A built session: an ordered list of videos for a given teacher. */
export type Session = {
  teacher: Teacher;
  videos: Video[];
  totalDuration: number;
};
