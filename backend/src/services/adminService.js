const { categoryRepository } = require("../repositories/categoryRepository");
const pool = require("../config/db");
const { userRepository } = require("../repositories/userRepository");
const { gamificationService } = require("./gamificationService");

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const adminService = {
  async getUsers(filters = {}) {
    return userRepository.getAdminUserList(filters);
  },

  async getUserDetail(userId) {
    const detail = await userRepository.getUserDetail(userId);
    if (!detail) {
      throw httpError("User not found.", 404);
    }
    return detail;
  },

  async updateUserRole(adminId, userId, role) {
    if (userId === adminId) {
      throw httpError("You cannot change your own role.", 400);
    }
    const updated = await userRepository.updateUserRole(userId, role);
    if (!updated) {
      throw httpError("User not found.", 404);
    }
    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  },

  async updateUserStatus(adminId, userId, isActive) {
    if (userId === adminId) {
      throw httpError("You cannot change your own account status.", 400);
    }
    const updated = await userRepository.updateUserStatus(userId, isActive);
    if (!updated) {
      throw httpError("User not found.", 404);
    }
    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  },

  async createCategory({ name, description }) {
    if (!name || !description) {
      throw httpError("Category name and description are required.", 400);
    }
    return categoryRepository.createCategory({ name, description });
  },

  async updateCategory(categoryId, { name, description }) {
    return categoryRepository.updateCategory(categoryId, { name, description });
  },

  async deleteCategory(categoryId) {
    const deleted = await categoryRepository.deleteCategory(categoryId);
    if (!deleted) {
      throw httpError("Category not found.", 404);
    }
    return { success: true, message: "Category removed." };
  },

  async getCategories() {
    return categoryRepository.getCategories();
  },

  async getCategoryAnalytics() {
    return categoryRepository.getCategoryAnalytics();
  },

  async getStats() {
    const [base, gamification] = await Promise.all([
      categoryRepository.getSystemStats(),
      gamificationService.getStatistics()
    ]);
    return { ...base, gamification };
  },

  // Dashboard payload aggregating platform summary data
  async getDashboard() {
    // Base system stats include total users and recent workouts
    const systemStats = await categoryRepository.getSystemStats();
    // Week bounds (Monday to Sunday of current week)
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const mondayStr = monday.toISOString().slice(0, 10);
    const sundayStr = sunday.toISOString().slice(0, 10);

    // Active students (distinct users with workouts this week)
    const [[activeStudentsRow]] = await pool.query(
      `SELECT COUNT(DISTINCT user_id) AS total FROM workouts WHERE date BETWEEN ? AND ?`,
      [mondayStr, sundayStr]
    );
    const activeStudents = Number(activeStudentsRow.total);

    // Workouts logged this week
    const [[workoutsWeekRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM workouts WHERE date BETWEEN ? AND ?`,
      [mondayStr, sundayStr]
    );
    const workoutsThisWeek = Number(workoutsWeekRow.total);

    // Active challenges count
    const [[challengeRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM challenges WHERE is_active = TRUE`
    );
    const activeChallenges = Number(challengeRow.total);

    // Feedback waiting review (status 'new')
    const [[feedbackRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM user_feedback WHERE status = 'new'`
    );
    const feedbackWaiting = Number(feedbackRow.total);

    return {
      success: true,
      data: {
        summary: {
          total_users: systemStats.totalUsers,
          active_students_this_week: activeStudents,
          workouts_logged_this_week: workoutsThisWeek,
          active_challenges: activeChallenges,
          feedback_waiting_review: feedbackWaiting
        },
        recent_activity: systemStats.recentWorkouts || [],
        content_shortcuts: [
          { label: "Manage Users", path: "/admin/users" },
          { label: "Categories", path: "/admin/categories" },
          { label: "Templates", path: "/admin/templates" },
          { label: "Challenges", path: "/admin/challenges" },
          { label: "Announcements", path: "/admin/announcements" },
          { label: "Feedback", path: "/admin/feedback" }
        ],
        system_note: "Admin manages shared content and platform guidance."
      }
    };
  },

  async getAnalytics() {
    return categoryRepository.getAnalyticsData();
  }
};

module.exports = { adminService };
