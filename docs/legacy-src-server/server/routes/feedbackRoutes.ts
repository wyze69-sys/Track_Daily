import express from 'express';
import { readDatabase, writeDatabase, Feedback } from '../../db/db';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const sorted = [...db.feedback].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  if (req.user!.role === 'admin') {
    res.json(sorted);
  } else {
    res.json(sorted.filter((f) => f.userId === req.user!.id));
  }
});

router.post('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ error: 'Feedback message content is required' });
    return;
  }
  const db = readDatabase();
  const profile = db.userProfiles.find((p) => p.userId === req.user!.id);
  const newFb: Feedback = {
    id: 'fb-' + Date.now(),
    userId: req.user!.id,
    userName: profile?.fullName || req.user!.email.split('@')[0],
    content,
    status: 'pending',
    date: new Date().toISOString()
  };
  db.feedback.unshift(newFb);
  writeDatabase(db);
  res.status(201).json(newFb);
});

router.put('/:id/status', authMiddleware, requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!status || (status !== 'pending' && status !== 'reviewed')) {
    res.status(400).json({ error: 'Valid status is required: pending or reviewed' });
    return;
  }
  const db = readDatabase();
  const index = db.feedback.findIndex((f) => f.id === req.params.id);
  if (index === -1) { res.status(404).json({ error: 'Feedback report not found' }); return; }
  db.feedback[index].status = status;
  writeDatabase(db);
  res.json(db.feedback[index]);
});

export default router;
