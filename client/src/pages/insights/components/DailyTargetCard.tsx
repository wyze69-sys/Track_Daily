import React from 'react';
import { DailyCalorieTarget } from '../types';
import { Flame } from 'lucide-react';

interface DailyTargetCardProps {
  targets: DailyCalorieTarget | null;
  loading: boolean;
}

export const DailyTargetCard: React.FC<DailyTargetCardProps> = ({ targets, loading }) => {
  if (loading) {
    return (
      <div
        className="p-6 rounded-2xl border border-border flex items-center justify-center min-h-[160px]"
        style={{ background: 'var(--card)' }}
      >
        <span className="text-xs text-muted-foreground">Calculating estimated targets...</span>
      </div>
    );
  }

  if (!targets) {
    return null;
  }

  return (
    <div
      className="p-6 rounded-2xl border border-border flex flex-col justify-between"
      style={{ background: 'var(--card)' }}
    >
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Estimated Daily Target
        </h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3.5 rounded-xl bg-primary/10 text-primary">
            <Flame size={24} />
          </div>
          <div>
            <div className="text-3xl font-black text-foreground">
              {targets.targetCalories} <span className="text-sm font-bold text-muted-foreground">kcal / day</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-semibold">
              Estimated daily target
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              BMR
            </span>
            <span className="text-sm font-bold text-foreground">{targets.bmr} kcal</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              TDEE
            </span>
            <span className="text-sm font-bold text-foreground">{targets.tdee} kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
