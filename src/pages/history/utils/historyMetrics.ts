import { Workout } from '../../../services/api';

export interface MoodStyle {
  bg: string;
  color: string;
}

export interface CategoryColor {
  bg: string;
  color: string;
  border: string;
}

export function getMoodStyle(mood: string): MoodStyle {
  switch (mood?.toLowerCase()) {
    case 'energetic':   return { bg: 'rgba(56,189,248,0.1)',   color: '#38bdf8' };
    case 'accomplished': return { bg: 'rgba(163,230,53,0.1)', color: '#a3e635' };
    case 'satisfied':   return { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24' };
    case 'tired':       return { bg: 'rgba(136,136,160,0.1)', color: '#8888a0' };
    case 'exhausted':   return { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' };
    default:            return { bg: 'rgba(255,255,255,0.05)', color: 'var(--foreground)' };
  }
}

export function getCategoryColor(category: string): CategoryColor {
  switch (category?.toLowerCase()) {
    case 'strength':
      return { bg: 'rgba(163, 230, 53, 0.1)', color: '#a3e635', border: 'rgba(163, 230, 53, 0.2)' };
    case 'cardio':
      return { bg: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.2)' };
    case 'flexibility & yoga':
    case 'yoga':
      return { bg: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', border: 'rgba(167, 139, 250, 0.2)' };
    case 'sports':
      return { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316', border: 'rgba(249, 115, 22, 0.2)' };
    default:
      return { bg: 'rgba(251, 113, 133, 0.1)', color: '#fb7185', border: 'rgba(251, 113, 133, 0.2)' };
  }
}

export interface SetMetrics {
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  hasWeightSets: boolean;
}

export function aggregateSetMetrics(workout: Workout): SetMetrics {
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;
  let hasWeightSets = false;

  if (workout.exercises) {
    workout.exercises.forEach((ex) => {
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

  return { totalSets, totalReps, totalVolume, hasWeightSets };
}
