import React, { useState, useEffect } from 'react';
import { workoutService, Workout } from '../../services/api';
import { PageContainer } from '../../components/layout/PageContainer';
import { History as HistoryIcon, Loader2 } from 'lucide-react';
import { WorkoutTimelineCard } from './components/WorkoutTimelineCard';
import { EditWorkoutForm } from './components/EditWorkoutForm';

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
      console.error('Failed to load workout history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(); }, []);

  const handleStartEdit = (w: Workout) => {
    setEditingId(w.id);
    setEditedType(w.workoutType);
    setEditedDuration(w.durationMinutes);
    setEditedMood(w.moodAfterWorkout);
    setEditedNote(w.note);
  };

  const handleCancelEdit = () => setEditingId(null);

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
      setError(err?.message || 'Failed to update workout log.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this workout log? This action is irreversible.')) return;
    setError(null);
    try {
      await workoutService.delete(id);
      await loadLogs();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete workout log.');
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
            <p className="text-xs mt-1 leading-normal max-w-sm mx-auto">
              Track your workouts using the Workout Builder to build your training history.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((w) => (
              <div key={w.id} className="p-5 rounded-2xl border border-border transition-colors bg-card">
                {editingId === w.id ? (
                  <EditWorkoutForm
                    editedType={editedType}
                    editedDuration={editedDuration}
                    editedMood={editedMood}
                    editedNote={editedNote}
                    savingId={savingId}
                    workoutId={w.id}
                    onTypeChange={setEditedType}
                    onDurationChange={setEditedDuration}
                    onMoodChange={setEditedMood}
                    onNoteChange={setEditedNote}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <WorkoutTimelineCard
                    workout={w}
                    onEdit={handleStartEdit}
                    onDelete={handleDeleteLog}
                  />
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </PageContainer>
  );
};
