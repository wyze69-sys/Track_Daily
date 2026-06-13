import * as fs from 'fs';
import * as path from 'path';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'admin';
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  avatar: string;
  level: number;
  xp: number;
  weeklyTarget: number;
  currentStreak: number;
  maxStreak: number;
  lastWorkoutDate: string | null;
  age?: number | null;
  gender?: 'male' | 'female' | 'other' | string | null;
  height?: number | null;
  weight?: number | null;
  targetWeight?: number | null;
  preferredWorkoutType?: string | null;
  goal?: string | null;
  activityLevel?: 'Sedentary' | 'Lightly active' | 'Moderately active' | 'Very active' | string | null;
  weightKg?: number | null;
  heightCm?: number | null;
  dietPreference?: string | null;
  allergies?: string[] | null;
}

export interface ActivityLibraryItem {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  normalizedName: string;
  trackingType: 'sets_reps_weight' | 'duration_distance' | 'duration_focus' | 'duration_intensity' | string;
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | string;
  isActive: boolean;
  source: 'default' | 'admin' | 'custom';
  createdByUserId?: string | null;
  defaultMet?: number;
  distanceMultiplier?: number;
  bodyweightFactor?: number;
  calorieMethod?: 'met_duration' | 'distance_weight' | 'strength_volume_adjusted' | 'met_duration_intensity' | string;
  intensityLevel?: 'low' | 'moderate' | 'high' | string;
  estimateConfidence?: 'exact' | 'close_match' | 'fallback' | string;
}

export interface ExerciseCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface Workout {
  id: string;
  userId: string;
  workoutType: string;
  durationMinutes: number;
  moodAfterWorkout: string;
  note: string;
  templateId: string | null;
  xpEarned: number;
  caloriesBurned?: number;
  calorieEstimateSource?: string;
  createdAt: string;
  exercises?: any[];
}

export interface UserAchievement {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  createdBy: string;
  createdAt: string;
  exercises?: any[];
}

export interface WeeklyPlan {
  id: string;
  userId: string;
  targetCount: number;
  currentCount: number;
  weekStartDate: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetWorkouts: number;
  xpReward: number;
  endDate: string;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  progress: number;
  status: 'active' | 'completed';
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  content: string;
  status: 'pending' | 'reviewed';
  date: string;
}

export interface DatabaseSchema {
  users: User[];
  userProfiles: UserProfile[];
  exerciseCategories: ExerciseCategory[];
  workouts: Workout[];
  userAchievements: UserAchievement[];
  workoutTemplates: WorkoutTemplate[];
  weeklyPlans: WeeklyPlan[];
  challenges: Challenge[];
  userChallenges: UserChallenge[];
  announcements: Announcement[];
  feedback: Feedback[];
  activityLibrary?: ActivityLibraryItem[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'db', 'db.json');

// Make sure directory exists
const dbDir = path.dirname(DB_FILE_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// In-memory shadow copy for instant access and fallbacks
let dbState: DatabaseSchema = {
  users: [],
  userProfiles: [],
  exerciseCategories: [],
  workouts: [],
  userAchievements: [],
  workoutTemplates: [],
  weeklyPlans: [],
  challenges: [],
  userChallenges: [],
  announcements: [],
  feedback: [],
  activityLibrary: []
};

let initialActivities: ActivityLibraryItem[] = [];
try {
  const seedPath = path.join(process.cwd(), 'database', 'seed', 'activity-library.json');
  if (fs.existsSync(seedPath)) {
    initialActivities = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  }
} catch (e) {
  console.error("Failed to load default activities seed", e);
}

// Seed data contains only real reference data required for a new database.
// User accounts, workouts, feedback, templates, announcements, and challenges must be created by real users/admins through the app.
const SEED_DATA: DatabaseSchema = {
  activityLibrary: initialActivities,
  users: [],
  userProfiles: [],
  exerciseCategories: [
    { id: "cat-1", name: "Strength", icon: "Dumbbell", description: "Weightlifting, power training, and bodyweight exercises.", createdBy: "system", createdAt: "2026-06-01T09:00:00Z" },
    { id: "cat-2", name: "Cardio", icon: "Activity", description: "Running, cycling, intervals, and endurance conditioning.", createdBy: "system", createdAt: "2026-06-01T09:00:00Z" },
    { id: "cat-3", name: "Flexibility & Yoga", icon: "StretchHorizontal", description: "Yoga, static stretching, and mobility routines.", createdBy: "system", createdAt: "2026-06-01T09:00:00Z" },
    { id: "cat-4", name: "Sports", icon: "Trophy", description: "Team, racket, field, and recreational sports activities.", createdBy: "system", createdAt: "2026-06-01T09:00:00Z" }
  ],
  workouts: [],
  userAchievements: [],
  workoutTemplates: [],
  weeklyPlans: [],
  challenges: [],
  userChallenges: [],
  announcements: [],
  feedback: []
};

export function readDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
      dbState = JSON.parse(raw);
      if (!dbState.activityLibrary || dbState.activityLibrary.length === 0) {
        dbState.activityLibrary = JSON.parse(JSON.stringify(initialActivities));
        writeDatabase(dbState);
      } else {
        // Automatically sync calorie metadata from seed JSON into existing default activities in dbState
        let updatedAny = false;
        dbState.activityLibrary = dbState.activityLibrary.map(item => {
          if (item.source === 'default') {
            const seedItem = initialActivities.find(s => s.id === item.id);
            if (seedItem) {
              const merged = { ...item };
              let changed = false;
              const calorieFields = ['defaultMet', 'distanceMultiplier', 'bodyweightFactor', 'calorieMethod', 'intensityLevel', 'estimateConfidence'] as const;
              for (const field of calorieFields) {
                if (seedItem[field] !== merged[field]) {
                  (merged as any)[field] = seedItem[field];
                  changed = true;
                }
              }
              if (changed) {
                updatedAny = true;
              }
              return merged;
            }
          }
          return item;
        });
        if (updatedAny) {
          writeDatabase(dbState);
        }
      }
    } else {
      // Create seed
      dbState = JSON.parse(JSON.stringify(SEED_DATA));
      writeDatabase(dbState);
    }
  } catch (err) {
    console.error("Failed to read database, falling back to memory state", err);
    if (!dbState.users || dbState.users.length === 0) {
      dbState = JSON.parse(JSON.stringify(SEED_DATA));
    }
  }
  return dbState;
}

export function writeDatabase(state: DatabaseSchema): void {
  try {
    dbState = state;
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to write database file", err);
  }
}

// Initial pull on script load
readDatabase();
