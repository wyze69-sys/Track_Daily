const pool = require("../config/db");
const { createId } = require("../utils/ids");

function getWeekStartDate(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  // If it's Sunday (0), we want the previous Monday.
  // Otherwise, date.getDate() - day + 1.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

async function getWeeklyPlan(userId, dateStr) {
  const weekStart = dateStr || getWeekStartDate();
  const [rows] = await pool.execute(
    "SELECT * FROM weekly_plans WHERE user_id = ? AND week_start_date = ?",
    [userId, weekStart]
  );
  return rows[0] || null;
}

async function createWeeklyPlan(userId, targetCount, dateStr) {
  const id = createId("wpl");
  const weekStart = dateStr || getWeekStartDate();
  
  await pool.execute(
    `INSERT INTO weekly_plans (id, user_id, target_count, current_count, week_start_date)
     VALUES (?, ?, ?, 0, ?)
     ON DUPLICATE KEY UPDATE target_count = VALUES(target_count)`,
    [id, userId, targetCount, weekStart]
  );

  return getWeeklyPlan(userId, weekStart);
}

async function updateWeeklyPlan(userId, targetCount, dateStr) {
  const weekStart = dateStr || getWeekStartDate();
  await pool.execute(
    `UPDATE weekly_plans SET target_count = ? WHERE user_id = ? AND week_start_date = ?`,
    [targetCount, userId, weekStart]
  );
  return getWeeklyPlan(userId, weekStart);
}

async function updateCurrentCount(userId, currentCount, dateStr) {
  const weekStart = dateStr || getWeekStartDate();
  await pool.execute(
    `UPDATE weekly_plans SET current_count = ? WHERE user_id = ? AND week_start_date = ?`,
    [currentCount, userId, weekStart]
  );
}

module.exports = {
  weeklyPlanRepository: {
    getWeeklyPlan,
    createWeeklyPlan,
    updateWeeklyPlan,
    updateCurrentCount,
    getWeekStartDate
  }
};
