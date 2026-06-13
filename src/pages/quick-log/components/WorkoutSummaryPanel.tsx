import React from 'react';
import { Zap, Save, Trophy, Loader2 } from 'lucide-react';

interface WorkoutSummaryPanelProps {
  exerciseCount: number;
  totalSets: number;
  durationMinutes: number;
  xpPreview: number;
  templateName: string;
  templateSaving: boolean;
  hasExercises: boolean;
  onTemplateNameChange: (name: string) => void;
  onSaveTemplate: () => void;
}

export const WorkoutSummaryPanel: React.FC<WorkoutSummaryPanelProps> = ({
  exerciseCount,
  totalSets,
  durationMinutes,
  xpPreview,
  templateName,
  templateSaving,
  hasExercises,
  onTemplateNameChange,
  onSaveTemplate
}) => {
  return (
    <div className="lg:col-span-3 p-5 rounded-2xl border border-border bg-card h-fit space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Zap className="h-5 w-5 text-primary" />
        <h3 className="font-extrabold text-sm tracking-tight text-foreground">Summary Preview</h3>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-muted/10 border border-border p-3">
          <p className="text-base font-black text-foreground">{exerciseCount}</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase">Moves</p>
        </div>
        <div className="rounded-xl bg-muted/10 border border-border p-3">
          <p className="text-base font-black text-foreground">{totalSets}</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase">Sets</p>
        </div>
        <div className="rounded-xl bg-muted/10 border border-border p-3">
          <p className="text-base font-black text-foreground">{durationMinutes}</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase">Min</p>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Estimated duration:</span>
          <span className="font-bold text-foreground">{durationMinutes} min</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Set count:</span>
          <span className="font-bold text-foreground">{totalSets} sets</span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between text-xs font-bold text-primary">
          <span>Estimated XP:</span>
          <span>+{xpPreview} XP</span>
        </div>
      </div>

      {/* Save as Template */}
      <div className="rounded-2xl border border-border bg-muted/5 p-3 space-y-2">
        <label className="block text-[9px] font-black uppercase tracking-wider text-muted-foreground">
          Save as custom template
        </label>
        <input
          value={templateName}
          onChange={(e) => onTemplateNameChange(e.target.value)}
          placeholder="Template name..."
          className="w-full rounded-xl border border-border bg-input-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={onSaveTemplate}
          disabled={templateSaving || !hasExercises}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-foreground text-background py-2 text-xs font-black hover:brightness-90 transition-all disabled:opacity-40 active:scale-[0.99]"
        >
          {templateSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Template
        </button>
      </div>

      <div className="p-3 bg-muted/10 rounded-xl">
        <p className="text-[9px] text-muted-foreground leading-normal flex items-start gap-1">
          <Trophy className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
          <span>Saved workouts use the server-calculated XP system.</span>
        </p>
      </div>
    </div>
  );
};
