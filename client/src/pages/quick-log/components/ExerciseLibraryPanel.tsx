import React, { useMemo } from 'react';
import { Search, Plus, Dumbbell } from 'lucide-react';
import { ExerciseCategory, ExerciseLibraryItem } from '../../../services/api';

interface ExerciseLibraryPanelProps {
  categories: ExerciseCategory[];
  library: ExerciseLibraryItem[];
  loading: boolean;
  workoutType: string;
  exerciseSearch: string;
  onWorkoutTypeChange: (type: string) => void;
  onSearchChange: (search: string) => void;
  onAddExercise: (exercise: ExerciseLibraryItem) => void;
  onAddBlank: () => void;
}

export const ExerciseLibraryPanel: React.FC<ExerciseLibraryPanelProps> = ({
  categories,
  library,
  loading,
  workoutType,
  exerciseSearch,
  onWorkoutTypeChange,
  onSearchChange,
  onAddExercise,
  onAddBlank
}) => {
  const activeCategory = categories.find((cat) => cat.name === workoutType);

  const filteredLibrary = useMemo(() => {
    const search = exerciseSearch.trim().toLowerCase();
    return library
      .filter((exercise) => {
        if (search) return true;
        return !activeCategory?.id || exercise.categoryId === activeCategory.id;
      })
      .filter((exercise) => {
        if (!search) return true;
        return [exercise.name, exercise.muscleGroup, exercise.equipment]
          .join(' ')
          .toLowerCase()
          .includes(search);
      })
      .slice(0, 8);
  }, [library, exerciseSearch, activeCategory?.id]);

  return (
    <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Exercise Library</p>
          <h2 className="text-sm font-black text-foreground">Add Exercise</h2>
        </div>
        <Dumbbell className="h-5 w-5 text-primary" />
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="animate-pulse h-10 bg-muted/20 rounded-xl" />
          <div className="animate-pulse h-24 bg-muted/20 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => onWorkoutTypeChange(cat.name)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all active:scale-[0.98] ${
                  workoutType === cat.name
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-muted/10 text-muted-foreground border-border hover:bg-muted/30 hover:text-foreground'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={exerciseSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredLibrary.length > 0) {
                    onAddExercise(filteredLibrary[0]);
                    onSearchChange('');
                  }
                }
              }}
              placeholder="Search movements (Press Enter to add)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredLibrary.map((exercise) => {
              const isDiffCategory = activeCategory?.id && exercise.categoryId !== activeCategory.id;
              return (
                <button
                  type="button"
                  key={exercise.id}
                  onClick={() => {
                    onAddExercise(exercise);
                    onSearchChange('');
                  }}
                  className="w-full text-left p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-white/[0.01] transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-foreground truncate">{exercise.name}</p>
                        {isDiffCategory && (
                          <span className="text-[8px] font-bold uppercase px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                            {exercise.categoryName}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                        {exercise.muscleGroup} • {exercise.equipment}
                      </p>
                    </div>
                    <span className="h-6 w-6 rounded-lg bg-muted flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors">
                      <Plus className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onAddBlank}
            className="w-full py-2.5 text-xs font-bold rounded-xl border border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-colors"
          >
            + Add Custom Exercise
          </button>
        </>
      )}
    </div>
  );
};
