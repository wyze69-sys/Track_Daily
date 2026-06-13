import express from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { nutritionRepository } from '../repositories/nutritionRepository';
import { calorieTargetService } from '../services/calorieTargetService';

const router = express.Router();

/**
 * GET /api/nutrition/foods
 * Query params:
 * - search: string (optional)
 * - limit: number (optional, default 25)
 * - offset: number (optional, default 0)
 */
router.get('/foods', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const search = req.query.search as string | undefined;
    
    // Parse limit and offset
    let limit = 25;
    if (req.query.limit) {
      const parsedLimit = parseInt(req.query.limit as string, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
      }
    }

    let offset = 0;
    if (req.query.offset) {
      const parsedOffset = parseInt(req.query.offset as string, 10);
      if (!isNaN(parsedOffset) && parsedOffset >= 0) {
        offset = parsedOffset;
      }
    }

    const result = nutritionRepository.searchFoods(search, limit, offset);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'An error occurred while fetching food items.' });
  }
});

/**
 * GET /api/nutrition/target
 * Returns estimated calorie and macro target for authenticated user
 */
router.get('/target', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'User context is missing.' });
      return;
    }

    const target = calorieTargetService.getUserCalorieTarget(req.user.id);
    res.json(target);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'An error occurred while calculating targets.' });
  }
});

export default router;
