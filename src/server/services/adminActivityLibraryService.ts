import { activityLibraryRepository, ActivityFilters } from '../repositories/activityLibraryRepository';
import { readDatabase, writeDatabase, ActivityLibraryItem } from '../../db/db';

function httpError(message: string, status: number): Error & { status?: number } {
  const err = new Error(message) as Error & { status?: number };
  err.status = status;
  return err;
}

const VALID_TRACKING_TYPES = ['sets_reps_weight', 'duration_distance', 'duration_focus', 'duration_intensity'];

export const adminActivityLibraryService = {
  async getActivities(filters: ActivityFilters = {}) {
    // Exclude custom user activities for admins by default
    const finalFilters = {
      includeCustom: false,
      ...filters
    };
    return activityLibraryRepository.getAll(finalFilters);
  },

  async createActivity(userId: string, body: any): Promise<ActivityLibraryItem> {
    const name = String(body.name || '').trim();
    if (name.length < 2) {
      throw httpError('Activity name must be at least 2 characters long.', 400);
    }

    const categoryId = String(body.categoryId || '').trim();
    if (!categoryId) {
      throw httpError('Category ID is required.', 400);
    }

    // Verify category exists
    const db = readDatabase();
    const category = db.exerciseCategories.find(cat => cat.id === categoryId);
    if (!category) {
      throw httpError('Invalid category ID.', 400);
    }

    const trackingType = String(body.trackingType || '').trim();
    if (!VALID_TRACKING_TYPES.includes(trackingType)) {
      throw httpError('Invalid tracking type specified.', 400);
    }

    const normalizedName = name.toLowerCase().replace(/\s+/g, ' ');

    // Check duplicate
    const existing = activityLibraryRepository.findByNameAndCategory(normalizedName, categoryId);
    if (existing) {
      throw httpError(`An activity named "${name}" already exists in the "${category.name}" category.`, 400);
    }

    const newActivity: ActivityLibraryItem = {
      id: `act-admin-${Date.now()}`,
      categoryId,
      categoryName: category.name,
      name,
      normalizedName,
      trackingType,
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? String(body.tags).split(',').map(t => t.trim()).filter(Boolean) : []),
      difficulty: body.difficulty || undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      source: 'admin',
      createdByUserId: userId
    };

    return activityLibraryRepository.create(newActivity);
  },

  async updateActivity(id: string, body: any): Promise<ActivityLibraryItem> {
    const existing = activityLibraryRepository.getById(id);
    if (!existing) {
      throw httpError('Activity not found.', 404);
    }

    const name = String(body.name || '').trim();
    if (name.length < 2) {
      throw httpError('Activity name must be at least 2 characters long.', 400);
    }

    const categoryId = String(body.categoryId || '').trim();
    if (!categoryId) {
      throw httpError('Category ID is required.', 400);
    }

    // Verify category exists
    const db = readDatabase();
    const category = db.exerciseCategories.find(cat => cat.id === categoryId);
    if (!category) {
      throw httpError('Invalid category ID.', 400);
    }

    const trackingType = String(body.trackingType || '').trim();
    if (!VALID_TRACKING_TYPES.includes(trackingType)) {
      throw httpError('Invalid tracking type specified.', 400);
    }

    const normalizedName = name.toLowerCase().replace(/\s+/g, ' ');

    // Check duplicate (if name or category changes)
    const duplicate = activityLibraryRepository.findByNameAndCategory(normalizedName, categoryId);
    if (duplicate && duplicate.id !== id) {
      throw httpError(`Another activity named "${name}" already exists in the "${category.name}" category.`, 400);
    }

    const updates: Partial<ActivityLibraryItem> = {
      name,
      normalizedName,
      categoryId,
      categoryName: category.name,
      trackingType,
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? String(body.tags).split(',').map(t => t.trim()).filter(Boolean) : []),
      difficulty: body.difficulty || undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive
    };

    const updated = activityLibraryRepository.update(id, updates);
    if (!updated) {
      throw httpError('Failed to update activity.', 500);
    }

    return updated;
  },

  async toggleStatus(id: string, isActive: boolean): Promise<ActivityLibraryItem> {
    const existing = activityLibraryRepository.getById(id);
    if (!existing) {
      throw httpError('Activity not found.', 404);
    }

    const updated = activityLibraryRepository.update(id, { isActive: Boolean(isActive) });
    if (!updated) {
      throw httpError('Failed to toggle activity status.', 500);
    }

    return updated;
  }
};
