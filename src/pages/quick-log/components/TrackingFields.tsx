import React from 'react';
import { DraftExercise, DraftSet } from '../types';
import { StrengthTrackingFields } from './StrengthTrackingFields';
import { CardioTrackingFields } from './CardioTrackingFields';
import { DurationFocusFields } from './DurationFocusFields';
import { DurationIntensityFields } from './DurationIntensityFields';

interface TrackingFieldsProps {
  exercise: DraftExercise;
  validationErrors: { [key: string]: string };
  onUpdateExercise: (localId: string, updates: Partial<DraftExercise>) => void;
  onUpdateSet: (exerciseId: string, setIndex: number, updates: Partial<DraftSet>) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setIndex: number) => void;
  onDuplicateLastSet: (exerciseId: string) => void;
}

export function getTrackingType(exercise: { trackingType?: string; categoryName?: string }): string {
  if (exercise.trackingType) return exercise.trackingType;
  const category = (exercise.categoryName || '').toLowerCase();
  if (category.includes('strength')) return 'sets_reps_weight';
  if (category.includes('cardio')) return 'duration_distance';
  if (category.includes('flexibility') || category.includes('yoga') || category.includes('mobility')) return 'duration_focus';
  if (category.includes('sport')) return 'duration_intensity';
  return 'sets_reps_weight'; // fallback
}

export const TrackingFields: React.FC<TrackingFieldsProps> = ({
  exercise,
  validationErrors,
  onUpdateExercise,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onDuplicateLastSet
}) => {
  const trackingType = getTrackingType(exercise);

  switch (trackingType) {
    case 'sets_reps_weight':
      return (
        <StrengthTrackingFields
          exercise={exercise}
          validationErrors={validationErrors}
          onUpdateExercise={onUpdateExercise}
          onUpdateSet={onUpdateSet}
          onAddSet={onAddSet}
          onRemoveSet={onRemoveSet}
          onDuplicateLastSet={onDuplicateLastSet}
        />
      );
    case 'duration_distance':
      return (
        <CardioTrackingFields
          exercise={exercise}
          validationErrors={validationErrors}
          onUpdateExercise={onUpdateExercise}
        />
      );
    case 'duration_focus':
      return (
        <DurationFocusFields
          exercise={exercise}
          onUpdateExercise={onUpdateExercise}
        />
      );
    case 'duration_intensity':
      return (
        <DurationIntensityFields
          exercise={exercise}
          onUpdateExercise={onUpdateExercise}
        />
      );
    default:
      return (
        <StrengthTrackingFields
          exercise={exercise}
          validationErrors={validationErrors}
          onUpdateExercise={onUpdateExercise}
          onUpdateSet={onUpdateSet}
          onAddSet={onAddSet}
          onRemoveSet={onRemoveSet}
          onDuplicateLastSet={onDuplicateLastSet}
        />
      );
  }
};
