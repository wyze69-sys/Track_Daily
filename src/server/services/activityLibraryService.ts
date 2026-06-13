import { activityLibraryRepository, ActivityFilters } from '../repositories/activityLibraryRepository';
import { readDatabase, ActivityLibraryItem } from '../../db/db';

function httpError(message: string, status: number): Error & { status?: number } {
  const err = new Error(message) as Error & { status?: number };
  err.status = status;
  return err;
}

export const activityLibraryService = {
  async getActivities(filters: ActivityFilters = {}) {
    return activityLibraryRepository.getAll(filters);
  },

  async createActivity(userId: string, body: any, userRole?: string): Promise<ActivityLibraryItem> {
    const name = String(body.name || '').trim();
    if (name.length < 2) {
      throw httpError('Activity name must be at least 2 characters long.', 400);
    }

    const categoryId = String(body.categoryId || body.category_id || '').trim();
    if (!categoryId) {
      throw httpError('Category ID is required.', 400);
    }

    // Verify category exists in the system
    const db = readDatabase();
    const category = db.exerciseCategories.find(cat => cat.id === categoryId);
    if (!category) {
      throw httpError('Invalid category ID.', 400);
    }

    // Determine categoryName and normalizedName
    const categoryName = category.name;
    const normalizedName = name.toLowerCase().replace(/\s+/g, ' ');

    // Check for duplicates (same normalizedName and categoryId)
    const existing = activityLibraryRepository.findByNameAndCategory(normalizedName, categoryId);
    if (existing) {
      throw httpError(`An activity named "${name}" already exists in the "${categoryName}" category.`, 400);
    }

    // Map trackingType based on category
    let trackingType: ActivityLibraryItem['trackingType'] = 'sets_reps_weight';
    const catNameLower = categoryName.toLowerCase();
    if (catNameLower.includes('cardio')) {
      trackingType = 'duration_distance';
    } else if (catNameLower.includes('flexibility') || catNameLower.includes('mobility') || catNameLower.includes('yoga')) {
      trackingType = 'duration_focus';
    } else if (catNameLower.includes('sport')) {
      trackingType = 'duration_intensity';
    }

    // Determine source role
    const source = userRole === 'admin' ? 'admin' : 'custom';

    const newActivity: ActivityLibraryItem = {
      id: `act-${source}-${Date.now()}`,
      categoryId,
      categoryName,
      name,
      normalizedName,
      trackingType,
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? [body.tags] : []),
      difficulty: body.difficulty || undefined,
      isActive: true,
      source,
      createdByUserId: userId
    };

    return activityLibraryRepository.create(newActivity);
  }
};
