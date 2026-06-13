import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

import {
  readDatabase,
  writeDatabase,
  User,
  UserProfile,
  Workout,
  ExerciseCategory,
  WorkoutTemplate,
  Challenge,
  UserChallenge,
  Announcement,
  Feedback,
  WeeklyPlan,
  UserAchievement
} from './src/db/db';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.FITSYNC_JWT_SECRET || 'fitsync_v2_secret_key';

app.use(express.json());

// Helper to authenticate JWT
interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    role: 'student' | 'admin';
  };
}

function authMiddleware(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header missing or invalid' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'student' | 'admin' };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is invalid or expired' });
  }
}

function requireAdmin(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Requires Administrator role access' });
    return;
  }
  next();
}

// XP, Streak, Badge & Weekly Target calculation engine
function calculateCurrentWeekStartDate(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const mon = new Date(d.setDate(diff));
  return mon.toISOString().split('T')[0];
}

function processWorkoutLogging(userId: string, workoutType: string, duration: number, mood: string, note: string, templateId: string | null, exercises?: any[]) {
  const db = readDatabase();
  
  // 1. Calculate XP Earned
  let xpEarned = 50; // Base XP
  if (duration > 30) xpEarned += 20; // duration bonus
  if (mood || note) xpEarned += 10; // logging depth bonus

  // 2. Logging workout entry
  const newWorkout: Workout = {
    id: 'w-' + Date.now(),
    userId,
    workoutType,
    durationMinutes: duration,
    moodAfterWorkout: mood || 'Good',
    note: note || '',
    templateId,
    xpEarned,
    createdAt: new Date().toISOString(),
    exercises: exercises || []
  };
  db.workouts.push(newWorkout);

  // 3. Update User Profile (incorporating leveling logic)
  let profile = db.userProfiles.find(p => p.userId === userId);
  if (!profile) {
    profile = {
      userId,
      fullName: db.users.find(u => u.id === userId)?.email.split('@')[0] || 'Student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      level: 1,
      xp: 0,
      weeklyTarget: 3,
      currentStreak: 0,
      maxStreak: 0,
      lastWorkoutDate: null
    };
    db.userProfiles.push(profile);
  }

  // Add the earned XP points
  profile.xp += xpEarned;
  
  // Check leveling up (e.g. 100 XP per level)
  const calculatedLevel = Math.floor(profile.xp / 100) + 1;
  if (calculatedLevel > profile.level) {
    profile.level = calculatedLevel;
  }

  // 4. Update Weekly plan count
  const currentWeekMonday = calculateCurrentWeekStartDate();
  let weeklyPlan = db.weeklyPlans.find(wp => wp.userId === userId && wp.weekStartDate === currentWeekMonday);
  if (!weeklyPlan) {
    weeklyPlan = {
      id: 'wp-' + Date.now(),
      userId,
      targetCount: profile.weeklyTarget || 3,
      currentCount: 0,
      weekStartDate: currentWeekMonday
    };
    db.weeklyPlans.push(weeklyPlan);
  }

  weeklyPlan.currentCount += 1;
  
  // Grant completion bonus (+50 XP) if target is hit exactly on this log session
  if (weeklyPlan.currentCount === weeklyPlan.targetCount) {
    xpEarned += 50;
    profile.xp += 50;
    const levelCheck = Math.floor(profile.xp / 100) + 1;
    if (levelCheck > profile.level) {
      profile.level = levelCheck;
    }
    newWorkout.xpEarned += 50; // visual representation of total XP in logs
  }

  // 5. Streak calculation logic
  const now = new Date();
  const currentDateStr = now.toISOString().split('T')[0];
  
  // Yesterday's date
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const yesterdayDateStr = yesterday.toISOString().split('T')[0];

  if (!profile.lastWorkoutDate) {
    profile.currentStreak = 1;
    profile.maxStreak = Math.max(1, profile.maxStreak);
  } else if (profile.lastWorkoutDate === currentDateStr) {
    // Already logged today, streak stays current
  } else if (profile.lastWorkoutDate === yesterdayDateStr) {
    // Yesterday logged, streak increments
    profile.currentStreak += 1;
    profile.maxStreak = Math.max(profile.currentStreak, profile.maxStreak);
  } else {
    // Break streak (missed days), start from 1
    profile.currentStreak = 1;
  }
  profile.lastWorkoutDate = currentDateStr;

  // 6. Badges Unlocking Logic (Check conditions)
  const currentAchievements = db.userAchievements.filter(a => a.userId === userId);
  
  const grantBadge = (badgeId: string) => {
    if (!currentAchievements.some(a => a.badgeId === badgeId)) {
      db.userAchievements.push({
        id: 'ach-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        userId,
        badgeId,
        unlockedAt: new Date().toISOString()
      });
    }
  };

  // Badge 1: First Workout
  grantBadge('first_workout');

  // Badge 2: 3-Day Streak
  if (profile.currentStreak >= 3) {
    grantBadge('streak_3');
  }

  // Badge 3: Morning Mover (Checked if logged before 9:00 AM)
  const currentHour = now.getHours();
  if (currentHour < 9) {
    grantBadge('morning_mover');
  }

  // Badge 4: Strong Week (Checked if 4 workouts are logged this week)
  if (weeklyPlan.currentCount >= 4) {
    grantBadge('strong_week');
  }

  // 7. Check challenge progression
  const userChgs = db.userChallenges.filter(uc => uc.userId === userId && uc.status === 'active');
  userChgs.forEach(uc => {
    const parentChg = db.challenges.find(c => c.id === uc.challengeId);
    if (parentChg) {
      uc.progress += 1;
      if (uc.progress >= parentChg.targetWorkouts) {
        uc.status = 'completed';
        // Give challenge bonus XP
        profile!.xp += parentChg.xpReward;
        const finalLevelCheck = Math.floor(profile!.xp / 100) + 1;
        if (finalLevelCheck > profile!.level) {
          profile!.level = finalLevelCheck;
        }
      }
    }
  });

  writeDatabase(db);
  return { workout: newWorkout, profile, xpEarned };
}

