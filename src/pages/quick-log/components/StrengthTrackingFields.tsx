import React from 'react';
import { Trash2, Copy, Clock } from 'lucide-react';
import { DraftExercise, DraftSet } from '../types';

interface StrengthTrackingFieldsProps {
  exercise: DraftExercise;
  validationErrors: { [key: string]: string };
  onUpdateExercise: (localId: string, updates: Partial<DraftExercise>) => void;
  onUpdateSet: (exerciseId: string, setIndex: number, updates: Partial<DraftSet>) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setIndex: number) => void;
  onDuplicateLastSet: (exerciseId: string) => void;
}

export const StrengthTrackingFields: React.FC<StrengthTrackingFieldsProps> = ({
  exercise,
  validationErrors,
  onUpdateExercise,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onDuplicateLastSet
}) => {
  return (
    <div className="space-y-4">
      {/* Sets Table */}
      <div className="space-y-2">
        <div className="grid grid-cols-[24px_1fr_1.8fr_24px] gap-2 text-[9px] uppercase font-bold text-muted-foreground px-1">
          <span>Set</span>
          <span className="text-center">Reps</span>
          <span className="text-center">Weight kg</span>
          <span />
        </div>

        {exercise.sets.map((set, setIndex) => (
          <div key={`${exercise.localId}_${setIndex}`} className="grid grid-cols-[24px_1fr_1.8fr_24px] gap-2 items-center">
            <span className="text-xs font-mono font-bold text-muted-foreground">#{setIndex + 1}</span>

            {/* Reps Stepper */}
            <div className="space-y-1">
              <div className={`flex items-center border bg-input-background rounded-lg overflow-hidden h-9 ${
                validationErrors[`reps_${exercise.localId}_${setIndex}`] ? 'border-destructive' : 'border-border'
              }`}>
                <button
                  type="button"
                  onClick={() => onUpdateSet(exercise.localId, setIndex, { reps: Math.max(0, set.reps - 1) })}
                  className="px-2 h-full hover:bg-muted/30 text-muted-foreground hover:text-foreground font-extrabold active:scale-95 transition-all text-xs"
                >-</button>
                <input
                  type="number"
                  min="0"
                  value={set.reps}
                  onChange={(e) => onUpdateSet(exercise.localId, setIndex, { reps: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-full h-full text-center bg-transparent border-0 outline-none text-xs font-bold font-mono focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => onUpdateSet(exercise.localId, setIndex, { reps: set.reps + 1 })}
                  className="px-2 h-full hover:bg-muted/30 text-muted-foreground hover:text-foreground font-extrabold active:scale-95 transition-all text-xs"
                >+</button>
              </div>
              {validationErrors[`reps_${exercise.localId}_${setIndex}`] && (
                <p className="text-[8px] text-destructive text-center font-semibold leading-tight">{validationErrors[`reps_${exercise.localId}_${setIndex}`]}</p>
              )}
            </div>

            {/* Weight Stepper */}
            <div className="space-y-1">
              <div className={`flex items-center border bg-input-background rounded-lg overflow-hidden h-9 ${
                validationErrors[`weight_${exercise.localId}_${setIndex}`] ? 'border-destructive' : 'border-border'
              }`}>
                <button
                  type="button"
                  onClick={() => onUpdateSet(exercise.localId, setIndex, { weight: Math.max(0, set.weight - 2.5) })}
                  className="px-1.5 h-full hover:bg-muted/30 text-muted-foreground hover:text-foreground font-medium active:scale-95 transition-all text-[9px] border-r border-border"
                >-2.5</button>
                <button
                  type="button"
                  onClick={() => onUpdateSet(exercise.localId, setIndex, { weight: Math.max(0, set.weight - 1) })}
                  className="px-1.5 h-full hover:bg-muted/30 text-muted-foreground hover:text-foreground font-extrabold active:scale-95 transition-all text-xs"
                >-</button>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={set.weight}
                  onChange={(e) => onUpdateSet(exercise.localId, setIndex, { weight: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-full h-full text-center bg-transparent border-0 outline-none text-xs font-bold font-mono focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => onUpdateSet(exercise.localId, setIndex, { weight: set.weight + 1 })}
                  className="px-1.5 h-full hover:bg-muted/30 text-muted-foreground hover:text-foreground font-extrabold active:scale-95 transition-all text-xs"
                >+</button>
                <button
                  type="button"
                  onClick={() => onUpdateSet(exercise.localId, setIndex, { weight: set.weight + 2.5 })}
                  className="px-1.5 h-full hover:bg-muted/30 text-muted-foreground hover:text-foreground font-medium active:scale-95 transition-all text-[9px] border-l border-border"
                >+2.5</button>
              </div>
              {validationErrors[`weight_${exercise.localId}_${setIndex}`] && (
                <p className="text-[8px] text-destructive text-center font-semibold leading-tight">{validationErrors[`weight_${exercise.localId}_${setIndex}`]}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onRemoveSet(exercise.localId, setIndex)}
              disabled={exercise.sets.length <= 1}
              className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-20 flex justify-center items-center justify-self-center"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Set Action Buttons */}
        <div className="flex items-center gap-3 mt-1.5 px-1 border-b border-border/40 pb-3">
          <button
            type="button"
            onClick={() => onAddSet(exercise.localId)}
            className="text-[11px] font-bold text-primary hover:underline transition-all"
          >
            + Add Set
          </button>
          <span className="text-muted-foreground/30 text-[10px]">•</span>
          <button
            type="button"
            onClick={() => onDuplicateLastSet(exercise.localId)}
            className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
          >
            <Copy className="h-3 w-3" /> Duplicate Last Set
          </button>
        </div>
      </div>

      {/* Optional Rest Time */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <div className="sm:col-span-1">
          <label className="flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground">
            <Clock className="h-3 w-3" /> Rest Time
          </label>
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Optional"
            value={exercise.restTime === undefined ? '' : exercise.restTime}
            onChange={(e) => {
              const val = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value) || 0);
              onUpdateExercise(exercise.localId, { restTime: val });
            }}
            className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground"
          />
          <span className="text-[10px] font-bold text-muted-foreground">sec</span>
        </div>
      </div>
    </div>
  );
};
