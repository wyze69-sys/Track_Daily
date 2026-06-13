import express from 'express';
import { readDatabase } from '../../db/db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const BADGES_INFO = [
  { id: 'first_workout', name: 'First Workout',        description: 'Log your very first workout in logweb.',           icon: 'CheckCircle' },
  { id: 'streak_3',      name: 'Consistency Starter',  description: 'Unlock by reaching a 3-day workout streak.',       icon: 'Zap' },
  { id: 'morning_mover', name: 'Morning Mover',        description: 'Log a workout before 9 AM.',                       icon: 'Gauge' },
  { id: 'strong_week',   name: 'Strong Week',          description: 'Log 4 or more workouts in a single calendar week.',icon: 'Flame' }
];

const router = express.Router();

router.get('/summary', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const profile = db.userProfiles.find((p) => p.userId === req.user!.id);
  const achievements = db.userAchievements.filter((a) => a.userId === req.user!.id);
  res.json({
    level: profile?.level || 1,
    xp: profile?.xp || 0,
    currentStreak: profile?.currentStreak || 0,
    maxStreak: profile?.maxStreak || 0,
    badgesCount: achievements.length,
    nextLevelXp: (profile?.level || 1) * 100
  });
});

router.get('/badges', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const unlocked = db.userAchievements.filter((a) => a.userId === req.user!.id);
  const response = BADGES_INFO.map((badge) => {
    const ach = unlocked.find((u) => u.badgeId === badge.id);
    return { ...badge, unlocked: !!ach, unlockedAt: ach ? ach.unlockedAt : null };
  });
  res.json(response);
});

export default router;
