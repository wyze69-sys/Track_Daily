import express from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { activityLibraryService } from '../services/activityLibraryService';
import { ActivityLibraryItem } from '../../db/db';

const router = express.Router();

function mapToLegacy(item: ActivityLibraryItem) {
  return {
    id: item.id,
    name: item.name,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    muscleGroup: item.tags[0] || 'General',
    equipment: item.tags[1] || 'Bodyweight',
    exerciseType: item.trackingType === 'sets_reps_weight' ? 'strength' :
                  item.trackingType === 'duration_distance' ? 'cardio' :
                  item.trackingType === 'duration_focus' ? 'mobility' : 'sports',
    defaultDuration: 10,
    isCustom: item.source === 'custom',
    createdAt: new Date().toISOString()
  };
}

// GET /api/activity-library and /api/exercises
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { categoryId, categoryName, search, limit, offset, includeInactive } = req.query;

    const parsedLimit = limit !== undefined ? parseInt(limit as string, 10) : 25;
    const parsedOffset = offset !== undefined ? parseInt(offset as string, 10) : 0;
    
    // Only admins can include inactive activities
    const userRole = req.user?.role;
    const parsedIncludeInactive = includeInactive === 'true' && userRole === 'admin';

    const result = await activityLibraryService.getActivities({
      categoryId: categoryId as string,
      categoryName: categoryName as string,
      search: search as string,
      limit: parsedLimit,
      offset: parsedOffset,
      includeInactive: parsedIncludeInactive,
      includeCustom: true,
      currentUserId: req.user!.id
    });

    // Merge new and legacy fields to support both APIs seamlessly
    const mergedItems = result.items.map(item => ({
      ...item,
      ...mapToLegacy(item)
    }));

    res.json(mergedItems);
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Failed to retrieve activities' });
  }
});

// POST /api/activity-library and /api/exercises
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const newActivity = await activityLibraryService.createActivity(userId, req.body, userRole);

    const merged = {
      ...newActivity,
      ...mapToLegacy(newActivity)
    };

    res.status(201).json(merged);
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Failed to create activity' });
  }
});

export default router;
