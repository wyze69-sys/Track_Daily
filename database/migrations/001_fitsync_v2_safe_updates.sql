-- FitSync v2 Safe Schema Upgrades Migration
-- Safe incremental updates using ALTER TABLE with column checks (simulated / manual reference)

-- 1. Users Table Columns
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `total_xp` INT NOT NULL DEFAULT 0;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `target_weight` DECIMAL(5,2) NULL;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `weight_kg` DECIMAL(5,2) NULL;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `preferred_workout_type` VARCHAR(50) NULL;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `is_active` BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. Exercise Categories Table Columns
ALTER TABLE `exercise_categories` ADD COLUMN IF NOT EXISTS `slug` VARCHAR(80) UNIQUE NULL;
ALTER TABLE `exercise_categories` ADD COLUMN IF NOT EXISTS `base_met` DECIMAL(4,2) NOT NULL DEFAULT 3.50;
ALTER TABLE `exercise_categories` ADD COLUMN IF NOT EXISTS `xp_per_met_min` DECIMAL(5,3) NOT NULL DEFAULT 0.200;
ALTER TABLE `exercise_categories` ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE `exercise_categories` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 3. Workouts Table Columns
ALTER TABLE `workouts` ADD COLUMN IF NOT EXISTS `calories_burned` INT NULL;
ALTER TABLE `workouts` ADD COLUMN IF NOT EXISTS `calories` INT NULL;
ALTER TABLE `workouts` ADD COLUMN IF NOT EXISTS `xp` INT NOT NULL DEFAULT 0;
ALTER TABLE `workouts` ADD COLUMN IF NOT EXISTS `intensity` ENUM('low','med','high') NOT NULL DEFAULT 'med';
ALTER TABLE `workouts` ADD COLUMN IF NOT EXISTS `calories_source` ENUM('auto','manual') NOT NULL DEFAULT 'auto';
ALTER TABLE `workouts` ADD COLUMN IF NOT EXISTS `user_weight_at_log` DECIMAL(5,2) NULL;
ALTER TABLE `workouts` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE `workouts` ADD COLUMN IF NOT EXISTS `mood` VARCHAR(50) NULL;
ALTER TABLE `workouts` ADD COLUMN IF NOT EXISTS `template_id` VARCHAR(50) NULL;

-- 4. User Gamification Table Columns
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `next_level_xp` INT NOT NULL DEFAULT 150;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `last_active_date` DATE NULL;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `last_workout_date` DATE NULL;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `weekly_freezes_used` INT NOT NULL DEFAULT 0;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `streak_freeze_used` BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `last_freeze_week` VARCHAR(16) NULL;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `weekly_streak` INT NOT NULL DEFAULT 0;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `weekly_longest_streak` INT NOT NULL DEFAULT 0;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `streak_freezes` TINYINT NOT NULL DEFAULT 2;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `paid_restores_this_month` TINYINT NOT NULL DEFAULT 0;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `last_freeze_reset` DATE NULL;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `last_counted_week_start` DATE NULL;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `at_risk_week_start` DATE NULL;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `restore_deadline` DATETIME NULL;
ALTER TABLE `user_gamification` ADD COLUMN IF NOT EXISTS `streak_status` ENUM('active', 'at_risk', 'broken') NOT NULL DEFAULT 'active';

-- 5. Achievements Table Columns
ALTER TABLE `achievements` ADD COLUMN IF NOT EXISTS `icon` VARCHAR(80) NULL;
ALTER TABLE `achievements` ADD COLUMN IF NOT EXISTS `is_active` BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE `achievements` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
