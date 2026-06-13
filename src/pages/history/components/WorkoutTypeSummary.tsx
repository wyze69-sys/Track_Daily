import React from 'react';
import { WorkoutExercise } from '../../../services/api';
import { getTrackingType } from '../../quick-log/components/TrackingFields';

interface WorkoutTypeSummaryProps {
  exercise: WorkoutExercise;
}

export const WorkoutTypeSummary: React.FC<WorkoutTypeSummaryProps> = ({ exercise }) => {
  const trackingType = exercise.trackingType || getTrackingType(exercise as any);

  const badgeClass = "text-[9px] font-mono font-medium bg-muted px-2 py-0.5 rounded border border-border text-foreground";

  switch (trackingType) {
    case 'sets_reps_weight':
      return (
        <div className="space-y-1.5 mt-1">
          {exercise.sets && exercise.sets.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {exercise.sets.map((set, setIndex) => (
                <span key={setIndex} className={badgeClass}>
                  S{setIndex + 1}: {set.reps}r {set.weight ? `@ ${set.weight}kg` : ''}
                </span>
              ))}
              {exercise.restTime !== undefined && exercise.restTime !== null && (
                <span className="text-[9px] font-mono text-muted-foreground flex items-center ml-1">
                  Rest: {exercise.restTime}s
                </span>
              )}
            </div>
          ) : (
            <span className="text-[9px] text-muted-foreground italic">No sets recorded</span>
          )}
        </div>
      );

    case 'duration_distance':
      return (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {exercise.distance !== undefined && exercise.distance !== null && (
            <span className={badgeClass}>
              Distance: {exercise.distance} km
            </span>
          )}
          {exercise.pace && (
            <span className={badgeClass}>
              Pace: {exercise.pace}
            </span>
          )}
          {exercise.calories !== undefined && exercise.calories !== null && (
            <span className={badgeClass}>
              Calories: {exercise.calories} kcal
            </span>
          )}
          {(!exercise.distance && !exercise.pace && !exercise.calories) && (
            <span className="text-[9px] text-muted-foreground italic">Cardio details logged</span>
          )}
        </div>
      );

    case 'duration_focus':
      return (
        <div className="space-y-1 mt-1">
          <div className="flex flex-wrap gap-1.5">
            {exercise.focusArea && (
              <span className={badgeClass}>
                Focus: {exercise.focusArea}
              </span>
            )}
            {exercise.difficulty && (
              <span className={`${badgeClass} capitalize`}>
                Difficulty: {exercise.difficulty}
              </span>
            )}
          </div>
          {exercise.notes && (
            <p className="text-[10px] text-muted-foreground italic pl-1 mt-0.5">
              Notes: {exercise.notes}
            </p>
          )}
          {!exercise.focusArea && !exercise.difficulty && !exercise.notes && (
            <span className="text-[9px] text-muted-foreground italic">Flexibility details logged</span>
          )}
        </div>
      );

    case 'duration_intensity':
      return (
        <div className="space-y-1 mt-1">
          <div className="flex flex-wrap gap-1.5">
            {exercise.intensity && (
              <span className={badgeClass}>
                Intensity: {exercise.intensity}
              </span>
            )}
          </div>
          {exercise.notes && (
            <p className="text-[10px] text-muted-foreground italic pl-1 mt-0.5">
              Notes: {exercise.notes}
            </p>
          )}
          {!exercise.intensity && !exercise.notes && (
            <span className="text-[9px] text-muted-foreground italic">Sports details logged</span>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-1.5 mt-1">
          {exercise.sets && exercise.sets.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {exercise.sets.map((set, setIndex) => (
                <span key={setIndex} className={badgeClass}>
                  S{setIndex + 1}: {set.reps}r {set.weight ? `@ ${set.weight}kg` : ''}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[9px] text-muted-foreground italic">No sets recorded</span>
          )}
        </div>
      );
  }
};
