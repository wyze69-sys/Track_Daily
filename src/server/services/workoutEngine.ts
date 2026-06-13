import { readDatabase, writeDatabase, Workout, UserProfile } from '../../db/db';

export function calculateCurrentWeekStartDate(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return mon.toISOString().split('T')[0];
}

const TRACKING_MET: Record<string, number> = {
  sets_reps_weight: 5,
  duration_distance: 8,
  duration_focus: 2.5,
  duration_intensity: 7
};

const WORKOUT_TYPE_MET: Record<string, number> = {
  strength: 5,
  cardio: 8,
  'flexibility & yoga': 2.5,
  flexibility: 2.5,
  mobility: 2.5,
  sports: 7
};

const toPositiveNumber = (value: any): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const getProfileWeightKg = (profile?: UserProfile): number => {
  return toPositiveNumber(profile?.weightKg) || toPositiveNumber(profile?.weight);
};

function inferTrackingType(exercise: any, workoutType: string): string {
  if (exercise?.trackingType) return exercise.trackingType;
  const category = String(exercise?.categoryName || workoutType || '').toLowerCase();
  if (category.includes('cardio')) return 'duration_distance';
  if (category.includes('flexibility') || category.includes('yoga') || category.includes('mobility')) return 'duration_focus';
  if (category.includes('sport')) return 'duration_intensity';
  return 'sets_reps_weight';
}

export function estimateWorkoutCalories(workout: Pick<Workout, 'workoutType' | 'durationMinutes' | 'exercises'>, profile?: UserProfile): number {
  const weightKg = getProfileWeightKg(profile);
  if (!weightKg) return 0;

  const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
  if (exercises.length > 0) {
    const totalFromExercises = exercises.reduce((sum, exercise) => {
      const enteredCalories = toPositiveNumber(exercise?.calories) || toPositiveNumber(exercise?.caloriesBurned);
      if (enteredCalories) return sum + enteredCalories;

      const duration = toPositiveNumber(exercise?.duration) || toPositiveNumber(workout.durationMinutes);
      if (!duration) return sum;

      const trackingType = inferTrackingType(exercise, workout.workoutType);
      const met = TRACKING_MET[trackingType] || WORKOUT_TYPE_MET[String(workout.workoutType || '').toLowerCase()] || 5;
      return sum + ((met * 3.5 * weightKg) / 200) * duration;
    }, 0);
    return Math.round(totalFromExercises);
  }

  const duration = toPositiveNumber(workout.durationMinutes);
  if (!duration) return 0;
  const met = WORKOUT_TYPE_MET[String(workout.workoutType || '').toLowerCase()] || 5;
  return Math.round(((met * 3.5 * weightKg) / 200) * duration);
}

export function withEstimatedCalories(workout: Workout, profile?: UserProfile): Workout {
  const existingCalories = toPositiveNumber((workout as any).caloriesBurned);
  return {
    ...workout,
    caloriesBurned: existingCalories || estimateWorkoutCalories(workout, profile)
  } as Workout;
}

