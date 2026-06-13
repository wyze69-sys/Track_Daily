import { request, API_BASE } from './http';

export interface ActivityLibraryItem {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  normalizedName: string;
  trackingType: 'sets_reps_weight' | 'duration_distance' | 'duration_focus' | 'duration_intensity' | string;
  tags: string[];
  difficulty?: string;
  isActive: boolean;
  source: 'default' | 'admin' | 'custom';
  createdByUserId?: string | null;
  defaultMet?: number;
  distanceMultiplier?: number;
  bodyweightFactor?: number;
  calorieMethod?: 'met_duration' | 'distance_weight' | 'strength_volume_adjusted' | 'met_duration_intensity' | string;
  intensityLevel?: 'low' | 'moderate' | 'high' | string;
  estimateConfidence?: 'exact' | 'close_match' | 'fallback' | string;
}

export const activityLibraryService = {
  async getAll(params: {
    categoryId?: string;
    categoryName?: string;
    search?: string;
    limit?: number;
    offset?: number;
    includeInactive?: boolean;
    includeCustom?: boolean;
  } = {}): Promise<ActivityLibraryItem[]> {
    const query = new URLSearchParams();
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.categoryName) query.set('categoryName', params.categoryName);
    if (params.search) query.set('search', params.search);
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.offset !== undefined) query.set('offset', String(params.offset));
    if (params.includeInactive !== undefined) query.set('includeInactive', String(params.includeInactive));
    if (params.includeCustom !== undefined) query.set('includeCustom', String(params.includeCustom));

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request<ActivityLibraryItem[]>(`${API_BASE}/activity-library${suffix}`);
  },

  async create(body: {
    name: string;
    categoryId: string;
    tags?: string[];
    difficulty?: string;
  }): Promise<ActivityLibraryItem> {
    return request<ActivityLibraryItem>(`${API_BASE}/activity-library`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  admin: {
    async getAll(params: {
      categoryId?: string;
      categoryName?: string;
      search?: string;
      limit?: number;
      offset?: number;
      includeInactive?: boolean;
      includeCustom?: boolean;
    } = {}): Promise<ActivityLibraryItem[]> {
      const query = new URLSearchParams();
      if (params.categoryId) query.set('categoryId', params.categoryId);
      if (params.categoryName) query.set('categoryName', params.categoryName);
      if (params.search) query.set('search', params.search);
      if (params.limit !== undefined) query.set('limit', String(params.limit));
      if (params.offset !== undefined) query.set('offset', String(params.offset));
      if (params.includeInactive !== undefined) query.set('includeInactive', String(params.includeInactive));
      if (params.includeCustom !== undefined) query.set('includeCustom', String(params.includeCustom));

      const suffix = query.toString() ? `?${query.toString()}` : '';
      return request<ActivityLibraryItem[]>(`${API_BASE}/admin/activities${suffix}`);
    },

    async create(body: {
      name: string;
      categoryId: string;
      trackingType: string;
      tags: string[];
      difficulty?: string;
      isActive?: boolean;
      defaultMet?: number;
      distanceMultiplier?: number;
      bodyweightFactor?: number;
      calorieMethod?: string;
      intensityLevel?: string;
      estimateConfidence?: string;
    }): Promise<ActivityLibraryItem> {
      return request<ActivityLibraryItem>(`${API_BASE}/admin/activities`, {
        method: 'POST',
        body: JSON.stringify(body)
      });
    },

    async update(id: string, body: {
      name: string;
      categoryId: string;
      trackingType: string;
      tags: string[];
      difficulty?: string;
      isActive?: boolean;
      defaultMet?: number;
      distanceMultiplier?: number;
      bodyweightFactor?: number;
      calorieMethod?: string;
      intensityLevel?: string;
      estimateConfidence?: string;
    }): Promise<ActivityLibraryItem> {
      return request<ActivityLibraryItem>(`${API_BASE}/admin/activities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
    },

    async toggleStatus(id: string, isActive: boolean): Promise<ActivityLibraryItem> {
      return request<ActivityLibraryItem>(`${API_BASE}/admin/activities/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive })
      });
    }
  }
};
