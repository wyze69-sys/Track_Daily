import React, { useState, useEffect } from 'react';
import { workoutService, Workout } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { History as HistoryIcon, Clock, Edit2, Trash2, Check, X, Loader2, Calendar } from 'lucide-react';

export const History: React.FC = () => {
  const [logs, setLogs] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedType, setEditedType] = useState('');
  const [editedDuration, setEditedDuration] = useState(30);
  const [editedMood, setEditedMood] = useState('Satisfied');
  const [editedNote, setEditedNote] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      const list = await workoutService.getAll();
      setLogs(list);
    } catch (err) {
      console.error("Failed to load workout history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleStartEdit = (w: Workout) => {
    setEditingId(w.id);
    setEditedType(w.workoutType);
    setEditedDuration(w.durationMinutes);
    setEditedMood(w.moodAfterWorkout);
    setEditedNote(w.note);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    setSavingId(id);
    setError(null);
    try {
      await workoutService.update(id, {
        workoutType: editedType,
        durationMinutes: editedDuration,
        moodAfterWorkout: editedMood,
        note: editedNote
      });
      setEditingId(null);
      await loadLogs();
    } catch (err: any) {
      setError(err?.message || "Failed to update workout log.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this workout log? This action is irreversible.")) {
      return;
    }
    setError(null);
    try {
      await workoutService.delete(id);
      await loadLogs();
    } catch (err: any) {
      setError(err?.message || "Failed to delete workout log.");
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case 'energetic': return '⚡';
      case 'accomplished': return '🏆';
      case 'satisfied': return '😌';
      case 'tired': return '😴';
      case 'exhausted': return '🥵';
      default: return '💪';
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-950 flex items-center gap-2">
              <HistoryIcon className="h-5 w-5 text-teal-600" />
              Workout Journal Logs
            </h1>
            <p className="text-xs text-gray-500 mt-1">Review, correct, and manage your historic physical entries.</p>
          </div>
          <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            Total Logs: {logs.length}
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-16 text-center text-gray-400">
            <HistoryIcon className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <h3 className="text-base font-bold text-gray-800">Your Logbook is Empty</h3>
            <p className="text-xs mt-1 leading-normal max-w-sm mx-auto">Track your first push, walk, session, or stretch in 60 seconds starting today.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((w) => {
              const isEditing = editingId === w.id;
              return (
                <div key={w.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:border-gray-200 transition-colors">
                  {isEditing ? (
                    // EDIT PANEL (INLINE INPUTS)
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Workout Type</label>
                          <input
                            type="text"
                            value={editedType}
                            onChange={(e) => setEditedType(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-gray-50/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Duration (Min)</label>
                          <input
                            type="number"
                            value={editedDuration}
                            onChange={(e) => setEditedDuration(parseInt(e.target.value) || 0)}
                            className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-gray-50/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Mood after workout</label>
                          <select
                            value={editedMood}
                            onChange={(e) => setEditedMood(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-gray-50/50"
                          >
                            <option value="Energetic">Energetic</option>
                            <option value="Accomplished">Accomplished</option>
                            <option value="Satisfied">Satisfied</option>
                            <option value="Tired">Tired</option>
                            <option value="Exhausted">Exhausted</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Personal note</label>
                        <input
                          type="text"
                          value={editedNote}
                          onChange={(e) => setEditedNote(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-gray-50/50"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg font-semibold flex items-center gap-1"
                        >
                          <X className="h-3.5 w-3.5" /> Cancel
                        </button>
                        <button
                          type="button"
                          disabled={savingId === w.id}
                          onClick={() => handleSaveEdit(w.id)}
                          className="px-3.5 py-1.5 bg-teal-600 font-bold text-xs text-white hover:bg-teal-700 rounded-lg flex items-center gap-1"
                        >
                          {savingId === w.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    // STATIC TIMELINE LOG
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-2xl border border-teal-100 shadow-2xs">
                          {getMoodEmoji(w.moodAfterWorkout)}
                        </span>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-extrabold text-gray-900">{w.workoutType} Session</h4>
                            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                              +{w.xpEarned} XP Awarded
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-gray-700">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              {w.durationMinutes} min
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium font-mono text-gray-400">
                              <Calendar className="h-3.5 w-3.5 text-gray-400" />
                              {new Date(w.createdAt).toLocaleString(undefined, { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>

                          {w.note && (
                            <p className="text-xs text-gray-650 bg-gray-50 px-3 py-2 rounded-xl mt-2 font-medium border-l-2 border-teal-500">
                              {w.note}
                            </p>
                          )}

                          {w.exercises && w.exercises.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {w.exercises.slice(0, 3).map((exercise, index) => (
                                <div key={`${w.id}_${exercise.id || index}`} className="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-extrabold text-gray-800">{exercise.exerciseName}</span>
                                    <span className="text-[10px] font-mono font-bold text-gray-500">{exercise.duration}m</span>
                                  </div>
                                  {exercise.sets && exercise.sets.length > 0 && (
                                    <p className="mt-1 text-[10px] text-gray-500 font-semibold">
                                      {exercise.sets.map((set, setIndex) => `S${setIndex + 1}: ${set.reps} reps${set.weight ? ` @ ${set.weight}kg` : ''}`).join(' • ')}
                                    </p>
                                  )}
                                </div>
                              ))}
                              {w.exercises.length > 3 && (
                                <p className="text-[10px] font-bold text-gray-400">+{w.exercises.length - 3} more exercises</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Management Edit/Delete actions */}
                      <div className="flex sm:flex-col justify-end gap-2 border-t sm:border-t-0 border-gray-50 pt-3 sm:pt-0 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(w)}
                          className="flex-1 sm:w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50/50 hover:bg-teal-100 border border-teal-100/50 rounded-xl transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Correct Log
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(w.id)}
                          className="flex-1 sm:w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50/40 hover:bg-red-50 border border-red-100 rounded-xl transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Discard Log
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PageContainer>
  );
};
