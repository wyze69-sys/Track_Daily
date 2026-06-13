import React from 'react';
import { DraftExercise } from '../types';

interface CardioTrackingFieldsProps {
  exercise: DraftExercise;
  validationErrors: { [key: string]: string };
  onUpdateExercise: (localId: string, updates: Partial<DraftExercise>) => void;
}

export const CardioTrackingFields: React.FC<CardioTrackingFieldsProps> = ({
  exercise,
  validationErrors,
  onUpdateExercise
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Distance */}
      <div className="space-y-1">
        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Distance (km)</label>
        <input
          type="number"
          min="0"
          step="0.1"
          placeholder="e.g. 5.0"
          value={exercise.distance === undefined ? '' : exercise.distance}
          onChange={(e) => {
            const val = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value) || 0);
            onUpdateExercise(exercise.localId, { distance: val });
          }}
          className={`w-full text-xs p-2 rounded-lg border bg-input-background focus:border-primary outline-none text-foreground ${
            validationErrors[`distance_${exercise.localId}`] ? 'border-destructive' : 'border-border'
          }`}
        />
        {validationErrors[`distance_${exercise.localId}`] && (
          <p className="text-[9px] text-destructive font-semibold">{validationErrors[`distance_${exercise.localId}`]}</p>
        )}
      </div>

      {/* Pace */}
      <div className="space-y-1">
        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Pace</label>
        <input
          type="text"
          placeholder="e.g. 5:30 /km"
          value={exercise.pace || ''}
          onChange={(e) => onUpdateExercise(exercise.localId, { pace: e.target.value })}
          className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground"
        />
      </div>

      {/* Calories */}
      <div className="space-y-1">
        <label className="block text-[10px] uppercase font-bold text-muted-foreground">Calories</label>
        <input
          type="number"
          min="0"
          placeholder="e.g. 350"
          value={exercise.calories === undefined ? '' : exercise.calories}
          onChange={(e) => {
            const val = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value) || 0);
            onUpdateExercise(exercise.localId, { calories: val });
          }}
          className={`w-full text-xs p-2 rounded-lg border bg-input-background focus:border-primary outline-none text-foreground ${
            validationErrors[`calories_${exercise.localId}`] ? 'border-destructive' : 'border-border'
          }`}
        />
        {validationErrors[`calories_${exercise.localId}`] && (
          <p className="text-[9px] text-destructive font-semibold">{validationErrors[`calories_${exercise.localId}`]}</p>
        )}
      </div>
    </div>
  );
};
