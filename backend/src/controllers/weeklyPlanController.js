const { weeklyPlanRepository } = require("../repositories/weeklyPlanRepository");
const pool = require("../config/db");

const weeklyPlanController = {
  async getWeeklyPlan(req, res, next) {
    try {
      const userId = req.user.id;
      const weekStart = weeklyPlanRepository.getWeekStartDate();
      
      // Count workouts in this week
      const weekEnd = new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const [countRows] = await pool.execute(
        "SELECT COUNT(*) as count FROM workouts WHERE user_id = ? AND date >= ? AND date <= ?",
        [userId, weekStart, weekEnd]
      );
      const currentCount = countRows[0]?.count || 0;

      let plan = await weeklyPlanRepository.getWeeklyPlan(userId, weekStart);
      if (!plan) {
        // Create a default plan with target of 3 workouts
        plan = await weeklyPlanRepository.createWeeklyPlan(userId, 3, weekStart);
      }

      // Update current count in db if different
      if (plan.current_count !== currentCount) {
        await weeklyPlanRepository.updateCurrentCount(userId, currentCount, weekStart);
        plan.current_count = currentCount;
      }

      res.json({
        id: plan.id,
        userId: plan.user_id,
        targetCount: plan.target_count,
        currentCount: plan.current_count,
        weekStartDate: plan.week_start_date
      });
    } catch (err) {
      next(err);
    }
  },

  async updateWeeklyPlan(req, res, next) {
    try {
      const userId = req.user.id;
      const { targetCount } = req.body;
      
      const target = Number(targetCount);
      if (![2, 3, 4, 5].includes(target)) {
        return res.status(400).json({ error: "Weekly target must be 2, 3, 4, or 5 workouts." });
      }

      const weekStart = weeklyPlanRepository.getWeekStartDate();
      let plan = await weeklyPlanRepository.getWeeklyPlan(userId, weekStart);
      if (!plan) {
        plan = await weeklyPlanRepository.createWeeklyPlan(userId, target, weekStart);
      } else {
        plan = await weeklyPlanRepository.updateWeeklyPlan(userId, target, weekStart);
      }

      // Recalculate currentCount
      const weekEnd = new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const [countRows] = await pool.execute(
        "SELECT COUNT(*) as count FROM workouts WHERE user_id = ? AND date >= ? AND date <= ?",
        [userId, weekStart, weekEnd]
      );
      const currentCount = countRows[0]?.count || 0;
      if (plan.current_count !== currentCount) {
        await weeklyPlanRepository.updateCurrentCount(userId, currentCount, weekStart);
        plan.current_count = currentCount;
      }

      res.json({
        id: plan.id,
        userId: plan.user_id,
        targetCount: plan.target_count,
        currentCount: plan.current_count,
        weekStartDate: plan.week_start_date
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = { weeklyPlanController };
