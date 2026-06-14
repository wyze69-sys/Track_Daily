# track_daily Nutrition Dataset Documentation

## Dataset Source
- **Primary source**: Kaggle Food Nutrition dataset (`utsavdey1410/food-nutrition-dataset`)
- **Kaggle page**: https://www.kaggle.com/datasets/utsavdey1410/food-nutrition-dataset

## Local Dataset Path
- `database/datasets/nutrition_foods.csv`

## Normalized CSV Columns
The unified CSV file contains the following columns mapping Kaggle's food group parameters:
- `id`: Unique slug identifier generated from the food name.
- `name`: Clean text name of the food item.
- `serving_size`: Text representation of serving size (e.g. `dataset serving`).
- `calories`: Numeric calories count.
- `protein_g`: Protein amount in grams.
- `carbs_g`: Carbohydrates amount in grams.
- `fat_g`: Lipid/fat amount in grams.
- `fiber_g`: Dietary fiber in grams.
- `sugar_g`: Sugar content in grams.
- `sodium_mg`: Sodium content in milligrams.
- `source_dataset`: Kaggle source dataset identifier.
- `source_file`: Original group file name.
- `source_group`: Food group classification index.

## How CSV Import and Caching Works
- The dataset file is read asynchronously at startup/first request by the `nutritionImportService`.
- A custom, memory-efficient CSV line parser splits lines and maps values, ignoring incomplete rows and resolving malformed numbers to 0.
- The parsed list is cached in-memory inside the `nutritionRepository` module. Subscriptions and subsequent lookups retrieve the in-memory array rather than re-reading the CSV file from disk on every HTTP request.

## How Calorie Target is Calculated
Calculations reuse Mifflin-St Jeor formula to determine the Basal Metabolic Rate (BMR):
- **Male BMR**: \(10 \times \text{weightKg} + 6.25 \times \text{heightCm} - 5 \times \text{age} + 5\)
- **Female BMR**: \(10 \times \text{weightKg} + 6.25 \times \text{heightCm} - 5 \times \text{age} - 161\)
- **Other BMR**: Average of Male & Female BMRs (\(10 \times \text{weightKg} + 6.25 \times \text{heightCm} - 5 \times \text{age} - 78\))

Total Daily Energy Expenditure (TDEE) is computed using BMR and activity multipliers:
- **Sedentary**: BMR * 1.2
- **Lightly active**: BMR * 1.375
- **Moderately active**: BMR * 1.55
- **Active**: BMR * 1.725
- **Very active**: BMR * 1.9

Adjustments by weight goal:
- **Lose weight**: TDEE - 400
- **Maintain weight**: TDEE
- **Gain muscle**: TDEE + 300
- **Improve fitness**: TDEE

Macronutrient splits:
- **Protein**: 1.8g per kg body weight
- **Fat**: 25% of daily calories
- **Carbohydrates**: Remaining calories after protein and fat, capped at 0 minimum.

## How Meal Plan is Generated
1. **Target Splitting**: Splits daily targets into Breakfast (25%), Lunch (35%), Dinner (30%), and Snack (10%).
2. **Filtering**: Excludes foods matching any item in the user's `allergies` array, and applies strict animal/carbohydrate filters based on the `dietPreference` (vegan, vegetarian, low-carb/keto).
3. **Keyword Slot Matching**: Limits candidates per slot based on keywords (e.g. egg/oats for breakfast, chicken/rice/salad for lunch/dinner, fruits/nuts for snack).
4. **Deterministic Optimization**: Identifies a multiplier/serving size between `0.2` and `5.0` to match the target calories, and scores candidates based on their resulting macronutrient errors (absolute sum of protein, fat, and carb deviations). The candidate with the lowest error is recommended.
5. **Fallbacks**: If no items match, it falls back to recommending from the entire allergen-filtered food list, or outputs a clean message if no foods match overall.

## Limitations
- **Serving size is not clearly defined**: Most items in the dataset list serving sizes as `dataset serving` rather than specific gram or volume weights. All serving portions are therefore approximated multipliers.
- **Estimated values**: Calorie and macronutrient values derived from this dataset are estimates and do not represent exact or scientifically laboratory-verified intake.
- **No Medical Claims**: Calculations and recommendations do not constitute medical, dietary, or healthcare advice.

## Future Improvements
- Integrate a USDA/FoodData Central-style dataset containing standardized metric weights.
- Normalize all nutrition values to standard weights (e.g., values per 100g).
- Merge duplicate food entries and resolve overlaps.
- Introduce a recommendation confidence score.
- Improve serving-size accuracy using specific portion unit conversion mappings.
