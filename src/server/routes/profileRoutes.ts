import express from 'express';
import { readDatabase, writeDatabase } from '../../db/db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/profile/nutrition
 * Retrieve the user's nutrition profile and list any missing fields.
 */
router.get('/nutrition', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const db = readDatabase();
    const profile = db.userProfiles.find((p) => p.userId === req.user!.id);

    if (!profile) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    // Map database properties to the requested nutrition fields
    const nutritionProfile = {
      weightKg: profile.weightKg !== undefined && profile.weightKg !== null ? profile.weightKg : (profile.weight || null),
      heightCm: profile.heightCm !== undefined && profile.heightCm !== null ? profile.heightCm : (profile.height || null),
      age: profile.age !== undefined && profile.age !== null ? profile.age : null,
      gender: profile.gender || null,
      goal: profile.goal || null,
      activityLevel: profile.activityLevel || null,
      dietPreference: profile.dietPreference || null,
      allergies: profile.allergies || []
    };

    // Determine missing required fields
    const requiredFields = ['weightKg', 'heightCm', 'age', 'gender', 'goal', 'activityLevel'];
    const missingFields = requiredFields.filter((field) => {
      const value = (nutritionProfile as any)[field];
      return value === undefined || value === null || value === '';
    });

    res.json({
      profile: nutritionProfile,
      missingFields,
      isIncomplete: missingFields.length > 0,
      message: missingFields.length > 0
        ? `Nutrition profile is incomplete. Missing fields: ${missingFields.join(', ')}`
        : 'Nutrition profile is complete.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'An error occurred while fetching nutrition profile.' });
  }
});

/**
 * PUT /api/profile/nutrition
 * Update user's nutrition profile. Syncs with standard profile fields.
 */
router.put('/nutrition', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const {
      weightKg,
      heightCm,
      age,
      gender,
      goal,
      activityLevel,
      dietPreference,
      allergies
    } = req.body;

    const db = readDatabase();
    let profile = db.userProfiles.find((p) => p.userId === req.user!.id);

    if (!profile) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    // Save/update the fields
    if (weightKg !== undefined) {
      profile.weightKg = weightKg === '' ? null : Number(weightKg);
      profile.weight = profile.weightKg; // sync legacy/standard field
    }
    if (heightCm !== undefined) {
      profile.heightCm = heightCm === '' ? null : Number(heightCm);
      profile.height = profile.heightCm; // sync legacy/standard field
    }
    if (age !== undefined) profile.age = age === '' ? null : Number(age);
    if (gender !== undefined) profile.gender = gender || null;
    if (goal !== undefined) profile.goal = goal || null;
    if (activityLevel !== undefined) profile.activityLevel = activityLevel || null;
    if (dietPreference !== undefined) profile.dietPreference = dietPreference || null;
    if (allergies !== undefined) {
      profile.allergies = Array.isArray(allergies) ? allergies : [];
    }

    writeDatabase(db);

    res.json({
      success: true,
      message: 'Nutrition profile updated successfully.',
      profile: {
        weightKg: profile.weightKg,
        heightCm: profile.heightCm,
        age: profile.age,
        gender: profile.gender,
        goal: profile.goal,
        activityLevel: profile.activityLevel,
        dietPreference: profile.dietPreference,
        allergies: profile.allergies
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'An error occurred while updating nutrition profile.' });
  }
});

/**
 * POST /api/profile/update
 * Support for the frontend settings page update profile request.
 */
router.post('/update', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const {
      name,
      age,
      gender,
      height,
      weight,
      targetWeight,
      preferredWorkoutType,
      goal,
      activityLevel,
      dietPreference,
      allergies
    } = req.body;

    const db = readDatabase();
    let profile = db.userProfiles.find((p) => p.userId === req.user!.id);

    if (!profile) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    if (name !== undefined) profile.fullName = name;
    if (age !== undefined) profile.age = age === '' ? null : Number(age);
    if (gender !== undefined) profile.gender = gender || null;
    if (height !== undefined) {
      profile.height = height === '' ? null : Number(height);
      profile.heightCm = profile.height;
    }
    if (weight !== undefined) {
      profile.weight = weight === '' ? null : Number(weight);
      profile.weightKg = profile.weight;
    }
    if (targetWeight !== undefined) profile.targetWeight = targetWeight === '' ? null : Number(targetWeight);
    if (preferredWorkoutType !== undefined) profile.preferredWorkoutType = preferredWorkoutType || null;
    if (goal !== undefined) profile.goal = goal || null;
    if (activityLevel !== undefined) profile.activityLevel = activityLevel || null;
    if (dietPreference !== undefined) profile.dietPreference = dietPreference || null;
    if (allergies !== undefined) {
      profile.allergies = Array.isArray(allergies) ? allergies : [];
    }

    writeDatabase(db);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'An error occurred during profile update.' });
  }
});

export default router;
