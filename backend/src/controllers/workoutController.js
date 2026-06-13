const { workoutService } = require("../services/workoutService");
const pool = require("../config/db");

async function formatLogResponse(userId, workout, xpEarned) {
  const { gamificationService, getCambodiaWeekInfo } = require("../services/gamificationService");
  const summary = await gamificationService.getSummary(userId);

  // Get weekly plan progress
  const [wpRows] = await pool.execute("SELECT target_count FROM weekly_plans WHERE user_id = ?", [userId]);
  const weekly_target = wpRows.length > 0 ? Number(wpRows[0].target_count) : 3;

  const weekInfo = getCambodiaWeekInfo(new Date());
  const [progressRows] = await pool.execute(
    `SELECT COUNT(DISTINCT date) AS active_days, COUNT(*) AS workout_count
     FROM workouts
     WHERE user_id = ? AND date >= ? AND date <= ?`,
    [userId, weekInfo.mondayStr, weekInfo.sundayStr]
  );
  const weekly_completed = Number(progressRows[0]?.workout_count || 0);

  // Get unlocked badges
  const [achRows] = await pool.execute(
    `SELECT ua.achievement_code, a.name, a.description, a.icon, ua.unlocked_at
     FROM user_achievements ua
     JOIN achievements a ON ua.achievement_code = a.code
     WHERE ua.user_id = ?`,
    [userId]
  );
  const unlocked_badges = achRows.map(row => ({
    code: row.achievement_code,
    name: row.name,
    description: row.description,
    icon: row.icon || null,
    unlocked_at: row.unlocked_at
  }));

  const workoutData = {
    id: workout.id,
    workout_date: workout.date || workout.workout_date,
    category_name: workout.title || workout.workoutType || "Workout",
    duration_minutes: workout.durationMinutes || workout.durationTotal || 0,
    mood: workout.mood || workout.moodAfterWorkout || "",
    note: workout.note || workout.notes || "",
    xp_earned: xpEarned,
    exercises: workout.exercises || []
  };

  return {
    success: true,
    message: "Workout logged successfully",
    data: {
      workout: workoutData,
      gamification: {
        xp_earned: xpEarned,
        total_xp: summary.totalXp,
        level: summary.level,
        current_streak: summary.currentStreak,
        weekly_completed,
        weekly_target,
        unlocked_badges
      }
    },
    // Frontend compatibility
    workout: {
      id: workout.id,
      userId: workout.userId,
      workoutType: workout.title || workout.workoutType || "Workout",
      durationMinutes: workout.durationMinutes || workout.durationTotal || 0,
      moodAfterWorkout: workout.mood || workout.moodAfterWorkout || "",
      note: workout.note || workout.notes || "",
      templateId: workout.templateId || null,
      xpEarned: xpEarned,
      createdAt: workout.createdAt || new Date().toISOString(),
      exercises: workout.exercises || []
    },
    profile: {
      totalXp: summary.totalXp,
      total_xp: summary.totalXp,
      level: summary.level,
      currentStreak: summary.currentStreak,
      currentLevelXp: summary.currentLevelXp,
      current_level_xp: summary.currentLevelXp
    },
    xpEarned: xpEarned
  };
}

const workoutController = {
  async getWorkouts(req, res, next) {
    try {
      const result = await workoutService.getWorkoutsByUserId(req.user.id, req.query);
      // If no page/limit parameters are passed, return the items list directly for frontend compatibility
      if (!req.query.page && !req.query.limit) {
        return res.json(result.items);
      }
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getRecent(req, res, next) {
    try {
      const items = await workoutService.getRecentWorkouts(req.user.id);
      res.json(items);
    } catch (err) {
      next(err);
    }
  },

  async getLast(req, res, next) {
    try {
      const last = await workoutService.getLastWorkout(req.user.id);
      res.json(last);
    } catch (err) {
      next(err);
    }
  },

  async createWorkout(req, res, next) {
    try {
      const payload = {
        date: req.body.date || new Date().toISOString().slice(0, 10),
        title: req.body.title || req.body.workoutType || req.body.workout_type,
        notes: req.body.notes || req.body.note,
        category: req.body.category || req.body.categorySlug || req.body.workoutType || req.body.workout_type,
        duration_min: req.body.duration_min || req.body.durationMin || req.body.durationMinutes || req.body.duration_minutes,
        mood: req.body.mood || req.body.moodAfterWorkout,
        templateId: req.body.templateId || req.body.template_id,
        exercises: Array.isArray(req.body.exercises) ? req.body.exercises : undefined
      };
      
      const newWorkout = await workoutService.createWorkout(req.user.id, payload);
      const response = await formatLogResponse(req.user.id, newWorkout, newWorkout.xp || 0);
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  },

  async quickLog(req, res, next) {
    try {
      const payload = {
        date: req.body.date || new Date().toISOString().slice(0, 10),
        title: req.body.title || req.body.workoutType || req.body.workout_type,
        notes: req.body.notes || req.body.note,
        category: req.body.category || req.body.categorySlug || req.body.workoutType || req.body.workout_type || req.body.category_id,
        duration_min: req.body.duration_min || req.body.durationMin || req.body.durationMinutes || req.body.duration_minutes,
        mood: req.body.mood || req.body.moodAfterWorkout,
        templateId: req.body.templateId || req.body.template_id,
        exercises: Array.isArray(req.body.exercises) ? req.body.exercises : undefined
      };

      const newWorkout = await workoutService.createWorkout(req.user.id, payload);
      const response = await formatLogResponse(req.user.id, newWorkout, newWorkout.xp || 0);
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  },

  async repeatLast(req, res, next) {
    try {
      const newWorkout = await workoutService.repeatLastWorkout(req.user.id);
      const response = await formatLogResponse(req.user.id, newWorkout, newWorkout.xp || 0);
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  },

  async updateWorkout(req, res, next) {
    try {
      const { id } = req.params;
      const { date, title, notes, exercises, mood } = req.body;
      const updated = await workoutService.updateWorkout(req.user.id, id, {
        date,
        title,
        notes,
        exercises,
        mood
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteWorkout(req, res, next) {
    try {
      const { id } = req.params;
      const result = await workoutService.deleteWorkout(req.user.id, id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = { workoutController };
