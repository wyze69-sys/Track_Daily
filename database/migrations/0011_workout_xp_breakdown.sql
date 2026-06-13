-- Migration 0011: Add xp_breakdown JSON column to workouts table.
-- Run this migration against the active logweb database connection.
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS xp_breakdown JSON NULL;
