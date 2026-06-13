import React from 'react';
import { DraftExercise } from '../types';

interface CardioTrackingFieldsProps {
  exercise: DraftExercise;
  validationErrors: { [key: string]: string };
  onUpdateExercise: (localId: string, updates: Partial<DraftExercise>) => void;
}

const formatEstimatedPace = (duration?: number, distance?: number) => {
  if (!duration || !distance || duration <= 0 || distance <= 0) return null;
  const minutesPerKm = duration / distance;
  const wholeMinutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - wholeMinutes) * 60);
  return `${wholeMinutes}:${seconds.toString().padStart(2, '0')} /km`;
};

export const CardioTrackingFields: React.FC<CardioTrackingFieldsProps> = ({
  exercise,
  validationErrors,
  onUpdateExercise
}) => {
  const estimatedPace = formatEstimatedPace(exercise.duration, exercise.distance);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-bold text-muted-foreground">Distance (km)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="Optional, e.g. 5.0"
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

        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-bold text-muted-foreground">Pace</label>
          <div className="w-full text-xs p-2 rounded-lg border border-border bg-muted/20 text-muted-foreground min-h-[34px] flex items-center">
            {estimatedPace || 'Auto when time + distance are entered'}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/10 p-3 text-[10px] leading-relaxed text-muted-foreground">
        Enter what the user actually knows. Time only is okay. Distance only is okay. If both are entered, pace is calculated automatically. Calories are estimated after saving from profile weight + activity data, so new users do not need to know calories.
      </div>
    </div>
  );
};
