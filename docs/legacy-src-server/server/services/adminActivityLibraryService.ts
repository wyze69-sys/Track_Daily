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

    // Validate calorie metadata fields
    let defaultMet: number | undefined = undefined;
    if (body.defaultMet !== undefined && body.defaultMet !== null && body.defaultMet !== '') {
      const val = Number(body.defaultMet);
      if (isNaN(val) || val < 0) {
        throw httpError('defaultMet must be a number greater than or equal to 0.', 400);
      }
      defaultMet = val;
    }

    let distanceMultiplier: number | undefined = undefined;
    if (body.distanceMultiplier !== undefined && body.distanceMultiplier !== null && body.distanceMultiplier !== '') {
      const val = Number(body.distanceMultiplier);
      if (isNaN(val) || val < 0) {
        throw httpError('distanceMultiplier must be a number greater than or equal to 0.', 400);
      }
      distanceMultiplier = val;
    }

    let bodyweightFactor: number | undefined = undefined;
    if (body.bodyweightFactor !== undefined && body.bodyweightFactor !== null && body.bodyweightFactor !== '') {
      const val = Number(body.bodyweightFactor);
      if (isNaN(val) || val < 0) {
        throw httpError('bodyweightFactor must be a number greater than or equal to 0.', 400);
      }
      bodyweightFactor = val;
    }

    let calorieMethod: string | undefined = undefined;
    if (body.calorieMethod !== undefined && body.calorieMethod !== null && body.calorieMethod !== '') {
      const val = String(body.calorieMethod).trim();
      const ALLOWED_CALORIE_METHODS = ['met_duration', 'distance_weight', 'strength_volume_adjusted', 'met_duration_intensity'];
      if (!ALLOWED_CALORIE_METHODS.includes(val)) {
        throw httpError(`calorieMethod must be one of: ${ALLOWED_CALORIE_METHODS.join(', ')}.`, 400);
      }
      calorieMethod = val;
    }

    let intensityLevel: string | undefined = undefined;
    if (body.intensityLevel !== undefined && body.intensityLevel !== null && body.intensityLevel !== '') {
      const val = String(body.intensityLevel).trim();
      const ALLOWED_INTENSITY_LEVELS = ['low', 'moderate', 'high'];
      if (!ALLOWED_INTENSITY_LEVELS.includes(val)) {
        throw httpError(`intensityLevel must be one of: ${ALLOWED_INTENSITY_LEVELS.join(', ')}.`, 400);
      }
      intensityLevel = val;
    }

    let estimateConfidence: string | undefined = undefined;
    if (body.estimateConfidence !== undefined && body.estimateConfidence !== null && body.estimateConfidence !== '') {
      const val = String(body.estimateConfidence).trim();
      const ALLOWED_ESTIMATE_CONFIDENCE = ['exact', 'close_match', 'fallback'];
      if (!ALLOWED_ESTIMATE_CONFIDENCE.includes(val)) {
        throw httpError(`estimateConfidence must be one of: ${ALLOWED_ESTIMATE_CONFIDENCE.join(', ')}.`, 400);
      }
      estimateConfidence = val;
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
      createdByUserId: userId,
      defaultMet,
      distanceMultiplier,
      bodyweightFactor,
      calorieMethod,
      intensityLevel,
      estimateConfidence
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

    // Validate and sync calorie metadata fields
    if ('defaultMet' in body) {
      if (body.defaultMet !== undefined && body.defaultMet !== null && body.defaultMet !== '') {
        const val = Number(body.defaultMet);
        if (isNaN(val) || val < 0) {
          throw httpError('defaultMet must be a number greater than or equal to 0.', 400);
        }
        updates.defaultMet = val;
      } else {
        updates.defaultMet = undefined;
      }
    }

    if ('distanceMultiplier' in body) {
      if (body.distanceMultiplier !== undefined && body.distanceMultiplier !== null && body.distanceMultiplier !== '') {
        const val = Number(body.distanceMultiplier);
        if (isNaN(val) || val < 0) {
          throw httpError('distanceMultiplier must be a number greater than or equal to 0.', 400);
        }
        updates.distanceMultiplier = val;
      } else {
        updates.distanceMultiplier = undefined;
      }
    }

    if ('bodyweightFactor' in body) {
      if (body.bodyweightFactor !== undefined && body.bodyweightFactor !== null && body.bodyweightFactor !== '') {
        const val = Number(body.bodyweightFactor);
        if (isNaN(val) || val < 0) {
          throw httpError('bodyweightFactor must be a number greater than or equal to 0.', 400);
        }
        updates.bodyweightFactor = val;
      } else {
        updates.bodyweightFactor = undefined;
      }
    }

    if ('calorieMethod' in body) {
      if (body.calorieMethod !== undefined && body.calorieMethod !== null && body.calorieMethod !== '') {
        const val = String(body.calorieMethod).trim();
        const ALLOWED_CALORIE_METHODS = ['met_duration', 'distance_weight', 'strength_volume_adjusted', 'met_duration_intensity'];
        if (!ALLOWED_CALORIE_METHODS.includes(val)) {
          throw httpError(`calorieMethod must be one of: ${ALLOWED_CALORIE_METHODS.join(', ')}.`, 400);
        }
        updates.calorieMethod = val;
      } else {
        updates.calorieMethod = undefined;
      }
    }

    if ('intensityLevel' in body) {
      if (body.intensityLevel !== undefined && body.intensityLevel !== null && body.intensityLevel !== '') {
        const val = String(body.intensityLevel).trim();
        const ALLOWED_INTENSITY_LEVELS = ['low', 'moderate', 'high'];
        if (!ALLOWED_INTENSITY_LEVELS.includes(val)) {
          throw httpError(`intensityLevel must be one of: ${ALLOWED_INTENSITY_LEVELS.join(', ')}.`, 400);
        }
        updates.intensityLevel = val;
      } else {
        updates.intensityLevel = undefined;
      }
    }

    if ('estimateConfidence' in body) {
      if (body.estimateConfidence !== undefined && body.estimateConfidence !== null && body.estimateConfidence !== '') {
        const val = String(body.estimateConfidence).trim();
        const ALLOWED_ESTIMATE_CONFIDENCE = ['exact', 'close_match', 'fallback'];
        if (!ALLOWED_ESTIMATE_CONFIDENCE.includes(val)) {
          throw httpError(`estimateConfidence must be one of: ${ALLOWED_ESTIMATE_CONFIDENCE.join(', ')}.`, 400);
        }
        updates.estimateConfidence = val;
      } else {
        updates.estimateConfidence = undefined;
      }
    }

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
