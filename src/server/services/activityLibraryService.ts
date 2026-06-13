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

    // Validate calorie metadata fields if provided
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
      createdByUserId: userId,
      defaultMet,
      distanceMultiplier,
      bodyweightFactor,
      calorieMethod,
      intensityLevel,
      estimateConfidence
    };

    return activityLibraryRepository.create(newActivity);
  }
};
