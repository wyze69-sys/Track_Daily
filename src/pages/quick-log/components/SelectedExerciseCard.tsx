import React from 'react';
import { Trash2 } from 'lucide-react';
import { DraftExercise, DraftSet } from '../types';
import { TrackingFields, getTrackingType } from './TrackingFields';

interface SelectedExerciseCardProps {
  exercise: DraftExercise;
  exerciseIndex: number;
  validationErrors: { [key: string]: string };
  onUpdateExercise: (localId: string, updates: Partial<DraftExercise>) => void;
  onUpdateSet: (exerciseId: string, setIndex: number, updates: Partial<DraftSet>) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setIndex: number) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onDuplicateLastSet: (exerciseId: string) => void;
}

export const SelectedExerciseCard: React.FC<SelectedExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  validationErrors,
  onUpdateExercise,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onDuplicateLastSet
}) => {
  const isCardio = exercise.trackingType === 'duration_distance' || exercise.categoryName === 'Cardio';

  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-4 space-y-3 transition-all">
      {/* Exercise Header Row */}
      <div className="flex items-start gap-3">
        <span className="h-7 w-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
          {exerciseIndex + 1}
        </span>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <input
              value={exercise.exerciseName}
              onChange={(e) => onUpdateExercise(exercise.localId, { exerciseName: e.target.value })}
              className={`w-full text-xs p-2 rounded-lg border bg-input-background font-bold text-foreground focus:border-primary outline-none ${
                validationErrors[`name_${exercise.localId}`] ? 'border-destructive focus:border-destructive' : 'border-border'
              }`}
              placeholder="Exercise Name"
            />
            {validationErrors[`name_${exercise.localId}`] && (
              <p className="text-[10px] text-destructive mt-1 font-semibold">{validationErrors[`name_${exercise.localId}`]}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-muted-foreground">
              {isCardio ? 'Time (min)' : 'Duration (min)'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={isCardio ? '0' : '1'}
                placeholder={isCardio ? 'Optional' : undefined}
                value={exercise.duration}
                onChange={(e) => onUpdateExercise(exercise.localId, { duration: Number(e.target.value) || 0 })}
                className={`w-full text-xs p-2 rounded-lg border bg-input-background focus:border-primary outline-none ${
                  validationErrors[`duration_${exercise.localId}`] ? 'border-destructive focus:border-destructive' : 'border-border'
                }`}
              />
              <span className="text-[10px] font-bold text-muted-foreground">min</span>
            </div>
            {validationErrors[`duration_${exercise.localId}`] && (
              <p className="text-[10px] text-destructive mt-1 font-semibold">{validationErrors[`duration_${exercise.localId}`]}</p>
            )}
            {getTrackingType(exercise) === 'sets_reps_weight' && (!exercise.duration || exercise.duration <= 0) && (
              <p className="text-[9px] text-yellow-500 mt-1 font-semibold">
                ⚠️ No duration: calories estimated from sets
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemoveExercise(exercise.localId)}
          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <TrackingFields
        exercise={exercise}
        validationErrors={validationErrors}
        onUpdateExercise={onUpdateExercise}
        onUpdateSet={onUpdateSet}
        onAddSet={onAddSet}
        onRemoveSet={onRemoveSet}
        onDuplicateLastSet={onDuplicateLastSet}
      />
    </div>
  );
};
