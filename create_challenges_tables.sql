-- Create Challenges Tables
-- This file creates the database schema for the challenges system

-- 1. Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_slug VARCHAR(100) DEFAULT 'general',
    difficulty_level VARCHAR(50) DEFAULT 'medium',
    duration_days INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 100,
    badge_name VARCHAR(100),
    badge_icon VARCHAR(50),
    is_community_challenge BOOLEAN DEFAULT false,
    max_participants INTEGER,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_challenges table (for user participation)
CREATE TABLE IF NOT EXISTS user_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, failed, abandoned
    progress_percentage INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    completion_date DATE,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);

-- 3. Create challenge_logs table (for tracking daily progress)
CREATE TABLE IF NOT EXISTS challenge_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_challenge_id UUID REFERENCES user_challenges(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    notes TEXT,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category_slug);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(status);
CREATE INDEX IF NOT EXISTS idx_user_challenges_dates ON user_challenges(start_date, completion_date);
CREATE INDEX IF NOT EXISTS idx_challenge_logs_user ON challenge_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_logs_challenge ON challenge_logs(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_logs_date ON challenge_logs(activity_date);

-- 5. Add RLS (Row Level Security) policies
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_logs ENABLE ROW LEVEL SECURITY;

-- Challenges policies
CREATE POLICY "Challenges are viewable by everyone" ON challenges
    FOR SELECT USING (true);

CREATE POLICY "Challenges can be created by authenticated users" ON challenges
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Challenges can be updated by authenticated users" ON challenges
    FOR UPDATE USING (auth.role() = 'authenticated');

-- User challenges policies
CREATE POLICY "Users can view their own challenges" ON user_challenges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges" ON user_challenges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges" ON user_challenges
    FOR UPDATE USING (auth.uid() = user_id);

-- Challenge logs policies
CREATE POLICY "Users can view their own challenge logs" ON challenge_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge logs" ON challenge_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge logs" ON challenge_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. Insert sample challenges
INSERT INTO challenges (title, description, category_slug, difficulty_level, duration_days, xp_reward, badge_name, badge_icon, is_community_challenge) VALUES
-- Fitness Challenges
('30 Dagen Hardlopen', 'Hardloop elke dag 30 dagen lang. Begin met 5 minuten en bouw op naar 30 minuten.', 'fitness', 'medium', 30, 300, 'Running Warrior', '🏃‍♂️', false),
('90 Dagen Fitness Transformatie', 'Doe 90 dagen lang elke dag minimaal 30 minuten aan fitness. Combineer cardio en kracht.', 'fitness', 'hard', 90, 500, 'Fitness Master', '💪', false),
('21 Dagen Push-up Challenge', 'Doe elke dag push-ups. Begin met 10 en voeg elke dag 5 toe.', 'fitness', 'easy', 21, 150, 'Push-up Pro', '🏋️‍♂️', false),

-- Mindset Challenges
('21 Dagen Geen Social Media', 'Gebruik 21 dagen lang geen social media. Focus op echte connecties en productiviteit.', 'mindset', 'medium', 21, 200, 'Digital Detox Master', '🧠', false),
('30 Dagen Dankbaarheid', 'Schrijf elke dag 3 dingen op waar je dankbaar voor bent.', 'mindset', 'easy', 30, 150, 'Gratitude Guru', '🙏', false),
('90 Dagen Vroeg Opstaan', 'Sta 90 dagen lang elke dag om 6:00 op. Bouw een ochtendroutine op.', 'mindset', 'hard', 90, 400, 'Early Bird', '🌅', false),

-- Health Challenges
('30 Dagen Clean Eating', 'Eet 30 dagen lang alleen onbewerkte voeding. Geen suiker, alcohol of junk food.', 'health', 'medium', 30, 250, 'Clean Eater', '🥗', false),
('21 Dagen Koud Douchen', 'Neem 21 dagen lang elke dag een koude douche. Begin met 30 seconden.', 'health', 'medium', 21, 180, 'Ice Warrior', '❄️', false),
('60 Dagen Hydratatie', 'Drink 60 dagen lang elke dag minimaal 2.5L water.', 'health', 'easy', 60, 200, 'Hydration Hero', '💧', false),

-- Community Challenges
('Brotherhood 30 Dagen Challenge', 'Doe samen met de Brotherhood 30 dagen lang elke dag een goede daad.', 'community', 'medium', 30, 400, 'Brotherhood Hero', '🤝', true),
('Team Fitness Challenge', 'Samen met je team 21 dagen lang elke dag sporten.', 'community', 'medium', 21, 350, 'Team Player', '👥', true);

-- 7. Add comments for documentation
COMMENT ON TABLE challenges IS 'Stores all available challenges that users can participate in';
COMMENT ON TABLE user_challenges IS 'Tracks user participation in challenges';
COMMENT ON TABLE challenge_logs IS 'Daily logs of user progress in challenges';
COMMENT ON COLUMN challenges.duration_days IS 'Number of days the challenge runs';
COMMENT ON COLUMN challenges.is_community_challenge IS 'Whether this is a group/community challenge';
COMMENT ON COLUMN user_challenges.progress_percentage IS 'Current progress as percentage (0-100)';
COMMENT ON COLUMN user_challenges.current_streak IS 'Current consecutive days completed';
COMMENT ON COLUMN user_challenges.longest_streak IS 'Longest consecutive days completed'; 