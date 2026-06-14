const { userService } = require("../services/userService");

const profileController = {
  async updateProfile(req, res, next) {
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
        activityLevel
      } = req.body;
      const updatedUser = await userService.updateProfile(req.user.id, {
        name,
        age,
        gender,
        height,
        weight,
        targetWeight,
        preferredWorkoutType,
        goal,
        activityLevel
      });
      res.json(updatedUser);
    } catch (err) {
      next(err);
    }
  },

  async getNutritionProfile(req, res, next) {
    try {
      const { userRepository } = require("../repositories/userRepository");
      const user = await userRepository.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User profile not found.' });
      }

      const nutritionProfile = {
        weightKg: user.weightKg !== undefined && user.weightKg !== null ? user.weightKg : (user.weight || null),
        heightCm: user.height !== undefined && user.height !== null ? user.height : null,
        age: user.age !== undefined && user.age !== null ? user.age : null,
        gender: user.gender || null,
        goal: user.goal || null,
        activityLevel: user.activityLevel || null,
        dietPreference: user.dietPreference || null,
        allergies: user.allergies || []
      };

      const requiredFields = ['weightKg', 'heightCm', 'age', 'gender', 'goal', 'activityLevel'];
      const missingFields = requiredFields.filter((field) => {
        const value = nutritionProfile[field];
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
    } catch (err) {
      next(err);
    }
  },

  async updateNutritionProfile(req, res, next) {
    try {
      const { userRepository } = require("../repositories/userRepository");
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

      const updates = {};
      if (weightKg !== undefined) {
        updates.weightKg = weightKg === '' ? null : Number(weightKg);
        updates.weight = updates.weightKg;
      }
      if (heightCm !== undefined) {
        updates.height = heightCm === '' ? null : Number(heightCm);
      }
      if (age !== undefined) updates.age = age === '' ? null : Number(age);
      if (gender !== undefined) updates.gender = gender || null;
      if (goal !== undefined) updates.goal = goal || null;
      if (activityLevel !== undefined) updates.activityLevel = activityLevel || null;
      if (dietPreference !== undefined) updates.dietPreference = dietPreference || null;
      if (allergies !== undefined) {
        updates.allergies = Array.isArray(allergies) ? JSON.stringify(allergies) : JSON.stringify([]);
      }

      const updatedUser = await userRepository.updateUser(req.user.id, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User profile not found.' });
      }

      res.json({
        success: true,
        message: 'Nutrition profile updated successfully.',
        profile: {
          weightKg: updatedUser.weightKg !== undefined && updatedUser.weightKg !== null ? updatedUser.weightKg : (updatedUser.weight || null),
          heightCm: updatedUser.height !== undefined && updatedUser.height !== null ? updatedUser.height : null,
          age: updatedUser.age !== undefined && updatedUser.age !== null ? updatedUser.age : null,
          gender: updatedUser.gender || null,
          goal: updatedUser.goal || null,
          activityLevel: updatedUser.activityLevel || null,
          dietPreference: updatedUser.dietPreference || null,
          allergies: updatedUser.allergies || []
        }
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = { profileController };
