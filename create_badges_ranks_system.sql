-- Badges & Ranks System Database Schema
-- Created for Top Tier Men platform

-- 1. RANKS TABLE
CREATE TABLE IF NOT EXISTS ranks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon_name VARCHAR(50) NOT NULL, -- Store icon identifier instead of React component
  badges_needed INTEGER NOT NULL DEFAULT 0,
  xp_needed INTEGER NOT NULL DEFAULT 0,
  unlock_description TEXT,
  rank_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BADGE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS badge_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50) NOT NULL,
  icon_color VARCHAR(50) DEFAULT 'text-gray-400',
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BADGES TABLE
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES badge_categories(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon_name VARCHAR(50) NOT NULL,
  requirements JSONB, -- Store complex requirements as JSON
  xp_reward INTEGER DEFAULT 0,
  rarity_level VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. USER XP SYSTEM
CREATE TABLE IF NOT EXISTS user_xp (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  current_rank_id INTEGER REFERENCES ranks(id),
  rank_achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. XP TRANSACTIONS (XP History)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  source_type VARCHAR(50) NOT NULL, -- 'daily_login', 'mission', 'badge', 'workout', etc.
  source_id INTEGER, -- Reference to specific mission, badge, etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. USER BADGES (Badge Progress & Achievements)
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'locked', -- 'locked', 'progress', 'unlocked'
  progress_data JSONB, -- Store progress details
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 7. USER STREAKS
CREATE TABLE IF NOT EXISTS user_streaks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type VARCHAR(50) NOT NULL, -- 'daily_login', 'workout', 'meditation', etc.
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- 8. XP REWARDS CONFIGURATION
CREATE TABLE IF NOT EXISTS xp_rewards (
  id SERIAL PRIMARY KEY,
  action_type VARCHAR(50) PRIMARY KEY,
  xp_amount INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. STREAK REWARDS CONFIGURATION
CREATE TABLE IF NOT EXISTS streak_rewards (
  id SERIAL PRIMARY KEY,
  streak_type VARCHAR(50) NOT NULL,
  milestone_days INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  badge_reward_id INTEGER REFERENCES badges(id),
  reward_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(streak_type, milestone_days)
);

-- INSERT INITIAL DATA

-- Insert Ranks
INSERT INTO ranks (name, icon_name, badges_needed, xp_needed, unlock_description, rank_order) VALUES
('Recruit', 'FaFlag', 0, 0, 'Toegang tot community', 1),
('Initiate', 'FaUserShield', 3, 1000, 'Squad toegang', 2),
('Disciplined', 'FaBolt', 7, 2500, 'Challenges & badges', 3),
('Warrior', 'FaDumbbell', 12, 5000, 'Exclusieve content', 4),
('Alpha', 'FaCrown', 18, 10000, 'Squad level-ups', 5),
('Legion Commander', 'FaStar', 25, 20000, 'Communityrechten', 6);

-- Insert Badge Categories
INSERT INTO badge_categories (name, icon_name, icon_color, description, display_order) VALUES
('Dagelijkse discipline', 'FaFire', 'text-orange-400', 'Badges voor dagelijkse gewoontes en discipline', 1),
('Fysieke groei', 'FaDumbbell', 'text-blue-400', 'Badges voor fysieke prestaties en groei', 2),
('Mentale kracht', 'FaBrain', 'text-purple-400', 'Badges voor mentale ontwikkeling en mindset', 3),
('Brotherhood activiteit', 'FaUsers', 'text-green-400', 'Badges voor community interactie en samenwerking', 4),
('Specials', 'FaStar', 'text-yellow-400', 'Speciale uitdagingen en achievements', 5);

-- Insert Badges
INSERT INTO badges (category_id, title, description, icon_name, requirements, xp_reward, rarity_level) VALUES
-- Dagelijkse discipline
(1, 'Vroege Vogel', '5 dagen vroeg op', 'FaBolt', '{"type": "early_wake", "count": 5}', 100, 'common'),
(1, 'No Excuses', '10 dagen geen excuus', 'FaFire', '{"type": "daily_check", "count": 10}', 250, 'rare'),
(1, 'Lezer', 'Eerste boek uitgelezen', 'FaBookOpen', '{"type": "books_read", "count": 1}', 200, 'common'),

-- Fysieke groei
(2, 'Runner', '5 km hardlopen', 'FaRunning', '{"type": "distance_run", "distance": 5}', 150, 'common'),
(2, 'Workout King', '30 workouts voltooid', 'FaDumbbell', '{"type": "workouts_completed", "count": 30}', 500, 'epic'),
(2, 'Vetverlies', '5% vetpercentage kwijt', 'FaFire', '{"type": "body_fat_loss", "percentage": 5}', 750, 'legendary'),

-- Mentale kracht
(3, 'Cold Shower', '10 koude douches', 'FaSnowflake', '{"type": "cold_showers", "count": 10}', 200, 'rare'),
(3, 'Mindset Master', '3 mindsetboeken gelezen', 'FaBookOpen', '{"type": "mindset_books", "count": 3}', 400, 'epic'),
(3, 'Meditatie', '7 dagen meditatie', 'FaMedal', '{"type": "meditation_streak", "days": 7}', 300, 'rare'),

-- Brotherhood activiteit
(4, 'Connector', 'Eerste post gedeeld', 'FaUsers', '{"type": "posts_shared", "count": 1}', 50, 'common'),
(4, 'Buddy', 'Buddy uitgedaagd', 'FaTrophy', '{"type": "buddy_challenge", "count": 1}', 150, 'common'),
(4, 'Challenge Winner', 'Challenge afgerond', 'FaCrown', '{"type": "challenges_won", "count": 1}', 300, 'rare'),

-- Specials
(5, 'Spartan', 'Spartan Challenge voltooid', 'FaFire', '{"type": "special_challenge", "challenge": "spartan"}', 1000, 'legendary'),
(5, '75 Hard', '75 Hard Completion', 'FaCrown', '{"type": "special_challenge", "challenge": "75_hard"}', 1500, 'legendary'),
(5, 'No Surrender', 'No Surrender-badge', 'FaLock', '{"type": "special_challenge", "challenge": "no_surrender"}', 2000, 'legendary');

-- Insert XP Rewards Configuration
INSERT INTO xp_rewards (action_type, xp_amount, description) VALUES
('daily_login', 50, 'Dagelijks inloggen'),
('complete_mission', 100, 'Missie voltooien'),
('complete_challenge', 250, 'Challenge voltooien'),
('earn_badge', 500, 'Badge behalen'),
('squad_activity', 75, 'Squad activiteit'),
('community_post', 25, 'Community post maken'),
('read_article', 50, 'Artikel lezen'),
('watch_video', 30, 'Video bekijken'),
('complete_workout', 150, 'Workout voltooien'),
('streak_bonus', 100, 'Streak bonus');

-- Insert Streak Rewards
INSERT INTO streak_rewards (streak_type, milestone_days, xp_reward, reward_description) VALUES
('daily_login', 3, 100, 'Beginner Streak'),
('daily_login', 7, 250, 'Weekly Warrior'),
('daily_login', 14, 500, 'Consistency King'),
('daily_login', 30, 1000, 'Monthly Master'),
('daily_login', 100, 5000, 'Century Club');

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_rewards ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Ranks - Everyone can read
CREATE POLICY "Ranks are viewable by everyone" ON ranks FOR SELECT USING (true);

-- Badge Categories - Everyone can read
CREATE POLICY "Badge categories are viewable by everyone" ON badge_categories FOR SELECT USING (true);

-- Badges - Everyone can read
CREATE POLICY "Badges are viewable by everyone" ON badges FOR SELECT USING (true);

-- User XP - Users can only see and update their own
CREATE POLICY "Users can view own XP" ON user_xp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own XP" ON user_xp FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own XP" ON user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);

-- XP Transactions - Users can only see their own
CREATE POLICY "Users can view own XP transactions" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert XP transactions" ON xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Badges - Users can only see and update their own
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own badges" ON user_badges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Streaks - Users can only see and update their own
CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON user_streaks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- XP Rewards - Everyone can read
CREATE POLICY "XP rewards are viewable by everyone" ON xp_rewards FOR SELECT USING (true);

-- Streak Rewards - Everyone can read
CREATE POLICY "Streak rewards are viewable by everyone" ON streak_rewards FOR SELECT USING (true);

-- FUNCTIONS

-- Function to award XP and update rank
CREATE OR REPLACE FUNCTION award_xp(p_user_id UUID, p_xp_amount INTEGER, p_source_type VARCHAR, p_source_id INTEGER DEFAULT NULL, p_description TEXT DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_current_rank_id INTEGER;
  v_new_rank_id INTEGER;
  v_rank_changed BOOLEAN := false;
  v_result JSON;
BEGIN
  -- Get current XP and rank
  SELECT total_xp, current_rank_id INTO v_current_xp, v_current_rank_id
  FROM user_xp WHERE user_id = p_user_id;
  
  -- If user doesn't exist in user_xp, create entry
  IF v_current_xp IS NULL THEN
    INSERT INTO user_xp (user_id, total_xp, current_rank_id)
    VALUES (p_user_id, 0, 1) -- Start with first rank
    RETURNING total_xp, current_rank_id INTO v_current_xp, v_current_rank_id;
  END IF;
  
  -- Calculate new XP
  v_new_xp := v_current_xp + p_xp_amount;
  
  -- Check for rank up
  SELECT id INTO v_new_rank_id
  FROM ranks
  WHERE xp_needed <= v_new_xp
  ORDER BY rank_order DESC
  LIMIT 1;
  
  -- Update user XP
  UPDATE user_xp 
  SET total_xp = v_new_xp, 
      current_rank_id = v_new_rank_id,
      rank_achieved_at = CASE WHEN v_new_rank_id > v_current_rank_id THEN NOW() ELSE rank_achieved_at END,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Log XP transaction
  INSERT INTO xp_transactions (user_id, xp_amount, source_type, source_id, description)
  VALUES (p_user_id, p_xp_amount, p_source_type, p_source_id, p_description);
  
  -- Check if rank changed
  IF v_new_rank_id > v_current_rank_id THEN
    v_rank_changed := true;
  END IF;
  
  -- Return result
  v_result := json_build_object(
    'success', true,
    'old_xp', v_current_xp,
    'new_xp', v_new_xp,
    'xp_awarded', p_xp_amount,
    'rank_changed', v_rank_changed,
    'old_rank_id', v_current_rank_id,
    'new_rank_id', v_new_rank_id
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unlock badge
CREATE OR REPLACE FUNCTION unlock_badge(p_user_id UUID, p_badge_id INTEGER)
RETURNS JSON AS $$
DECLARE
  v_badge_exists BOOLEAN;
  v_already_unlocked BOOLEAN;
  v_xp_reward INTEGER;
  v_result JSON;
BEGIN
  -- Check if badge exists
  SELECT EXISTS(SELECT 1 FROM badges WHERE id = p_badge_id) INTO v_badge_exists;
  
  IF NOT v_badge_exists THEN
    RETURN json_build_object('success', false, 'error', 'Badge does not exist');
  END IF;
  
  -- Check if already unlocked
  SELECT status = 'unlocked' INTO v_already_unlocked
  FROM user_badges 
  WHERE user_id = p_user_id AND badge_id = p_badge_id;
  
  IF v_already_unlocked THEN
    RETURN json_build_object('success', false, 'error', 'Badge already unlocked');
  END IF;
  
  -- Get XP reward
  SELECT xp_reward INTO v_xp_reward FROM badges WHERE id = p_badge_id;
  
  -- Update or insert user badge
  INSERT INTO user_badges (user_id, badge_id, status, unlocked_at)
  VALUES (p_user_id, p_badge_id, 'unlocked', NOW())
  ON CONFLICT (user_id, badge_id)
  DO UPDATE SET status = 'unlocked', unlocked_at = NOW(), updated_at = NOW();
  
  -- Award XP for badge
  IF v_xp_reward > 0 THEN
    PERFORM award_xp(p_user_id, v_xp_reward, 'earn_badge', p_badge_id, 'Badge unlocked');
  END IF;
  
  v_result := json_build_object(
    'success', true,
    'badge_id', p_badge_id,
    'xp_awarded', v_xp_reward
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID, p_streak_type VARCHAR)
RETURNS JSON AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_activity DATE;
  v_today DATE := CURRENT_DATE;
  v_new_streak INTEGER;
  v_milestone_reached BOOLEAN := false;
  v_milestone_xp INTEGER := 0;
  v_result JSON;
BEGIN
  -- Get current streak info
  SELECT current_streak, longest_streak, last_activity_date 
  INTO v_current_streak, v_longest_streak, v_last_activity
  FROM user_streaks 
  WHERE user_id = p_user_id AND streak_type = p_streak_type;
  
  -- If no record exists, create one
  IF v_current_streak IS NULL THEN
    INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, p_streak_type, 1, 1, v_today);
    v_new_streak := 1;
  ELSE
    -- Check if continuing streak
    IF v_last_activity = v_today - INTERVAL '1 day' THEN
      v_new_streak := v_current_streak + 1;
    ELSIF v_last_activity = v_today THEN
      -- Already updated today
      RETURN json_build_object('success', false, 'error', 'Streak already updated today');
    ELSE
      -- Streak broken, start over
      v_new_streak := 1;
    END IF;
    
    -- Update streak
    UPDATE user_streaks 
    SET current_streak = v_new_streak,
        longest_streak = GREATEST(v_longest_streak, v_new_streak),
        last_activity_date = v_today,
        updated_at = NOW()
    WHERE user_id = p_user_id AND streak_type = p_streak_type;
  END IF;
  
  -- Check for milestone rewards
  SELECT xp_reward INTO v_milestone_xp
  FROM streak_rewards
  WHERE streak_type = p_streak_type AND milestone_days = v_new_streak;
  
  IF v_milestone_xp IS NOT NULL THEN
    v_milestone_reached := true;
    PERFORM award_xp(p_user_id, v_milestone_xp, 'streak_milestone', v_new_streak, 
                     format('Streak milestone: %s days', v_new_streak));
  END IF;
  
  v_result := json_build_object(
    'success', true,
    'new_streak', v_new_streak,
    'milestone_reached', v_milestone_reached,
    'milestone_xp', COALESCE(v_milestone_xp, 0)
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 