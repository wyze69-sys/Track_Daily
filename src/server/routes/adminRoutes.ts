import express from 'express';
import { readDatabase } from '../../db/db';
import { authMiddleware, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/dashboard', authMiddleware, requireAdmin, (req, res) => {
  const db = readDatabase();
  const totalUsersCount = db.users.length;
  const totalWorkoutsCount = db.workouts.length;
  const totalCategoriesCount = db.exerciseCategories.length;
  const totalFeedbackCount = db.feedback.length;
  const activeStreakCount = db.userProfiles.reduce(
    (acc, curr) => acc + (curr.currentStreak > 0 ? 1 : 0),
    0
  );
  const totalXpEarned = db.userProfiles.reduce((acc, curr) => acc + curr.xp, 0);

  const recentUsers = db.users
    .map((u) => {
      const profile = db.userProfiles.find((p) => p.userId === u.id);
      return { id: u.id, email: u.email, role: u.role, fullName: profile?.fullName || 'N/A', createdAt: u.createdAt };
    })
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  const recentWorkouts = db.workouts
    .map((w) => {
      const user = db.users.find((u) => u.id === w.userId);
      const profile = db.userProfiles.find((p) => p.userId === w.userId);
      return {
        id: w.id,
        workoutType: w.workoutType,
        durationMinutes: w.durationMinutes,
        userName: profile?.fullName || user?.email?.split('@')[0] || 'Unknown',
        createdAt: w.createdAt
      };
    })
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  res.json({
    totalUsersCount, totalWorkoutsCount, totalCategoriesCount, totalFeedbackCount,
    activeStreakCount, totalXpEarned,
    categories: db.exerciseCategories,
    recentFeedback: [...db.feedback]
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
      .slice(0, 5),
    recentUsers,
    recentWorkouts
  });
});

router.get('/users', authMiddleware, requireAdmin, (req, res) => {
  const db = readDatabase();
  const userList = db.users.map((u) => {
    const profile = db.userProfiles.find((p) => p.userId === u.id);
    return {
      id: u.id, email: u.email, role: u.role,
      fullName: profile?.fullName || 'N/A',
      level: profile?.level || 1,
      xp: profile?.xp || 0,
      currentStreak: profile?.currentStreak || 0,
      createdAt: u.createdAt
    };
  });
  res.json(userList);
});

export default router;
