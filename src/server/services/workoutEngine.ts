import { readDatabase, writeDatabase, Workout } from '../../db/db';

export function calculateCurrentWeekStartDate(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return mon.toISOString().split('T')[0];
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

  // 2. Log workout entry
  const newWorkout: Workout = {
    id: 'w-' + Date.now(),
    userId,
    workoutType,
    durationMinutes: duration,
    moodAfterWorkout: mood || 'Good',
    note: note || '',
    templateId,
    xpEarned,
    createdAt: new Date().toISOString(),
    exercises: exercises || []
  };
  db.workouts.push(newWorkout);

  // 3. Update user profile with leveling logic
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

  profile.xp += xpEarned;
  const calculatedLevel = Math.floor(profile.xp / 100) + 1;
  if (calculatedLevel > profile.level) profile.level = calculatedLevel;

  // 4. Update weekly plan count
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

  // 5. Streak calculation
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

  // 6. Badge unlocking
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

  // 7. Challenge progression
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
