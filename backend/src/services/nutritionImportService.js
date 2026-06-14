const fs = require('fs');
const path = require('path');

function importNutritionFoods() {
  let csvPath = path.join(process.cwd(), 'database', 'datasets', 'nutrition_foods.csv');
  if (!fs.existsSync(csvPath)) {
    csvPath = path.join(process.cwd(), '..', 'database', 'datasets', 'nutrition_foods.csv');
  }
  
  if (!fs.existsSync(csvPath)) {
    console.error(`Nutrition dataset CSV not found at ${csvPath}`);
    return [];
  }

  try {
    const rawContent = fs.readFileSync(csvPath, 'utf8');
    const lines = rawContent.split(/\r?\n/);
    if (lines.length <= 1) return [];

    const foodItems = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(',');
      if (columns.length < 10) continue; // Skip incomplete rows

      foodItems.push({
        id: columns[0] || `food-${i}`,
        name: columns[1] || '',
        serving_size: columns[2] || '',
        calories: parseFloat(columns[3]) || 0,
        protein_g: parseFloat(columns[4]) || 0,
        carbs_g: parseFloat(columns[5]) || 0,
        fat_g: parseFloat(columns[6]) || 0,
        fiber_g: parseFloat(columns[7]) || 0,
        sugar_g: parseFloat(columns[8]) || 0,
        sodium_mg: parseFloat(columns[9]) || 0,
        source_dataset: columns[10] || '',
        source_file: columns[11] || '',
        source_group: columns[12] || '',
      });
    }

    return foodItems;
  } catch (err) {
    console.error('Failed to parse nutrition foods CSV:', err);
    return [];
  }
}

module.exports = { importNutritionFoods };
