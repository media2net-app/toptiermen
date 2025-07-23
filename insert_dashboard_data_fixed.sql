-- Insert Dashboard Data - Fixed Version
-- Run this SQL in your Supabase SQL editor to populate dashboard with realistic data

-- =====================================================
-- 1. INSERT USER GOALS
-- =====================================================

-- Rick's goals
INSERT INTO user_goals (user_id, title, description, category, target_value, current_value, unit, deadline, progress_percentage, is_active, is_primary)
VALUES 
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '10% Lichaamsvet Bereiken', 'Mijn doel is om 10% lichaamsvet te bereiken voor optimale gezondheid en fysieke prestaties', 'fitness', 10.0, 15.5, '%', '2024-04-01', 45, true, true),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '€100k Netto Waarde', 'Bouw mijn netto waarde op naar €100k voor financiële vrijheid', 'finance', 100000, 75000, '€', '2024-12-31', 75, true, false),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Dagelijkse Meditatie Streak', '30 dagen achter elkaar mediteren voor mentale helderheid', 'mindset', 30, 12, 'dagen', '2024-03-15', 40, true, false);

-- Chiel's goals
INSERT INTO user_goals (user_id, title, description, category, target_value, current_value, unit, deadline, progress_percentage, is_active, is_primary)
VALUES 
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', '100kg Deadlift', 'Mijn doel is om 100kg te kunnen deadliften', 'fitness', 100, 80, 'kg', '2024-05-01', 80, true, true),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', '€25k Sparen', 'Spaar €25k voor een huis', 'finance', 25000, 15000, '€', '2024-12-31', 60, true, false),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Lees 12 Boeken', 'Lees 12 boeken dit jaar voor persoonlijke ontwikkeling', 'mindset', 12, 3, 'boeken', '2024-12-31', 25, true, false);

-- =====================================================
-- 2. INSERT USER MISSIONS
-- =====================================================

-- Rick's missions
INSERT INTO user_missions (user_id, title, description, category, difficulty, points, status, due_date, completed_at)
VALUES 
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Doe 50 push-ups', 'Complete 50 push-ups in één sessie', 'daily', 'medium', 15, 'completed', CURRENT_DATE, NOW() - INTERVAL '2 hours'),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Mediteer 10 minuten', 'Mediteer 10 minuten voor mentale helderheid', 'daily', 'easy', 10, 'completed', CURRENT_DATE, NOW() - INTERVAL '1 hour'),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Lees 30 minuten', 'Lees 30 minuten uit een boek', 'daily', 'easy', 10, 'pending', CURRENT_DATE, NULL),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Neem een koude douche', 'Neem een koude douche voor discipline', 'daily', 'hard', 20, 'pending', CURRENT_DATE, NULL),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Maak je bed op', 'Begin de dag met discipline door je bed op te maken', 'daily', 'easy', 5, 'completed', CURRENT_DATE, NOW() - INTERVAL '30 minutes'),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Drink 2L water', 'Drink 2 liter water vandaag', 'daily', 'easy', 10, 'pending', CURRENT_DATE, NULL);

-- Chiel's missions
INSERT INTO user_missions (user_id, title, description, category, difficulty, points, status, due_date, completed_at)
VALUES 
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Doe 30 push-ups', 'Complete 30 push-ups in één sessie', 'daily', 'medium', 15, 'completed', CURRENT_DATE, NOW() - INTERVAL '3 hours'),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Mediteer 5 minuten', 'Mediteer 5 minuten voor focus', 'daily', 'easy', 10, 'completed', CURRENT_DATE, NOW() - INTERVAL '2 hours'),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Lees 20 minuten', 'Lees 20 minuten uit een boek', 'daily', 'easy', 10, 'pending', CURRENT_DATE, NULL),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', '10.000 stappen', 'Loop 10.000 stappen vandaag', 'daily', 'medium', 15, 'pending', CURRENT_DATE, NULL),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Maak je bed op', 'Begin de dag met discipline', 'daily', 'easy', 5, 'completed', CURRENT_DATE, NOW() - INTERVAL '1 hour'),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Drink 1.5L water', 'Drink 1.5 liter water vandaag', 'daily', 'easy', 10, 'pending', CURRENT_DATE, NULL);

-- =====================================================
-- 3. INSERT USER HABITS
-- =====================================================

