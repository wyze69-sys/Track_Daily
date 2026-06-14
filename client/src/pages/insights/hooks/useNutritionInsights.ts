import { useState, useEffect, useCallback } from 'react';
import { nutritionService } from '../../../services/nutritionService';
import { insightService } from '../../../services/insightService';
import { NutritionProfile, DailyCalorieTarget, MealPlan } from '../types';

export function useNutritionInsights() {
  const [profile, setProfile] = useState<NutritionProfile>({
    weightKg: null,
    heightCm: null,
    age: null,
    gender: null,
    goal: null,
    activityLevel: null,
    dietPreference: '',
    allergies: []
  });
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isIncomplete, setIsIncomplete] = useState<boolean>(true);
  
  const [targets, setTargets] = useState<DailyCalorieTarget | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [loadingMealPlan, setLoadingMealPlan] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoadingProfile(true);
    setError(null);
    try {
      const res = await nutritionService.getProfile();
      setProfile({
        weightKg: res.profile.weightKg,
        heightCm: res.profile.heightCm,
        age: res.profile.age,
        gender: res.profile.gender,
        goal: res.profile.goal,
        activityLevel: res.profile.activityLevel,
        dietPreference: res.profile.dietPreference || '',
        allergies: res.profile.allergies || []
      });
      setMissingFields(res.missingFields || []);
      setIsIncomplete(res.isIncomplete);

      if (!res.isIncomplete) {
        // Fetch targets and meal plan
        await fetchTargetsAndMealPlan();
      } else {
        setTargets(null);
        setMealPlan(null);
      }
    } catch (err: any) {
      console.error('Failed to load nutrition profile', err);
      setError(err.message || 'Failed to load nutrition profile.');
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchTargetsAndMealPlan = async () => {
    setLoadingTarget(true);
    setLoadingMealPlan(true);
    try {
      const targetRes = await insightService.getDailyCalorieTarget();
      setTargets(targetRes.targets);

      const mealRes = await insightService.getMealPlan();
      setMealPlan(mealRes.mealPlan);
    } catch (err: any) {
      console.error('Failed to load targets or meal plan', err);
      setError(err.message || 'Failed to calculate daily targets.');
    } finally {
      setLoadingTarget(false);
      setLoadingMealPlan(false);
    }
  };

  const updateProfile = async (updates: Partial<NutritionProfile>) => {
    setSaving(true);
    setError(null);
    try {
      const res = await nutritionService.updateProfile(updates);
      if (res.success) {
        // Reload all data so missingFields and calculations are fully updated from the server
        await loadData();
      }
    } catch (err: any) {
      console.error('Failed to update nutrition profile', err);
      setError(err.message || 'Failed to update profile.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    profile,
    missingFields,
    isIncomplete,
    targets,
    mealPlan,
    loadingProfile,
    loadingTarget,
    loadingMealPlan,
    saving,
    error,
    updateProfile,
    refetch: loadData
  };
}
