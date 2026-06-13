import express from 'express';
import { readDatabase, writeDatabase, WorkoutTemplate } from '../../db/db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const db = readDatabase();
  res.json(db.workoutTemplates);
});

router.post('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { name, category, durationMinutes, exercises } = req.body;
  if (!name || !category || !durationMinutes) {
    res.status(400).json({ error: 'Template name, category, and standard duration are required' });
    return;
  }
  const db = readDatabase();
  const newTpl: WorkoutTemplate = {
    id: 'tpl-' + Date.now(),
    name,
    category,
    durationMinutes: parseInt(durationMinutes),
    createdBy: req.user!.id,
    createdAt: new Date().toISOString(),
    exercises: exercises || []
  };
  db.workoutTemplates.push(newTpl);
  writeDatabase(db);
  res.status(201).json(newTpl);
});

router.put('/:id', authMiddleware, (req, res) => {
  const { name, category, durationMinutes, exercises } = req.body;
  const db = readDatabase();
  const index = db.workoutTemplates.findIndex((t) => t.id === req.params.id);
  if (index === -1) { res.status(404).json({ error: 'Workout template not found' }); return; }
  db.workoutTemplates[index] = {
    ...db.workoutTemplates[index],
    name: name || db.workoutTemplates[index].name,
    category: category || db.workoutTemplates[index].category,
    durationMinutes: durationMinutes ? parseInt(durationMinutes) : db.workoutTemplates[index].durationMinutes,
    exercises: exercises !== undefined ? exercises : db.workoutTemplates[index].exercises
  };
  writeDatabase(db);
  res.json(db.workoutTemplates[index]);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const db = readDatabase();
  db.workoutTemplates = db.workoutTemplates.filter((t) => t.id !== req.params.id);
  writeDatabase(db);
  res.json({ message: 'Workout template removed' });
});

export default router;
