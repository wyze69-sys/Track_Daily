// track_daily services – barrel export
// Import from this file or from the individual service files

export { authService } from './authService';
export type { UserSession, UserMeResponse } from './authService';

export { profileService } from './profileService';
export type { ProfileUpdatePayload } from './profileService';

export { workoutService } from './workoutService';
export type { Workout, WorkoutSet, WorkoutExercise } from './workoutService';

export { templateService } from './templateService';
export type { WorkoutTemplate } from './templateService';

export { categoryService, exerciseLibraryService } from './categoryService';
export type { ExerciseCategory, ExerciseLibraryItem } from './categoryService';

export { activityLibraryService } from './activityLibraryService';
export type { ActivityLibraryItem } from './activityLibraryService';

export { weeklyPlanService, progressService, gamificationService } from './gamificationService';
export { insightService } from './insightService';
export { nutritionService } from './nutritionService';
export type { WeeklyPlan, ProgressSummary, GamificationSummary, BadgeStatus } from './gamificationService';

export { adminService, challengeService, announcementService, feedbackService } from './adminService';
export type { AdminDashboardData, Challenge, Announcement, Feedback } from './adminService';