// ---------------------- API ENDPOINTS ----------------------

// 1. AUTH API
app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password || !fullName) {
    res.status(400).json({ error: 'All fields are strictly required: email, password, fullName' });
    return;
  }

  const db = readDatabase();
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    res.status(400).json({ error: 'A student or administrator under this email already exists' });
    return;
  }

  const userId = 'u-' + Date.now();
  const passwordHash = bcrypt.hashSync(password, 10);
  const role = email.toLowerCase().includes('admin') ? 'admin' : 'student';

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
    avatar: `https://images.unsplash.com/photo-${role === 'admin' ? '1570295999919-56ceb5ecca61' : '1535713875002-d1d0cf377fde'}?w=150`,
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
  res.status(201).json({ token, user: { id: userId, email: newUser.email, role: newUser.role, fullName, avatar: newProfile.avatar } });
});

app.post('/api/auth/login', (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  email = email.toLowerCase().trim();
  const db = readDatabase();
  const user = db.users.find(u => u.email === email);
  if (!user) {
    res.status(401).json({ error: 'Invalid login credentials' });
    return;
  }

  // Handle support check for seeded passwords
  let isValid = false;
  if (user.id === 'u-student' && password === 'password') {
    isValid = true;
  } else if (user.id === 'u-admin' && password === 'admin') {
    isValid = true;
  } else {
    isValid = bcrypt.compareSync(password, user.passwordHash);
  }

  if (!isValid) {
    res.status(401).json({ error: 'Invalid login credentials' });
    return;
  }

  const profile = db.userProfiles.find(p => p.userId === user.id) || {
    fullName: user.role === 'admin' ? 'Administrator' : 'Fity Student',
    avatar: `https://images.unsplash.com/photo-${user.role === 'admin' ? '1570295999919-56ceb5ecca61' : '1535713875002-d1d0cf377fde'}?w=150`
  };

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, fullName: profile.fullName, avatar: profile.avatar } });
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const profile = db.userProfiles.find(p => p.userId === req.user!.id);
  res.json({
    id: req.user!.id,
    email: req.user!.email,
    role: req.user!.role,
    fullName: profile?.fullName || 'User',
    avatar: profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    profile
  });
});

// 2. WORKOUTS API
app.get('/api/workouts', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const userWorkouts = db.workouts
    .filter(w => w.userId === req.user!.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userWorkouts);
});

app.get('/api/workouts/recent', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const recent = db.workouts
    .filter(w => w.userId === req.user!.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  res.json(recent);
});