-- Rick's habits
INSERT INTO user_habits (user_id, title, description, frequency, target_count, current_streak, longest_streak, total_completions, is_active)
VALUES 
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Dagelijkse meditatie', 'Mediteer elke dag voor mentale helderheid', 'daily', 1, 12, 30, 45, true),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '10.000 stappen', 'Loop elke dag 10.000 stappen', 'daily', 1, 5, 21, 67, true),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', '30 min lezen', 'Lees elke dag 30 minuten', 'daily', 1, 4, 14, 23, true),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Koude douche', 'Neem elke dag een koude douche', 'daily', 1, 8, 15, 28, true),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Bed opmaken', 'Maak elke dag je bed op', 'daily', 1, 25, 45, 67, true);

-- Chiel's habits
INSERT INTO user_habits (user_id, title, description, frequency, target_count, current_streak, longest_streak, total_completions, is_active)
VALUES 
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Dagelijkse meditatie', 'Mediteer elke dag voor focus', 'daily', 1, 7, 12, 18, true),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', '8.000 stappen', 'Loop elke dag 8.000 stappen', 'daily', 1, 3, 8, 15, true),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', '20 min lezen', 'Lees elke dag 20 minuten', 'daily', 1, 2, 5, 8, true),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Bed opmaken', 'Maak elke dag je bed op', 'daily', 1, 15, 20, 25, true);

-- =====================================================
-- 4. INSERT USER HABIT LOGS (Last 7 days)
-- =====================================================

-- Rick's habit logs for the last 7 days
INSERT INTO user_habit_logs (user_id, habit_id, completed_at, notes)
SELECT 
  '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c',
  h.id,
  CURRENT_DATE - INTERVAL '1 day' * gs.day_offset,
  'Completed habit'
FROM user_habits h
CROSS JOIN (SELECT generate_series(0, 6) as day_offset) gs
WHERE h.user_id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'
  AND h.title IN ('Dagelijkse meditatie', 'Bed opmaken')
  AND gs.day_offset <= 6;

-- Add some random completions for other habits
INSERT INTO user_habit_logs (user_id, habit_id, completed_at, notes)
SELECT 
  '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c',
  h.id,
  CURRENT_DATE - INTERVAL '1 day' * gs.day_offset,
  'Completed habit'
FROM user_habits h
CROSS JOIN (SELECT generate_series(0, 4) as day_offset) gs
WHERE h.user_id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'
  AND h.title = '10.000 stappen'
  AND gs.day_offset <= 4;

-- Chiel's habit logs for the last 7 days
INSERT INTO user_habit_logs (user_id, habit_id, completed_at, notes)
SELECT 
  '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
  h.id,
  CURRENT_DATE - INTERVAL '1 day' * gs.day_offset,
  'Completed habit'
FROM user_habits h
CROSS JOIN (SELECT generate_series(0, 6) as day_offset) gs
WHERE h.user_id = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'
  AND h.title IN ('Bed opmaken')
  AND gs.day_offset <= 6;

-- Add some random completions for other habits
INSERT INTO user_habit_logs (user_id, habit_id, completed_at, notes)
SELECT 
  '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
  h.id,
  CURRENT_DATE - INTERVAL '1 day' * gs.day_offset,
  'Completed habit'
FROM user_habits h
CROSS JOIN (SELECT generate_series(0, 6) as day_offset) gs
WHERE h.user_id = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'
  AND h.title = 'Dagelijkse meditatie'
  AND gs.day_offset <= 6;

-- =====================================================
-- 5. INSERT USER ONBOARDING STATUS
-- =====================================================

-- Rick's onboarding status (completed)
INSERT INTO user_onboarding_status (user_id, welcome_video_shown, onboarding_completed, goal_set, missions_selected, training_schema_selected, nutrition_plan_selected, challenge_started, completed_steps)
VALUES 
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', true, true, true, true, true, true, true, '["goal", "missions", "training", "nutrition", "challenge"]');

-- Chiel's onboarding status (in progress)
INSERT INTO user_onboarding_status (user_id, welcome_video_shown, onboarding_completed, goal_set, missions_selected, training_schema_selected, nutrition_plan_selected, challenge_started, completed_steps)
VALUES 
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', true, false, true, true, false, false, false, '["goal", "missions"]');

-- =====================================================
-- 6. INSERT USER DAILY PROGRESS (Last 7 days)
-- =====================================================

