import express from 'express';
import { readDatabase, writeDatabase, Challenge, UserChallenge } from '../../db/db';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

router.get('/user/active', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const ucs = db.userChallenges.filter((uc) => uc.userId === req.user!.id);
  const detailed = ucs.map((uc) => {
    const parent = db.challenges.find((c) => c.id === uc.challengeId);
    return {
      ...uc,
      title: parent?.title || 'Challenge',
      description: parent?.description || '',
      targetWorkouts: parent?.targetWorkouts || 1,
      xpReward: parent?.xpReward || 50
    };
  });
  res.json(detailed);
});

router.get('/', authMiddleware, (req, res) => {
  const db = readDatabase();
  res.json(db.challenges);
});

router.post('/', authMiddleware, requireAdmin, (req, res) => {
  const { title, description, targetWorkouts, xpReward, endDate } = req.body;
  if (!title || !targetWorkouts || !xpReward) {
    res.status(400).json({ error: 'Challenge title, targets, and XP awards are required' });
    return;
  }
  const db = readDatabase();
  const newChg: Challenge = {
    id: 'chg-' + Date.now(),
    title,
    description: description || '',
    targetWorkouts: parseInt(targetWorkouts),
    xpReward: parseInt(xpReward),
    endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
  db.challenges.push(newChg);
  writeDatabase(db);
  res.status(201).json(newChg);
});

router.put('/:id', authMiddleware, requireAdmin, (req, res) => {
  const { title, description, targetWorkouts, xpReward, endDate } = req.body;
  const db = readDatabase();
  const index = db.challenges.findIndex((c) => c.id === req.params.id);
  if (index === -1) { res.status(404).json({ error: 'Challenge not found' }); return; }
  db.challenges[index] = {
    ...db.challenges[index],
    title: title || db.challenges[index].title,
    description: description !== undefined ? description : db.challenges[index].description,
    targetWorkouts: targetWorkouts ? parseInt(targetWorkouts) : db.challenges[index].targetWorkouts,
    xpReward: xpReward ? parseInt(xpReward) : db.challenges[index].xpReward,
    endDate: endDate || db.challenges[index].endDate
  };
  writeDatabase(db);
  res.json(db.challenges[index]);
});

router.delete('/:id', authMiddleware, requireAdmin, (req, res) => {
  const db = readDatabase();
  db.challenges = db.challenges.filter((c) => c.id !== req.params.id);
  writeDatabase(db);
  res.json({ message: 'Challenge deleted successfully' });
});

router.post('/:id/opt-in', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const chg = db.challenges.find((c) => c.id === req.params.id);
  if (!chg) { res.status(404).json({ error: 'Selected challenge not found' }); return; }

  const existing = db.userChallenges.find(
    (uc) => uc.userId === req.user!.id && uc.challengeId === req.params.id
  );
  if (existing) { res.json(existing); return; }

  const newOptIn: UserChallenge = {
    id: 'uc-' + Date.now(),
    userId: req.user!.id,
    challengeId: req.params.id,
    progress: 0,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  db.userChallenges.push(newOptIn);
  writeDatabase(db);
  res.status(201).json(newOptIn);
});

export default router;
