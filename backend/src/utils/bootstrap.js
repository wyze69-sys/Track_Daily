const mysql = require("mysql2/promise");
const pool = require("../config/db");

async function ensureDatabaseExists() {
  const database = process.env.DB_NAME || "logweb";
  const safeDatabase = database.replace(/`/g, "");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 8889),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${safeDatabase}\``);
  await connection.end();
}

async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
      password_hash VARCHAR(255) NOT NULL,
      age INT,
      gender VARCHAR(50),
      height DECIMAL(5,2),
      weight DECIMAL(5,2),
      weight_kg DECIMAL(5,2),
      total_xp INT NOT NULL DEFAULT 0,
      target_weight DECIMAL(5,2),
      preferred_workout_type VARCHAR(50),
      goal VARCHAR(255) DEFAULT 'Maintain fitness',
      activity_level VARCHAR(255) DEFAULT 'Sedentary',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS exercise_categories (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT NOT NULL,
      slug VARCHAR(80) UNIQUE,
      base_met DECIMAL(4,2) NOT NULL DEFAULT 3.50,
      xp_per_met_min DECIMAL(5,3) NOT NULL DEFAULT 0.200,
      is_custom BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS workouts (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      title VARCHAR(255) NOT NULL,
      duration_total INT NOT NULL DEFAULT 0,
      calories_total INT NOT NULL DEFAULT 0,
      calories_burned INT,
      calories INT,
      xp INT NOT NULL DEFAULT 0,
      intensity ENUM('low','med','high') NOT NULL DEFAULT 'med',
      calories_source ENUM('auto','manual') NOT NULL DEFAULT 'auto',
      user_weight_at_log DECIMAL(5,2),
      notes TEXT,
      mood VARCHAR(50) NULL,
      template_id VARCHAR(50) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_workouts_user_date (user_id, date)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id VARCHAR(50) PRIMARY KEY,
      workout_id VARCHAR(50) NOT NULL,
      category_id VARCHAR(50),
      category_name VARCHAR(255),
      exercise_name VARCHAR(255) NOT NULL,
      duration INT NOT NULL DEFAULT 0,
      calories_burned INT NOT NULL DEFAULT 0,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES exercise_categories(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS workout_sets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      exercise_id VARCHAR(50) NOT NULL,
      reps INT NOT NULL DEFAULT 0,
      weight DECIMAL(6,2) NOT NULL DEFAULT 0.00,
      FOREIGN KEY (exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS weight_logs (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      weight DECIMAL(5,2) NOT NULL,
      bmi DECIMAL(4,1) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_weight_user_date (user_id, date)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_insights (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      date_generated DATE NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      workout_count INT NOT NULL DEFAULT 0,
      total_calories INT NOT NULL DEFAULT 0,
      total_minutes INT NOT NULL DEFAULT 0,
      bmi_value DECIMAL(4,1) NOT NULL,
      current_weight DECIMAL(5,2) NOT NULL,
      summary TEXT NOT NULL,
      recommendations JSON NOT NULL,
      goal_progress TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_insights_user_created (user_id, created_at)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_checkins (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'Wellness check-in',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_checkin_user_date (user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS achievements (
      code VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description VARCHAR(500) NOT NULL,
      requirement_type VARCHAR(30) NOT NULL DEFAULT 'streak',
      requirement_value INT NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0,
      icon VARCHAR(80) NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      achievement_code VARCHAR(50) NOT NULL,
      unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_user_achievement (user_id, achievement_code),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (achievement_code) REFERENCES achievements(code) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_streaks (
      user_id VARCHAR(50) PRIMARY KEY,
      current_streak INT NOT NULL DEFAULT 0,
      longest_streak INT NOT NULL DEFAULT 0,
      last_active_date DATE,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_gamification (
      user_id VARCHAR(50) PRIMARY KEY,
      total_xp INT NOT NULL DEFAULT 0,
      level INT NOT NULL DEFAULT 1,
      next_level_xp INT NOT NULL DEFAULT 150,
      current_streak INT NOT NULL DEFAULT 0,
      longest_streak INT NOT NULL DEFAULT 0,
      last_active_date DATE,
      last_workout_date DATE,
      weekly_freezes_used INT NOT NULL DEFAULT 0,
      streak_freeze_used BOOLEAN NOT NULL DEFAULT FALSE,
      last_freeze_week VARCHAR(16),
      weekly_streak INT NOT NULL DEFAULT 0,
      weekly_longest_streak INT NOT NULL DEFAULT 0,
      streak_freezes TINYINT NOT NULL DEFAULT 2,
      paid_restores_this_month TINYINT NOT NULL DEFAULT 0,
      last_freeze_reset DATE NULL,
      last_counted_week_start DATE NULL,
      at_risk_week_start DATE NULL,
      restore_deadline DATETIME NULL,
      streak_status ENUM('active', 'at_risk', 'broken') NOT NULL DEFAULT 'active',
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS levels (
      id VARCHAR(50) PRIMARY KEY,
      level_number INT NOT NULL UNIQUE,
      xp_required INT NOT NULL,
      badge_unlock VARCHAR(50),
      title VARCHAR(255) NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS weekly_plans (
      user_id VARCHAR(50) PRIMARY KEY,
      target_count INT NOT NULL DEFAULT 3,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS xp_logs (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      workout_id VARCHAR(50),
      xp_earned INT NOT NULL,
      reason VARCHAR(255) NOT NULL,
      breakdown JSON,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL,
      INDEX idx_xp_logs_user_created (user_id, created_at)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS workout_templates (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category_id VARCHAR(50) NULL,
      category_name VARCHAR(255) NOT NULL,
      subtype VARCHAR(255) NULL,
      duration_min INT NOT NULL DEFAULT 30,
      exercises JSON NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INT NOT NULL DEFAULT 0,
      created_by VARCHAR(50) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_templates_category FOREIGN KEY (category_id) REFERENCES exercise_categories(id) ON DELETE SET NULL,
      CONSTRAINT fk_templates_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS exercise_library (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category_id VARCHAR(50) NULL,
      muscle_group VARCHAR(80) NOT NULL DEFAULT 'General',
      equipment VARCHAR(120) NOT NULL DEFAULT 'Bodyweight',
      exercise_type VARCHAR(50) NOT NULL DEFAULT 'strength',
      default_duration INT NOT NULL DEFAULT 10,
      is_custom BOOLEAN NOT NULL DEFAULT FALSE,
      created_by VARCHAR(50) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_exercise_library_name (name),
      INDEX idx_exercise_library_category (category_id),
      INDEX idx_exercise_library_muscle (muscle_group),
      CONSTRAINT fk_library_category FOREIGN KEY (category_id) REFERENCES exercise_categories(id) ON DELETE SET NULL,
      CONSTRAINT fk_library_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS challenges (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      challenge_type VARCHAR(50) NOT NULL,
      target_value INT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reward_xp INT NOT NULL DEFAULT 0,
      badge_code VARCHAR(50) NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_by VARCHAR(50) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_challenges_badge FOREIGN KEY (badge_code) REFERENCES achievements(code) ON DELETE SET NULL,
      CONSTRAINT fk_challenges_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      audience ENUM('all','users','admins') NOT NULL DEFAULT 'users',
      placement VARCHAR(50) NOT NULL DEFAULT 'dashboard',
      start_at DATETIME NULL,
      end_at DATETIME NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_by VARCHAR(50) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_announcements_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_feedback (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NULL,
      type ENUM('bug', 'feature', 'general') NOT NULL DEFAULT 'general',
      subject VARCHAR(255) NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      status ENUM('new', 'in_progress', 'resolved', 'archived') NOT NULL DEFAULT 'new',
      admin_note TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_feedback_status (status),
      INDEX idx_feedback_type (type),
      INDEX idx_feedback_user (user_id),
      CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS weekly_plans (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      target_count INT NOT NULL DEFAULT 3,
      current_count INT NOT NULL DEFAULT 0,
      week_start_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_user_week (user_id, week_start_date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_challenges (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL,
      challenge_id VARCHAR(50) NOT NULL,
      progress INT NOT NULL DEFAULT 0,
      status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_user_challenge (user_id, challenge_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
    )
  `);
}


/**
 * Idempotent, information_schema-driven upgrades for databases created before
 * newer columns existed. This replaces blind "ALTER TABLE" statements that ran
 * on every boot and only performs work when something is genuinely missing.
 */
async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return Number(rows[0].total) > 0;
}

async function ensureColumn(table, column, definition) {
  if (!(await columnExists(table, column))) {
    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
  }
}

async function applySchemaUpgrades() {
  await ensureColumn("users", "total_xp", "total_xp INT NOT NULL DEFAULT 0");
  await ensureColumn("users", "target_weight", "target_weight DECIMAL(5,2)");
  await ensureColumn("users", "weight_kg", "weight_kg DECIMAL(5,2)");
  await ensureColumn("users", "preferred_workout_type", "preferred_workout_type VARCHAR(50)");
  await ensureColumn("users", "is_active", "is_active BOOLEAN NOT NULL DEFAULT TRUE");
  await ensureColumn(
    "users",
    "updated_at",
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );
  await ensureColumn("exercise_categories", "slug", "slug VARCHAR(80) UNIQUE");
  await ensureColumn("exercise_categories", "base_met", "base_met DECIMAL(4,2) NOT NULL DEFAULT 3.50");
  await ensureColumn(
    "exercise_categories",
    "xp_per_met_min",
    "xp_per_met_min DECIMAL(5,3) NOT NULL DEFAULT 0.200"
  );
  await ensureColumn(
    "exercise_categories",
    "created_at",
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"
  );
  await ensureColumn(
    "exercise_categories",
    "updated_at",
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );
  await ensureColumn("workouts", "calories_burned", "calories_burned INT");
  await ensureColumn("workouts", "calories", "calories INT");
  await ensureColumn("workouts", "xp", "xp INT NOT NULL DEFAULT 0");
  await ensureColumn("workouts", "intensity", "intensity ENUM('low','med','high') NOT NULL DEFAULT 'med'");
  await ensureColumn(
    "workouts",
    "calories_source",
    "calories_source ENUM('auto','manual') NOT NULL DEFAULT 'auto'"
  );
  await ensureColumn("workouts", "user_weight_at_log", "user_weight_at_log DECIMAL(5,2)");
  await ensureColumn("user_gamification", "next_level_xp", "next_level_xp INT NOT NULL DEFAULT 150");
  await ensureColumn("user_gamification", "last_active_date", "last_active_date DATE");
  await ensureColumn("user_gamification", "last_workout_date", "last_workout_date DATE");
  await ensureColumn("user_gamification", "weekly_freezes_used", "weekly_freezes_used INT NOT NULL DEFAULT 0");
  await ensureColumn("user_gamification", "streak_freeze_used", "streak_freeze_used BOOLEAN NOT NULL DEFAULT FALSE");
  await ensureColumn("user_gamification", "last_freeze_week", "last_freeze_week VARCHAR(16)");
  await ensureColumn("user_gamification", "weekly_streak", "weekly_streak INT NOT NULL DEFAULT 0");
  await ensureColumn("user_gamification", "weekly_longest_streak", "weekly_longest_streak INT NOT NULL DEFAULT 0");
  await ensureColumn("user_gamification", "streak_freezes", "streak_freezes TINYINT NOT NULL DEFAULT 2");
  await ensureColumn("user_gamification", "paid_restores_this_month", "paid_restores_this_month TINYINT NOT NULL DEFAULT 0");
  await ensureColumn("user_gamification", "last_freeze_reset", "last_freeze_reset DATE NULL");
  await ensureColumn("user_gamification", "last_counted_week_start", "last_counted_week_start DATE NULL");
  await ensureColumn("user_gamification", "at_risk_week_start", "at_risk_week_start DATE NULL");
  await ensureColumn("user_gamification", "restore_deadline", "restore_deadline DATETIME NULL");
  await ensureColumn("user_gamification", "streak_status", "streak_status ENUM('active', 'at_risk', 'broken') NOT NULL DEFAULT 'active'");

  await pool.query(`
    UPDATE user_gamification
    SET 
      weekly_streak = IF(COALESCE(weekly_streak, 0) = 0, COALESCE(current_streak, 0), weekly_streak),
      weekly_longest_streak = IF(COALESCE(weekly_longest_streak, 0) = 0, COALESCE(longest_streak, 0), weekly_longest_streak),
      streak_freezes = COALESCE(streak_freezes, 2),
      paid_restores_this_month = COALESCE(paid_restores_this_month, 0),
      streak_status = COALESCE(streak_status, 'active')
  `);

  await ensureColumn("achievements", "icon", "icon VARCHAR(80) NULL");
  await ensureColumn("achievements", "is_active", "is_active BOOLEAN NOT NULL DEFAULT TRUE");
  await ensureColumn("achievements", "updated_at", "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

  await ensureColumn(
    "workouts",
    "updated_at",
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );
  await ensureColumn("workouts", "mood", "mood VARCHAR(50) NULL");
  await ensureColumn("workouts", "template_id", "template_id VARCHAR(50) NULL");
  await ensureColumn("workouts", "xp_breakdown", "xp_breakdown JSON NULL");
}

async function seedCategories() {
  const categories = [
    ["cat_cardio", "Cardio", "Running, cycling, rowing, walking, and swimming.", "cardio", 7.5, 0.18, false],
    ["cat_strength", "Strength", "Free weights, machines, bodyweight strength, and core lifts.", "strength", 6.0, 0.2, false],
    ["cat_hiit", "HIIT", "Intervals, circuits, bootcamp blocks, and high-output conditioning.", "hiit", 8.0, 0.22, false],
    ["cat_yoga", "Yoga", "Vinyasa, hatha, restorative yoga, and breath-led flow.", "yoga", 4.0, 0.25, false],
    ["cat_mobility", "Mobility", "Stretching, rehab drills, foam rolling, and joint prep.", "mobility", 2.8, 0.22, false],
    ["cat_sports", "Sports", "Basketball, soccer, tennis, climbing, and recreational games.", "sports", 7.0, 0.2, false]
  ];
  const categoryIds = categories.map((category) => category[0]);

  await pool.execute(
    `DELETE FROM exercise_categories WHERE id NOT IN (${categoryIds.map(() => "?").join(", ")})`,
    categoryIds
  );

  for (const category of categories) {
    await pool.execute(
      `INSERT INTO exercise_categories (id, name, description, slug, base_met, xp_per_met_min, is_custom)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         description = VALUES(description),
         slug = VALUES(slug),
         base_met = VALUES(base_met),
         xp_per_met_min = VALUES(xp_per_met_min),
         is_custom = VALUES(is_custom)`,
      category
    );
  }
}

async function seedExerciseLibrary() {
  const exercises = [
    ["libex_bench_press", "Bench Press", "cat_strength", "Chest", "Barbell", "strength", 12],
    ["libex_squat", "Back Squat", "cat_strength", "Legs", "Barbell", "strength", 15],
    ["libex_deadlift", "Deadlift", "cat_strength", "Posterior Chain", "Barbell", "strength", 15],
    ["libex_shoulder_press", "Shoulder Press", "cat_strength", "Shoulders", "Dumbbells", "strength", 10],
    ["libex_bent_over_row", "Bent-Over Row", "cat_strength", "Back", "Barbell", "strength", 10],
    ["libex_push_up", "Push-Up", "cat_strength", "Chest", "Bodyweight", "strength", 8],
    ["libex_pull_up", "Pull-Up", "cat_strength", "Back", "Bodyweight", "strength", 8],
    ["libex_plank", "Plank", "cat_mobility", "Core", "Bodyweight", "mobility", 5],
    ["libex_running", "Outdoor Run", "cat_cardio", "Cardio", "None", "cardio", 30],
    ["libex_cycling", "Cycling", "cat_cardio", "Cardio", "Bike", "cardio", 30],
    ["libex_jump_rope", "Jump Rope", "cat_hiit", "Cardio", "Rope", "hiit", 10],
    ["libex_yoga_flow", "Yoga Flow", "cat_yoga", "Full Body", "Mat", "mobility", 25]
  ];

  for (const exercise of exercises) {
    await pool.execute(
      `INSERT INTO exercise_library
        (id, name, category_id, muscle_group, equipment, exercise_type, default_duration, is_custom)
       VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)
       ON DUPLICATE KEY UPDATE
         category_id = VALUES(category_id),
         muscle_group = VALUES(muscle_group),
         equipment = VALUES(equipment),
         exercise_type = VALUES(exercise_type),
         default_duration = VALUES(default_duration),
         is_custom = FALSE`,
      exercise
    );
  }
}

async function seedLevels() {
  const levels = [
    ["lvl_1", 1, 0, "level_1", "Starter"],
    ["lvl_2", 2, 190, "level_2", "Warm Up"],
    ["lvl_3", 3, 500, "level_3", "Builder"],
    ["lvl_4", 4, 960, "level_4", "Regular"],
    ["lvl_5", 5, 1600, "level_5", "Momentum"],
    ["lvl_6", 6, 2450, "level_6", "Athlete"],
    ["lvl_7", 7, 3540, "level_7", "Specialist"],
    ["lvl_8", 8, 4900, "level_8", "Pro"],
    ["lvl_9", 9, 6560, "level_9", "Elite"],
    ["lvl_10", 10, 8550, "level_10", "Legend"]
  ];

  for (const level of levels) {
    await pool.execute(
      `INSERT INTO levels (id, level_number, xp_required, badge_unlock, title)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         xp_required = VALUES(xp_required),
         badge_unlock = VALUES(badge_unlock),
         title = VALUES(title)`,
      level
    );
  }
}


async function seedAchievements() {
  const achievements = [
    ["streak_3", "Three Day Start", "Maintained a 3-day activity streak.", "streak", 3, 1],
    ["streak_7", "One Week Streak", "Maintained a 7-day activity streak.", "streak", 7, 2],
    ["streak_14", "Two Week Habit", "Maintained a 14-day activity streak.", "streak", 14, 3],
    ["streak_30", "Thirty Day Streak", "Maintained a 30-day activity streak.", "streak", 30, 4]
  ];

  for (const achievement of achievements) {
    await pool.execute(
      `INSERT INTO achievements (code, name, description, requirement_type, requirement_value, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         description = VALUES(description),
         requirement_type = VALUES(requirement_type),
         requirement_value = VALUES(requirement_value),
         sort_order = VALUES(sort_order)`,
      achievement
    );
  }
}

async function seedUserGamificationRows() {
  await pool.execute(
    `INSERT IGNORE INTO user_gamification (user_id, total_xp, level, next_level_xp)
     SELECT id, COALESCE(total_xp, 0), 1, 190 FROM users`
  );
}

async function seedDefaults() {
  await seedCategories();
  await seedExerciseLibrary();
  await seedLevels();
  await seedAchievements();
  await seedUserGamificationRows();
}

async function initializeDatabase() {
  await ensureDatabaseExists();
  await createTables();
  await applySchemaUpgrades();
  await seedDefaults();
}

module.exports = { initializeDatabase };
