-- Seed data for badges and ranks system
-- This creates sample data for testing

-- First, let's create sample data for the current user (Rick)
-- We'll use the user ID from the users table

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get Rick's user ID (adjust this query based on your users table structure)
  SELECT id INTO v_user_id FROM auth.users WHERE email LIKE '%rick%' OR email LIKE '%admin%' LIMIT 1;
  
  -- If no user found, use a default UUID (this should be replaced with actual user ID)
  IF v_user_id IS NULL THEN
    v_user_id := '550e8400-e29b-41d4-a716-446655440000'::UUID; -- placeholder
  END IF;
  
  -- Insert user XP data
  INSERT INTO user_xp (user_id, total_xp, current_rank_id, rank_achieved_at)
  VALUES (v_user_id, 4200, 3, NOW() - INTERVAL '30 days') -- Rank 3 = Disciplined
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = 4200,
    current_rank_id = 3,
    updated_at = NOW();
  
  -- Insert user streaks
  INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
  VALUES 
    (v_user_id, 'daily_login', 12, 17, CURRENT_DATE),
    (v_user_id, 'workout', 8, 15, CURRENT_DATE - INTERVAL '1 day'),
    (v_user_id, 'meditation', 5, 10, CURRENT_DATE)
  ON CONFLICT (user_id, streak_type) DO UPDATE SET
    current_streak = EXCLUDED.current_streak,
    longest_streak = EXCLUDED.longest_streak,
    last_activity_date = EXCLUDED.last_activity_date,
    updated_at = NOW();
  
  -- Insert user badges (some unlocked, some in progress, some locked)
  INSERT INTO user_badges (user_id, badge_id, status, unlocked_at, progress_data)
  VALUES 
    -- Unlocked badges
    (v_user_id, 1, 'unlocked', NOW() - INTERVAL '20 days', '{"progress": 5, "target": 5}'::jsonb), -- Vroege Vogel
    (v_user_id, 4, 'unlocked', NOW() - INTERVAL '15 days', '{"distance": 5, "target": 5}'::jsonb), -- Runner
    (v_user_id, 7, 'unlocked', NOW() - INTERVAL '10 days', '{"count": 10, "target": 10}'::jsonb), -- Cold Shower
    (v_user_id, 10, 'unlocked', NOW() - INTERVAL '25 days', '{"posts": 1, "target": 1}'::jsonb), -- Connector
    (v_user_id, 13, 'unlocked', NOW() - INTERVAL '5 days', '{"completed": true}'::jsonb), -- Spartan
    
    -- In progress badges
    (v_user_id, 2, 'progress', NULL, '{"progress": 7, "target": 10}'::jsonb), -- No Excuses
    (v_user_id, 5, 'progress', NULL, '{"count": 18, "target": 30}'::jsonb), -- Workout King
    (v_user_id, 8, 'progress', NULL, '{"books": 2, "target": 3}'::jsonb), -- Mindset Master
    (v_user_id, 11, 'progress', NULL, '{"challenged": 0, "target": 1}'::jsonb), -- Buddy
    (v_user_id, 14, 'progress', NULL, '{"days": 45, "target": 75}'::jsonb), -- 75 Hard
    
    -- Locked badges (no entry means locked by default)
    (v_user_id, 3, 'locked', NULL, '{"progress": 0, "target": 1}'::jsonb), -- Lezer
    (v_user_id, 6, 'locked', NULL, '{"progress": 0, "target": 5}'::jsonb), -- Vetverlies
    (v_user_id, 9, 'locked', NULL, '{"days": 0, "target": 7}'::jsonb), -- Meditatie
    (v_user_id, 12, 'locked', NULL, '{"challenges": 0, "target": 1}'::jsonb), -- Challenge Winner
    (v_user_id, 15, 'locked', NULL, '{"progress": 0, "target": 1}'::jsonb) -- No Surrender
  ON CONFLICT (user_id, badge_id) DO UPDATE SET
    status = EXCLUDED.status,
    progress_data = EXCLUDED.progress_data,
    unlocked_at = EXCLUDED.unlocked_at,
    updated_at = NOW();
  
  -- Insert XP transaction history (last 7 days)
  INSERT INTO xp_transactions (user_id, xp_amount, source_type, description, created_at)
  VALUES 
    (v_user_id, 150, 'complete_mission', 'Dagelijkse missie', NOW() - INTERVAL '6 days'),
    (v_user_id, 250, 'complete_challenge', 'Challenge voltooid', NOW() - INTERVAL '5 days'),
    (v_user_id, 500, 'earn_badge', 'Nieuwe badge', NOW() - INTERVAL '4 days'),
    (v_user_id, 75, 'squad_activity', 'Squad activiteit', NOW() - INTERVAL '3 days'),
    (v_user_id, 100, 'streak_bonus', 'Streak bonus', NOW() - INTERVAL '2 days'),
    (v_user_id, 50, 'read_article', 'Artikel gelezen', NOW() - INTERVAL '1 day'),
    (v_user_id, 150, 'complete_workout', 'Workout voltooid', NOW());

