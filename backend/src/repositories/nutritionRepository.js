const { importNutritionFoods } = require("../services/nutritionImportService");

let cachedFoods = null;

const nutritionRepository = {
  getFoods() {
    if (cachedFoods === null) {
      cachedFoods = importNutritionFoods();
    }
    return cachedFoods;
  },

  searchFoods(query, limit = 25, offset = 0) {
    const allFoods = this.getFoods();
    
    let filtered = allFoods;
    if (query && query.trim() !== '') {
      const lowerQuery = query.toLowerCase().trim();
      filtered = allFoods.filter(food => 
        food.name.toLowerCase().includes(lowerQuery) || 
        food.id.toLowerCase().includes(lowerQuery)
      );
    }

    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit);

    return {
      items,
      total
    };
  }
};

module.exports = { nutritionRepository };
