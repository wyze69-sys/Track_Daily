const DEFAULT_WEIGHT_KG = 70;
const DISTANCE_XP_FACTOR = 0.8;

const CATEGORY_PROFILES = {
  cardio: { baseMet: 7.5, xpPerMetMin: 0.18 },
  strength: { baseMet: 6, xpPerMetMin: 0.2 },
  hiit: { baseMet: 8, xpPerMetMin: 0.22 },
  yoga: { baseMet: 4, xpPerMetMin: 0.25 },
  mobility: { baseMet: 2.8, xpPerMetMin: 0.22 },
  sports: { baseMet: 7, xpPerMetMin: 0.2 },
  running: { baseMet: 9.8, xpPerMetMin: 0.18, family: "cardio" },
  cycling: { baseMet: 7.5, xpPerMetMin: 0.18, family: "cardio" },
  walking: { baseMet: 3.5, xpPerMetMin: 0.2, family: "cardio" },
  swimming: { baseMet: 8, xpPerMetMin: 0.18, family: "cardio" },
  "yoga-vinyasa": { baseMet: 4, xpPerMetMin: 0.25, family: "yoga" }
};

/**
 * Returns the normalized category slug used by reward calculations.
 * @param {object} workout Workout payload or row-like object.
 * @returns {string}
 */
function getCategorySlug(workout = {}) {
  return String(workout.category || workout.categorySlug || workout.slug || "")
    .trim()
    .toLowerCase();
}

/**
 * Returns the workout duration in minutes from supported API field names.
 * @param {object} workout Workout payload or row-like object.
 * @returns {number}
 */
function getDurationMinutes(workout = {}) {
  return Number(workout.duration_min ?? workout.durationMin ?? workout.duration ?? 0) || 0;
}

/**
 * Returns the workout distance in kilometres from supported API field names.
 * @param {object} workout Workout payload or row-like object.
 * @returns {number}
 */
function getDistanceKm(workout = {}) {
  return Number(workout.distance_km ?? workout.distanceKm ?? 0) || 0;
}

/**
 * Resolves a category profile with DB metadata overriding static defaults.
 * @param {string} slug Category slug.
 * @param {object} categoryMeta Optional DB category metadata.
 * @returns {{baseMet: number, xpPerMetMin: number, family?: string}}
 */
function resolveCategoryProfile(slug, categoryMeta = null) {
  const fallback = CATEGORY_PROFILES[slug] || CATEGORY_PROFILES.cardio;
  return {
    baseMet: Number(categoryMeta?.baseMet ?? categoryMeta?.base_met ?? fallback.baseMet),
    xpPerMetMin: Number(categoryMeta?.xpPerMetMin ?? categoryMeta?.xp_per_met_min ?? fallback.xpPerMetMin),
    family: fallback.family || slug
  };
}

/**
 * Calculates MET for cardio workouts with distance-aware speed bands.
 * @param {string} slug Category slug.
 * @param {number} distanceKm Distance in kilometres.
 * @param {number} durationMin Duration in minutes.
 * @param {number} fallbackMet Category fallback MET.
 * @returns {number}
 */
function calculateMet(slug, distanceKm, durationMin, fallbackMet) {
  const speed = durationMin > 0 ? distanceKm / (durationMin / 60) : 0;

  if (slug === "running" || slug === "cardio") {
    if (speed >= 14) return 12.51;
    if (speed >= 12) return 11;
    if (speed >= 10) return 10;
    if (speed >= 8) return 8.29;
    return distanceKm > 0 ? 7 : fallbackMet;
  }

  if (slug === "cycling") {
    if (speed >= 25) return 12;
    if (speed >= 20) return 8;
    if (speed > 15) return 6;
    if (speed >= 10) return 4;
    return 3.5;
  }

  if (slug === "walking") {
    if (speed >= 6.5) return 5;
    if (speed >= 5) return 3.8;
    return 3.5;
  }

  return fallbackMet;
}

/**
 * Calculates workout calories server-side using MET, weight, and duration.
 * @param {object} workout Workout payload.
 * @param {number} weightKg User weight in kilograms.
 * @param {object} options Optional category metadata.
 * @returns {number}
 */
function calculateCalories(workout, weightKg = DEFAULT_WEIGHT_KG, options = {}) {
  const slug = getCategorySlug(workout);
  const profile = resolveCategoryProfile(slug, options.categoryMeta);
  const durationMin = getDurationMinutes(workout);
  const distanceKm = getDistanceKm(workout);
  const met = options.met || calculateMet(slug, distanceKm, durationMin, profile.baseMet);
  return Math.round(met * Number(weightKg || DEFAULT_WEIGHT_KG) * (durationMin / 60));
}

let activityLibrary = [];
try {
  const fs = require('fs');
  const path = require('path');
  const seedPath = path.join(process.cwd(), 'database', 'seed', 'activity-library.json');
  if (fs.existsSync(seedPath)) {
    activityLibrary = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  } else {
    const altPath = path.join(process.cwd(), '..', 'database', 'seed', 'activity-library.json');
    if (fs.existsSync(altPath)) {
      activityLibrary = JSON.parse(fs.readFileSync(altPath, 'utf8'));
    }
  }
} catch (e) {
  // Ignore
}

