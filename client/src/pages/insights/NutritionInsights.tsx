import React, { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { useNutritionInsights } from './hooks/useNutritionInsights';
import { NutritionProfileForm } from './components/NutritionProfileForm';
import { DailyTargetCard } from './components/DailyTargetCard';
import { MacroBreakdownCard } from './components/MacroBreakdownCard';
import { MealPlanCard } from './components/MealPlanCard';
import { FoodSearchPanel } from './components/FoodSearchPanel';
import { InsightExplanation } from './components/InsightExplanation';
import { LineChart, AlertCircle, Loader2 } from 'lucide-react';

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

  const [showEditForm, setShowEditForm] = useState(false);

  const ACTIVITY_LABELS: Record<string, string> = {
    sedentary: 'Sedentary',
    light: 'Lightly active',
    moderate: 'Moderately active',
    active: 'Active',
    very_active: 'Very active'
  };

  const GOAL_LABELS: Record<string, string> = {
    lose_weight: 'Lose weight',
    maintain_weight: 'Maintain weight',
    gain_muscle: 'Gain muscle',
    improve_fitness: 'Improve fitness'
  };

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
            <LineChart className="h-5 w-5 text-primary" />
            Nutrition Insights
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
            {/* Incomplete profile state */}
            {isIncomplete ? (
              <div className="space-y-6">
                <div
                  className="p-6 rounded-2xl border border-border bg-background flex flex-col items-center justify-center text-center space-y-3"
                >
                  <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    Complete your profile to generate your estimated nutrition target.
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

                <NutritionProfileForm
                  initialProfile={profile}
                  saving={saving}
                  onSave={updateProfile}
                  missingFieldsOnly={true}
                  missingFieldsList={missingFields}
                />
              </div>
            ) : (
              // Complete profile state
              <div className="space-y-6">
                {/* Compact Profile Summary */}
                <div 
                  className="p-5 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  style={{ background: 'var(--card)' }}
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-foreground tracking-tight">Nutrition Profile</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-medium">
                      <span><strong>Weight:</strong> {profile.weightKg} kg</span>
                      <span><strong>Height:</strong> {profile.heightCm} cm</span>
                      <span><strong>Age:</strong> {profile.age} years</span>
                      <span className="capitalize"><strong>Gender:</strong> {profile.gender}</span>
                      <span><strong>Goal:</strong> {GOAL_LABELS[profile.goal || ''] || profile.goal}</span>
                      <span><strong>Activity:</strong> {ACTIVITY_LABELS[profile.activityLevel || ''] || profile.activityLevel}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditForm(!showEditForm)}
                    className="px-4 py-2 border border-border bg-muted/40 hover:bg-muted text-foreground rounded-xl text-xs font-bold transition-all shrink-0 sm:self-center"
                  >
                    {showEditForm ? 'Hide profile details' : 'Edit profile details'}
                  </button>
                </div>

                {/* Editable Profile Form */}
                {showEditForm && (
                  <NutritionProfileForm
                    initialProfile={profile}
                    saving={saving}
                    onSave={async (updates) => {
                      await updateProfile(updates);
                      setShowEditForm(false);
                    }}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Estimated Daily Target */}
                  <DailyTargetCard targets={targets} loading={loadingTarget} />

                  {/* Macro Breakdown */}
                  <MacroBreakdownCard targets={targets} loading={loadingTarget} />
                </div>

                {/* Recommended Meal Plan */}
                <MealPlanCard mealPlan={mealPlan} loading={loadingMealPlan} />
              </div>
            )}

            {/* Food Search Panel */}
            <FoodSearchPanel />

            {/* Explanation Section */}
            <InsightExplanation />
          </div>
        )}
      </div>
    </PageContainer>
  );
};
