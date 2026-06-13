import React from 'react';
import { Search, Dumbbell, Loader2, Plus } from 'lucide-react';
import { ExerciseCategory, ActivityLibraryItem } from '../../../services/api';
import { useActivityLibrary } from '../hooks/useActivityLibrary';
import { ActivitySuggestionList } from './ActivitySuggestionList';
import { CustomActivityInput } from './CustomActivityInput';

interface ActivitySearchPanelProps {
  categories: ExerciseCategory[];
  workoutType: string;
  onWorkoutTypeChange: (type: string) => void;
  onAddExercise: (exercise: any) => void;
}

const categoryHints: { [key: string]: string } = {
  'Strength': 'Examples: Push Up, Squat, Bench Press',
  'Cardio': 'Examples: Running, Cycling, Jump Rope',
  'Flexibility & Yoga': 'Examples: Full Body Stretch, Yoga Flow, Hip Mobility',
  'Sports': 'Examples: Football, Basketball, Badminton'
};

export const ActivitySearchPanel: React.FC<ActivitySearchPanelProps> = ({
  categories,
  workoutType,
  onWorkoutTypeChange,
  onAddExercise
}) => {
  const activeCategory = categories.find((cat) => cat.name === workoutType);

  const {
    searchQuery,
    setSearchQuery,
    suggestions,
    searchResults,
    loading,
    createCustomActivity
  } = useActivityLibrary(activeCategory);

  const hint = categoryHints[workoutType] || '';

  const handleCreateCustomActivity = async (name: string) => {
    if (!activeCategory) return;
    try {
      const newActivity = await createCustomActivity(name, activeCategory.id);
      onAddExercise(newActivity);
      setSearchQuery('');
    } catch (err) {
      console.error('Failed to create custom activity in DB, using fallback local mapping', err);
      // Fallback local mapping if backend fails, preserving custom name in workout log
      const fallbackActivity = {
        id: `act-custom-local-${Date.now()}`,
        categoryId: activeCategory.id,
        categoryName: activeCategory.name,
        name,
        normalizedName: name.toLowerCase().replace(/\s+/g, ' '),
        trackingType: activeCategory.name.toLowerCase().includes('cardio') ? 'duration_distance' :
                      ((activeCategory.name.toLowerCase().includes('flexibility') || activeCategory.name.toLowerCase().includes('yoga') || activeCategory.name.toLowerCase().includes('mobility')) ? 'duration_focus' :
                       (activeCategory.name.toLowerCase().includes('sport') ? 'duration_intensity' : 'sets_reps_weight')),
        tags: ['Custom'],
        isActive: true,
        source: 'custom',
        isCustom: true
      };
      onAddExercise(fallbackActivity);
      setSearchQuery('');
    }
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Activity Library</p>
          <h2 className="text-sm font-black text-foreground">Add Exercise</h2>
        </div>
        <Dumbbell className="h-5 w-5 text-primary" />
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 gap-2">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => {
              onWorkoutTypeChange(cat.name);
              setSearchQuery('');
            }}
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

      {/* Search Input */}
      <div className="space-y-1.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${workoutType} movements...`}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none text-foreground"
          />
        </div>
        {hint && (
          <p className="text-[9px] text-muted-foreground font-semibold px-1 font-mono">
            {hint}
          </p>
        )}
      </div>

      {/* Results and suggestions area */}
      <div className="space-y-4 min-h-[150px]">
        {loading && !isSearching ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : !isSearching ? (
          /* Suggestions List */
          <ActivitySuggestionList
            suggestions={suggestions}
            onSelectActivity={onAddExercise}
          />
        ) : (
          /* Search Results List */
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider font-mono">Search Results</h3>
              {loading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
            </div>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {searchResults.length === 0 && !loading ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No matching activity found. Use a custom activity instead.
                </p>
              ) : (
                searchResults.map((exercise) => (
                  <button
                    type="button"
                    key={exercise.id}
                    onClick={() => {
                      onAddExercise(exercise);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-white/[0.01] transition-all group flex items-center justify-between gap-2 active:scale-[0.99]"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{exercise.name}</p>
                      {exercise.tags && exercise.tags.length > 0 && (
                        <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                          {exercise.tags.join(' • ')}
                        </p>
                      )}
                    </div>
                    <span className="h-5 w-5 rounded bg-muted flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-colors">
                      <Plus className="h-3 w-3" />
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Custom Activity Option */}
            {activeCategory && (
              <div className="pt-2 border-t border-border/50">
                <CustomActivityInput
                  query={searchQuery}
                  categoryId={activeCategory.id}
                  existingItems={searchResults}
                  onCreateCustomActivity={handleCreateCustomActivity}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
