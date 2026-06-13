import React from 'react';
import { Clock, Edit2, Trash2 } from 'lucide-react';
import { Workout } from '../../../services/api';
import { getMoodStyle, getCategoryColor, aggregateSetMetrics } from '../utils/historyMetrics';
import { WorkoutTypeSummary } from './WorkoutTypeSummary';

interface WorkoutTimelineCardProps {
  workout: Workout;
  onEdit: (w: Workout) => void;
  onDelete: (id: string) => void;
}

export const WorkoutTimelineCard: React.FC<WorkoutTimelineCardProps> = ({ workout: w, onEdit, onDelete }) => {
  const moodStyle = getMoodStyle(w.moodAfterWorkout);
  const catColor = getCategoryColor(w.workoutType);
  const metrics = aggregateSetMetrics(w);

  return (
    <div className="p-5 rounded-2xl border border-border transition-colors bg-card">
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
              <span
                className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border leading-none font-mono"
                style={{ background: catColor.bg, color: catColor.color, borderColor: catColor.border }}
              >
                {w.workoutType}
              </span>
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

            {/* Exercise list */}
            {w.exercises && w.exercises.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider font-mono">
                  Exercises ({w.exercises.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {w.exercises.map((exercise, index) => (
                    <div
                      key={`${w.id}_${exercise.id || index}`}
                      className="rounded-xl border border-border bg-muted/5 px-3 py-2 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-border/20 pb-1 mb-1">
                        <span className="text-xs font-bold text-foreground truncate">{exercise.exerciseName}</span>
                        <span className="text-[9px] font-mono font-bold text-muted-foreground">{exercise.duration}m</span>
                      </div>
                      <WorkoutTypeSummary exercise={exercise} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aggregate metrics */}
            {metrics.totalSets > 0 && (
              <div className="grid grid-cols-3 gap-2 border-t border-border/40 pt-2.5 mt-2.5">
                <div className="text-center bg-muted/20 rounded-xl p-1.5 border border-border/20">
                  <span className="block text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Total Sets</span>
                  <span className="text-xs font-black text-foreground font-mono">{metrics.totalSets}</span>
                </div>
                <div className="text-center bg-muted/20 rounded-xl p-1.5 border border-border/20">
                  <span className="block text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Total Reps</span>
                  <span className="text-xs font-black text-foreground font-mono">{metrics.totalReps}</span>
                </div>
                <div className="text-center bg-muted/20 rounded-xl p-1.5 border border-border/20">
                  <span className="block text-[8px] text-muted-foreground uppercase font-bold tracking-wider">
                    {metrics.hasWeightSets ? 'Total Volume' : 'Movements'}
                  </span>
                  <span className="text-xs font-black text-primary font-mono">
                    {metrics.hasWeightSets ? `${metrics.totalVolume.toLocaleString()} kg` : `${w.exercises?.length || 0}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-border/30 pt-2.5 mt-1">
            <button
              type="button"
              onClick={() => onEdit(w)}
              className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-foreground border border-border bg-muted/10 rounded-xl hover:bg-muted/20 transition-all hover:border-primary/20"
            >
              <Edit2 className="h-3 w-3" /> Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(w.id)}
              className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/20 bg-red-500/5 rounded-xl hover:bg-red-500/10 transition-all"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