app.get('/api/workouts/last', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const userLogs = db.workouts.filter(w => w.userId === req.user!.id);
  if (userLogs.length === 0) {
    res.json(null);
    return;
  }
  const last = userLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  res.json(last);
});

app.post('/api/workouts', authMiddleware, (req: AuthenticatedRequest, res) => {
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

app.put('/api/workouts/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { workoutType, durationMinutes, moodAfterWorkout, note, exercises } = req.body;
  const db = readDatabase();
  const index = db.workouts.findIndex(w => w.id === req.params.id && w.userId === req.user!.id);

  if (index === -1) {
    res.status(404).json({ error: 'Workout session not found' });
    return;
  }

  db.workouts[index] = {
    ...db.workouts[index],
    workoutType: workoutType || db.workouts[index].workoutType,
    durationMinutes: durationMinutes ? parseInt(durationMinutes) : db.workouts[index].durationMinutes,
    moodAfterWorkout: moodAfterWorkout || db.workouts[index].moodAfterWorkout,
    note: note !== undefined ? note : db.workouts[index].note,
    exercises: exercises !== undefined ? exercises : db.workouts[index].exercises
  };

  writeDatabase(db);
  res.json(db.workouts[index]);
});

app.delete('/api/workouts/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const initialLength = db.workouts.length;
  db.workouts = db.workouts.filter(w => !(w.id === req.params.id && w.userId === req.user!.id));

  if (db.workouts.length === initialLength) {
    res.status(404).json({ error: 'Workout log not found' });
    return;
  }

  writeDatabase(db);
  res.json({ message: 'Workout log deleted successfully' });
});

