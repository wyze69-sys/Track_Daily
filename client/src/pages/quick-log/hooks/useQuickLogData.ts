import { useState, useEffect } from 'react';
import {
  categoryService,
  templateService,
  exerciseLibraryService,
  ExerciseCategory,
  WorkoutTemplate,
  ExerciseLibraryItem
} from '../../../services/api';

interface UseQuickLogDataResult {
  categories: ExerciseCategory[];
  templates: WorkoutTemplate[];
  library: ExerciseLibraryItem[];
  loading: boolean;
  error: string | null;
}

export function useQuickLogData(): UseQuickLogDataResult {
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [library, setLibrary] = useState<ExerciseLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormOptions() {
      try {
        const [cats, tpls, exercises] = await Promise.all([
          categoryService.getAll(),
          templateService.getAll(),
          exerciseLibraryService.getAll()
        ]);
        setCategories(cats);
        setTemplates(tpls);
        setLibrary(exercises);
      } catch (err) {
        console.error('Failed to load log form options', err);
        setError('Could not load exercise options. Try refreshing the page.');
      } finally {
        setLoading(false);
      }
    }
    loadFormOptions();
  }, []);

  return { categories, templates, library, loading, error };
}
