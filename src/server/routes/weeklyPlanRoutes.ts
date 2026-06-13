import express from 'express';
import { readDatabase, writeDatabase } from '../../db/db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { calculateCurrentWeekStartDate } from '../services/workoutEngine';

const router = express.Router();

router.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const monday = calculateCurrentWeekStartDate();
  let plan = db.weeklyPlans.find(
    (wp) => wp.userId === req.user!.id && wp.weekStartDate === monday
  );
  if (!plan) {
    const profile = db.userProfiles.find((p) => p.userId === req.user!.id);
    const target = profile ? profile.weeklyTarget : 3;
    plan = {
      id: 'wp-' + Date.now(),
      userId: req.user!.id,
      targetCount: target,
      currentCount: 0,
      weekStartDate: monday
    };
    db.weeklyPlans.push(plan);
    writeDatabase(db);
  }
  res.json(plan);
});

router.post('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { targetCount } = req.body;
  if (!targetCount) {
    res.status(400).json({ error: 'targetCount is required' });
    return;
  }

  const db = readDatabase();
  const monday = calculateCurrentWeekStartDate();

  const profile = db.userProfiles.find((p) => p.userId === req.user!.id);
  if (profile) profile.weeklyTarget = parseInt(targetCount);

  let plan = db.weeklyPlans.find(
    (wp) => wp.userId === req.user!.id && wp.weekStartDate === monday
  );
  if (plan) {
    plan.targetCount = parseInt(targetCount);
  } else {
    plan = {
      id: 'wp-' + Date.now(),
      userId: req.user!.id,
      targetCount: parseInt(targetCount),
      currentCount: 0,
      weekStartDate: monday
    };
    db.weeklyPlans.push(plan);
  }

  writeDatabase(db);
  res.json(plan);
});

export default router;
