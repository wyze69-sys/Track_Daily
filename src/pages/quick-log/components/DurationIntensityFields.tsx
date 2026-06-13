import React from 'react';
import { DraftExercise } from '../types';

interface DurationIntensityFieldsProps {
  exercise: DraftExercise;
  onUpdateExercise: (localId: string, updates: Partial<DraftExercise>) => void;
}

export const DurationIntensityFields: React.FC<DurationIntensityFieldsProps> = ({
  exercise,
  onUpdateExercise
}) => {
  return (
    <div className="space-y-3">
      {/* Intensity */}
      <div className="space-y-1">
        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Intensity</label>
        <select
          value={exercise.intensity || ''}
          onChange={(e) => onUpdateExercise(exercise.localId, { intensity: e.target.value || undefined })}
          className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground"
        >
          <option value="">Select Intensity...</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Notes</label>
        <textarea
          placeholder="e.g. 5v5 scrimmage, played defense..."
          value={exercise.notes || ''}
          onChange={(e) => onUpdateExercise(exercise.localId, { notes: e.target.value })}
          rows={2}
          className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground resize-none"
        />
      </div>
    </div>
  );
};
