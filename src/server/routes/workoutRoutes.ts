import express from 'express';
import { readDatabase, writeDatabase } from '../../db/db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { processWorkoutLogging, withEstimatedCalories } from '../services/workoutEngine';

const router = express.Router();

router.get('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const profile = db.userProfiles.find((p) => p.userId === req.user!.id);
  const userWorkouts = db.workouts
    .filter((w) => w.userId === req.user!.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((workout) => withEstimatedCalories(workout, profile));
  res.json(userWorkouts);
});

router.get('/recent', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const profile = db.userProfiles.find((p) => p.userId === req.user!.id);
  const recent = db.workouts
    .filter((w) => w.userId === req.user!.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((workout) => withEstimatedCalories(workout, profile));
  res.json(recent);
});

router.get('/last', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const profile = db.userProfiles.find((p) => p.userId === req.user!.id);
  const userLogs = db.workouts.filter((w) => w.userId === req.user!.id);
  if (userLogs.length === 0) { res.json(null); return; }
  const last = userLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  res.json(withEstimatedCalories(last, profile));
});

router.post('/quick-log', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { workoutType, durationMinutes, moodAfterWorkout, note, templateId, exercises } = req.body;
  if (!workoutType || !durationMinutes) {
    res.status(400).json({ error: 'workout_type and duration_minutes are mandatory' });
    return;
  }
  const result = processWorkoutLogging(
    req.user!.id,
    workoutType,
    parseInt(durationMinutes),
    moodAfterWorkout || 'Satisfied',
    note || '',
    templateId || null,
    exercises
  );
  res.json(result);
});

router.post('/repeat-last', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const studentLogs = db.workouts.filter((w) => w.userId === req.user!.id);
  if (studentLogs.length === 0) {
    res.status(400).json({ error: 'No previous workout exists to repeat. Create a new log first!' });
    return;
  }
  const lastLogged = studentLogs.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
  const result = processWorkoutLogging(
    req.user!.id,
    lastLogged.workoutType,
    lastLogged.durationMinutes,
    lastLogged.moodAfterWorkout || 'Satisfied',
    'Repeated last log',
    lastLogged.templateId,
    lastLogged.exercises
  );
  res.json(result);
});

router.post('/', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { workoutType, durationMinutes, moodAfterWorkout, note, templateId, exercises } = req.body;
  if (!workoutType || !durationMinutes) {
    res.status(400).json({ error: 'Workout type and duration in minutes are required' });
    return;
  }
  const result = processWorkoutLogging(
    req.user!.id,
    workoutType,
    parseInt(durationMinutes),
    moodAfterWorkout,
    note,
    templateId || null,
    exercises
  );
  res.status(201).json(result);
});

router.put('/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { workoutType, durationMinutes, moodAfterWorkout, note, exercises } = req.body;
  const db = readDatabase();
  const profile = db.userProfiles.find((p) => p.userId === req.user!.id);
  const index = db.workouts.findIndex((w) => w.id === req.params.id && w.userId === req.user!.id);
  if (index === -1) { res.status(404).json({ error: 'Workout session not found' }); return; }

  db.workouts[index] = {
    ...db.workouts[index],
    workoutType: workoutType || db.workouts[index].workoutType,
    durationMinutes: durationMinutes ? parseInt(durationMinutes) : db.workouts[index].durationMinutes,
    moodAfterWorkout: moodAfterWorkout || db.workouts[index].moodAfterWorkout,
    note: note !== undefined ? note : db.workouts[index].note,
    exercises: exercises !== undefined ? exercises : db.workouts[index].exercises
  };
  db.workouts[index] = withEstimatedCalories(db.workouts[index], profile);
  writeDatabase(db);
  res.json(db.workouts[index]);
});

router.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const initialLength = db.workouts.length;
  db.workouts = db.workouts.filter((w) => !(w.id === req.params.id && w.userId === req.user!.id));
  if (db.workouts.length === initialLength) {
    res.status(404).json({ error: 'Workout log not found' });
    return;
  }
  writeDatabase(db);
  res.json({ message: 'Workout log deleted successfully' });
});

export default router;
