import { readDatabase } from '../../db/db';
import { calculateEstimatedTargets } from '../utils/nutritionCalculations';

export const calorieTargetService = {
  getUserCalorieTarget(userId: string) {
    const db = readDatabase();
    const profile = db.userProfiles.find(p => p.userId === userId);

    // Sensible defaults if profile or profile fields are missing (estimated)
    const weight = profile?.weight !== undefined && profile?.weight !== null ? Number(profile.weight) : 70;
    const height = profile?.height !== undefined && profile?.height !== null ? Number(profile.height) : 170;
    const age = profile?.age !== undefined && profile?.age !== null ? Number(profile.age) : 25;
    const gender = profile?.gender || 'other';
    const activityLevel = profile?.activityLevel || 'moderately active';
    const goal = profile?.goal || 'maintain_weight';

    return calculateEstimatedTargets(weight, height, age, gender, activityLevel, goal);
  }
};
