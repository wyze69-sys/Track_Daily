import React from 'react';
import { Check, X, Loader2 } from 'lucide-react';

interface EditWorkoutFormProps {
  editedType: string;
  editedDuration: number;
  editedMood: string;
  editedNote: string;
  savingId: string | null;
  workoutId: string;
  onTypeChange: (v: string) => void;
  onDurationChange: (v: number) => void;
  onMoodChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
}

const MOOD_OPTIONS = ['Energetic', 'Accomplished', 'Satisfied', 'Tired', 'Exhausted'];

export const EditWorkoutForm: React.FC<EditWorkoutFormProps> = ({
  editedType,
  editedDuration,
  editedMood,
  editedNote,
  savingId,
  workoutId,
  onTypeChange,
  onDurationChange,
  onMoodChange,
  onNoteChange,
  onSave,
  onCancel
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Workout Type</label>
          <input
            type="text"
            value={editedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Duration (Min)</label>
          <input
            type="number"
            value={editedDuration}
            onChange={(e) => onDurationChange(parseInt(e.target.value) || 0)}
            className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Mood After Workout</label>
          <select
            value={editedMood}
            onChange={(e) => onMoodChange(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground"
          >
            {MOOD_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Notes</label>
        <input
          type="text"
          value={editedNote}
          onChange={(e) => onNoteChange(e.target.value)}
          className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/10 rounded-lg font-bold flex items-center gap-1 border border-border"
        >
          <X className="h-3.5 w-3.5" /> Cancel
        </button>
        <button
          type="button"
          disabled={savingId === workoutId}
          onClick={() => onSave(workoutId)}
          className="px-3.5 py-1.5 bg-primary font-bold text-xs text-primary-foreground hover:brightness-110 rounded-lg flex items-center gap-1"
        >
          {savingId === workoutId ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
};
