/**
 * Mifflin-St Jeor formula for BMR (Basal Metabolic Rate).
 * Male: BMR = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
 * Female: BMR = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
 * Other: Average of male and female formula: BMR = 10 * weightKg + 6.25 * heightCm - 5 * age - 78
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other' | string
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const normalizedGender = typeof gender === 'string' ? gender.toLowerCase() : 'other';

  if (normalizedGender === 'male') {
    return base + 5;
  } else if (normalizedGender === 'female') {
    return base - 161;
  } else {
    // Average of male (+5) and female (-161) BMR formulas:
    // (base + 5 + base - 161) / 2 = (2 * base - 156) / 2 = base - 78
    return base - 78;
  }
}

/**
 * TDEE (Total Daily Energy Expenditure) calculation based on BMR and activity level.
 * - sedentary: BMR * 1.2
 * - light: BMR * 1.375
 * - moderate: BMR * 1.55
 * - active: BMR * 1.725
 * - very_active: BMR * 1.9
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const level = typeof activityLevel === 'string' ? activityLevel.toLowerCase().trim() : 'moderate';

  if (level === 'sedentary') {
    return bmr * 1.2;
  } else if (level === 'light' || level === 'lightly active' || level === 'lightly_active') {
    return bmr * 1.375;
  } else if (level === 'moderate' || level === 'moderately active' || level === 'moderately_active') {
    return bmr * 1.55;
  } else if (level === 'active') {
    return bmr * 1.725;
  } else if (level === 'very_active' || level === 'very active') {
    return bmr * 1.9;
  } else {
    // Default to moderate
    return bmr * 1.55;
  }
}

/**
 * Adjusts TDEE based on user's weight goal.
 * - lose_weight: TDEE - 400
 * - maintain_weight: TDEE
 * - gain_muscle: TDEE + 300
 * - improve_fitness: TDEE
 */
export function adjustCalorieTargetByGoal(tdee: number, goal: string): number {
  const normalizedGoal = typeof goal === 'string' ? goal.toLowerCase().trim() : 'maintain_weight';

  if (normalizedGoal === 'lose_weight' || normalizedGoal === 'lose' || normalizedGoal === 'weight_loss') {
    return tdee - 400;
  } else if (normalizedGoal === 'gain_muscle' || normalizedGoal === 'gain' || normalizedGoal === 'muscle_gain') {
    return tdee + 300;
  } else if (
    normalizedGoal === 'maintain_weight' ||
    normalizedGoal === 'maintain' ||
    normalizedGoal === 'maintenance' ||
    normalizedGoal === 'improve_fitness' ||
    normalizedGoal === 'fitness'
  ) {
    return tdee;
  } else {
    // Default adjustment is maintain_weight
    return tdee;
  }
}

/**
 * Get estimated daily calorie and macronutrient targets.
 * Note: These are estimated values and not exact. No medical claims are made.
 */
export function calculateEstimatedTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string,
  activityLevel: string,
  goal: string
) {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetCalories = Math.round(adjustCalorieTargetByGoal(tdee, goal));

  // Estimate macros based on target calories (sensible defaults: 30% protein, 45% carbs, 25% fat)
  // protein: 4 kcal/g, carb: 4 kcal/g, fat: 9 kcal/g
  const protein_g = Math.round((targetCalories * 0.30) / 4);
  const carbs_g = Math.round((targetCalories * 0.45) / 4);
  const fat_g = Math.round((targetCalories * 0.25) / 9);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    proteinTargetG: protein_g,
    carbsTargetG: carbs_g,
    fatTargetG: fat_g,
    isEstimated: true,
    disclaimer: 'These targets are estimated guidelines and do not constitute professional medical advice.'
  };
}

/**
 * Get detailed estimated daily calorie and macro targets using prompt-specific rules.
 * Protein: 1.8g per kg body weight
 * Fat: 25% of daily calories
 * Carbs: remaining calories after protein and fat
 */
export function calculateDetailedMacroTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string,
  activityLevel: string,
  goal: string
) {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetCalories = Math.round(adjustCalorieTargetByGoal(tdee, goal));

  // protein: 1.8g per kg body weight
  const proteinTargetG = 1.8 * weightKg;
  const proteinKcal = proteinTargetG * 4;

  // fat: 25% of daily calories
  const fatKcal = targetCalories * 0.25;
  const fatTargetG = fatKcal / 9;

  // carbs: remaining calories after protein and fat
  const carbsKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
  const carbsTargetG = carbsKcal / 4;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    proteinTargetG: Math.round(proteinTargetG),
    carbsTargetG: Math.round(carbsTargetG),
    fatTargetG: Math.round(fatTargetG),
    isEstimated: true,
    disclaimer: 'These targets are estimated guidelines and do not constitute professional medical advice.'
  };
}

