const { gamificationService } = require("../services/gamificationService");

const gamificationController = {
  async getSummary(req, res, next) {
    try {
      const summary = await gamificationService.getSummary(req.user.id);
      const unlockedCount = summary.badges ? summary.badges.filter(b => b.isUnlocked).length : 0;
      res.json({
        ...summary,
        xp: summary.totalXp,
        maxStreak: summary.longestStreak,
        badgesCount: unlockedCount
      });
    } catch (err) {
      next(err);
    }
  },

  async getBadges(req, res, next) {
    try {
      const summary = await gamificationService.getSummary(req.user.id);
      const badges = (summary.badges || []).map(b => ({
        id: b.code,
        name: b.name,
        description: b.description,
        icon: b.icon || "award",
        unlocked: b.isUnlocked,
        unlockedAt: b.unlockedAt
      }));
      res.json(badges);
    } catch (err) {
      next(err);
    }
  },

  async getNextBadge(req, res, next) {
    try {
      const summary = await gamificationService.getSummary(req.user.id);
      const locked = (summary.badges || []).filter(b => !b.isUnlocked);
      if (locked.length === 0) {
        return res.json(null);
      }
      
      const nextBadge = locked[0];
      let currentValue = 0;
      if (nextBadge.requirement === 'streak') {
        currentValue = summary.currentStreak || 0;
      } else if (nextBadge.requirement === 'workouts') {
        currentValue = summary.totalWorkoutsThisWeek || 0;
      } else if (nextBadge.requirement === 'level') {
        currentValue = summary.level || 1;
      }
      
      const progressPercent = nextBadge.value > 0 ? Math.min(100, Math.round((currentValue / nextBadge.value) * 100)) : 0;
      
      res.json({
        id: nextBadge.code,
        name: nextBadge.name,
        description: nextBadge.description,
        icon: nextBadge.icon || "award",
        requirementType: nextBadge.requirement,
        targetValue: nextBadge.value,
        currentValue,
        progressPercent
      });
    } catch (err) {
      next(err);
    }
  },

  async createCheckin(req, res, next) {
    try {
      const { type } = req.body;
      const summary = await gamificationService.recordCheckin(req.user.id, type);
      res.status(201).json(summary);
    } catch (err) {
      next(err);
    }
  },

  async getStreakStatus(req, res, next) {
    try {
      const status = await gamificationService.getWeeklyStreakStatus(req.user.id);
      res.json(status);
    } catch (err) {
      next(err);
    }
  },

  async restoreStreak(req, res, next) {
    try {
      const status = await gamificationService.restoreStreak(req.user.id);
      res.json(status);
    } catch (err) {
      next(err);
    }
  },

  async startNewStreak(req, res, next) {
    try {
      const status = await gamificationService.startNewStreak(req.user.id);
      res.json(status);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = { gamificationController };
