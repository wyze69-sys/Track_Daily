import { request, API_BASE } from './http';
import type { WorkoutExercise } from './workoutService';

export interface WorkoutTemplate {
  id: string;
  title?: string;
  name: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  category: string;
  durationMin?: number;
  durationMinutes: number;
  exercises?: WorkoutExercise[];
  isActive?: boolean;
  createdBy?: string;
  createdAt: string;
}

type TemplateQuery = {
  search?: string;
  category?: string;
  mine?: boolean;
};

type TemplateWriteBody = {
  title?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  category?: string;
  durationMin?: number;
  durationMinutes?: number;
  exercises: WorkoutExercise[];
  isActive?: boolean;
};

export const templateService = {
  async getAll(params: TemplateQuery = {}): Promise<WorkoutTemplate[]> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.mine) query.set('mine', 'true');
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request<WorkoutTemplate[]>(`${API_BASE}/templates${suffix}`);
  },

  async create(body: TemplateWriteBody): Promise<WorkoutTemplate> {
    return request<WorkoutTemplate>(`${API_BASE}/templates`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async update(id: string, body: Partial<WorkoutTemplate>): Promise<WorkoutTemplate> {
    return request<WorkoutTemplate>(`${API_BASE}/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`${API_BASE}/templates/${id}`, {
      method: 'DELETE'
    });
  }
};
