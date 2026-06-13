import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { readDatabase } from '../../db/db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { calculateDetailedMacroTargets } from '../utils/nutritionCalculations';
import { mealRecommendationService } from '../services/mealRecommendationService';

const router = express.Router();

router.get('/latest', authMiddleware, (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const userLogs = db.workouts.filter((w) => w.userId === req.user!.id);
  const total = userLogs.length;
  const totalMin = userLogs.reduce((acc, w) => acc + w.durationMinutes, 0);
  const streak = db.userProfiles.find((p) => p.userId === req.user!.id)?.currentStreak || 0;

  let text = `You've logged ${total} workouts total so far, totaling ${totalMin} minutes of focus! Your current streak is ${streak} days. You are building amazing healthy habits. Keep showing up!`;
  if (total === 0) {
    text = "You have no workouts logged yet. Once you log an activity, this panel will summarize your real workout history.";
  }
  res.json({ text, date: new Date().toISOString() });
});

router.post('/generate', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const db = readDatabase();
  const userLogs = db.workouts.filter((w) => w.userId === req.user!.id);
  const userProfile = db.userProfiles.find((p) => p.userId === req.user!.id);

  const workoutsThisWeek = userLogs.length;
  const totalMinutes = userLogs.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const preferredCategory = userLogs.reduce((acc, curr) => {
    acc[curr.workoutType] = (acc[curr.workoutType] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const sortedCats = Object.keys(preferredCategory).sort(
    (a, b) => preferredCategory[b] - preferredCategory[a]
  );
  const favoriteType = sortedCats[0] || 'none yet';

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
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

      const response = await ai.models.generateContent({ model: 'gemini-3.5-flash', contents: prompt });
      const responseText = response.text || '';
      res.json({ text: responseText.replace(/\*/g, '').trim(), date: new Date().toISOString() });
      return;
    } catch (err) {
      console.error('Gemini API call failed, using high-fidelity fallback generator', err);
    }
  }

  let fallbackText = `You completed ${workoutsThisWeek} workouts this week totaling ${totalMinutes} minutes. `;
  if (favoriteType !== 'none yet') fallbackText += `Your most consistent workouts are in ${favoriteType}. `;
  if (workoutsThisWeek >= (userProfile?.weeklyTarget || 3)) {
    fallbackText += `You smashed your weekly target! Excellent execution. Try a light stretching session before exams next week.`;
  } else {
    fallbackText += `Consistency beats intensity. Even logging a quick 10-minute workout before classes counts. Keep it up!`;
  }
  res.json({ text: fallbackText, date: new Date().toISOString() });
});

/**
 * POST /api/insights/daily-calorie-target
 * Calculates estimated daily calorie and macro targets based on body stats.
 * Accepts optional body overrides; defaults to user's saved profile.
 */
router.post('/daily-calorie-target', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const db = readDatabase();
    const profile = db.userProfiles.find((p) => p.userId === req.user!.id);

    // Get stats from override or profile
    const weightKg = req.body.weightKg !== undefined ? req.body.weightKg : (profile?.weightKg || profile?.weight);
    const heightCm = req.body.heightCm !== undefined ? req.body.heightCm : (profile?.heightCm || profile?.height);
    const age = req.body.age !== undefined ? req.body.age : profile?.age;
    const gender = req.body.gender !== undefined ? req.body.gender : profile?.gender;
    const goal = req.body.goal !== undefined ? req.body.goal : profile?.goal;
    const activityLevel = req.body.activityLevel !== undefined ? req.body.activityLevel : profile?.activityLevel;

    // Check for missing required fields
    const missingFields: string[] = [];
    if (weightKg === undefined || weightKg === null || weightKg === '') missingFields.push('weightKg');
    if (heightCm === undefined || heightCm === null || heightCm === '') missingFields.push('heightCm');
    if (age === undefined || age === null || age === '') missingFields.push('age');
    if (gender === undefined || gender === null || gender === '') missingFields.push('gender');
    if (goal === undefined || goal === null || goal === '') missingFields.push('goal');
    if (activityLevel === undefined || activityLevel === null || activityLevel === '') missingFields.push('activityLevel');

    if (missingFields.length > 0) {
      res.status(400).json({
        error: 'Incomplete nutrition profile',
        missingFields,
        message: `Please complete all required nutrition profile fields: ${missingFields.join(', ')}`
      });
      return;
    }

    const targets = calculateDetailedMacroTargets(
      Number(weightKg),
      Number(heightCm),
      Number(age),
      String(gender),
      String(activityLevel),
      String(goal)
    );

    res.json({
      wording: 'estimated',
      targets
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'An error occurred while calculating targets.' });
  }
});

/**
 * POST /api/insights/meal-plan
 * Generates an estimated meal plan based on targets and preferences/allergies.
 * Accepts optional body overrides; defaults to user's saved profile.
 */
router.post('/meal-plan', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const db = readDatabase();
    const profile = db.userProfiles.find((p) => p.userId === req.user!.id);

    // Get stats from override or profile
    const weightKg = req.body.weightKg !== undefined ? req.body.weightKg : (profile?.weightKg || profile?.weight);
    const heightCm = req.body.heightCm !== undefined ? req.body.heightCm : (profile?.heightCm || profile?.height);
    const age = req.body.age !== undefined ? req.body.age : profile?.age;
    const gender = req.body.gender !== undefined ? req.body.gender : profile?.gender;
    const goal = req.body.goal !== undefined ? req.body.goal : profile?.goal;
    const activityLevel = req.body.activityLevel !== undefined ? req.body.activityLevel : profile?.activityLevel;
    
    // Optional preferences
    const dietPreference = req.body.dietPreference !== undefined ? req.body.dietPreference : profile?.dietPreference;
    const allergies = req.body.allergies !== undefined ? req.body.allergies : (profile?.allergies || []);

    // Check for missing required fields
    const missingFields: string[] = [];
    if (weightKg === undefined || weightKg === null || weightKg === '') missingFields.push('weightKg');
    if (heightCm === undefined || heightCm === null || heightCm === '') missingFields.push('heightCm');
    if (age === undefined || age === null || age === '') missingFields.push('age');
    if (gender === undefined || gender === null || gender === '') missingFields.push('gender');
    if (goal === undefined || goal === null || goal === '') missingFields.push('goal');
    if (activityLevel === undefined || activityLevel === null || activityLevel === '') missingFields.push('activityLevel');

    if (missingFields.length > 0) {
      res.status(400).json({
        error: 'Incomplete nutrition profile',
        missingFields,
        message: `Please complete all required nutrition profile fields: ${missingFields.join(', ')}`
      });
      return;
    }

    const targets = calculateDetailedMacroTargets(
      Number(weightKg),
      Number(heightCm),
      Number(age),
      String(gender),
      String(activityLevel),
      String(goal)
    );

    const mealPlanResult = mealRecommendationService.generateMealPlan({
      targetCalories: targets.targetCalories,
      proteinTargetG: targets.proteinTargetG,
      carbsTargetG: targets.carbsTargetG,
      fatTargetG: targets.fatTargetG,
      dietPreference,
      allergies
    });

    res.json({
      wording: 'estimated',
      mealPlan: mealPlanResult
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'An error occurred while generating meal plan.' });
  }
});

export default router;

