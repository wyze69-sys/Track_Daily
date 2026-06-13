import { readDatabase } from '../../db/db';
import { calculateEstimatedTargets } from '../utils/nutritionCalculations';

const missingProfileError = (missingFields: string[]) => {
  const err = new Error(`Missing required profile fields: ${missingFields.join(', ')}`) as Error & {
    status?: number;
    missingFields?: string[];
  };
  err.status = 400;
  err.missingFields = missingFields;
  return err;
};

export const calorieTargetService = {
  getUserCalorieTarget(userId: string) {
    const db = readDatabase();
    const profile = db.userProfiles.find(p => p.userId === userId);

    if (!profile) {
      throw missingProfileError(['profile']);
    }

    const weight = profile.weightKg ?? profile.weight;
    const height = profile.heightCm ?? profile.height;
    const age = profile.age;
    const gender = profile.gender;
    const activityLevel = profile.activityLevel;
    const goal = profile.goal;

    const missingFields: string[] = [];
    if (weight === undefined || weight === null) missingFields.push('weight');
    if (height === undefined || height === null) missingFields.push('height');
    if (age === undefined || age === null) missingFields.push('age');
    if (!gender) missingFields.push('gender');
    if (!activityLevel) missingFields.push('activityLevel');
    if (!goal) missingFields.push('goal');

    if (missingFields.length > 0) {
      throw missingProfileError(missingFields);
    }

    return calculateEstimatedTargets(
      Number(weight),
      Number(height),
      Number(age),
      String(gender),
      String(activityLevel),
      String(goal)
    );
  }
};
