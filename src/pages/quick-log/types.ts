// Local types for the Quick Log page

export type DraftSet = { reps: number; weight: number };

export type DraftExercise = {
  localId: string;
  libraryId?: string;
  exerciseName: string;
  categoryId?: string;
  categoryName?: string;
  muscleGroup?: string;
  duration: number;
  sets: DraftSet[];
  trackingType?: string;
  distance?: number;
  pace?: string;
  calories?: number;
  focusArea?: string;
  difficulty?: string;
  intensity?: string;
  notes?: string;
  restTime?: number;
  defaultMet?: number;
  distanceMultiplier?: number;
  bodyweightFactor?: number;
  calorieMethod?: string;
  intensityLevel?: string;
  estimateConfidence?: string;
};