-- Rick's daily progress for the last 7 days
INSERT INTO user_daily_progress (user_id, date, missions_completed, habits_completed, training_completed, nutrition_tracked, meditation_minutes, reading_minutes, steps_count, water_intake_liters, sleep_hours, mood_rating, notes)
VALUES 
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', CURRENT_DATE - INTERVAL '6 days', 4, 3, true, true, 10, 30, 8500, 2.0, 7.5, 8, 'Goede dag, veel energie'),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', CURRENT_DATE - INTERVAL '5 days', 5, 4, true, true, 15, 45, 12000, 2.5, 8.0, 9, 'Uitstekende dag, alle doelen behaald'),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', CURRENT_DATE - INTERVAL '4 days', 3, 2, false, true, 5, 20, 6000, 1.5, 6.5, 6, 'Moeilijke dag, weinig energie'),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', CURRENT_DATE - INTERVAL '3 days', 4, 3, true, true, 10, 35, 9500, 2.0, 7.0, 7, 'Herstel dag, voel me beter'),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', CURRENT_DATE - INTERVAL '2 days', 5, 4, true, true, 15, 40, 11000, 2.5, 7.5, 8, 'Productieve dag'),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', CURRENT_DATE - INTERVAL '1 day', 4, 3, true, true, 10, 30, 9000, 2.0, 7.0, 7, 'Stabiele dag'),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', CURRENT_DATE, 2, 2, false, false, 10, 0, 0, 0.5, 0, 5, 'Dag nog niet afgelopen');

-- Chiel's daily progress for the last 7 days
INSERT INTO user_daily_progress (user_id, date, missions_completed, habits_completed, training_completed, nutrition_tracked, meditation_minutes, reading_minutes, steps_count, water_intake_liters, sleep_hours, mood_rating, notes)
VALUES 
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', CURRENT_DATE - INTERVAL '6 days', 3, 2, false, false, 5, 20, 7000, 1.5, 7.0, 7, 'Eerste dag, nog aan het wennen'),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', CURRENT_DATE - INTERVAL '5 days', 4, 3, true, true, 5, 25, 8500, 2.0, 7.5, 8, 'Beter dan gisteren'),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', CURRENT_DATE - INTERVAL '4 days', 2, 1, false, false, 0, 0, 4000, 1.0, 6.0, 5, 'Moeilijke dag'),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', CURRENT_DATE - INTERVAL '3 days', 3, 2, false, true, 5, 15, 6000, 1.5, 7.0, 6, 'Langzaam herstel'),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', CURRENT_DATE - INTERVAL '2 days', 4, 3, true, true, 5, 20, 8000, 2.0, 7.5, 7, 'Goede dag'),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', CURRENT_DATE - INTERVAL '1 day', 3, 2, false, true, 5, 15, 7500, 1.5, 7.0, 7, 'Stabiel'),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', CURRENT_DATE, 2, 1, false, false, 5, 0, 0, 0.5, 0, 5, 'Dag nog niet afgelopen');

-- =====================================================
-- 7. INSERT USER WEEKLY STATS (Last 4 weeks)
-- =====================================================

-- Rick's weekly stats
INSERT INTO user_weekly_stats (user_id, week_start_date, missions_completed, habits_completed, training_sessions, meditation_minutes, reading_minutes, total_steps, average_mood, points_earned)
VALUES 
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', CURRENT_DATE - INTERVAL '4 weeks', 28, 25, 5, 70, 210, 70000, 7.5, 280),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', CURRENT_DATE - INTERVAL '3 weeks', 30, 28, 6, 75, 225, 75000, 8.0, 300),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', CURRENT_DATE - INTERVAL '2 weeks', 25, 22, 4, 60, 180, 65000, 7.0, 250),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', CURRENT_DATE - INTERVAL '1 week', 29, 26, 5, 70, 210, 72000, 7.8, 290);

-- Chiel's weekly stats
INSERT INTO user_weekly_stats (user_id, week_start_date, missions_completed, habits_completed, training_sessions, meditation_minutes, reading_minutes, total_steps, average_mood, points_earned)
VALUES 
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', CURRENT_DATE - INTERVAL '4 weeks', 15, 10, 2, 20, 60, 40000, 6.0, 150),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', CURRENT_DATE - INTERVAL '3 weeks', 18, 12, 3, 25, 75, 45000, 6.5, 180),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', CURRENT_DATE - INTERVAL '2 weeks', 20, 15, 3, 30, 90, 50000, 7.0, 200),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', CURRENT_DATE - INTERVAL '1 week', 22, 18, 4, 35, 105, 55000, 7.2, 220);

