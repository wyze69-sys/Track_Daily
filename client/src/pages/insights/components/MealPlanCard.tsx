import React from 'react';
import { MealPlan } from '../types';

interface MealPlanCardProps {
  mealPlan: MealPlan | null;
  loading: boolean;
}

export const MealPlanCard: React.FC<MealPlanCardProps> = ({ mealPlan, loading }) => {
  if (loading) {
    return (
      <div
        className="p-6 rounded-2xl border border-border flex items-center justify-center min-h-[300px]"
        style={{ background: 'var(--card)' }}
      >
        <span className="text-xs text-muted-foreground">Generating estimated meal plan...</span>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div
        className="p-6 rounded-2xl border border-border flex items-center justify-center min-h-[200px]"
        style={{ background: 'var(--card)' }}
      >
        <span className="text-xs text-muted-foreground">No meal plan recommendations are available.</span>
      </div>
    );
  }

  if (mealPlan.fallbackMessage) {
    return (
      <div
        className="p-6 rounded-2xl border border-border"
        style={{ background: 'var(--card)' }}
      >
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Meal Recommendation
        </h2>
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-500 font-medium leading-relaxed">
          {mealPlan.fallbackMessage}
        </div>
      </div>
    );
  }

  const meals = mealPlan.meals;
  if (!meals) {
    return (
      <div
        className="p-6 rounded-2xl border border-border flex items-center justify-center min-h-[200px]"
        style={{ background: 'var(--card)' }}
      >
        <span className="text-xs text-muted-foreground">No meals generated.</span>
      </div>
    );
  }

  const mealSlots = [
    { key: 'breakfast', label: 'Breakfast', data: meals.breakfast },
    { key: 'lunch', label: 'Lunch', data: meals.lunch },
    { key: 'dinner', label: 'Dinner', data: meals.dinner },
    { key: 'snack', label: 'Snack', data: meals.snack }
  ];

  return (
    <div
      className="p-6 rounded-2xl border border-border"
      style={{ background: 'var(--card)' }}
    >
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Meal Recommendation
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mealSlots.map((slot) => {
            const meal = slot.data;
            if (!meal) return null;
            return (
              <div
                key={slot.key}
                className="p-4 rounded-xl border border-border bg-background flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-black text-foreground uppercase tracking-wide">
                      {slot.label}
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {meal.calories} kcal
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground capitalize mb-0.5">
                    {meal.name.replace(/-/g, ' ')}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mb-3 font-semibold uppercase tracking-wider">
                    {meal.servings} x {meal.servingSize}
                  </p>
                </div>

                <div className="flex gap-3 text-[10px] text-muted-foreground border-t border-border pt-2 font-bold uppercase tracking-wider">
                  <div>
                    P: <span className="text-foreground">{meal.protein_g}g</span>
                  </div>
                  <div>
                    C: <span className="text-foreground">{meal.carbs_g}g</span>
                  </div>
                  <div>
                    F: <span className="text-foreground">{meal.fat_g}g</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {mealPlan.totalPlanned && (
          <div className="mt-6 p-4 rounded-xl bg-background border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Total Planned Recommendation
              </span>
              <span className="text-lg font-black text-foreground">
                {mealPlan.totalPlanned.calories} kcal
              </span>
            </div>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <div>
                Protein: <span className="text-foreground">{mealPlan.totalPlanned.protein_g}g</span>
              </div>
              <div>
                Carbs: <span className="text-foreground">{mealPlan.totalPlanned.carbs_g}g</span>
              </div>
              <div>
                Fat: <span className="text-foreground">{mealPlan.totalPlanned.fat_g}g</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
