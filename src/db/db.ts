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

// Seed utility (bcrypt hashed hashes ready for: admin / password)
// Admin target hash for password 'admin': $2a$10$7XvW78Mh.e9K1sP.6G9h8.aFAnBwS/6yWeu8uPhU2qCHzTq.V.3pC (will use simplified comparison or fallback, but keeping it standard)
const SEED_DATA: DatabaseSchema = {
  activityLibrary: initialActivities,
  users: [
    {
      id: "u-admin",
      email: "admin@logweb.edu",
      // BCrypt hash for "admin"
      passwordHash: "$2a$10$w86H0AomY84g9S5A2mR58ex3m7N/fS0e659P4.p7/z6/9z.A4C626",
      role: 'admin',
      createdAt: "2026-06-01T08:00:00Z"
    },
    {
      id: "u-student",
      email: "student@logweb.edu",
      // BCrypt hash for "password"
      passwordHash: "$2a$10$Z3mS1bPh4p5c6X9e7f8g...hAsH... (we'll replace this with real bcrypt output in service or compare logic)" ,
      role: 'student',
      createdAt: "2026-06-01T08:30:00Z"
    }
  ],
  userProfiles: [
    {
      userId: "u-student",
      fullName: "Alex Miller",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      level: 1,
      xp: 40,
      weeklyTarget: 3,
      currentStreak: 2,
      maxStreak: 5,
      lastWorkoutDate: "2026-06-10"
    }
  ],
  exerciseCategories: [
    { id: "cat-1", name: "Strength", icon: "Dumbbell", description: "Weightlifting, power training, and bodyweight exercises.", createdBy: "u-admin", createdAt: "2026-06-01T09:00:00Z" },
    { id: "cat-2", name: "Cardio", icon: "Flame", description: "Running, cycling, high-intensity intervals, and metabolic conditioning.", createdBy: "u-admin", createdAt: "2026-06-01T09:00:00Z" },
    { id: "cat-3", name: "Flexibility & Yoga", icon: "Sparkles", description: "Vinyasa flow, static stretching, and mobility routines.", createdBy: "u-admin", createdAt: "2026-06-01T09:00:00Z" },
    { id: "cat-4", name: "Sports", icon: "Trophy", description: "Basketball, soccer, tennis, and quick campus recreational sports.", createdBy: "u-admin", createdAt: "2026-06-01T09:00:00Z" }
  ],
  workouts: [
    {
      id: "w-1",
      userId: "u-student",
      workoutType: "Strength",
      durationMinutes: 45,
      moodAfterWorkout: "Energetic",
      note: "Pushed hard on my squats and bench press today in the school gym.",
      templateId: null,
      xpEarned: 70, // Base 50 + Over 30 min (+20)
      createdAt: "2026-06-09T17:15:00Z"
    },
    {
      id: "w-2",
      userId: "u-student",
      workoutType: "Cardio",
      durationMinutes: 20,
      moodAfterWorkout: "Accomplished",
      note: "Quick treadmill log in between classes. Better than nothing!",
      templateId: null,
      xpEarned: 60, // Base 50 + Add mood/note (+10)
      createdAt: "2026-06-10T11:30:00Z"
    }
  ],
  userAchievements: [
    { id: "ach-1", userId: "u-student", badgeId: "first_workout", unlockedAt: "2026-06-09T17:15:00Z" }
  ],
  workoutTemplates: [
    {
      id: "tpl-1",
      name: "Campus Gym Upper Push",
      category: "Strength",
      durationMinutes: 40,
      createdBy: "u-admin",
      createdAt: "2026-06-02T10:00:00Z",
      exercises: [
        {
          exerciseName: "Bench Press",
          duration: 15,
          sets: [
            { reps: 10, weight: 60 },
            { reps: 8, weight: 70 },
            { reps: 6, weight: 80 }
          ]
        },
        {
          exerciseName: "Overhead Press",
          duration: 15,
          sets: [
            { reps: 10, weight: 30 },
            { reps: 10, weight: 35 },
            { reps: 8, weight: 40 }
          ]
        },
        {
          exerciseName: "Tricep Pushdowns",
          duration: 10,
          sets: [
            { reps: 12, weight: 20 },
            { reps: 12, weight: 25 }
          ]
        }
      ]
    },
    {
      id: "tpl-2",
      name: "Quick 20-Min Jog",
      category: "Cardio",
      durationMinutes: 20,
      createdBy: "u-admin",
      createdAt: "2026-06-02T10:15:00Z",
      exercises: [
        {
          exerciseName: "Outdoor Run",
          duration: 20,
          sets: [
            { reps: 1, weight: 0 }
          ]
        }
      ]
    },
    {
      id: "tpl-3",
      name: "Sunset Yoga Stretch",
      category: "Flexibility & Yoga",
      durationMinutes: 15,
      createdBy: "u-admin",
      createdAt: "2026-06-02T10:20:00Z",
      exercises: [
        {
          exerciseName: "Sun Salutation",
          duration: 15,
          sets: [
            { reps: 1, weight: 0 }
          ]
        }
      ]
    }
  ],
  weeklyPlans: [
    { id: "wp-1", userId: "u-student", targetCount: 3, currentCount: 2, weekStartDate: "2026-06-08" }
  ],
  challenges: [
    { id: "chg-1", title: "Semester Startup Kickoff", description: "Join fellow campus students and log 3 workouts in a week to claim a sweet bonus!", targetWorkouts: 3, xpReward: 100, endDate: "2026-06-30" },
    { id: "chg-2", title: "Flexibility Focus", description: "Give your body recess with 2 logged Yoga or stretching sessions.", targetWorkouts: 2, xpReward: 50, endDate: "2026-06-25" }
  ],
  userChallenges: [
    { id: "uc-1", userId: "u-student", challengeId: "chg-1", progress: 2, status: "active", createdAt: "2026-06-08T09:00:00Z" }
  ],
  announcements: [
    {
      id: "ann-1",
      title: "Welcome to logweb v2! ✨",
      content: "We redesigned the logging system! It now takes under an amateur full minute to track your physical activities. Earn XP levels, maintain streaks, and show up consistently for you! No smartwatches, no professional bodybuilders, just you showing up for your studies and health.",
      date: "2026-06-01T08:00:00Z"
    }
  ],
  feedback: [
    {
      id: "fb-1",
      userId: "u-student",
      userName: "Alex Miller",
      content: "I love logweb v2! The fast logs let me save so much tracking time in between classes. Could we get a badge for Morning workouts next?",
      status: "pending",
      date: "2026-06-10T12:00:00Z"
    }
  ]
};

// Hash password synchronously in node (we'll also handle manual hashing fallback in case bcrypt is not initialized)
import * as bcrypt from 'bcryptjs';
// Replace placeholder student has with a real valid hash for 'password'
SEED_DATA.users[1].passwordHash = bcrypt.hashSync('password', 10);

export function readDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
      dbState = JSON.parse(raw);
      if (!dbState.activityLibrary || dbState.activityLibrary.length === 0) {
        dbState.activityLibrary = JSON.parse(JSON.stringify(initialActivities));
        writeDatabase(dbState);
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
