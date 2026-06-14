const { activityLibraryService } = require("../services/activityLibraryService");

const activityLibraryController = {
  async getActivities(req, res, next) {
    try {
      const { categoryId, categoryName, search, limit, offset, includeInactive } = req.query;

      const parsedLimit = limit !== undefined ? parseInt(limit, 10) : 25;
      const parsedOffset = offset !== undefined ? parseInt(offset, 10) : 0;
      
      const userRole = req.user ? req.user.role : 'user';
      const parsedIncludeInactive = includeInactive === 'true' && userRole === 'admin';

      const result = await activityLibraryService.getActivities({
        categoryId,
        categoryName,
        search,
        limit: parsedLimit,
        offset: parsedOffset,
        includeInactive: parsedIncludeInactive,
        includeCustom: true,
        currentUserId: req.user ? req.user.id : undefined
      });

      res.json(result.items);
    } catch (err) {
      next(err);
    }
  },

  async createActivity(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const newActivity = await activityLibraryService.createActivity(userId, req.body, userRole);
      res.status(201).json(newActivity);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = { activityLibraryController };
