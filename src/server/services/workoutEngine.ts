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

export interface CalorieEstimate {
  caloriesBurned: number;
  calorieEstimateSource: string;
}

/**
 * Single source of truth for backend calorie estimations.
 * Calculates energy expenditure based on activity metadata and user profile weight.
 * Supports metadata fields defaultMet, calorieMethod, estimateConfidence (exact/close_match/fallback),
 * and modifiers: distanceMultiplier, bodyweightFactor, intensityLevel.
 */
export function estimateWorkoutCalories(
  workout: Pick<Workout, 'workoutType' | 'durationMinutes' | 'exercises'>, 
  profile?: UserProfile
): CalorieEstimate {
  const weightKg = getProfileWeightKg(profile);
  if (!weightKg) {
    return {
      caloriesBurned: 0,
      calorieEstimateSource: 'missing user weight'
    };
  }

  const db = readDatabase();
  const activities = db.activityLibrary || [];
  const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];

  if (exercises.length > 0) {
    let totalCalories = 0;
    const sources: string[] = [];

    for (const exercise of exercises) {
      const exerciseName = exercise?.exerciseName || '';
      const categoryName = exercise?.categoryName || '';

      // 1. Find activity in library
      let activity: any = null;
      if (exercise?.libraryId) {
        activity = activities.find(act => act.id === exercise.libraryId);
      }
      if (!activity && exerciseName) {
        const exerciseNameLower = exerciseName.toLowerCase().trim();
        const categoryNameLower = categoryName ? categoryName.toLowerCase().trim() : '';

        activity = activities.find(act => {
          const nameMatch = act.name.toLowerCase().trim() === exerciseNameLower || act.normalizedName === exerciseNameLower;
          if (!nameMatch) return false;
          if (categoryNameLower) {
            return act.categoryName.toLowerCase().trim() === categoryNameLower;
          }
          return true;
        });
      }

      // Determine category name and tracking type for fallback
      const currentCategory = activity?.categoryName || categoryName || workout.workoutType;
      const trackingType = activity?.trackingType || exercise?.trackingType || '';

      // Extract metadata if found
      const defaultMet = activity?.defaultMet !== undefined ? activity.defaultMet : undefined;
      const distanceMultiplier = activity?.distanceMultiplier !== undefined ? activity.distanceMultiplier : undefined;
      const bodyweightFactor = activity?.bodyweightFactor !== undefined ? activity.bodyweightFactor : undefined;
      const calorieMethod = activity?.calorieMethod || undefined;
      const intensityLevel = activity?.intensityLevel || undefined;

      const distanceKm = toPositiveNumber(exercise?.distance);
      const isCardio = String(currentCategory).toLowerCase().includes('cardio') || trackingType === 'duration_distance';

      // Determine duration
      let duration = toPositiveNumber(exercise?.duration) || toPositiveNumber(workout.durationMinutes);
      const isStrength = String(currentCategory).toLowerCase().includes('strength') || trackingType === 'sets_reps_weight';
      if (duration <= 0) {
        if (isStrength) {
          const setsCount = Array.isArray(exercise?.sets) ? exercise.sets.length : 0;
          duration = setsCount > 0 ? setsCount : 5;
        } else if (isCardio && distanceKm > 0) {
          duration = 0;
        } else {
          duration = toPositiveNumber(workout.durationMinutes) || 10;
        }
      }

      let exerciseCalories = 0;
      let exerciseSource = '';
      const isSports = String(currentCategory).toLowerCase().includes('sport') || trackingType === 'duration_intensity';
      const isFlexibility = String(currentCategory).toLowerCase().includes('flexibility') || String(currentCategory).toLowerCase().includes('yoga') || trackingType === 'duration_focus';

      // Let's decide which rule to apply
      if (activity && calorieMethod) {
        // We have specific activity metadata
        if (calorieMethod === 'distance_weight' && isCardio) {
          if (distanceKm > 0 && duration === 0) {
            // Rule 4: cardio distance but no time
            const mult = distanceMultiplier !== undefined ? distanceMultiplier : 1.0;
            exerciseCalories = distanceKm * weightKg * mult;
            exerciseSource = `${activity.name} metadata + distance + user weight`;
          } else if (distanceKm > 0 && duration > 0) {
            // Rule 5: cardio time + distance (pace adjusted)
            const pace = duration / distanceKm;
            let metAdjuster = 1.0;
            if (pace > 8) {
              metAdjuster = 0.85;
            } else if (pace < 5) {
              metAdjuster = 1.15;
            }
            const met = (defaultMet !== undefined ? defaultMet : 8.0) * metAdjuster;
            exerciseCalories = (met * 3.5 * weightKg / 200) * duration;
            exerciseSource = `${activity.name} metadata + pace-adjusted MET + duration + user weight`;
          } else {
            // Rule 3: fallback to MET duration if distance is unknown
            const met = defaultMet !== undefined ? defaultMet : 8.0;
            exerciseCalories = (met * 3.5 * weightKg / 200) * duration;
            exerciseSource = `${activity.name} metadata + MET + duration + user weight`;
          }
        } else if (calorieMethod === 'strength_volume_adjusted' && isStrength) {
          // Rule 6: Strength volume adjusted
          const met = defaultMet !== undefined ? defaultMet : 5.0;
          const base = (met * 3.5 * weightKg / 200) * duration;
          
          const sets = Array.isArray(exercise?.sets) ? exercise.sets : [];
          let volume = 0;
          if (bodyweightFactor !== undefined && bodyweightFactor > 0) {
            // Bodyweight strength volume
            for (const set of sets) {
              const reps = toPositiveNumber(set.reps);
              volume += reps * weightKg * bodyweightFactor;
            }
          } else {
            // External weight strength volume
            for (const set of sets) {
              const reps = toPositiveNumber(set.reps);
              const weight = toPositiveNumber(set.weight);
              volume += reps * weight;
            }
          }

          let modifier = 1.00;
          if (volume > 10000) {
            modifier = 1.15;
          } else if (volume > 5000) {
            modifier = 1.10;
          } else if (volume > 1000) {
            modifier = 1.05;
          }

          exerciseCalories = base * modifier;
          exerciseSource = `${activity.name} metadata + strength volume + MET + duration + user weight`;
        } else if (calorieMethod === 'met_duration_intensity' && isSports) {
          // Rule 7: Sports intensity adjusted
          const metBase = defaultMet !== undefined ? defaultMet : 7.0;
          let metAdjuster = 1.0;
          const intensity = String(exercise?.intensity || intensityLevel || '').toLowerCase().trim();
          if (intensity === 'low') {
            metAdjuster = 0.85;
          } else if (intensity === 'high') {
            metAdjuster = 1.15;
          }
          const met = metBase * metAdjuster;
          exerciseCalories = (met * 3.5 * weightKg / 200) * duration;
          exerciseSource = `${activity.name} metadata + intensity-adjusted MET + duration + user weight`;
        } else if (isFlexibility) {
          // Rule 8: Yoga/flexibility difficulty adjusted
          const metBase = defaultMet !== undefined ? defaultMet : 2.5;
          let metAdjuster = 1.0;
          const difficulty = String(exercise?.difficulty || '').toLowerCase().trim();
          if (difficulty === 'easy' || difficulty === 'beginner') {
            metAdjuster = 0.9;
          } else if (difficulty === 'hard' || difficulty === 'advanced') {
            metAdjuster = 1.1;
          }
          const met = metBase * metAdjuster;
          exerciseCalories = (met * 3.5 * weightKg / 200) * duration;
          exerciseSource = `${activity.name} metadata + difficulty-adjusted MET + duration + user weight`;
        } else {
          // Rule 3: MET duration as default for metadata
          const met = defaultMet !== undefined ? defaultMet : 5.0;
          exerciseCalories = (met * 3.5 * weightKg / 200) * duration;
          exerciseSource = `${activity.name} metadata + MET + duration + user weight`;
        }
      } else {
        // Rule 9: Fallback rules (No activity metadata)
        // Determine category default MET
        let categoryDefaultMet = 5.0;
        let categoryNameDisplay = 'Strength';
        if (isCardio) {
          categoryDefaultMet = 8.0;
          categoryNameDisplay = 'Cardio';
        } else if (isFlexibility) {
          categoryDefaultMet = 2.5;
          categoryNameDisplay = 'Flexibility & Yoga';
        } else if (isSports) {
          categoryDefaultMet = 7.0;
          categoryNameDisplay = 'Sports';
        }

        if (isCardio && distanceKm > 0 && duration === 0) {
          // Fallback cardio with distance but no duration
          exerciseCalories = distanceKm * weightKg * 1.0;
          exerciseSource = `${categoryNameDisplay} category default + distance + user weight`;
        } else if (isCardio && distanceKm > 0 && duration > 0) {
          // Fallback cardio with pace adjustment
          const pace = duration / distanceKm;
          let metAdjuster = 1.0;
          if (pace > 8) {
            metAdjuster = 0.85;
          } else if (pace < 5) {
            metAdjuster = 1.15;
          }
          const met = categoryDefaultMet * metAdjuster;
          exerciseCalories = (met * 3.5 * weightKg / 200) * duration;
          exerciseSource = `${categoryNameDisplay} category default + pace-adjusted MET + duration + user weight`;
        } else if (isStrength) {
          // Fallback strength volume calculation (assuming external weight since no metadata bodyweightFactor exists)
          const base = (categoryDefaultMet * 3.5 * weightKg / 200) * duration;
          const sets = Array.isArray(exercise?.sets) ? exercise.sets : [];
          let volume = 0;
          for (const set of sets) {
            const reps = toPositiveNumber(set.reps);
            const weight = toPositiveNumber(set.weight);
            volume += reps * weight;
          }

          let modifier = 1.00;
          if (volume > 10000) {
            modifier = 1.15;
          } else if (volume > 5000) {
            modifier = 1.10;
          } else if (volume > 1000) {
            modifier = 1.05;
          }
          exerciseCalories = base * modifier;
          exerciseSource = `${categoryNameDisplay} category default + strength volume + MET + duration + user weight`;
        } else if (isSports) {
          // Fallback sports with intensity
          let metAdjuster = 1.0;
          const intensity = String(exercise?.intensity || '').toLowerCase().trim();
          if (intensity === 'low') {
            metAdjuster = 0.85;
          } else if (intensity === 'high') {
            metAdjuster = 1.15;
          }
          const met = categoryDefaultMet * metAdjuster;
          exerciseCalories = (met * 3.5 * weightKg / 200) * duration;
          exerciseSource = `${categoryNameDisplay} category default + intensity-adjusted MET + duration + user weight`;
        } else if (isFlexibility) {
          // Fallback yoga with difficulty
          let metAdjuster = 1.0;
          const difficulty = String(exercise?.difficulty || '').toLowerCase().trim();
          if (difficulty === 'easy' || difficulty === 'beginner') {
            metAdjuster = 0.9;
          } else if (difficulty === 'hard' || difficulty === 'advanced') {
            metAdjuster = 1.1;
          }
          const met = categoryDefaultMet * metAdjuster;
          exerciseCalories = (met * 3.5 * weightKg / 200) * duration;
          exerciseSource = `${categoryNameDisplay} category default + difficulty-adjusted MET + duration + user weight`;
        } else {
          exerciseCalories = (categoryDefaultMet * 3.5 * weightKg / 200) * duration;
          exerciseSource = `${categoryNameDisplay} category default MET + duration + user weight`;
        }
      }

      totalCalories += exerciseCalories;
      if (exerciseSource && !sources.includes(exerciseSource)) {
        sources.push(exerciseSource);
      }
    }

    return {
      caloriesBurned: Math.round(totalCalories),
      calorieEstimateSource: sources.join(' | ')
    };
  }

  // Fallback if no exercises are defined
  const duration = toPositiveNumber(workout.durationMinutes);
  const workoutType = String(workout.workoutType || '').toLowerCase().trim();

  let categoryDefaultMet = 5.0;
  let categoryNameDisplay = 'Strength';
  if (workoutType.includes('cardio')) {
    categoryDefaultMet = 8.0;
    categoryNameDisplay = 'Cardio';
  } else if (workoutType.includes('flexibility') || workoutType.includes('yoga') || workoutType.includes('mobility')) {
    categoryDefaultMet = 2.5;
    categoryNameDisplay = 'Flexibility & Yoga';
  } else if (workoutType.includes('sport')) {
    categoryDefaultMet = 7.0;
    categoryNameDisplay = 'Sports';
  }

  const calories = (categoryDefaultMet * 3.5 * weightKg / 200) * duration;
  return {
    caloriesBurned: Math.round(calories),
    calorieEstimateSource: `${categoryNameDisplay} category default MET + duration + user weight`
  };
}

export function withEstimatedCalories(workout: Workout, profile?: UserProfile): Workout {
  const est = estimateWorkoutCalories(workout, profile);
  return {
    ...workout,
    caloriesBurned: workout.caloriesBurned !== undefined && workout.caloriesBurned !== null && workout.caloriesBurned > 0 ? workout.caloriesBurned : est.caloriesBurned,
    calorieEstimateSource: workout.calorieEstimateSource || est.calorieEstimateSource
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
  const est = estimateWorkoutCalories(calorieSourceWorkout as Workout, profile);
  const newWorkout: Workout = {
    id: 'w-' + Date.now(),
    userId,
    workoutType,
    durationMinutes: duration,
    moodAfterWorkout: mood || 'Good',
    note: note || '',
    templateId,
    xpEarned,
    caloriesBurned: est.caloriesBurned,
    calorieEstimateSource: est.calorieEstimateSource,
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