export function processWorkoutLogging(
  userId: string,
  workoutType: string,
  duration: number,
  mood: string,
  note: string,
  templateId: string | null,
  exercises?: any[]
) {
  const db = readDatabase();

  // 1. Calculate XP Earned
  let xpEarned = 50;
  if (duration > 30) xpEarned += 20;
  if (mood || note) xpEarned += 10;

  // 2. Ensure a real user profile exists before estimated calorie calculation
  let profile = db.userProfiles.find((p) => p.userId === userId);
  if (!profile) {
    profile = {
      userId,
      fullName: db.users.find((u) => u.id === userId)?.email.split('@')[0] || 'Student',
      avatar: '',
      level: 1,
      xp: 0,
      weeklyTarget: 3,
      currentStreak: 0,
      maxStreak: 0,
      lastWorkoutDate: null
    };
    db.userProfiles.push(profile);
  }

  const calorieSourceWorkout = {
    workoutType,
    durationMinutes: duration,
    exercises: exercises || []
  };

  // 3. Log workout entry
  const newWorkout: Workout = {
    id: 'w-' + Date.now(),
    userId,
    workoutType,
    durationMinutes: duration,
    moodAfterWorkout: mood || 'Good',
    note: note || '',
    templateId,
    xpEarned,
    caloriesBurned: estimateWorkoutCalories(calorieSourceWorkout as Workout, profile),
    createdAt: new Date().toISOString(),
    exercises: exercises || []
  };
  db.workouts.push(newWorkout);

  // 4. Update user profile with leveling logic
  profile.xp += xpEarned;
  const calculatedLevel = Math.floor(profile.xp / 100) + 1;
  if (calculatedLevel > profile.level) profile.level = calculatedLevel;

  // 5. Update weekly plan count
  const currentWeekMonday = calculateCurrentWeekStartDate();
  let weeklyPlan = db.weeklyPlans.find(
    (wp) => wp.userId === userId && wp.weekStartDate === currentWeekMonday
  );
  if (!weeklyPlan) {
    weeklyPlan = {
      id: 'wp-' + Date.now(),
      userId,
      targetCount: profile.weeklyTarget || 3,
      currentCount: 0,
      weekStartDate: currentWeekMonday
    };
    db.weeklyPlans.push(weeklyPlan);
  }
  weeklyPlan.currentCount += 1;

  if (weeklyPlan.currentCount === weeklyPlan.targetCount) {
    xpEarned += 50;
    profile.xp += 50;
    const levelCheck = Math.floor(profile.xp / 100) + 1;
    if (levelCheck > profile.level) profile.level = levelCheck;
    newWorkout.xpEarned += 50;
  }

  // 6. Streak calculation
  const now = new Date();
  const currentDateStr = now.toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const yesterdayDateStr = yesterday.toISOString().split('T')[0];

  if (!profile.lastWorkoutDate) {
    profile.currentStreak = 1;
    profile.maxStreak = Math.max(1, profile.maxStreak);
  } else if (profile.lastWorkoutDate === currentDateStr) {
    // already logged today
  } else if (profile.lastWorkoutDate === yesterdayDateStr) {
    profile.currentStreak += 1;
    profile.maxStreak = Math.max(profile.currentStreak, profile.maxStreak);
  } else {
    profile.currentStreak = 1;
  }
  profile.lastWorkoutDate = currentDateStr;

  // 7. Badge unlocking
  const currentAchievements = db.userAchievements.filter((a) => a.userId === userId);
  const grantBadge = (badgeId: string) => {
    if (!currentAchievements.some((a) => a.badgeId === badgeId)) {
      db.userAchievements.push({
        id: 'ach-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        userId,
        badgeId,
        unlockedAt: new Date().toISOString()
      });
    }
  };

  grantBadge('first_workout');
  if (profile.currentStreak >= 3) grantBadge('streak_3');
  if (now.getHours() < 9) grantBadge('morning_mover');
  if (weeklyPlan.currentCount >= 4) grantBadge('strong_week');

  // 8. Challenge progression
  const userChgs = db.userChallenges.filter(
    (uc) => uc.userId === userId && uc.status === 'active'
  );
  userChgs.forEach((uc) => {
    const parentChg = db.challenges.find((c) => c.id === uc.challengeId);
    if (parentChg) {
      uc.progress += 1;
      if (uc.progress >= parentChg.targetWorkouts) {
        uc.status = 'completed';
        profile!.xp += parentChg.xpReward;
        const finalLevelCheck = Math.floor(profile!.xp / 100) + 1;
        if (finalLevelCheck > profile!.level) profile!.level = finalLevelCheck;
      }
    }
  });

  writeDatabase(db);
  return { workout: newWorkout, profile, xpEarned };
}
