const pool = require("../config/db");

const progressController = {
  async getSummary(req, res, next) {
    try {
      const userId = req.user.id;

      const [workoutRows] = await pool.execute(
        `SELECT COUNT(*) as count, COALESCE(SUM(duration_total), 0) as minutes, COALESCE(AVG(duration_total), 0) as avg_duration 
         FROM workouts WHERE user_id = ?`,
        [userId]
      );

      const [gamificationRows] = await pool.execute(
        `SELECT level, total_xp, current_streak, longest_streak 
         FROM user_gamification WHERE user_id = ?`,
        [userId]
      );

      const workoutsStats = workoutRows[0] || { count: 0, minutes: 0, avg_duration: 0 };
      const gamification = gamificationRows[0] || { level: 1, total_xp: 0, current_streak: 0, longest_streak: 0 };

      res.json({
        totalWorkouts: Number(workoutsStats.count),
        totalMinutes: Number(workoutsStats.minutes),
        averageDuration: Math.round(Number(workoutsStats.avg_duration)),
        level: Number(gamification.level),
        xp: Number(gamification.total_xp),
        currentStreak: Number(gamification.current_streak),
        maxStreak: Number(gamification.longest_streak)
      });
    } catch (err) {
      next(err);
    }
  },

  async getConsistency(req, res, next) {
    try {
      const userId = req.user.id;
      const [rows] = await pool.execute(
        `SELECT DAYOFWEEK(date) as weekday, COUNT(*) as count 
         FROM workouts WHERE user_id = ? 
         GROUP BY weekday`,
        [userId]
      );

      // DAYOFWEEK: 1 = Sun, 2 = Mon, 3 = Tue, 4 = Wed, 5 = Thu, 6 = Fri, 7 = Sat
      const daysMap = {
        2: 'Mon',
        3: 'Tue',
        4: 'Wed',
        5: 'Thu',
        6: 'Fri',
        7: 'Sat',
        1: 'Sun'
      };

      const consistency = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(name => ({ name, count: 0 }));
      
      for (const row of rows) {
        const dayName = daysMap[row.weekday];
        const dayObj = consistency.find(d => d.name === dayName);
        if (dayObj) {
          dayObj.count = Number(row.count);
        }
      }

      res.json(consistency);
    } catch (err) {
      next(err);
    }
  },

  async getMoodDistribution(req, res, next) {
    try {
      const userId = req.user.id;
      const [rows] = await pool.execute(
        `SELECT mood as name, COUNT(*) as value 
         FROM workouts WHERE user_id = ? AND mood IS NOT NULL AND mood != ''
         GROUP BY mood`,
        [userId]
      );

      res.json(rows.map(r => ({
        name: r.name,
        value: Number(r.value)
      })));
    } catch (err) {
      next(err);
    }
  },

  async getWorkoutMix(req, res, next) {
    try {
      const userId = req.user.id;
      const [rows] = await pool.execute(
        `SELECT title as name, COUNT(*) as value 
         FROM workouts WHERE user_id = ? AND title IS NOT NULL AND title != ''
         GROUP BY title`,
        [userId]
      );

      res.json(rows.map(r => ({
        name: r.name,
        value: Number(r.value)
      })));
    } catch (err) {
      next(err);
    }
  }
};

module.exports = { progressController };