// 3. QUICK LOGS API
app.post('/api/workouts/quick-log', authMiddleware, (req: AuthenticatedRequest, res) => {
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

app.post('/api/workouts/repeat-last', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const studentLogs = db.workouts.filter(w => w.userId === req.user!.id);
  if (studentLogs.length === 0) {
    res.status(400).json({ error: 'No previous workout exists to repeat. Create a new log first!' });
    return;
  }

  const lastLogged = studentLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
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

// 4. WEEKLY PLAN API
app.get('/api/weekly-plan', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const monday = calculateCurrentWeekStartDate();
  let plan = db.weeklyPlans.find(wp => wp.userId === req.user!.id && wp.weekStartDate === monday);
  if (!plan) {
    const profile = db.userProfiles.find(p => p.userId === req.user!.id);
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

app.post('/api/weekly-plan', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { targetCount } = req.body;
  if (!targetCount) {
    res.status(400).json({ error: 'targetCount is required' });
    return;
  }

  const db = readDatabase();
  const monday = calculateCurrentWeekStartDate();
  
  // Update in profiles
  const profile = db.userProfiles.find(p => p.userId === req.user!.id);
  if (profile) {
    profile.weeklyTarget = parseInt(targetCount);
  }

  let plan = db.weeklyPlans.find(wp => wp.userId === req.user!.id && wp.weekStartDate === monday);
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

// 5. PROGRESS SERVICE
app.get('/api/progress/summary', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const logs = db.workouts.filter(w => w.userId === req.user!.id);
  const profile = db.userProfiles.find(p => p.userId === req.user!.id) || {
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

app.get('/api/progress/consistency', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const logs = db.workouts.filter(w => w.userId === req.user!.id);
  
  // Group workouts by day of week over the last 30 days
  const weekdayCounts: { [key: string]: number } = {
    'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  logs.forEach(w => {
    const d = new Date(w.createdAt);
    const dayName = days[d.getDay()];
    if (dayName in weekdayCounts) {
      weekdayCounts[dayName] += 1;
    }
  });

  const chartData = Object.keys(weekdayCounts).map(day => ({
    name: day,
    count: weekdayCounts[day]
  }));

  res.json(chartData);
});

app.get('/api/progress/mood', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const logs = db.workouts.filter(w => w.userId === req.user!.id);
  
  const moodCounts: { [key: string]: number } = {};
  logs.forEach(w => {
    const m = w.moodAfterWorkout || 'Satisfied';
    moodCounts[m] = (moodCounts[m] || 0) + 1;
  });

  const data = Object.keys(moodCounts).map(mood => ({
    name: mood,
    value: moodCounts[mood]
  }));

  res.json(data);
});

app.get('/api/progress/workout-mix', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const logs = db.workouts.filter(w => w.userId === req.user!.id);
  
  const typeCounts: { [key: string]: number } = {};
  logs.forEach(w => {
    const t = w.workoutType;
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  const data = Object.keys(typeCounts).map(type => ({
    name: type,
    value: typeCounts[type]
  }));

  res.json(data);
});

// 6. GAMIFICATION API (Badges, summary)
app.get('/api/gamification/summary', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const profile = db.userProfiles.find(p => p.userId === req.user!.id);
  const achievements = db.userAchievements.filter(a => a.userId === req.user!.id);
  
  res.json({
    level: profile?.level || 1,
    xp: profile?.xp || 0,
    currentStreak: profile?.currentStreak || 0,
    maxStreak: profile?.maxStreak || 0,
    badgesCount: achievements.length,
    nextLevelXp: ((profile?.level || 1) * 100)
  });
});

app.get('/api/gamification/badges', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const unlocked = db.userAchievements.filter(a => a.userId === req.user!.id);
  
  const BADGES_INFO = [
    { id: 'first_workout', name: 'First Workout', description: 'Log your very first workout in FitSync.', icon: 'CheckCircle' },
    { id: 'streak_3', name: 'Consistency Starter', description: 'Unlock by reaching a 3-day workout streak.', icon: 'Zap' },
    { id: 'morning_mover', name: 'Morning Mover', description: 'Log a workout before 9 AM.', icon: 'Gauge' },
    { id: 'strong_week', name: 'Strong Week', description: 'Log 4 or more workouts in a single calendar week.', icon: 'Flame' }
  ];

  const response = BADGES_INFO.map(badge => {
    const ach = unlocked.find(u => u.badgeId === badge.id);
    return {
      ...badge,
      unlocked: !!ach,
      unlockedAt: ach ? ach.unlockedAt : null
    };
  });

  res.json(response);
});

// 7. AI WEEKLY INSIGHTS
app.get('/api/insights/latest', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const insightsForUser = db.workouts.filter(w => w.userId === req.user!.id);
  
  // Reconstruct dynamic insight if DB doesn't have an AI collection
  const total = insightsForUser.length;
  const totalMin = insightsForUser.reduce((acc, w) => acc + w.durationMinutes, 0);
  const streak = db.userProfiles.find(p => p.userId === req.user!.id)?.currentStreak || 0;

  // Let's find latest AI weekly insight
  const userInsights = db.workouts.length; 
  // Custom message
  let text = `You've logged ${total} workouts total so far, totaling ${totalMin} minutes of focus! Your current streak is ${streak} days. You are building amazing healthy habits. Keep showing up!`;
  if (total === 0) {
    text = "Welcome to FitSync v2! You haven't logged any workouts this week. It takes under a minute to start. How about a quick 10-minute jog or standard stretch today?";
  }

  res.json({ text, date: new Date().toISOString() });
});

app.post('/api/insights/generate', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const userLogs = db.workouts.filter(w => w.userId === req.user!.id);
  const userProfile = db.userProfiles.find(p => p.userId === req.user!.id);

  const workoutsThisWeek = userLogs.length; 
  const totalMinutes = userLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const preferredCategory = userLogs.reduce((acc, curr) => {
    acc[curr.workoutType] = (acc[curr.workoutType] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const sortedCats = Object.keys(preferredCategory).sort((a,b) => preferredCategory[b] - preferredCategory[a]);
  const favoriteType = sortedCats[0] || 'none yet';

  // Ask Gemini if key is provided
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `Provide a friendly, supportive, and extremely concise weekly exercise reflection for a university student.
      Here are the student stats for this week:
      - Workouts logged: ${workoutsThisWeek}
      - Total duration: ${totalMinutes} minutes
      - Favorite workout category: ${favoriteType}
      - Current streak: ${userProfile?.currentStreak || 0} days
      - Weekly target set: ${userProfile?.weeklyTarget || 3} workouts

      Keep the tone warm, empathetic, and encouraging (max 3 short sentences!).
      Avoid medical advice, diet analysis, smartwatch metrics, or fitness coaching jargon. Reference the student's busy schedule, and suggest one simple activity like taking a 10-minute stretch or walk in between classes. Do not use asterisks or headers in the text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      const responseText = response.text || '';
      res.json({ text: responseText.replace(/\*/g, '').trim(), date: new Date().toISOString() });
      return;
    } catch (err) {
      console.error("Gemini API call failed, using high-fidelity fallback generator", err);
    }
  }

  // Backup encouragement generator when API key is missing
  let fallbackText = `You completed ${workoutsThisWeek} workouts this week totaling ${totalMinutes} minutes. `;
  if (favoriteType !== 'none yet') {
    fallbackText += `Your most consistent workouts are in ${favoriteType}. `;
  }
  if (workoutsThisWeek >= (userProfile?.weeklyTarget || 3)) {
    fallbackText += `You smashed your weekly target! Excellent execution. Try a light stretching session before exams next week.`;
  } else {
    fallbackText += `Consistency beats intensity. Even logging a quick 10-minute workout before classes counts. Keep it up!`;
  }

  res.json({ text: fallbackText, date: new Date().toISOString() });
});

// 8. ADMIN API
app.get('/api/admin/dashboard', authMiddleware, requireAdmin, (req, res) => {
  const db = readDatabase();
  const totalUsersCount = db.users.length;
  const totalWorkoutsCount = db.workouts.length;
  const totalCategoriesCount = db.exerciseCategories.length;
  const totalFeedbackCount = db.feedback.length;

  // Summarized Analytics
  const activeStreakCount = db.userProfiles.reduce((acc, curr) => acc + (curr.currentStreak > 0 ? 1 : 0), 0);
  const totalXpEarned = db.userProfiles.reduce((acc, curr) => acc + curr.xp, 0);

  // Recent Users (last 5 sorted by registration date)
  const recentUsers = db.users
    .map(u => {
      const profile = db.userProfiles.find(p => p.userId === u.id);
      return {
        id: u.id,
        email: u.email,
        role: u.role,
        fullName: profile?.fullName || 'N/A',
        createdAt: u.createdAt
      };
    })
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  // Recent Workouts (last 5 logged workouts with student names)
  const recentWorkouts = db.workouts
    .map(w => {
      const user = db.users.find(u => u.id === w.userId);
      const profile = db.userProfiles.find(p => p.userId === w.userId);
      return {
        id: w.id,
        workoutType: w.workoutType,
        durationMinutes: w.durationMinutes,
        userName: profile?.fullName || user?.email?.split('@')[0] || 'Unknown',
        createdAt: w.createdAt
      };
    })
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  res.json({
    totalUsersCount,
    totalWorkoutsCount,
    totalCategoriesCount,
    totalFeedbackCount,
    activeStreakCount,
    totalXpEarned,
    categories: db.exerciseCategories,
    recentFeedback: [...db.feedback].sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime()).slice(0, 5),
    recentUsers,
    recentWorkouts
  });
});

app.get('/api/admin/users', authMiddleware, requireAdmin, (req, res) => {
  const db = readDatabase();
  const userList = db.users.map(u => {
    const profile = db.userProfiles.find(p => p.userId === u.id);
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      fullName: profile?.fullName || 'N/A',
      level: profile?.level || 1,
      xp: profile?.xp || 0,
      currentStreak: profile?.currentStreak || 0,
      createdAt: u.createdAt
    };
  });
  res.json(userList);
});

// ADMIN CATEGORIES
app.get('/api/categories', authMiddleware, (req, res) => {
  const db = readDatabase();
  res.json(db.exerciseCategories);
});

app.post('/api/categories', authMiddleware, requireAdmin, (req: AuthenticatedRequest, res) => {
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

app.put('/api/categories/:id', authMiddleware, requireAdmin, (req, res) => {
  const { name, icon, description } = req.body;
  const db = readDatabase();
  const index = db.exerciseCategories.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Exercise category not found' });
    return;
  }
  db.exerciseCategories[index] = {
    ...db.exerciseCategories[index],
    name: name || db.exerciseCategories[index].name,
    icon: icon || db.exerciseCategories[index].icon,
    description: description !== undefined ? description : db.exerciseCategories[index].description
  };
  writeDatabase(db);
  res.json(db.exerciseCategories[index]);
});

app.delete('/api/categories/:id', authMiddleware, requireAdmin, (req, res) => {
  const db = readDatabase();
  const initialLength = db.exerciseCategories.length;
  db.exerciseCategories = db.exerciseCategories.filter(c => c.id !== req.params.id);
  if (db.exerciseCategories.length === initialLength) {
    res.status(404).json({ error: 'Exercise category not found' });
    return;
  }
  writeDatabase(db);
  res.json({ message: 'Category deleted successfully' });
});

// ADMIN TEMPLATES API
app.get('/api/templates', authMiddleware, (req, res) => {
  const db = readDatabase();
  res.json(db.workoutTemplates);
});

app.post('/api/templates', authMiddleware, (req: AuthenticatedRequest, res) => {
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

app.put('/api/templates/:id', authMiddleware, (req, res) => {
  const { name, category, durationMinutes, exercises } = req.body;
  const db = readDatabase();
  const index = db.workoutTemplates.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Workout template not found' });
    return;
  }
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

app.delete('/api/templates/:id', authMiddleware, (req, res) => {
  const db = readDatabase();
  db.workoutTemplates = db.workoutTemplates.filter(t => t.id !== req.params.id);
  writeDatabase(db);
  res.json({ message: 'Workout template removed' });
});

// ADMIN CHALLENGES API
app.get('/api/challenges', authMiddleware, (req, res) => {
  const db = readDatabase();
  res.json(db.challenges);
});

app.post('/api/challenges', authMiddleware, requireAdmin, (req, res) => {
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
    endDate: endDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
  };
  db.challenges.push(newChg);
  writeDatabase(db);
  res.status(201).json(newChg);
});

app.put('/api/challenges/:id', authMiddleware, requireAdmin, (req, res) => {
  const { title, description, targetWorkouts, xpReward, endDate } = req.body;
  const db = readDatabase();
  const index = db.challenges.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Challenge not found' });
    return;
  }
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

app.delete('/api/challenges/:id', authMiddleware, requireAdmin, (req, res) => {
  const db = readDatabase();
  db.challenges = db.challenges.filter(c => c.id !== req.params.id);
  writeDatabase(db);
  res.json({ message: 'Challenge deleted successfully' });
});

// STUDENT OPT-IN CHALLENGES
app.post('/api/challenges/:id/opt-in', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const chg = db.challenges.find(c => c.id === req.params.id);
  if (!chg) {
    res.status(404).json({ error: 'Selected challenge not found' });
    return;
  }

  const existing = db.userChallenges.find(uc => uc.userId === req.user!.id && uc.challengeId === req.params.id);
  if (existing) {
    res.json(existing);
    return;
  }

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

app.get('/api/challenges/user/active', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const ucs = db.userChallenges.filter(uc => uc.userId === req.user!.id);
  const detailed = ucs.map(uc => {
    const parent = db.challenges.find(c => c.id === uc.challengeId);
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

// ANNOUNCEMENTS USER AND ADMIN API
app.get('/api/announcements', authMiddleware, (req, res) => {
  const db = readDatabase();
  res.json(db.announcements.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
});

app.post('/api/announcements', authMiddleware, requireAdmin, (req, res) => {
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

app.delete('/api/announcements/:id', authMiddleware, requireAdmin, (req, res) => {
  const db = readDatabase();
  db.announcements = db.announcements.filter(a => a.id !== req.params.id);
  writeDatabase(db);
  res.json({ message: 'Announcement deleted successfully' });
});

// FEEDBACK API
app.get('/api/feedback', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  if (req.user!.role === 'admin') {
    res.json(db.feedback.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  } else {
    res.json(db.feedback.filter(f => f.userId === req.user!.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }
});

app.post('/api/feedback', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ error: 'Feedback message content is required' });
    return;
  }
  const db = readDatabase();
  const profile = db.userProfiles.find(p => p.userId === req.user!.id);
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

app.put('/api/feedback/:id/status', authMiddleware, requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!status || (status !== 'pending' && status !== 'reviewed')) {
    res.status(400).json({ error: 'Valid status is required: pending or reviewed' });
    return;
  }
  const db = readDatabase();
  const index = db.feedback.findIndex(f => f.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Feedback report not found' });
    return;
  }
  db.feedback[index].status = status;
  writeDatabase(db);
  res.json(db.feedback[index]);
});


// ---------------- Vite Middleware & Asset Serving ----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitSync v2 custom Express server running on port ${PORT}`);
  });
}

startServer();
