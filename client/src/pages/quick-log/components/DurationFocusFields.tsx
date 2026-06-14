import React from 'react';
import { DraftExercise } from '../types';

interface DurationFocusFieldsProps {
  exercise: DraftExercise;
  onUpdateExercise: (localId: string, updates: Partial<DraftExercise>) => void;
}

export const DurationFocusFields: React.FC<DurationFocusFieldsProps> = ({
  exercise,
  onUpdateExercise
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Focus Area */}
        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-bold text-muted-foreground">Focus Area</label>
          <input
            type="text"
            placeholder="e.g. Hips, Lower Back, Hamstrings"
            value={exercise.focusArea || ''}
            onChange={(e) => onUpdateExercise(exercise.localId, { focusArea: e.target.value })}
            className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground"
          />
        </div>

        {/* Difficulty */}
        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-bold text-muted-foreground">Difficulty</label>
          <select
            value={exercise.difficulty || ''}
            onChange={(e) => onUpdateExercise(exercise.localId, { difficulty: e.target.value || undefined })}
            className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground"
          >
            <option value="">Select Difficulty...</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Notes</label>
        <textarea
          placeholder="e.g. Felt a deep stretch, held poses for 30s each..."
          value={exercise.notes || ''}
          onChange={(e) => onUpdateExercise(exercise.localId, { notes: e.target.value })}
          rows={2}
          className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground resize-none"
        />
      </div>

      <div className="rounded-lg border border-border bg-muted/10 p-3 text-[10px] leading-relaxed text-muted-foreground mt-2">
        Calories are estimated from duration, activity type, and difficulty.
      </div>
    </div>
  );
};
