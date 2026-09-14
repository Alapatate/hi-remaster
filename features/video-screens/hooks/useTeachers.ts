import { useAuth } from '@/lib/auth';
import * as React from 'react';
import { fetchTeachers, isCatTeacher, prefetchTeacherPhotos } from '../lib/data';
import type { Teacher } from '../lib/types';

type State = {
  teachers: Teacher[];
  loading: boolean;
  error: string;
  reload: () => void;
};

/**
 * Loads the list of teachers once, with a manual reload.
 *
 * The cat-mode teacher is filtered out of the result unless the account has the
 * easter egg switched on. Filtering here rather than at each call site means
 * the hero carousel, the picker and its language chips all agree on one roster.
 */
export function useTeachers(): State {
  const { user } = useAuth();
  const catMode = (user?.prefs as Record<string, unknown>)?.catMode === true;
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

  const visible = React.useMemo(
    () => (catMode ? teachers : teachers.filter((t) => !isCatTeacher(t))),
    [teachers, catMode]
  );

  return { teachers: visible, loading, error, reload: load };
}
