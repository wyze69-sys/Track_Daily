import { request, API_BASE } from './http';

export interface ExerciseCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  muscleGroup: string;
  equipment: string;
  exerciseType: string;
  defaultDuration: number;
  isCustom: boolean;
  createdAt: string;
}

export const categoryService = {
  async getAll(): Promise<ExerciseCategory[]> {
    return request<ExerciseCategory[]>(`${API_BASE}/categories`);
  },

  async create(body: { name: string; icon: string; description: string }): Promise<ExerciseCategory> {
    return request<ExerciseCategory>(`${API_BASE}/categories`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  async update(id: string, body: Partial<ExerciseCategory>): Promise<ExerciseCategory> {
    return request<ExerciseCategory>(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`${API_BASE}/categories/${id}`, {
      method: 'DELETE'
    });
  }
};

export const exerciseLibraryService = {
  async getAll(params: { search?: string; categoryId?: string; exerciseType?: string } = {}): Promise<ExerciseLibraryItem[]> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.exerciseType) query.set('exerciseType', params.exerciseType);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request<ExerciseLibraryItem[]>(`${API_BASE}/exercises${suffix}`);
  },

  async create(body: {
    name: string;
    categoryId?: string | null;
    muscleGroup?: string;
    equipment?: string;
    exerciseType?: string;
    defaultDuration?: number;
  }): Promise<ExerciseLibraryItem> {
    return request<ExerciseLibraryItem>(`${API_BASE}/exercises`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }
};
