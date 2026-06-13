import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { readDatabase, writeDatabase, User, UserProfile } from '../../db/db';
import { authMiddleware, AuthenticatedRequest, JWT_SECRET } from '../middleware/auth';

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password } = req.body;
  const fullName = typeof req.body.fullName === 'string' ? req.body.fullName : req.body.name;
  if (!email || !password || !fullName) {
    res.status(400).json({ error: 'All fields are strictly required: email, password, fullName' });
    return;
  }

  const db = readDatabase();
  const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    res.status(400).json({ error: 'A student or administrator under this email already exists' });
    return;
  }

  const userId = 'u-' + Date.now();
  const passwordHash = bcrypt.hashSync(password, 10);
  const role = 'student';

  const newUser: User = {
    id: userId,
    email: email.toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date().toISOString()
  };

  const newProfile: UserProfile = {
    userId,
    fullName,
    avatar: '',
    level: 1,
    xp: 0,
    weeklyTarget: 3,
    currentStreak: 0,
    maxStreak: 0,
    lastWorkoutDate: null
  };

  db.users.push(newUser);
  db.userProfiles.push(newProfile);
  writeDatabase(db);

  const token = jwt.sign({ id: userId, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    token,
    user: { id: userId, email: newUser.email, role: newUser.role, fullName, avatar: newProfile.avatar }
  });
});

router.post('/login', (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  email = email.toLowerCase().trim();
  const db = readDatabase();
  const user = db.users.find((u) => u.email === email);
  if (!user) {
    res.status(401).json({ error: 'Invalid login credentials' });
    return;
  }

  const isValid = bcrypt.compareSync(password, user.passwordHash);

  if (!isValid) {
    res.status(401).json({ error: 'Invalid login credentials' });
    return;
  }

  const profile = db.userProfiles.find((p) => p.userId === user.id) || {
    fullName: 'User',
    avatar: ''
  };

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, fullName: profile.fullName, avatar: profile.avatar }
  });
});

router.get('/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const profile = db.userProfiles.find((p) => p.userId === req.user!.id);
  res.json({
    id: req.user!.id,
    email: req.user!.email,
    role: req.user!.role,
    fullName: profile?.fullName || 'User',
    avatar: profile?.avatar || '',
    profile
  });
});

export default router;
