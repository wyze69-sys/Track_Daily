import { useState, useEffect } from 'react';
import {
  adminService,
  feedbackService,
  categoryService,
  templateService,
  AdminDashboardData,
  ExerciseCategory,
  WorkoutTemplate,
  Feedback
} from '../../../services/api';

interface UseAdminDashboardDataResult {
  data: AdminDashboardData | null;
  categories: ExerciseCategory[];
  templates: WorkoutTemplate[];
  feedbackQueue: Feedback[];
  loading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
  handleResolveFeedback: (id: string) => Promise<void>;
}

export function useAdminDashboardData(): UseAdminDashboardDataResult {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [feedbackQueue, setFeedbackQueue] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dbData, catList, tplList, fbList] = await Promise.all([
        adminService.getDashboard(),
        categoryService.getAll(),
        templateService.getAll(),
        feedbackService.getAll()
      ]);
      setData(dbData);
      setCategories(catList);
      setTemplates(tplList);
      setFeedbackQueue(fbList);
      setError(null);
    } catch (err) {
      console.error('Failed to load admin summary indicators', err);
      setError('Failed to load real data from backend API.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveFeedback = async (id: string) => {
    try {
      await feedbackService.updateStatus(id, 'reviewed');
      const [dbData, fbList] = await Promise.all([
        adminService.getDashboard(),
        feedbackService.getAll()
      ]);
      setData(dbData);
      setFeedbackQueue(fbList);
    } catch (err) {
      console.error('Failed to resolve feedback status', err);
      setError('Could not update feedback report status.');
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  return { data, categories, templates, feedbackQueue, loading, error, fetchDashboardData, handleResolveFeedback };
}
