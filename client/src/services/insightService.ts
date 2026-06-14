import { request, API_BASE } from './http';

export interface DailyCalorieTargetResponse {
  wording: string;
  targets: {
    bmr: number;
    tdee: number;
    targetCalories: number;
    proteinTargetG: number;
    carbsTargetG: number;
    fatTargetG: number;
    isEstimated: boolean;
    disclaimer: string;
  };
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

export interface MealPlanResponse {
  wording: string;
  mealPlan: {
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
  };
}

export const insightService = {
  async getLatest(): Promise<{ text: string; date: string }> {
    return request<{ text: string; date: string }>(`${API_BASE}/insights/latest`);
  },

  async generate(): Promise<{ text: string; date: string }> {
    return request<{ text: string; date: string }>(`${API_BASE}/insights/generate`, {
      method: 'POST'
    });
  },

  async getDailyCalorieTarget(overrides?: Record<string, any>): Promise<DailyCalorieTargetResponse> {
    return request<DailyCalorieTargetResponse>(`${API_BASE}/insights/daily-calorie-target`, {
      method: 'POST',
      body: JSON.stringify(overrides || {})
    });
  },

  async getMealPlan(overrides?: Record<string, any>): Promise<MealPlanResponse> {
    return request<MealPlanResponse>(`${API_BASE}/insights/meal-plan`, {
      method: 'POST',
      body: JSON.stringify(overrides || {})
    });
  }
};
