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
}

export const activityLibraryService = {
  async getAll(params: {
    categoryId?: string;
    categoryName?: string;
    search?: string;
    limit?: number;
    offset?: number;
    includeInactive?: boolean;
  } = {}): Promise<ActivityLibraryItem[]> {
    const query = new URLSearchParams();
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.categoryName) query.set('categoryName', params.categoryName);
    if (params.search) query.set('search', params.search);
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.offset !== undefined) query.set('offset', String(params.offset));
    if (params.includeInactive !== undefined) query.set('includeInactive', String(params.includeInactive));

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
  }
};
