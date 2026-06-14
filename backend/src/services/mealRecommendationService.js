const { nutritionRepository } = require("../repositories/nutritionRepository");

const mealRecommendationService = {
  generateMealPlan(input) {
    const allFoods = nutritionRepository.getFoods();
    if (!allFoods || allFoods.length === 0) {
      return {
        fallbackMessage: 'No food items are currently loaded in the database. Please verify the food dataset is imported correctly.'
      };
    }

    // 1. Filter out allergens
    let filteredFoods = allFoods;
    if (input.allergies && input.allergies.length > 0) {
      const activeAllergies = input.allergies.map(a => a.toLowerCase().trim()).filter(Boolean);
      if (activeAllergies.length > 0) {
        filteredFoods = filteredFoods.filter(food => {
          const foodNameLower = food.name.toLowerCase();
          return !activeAllergies.some(allergy => foodNameLower.includes(allergy));
        });
      }
    }

    // 2. Respect dietPreference
    if (input.dietPreference) {
      const diet = input.dietPreference.toLowerCase().trim();
      if (diet === 'vegan') {
        const animalKeywords = [
          'chicken', 'beef', 'pork', 'sausage', 'steak', 'egg', 'cheese', 'milk', 
          'butter', 'bacon', 'ham', 'fish', 'turkey', 'shrimp', 'yogurt', 'cream', 
          'honey', 'whey', 'gelatin', 'cheddar', 'mozzarella', 'parmesan', 'ricotta'
        ];
        filteredFoods = filteredFoods.filter(food => {
          const foodNameLower = food.name.toLowerCase();
          return !animalKeywords.some(kw => foodNameLower.includes(kw));
        });
      } else if (diet === 'vegetarian') {
        const meatKeywords = [
          'chicken', 'beef', 'pork', 'sausage', 'steak', 'bacon', 'ham', 'fish', 
          'turkey', 'shrimp'
        ];
        filteredFoods = filteredFoods.filter(food => {
          const foodNameLower = food.name.toLowerCase();
          return !meatKeywords.some(kw => foodNameLower.includes(kw));
        });
      } else if (diet === 'low-carb' || diet === 'keto') {
        filteredFoods = filteredFoods.filter(food => {
          const totalMacros = food.protein_g + food.carbs_g + food.fat_g;
          if (totalMacros === 0) return true;
          return (food.carbs_g / totalMacros) < 0.2;
        });
      }
    }

    if (filteredFoods.length === 0) {
      return {
        fallbackMessage: 'No foods from the dataset match your specific dietary preferences and allergy profile. Please adjust your preferences.'
      };
    }

    // 3. Define Meal splits
    const splits = {
      breakfast: { cal: input.targetCalories * 0.25, prot: input.proteinTargetG * 0.25, carbs: input.carbsTargetG * 0.25, fat: input.fatTargetG * 0.25 },
      lunch: { cal: input.targetCalories * 0.35, prot: input.proteinTargetG * 0.35, carbs: input.carbsTargetG * 0.35, fat: input.fatTargetG * 0.35 },
      dinner: { cal: input.targetCalories * 0.30, prot: input.proteinTargetG * 0.30, carbs: input.carbsTargetG * 0.30, fat: input.fatTargetG * 0.30 },
      snack: { cal: input.targetCalories * 0.10, prot: input.proteinTargetG * 0.10, carbs: input.carbsTargetG * 0.10, fat: input.fatTargetG * 0.10 }
    };

    // Slot-specific keywords
    const slotKeywords = {
      breakfast: ['egg', 'pancake', 'toast', 'oat', 'biscuit', 'cereal', 'fruit', 'yogurt', 'bread', 'sandwich', 'juice', 'muffin', 'bagel', 'waffle'],
      lunch: ['stew', 'salad', 'rice', 'chicken', 'beef', 'burrito', 'nachos', 'taco', 'soup', 'pasta', 'steak', 'pork', 'fish', 'potato', 'burger', 'curry', 'beans', 'vegetable', 'pizza', 'noodle'],
      dinner: ['stew', 'salad', 'rice', 'chicken', 'beef', 'burrito', 'nachos', 'taco', 'soup', 'pasta', 'steak', 'pork', 'fish', 'potato', 'burger', 'curry', 'beans', 'vegetable', 'pizza', 'noodle'],
      snack: ['fruit', 'bar', 'nut', 'chip', 'cookie', 'cracker', 'chocolate', 'popcorn', 'snack', 'yogurt', 'cheese', 'pretzels', 'apple', 'banana', 'orange', 'berry', 'grape']
    };

    const recommendForSlot = (target, keywords) => {
      let candidates = filteredFoods.filter(food => {
        if (food.calories <= 0) return false;
        const foodNameLower = food.name.toLowerCase();
        return keywords.some(kw => foodNameLower.includes(kw));
      });

      if (candidates.length === 0) {
        candidates = filteredFoods.filter(food => food.calories > 0);
      }

      if (candidates.length === 0) return null;

      let bestFood = null;
      let bestMultiplier = 1.0;
      let lowestError = Infinity;

      for (const food of candidates) {
        let multiplier = target.cal / food.calories;
        if (multiplier < 0.2) multiplier = 0.2;
        if (multiplier > 5.0) multiplier = 5.0;

        const scaledProt = food.protein_g * multiplier;
        const scaledCarbs = food.carbs_g * multiplier;
        const scaledFat = food.fat_g * multiplier;

        const error = 
          Math.abs(scaledProt - target.prot) * 4 + 
          Math.abs(scaledCarbs - target.carbs) * 4 + 
          Math.abs(scaledFat - target.fat) * 9;

        if (error < lowestError) {
          lowestError = error;
          bestFood = food;
          bestMultiplier = multiplier;
        }
      }

      if (!bestFood) return null;

      return {
        foodId: bestFood.id,
        name: bestFood.name,
        servingSize: bestFood.serving_size,
        servings: Math.round(bestMultiplier * 100) / 100,
        calories: Math.round(bestFood.calories * bestMultiplier),
        protein_g: Math.round(bestFood.protein_g * bestMultiplier * 10) / 10,
        carbs_g: Math.round(bestFood.carbs_g * bestMultiplier * 10) / 10,
        fat_g: Math.round(bestFood.fat_g * bestMultiplier * 10) / 10
      };
    };

    const breakfast = recommendForSlot(splits.breakfast, slotKeywords.breakfast);
    const lunch = recommendForSlot(splits.lunch, slotKeywords.lunch);
    const dinner = recommendForSlot(splits.dinner, slotKeywords.dinner);
    const snack = recommendForSlot(splits.snack, slotKeywords.snack);

    if (!breakfast || !lunch || !dinner || !snack) {
      return {
        fallbackMessage: 'Could not match enough food items for all meal slots from the database. Please review your dietary filters.'
      };
    }

    const totalPlannedCal = breakfast.calories + lunch.calories + dinner.calories + snack.calories;
    const totalPlannedProt = breakfast.protein_g + lunch.protein_g + dinner.protein_g + snack.protein_g;
    const totalPlannedCarb = breakfast.carbs_g + lunch.carbs_g + dinner.carbs_g + snack.carbs_g;
    const totalPlannedFat = breakfast.fat_g + lunch.fat_g + dinner.fat_g + snack.fat_g;

    return {
      meals: {
        breakfast,
        lunch,
        dinner,
        snack
      },
      totalPlanned: {
        calories: Math.round(totalPlannedCal),
        protein_g: Math.round(totalPlannedProt * 10) / 10,
        carbs_g: Math.round(totalPlannedCarb * 10) / 10,
        fat_g: Math.round(totalPlannedFat * 10) / 10
      },
      target: {
        calories: Math.round(input.targetCalories),
        protein_g: Math.round(input.proteinTargetG),
        carbs_g: Math.round(input.carbsTargetG),
        fat_g: Math.round(input.fatTargetG)
      },
      disclaimer: 'These meal plans are estimated guidelines generated deterministically and do not constitute professional medical advice.'
    };
  }
};

module.exports = { mealRecommendationService };
