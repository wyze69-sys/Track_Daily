import { request, API_BASE } from './http';

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

export interface NutritionProfileResponse {
  profile: NutritionProfile;
  missingFields: string[];
  isIncomplete: boolean;
  message: string;
}

export interface FoodItem {
  id: string;
  name: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  source_dataset?: string;
  source_file?: string;
  source_group?: string;
}

export interface FoodSearchResponse {
  items: FoodItem[];
  total: number;
}

export const nutritionService = {
  async getProfile(): Promise<NutritionProfileResponse> {
    return request<NutritionProfileResponse>(`${API_BASE}/profile/nutrition`);
  },

  async updateProfile(profile: Partial<NutritionProfile>): Promise<{ success: boolean; message: string; profile: NutritionProfile }> {
    return request<{ success: boolean; message: string; profile: NutritionProfile }>(`${API_BASE}/profile/nutrition`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },

  async searchFoods(search?: string, limit = 25, offset = 0): Promise<FoodSearchResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return request<FoodSearchResponse>(`${API_BASE}/nutrition/foods?${params.toString()}`);
  }
};
