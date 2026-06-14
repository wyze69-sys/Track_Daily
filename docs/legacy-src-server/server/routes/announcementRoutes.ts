import express from 'express';
import { readDatabase, writeDatabase, Announcement } from '../../db/db';
import { authMiddleware, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const db = readDatabase();
  res.json(db.announcements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
});

router.post('/', authMiddleware, requireAdmin, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Announcement title and content body are required' });
    return;
  }
  const db = readDatabase();
  const newAnn: Announcement = {
    id: 'ann-' + Date.now(),
    title,
    content,
    date: new Date().toISOString()
  };
  db.announcements.unshift(newAnn);
  writeDatabase(db);
  res.status(201).json(newAnn);
});

router.delete('/:id', authMiddleware, requireAdmin, (req, res) => {
  const db = readDatabase();
  db.announcements = db.announcements.filter((a) => a.id !== req.params.id);
  writeDatabase(db);
  res.json({ message: 'Announcement deleted successfully' });
});

export default router;
