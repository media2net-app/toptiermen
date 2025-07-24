-- =============================================
-- Simple Missions System Tables for TopTiermen
-- Execute this in Supabase SQL Editor
-- =============================================

-- 1. Create user_missions table
CREATE TABLE IF NOT EXISTS user_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(10) NOT NULL DEFAULT '🎯',
    badge_name VARCHAR(100),
    category_slug VARCHAR(100) DEFAULT 'health-fitness',
    frequency_type VARCHAR(20) DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'weekly', 'monthly')),
    target_value INTEGER DEFAULT 1,
    current_progress INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 15,
    is_shared BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
    is_custom BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_mission_logs table
CREATE TABLE IF NOT EXISTS user_mission_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_mission_id UUID NOT NULL REFERENCES user_missions(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    xp_earned INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create user_daily_streaks table
CREATE TABLE IF NOT EXISTS user_daily_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_daily_streak UNIQUE(user_id)
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_missions_user ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions(status);
CREATE INDEX IF NOT EXISTS idx_user_mission_logs_user ON user_mission_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_logs_mission ON user_mission_logs(user_mission_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_logs_date ON user_mission_logs(completed_at);

-- 5. Enable Row Level Security
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_streaks ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
-- User missions policies
CREATE POLICY IF NOT EXISTS "Users can view own missions" ON user_missions 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own missions" ON user_missions 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own missions" ON user_missions 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own missions" ON user_missions 
    FOR DELETE USING (auth.uid() = user_id);

-- Mission logs policies
CREATE POLICY IF NOT EXISTS "Users can view own mission logs" ON user_mission_logs 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own mission logs" ON user_mission_logs 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily streaks policies
CREATE POLICY IF NOT EXISTS "Users can view own streaks" ON user_daily_streaks 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own streaks" ON user_daily_streaks 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own streaks" ON user_daily_streaks 
    FOR UPDATE USING (auth.uid() = user_id);

-- 7. Insert sample missions for Rick (replace with actual user ID)
DO $$
DECLARE
    rick_user_id UUID;
BEGIN
    -- Get Rick's user ID (adjust email if needed)
    SELECT id INTO rick_user_id FROM auth.users WHERE email = 'rick@toptiermen.nl' LIMIT 1;
    
    IF rick_user_id IS NOT NULL THEN
        -- Insert sample missions
        INSERT INTO user_missions (
            user_id, title, description, icon, badge_name, category_slug, 
            frequency_type, target_value, current_progress, xp_reward, is_shared, status
        ) VALUES
        (rick_user_id, '10.000 stappen per dag', 'Loop elke dag minimaal 10.000 stappen', '👟', 'Step Master', 'health-fitness', 'daily', 10000, 7500, 20, false, 'active'),
        (rick_user_id, '30 min lezen', 'Lees dagelijks minimaal 30 minuten', '📚', 'Leesworm', 'mindset-focus', 'daily', 30, 0, 20, false, 'active'),
        (rick_user_id, '3x sporten per week', 'Train minimaal 3 keer deze week', '🏋️‍♂️', 'Fitness Warrior', 'health-fitness', 'weekly', 3, 1, 50, true, 'active'),
        (rick_user_id, '10 min mediteren', 'Mediteer dagelijks voor mentale helderheid', '🧘‍♂️', 'Mind Master', 'mindset-focus', 'daily', 10, 0, 25, false, 'active'),
        (rick_user_id, 'Koud douchen', 'Neem een koude douche voor mentale kracht', '❄️', 'Ice Warrior', 'health-fitness', 'daily', 1, 0, 30, false, 'active')
        ON CONFLICT DO NOTHING;

        -- Insert initial streak
        INSERT INTO user_daily_streaks (user_id, current_streak, longest_streak, last_completion_date)
        VALUES (rick_user_id, 12, 15, CURRENT_DATE - INTERVAL '1 day')
        ON CONFLICT (user_id) DO UPDATE SET
            current_streak = 12,
            longest_streak = GREATEST(user_daily_streaks.longest_streak, 15),
            updated_at = NOW();
            
        RAISE NOTICE 'Sample missions created for Rick!';
    ELSE
        RAISE NOTICE 'Rick user not found, skipping sample data';
    END IF;
END $$;

-- Success message
SELECT 'Missions system created successfully! 🎉' as result; 