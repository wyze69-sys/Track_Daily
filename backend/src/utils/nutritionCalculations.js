/**
 * Mifflin-St Jeor formula for BMR (Basal Metabolic Rate).
 * Male: BMR = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
 * Female: BMR = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
 * Other: Average of male and female formula: BMR = 10 * weightKg + 6.25 * heightCm - 5 * age - 78
 */
function calculateBMR(weightKg, heightCm, age, gender) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const normalizedGender = typeof gender === 'string' ? gender.toLowerCase() : 'other';

  if (normalizedGender === 'male') {
    return base + 5;
  } else if (normalizedGender === 'female') {
    return base - 161;
  } else {
    return base - 78;
  }
}

/**
 * TDEE (Total Daily Energy Expenditure) calculation based on BMR and activity level.
 */
function calculateTDEE(bmr, activityLevel) {
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
    return bmr * 1.55;
  }
}

/**
 * Adjusts TDEE based on user's weight goal.
 */
function adjustCalorieTargetByGoal(tdee, goal) {
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
    return tdee;
  }
}

/**
 * Get detailed estimated daily calorie and macro targets.
 * Protein: 1.8g per kg body weight
 * Fat: 25% of daily calories
 * Carbs: remaining calories after protein and fat
 */
function calculateDetailedMacroTargets(weightKg, heightCm, age, gender, activityLevel, goal) {
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetCalories = Math.round(adjustCalorieTargetByGoal(tdee, goal));

  const proteinTargetG = 1.8 * weightKg;
  const proteinKcal = proteinTargetG * 4;

  const fatKcal = targetCalories * 0.25;
  const fatTargetG = fatKcal / 9;

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

module.exports = {
  calculateBMR,
  calculateTDEE,
  adjustCalorieTargetByGoal,
  calculateDetailedMacroTargets
};
