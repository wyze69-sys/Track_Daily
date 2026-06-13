import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  workoutService,
  templateService,
  WorkoutTemplate,
  ExerciseLibraryItem,
  WorkoutExercise
} from '../../services/api';
import { PageContainer } from '../../components/layout/PageContainer';
import { ArrowLeft, ListChecks, Loader2 } from 'lucide-react';
import { DraftExercise, DraftSet } from './types';
import { useQuickLogData } from './hooks/useQuickLogData';
import { ActivitySearchPanel } from './components/ActivitySearchPanel';
import { TemplatePicker } from './components/TemplatePicker';
import { SelectedExerciseCard } from './components/SelectedExerciseCard';
import { WorkoutSummaryPanel } from './components/WorkoutSummaryPanel';
import { getTrackingType } from './components/TrackingFields';

const makeId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const moodOptions = [
  { label: 'Energetic', value: 'Energetic' },
  { label: 'Accomplished', value: 'Accomplished' },
  { label: 'Satisfied', value: 'Satisfied' },
  { label: 'Tired', value: 'Tired' },
  { label: 'Exhausted', value: 'Exhausted' }
];

export const QuickLog: React.FC = () => {
  const navigate = useNavigate();
  const { categories, templates, library, loading: loadingOptions, error: loadError } = useQuickLogData();

  const [workoutType, setWorkoutType] = useState('Strength');
  const [moodAfterWorkout, setMoodAfterWorkout] = useState('Satisfied');
  const [note, setNote] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<DraftExercise[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [error, setError] = useState<string | null>(loadError);
  const [success, setSuccess] = useState<string | null>(null);

  const activeCategory = categories.find((cat) => cat.name === workoutType);

  const durationMinutes = useMemo(
    () => selectedExercises.reduce((sum, ex) => sum + Number(ex.duration || 0), 0),
    [selectedExercises]
  );
  const totalSets = useMemo(
    () => selectedExercises.reduce((sum, ex) => {
      const trackingType = ex.trackingType || getTrackingType(ex);
      return trackingType === 'sets_reps_weight' ? sum + ex.sets.length : sum;
    }, 0),
    [selectedExercises]
  );

  const calculateXpPreview = () => {
    let xp = Math.max(30, Math.round(durationMinutes * 1.8));
    if (totalSets >= 6) xp += 15;
    if (note.trim()) xp += 8;
    return xp;
  };

  // ── Exercise mutations ──────────────────────────────────────────

  const handleWorkoutTypeChange = (type: string) => {
    setWorkoutType(type);
    setSelectedTemplateId(null);
  };

  const addExerciseFromLibrary = (exercise: any) => {
    setSelectedTemplateId(null);
    setWorkoutType(exercise.categoryName || workoutType);
    const trackingType = exercise.trackingType || 'sets_reps_weight';
    setSelectedExercises((cur) => [
      ...cur,
      {
        localId: makeId(),
        libraryId: exercise.id,
        exerciseName: exercise.name,
        categoryId: exercise.categoryId || undefined,
        categoryName: exercise.categoryName || undefined,
        muscleGroup: exercise.muscleGroup || (exercise.tags && exercise.tags[0]) || 'General',
        duration: exercise.defaultDuration || 10,
        trackingType,
        sets:
          trackingType === 'sets_reps_weight'
            ? [
                { reps: 10, weight: 0 },
                { reps: 10, weight: 0 },
                { reps: 10, weight: 0 }
              ]
            : [{ reps: 1, weight: 0 }]
      }
    ]);
  };

  const addBlankExercise = () => {
    const category = activeCategory || categories[0];
    const categoryName = category?.name || workoutType;
    let trackingType = 'sets_reps_weight';
    if (categoryName === 'Cardio') {
      trackingType = 'duration_distance';
    } else if (categoryName === 'Flexibility & Yoga' || categoryName === 'Flexibility / Mobility') {
      trackingType = 'duration_focus';
    } else if (categoryName === 'Sports') {
      trackingType = 'duration_intensity';
    }

    setSelectedTemplateId(null);
    setSelectedExercises((cur) => [
      ...cur,
      {
        localId: makeId(),
        exerciseName: 'Custom Exercise',
        categoryId: category?.id,
        categoryName: categoryName,
        muscleGroup: 'Custom',
        duration: 10,
        trackingType,
        sets: trackingType === 'sets_reps_weight'
          ? [
              { reps: 10, weight: 0 },
              { reps: 10, weight: 0 },
              { reps: 10, weight: 0 }
            ]
          : [{ reps: 1, weight: 0 }]
      }
    ]);
  };

  const updateExercise = (localId: string, updates: Partial<DraftExercise>) => {
    setSelectedExercises((cur) =>
      cur.map((ex) => (ex.localId === localId ? { ...ex, ...updates } : ex))
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
    setSelectedExercises((cur) =>
      cur.map((ex) => {
        if (ex.localId !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set, i) => (i === setIndex ? { ...set, ...updates } : set))
        };
      })
    );
    setValidationErrors((prev) => {
      const copy = { ...prev };
      if (updates.reps !== undefined) delete copy[`reps_${exerciseId}_${setIndex}`];
      if (updates.weight !== undefined) delete copy[`weight_${exerciseId}_${setIndex}`];
      return copy;
    });
  };

  const addSet = (exerciseId: string) => {
    setSelectedExercises((cur) =>
      cur.map((ex) => {
        if (ex.localId !== exerciseId) return ex;
        const last = ex.sets[ex.sets.length - 1] || { reps: 10, weight: 0 };
        return { ...ex, sets: [...ex.sets, { ...last }] };
      })
    );
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setSelectedExercises((cur) =>
      cur.map((ex) => {
        if (ex.localId !== exerciseId) return ex;
        return { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) };
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
    setSelectedExercises((cur) => cur.filter((ex) => ex.localId !== exerciseId));
    setValidationErrors((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((key) => {
        if (key.includes(exerciseId)) delete copy[key];
      });
      return copy;
    });
  };

  const duplicateLastSet = (exerciseId: string) => {
    setSelectedExercises((cur) =>
      cur.map((ex) => {
        if (ex.localId !== exerciseId) return ex;
        const last = ex.sets[ex.sets.length - 1] || { reps: 10, weight: 0 };
        return { ...ex, sets: [...ex.sets, { ...last }] };
      })
    );
  };

  // ── Template ────────────────────────────────────────────────────

  const handleTemplateSelect = (tpl: WorkoutTemplate) => {
    setSelectedTemplateId(tpl.id);
    setWorkoutType(tpl.category || tpl.categoryName || workoutType);
    setTemplateName(tpl.name || tpl.title || '');
    setNote(`Loaded saved workout template: ${tpl.name || tpl.title}`);
    setSuccess(`Loaded template '${tpl.name || tpl.title}'.`);
    setError(null);

    const draftExercises: DraftExercise[] = (tpl.exercises || []).map((ex) => {
      const trackingType = ex.trackingType || getTrackingType(ex);
      return {
        localId: makeId(),
        exerciseName: ex.exerciseName || 'Template Exercise',
        categoryId: ex.categoryId || (tpl as any).categoryId,
        categoryName: ex.categoryName || tpl.categoryName || tpl.category,
        duration: Number(ex.duration || 10),
        trackingType,
        sets: (ex.sets && ex.sets.length > 0 ? ex.sets : [{ reps: 10, weight: 0 }]).map((s) => ({
          reps: Number(s.reps || 0),
          weight: Number(s.weight || 0)
        })),
        distance: ex.distance,
        pace: ex.pace,
        calories: ex.calories,
        focusArea: ex.focusArea,
        difficulty: ex.difficulty,
        intensity: ex.intensity,
        notes: ex.notes,
        restTime: ex.restTime
      };
    });

    if (draftExercises.length > 0) setSelectedExercises(draftExercises);
  };

  // ── Build payload ───────────────────────────────────────────────

  const buildWorkoutExercises = (): WorkoutExercise[] =>
    selectedExercises.map((ex) => {
      const trackingType = ex.trackingType || getTrackingType(ex);
      return {
        categoryId: ex.categoryId || activeCategory?.id,
        categoryName: ex.categoryName || activeCategory?.name || workoutType,
        exerciseName: ex.exerciseName.trim(),
        duration: Number(ex.duration || 0),
        trackingType,
        sets: trackingType === 'sets_reps_weight'
          ? ex.sets.map((s) => ({
              reps: Number(s.reps || 0),
              weight: Number(s.weight || 0)
            }))
          : [],
        distance: trackingType === 'duration_distance' ? (ex.distance !== undefined ? Number(ex.distance) : undefined) : undefined,
        pace: trackingType === 'duration_distance' ? ex.pace : undefined,
        calories: trackingType === 'duration_distance' ? (ex.calories !== undefined ? Number(ex.calories) : undefined) : undefined,
        focusArea: trackingType === 'duration_focus' ? ex.focusArea : undefined,
        difficulty: trackingType === 'duration_focus' ? ex.difficulty : undefined,
        intensity: trackingType === 'duration_intensity' ? ex.intensity : undefined,
        notes: (trackingType === 'duration_focus' || trackingType === 'duration_intensity') ? ex.notes : undefined,
        restTime: trackingType === 'sets_reps_weight' ? (ex.restTime !== undefined ? Number(ex.restTime) : undefined) : undefined,
      };
    });

  // ── Save template ───────────────────────────────────────────────

  const handleSaveTemplate = async () => {
    setError(null);
    setSuccess(null);
    const name = templateName.trim();
    if (name.length < 2) { setError('Give this custom workout a name before saving it.'); return; }
    if (selectedExercises.length === 0) { setError('Add exercises before saving a custom template.'); return; }

    setTemplateSaving(true);
    try {
      await templateService.create({
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
      setSuccess(`Saved template '${name}' to library.`);
    } catch (err: any) {
      setError(err?.message || 'Could not save workout template.');
    } finally {
      setTemplateSaving(false);
    }
  };

  // ── Submit workout ──────────────────────────────────────────────

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);
    setSuccess(null);

    if (!workoutType) { setError('Please choose a workout category.'); return; }
    if (selectedExercises.length === 0) { setError('Add at least one exercise to your workout.'); return; }

    const newErrors: { [key: string]: string } = {};
    selectedExercises.forEach((ex) => {
      if (!ex.exerciseName.trim()) newErrors[`name_${ex.localId}`] = 'Exercise name is required';
      if (ex.duration <= 0) newErrors[`duration_${ex.localId}`] = 'Duration must be greater than 0';

      const trackingType = ex.trackingType || getTrackingType(ex);
      if (trackingType === 'sets_reps_weight') {
        if (ex.sets.length === 0) newErrors[`sets_${ex.localId}`] = 'At least one set is required';
        ex.sets.forEach((s, sIdx) => {
          if (s.reps < 1) newErrors[`reps_${ex.localId}_${sIdx}`] = 'Reps must be >= 1';
          if (s.weight < 0) newErrors[`weight_${ex.localId}_${sIdx}`] = 'Weight cannot be negative';
        });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setError('Please resolve the validation errors highlighted below.');
      return;
    }

    setSubmitting(true);
    try {
      await workoutService.quickLog({
        workoutType,
        durationMinutes: Math.max(durationMinutes, 1),
        moodAfterWorkout,
        note,
        templateId: selectedTemplateId,
        exercises: buildWorkoutExercises()
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Operation failed. Please review values.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page title */}
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

        {/* Alerts */}
        {error && (
          <div className="p-4 border border-red-500/20 bg-red-500/10 text-red-400 rounded-xl text-xs font-semibold">{error}</div>
        )}
        {success && (
          <div className="p-4 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-semibold">{success}</div>
        )}

        <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel */}
          <div className="lg:col-span-4 space-y-5">
            <ActivitySearchPanel
              categories={categories}
              workoutType={workoutType}
              onWorkoutTypeChange={handleWorkoutTypeChange}
              onAddExercise={addExerciseFromLibrary}
            />
            <TemplatePicker
              templates={templates}
              activeCategory={activeCategory}
              templateSearch={templateSearch}
              selectedTemplateId={selectedTemplateId}
              onSearchChange={setTemplateSearch}
              onSelectTemplate={handleTemplateSelect}
            />
          </div>

          {/* Middle panel – set tracker */}
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
                  <SelectedExerciseCard
                    key={exercise.localId}
                    exercise={exercise}
                    exerciseIndex={exerciseIndex}
                    validationErrors={validationErrors}
                    onUpdateExercise={updateExercise}
                    onUpdateSet={updateSet}
                    onAddSet={addSet}
                    onRemoveSet={removeSet}
                    onRemoveExercise={removeExercise}
                    onDuplicateLastSet={duplicateLastSet}
                  />
                ))}
              </div>
            )}

            {/* Mood + Notes + Submit */}
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

          {/* Right panel – summary */}
          <WorkoutSummaryPanel
            exerciseCount={selectedExercises.length}
            totalSets={totalSets}
            durationMinutes={durationMinutes}
            xpPreview={calculateXpPreview()}
            templateName={templateName}
            templateSaving={templateSaving}
            hasExercises={selectedExercises.length > 0}
            onTemplateNameChange={setTemplateName}
            onSaveTemplate={handleSaveTemplate}
          />
        </form>
      </div>
    </PageContainer>
  );
};
