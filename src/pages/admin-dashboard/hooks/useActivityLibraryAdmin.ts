import { useState, useEffect, useCallback } from 'react';
import { activityLibraryService, ActivityLibraryItem, categoryService, ExerciseCategory } from '../../../services/api';

export function useActivityLibraryAdmin() {
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState<ActivityLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Pagination
  const [includeInactive, setIncludeInactive] = useState(true);
  const [includeCustom, setIncludeCustom] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityLibraryItem | null>(null);

  // Load Categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await categoryService.getAll();
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategoryId(cats[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load categories', err);
        setError('Failed to load categories. Please try refreshing.');
      }
    }
    loadCategories();
  }, []);

  // Load Activities based on active filters
  const fetchActivities = useCallback(async () => {
    if (!selectedCategoryId) return;
    try {
      setLoading(true);
      setError(null);
      const items = await activityLibraryService.admin.getAll({
        categoryId: selectedCategoryId,
        search: searchQuery.trim() || undefined,
        includeInactive,
        includeCustom,
        limit: 100 // Admin views larger lists
      });
      setActivities(items);
    } catch (err: any) {
      console.error('Failed to fetch admin activities', err);
      setError(err?.message || 'Failed to fetch activities.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, searchQuery, includeInactive, includeCustom]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleSave = async (data: {
    name: string;
    categoryId: string;
    trackingType: string;
    tags: string[];
    difficulty?: string;
    isActive?: boolean;
  }) => {
    try {
      setError(null);
      if (editingActivity) {
        // Update activity
        await activityLibraryService.admin.update(editingActivity.id, data);
      } else {
        // Create activity
        await activityLibraryService.admin.create(data);
      }
      setModalOpen(false);
      setEditingActivity(null);
      fetchActivities();
    } catch (err: any) {
      console.error('Failed to save activity', err);
      throw err;
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setError(null);
      await activityLibraryService.admin.toggleStatus(id, !currentStatus);
      // Optimistic update
      setActivities(prev =>
        prev.map(item => (item.id === id ? { ...item, isActive: !currentStatus } : item))
      );
    } catch (err: any) {
      console.error('Failed to toggle activity status', err);
      setError(err?.message || 'Failed to update status.');
      fetchActivities();
    }
  };

  const handleOpenCreate = () => {
    setEditingActivity(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (activity: ActivityLibraryItem) => {
    setEditingActivity(activity);
    setModalOpen(true);
  };

  return {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    activities,
    loading,
    error,
    includeInactive,
    setIncludeInactive,
    includeCustom,
    setIncludeCustom,
    modalOpen,
    setModalOpen,
    editingActivity,
    handleSave,
    handleToggleStatus,
    handleOpenCreate,
    handleOpenEdit,
    refresh: fetchActivities
  };
}
