import { importNutritionFoods, FoodItem } from '../services/nutritionImportService';

let cachedFoods: FoodItem[] | null = null;

export const nutritionRepository = {
  getFoods(): FoodItem[] {
    if (cachedFoods === null) {
      cachedFoods = importNutritionFoods();
    }
    return cachedFoods;
  },

  searchFoods(query?: string, limit = 25, offset = 0): { items: FoodItem[]; total: number } {
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
