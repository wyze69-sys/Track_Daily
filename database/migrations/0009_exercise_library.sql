-- Migration 0009: Exercise library for FitSync V2 set-by-set logging.

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
);

INSERT INTO exercise_library
  (id, name, category_id, muscle_group, equipment, exercise_type, default_duration, is_custom)
VALUES
  ('libex_bench_press', 'Bench Press', 'cat_strength', 'Chest', 'Barbell', 'strength', 12, FALSE),
  ('libex_squat', 'Back Squat', 'cat_strength', 'Legs', 'Barbell', 'strength', 15, FALSE),
  ('libex_deadlift', 'Deadlift', 'cat_strength', 'Posterior Chain', 'Barbell', 'strength', 15, FALSE),
  ('libex_shoulder_press', 'Shoulder Press', 'cat_strength', 'Shoulders', 'Dumbbells', 'strength', 10, FALSE),
  ('libex_bent_over_row', 'Bent-Over Row', 'cat_strength', 'Back', 'Barbell', 'strength', 10, FALSE),
  ('libex_push_up', 'Push-Up', 'cat_strength', 'Chest', 'Bodyweight', 'strength', 8, FALSE),
  ('libex_pull_up', 'Pull-Up', 'cat_strength', 'Back', 'Bodyweight', 'strength', 8, FALSE),
  ('libex_plank', 'Plank', 'cat_mobility', 'Core', 'Bodyweight', 'mobility', 5, FALSE),
  ('libex_running', 'Outdoor Run', 'cat_cardio', 'Cardio', 'None', 'cardio', 30, FALSE),
  ('libex_cycling', 'Cycling', 'cat_cardio', 'Cardio', 'Bike', 'cardio', 30, FALSE),
  ('libex_jump_rope', 'Jump Rope', 'cat_hiit', 'Cardio', 'Rope', 'hiit', 10, FALSE),
  ('libex_yoga_flow', 'Yoga Flow', 'cat_yoga', 'Full Body', 'Mat', 'mobility', 25, FALSE)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  muscle_group = VALUES(muscle_group),
  equipment = VALUES(equipment),
  exercise_type = VALUES(exercise_type),
  default_duration = VALUES(default_duration),
  is_custom = FALSE;
