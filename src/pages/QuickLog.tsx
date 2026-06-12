import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutService, templateService, categoryService, WorkoutTemplate, ExerciseCategory } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Dumbbell, Clock, Smile, FileText, Zap, Loader2, ArrowLeft, Trophy } from 'lucide-react';

export const QuickLog: React.FC = () => {
  const navigate = useNavigate();

  // Loaded Options
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form Fields
  const [workoutType, setWorkoutType] = useState('Strength');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [moodAfterWorkout, setMoodAfterWorkout] = useState('Satisfied');
  const [note, setNote] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFormOptions() {
      try {
        const [cats, tpls] = await Promise.all([
          categoryService.getAll(),
          templateService.getAll()
        ]);
        setCategories(cats);
        setTemplates(tpls);
        
        // Match default type
        if (cats.length > 0) {
          setWorkoutType(cats[0].name);
        }
      } catch (err) {
        console.error("Failed to load select options", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadFormOptions();
  }, []);

  const handleTemplateSelect = (tpl: WorkoutTemplate) => {
    setSelectedTemplateId(tpl.id);
    setWorkoutType(tpl.category);
    setDurationMinutes(tpl.durationMinutes);
    setNote(`Done Preset: ${tpl.name}`);
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!workoutType || !durationMinutes) {
      setError('Please choose a valid category and workout duration.');
      setSubmitting(false);
      return;
    }

    try {
      await workoutService.quickLog({
        workoutType,
        durationMinutes,
        moodAfterWorkout,
        note,
        templateId: selectedTemplateId
      });
      // Redirect to student timeline
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || "Operation failed. Please review values.");
    } finally {
      setSubmitting(false);
    }
  };

  // Real-time XP preview calculation
  const calculateXpPreview = () => {
    let xp = 50; // base logging
    if (durationMinutes > 30) xp += 20; // duration bonus
    if (moodAfterWorkout || note.trim()) xp += 10; // logging detail bonus
    return xp;
  };

  const moodOptions = [
    { label: '⚡ Energetic', value: 'Energetic' },
    { label: '🏆 Accomplished', value: 'Accomplished' },
    { label: '😌 Satisfied', value: 'Satisfied' },
    { label: '😴 Tired', value: 'Tired' },
    { label: '🥵 Exhausted', value: 'Exhausted' }
  ];

  const durationPresets = [10, 15, 20, 30, 45, 60];

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Back header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-white rounded-xl border border-gray-150 hover:bg-gray-50 text-gray-700 shadow-2xs transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-950">Under-60-Seconds Quick Log</h1>
            <p className="text-xs text-gray-500 mt-0.5">Choose your duration and show up today.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Log form Col 1 & 2 */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
            
            {/* Quick Templates Selector */}
            {templates.length > 0 && (
              <div className="space-y-2">
                <span className="block text-xs font-bold uppercase text-gray-500 tracking-wider">Quick Preset Templates</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {templates.map(tpl => (
                    <button
                      type="button"
                      key={tpl.id}
                      onClick={() => handleTemplateSelect(tpl)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex justify-between items-center ${
                        selectedTemplateId === tpl.id
                          ? 'border-teal-500 bg-teal-50/50 text-teal-950 shadow-2xs'
                          : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-none">{tpl.name}</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-semibold">{tpl.category}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-teal-700 bg-teal-100/55 px-2 py-0.5 rounded-full">{tpl.durationMinutes}m</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleQuickSubmit} className="space-y-5">
              
              {/* Category selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Workout Category</label>
                {loadingOptions ? (
                  <div className="animate-pulse h-10 bg-gray-50 rounded-xl" />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {categories.map(cat => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => { setWorkoutType(cat.name); setSelectedTemplateId(null); }}
                        className={`py-3 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                          workoutType === cat.name
                            ? 'bg-teal-600 text-white border-teal-650 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Duration Slider and Presets */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Duration (Minutes)</label>
                
                {/* slider */}
                <div className="flex items-center gap-4 mb-3">
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => { setDurationMinutes(parseInt(e.target.value)); setSelectedTemplateId(null); }}
                    className="flex-1 accent-teal-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-mono font-extrabold text-teal-800 text-lg w-16 text-right shrink-0">{durationMinutes} Min</span>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {durationPresets.map(preset => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => { setDurationMinutes(preset); setSelectedTemplateId(null); }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        durationMinutes === preset
                          ? 'border-teal-500 bg-teal-50 text-teal-900 font-extrabold'
                          : 'border-gray-100 bg-white hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {preset} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood picker */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Mood After Workout</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {moodOptions.map(m => (
                    <button
                      type="button"
                      key={m.value}
                      onClick={() => setMoodAfterWorkout(m.value)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
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

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Optional workout notes</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="E.g. Squat sets completed, pushed hard on cardio, cleared my mind."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 shadow-xs focus:ring-1 focus:ring-teal-500 bg-gray-50/40"
                />
              </div>

              {/* Action Submit */}
              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:bg-gray-400"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Instant Log Session
                </button>
              </div>

            </form>

          </div>

          {/* Gamified Reward preview on right Col 3 */}
          <div className="bg-gray-900 text-white p-6 rounded-2xl border border-gray-800 shadow-md h-fit space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <Zap className="h-5 w-5 text-purple-400 fill-purple-400" />
              <h3 className="font-extrabold text-sm tracking-tight">XP Reward Preview</h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Base Workout Log:</span>
                <span className="font-bold text-gray-200">+50 XP</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Duration Bonus (&gt;30m):</span>
                <span className="font-bold text-gray-200">
                  {durationMinutes > 30 ? '+20 XP' : '0 XP'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Detail Bonus (Note/Mood):</span>
                <span className="font-bold text-gray-200">
                  {note.trim() || moodAfterWorkout ? '+10 XP' : '0 XP'}
                </span>
              </div>

              <div className="border-t border-gray-800 pt-3 flex justify-between text-sm font-extrabold text-teal-400">
                <span>ESTIMATED XP:</span>
                <span>+{calculateXpPreview()} XP</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl rounded-b-lg">
              <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                💡 FitSync rewards consistency and habit building. Log daily to level up and secure awesome milestone badges.
              </p>
            </div>
          </div>

        </div>

      </div>
    </PageContainer>
  );
};
