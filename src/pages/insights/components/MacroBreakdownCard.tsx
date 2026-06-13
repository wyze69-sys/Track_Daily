import React from 'react';
import { DailyCalorieTarget } from '../types';

interface MacroBreakdownCardProps {
  targets: DailyCalorieTarget | null;
  loading: boolean;
}

export const MacroBreakdownCard: React.FC<MacroBreakdownCardProps> = ({ targets, loading }) => {
  if (loading || !targets) {
    return (
      <div
        className="p-6 rounded-2xl border border-border flex items-center justify-center min-h-[160px]"
        style={{ background: 'var(--card)' }}
      >
        <span className="text-xs text-muted-foreground">Calculating macro breakdown...</span>
      </div>
    );
  }

  // Calculate percentages (based on calories: protein = 4 kcal/g, carb = 4 kcal/g, fat = 9 kcal/g)
  const proteinKcal = targets.proteinTargetG * 4;
  const carbsKcal = targets.carbsTargetG * 4;
  const fatKcal = targets.fatTargetG * 9;
  const totalCalculatedKcal = proteinKcal + carbsKcal + fatKcal || 1;

  const proteinPct = Math.round((proteinKcal / totalCalculatedKcal) * 100);
  const carbsPct = Math.round((carbsKcal / totalCalculatedKcal) * 100);
  const fatPct = Math.round((fatKcal / totalCalculatedKcal) * 100);

  return (
    <div
      className="p-6 rounded-2xl border border-border flex flex-col justify-between"
      style={{ background: 'var(--card)' }}
    >
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Macro Breakdown
        </h2>

        <div className="space-y-4">
          {/* Protein */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Protein (1.8g / kg)
              </span>
              <span className="text-xs font-bold text-foreground">
                {targets.proteinTargetG}g <span className="text-[10px] text-muted-foreground">({proteinPct}%)</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-background overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${proteinPct}%` }} />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Carbohydrates (Remainder)
              </span>
              <span className="text-xs font-bold text-foreground">
                {targets.carbsTargetG}g <span className="text-[10px] text-muted-foreground">({carbsPct}%)</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-background overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${carbsPct}%` }} />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Fat (25% energy)
              </span>
              <span className="text-xs font-bold text-foreground">
                {targets.fatTargetG}g <span className="text-[10px] text-muted-foreground">({fatPct}%)</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-background overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${fatPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
