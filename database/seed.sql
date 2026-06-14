USE track_daily;

-- Production workout category catalog. Keep this list to exactly six defaults.
DELETE FROM exercise_categories
WHERE id NOT IN ('cat_cardio', 'cat_strength', 'cat_hiit', 'cat_yoga', 'cat_mobility', 'cat_sports');

INSERT INTO exercise_categories (id, name, description, slug, base_met, xp_per_met_min, is_custom) VALUES
('cat_cardio', 'Cardio', 'Running, cycling, rowing, walking, and swimming.', 'cardio', 7.50, 0.180, FALSE),
('cat_strength', 'Strength', 'Free weights, machines, bodyweight strength, and core lifts.', 'strength', 6.00, 0.200, FALSE),
('cat_hiit', 'HIIT', 'Intervals, circuits, bootcamp blocks, and high-output conditioning.', 'hiit', 8.00, 0.220, FALSE),
('cat_yoga', 'Yoga', 'Vinyasa, hatha, restorative yoga, and breath-led flow.', 'yoga', 4.00, 0.250, FALSE),
('cat_mobility', 'Mobility', 'Stretching, rehab drills, foam rolling, and joint prep.', 'mobility', 2.80, 0.220, FALSE),
('cat_sports', 'Sports', 'Basketball, soccer, tennis, climbing, and recreational games.', 'sports', 7.00, 0.200, FALSE)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    slug = VALUES(slug),
    base_met = VALUES(base_met),
    xp_per_met_min = VALUES(xp_per_met_min),
    is_custom = FALSE;

INSERT INTO levels (id, level_number, xp_required, badge_unlock, title) VALUES
('lvl_1', 1, 0, 'level_1', 'Starter'),
('lvl_2', 2, 150, 'level_2', 'Warm Up'),
('lvl_3', 3, 350, 'level_3', 'Builder'),
('lvl_4', 4, 600, 'level_4', 'Regular'),
('lvl_5', 5, 900, 'level_5', 'Momentum'),
('lvl_6', 6, 1250, 'level_6', 'Athlete'),
('lvl_7', 7, 1650, 'level_7', 'Specialist'),
('lvl_8', 8, 2100, 'level_8', 'Pro'),
('lvl_9', 9, 2600, 'level_9', 'Elite'),
('lvl_10', 10, 3150, 'level_10', 'Legend')
ON DUPLICATE KEY UPDATE
    xp_required = VALUES(xp_required),
    badge_unlock = VALUES(badge_unlock),
    title = VALUES(title);

-- Achievement (badge) catalog used by the gamification/streak system.
INSERT INTO achievements (code, name, description, requirement_type, requirement_value, sort_order) VALUES
('streak_3', 'Three Day Start', 'Maintained a 3-day activity streak.', 'streak', 3, 1),
('streak_7', 'One Week Streak', 'Maintained a 7-day activity streak.', 'streak', 7, 2),
('streak_14', 'Two Week Habit', 'Maintained a 14-day activity streak.', 'streak', 14, 3),
('streak_30', 'Thirty Day Streak', 'Maintained a 30-day activity streak.', 'streak', 30, 4)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    requirement_type = VALUES(requirement_type),
    requirement_value = VALUES(requirement_value),
    sort_order = VALUES(sort_order);

-- Demo login accounts for local presentation/testing.
-- Passwords: admin@demo.com / Admin123!, user@demo.com / User123!
INSERT INTO users (
    id, email, name, role, password_hash, age, gender, height, weight,
    target_weight, preferred_workout_type, goal, activity_level, is_active
) VALUES
('demo-admin', 'admin@demo.com', 'Demo Admin', 'admin', '$2b$10$8jH4pE2cUqDiiz/k7gU5HedguYTPN3s26pDQox42dmkWeO9bfVq/G', NULL, NULL, NULL, NULL, NULL, NULL, 'Maintain fitness', 'Sedentary', TRUE),
('demo-user', 'user@demo.com', 'Demo User', 'user', '$2b$10$sPUSdsccOUReRG2Yo3IfCOvriINfPB1D/kNVLs62j7WXfFf1kxLtS', 21, 'other', 170, 70, NULL, NULL, 'Maintain fitness', 'Light', TRUE)
ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    name = VALUES(name),
    role = VALUES(role),
    password_hash = VALUES(password_hash),
    age = VALUES(age),
    gender = VALUES(gender),
    height = VALUES(height),
    weight = VALUES(weight),
    target_weight = VALUES(target_weight),
    preferred_workout_type = VALUES(preferred_workout_type),
    goal = VALUES(goal),
    activity_level = VALUES(activity_level),
    is_active = TRUE;

INSERT IGNORE INTO user_streaks (user_id, current_streak, longest_streak, last_active_date)
SELECT id, 0, 0, NULL
FROM users
WHERE id IN ('demo-admin', 'demo-user');

INSERT IGNORE INTO user_gamification (user_id, total_xp, level, next_level_xp)
SELECT id, 0, 1, 190
FROM users
WHERE id IN ('demo-admin', 'demo-user');
