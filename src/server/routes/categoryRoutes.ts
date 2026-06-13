import express from 'express';
import { readDatabase, writeDatabase, ExerciseCategory } from '../../db/db';
import { authMiddleware, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const db = readDatabase();
  res.json(db.exerciseCategories);
});

router.post('/', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res) => {
  const { name, icon, description } = req.body;
  if (!name || !icon) {
    res.status(400).json({ error: 'Category name and icon class name are required' });
    return;
  }
  const db = readDatabase();
  const newCat: ExerciseCategory = {
    id: 'cat-' + Date.now(),
    name,
    icon,
    description: description || '',
    createdBy: req.user!.id,
    createdAt: new Date().toISOString()
  };
  db.exerciseCategories.push(newCat);
  writeDatabase(db);
  res.status(201).json(newCat);
});

router.put('/:id', authMiddleware, requireAdmin, (req, res) => {
  const { name, icon, description } = req.body;
  const db = readDatabase();
  const index = db.exerciseCategories.findIndex((c) => c.id === req.params.id);
  if (index === -1) { res.status(404).json({ error: 'Exercise category not found' }); return; }
  db.exerciseCategories[index] = {
    ...db.exerciseCategories[index],
    name: name || db.exerciseCategories[index].name,
    icon: icon || db.exerciseCategories[index].icon,
    description: description !== undefined ? description : db.exerciseCategories[index].description
  };
  writeDatabase(db);
  res.json(db.exerciseCategories[index]);
});

router.delete('/:id', authMiddleware, requireAdmin, (req, res) => {
  const db = readDatabase();
  const initialLength = db.exerciseCategories.length;
  db.exerciseCategories = db.exerciseCategories.filter((c) => c.id !== req.params.id);
  if (db.exerciseCategories.length === initialLength) {
    res.status(404).json({ error: 'Exercise category not found' });
    return;
  }
  writeDatabase(db);
  res.json({ message: 'Category deleted successfully' });
});

export default router;
