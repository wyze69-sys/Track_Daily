import express from 'express';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { adminActivityLibraryService } from '../services/adminActivityLibraryService';

const router = express.Router();

// Apply auth protection to all admin activity library routes
router.use(authMiddleware);
router.use(requireAdmin);

// GET /api/admin/activities
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { categoryId, categoryName, search, limit, offset, includeInactive, includeCustom } = req.query;
    
    const parsedLimit = limit !== undefined ? parseInt(limit as string, 10) : 25;
    const parsedOffset = offset !== undefined ? parseInt(offset as string, 10) : 0;
    const parsedIncludeInactive = includeInactive === 'true';
    const parsedIncludeCustom = includeCustom === 'true';

    const result = await adminActivityLibraryService.getActivities({
      categoryId: categoryId as string,
      categoryName: categoryName as string,
      search: search as string,
      limit: parsedLimit,
      offset: parsedOffset,
      includeInactive: parsedIncludeInactive,
      includeCustom: parsedIncludeCustom
    });

    res.json(result.items);
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Failed to retrieve admin activities.' });
  }
});

// POST /api/admin/activities
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const newActivity = await adminActivityLibraryService.createActivity(userId, req.body);
    res.status(201).json(newActivity);
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Failed to create admin activity.' });
  }
});

// PUT /api/admin/activities/:id
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const updated = await adminActivityLibraryService.updateActivity(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Failed to update admin activity.' });
  }
});

// PATCH /api/admin/activities/:id/status
router.patch('/:id/status', async (req: AuthenticatedRequest, res) => {
  try {
    const { isActive } = req.body;
    if (isActive === undefined) {
      res.status(400).json({ error: 'isActive status is required.' });
      return;
    }
    const updated = await adminActivityLibraryService.toggleStatus(req.params.id, isActive);
    res.json(updated);
  } catch (err: any) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Failed to toggle status.' });
  }
});

export default router;