function calculateWorkoutXp(workout, options = {}) {
  const minutes = Math.max(0, Number(workout.duration_min ?? workout.durationMin ?? workout.duration ?? 0) || 0);
  const slug = getCategorySlug(workout);
  const profile = resolveCategoryProfile(slug, options.categoryMeta);

  // 1. Get defaultMet fallback based on category
  let defaultMet = profile.baseMet;
  let activities = options.activities || activityLibrary || [];

  const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
  let foundMet = undefined;
  for (const ex of exercises) {
    const exName = String(ex.exerciseName || ex.name || "").toLowerCase().trim();
    const exLibId = ex.libraryId;
    let act = activities.find(a => (exLibId && a.id === exLibId) || (exName && (a.name.toLowerCase().trim() === exName || a.normalizedName === exName)));
    if (act && typeof act.defaultMet === 'number') {
      foundMet = act.defaultMet;
      break;
    }
  }
  if (foundMet !== undefined) {
    defaultMet = foundMet;
  }

  // 2. Base Completion XP
  const baseCompletionXp = 20;

  // 3. Duration XP
  const durationXp = minutes > 0 ? Math.min(minutes * 1.2, 90) : 0;

  // 4. Intensity XP
  const intensityXp = minutes > 0 ? Math.min(defaultMet * minutes * 0.15, 60) : 0;

  // 5. Performance Bonus
  let cardioBonus = 0;
  let strengthBonus = 0;
  let bodyweightBonus = 0;

  let distanceKm = Number(workout.distance_km ?? workout.distanceKm ?? workout.distance ?? 0) || 0;
  let totalVolumeKg = 0;
  let totalBodyweightRepsFactor = 0;

  for (const ex of exercises) {
    const exName = String(ex.exerciseName || ex.name || "").toLowerCase().trim();
    const exLibId = ex.libraryId;
    let act = activities.find(a => (exLibId && a.id === exLibId) || (exName && (a.name.toLowerCase().trim() === exName || a.normalizedName === exName)));

    const trackingType = String(act?.trackingType || ex.trackingType || "").toLowerCase().trim();
    const currentCategory = String(act?.categoryName || ex.categoryName || workout.category || workout.categorySlug || "").toLowerCase().trim();

    const isCardio = currentCategory.includes('cardio') || trackingType === 'duration_distance' || currentCategory.includes('run') || currentCategory.includes('cycle') || currentCategory.includes('walk') || currentCategory.includes('swim');
    const isStrength = currentCategory.includes('strength') || trackingType === 'sets_reps_weight' || currentCategory.includes('chest') || currentCategory.includes('back') || currentCategory.includes('leg') || currentCategory.includes('core');

    if (isCardio) {
      distanceKm += Number(ex.distance ?? ex.distance_km ?? 0) || 0;
    } else if (isStrength) {
      const bodyweightFactor = act?.bodyweightFactor !== undefined ? act.bodyweightFactor : ex.bodyweightFactor;
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      if (bodyweightFactor !== undefined && bodyweightFactor > 0) {
        const reps = sets.reduce((sum, set) => sum + (Number(set.reps) || 0), 0);
        totalBodyweightRepsFactor += reps * bodyweightFactor;
      } else {
        for (const set of sets) {
          const reps = Number(set.reps) || 0;
          const weight = Number(set.weight) || 0;
          totalVolumeKg += reps * weight;
        }
      }
    }
  }

  if (distanceKm > 0) {
    cardioBonus = Math.min(distanceKm * 4, 40);
  }
  if (totalVolumeKg > 0) {
    strengthBonus = Math.min(totalVolumeKg / 500, 40);
  }
  if (totalBodyweightRepsFactor > 0) {
    bodyweightBonus = Math.min(totalBodyweightRepsFactor * 0.25, 40);
  }

  const performanceBonus = Math.max(cardioBonus, strengthBonus, bodyweightBonus, 0);

  // 6. Streak Bonus
  const streak = options.streak !== undefined ? Number(options.streak) : 0;
  let streakBonus = 0;
  if (streak >= 7) {
    streakBonus = 25;
  } else if (streak >= 4) {
    streakBonus = 15;
  } else if (streak >= 2) {
    streakBonus = 10;
  }

  const finalXp = Math.round(baseCompletionXp + durationXp + intensityXp + performanceBonus + streakBonus);

  return {
    xpEarned: Math.max(0, finalXp),
    xpBreakdown: {
      baseCompletionXp,
      durationXp: Math.round(durationXp * 100) / 100,
      intensityXp: Math.round(intensityXp * 100) / 100,
      performanceBonus: Math.round(performanceBonus * 100) / 100,
      streakBonus,
      finalXp: Math.max(0, finalXp),
      method: "formula-v2"
    }
  };
}

/**
 * Calculates workout XP server-side using duration, distance, and category effort.
 * @param {object} workout Workout payload.
 * @param {object} options Optional category metadata and multiplier.
 * @returns {number}
 */
function calculateXP(workout, options = {}) {
  return calculateWorkoutXp(workout, options).xpEarned;
}

module.exports = {
  CATEGORY_PROFILES,
  calculateCalories,
  calculateMet,
  calculateXP,
  calculateWorkoutXp,
  getCategorySlug,
  getDistanceKm,
  getDurationMinutes,
  resolveCategoryProfile
};
