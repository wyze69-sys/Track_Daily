import { useState, useEffect } from 'react';
import { activityLibraryService, ActivityLibraryItem, ExerciseCategory } from '../../../services/api';

export interface UseActivityLibraryResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  suggestions: ActivityLibraryItem[];
  searchResults: ActivityLibraryItem[];
  loading: boolean;
  error: string | null;
  createCustomActivity: (name: string, categoryId: string) => Promise<ActivityLibraryItem>;
}

export function useActivityLibrary(activeCategory: ExerciseCategory | undefined): UseActivityLibraryResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ActivityLibraryItem[]>([]);
  const [searchResults, setSearchResults] = useState<ActivityLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch 8-12 suggestions for activeCategory when category changes
  useEffect(() => {
    if (!activeCategory) return;
    
    let isMounted = true;
    async function loadSuggestions() {
      try {
        setLoading(true);
        setError(null);
        // Fetch up to 12 items for this category as suggestions
        const items = await activityLibraryService.getAll({
          categoryId: activeCategory.id,
          limit: 12
        });
        if (isMounted) {
          setSuggestions(items);
        }
      } catch (err: any) {
        console.error('Failed to load activity suggestions', err);
        // Do not crash the UI; fallback to empty suggestions
        if (isMounted) {
          setSuggestions([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSuggestions();
    return () => {
      isMounted = false;
    };
  }, [activeCategory?.id]);

  // Debounced search when search query changes
  useEffect(() => {
    if (!activeCategory) return;
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    let isMounted = true;
    const searchTimeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await activityLibraryService.getAll({
          categoryId: activeCategory.id,
          search: searchQuery.trim(),
          limit: 25
        });
        if (isMounted) {
          setSearchResults(items);
        }
      } catch (err: any) {
        console.error('Activity search failed', err);
        if (isMounted) {
          setError('Failed to search activities. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 300); // 300ms debounce

    return () => {
      isMounted = false;
      clearTimeout(searchTimeout);
    };
  }, [searchQuery, activeCategory?.id]);

  const createCustomActivity = async (name: string, categoryId: string): Promise<ActivityLibraryItem> => {
    return activityLibraryService.create({
      name,
      categoryId,
      tags: ['Custom']
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    suggestions,
    searchResults,
    loading,
    error,
    createCustomActivity
  };
}
