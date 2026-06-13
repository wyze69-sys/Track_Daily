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
  Minus,
  Trash2,
  Dumbbell,
  ListChecks,
  Save,
  Copy
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
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<DraftExercise[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const [submitting, setSubmitting] = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      .filter((exercise) => {
        if (search) return true; // Search across all categories when typing
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

  const filteredTemplates = useMemo(() => {
    const search = templateSearch.trim().toLowerCase();
    return templates
      .filter((tpl) => !activeCategory?.name || tpl.category === activeCategory.name || tpl.categoryName === activeCategory.name)
      .filter((tpl) => {
        if (!search) return true;
        return [tpl.name, tpl.title, tpl.description, tpl.category]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(search);
      })
      .slice(0, 6);
  }, [templates, templateSearch, activeCategory?.name]);

  const handleTemplateSelect = (tpl: WorkoutTemplate) => {
    setSelectedTemplateId(tpl.id);
    setWorkoutType(tpl.category || tpl.categoryName || workoutType);
    setTemplateName(tpl.name || tpl.title || '');
    setNote(`Loaded saved workout template: ${tpl.name || tpl.title}`);
    setSuccess(`Loaded template '${tpl.name || tpl.title}'.`);
    setError(null);

    const draftExercises: DraftExercise[] = (tpl.exercises || []).map((exercise) => ({
      localId: makeId(),
      exerciseName: exercise.exerciseName || 'Template Exercise',
      categoryId: exercise.categoryId || tpl.categoryId,
      categoryName: exercise.categoryName || tpl.categoryName || tpl.category,
      duration: Number(exercise.duration || 10),
      sets: (exercise.sets && exercise.sets.length > 0 ? exercise.sets : [{ reps: 10, weight: 0 }]).map((set) => ({
        reps: Number(set.reps || 0),
        weight: Number(set.weight || 0)
      }))
    }));

    if (draftExercises.length > 0) {
      setSelectedExercises(draftExercises);
    }
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
    if (updates.exerciseName !== undefined) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[`name_${localId}`];
        return copy;
      });
    }
    if (updates.duration !== undefined) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[`duration_${localId}`];
        return copy;
      });
    }
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
    if (updates.reps !== undefined) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[`reps_${exerciseId}_${setIndex}`];
        return copy;
      });
    }
    if (updates.weight !== undefined) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[`weight_${exerciseId}_${setIndex}`];
        return copy;
      });
    }
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
    setValidationErrors((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((key) => {
        if (key.startsWith(`reps_${exerciseId}_`) || key.startsWith(`weight_${exerciseId}_`)) {
          delete copy[key];
        }
      });
      return copy;
    });
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises((current) => current.filter((exercise) => exercise.localId !== exerciseId));
    setValidationErrors((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((key) => {
        if (key.includes(exerciseId)) delete copy[key];
      });
      return copy;
    });
  };

  const buildWorkoutExercises = (): WorkoutExercise[] => selectedExercises.map((exercise) => ({
    categoryId: exercise.categoryId || activeCategory?.id,
    categoryName: exercise.categoryName || activeCategory?.name || workoutType,
    exerciseName: exercise.exerciseName.trim(),
    duration: Number(exercise.duration || 0),
    sets: exercise.sets.map((set) => ({
      reps: Number(set.reps || 0),
      weight: Number(set.weight || 0)
    }))
  }));

  const handleSaveTemplate = async () => {
    setError(null);
    setSuccess(null);

    const name = templateName.trim();
    if (name.length < 2) {
      setError('Give this custom workout a name before saving it.');
      return;
    }
    if (selectedExercises.length === 0) {
      setError('Add exercises before saving a custom template.');
      return;
    }

    setTemplateSaving(true);
    try {
      const saved = await templateService.create({
        title: name,
        name,
        description: `Custom workout saved from Quick Log with ${selectedExercises.length} exercise(s).`,
        categoryId: activeCategory?.id,
        categoryName: activeCategory?.name || workoutType,
        category: activeCategory?.name || workoutType,
        durationMin: Math.max(durationMinutes, 1),
        durationMinutes: Math.max(durationMinutes, 1),
        exercises: buildWorkoutExercises(),
        isActive: true
      });
      setTemplates((current) => [saved, ...current.filter((tpl) => tpl.id !== saved.id)]);
      setSelectedTemplateId(saved.id);
      setSuccess(`Saved template '${saved.name}' to library.`);
    } catch (err: any) {
      setError(err?.message || 'Could not save workout template.');
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);
    setSuccess(null);

    if (!workoutType) {
      setError('Please choose a workout category.');
      return;
    }

    if (selectedExercises.length === 0) {
      setError('Add at least one exercise to your workout.');
      return;
    }

    const newErrors: { [key: string]: string } = {};
    selectedExercises.forEach((exercise) => {
      if (!exercise.exerciseName.trim()) {
        newErrors[`name_${exercise.localId}`] = 'Exercise name is required';
      }
      if (exercise.duration <= 0) {
        newErrors[`duration_${exercise.localId}`] = 'Duration must be greater than 0';
      }
      if (exercise.sets.length === 0) {
        newErrors[`sets_${exercise.localId}`] = 'At least one set is required';
      }
      exercise.sets.forEach((set, sIdx) => {
        if (set.reps < 1) {
          newErrors[`reps_${exercise.localId}_${sIdx}`] = 'Reps must be >= 1';
        }
        if (set.weight < 0) {
          newErrors[`weight_${exercise.localId}_${sIdx}`] = 'Weight cannot be negative';
        }
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setError('Please resolve the validation errors highlighted below.');
      return;
    }

    setSubmitting(true);
    try {
      const exercises = buildWorkoutExercises();

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
    { label: 'Energetic', value: 'Energetic' },
    { label: 'Accomplished', value: 'Accomplished' },
    { label: 'Satisfied', value: 'Satisfied' },
    { label: 'Tired', value: 'Tired' },
    { label: 'Exhausted', value: 'Exhausted' }
  ];

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl border border-border hover:bg-muted/30 text-muted-foreground transition-colors active:scale-95"
            style={{ background: 'var(--card)' }}
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground">Workout Builder</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Customize your exercises, sets, and logs for your training journal.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 border border-red-500/20 bg-red-500/10 text-red-400 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: exercises search & category selector */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Exercise Library</p>
                  <h2 className="text-sm font-black text-foreground">Add Exercise</h2>
                </div>
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>

              {loadingOptions ? (
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
                        onClick={() => { setWorkoutType(cat.name); setSelectedTemplateId(null); }}
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
                      onChange={(e) => setExerciseSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (filteredLibrary.length > 0) {
                            addExerciseFromLibrary(filteredLibrary[0]);
                            setExerciseSearch('');
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
                            addExerciseFromLibrary(exercise);
                            setExerciseSearch('');
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
                    onClick={addBlankExercise}
                    className="w-full py-2.5 text-xs font-bold rounded-xl border border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                  >
                    + Add Custom Exercise
                  </button>
                </>
              )}
            </div>

            {/* Workout template loader */}
            {templates.length > 0 && (
              <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Templates</p>
                    <h3 className="text-sm font-black text-foreground">Load Template</h3>
                  </div>
                  <Save className="h-4 w-4 text-primary" />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-input-background focus:border-primary outline-none"
                  />
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {filteredTemplates.map((tpl) => (
                    <button
                      type="button"
                      key={tpl.id}
                      onClick={() => handleTemplateSelect(tpl)}
                      className={`w-full text-left p-3 rounded-xl border transition-all active:scale-[0.99] ${
                        selectedTemplateId === tpl.id
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border hover:border-primary/20 hover:bg-white/[0.01] text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-foreground">{tpl.name || tpl.title}</p>
                        {tpl.createdBy && (
                          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                            Mine
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5 uppercase font-semibold">
                        {tpl.category} • {tpl.durationMinutes || tpl.durationMin || 0}m • {tpl.exercises?.length || 0} moves
                      </p>
                    </button>
                  ))}
                  {filteredTemplates.length === 0 && (
                    <p className="text-xs text-muted-foreground bg-muted/10 rounded-xl p-3 text-center italic">No templates match search.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Middle panel: set-by-set tracker */}
          <div className="lg:col-span-5 p-5 rounded-2xl border border-border bg-card space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider font-mono">Tracker</p>
                <h2 className="text-sm font-black text-foreground">Workout Details</h2>
              </div>
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                {durationMinutes} min
              </span>
            </div>

            {selectedExercises.length === 0 ? (
              <div className="border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground bg-muted/5 space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/20 text-primary border border-border">
                  <ListChecks className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-foreground">Your Workout is Empty</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Search for movements in the library on the left, load a template, or add a custom exercise to begin.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    type="button"
                    onClick={addBlankExercise}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-muted/30 text-foreground hover:bg-muted/50 transition-all active:scale-[0.98] border border-border"
                  >
                    + Custom Exercise
                  </button>
                  {templates.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleTemplateSelect(templates[0])}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-[0.98]"
                    >
                      Quick Start: {templates[0].name || templates[0].title}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {selectedExercises.map((exercise, exerciseIndex) => (
                  <div key={exercise.localId} className="rounded-2xl border border-border bg-muted/10 p-4 space-y-3 transition-all">
                    <div className="flex items-start gap-3">
                      <span className="h-7 w-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {exerciseIndex + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            value={exercise.exerciseName}
                            onChange={(e) => updateExercise(exercise.localId, { exerciseName: e.target.value })}
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
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={exercise.duration}
                              onChange={(e) => updateExercise(exercise.localId, { duration: Number(e.target.value) || 0 })}
                              className={`w-full text-xs p-2 rounded-lg border bg-input-background focus:border-primary outline-none ${
                                validationErrors[`duration_${exercise.localId}`] ? 'border-destructive focus:border-destructive' : 'border-border'
                              }`}
                            />
                            <span className="text-[10px] font-bold text-muted-foreground">min</span>
                          </div>
                          {validationErrors[`duration_${exercise.localId}`] && (
                            <p className="text-[10px] text-destructive mt-1 font-semibold">{validationErrors[`duration_${exercise.localId}`]}</p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExercise(exercise.localId)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

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
                                onClick={() => updateSet(exercise.localId, setIndex, { reps: Math.max(0, set.reps - 1) })}
                                className="px-2 h-full hover:bg-muted/30 text-muted-foreground hover:text-foreground font-extrabold active:scale-95 transition-all text-xs"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={set.reps}
                                onChange={(e) => updateSet(exercise.localId, setIndex, { reps: Math.max(0, Number(e.target.value) || 0) })}
                                className="w-full h-full text-center bg-transparent border-0 outline-none text-xs font-bold font-mono focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                type="button"
                                onClick={() => updateSet(exercise.localId, setIndex, { reps: set.reps + 1 })}
                                className="px-2 h-full hover:bg-muted/30 text-muted-foreground hover:text-foreground font-extrabold active:scale-95 transition-all text-xs"
                              >
                                +
                              </button>
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
                                onClick={() => updateSet(exercise.localId, setIndex, { weight: Math.max(0, set.weight - 2.5) })}
                                className="px-1.5 h-full hover:bg-muted/30 text-muted-foreground hover:text-foreground font-medium active:scale-95 transition-all text-[9px] border-r border-border"
                              >
                                -2.5
                              </button>
                              <button
                                type="button"
                                onClick={() => updateSet(exercise.localId, setIndex, { weight: Math.max(0, set.weight - 1) })}
                                className="px-1.5 h-full hover:bg-muted/30 text-muted-foreground hover:text-foreground font-extrabold active:scale-95 transition-all text-xs"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={set.weight}
                                onChange={(e) => updateSet(exercise.localId, setIndex, { weight: Math.max(0, Number(e.target.value) || 0) })}
                                className="w-full h-full text-center bg-transparent border-0 outline-none text-xs font-bold font-mono focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                type="button"
                                onClick={() => updateSet(exercise.localId, setIndex, { weight: set.weight + 1 })}
                                className="px-1.5 h-full hover:bg-muted/30 text-muted-foreground hover:text-foreground font-extrabold active:scale-95 transition-all text-xs"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => updateSet(exercise.localId, setIndex, { weight: set.weight + 2.5 })}
                                className="px-1.5 h-full hover:bg-muted/30 text-muted-foreground hover:text-foreground font-medium active:scale-95 transition-all text-[9px] border-l border-border"
                              >
                                +2.5
                              </button>
                            </div>
                            {validationErrors[`weight_${exercise.localId}_${setIndex}`] && (
                              <p className="text-[8px] text-destructive text-center font-semibold leading-tight">{validationErrors[`weight_${exercise.localId}_${setIndex}`]}</p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeSet(exercise.localId, setIndex)}
                            disabled={exercise.sets.length <= 1}
                            className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-20 flex justify-center items-center justify-self-center"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      <div className="flex items-center gap-3 mt-1.5 px-1">
                        <button
                          type="button"
                          onClick={() => addSet(exercise.localId)}
                          className="text-[11px] font-bold text-primary hover:underline transition-all"
                        >
                          + Add Set
                        </button>
                        <span className="text-muted-foreground/30 text-[10px]">•</span>
                        <button
                          type="button"
                          onClick={() => {
                            const last = exercise.sets[exercise.sets.length - 1] || { reps: 10, weight: 0 };
                            setSelectedExercises((current) =>
                              current.map((ex) =>
                                ex.localId === exercise.localId ? { ...ex, sets: [...ex.sets, { ...last }] } : ex
                              )
                            );
                          }}
                          className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" /> Duplicate Last Set
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4 border-t border-border pt-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-2">Mood After Workout</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {moodOptions.map((m) => (
                    <button
                      type="button"
                      key={m.value}
                      onClick={() => setMoodAfterWorkout(m.value)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all active:scale-[0.98] ${
                        moodAfterWorkout === m.value
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-muted/10 hover:bg-muted/20 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Optional Notes</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Notes about training performance..."
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-input-background focus:border-primary outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:brightness-110 text-primary-foreground font-bold rounded-xl shadow-xs transition-all disabled:opacity-40 active:scale-[0.99]"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Workout Log
              </button>
            </div>
          </div>

          {/* Right panel: summary preview */}
          <div className="lg:col-span-3 p-5 rounded-2xl border border-border bg-card h-fit space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-extrabold text-sm tracking-tight text-foreground">Summary Preview</h3>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-muted/10 border border-border p-3">
                <p className="text-base font-black text-foreground">{selectedExercises.length}</p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase">Moves</p>
              </div>
              <div className="rounded-xl bg-muted/10 border border-border p-3">
                <p className="text-base font-black text-foreground">{totalSets}</p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase">Sets</p>
              </div>
              <div className="rounded-xl bg-muted/10 border border-border p-3">
                <p className="text-base font-black text-foreground">{durationMinutes}</p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase">Min</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated duration:</span>
                <span className="font-bold text-foreground">{durationMinutes} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Set count:</span>
                <span className="font-bold text-foreground">{totalSets} sets</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-xs font-bold text-primary">
                <span>Estimated XP:</span>
                <span>+{calculateXpPreview()} XP</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/5 p-3 space-y-2">
              <label className="block text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                Save as custom template
              </label>
              <input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name..."
                className="w-full rounded-xl border border-border bg-input-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleSaveTemplate}
                disabled={templateSaving || selectedExercises.length === 0}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-foreground text-background py-2 text-xs font-black hover:brightness-90 transition-all disabled:opacity-40 active:scale-[0.99]"
              >
                {templateSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Template
              </button>
            </div>

            <div className="p-3 bg-muted/10 rounded-xl">
              <p className="text-[9px] text-muted-foreground leading-normal flex items-start gap-1">
                <Trophy className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                <span>Saved workouts use the server-calculated XP system.</span>
              </p>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};
