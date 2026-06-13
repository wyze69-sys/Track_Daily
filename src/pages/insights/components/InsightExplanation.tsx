import React from 'react';
import { AlertCircle } from 'lucide-react';

export const InsightExplanation: React.FC = () => {
  return (
    <div
      className="p-6 rounded-2xl border border-border space-y-4"
      style={{ background: 'var(--card)' }}
    >
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Dataset-backed values
      </h2>
      
      <p className="text-xs text-muted-foreground leading-relaxed">
        Your target is estimated from your profile and activity level. The meal plan is selected from dataset-backed nutrition values.
      </p>

      <div className="flex gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-xs font-semibold leading-relaxed">
        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
        <p>
          Disclaimer: This is not medical advice. Values are estimates.
        </p>
      </div>
    </div>
  );
};
