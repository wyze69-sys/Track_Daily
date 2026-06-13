export interface NutritionProfile {
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | string | null;
  goal: 'lose_weight' | 'maintain_weight' | 'gain_muscle' | 'improve_fitness' | string | null;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | string | null;
  dietPreference?: string | null;
  allergies?: string[] | null;
}

export interface DailyCalorieTarget {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  isEstimated: boolean;
  disclaimer: string;
}

export interface RecommendedMealItem {
  foodId: string;
  name: string;
  servingSize: string;
  servings: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MealPlan {
  meals?: {
    breakfast: RecommendedMealItem;
    lunch: RecommendedMealItem;
    dinner: RecommendedMealItem;
    snack: RecommendedMealItem;
  };
  totalPlanned?: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  target?: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  fallbackMessage?: string;
  disclaimer: string;
}
