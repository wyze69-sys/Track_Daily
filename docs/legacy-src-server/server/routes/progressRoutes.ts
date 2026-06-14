import express from 'express';
import { readDatabase } from '../../db/db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

router.get('/summary', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const logs = db.workouts.filter((w) => w.userId === req.user!.id);
  const profile = db.userProfiles.find((p) => p.userId === req.user!.id) || {
    level: 1, xp: 0, currentStreak: 0, maxStreak: 0
  };

  const totalWorkouts = logs.length;
  const totalMinutes = logs.reduce((acc, w) => acc + w.durationMinutes, 0);
  const averageDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

  res.json({
    totalWorkouts,
    totalMinutes,
    averageDuration,
    level: profile.level,
    xp: profile.xp,
    currentStreak: profile.currentStreak,
    maxStreak: profile.maxStreak
  });
});

router.get('/consistency', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const logs = db.workouts.filter((w) => w.userId === req.user!.id);
  const weekdayCounts: { [key: string]: number } = {
    Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0
  };
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  logs.forEach((w) => {
    const dayName = days[new Date(w.createdAt).getDay()];
    if (dayName in weekdayCounts) weekdayCounts[dayName] += 1;
  });
  res.json(Object.keys(weekdayCounts).map((day) => ({ name: day, count: weekdayCounts[day] })));
});

router.get('/mood', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const logs = db.workouts.filter((w) => w.userId === req.user!.id);
  const moodCounts: { [key: string]: number } = {};
  logs.forEach((w) => {
    const m = w.moodAfterWorkout || 'Satisfied';
    moodCounts[m] = (moodCounts[m] || 0) + 1;
  });
  res.json(Object.keys(moodCounts).map((mood) => ({ name: mood, value: moodCounts[mood] })));
});

router.get('/workout-mix', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const logs = db.workouts.filter((w) => w.userId === req.user!.id);
  const typeCounts: { [key: string]: number } = {};
  logs.forEach((w) => {
    typeCounts[w.workoutType] = (typeCounts[w.workoutType] || 0) + 1;
  });
  res.json(Object.keys(typeCounts).map((type) => ({ name: type, value: typeCounts[type] })));
});

export default router;
