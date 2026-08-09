import * as React from 'react';
import { fetchTeachers, prefetchTeacherPhotos } from '../lib/data';
import type { Teacher } from '../lib/types';

type State = {
  teachers: Teacher[];
  loading: boolean;
  error: string;
  reload: () => void;
};

/** Loads the list of teachers once, with a manual reload. */
export function useTeachers(): State {
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const load = React.useCallback(() => {
    setLoading(true);
    setError('');
    fetchTeachers()
      .then((list) => {
        setTeachers(list);
        prefetchTeacherPhotos(list);
      })
      .catch((e: any) => setError(e?.message ?? 'Could not load teachers.'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return { teachers, loading, error, reload: load };
}