END $$;

-- Create sample leaderboard data (other users)
INSERT INTO auth.users (id, email, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'daniel@test.com', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'rico@test.com', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'sem@test.com', NOW()),
  ('550e8400-e29b-41d4-a716-446655440004'::UUID, 'marco@test.com', NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample profiles for leaderboard users
INSERT INTO profiles (id, full_name, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'Daniel V.', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'Rico B.', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'Sem J.', NOW()),
  ('550e8400-e29b-41d4-a716-446655440004'::UUID, 'Marco D.', NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample XP data for leaderboard
INSERT INTO user_xp (user_id, total_xp, current_rank_id, rank_achieved_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 18750, 5, NOW() - INTERVAL '10 days'), -- Daniel - Alpha
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 16500, 5, NOW() - INTERVAL '15 days'), -- Rico - Alpha
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 14200, 4, NOW() - INTERVAL '20 days'), -- Sem - Warrior
  ('550e8400-e29b-41d4-a716-446655440004'::UUID, 12800, 4, NOW() - INTERVAL '25 days') -- Marco - Warrior
ON CONFLICT (user_id) DO NOTHING;

-- Sample streaks for leaderboard
INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'daily_login', 45, 50, CURRENT_DATE),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'daily_login', 38, 45, CURRENT_DATE),
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'daily_login', 30, 35, CURRENT_DATE),
  ('550e8400-e29b-41d4-a716-446655440004'::UUID, 'daily_login', 25, 30, CURRENT_DATE)
ON CONFLICT (user_id, streak_type) DO NOTHING;

-- Sample badges for leaderboard users
INSERT INTO user_badges (user_id, badge_id, status, unlocked_at) VALUES
  -- Daniel - 24 badges
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 1, 'unlocked', NOW() - INTERVAL '40 days'),
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 2, 'unlocked', NOW() - INTERVAL '35 days'),
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 4, 'unlocked', NOW() - INTERVAL '30 days'),
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 5, 'unlocked', NOW() - INTERVAL '25 days'),
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 7, 'unlocked', NOW() - INTERVAL '20 days'),
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 8, 'unlocked', NOW() - INTERVAL '15 days'),
  
  -- Rico - 21 badges
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 1, 'unlocked', NOW() - INTERVAL '35 days'),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 4, 'unlocked', NOW() - INTERVAL '30 days'),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 7, 'unlocked', NOW() - INTERVAL '25 days'),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 10, 'unlocked', NOW() - INTERVAL '20 days'),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 13, 'unlocked', NOW() - INTERVAL '15 days'),
  
  -- Sem - 18 badges
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 1, 'unlocked', NOW() - INTERVAL '30 days'),
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 4, 'unlocked', NOW() - INTERVAL '25 days'),
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 7, 'unlocked', NOW() - INTERVAL '20 days'),
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 10, 'unlocked', NOW() - INTERVAL '15 days'),
  
  -- Marco - 15 badges
  ('550e8400-e29b-41d4-a716-446655440004'::UUID, 1, 'unlocked', NOW() - INTERVAL '25 days'),
  ('550e8400-e29b-41d4-a716-446655440004'::UUID, 4, 'unlocked', NOW() - INTERVAL '20 days'),
  ('550e8400-e29b-41d4-a716-446655440004'::UUID, 7, 'unlocked', NOW() - INTERVAL '15 days')
ON CONFLICT (user_id, badge_id) DO NOTHING; 