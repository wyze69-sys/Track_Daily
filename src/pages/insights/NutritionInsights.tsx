import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { useNutritionInsights } from './hooks/useNutritionInsights';
import { NutritionProfileForm } from './components/NutritionProfileForm';
import { DailyTargetCard } from './components/DailyTargetCard';
import { MacroBreakdownCard } from './components/MacroBreakdownCard';
import { MealPlanCard } from './components/MealPlanCard';
import { FoodSearchPanel } from './components/FoodSearchPanel';
import { InsightExplanation } from './components/InsightExplanation';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export const NutritionInsights: React.FC = () => {
  const {
    profile,
    missingFields,
    isIncomplete,
    targets,
    mealPlan,
    loadingProfile,
    loadingTarget,
    loadingMealPlan,
    saving,
    error,
    updateProfile
  } = useNutritionInsights();

  // Helper to format missing field names for display
  const formatFieldName = (field: string) => {
    switch (field) {
      case 'weightKg':
        return 'weight';
      case 'heightCm':
        return 'height';
      case 'age':
        return 'age';
      case 'gender':
        return 'gender';
      case 'goal':
        return 'goal';
      case 'activityLevel':
        return 'activity level';
      default:
        return field;
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Page Header */}
        <div
          className="p-5 rounded-2xl border border-border"
          style={{ background: 'var(--card)' }}
        >
          <h1 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Insights
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Estimated nutrition targets and meal planning based on your profile.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/15 border border-destructive/20 text-destructive text-xs rounded-xl font-medium flex gap-2.5 items-center">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loadingProfile ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* 1. Nutrition Profile Form */}
            <NutritionProfileForm
              initialProfile={profile}
              saving={saving}
              onSave={updateProfile}
            />

            {/* Incomplete profile message */}
            {isIncomplete ? (
              <div
                className="p-6 rounded-2xl border border-border bg-background flex flex-col items-center justify-center text-center space-y-3"
              >
                <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  Complete your nutrition profile to generate your estimated target.
                </h3>
                <div className="flex flex-wrap justify-center gap-2 max-w-md pt-1">
                  {missingFields.map((field) => (
                    <span
                      key={field}
                      className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-lg tracking-wider"
                    >
                      {formatFieldName(field)}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 2. Estimated Daily Target */}
                  <DailyTargetCard targets={targets} loading={loadingTarget} />

                  {/* 3. Macro Breakdown */}
                  <MacroBreakdownCard targets={targets} loading={loadingTarget} />
                </div>

                {/* 4. Recommended Meal Plan */}
                <MealPlanCard mealPlan={mealPlan} loading={loadingMealPlan} />
              </>
            )}

            {/* 5. Food Search Panel */}
            <FoodSearchPanel />

            {/* 6. Explanation Section */}
            <InsightExplanation />
          </div>
        )}
      </div>
    </PageContainer>
  );
};
