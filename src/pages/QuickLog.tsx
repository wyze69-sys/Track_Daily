import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  workoutService,
  templateService,
  categoryService,
  exerciseLibraryService,
  WorkoutTemplate,
  ExerciseCategory,
  ExerciseLibraryItem,
  WorkoutExercise
} from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import {
  Clock,
  Zap,
  Loader2,
  ArrowLeft,
  Trophy,
  Search,
  Plus,
  Trash2,
  Dumbbell,
  ListChecks
} from 'lucide-react';

type DraftSet = { reps: number; weight: number };
type DraftExercise = {
  localId: string;
  libraryId?: string;
  exerciseName: string;
  categoryId?: string;
  categoryName?: string;
  muscleGroup?: string;
  duration: number;
  sets: DraftSet[];
};

const makeId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const QuickLog: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [library, setLibrary] = useState<ExerciseLibraryItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [workoutType, setWorkoutType] = useState('Strength');
  const [moodAfterWorkout, setMoodAfterWorkout] = useState('Satisfied');
  const [note, setNote] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<DraftExercise[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormOptions() {
      try {
        const [cats, tpls, exercises] = await Promise.all([
          categoryService.getAll(),
          templateService.getAll(),
          exerciseLibraryService.getAll()
        ]);
        setCategories(cats);
        setTemplates(tpls);
        setLibrary(exercises);

        const strength = cats.find((cat) => cat.name.toLowerCase() === 'strength');
        if (strength) setWorkoutType(strength.name);
        else if (cats.length > 0) setWorkoutType(cats[0].name);
      } catch (err) {
        console.error('Failed to load log form options', err);
        setError('Could not load exercise options. Try refreshing the page.');
      } finally {
        setLoadingOptions(false);
      }
    }
    loadFormOptions();
  }, []);

  const activeCategory = categories.find((cat) => cat.name === workoutType);
  const durationMinutes = useMemo(
    () => selectedExercises.reduce((sum, exercise) => sum + Number(exercise.duration || 0), 0),
    [selectedExercises]
  );
  const totalSets = useMemo(
    () => selectedExercises.reduce((sum, exercise) => sum + exercise.sets.length, 0),
    [selectedExercises]
  );

  const filteredLibrary = useMemo(() => {
    const search = exerciseSearch.trim().toLowerCase();
    return library
      .filter((exercise) => !activeCategory?.id || exercise.categoryId === activeCategory.id)
      .filter((exercise) => {
        if (!search) return true;
        return [exercise.name, exercise.muscleGroup, exercise.equipment]
          .join(' ')
          .toLowerCase()
          .includes(search);
      })
      .slice(0, 8);
  }, [library, exerciseSearch, activeCategory?.id]);

  const handleTemplateSelect = (tpl: WorkoutTemplate) => {
    setSelectedTemplateId(tpl.id);
    setWorkoutType(tpl.category);
    setNote(`Done preset: ${tpl.name}`);
  };

  const addExerciseFromLibrary = (exercise: ExerciseLibraryItem) => {
    setSelectedTemplateId(null);
    setWorkoutType(exercise.categoryName || workoutType);
    setSelectedExercises((current) => [
      ...current,
      {
        localId: makeId(),
        libraryId: exercise.id,
        exerciseName: exercise.name,
        categoryId: exercise.categoryId || undefined,
        categoryName: exercise.categoryName || undefined,
        muscleGroup: exercise.muscleGroup,
        duration: exercise.defaultDuration || 10,
        sets: exercise.exerciseType === 'cardio'
          ? [{ reps: 1, weight: 0 }]
          : [
              { reps: 10, weight: 0 },
              { reps: 10, weight: 0 },
              { reps: 10, weight: 0 }
            ]
      }
    ]);
  };

  const addBlankExercise = () => {
    const category = activeCategory || categories[0];
    setSelectedTemplateId(null);
    setSelectedExercises((current) => [
      ...current,
      {
        localId: makeId(),
        exerciseName: 'Custom Exercise',
        categoryId: category?.id,
        categoryName: category?.name || workoutType,
        muscleGroup: 'Custom',
        duration: 10,
        sets: [{ reps: 10, weight: 0 }]
      }
    ]);
  };

  const updateExercise = (localId: string, updates: Partial<DraftExercise>) => {
    setSelectedExercises((current) =>
      current.map((exercise) => exercise.localId === localId ? { ...exercise, ...updates } : exercise)
    );
  };

  const updateSet = (exerciseId: string, setIndex: number, updates: Partial<DraftSet>) => {
    setSelectedExercises((current) =>
      current.map((exercise) => {
        if (exercise.localId !== exerciseId) return exercise;
        return {
          ...exercise,
          sets: exercise.sets.map((set, index) => index === setIndex ? { ...set, ...updates } : set)
        };
      })
    );
  };

  const addSet = (exerciseId: string) => {
    setSelectedExercises((current) =>
      current.map((exercise) => {
        if (exercise.localId !== exerciseId) return exercise;
        const last = exercise.sets[exercise.sets.length - 1] || { reps: 10, weight: 0 };
        return { ...exercise, sets: [...exercise.sets, { ...last }] };
      })
    );
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setSelectedExercises((current) =>
      current.map((exercise) => {
        if (exercise.localId !== exerciseId) return exercise;
        return { ...exercise, sets: exercise.sets.filter((_, index) => index !== setIndex) };
      })
    );
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises((current) => current.filter((exercise) => exercise.localId !== exerciseId));
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!workoutType) {
      setError('Please choose a workout category.');
      return;
    }

    if (selectedExercises.length === 0) {
      setError('Add at least one exercise from the library or create a custom exercise.');
      return;
    }

    const invalidExercise = selectedExercises.find(
      (exercise) => !exercise.exerciseName.trim() || exercise.duration <= 0 || exercise.sets.length === 0
    );
    if (invalidExercise) {
      setError('Each exercise needs a name, duration, and at least one set.');
      return;
    }

    setSubmitting(true);
    try {
      const exercises: WorkoutExercise[] = selectedExercises.map((exercise) => ({
        categoryId: exercise.categoryId || activeCategory?.id,
        categoryName: exercise.categoryName || activeCategory?.name || workoutType,
        exerciseName: exercise.exerciseName.trim(),
        duration: Number(exercise.duration || 0),
        sets: exercise.sets.map((set) => ({
          reps: Number(set.reps || 0),
          weight: Number(set.weight || 0)
        }))
      }));

      await workoutService.quickLog({
        workoutType,
        durationMinutes: Math.max(durationMinutes, 1),
        moodAfterWorkout,
        note,
        templateId: selectedTemplateId,
        exercises
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Operation failed. Please review values.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateXpPreview = () => {
    let xp = Math.max(30, Math.round(durationMinutes * 1.8));
    if (totalSets >= 6) xp += 15;
    if (note.trim()) xp += 8;
    return xp;
  };

  const moodOptions = [
    { label: '⚡ Energetic', value: 'Energetic' },
    { label: '🏆 Accomplished', value: 'Accomplished' },
    { label: '😌 Satisfied', value: 'Satisfied' },
    { label: '😴 Tired', value: 'Tired' },
    { label: '🥵 Exhausted', value: 'Exhausted' }
  ];

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-white rounded-xl border border-gray-150 hover:bg-gray-50 text-gray-700 shadow-2xs transition-colors active:scale-95"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-950">Workout Builder Log</h1>
            <p className="text-xs text-gray-500 mt-0.5">Pick real exercises, add sets, then save it to your backend history.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500 tracking-wider">Exercise Library</p>
                  <h2 className="text-base font-extrabold text-gray-950">Choose movement</h2>
                </div>
                <Dumbbell className="h-5 w-5 text-teal-600" />
              </div>

              {loadingOptions ? (
                <div className="space-y-2">
                  <div className="animate-pulse h-10 bg-gray-50 rounded-xl" />
                  <div className="animate-pulse h-24 bg-gray-50 rounded-xl" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => { setWorkoutType(cat.name); setSelectedTemplateId(null); }}
                        className={`py-2.5 px-2 text-xs font-bold rounded-xl border text-center transition-all active:scale-[0.98] ${
                          workoutType === cat.name
                            ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      value={exerciseSearch}
                      onChange={(e) => setExerciseSearch(e.target.value)}
                      placeholder="Search exercise..."
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {filteredLibrary.map((exercise) => (
                      <button
                        type="button"
                        key={exercise.id}
                        onClick={() => addExerciseFromLibrary(exercise)}
                        className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/40 transition-all group active:scale-[0.99]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-extrabold text-gray-950">{exercise.name}</p>
                            <p className="text-[10px] text-gray-500 mt-1 font-semibold">
                              {exercise.muscleGroup} • {exercise.equipment}
                            </p>
                          </div>
                          <span className="h-7 w-7 rounded-lg bg-gray-50 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center transition-colors">
                            <Plus className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addBlankExercise}
                    className="w-full py-2.5 text-xs font-bold rounded-xl border border-dashed border-teal-300 text-teal-700 hover:bg-teal-50 transition-colors"
                  >
                    + Add custom exercise
                  </button>
                </>
              )}
            </div>

            {templates.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                <p className="text-xs font-bold uppercase text-gray-500 tracking-wider">Preset templates</p>
                <div className="space-y-2">
                  {templates.slice(0, 3).map((tpl) => (
                    <button
                      type="button"
                      key={tpl.id}
                      onClick={() => handleTemplateSelect(tpl)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedTemplateId === tpl.id
                          ? 'border-teal-500 bg-teal-50/60 text-teal-950'
                          : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <p className="text-xs font-bold">{tpl.name}</p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase font-semibold">{tpl.category} • {tpl.durationMinutes}m</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500 tracking-wider">Set-by-set tracker</p>
                <h2 className="text-base font-extrabold text-gray-950">Today's workout</h2>
              </div>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                {durationMinutes} min
              </span>
            </div>

            {selectedExercises.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-500 bg-gray-50/40">
                <ListChecks className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-bold text-gray-800">No exercises yet</p>
                <p className="text-xs mt-1">Choose from the library to build a real workout log.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedExercises.map((exercise, exerciseIndex) => (
                  <div key={exercise.localId} className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4 space-y-3 transition-all hover:border-gray-200">
                    <div className="flex items-start gap-3">
                      <span className="h-8 w-8 rounded-xl bg-gray-900 text-white text-xs font-black flex items-center justify-center">
                        {exerciseIndex + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          value={exercise.exerciseName}
                          onChange={(e) => updateExercise(exercise.localId, { exerciseName: e.target.value })}
                          className="sm:col-span-2 text-xs p-2 rounded-lg border border-gray-200 bg-white font-bold text-gray-900"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={exercise.duration}
                            onChange={(e) => updateExercise(exercise.localId, { duration: Number(e.target.value) || 0 })}
                            className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white"
                          />
                          <span className="text-[10px] font-bold text-gray-500">min</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExercise(exercise.localId)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="pl-0 sm:pl-11 space-y-2">
                      <div className="grid grid-cols-[40px_1fr_1fr_36px] gap-2 text-[10px] uppercase font-bold text-gray-500 px-1">
                        <span>Set</span>
                        <span>Reps</span>
                        <span>Weight kg</span>
                        <span />
                      </div>
                      {exercise.sets.map((set, setIndex) => (
                        <div key={`${exercise.localId}_${setIndex}`} className="grid grid-cols-[40px_1fr_1fr_36px] gap-2 items-center">
                          <span className="text-xs font-mono font-bold text-gray-500">#{setIndex + 1}</span>
                          <input
                            type="number"
                            min="0"
                            value={set.reps}
                            onChange={(e) => updateSet(exercise.localId, setIndex, { reps: Number(e.target.value) || 0 })}
                            className="text-xs p-2 rounded-lg border border-gray-200 bg-white"
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={set.weight}
                            onChange={(e) => updateSet(exercise.localId, setIndex, { weight: Number(e.target.value) || 0 })}
                            className="text-xs p-2 rounded-lg border border-gray-200 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeSet(exercise.localId, setIndex)}
                            disabled={exercise.sets.length <= 1}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSet(exercise.localId)}
                        className="text-xs font-bold text-teal-700 hover:text-teal-900"
                      >
                        + Add another set
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4 border-t border-gray-100 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Mood after workout</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {moodOptions.map((m) => (
                    <button
                      type="button"
                      key={m.value}
                      onClick={() => setMoodAfterWorkout(m.value)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all active:scale-[0.98] ${
                        moodAfterWorkout === m.value
                          ? 'border-teal-500 bg-teal-50/50 text-teal-950 font-extrabold'
                          : 'border-gray-100 bg-white hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Optional workout notes</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="E.g. Bench felt strong, squat form improved, keep same weight next time."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 shadow-xs focus:ring-1 focus:ring-teal-500 bg-gray-50/40 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs transition-all disabled:bg-gray-400 active:scale-[0.99]"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Real Workout Log
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 bg-gray-950 text-white p-6 rounded-2xl border border-gray-800 shadow-md h-fit space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <Zap className="h-5 w-5 text-amber-300 fill-amber-300" />
              <h3 className="font-extrabold text-sm tracking-tight">Workout Summary</h3>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-lg font-black text-white">{selectedExercises.length}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Exercises</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-lg font-black text-white">{totalSets}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Sets</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-lg font-black text-white">{durationMinutes}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Minutes</p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Duration estimate:</span>
                <span className="font-bold text-gray-200">{durationMinutes} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Set detail:</span>
                <span className="font-bold text-gray-200">{totalSets} sets</span>
              </div>
              <div className="border-t border-gray-800 pt-3 flex justify-between text-sm font-extrabold text-amber-300">
                <span>EST. XP:</span>
                <span>+{calculateXpPreview()} XP</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl rounded-b-lg">
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                <Trophy className="inline h-3.5 w-3.5 mr-1 text-amber-300" />
                This saves real exercises and sets to the backend. The exact XP still comes from the server, not this preview.
              </p>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};
