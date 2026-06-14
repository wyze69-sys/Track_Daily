const { aiService } = require("../services/aiService");

const aiController = {
  async getLatestInsight(req, res, next) {
    try {
      let insights = await aiService.getInsightsByUserId(req.user.id);
      if (insights.length === 0) {
        // Generate an initial insight if none exist
        const initial = await aiService.generateWeeklyInsight(req.user.id);
        insights = [initial];
      }
      const latest = insights[0];
      const text = `${latest.summary}\n\nRecommendations:\n${latest.recommendations.map(r => `- ${r}`).join("\n")}\n\nGoal Progress: ${latest.goalProgress}`;
      res.json({
        text,
        date: latest.dateGenerated
      });
    } catch (err) {
      next(err);
    }
  },

  async generateWeeklyInsight(req, res, next) {
    try {
      const latest = await aiService.generateWeeklyInsight(req.user.id);
      const text = `${latest.summary}\n\nRecommendations:\n${latest.recommendations.map(r => `- ${r}`).join("\n")}\n\nGoal Progress: ${latest.goalProgress}`;
      res.status(201).json({
        text,
        date: latest.dateGenerated
      });
    } catch (err) {
      next(err);
    }
  },

  async getDailyCalorieTarget(req, res, next) {
    try {
      const { userRepository } = require("../repositories/userRepository");
      const { calculateDetailedMacroTargets } = require("../utils/nutritionCalculations");

      const user = await userRepository.getUserById(req.user.id);
      
      const weightKg = req.body.weightKg !== undefined ? req.body.weightKg : (user?.weightKg || user?.weight);
      const heightCm = req.body.heightCm !== undefined ? req.body.heightCm : user?.height;
      const age = req.body.age !== undefined ? req.body.age : user?.age;
      const gender = req.body.gender !== undefined ? req.body.gender : user?.gender;
      const goal = req.body.goal !== undefined ? req.body.goal : user?.goal;
      const activityLevel = req.body.activityLevel !== undefined ? req.body.activityLevel : user?.activityLevel;

      const missingFields = [];
      if (weightKg === undefined || weightKg === null || weightKg === '') missingFields.push('weightKg');
      if (heightCm === undefined || heightCm === null || heightCm === '') missingFields.push('heightCm');
      if (age === undefined || age === null || age === '') missingFields.push('age');
      if (gender === undefined || gender === null || gender === '') missingFields.push('gender');
      if (goal === undefined || goal === null || goal === '') missingFields.push('goal');
      if (activityLevel === undefined || activityLevel === null || activityLevel === '') missingFields.push('activityLevel');

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: 'Incomplete nutrition profile',
          missingFields,
          message: `Please complete all required nutrition profile fields: ${missingFields.join(', ')}`
        });
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
    } catch (err) {
      next(err);
    }
  },

  async getMealPlan(req, res, next) {
    try {
      const { userRepository } = require("../repositories/userRepository");
      const { calculateDetailedMacroTargets } = require("../utils/nutritionCalculations");
      const { mealRecommendationService } = require("../services/mealRecommendationService");

      const user = await userRepository.getUserById(req.user.id);

      const weightKg = req.body.weightKg !== undefined ? req.body.weightKg : (user?.weightKg || user?.weight);
      const heightCm = req.body.heightCm !== undefined ? req.body.heightCm : user?.height;
      const age = req.body.age !== undefined ? req.body.age : user?.age;
      const gender = req.body.gender !== undefined ? req.body.gender : user?.gender;
      const goal = req.body.goal !== undefined ? req.body.goal : user?.goal;
      const activityLevel = req.body.activityLevel !== undefined ? req.body.activityLevel : user?.activityLevel;
      
      const dietPreference = req.body.dietPreference !== undefined ? req.body.dietPreference : user?.dietPreference;
      const allergies = req.body.allergies !== undefined ? req.body.allergies : (user?.allergies || []);

      const missingFields = [];
      if (weightKg === undefined || weightKg === null || weightKg === '') missingFields.push('weightKg');
      if (heightCm === undefined || heightCm === null || heightCm === '') missingFields.push('heightCm');
      if (age === undefined || age === null || age === '') missingFields.push('age');
      if (gender === undefined || gender === null || gender === '') missingFields.push('gender');
      if (goal === undefined || goal === null || goal === '') missingFields.push('goal');
      if (activityLevel === undefined || activityLevel === null || activityLevel === '') missingFields.push('activityLevel');

      if (missingFields.length > 0) {
        return res.status(400).json({
          error: 'Incomplete nutrition profile',
          missingFields,
          message: `Please complete all required nutrition profile fields: ${missingFields.join(', ')}`
        });
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
    } catch (err) {
      next(err);
    }
  }
};

module.exports = { aiController };
