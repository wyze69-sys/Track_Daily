import express from 'express';
import authRoutes from './routes/authRoutes';
import workoutRoutes from './routes/workoutRoutes';
import weeklyPlanRoutes from './routes/weeklyPlanRoutes';
import progressRoutes from './routes/progressRoutes';
import gamificationRoutes from './routes/gamificationRoutes';
import insightRoutes from './routes/insightRoutes';
import adminRoutes from './routes/adminRoutes';
import categoryRoutes from './routes/categoryRoutes';
import templateRoutes from './routes/templateRoutes';
import challengeRoutes from './routes/challengeRoutes';
import announcementRoutes from './routes/announcementRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import nutritionRoutes from './routes/nutritionRoutes';
import profileRoutes from './routes/profileRoutes';

export const app = express();

// ── Global Middleware ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Route Mounting ───────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/workouts',      workoutRoutes);
app.use('/api/weekly-plan',   weeklyPlanRoutes);
app.use('/api/progress',      progressRoutes);
app.use('/api/gamification',  gamificationRoutes);
app.use('/api/insights',      insightRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/templates',     templateRoutes);
app.use('/api/challenges',    challengeRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/feedback',      feedbackRoutes);
app.use('/api/nutrition',     nutritionRoutes);
app.use('/api/profile',       profileRoutes);


