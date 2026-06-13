import { request, API_BASE } from './http';

export interface ProfileUpdatePayload {
  name?: string;
  age?: number | null;
  gender?: 'male' | 'female' | 'other' | null;
  height?: number | null;
  weight?: number | null;
  targetWeight?: number | null;
  preferredWorkoutType?: string | null;
  goal?: string | null;
  activityLevel?: 'Sedentary' | 'Lightly active' | 'Moderately active' | 'Very active' | null;
}

export const profileService = {
  async update(payload: ProfileUpdatePayload): Promise<any> {
    return request<any>(`${API_BASE}/profile/update`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
