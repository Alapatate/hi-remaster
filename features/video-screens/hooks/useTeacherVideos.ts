import * as React from 'react';
import { fetchVideosByTeacher } from '../lib/data';
import type { Video } from '../lib/types';

type State = {
  videos: Video[];
  loading: boolean;
  error: string;
  reload: () => void;
};

/** Loads the videos for a given teacher, reloading when the id changes. */
export function useTeacherVideos(teacherId?: string): State {
  const [videos, setVideos] = React.useState<Video[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const load = React.useCallback(() => {
    if (!teacherId) {
      setVideos([]);
      return;
    }
    setLoading(true);
    setError('');
    fetchVideosByTeacher(teacherId)
      .then(setVideos)
      .catch((e: any) => setError(e?.message ?? 'Could not load videos.'))
      .finally(() => setLoading(false));
  }, [teacherId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return { videos, loading, error, reload: load };
}
