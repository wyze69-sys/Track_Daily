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
};