-- =====================================================
-- 8. INSERT USER ACHIEVEMENTS
-- =====================================================

-- Rick's achievements
INSERT INTO user_achievements (user_id, achievement_type, title, description, icon, metadata)
VALUES 
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'streak', '7-Day Meditation Streak', 'Mediteerde 7 dagen achter elkaar', '🧘‍♂️', '{"streak_length": 7, "habit": "meditation"}'),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'streak', '30-Day Bed Making Streak', 'Maakte 30 dagen achter elkaar zijn bed op', '🛏️', '{"streak_length": 30, "habit": "bed_making"}'),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'milestone', '100 Missions Completed', 'Voltooide 100 missies', '🎯', '{"total_missions": 100}'),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'badge', 'Discipline Master', 'Toonde uitzonderlijke discipline', '🏆', '{"category": "discipline"}');

-- Chiel's achievements
INSERT INTO user_achievements (user_id, achievement_type, title, description, icon, metadata)
VALUES 
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'streak', '5-Day Meditation Streak', 'Mediteerde 5 dagen achter elkaar', '🧘‍♂️', '{"streak_length": 5, "habit": "meditation"}'),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'streak', '50 Missions Completed', 'Voltooide 50 missies', '🎯', '{"total_missions": 50}'),
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'badge', 'Consistency Rookie', 'Toonde goede consistentie', '🌟', '{"category": "consistency"}');

-- =====================================================
-- 9. INSERT USER CHALLENGES
-- =====================================================

-- Rick's challenges
INSERT INTO user_challenges (user_id, challenge_name, description, challenge_type, target_value, current_value, start_date, end_date, status)
VALUES 
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Push-up Challenge', 'Doe elke dag push-ups, beginnend met 10 en elke dag 5 extra', 'push_ups', 100, 75, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '5 days', 'active'),
  ('9d6aa8ba-58ab-4188-9a9f-09380a67eb0c', 'Plank Challenge', 'Houd elke dag een plank, beginnend met 30 seconden', 'plank', 300, 180, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '10 days', 'active');

-- Chiel's challenges
INSERT INTO user_challenges (user_id, challenge_name, description, challenge_type, target_value, current_value, start_date, end_date, status)
VALUES 
  ('061e43d5-c89a-42bb-8a4c-04be2ce99a7e', 'Squat Challenge', 'Doe elke dag squats, beginnend met 20 en elke dag 5 extra', 'squats', 50, 35, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '13 days', 'active');

-- =====================================================
-- 10. INSERT USER CHALLENGE LOGS
-- =====================================================

-- Rick's challenge logs
INSERT INTO user_challenge_logs (user_id, challenge_id, value, notes)
SELECT 
  '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c',
  c.id,
  10 + (gs.day_offset * 5),
  'Challenge day ' || (gs.day_offset + 1)
FROM user_challenges c
CROSS JOIN (SELECT generate_series(0, 14) as day_offset) gs
WHERE c.user_id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'
  AND c.challenge_name = 'Push-up Challenge'
  AND gs.day_offset <= 14;

-- Chiel's challenge logs
INSERT INTO user_challenge_logs (user_id, challenge_id, value, notes)
SELECT 
  '061e43d5-c89a-42bb-8a4c-04be2ce99a7e',
  c.id,
  20 + (gs.day_offset * 5),
  'Challenge day ' || (gs.day_offset + 1)
FROM user_challenges c
CROSS JOIN (SELECT generate_series(0, 6) as day_offset) gs
WHERE c.user_id = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'
  AND c.challenge_name = 'Squat Challenge'
  AND gs.day_offset <= 6;

-- =====================================================
-- 11. UPDATE USER PROFILES WITH DASHBOARD DATA
-- =====================================================

-- Update Rick's profile with dashboard data
UPDATE profiles 
SET 
  points = 1250,
  missions_completed = 156,
  rank = 'Elite'
WHERE id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';

-- Update Chiel's profile with dashboard data
UPDATE profiles 
SET 
  points = 450,
  missions_completed = 67,
  rank = 'Intermediate'
WHERE id = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'; 