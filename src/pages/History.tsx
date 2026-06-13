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

  const getMoodStyle = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case 'energetic': return { bg: 'rgba(56,189,248,0.1)', color: '#38bdf8' };
      case 'accomplished': return { bg: 'rgba(163,230,53,0.1)', color: '#a3e635' };
      case 'satisfied': return { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24' };
      case 'tired': return { bg: 'rgba(136,136,160,0.1)', color: '#8888a0' };
      case 'exhausted': return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' };
      default: return { bg: 'rgba(255,255,255,0.05)', color: 'var(--foreground)' };
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'strength':
        return {
          bg: 'rgba(163, 230, 53, 0.1)',
          color: '#a3e635',
          border: 'rgba(163, 230, 53, 0.2)'
        };
      case 'cardio':
        return {
          bg: 'rgba(56, 189, 248, 0.1)',
          color: '#38bdf8',
          border: 'rgba(56, 189, 248, 0.2)'
        };
      case 'flexibility & yoga':
      case 'yoga':
        return {
          bg: 'rgba(167, 139, 250, 0.1)',
          color: '#a78bfa',
          border: 'rgba(167, 139, 250, 0.2)'
        };
      case 'sports':
        return {
          bg: 'rgba(249, 115, 22, 0.1)',
          color: '#f97316',
          border: 'rgba(249, 115, 22, 0.2)'
        };
      default:
        return {
          bg: 'rgba(251, 113, 133, 0.1)',
          color: '#fb7185',
          border: 'rgba(251, 113, 133, 0.2)'
        };
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div 
          className="flex justify-between items-center p-5 rounded-2xl border border-border"
          style={{ background: 'var(--card)' }}
        >
          <div>
            <h1 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              <HistoryIcon className="h-5 w-5 text-primary" />
              Workout Journal
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Review and manage your history of workouts.</p>
          </div>
          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Total Logs: {logs.length}
          </span>
        </div>

        {error && (
          <div className="p-4 border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl p-16 text-center text-muted-foreground">
            <HistoryIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Your Journal is Empty</h3>
            <p className="text-xs mt-1 leading-normal max-w-sm mx-auto">Track your workouts using the Workout Builder to build your training history.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((w) => {
              const isEditing = editingId === w.id;
              const moodStyle = getMoodStyle(w.moodAfterWorkout);
              return (
                <div 
                  key={w.id} 
                  className="p-5 rounded-2xl border border-border transition-colors bg-card"
                >
                  {isEditing ? (
                    // EDIT PANEL (INLINE INPUTS)
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Workout Type</label>
                          <input
                            type="text"
                            value={editedType}
                            onChange={(e) => setEditedType(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Duration (Min)</label>
                          <input
                            type="number"
                            value={editedDuration}
                            onChange={(e) => setEditedDuration(parseInt(e.target.value) || 0)}
                            className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Mood After Workout</label>
                          <select
                            value={editedMood}
                            onChange={(e) => setEditedMood(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground"
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
                        <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">Notes</label>
                        <input
                          type="text"
                          value={editedNote}
                          onChange={(e) => setEditedNote(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-border bg-input-background focus:border-primary outline-none text-foreground"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-border">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted/10 rounded-lg font-bold flex items-center gap-1 border border-border"
                        >
                          <X className="h-3.5 w-3.5" /> Cancel
                        </button>
                        <button
                          type="button"
                          disabled={savingId === w.id}
                          onClick={() => handleSaveEdit(w.id)}
                          className="px-3.5 py-1.5 bg-primary font-bold text-xs text-primary-foreground hover:brightness-110 rounded-lg flex items-center gap-1"
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
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Left Column: Date & Mood */}
                      <div className="md:col-span-3 flex md:flex-col items-center md:items-start justify-between md:justify-start gap-3 md:border-r border-border md:pr-4">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase font-mono">
                            {new Date(w.createdAt).toLocaleString(undefined, { weekday: 'short' })}
                          </p>
                          <h3 className="text-xl font-black text-foreground tracking-tight leading-none">
                            {new Date(w.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric' })}
                          </h3>
                          <p className="text-[10px] font-semibold text-muted-foreground font-mono">
                            {new Date(w.createdAt).getFullYear()} • {new Date(w.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-1">
                          <span 
                            className="flex h-7 px-2.5 items-center justify-center rounded-xl text-[9px] font-black uppercase tracking-wider border shadow-2xs leading-none"
                            style={{ background: moodStyle.bg, color: moodStyle.color, borderColor: moodStyle.color + '33' }}
                          >
                            {w.moodAfterWorkout || 'Satisfied'}
                          </span>
                        </div>
                      </div>

                      {/* Right Column: Workout Details */}
                      <div className="md:col-span-9 flex flex-col justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {(() => {
                              const catColor = getCategoryColor(w.workoutType);
                              return (
                                <span
                                  className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border leading-none font-mono"
                                  style={{ background: catColor.bg, color: catColor.color, borderColor: catColor.border }}
                                >
                                  {w.workoutType}
                                </span>
                              );
                            })()}
                            <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                              +{w.xpEarned} XP
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-foreground ml-auto">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              {w.durationMinutes} min
                            </span>
                          </div>

                          {w.note && (
                            <p className="text-xs text-muted-foreground bg-muted/10 px-3 py-2 rounded-xl border-l-2 border-primary">
                              {w.note}
                            </p>
                          )}

                          {w.exercises && w.exercises.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                              <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider font-mono">Exercises ({w.exercises.length})</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {w.exercises.map((exercise, index) => (
                                  <div key={`${w.id}_${exercise.id || index}`} className="rounded-xl border border-border bg-muted/5 px-3 py-2 flex flex-col justify-between">
                                    <div className="flex items-center justify-between gap-2 border-b border-border/20 pb-1 mb-1">
                                      <span className="text-xs font-bold text-foreground truncate">{exercise.exerciseName}</span>
                                      <span className="text-[9px] font-mono font-bold text-muted-foreground">{exercise.duration}m</span>
                                    </div>
                                    {exercise.sets && exercise.sets.length > 0 ? (
                                      <div className="flex flex-wrap gap-1 mt-0.5">
                                        {exercise.sets.map((set, setIndex) => (
                                          <span key={setIndex} className="text-[8px] font-mono font-medium bg-muted px-1.5 py-0.2 rounded border border-border">
                                            S{setIndex + 1}: {set.reps}r {set.weight ? `@ ${set.weight}kg` : ''}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-[8px] text-muted-foreground italic">No sets recorded</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(() => {
                            let totalSets = 0;
                            let totalReps = 0;
                            let totalVolume = 0;
                            let hasWeightSets = false;

                            if (w.exercises) {
                              w.exercises.forEach((ex) => {
                                if (ex.sets) {
                                  totalSets += ex.sets.length;
                                  ex.sets.forEach((set: any) => {
                                    totalReps += set.reps || 0;
                                    if (set.weight && set.weight > 0) {
                                      totalVolume += (set.reps || 0) * (set.weight || 0);
                                      hasWeightSets = true;
                                    }
                                  });
                                }
                              });
                            }

                            if (totalSets === 0) return null;

                            return (
                              <div className="grid grid-cols-3 gap-2 border-t border-border/40 pt-2.5 mt-2.5">
                                <div className="text-center bg-muted/20 rounded-xl p-1.5 border border-border/20">
                                  <span className="block text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Total Sets</span>
                                  <span className="text-xs font-black text-foreground font-mono">{totalSets}</span>
                                </div>
                                <div className="text-center bg-muted/20 rounded-xl p-1.5 border border-border/20">
                                  <span className="block text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Total Reps</span>
                                  <span className="text-xs font-black text-foreground font-mono">{totalReps}</span>
                                </div>
                                <div className="text-center bg-muted/20 rounded-xl p-1.5 border border-border/20">
                                  <span className="block text-[8px] text-muted-foreground uppercase font-bold tracking-wider">
                                    {hasWeightSets ? 'Total Volume' : 'Movements'}
                                  </span>
                                  <span className="text-xs font-black text-primary font-mono">
                                    {hasWeightSets ? `${totalVolume.toLocaleString()} kg` : `${w.exercises?.length || 0}`}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Management Edit/Delete actions */}
                        <div className="flex justify-end gap-2 border-t border-border/30 pt-2.5 mt-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(w)}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-foreground border border-border bg-muted/10 rounded-xl hover:bg-muted/20 transition-all hover:border-primary/20"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLog(w.id)}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/20 bg-red-500/5 rounded-xl hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
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
