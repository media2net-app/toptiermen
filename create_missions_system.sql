-- =============================================
-- TopTiermen Missions System Database Schema
-- =============================================

-- Enable Row Level Security
ALTER TABLE IF EXISTS mission_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mission_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_mission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_streaks ENABLE ROW LEVEL SECURITY;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_mission_logs CASCADE;
DROP TABLE IF EXISTS user_missions CASCADE;
DROP TABLE IF EXISTS mission_templates CASCADE;
DROP TABLE IF EXISTS mission_categories CASCADE;
DROP TABLE IF EXISTS user_streaks CASCADE;

-- =============================================
-- 1. Mission Categories Table
-- =============================================
CREATE TABLE mission_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(10) NOT NULL,
    color VARCHAR(7) DEFAULT '#8BAE5A',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. Mission Templates Table
-- =============================================
CREATE TABLE mission_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES mission_categories(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(10) NOT NULL,
    badge_name VARCHAR(100),
    difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'extreme')),
    frequency_type VARCHAR(20) DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'weekly', 'monthly', 'custom')),
    target_value INTEGER DEFAULT 1,
    target_unit VARCHAR(50) DEFAULT 'completion',
    xp_reward INTEGER DEFAULT 10,
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. User Missions Table
-- =============================================
CREATE TABLE user_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_template_id UUID REFERENCES mission_templates(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(10) NOT NULL,
    badge_name VARCHAR(100),
    category_id UUID NOT NULL REFERENCES mission_categories(id),
    frequency_type VARCHAR(20) DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'weekly', 'monthly', 'custom')),
    target_value INTEGER DEFAULT 1,
    target_unit VARCHAR(50) DEFAULT 'completion',
    current_progress INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 10,
    is_shared BOOLEAN DEFAULT false,
    accountability_partner_id UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. User Mission Logs Table (for tracking completions)
-- =============================================
CREATE TABLE user_mission_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_mission_id UUID NOT NULL REFERENCES user_missions(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_value INTEGER DEFAULT 1,
    notes TEXT,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. User Streaks Table
-- =============================================
CREATE TABLE user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    streak_type VARCHAR(50) NOT NULL, -- 'daily_missions', 'weekly_goals', 'custom'
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, streak_type)
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX idx_mission_templates_category ON mission_templates(category_id);
CREATE INDEX idx_mission_templates_active ON mission_templates(is_active);
CREATE INDEX idx_user_missions_user ON user_missions(user_id);
CREATE INDEX idx_user_missions_status ON user_missions(status);
CREATE INDEX idx_user_missions_frequency ON user_missions(frequency_type);
CREATE INDEX idx_user_mission_logs_user ON user_mission_logs(user_id);
CREATE INDEX idx_user_mission_logs_mission ON user_mission_logs(user_mission_id);
CREATE INDEX idx_user_mission_logs_date ON user_mission_logs(completed_at);
CREATE INDEX idx_user_streaks_user ON user_streaks(user_id);

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Mission Categories (publicly readable)
CREATE POLICY "Mission categories are viewable by everyone" ON mission_categories
    FOR SELECT USING (is_active = true);

-- Mission Templates (publicly readable)
CREATE POLICY "Mission templates are viewable by everyone" ON mission_templates
    FOR SELECT USING (is_active = true);

-- User Missions (user can only see their own)
CREATE POLICY "Users can view own missions" ON user_missions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions" ON user_missions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions" ON user_missions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own missions" ON user_missions
    FOR DELETE USING (auth.uid() = user_id);

-- User Mission Logs (user can only see their own)
CREATE POLICY "Users can view own mission logs" ON user_mission_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mission logs" ON user_mission_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Streaks (user can only see their own)
CREATE POLICY "Users can view own streaks" ON user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON user_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON user_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- Seed Data: Mission Categories
-- =============================================
INSERT INTO mission_categories (name, slug, description, icon, color, order_index) VALUES
('Gezondheid & Fitness', 'health-fitness', 'Missies gericht op fysieke gezondheid en fitness', '💪', '#8BAE5A', 1),
('Mindset & Focus', 'mindset-focus', 'Missies voor mentale kracht en focus ontwikkeling', '🧠', '#f0a14f', 2),
('Financiën & Werk', 'finance-work', 'Missies voor financiële groei en carrièreontwikkeling', '💰', '#FFD700', 3),
('Sociale Connecties', 'social-connections', 'Missies voor het versterken van relaties en netwerk', '🤝', '#00CED1', 4),
('Persoonlijke Ontwikkeling', 'personal-development', 'Missies voor algehele persoonlijke groei', '🌱', '#9370DB', 5);

-- =============================================
-- Seed Data: Mission Templates
-- =============================================
INSERT INTO mission_templates (category_id, title, description, icon, badge_name, difficulty_level, frequency_type, target_value, target_unit, xp_reward, is_premium) VALUES
-- Gezondheid & Fitness
((SELECT id FROM mission_categories WHERE slug = 'health-fitness'), 'Drink 3L water', 'Zorg voor optimale hydratatie door 3 liter water te drinken', '💧', 'Hydration Master', 'easy', 'daily', 3000, 'ml', 15, false),
((SELECT id FROM mission_categories WHERE slug = 'health-fitness'), '10.000 stappen', 'Loop minimaal 10.000 stappen per dag', '👟', 'Step Master', 'medium', 'daily', 10000, 'steps', 20, false),
((SELECT id FROM mission_categories WHERE slug = 'health-fitness'), '30 min stretchen', 'Besteed 30 minuten aan stretching en mobiliteit', '🧘‍♂️', 'Flexibility King', 'medium', 'daily', 30, 'minutes', 25, false),
((SELECT id FROM mission_categories WHERE slug = 'health-fitness'), 'Koud douchen', 'Neem een koude douche voor mentale kracht', '❄️', 'Ice Warrior', 'hard', 'daily', 1, 'completion', 30, false),
((SELECT id FROM mission_categories WHERE slug = 'health-fitness'), '3x sporten', 'Train minimaal 3 keer deze week', '🏋️‍♂️', 'Fitness Warrior', 'medium', 'weekly', 3, 'sessions', 50, false),

-- Mindset & Focus
((SELECT id FROM mission_categories WHERE slug = 'mindset-focus'), '10 min mediteren', 'Mediteer dagelijks voor mentale helderheid', '🧘‍♂️', 'Mind Master', 'medium', 'daily', 10, 'minutes', 25, false),
((SELECT id FROM mission_categories WHERE slug = 'mindset-focus'), '30 min lezen', 'Lees minimaal 30 minuten per dag', '📚', 'Leesworm', 'easy', 'daily', 30, 'minutes', 20, false),
((SELECT id FROM mission_categories WHERE slug = 'mindset-focus'), 'Geen social media voor 9:00', 'Start je dag zonder social media afleidingen', '📱', 'Digital Minimalist', 'medium', 'daily', 1, 'completion', 20, false),
((SELECT id FROM mission_categories WHERE slug = 'mindset-focus'), 'Dankbaarheidsdagboek', 'Schrijf dagelijks 3 dingen op waar je dankbaar voor bent', '🙏', 'Gratitude Guru', 'easy', 'daily', 3, 'items', 15, false),

-- Financiën & Werk
((SELECT id FROM mission_categories WHERE slug = 'finance-work'), '30 min side-hustle', 'Werk dagelijks aan je bijverdienste', '💼', 'Entrepreneur', 'medium', 'daily', 30, 'minutes', 30, false),
((SELECT id FROM mission_categories WHERE slug = 'finance-work'), 'Netwerkbericht sturen', 'Verstuur een professioneel netwerkbericht', '🤝', 'Networker', 'medium', 'daily', 1, 'message', 25, false),
((SELECT id FROM mission_categories WHERE slug = 'finance-work'), 'Budget bijwerken', 'Update je financiële administratie', '💰', 'Money Master', 'easy', 'weekly', 1, 'completion', 40, false),
((SELECT id FROM mission_categories WHERE slug = 'finance-work'), 'Investeringsonderzoek', 'Bestudeer nieuwe investeringsmogelijkheden', '📈', 'Investment Pro', 'medium', 'weekly', 2, 'hours', 35, false),

-- Sociale Connecties
((SELECT id FROM mission_categories WHERE slug = 'social-connections'), 'Bel een vriend/familie', 'Onderhoud belangrijke relaties door te bellen', '📞', 'Connection Keeper', 'easy', 'weekly', 1, 'call', 20, false),
((SELECT id FROM mission_categories WHERE slug = 'social-connections'), 'Compliment geven', 'Geef iemand een oprecht compliment', '💝', 'Positivity Spreader', 'easy', 'daily', 1, 'compliment', 10, false),

-- Persoonlijke Ontwikkeling
((SELECT id FROM mission_categories WHERE slug = 'personal-development'), 'Leer iets nieuws', 'Besteed tijd aan het leren van een nieuwe vaardigheid', '🎓', 'Lifelong Learner', 'medium', 'daily', 20, 'minutes', 25, false),
((SELECT id FROM mission_categories WHERE slug = 'personal-development'), 'Reflectie dagboek', 'Reflecteer op je dag en leerpunten', '📝', 'Self Reflector', 'easy', 'daily', 1, 'entry', 15, false);

-- =============================================
-- Functions for Mission Management
-- =============================================

-- Function to complete a mission
CREATE OR REPLACE FUNCTION complete_user_mission(
    p_user_mission_id UUID,
    p_progress_value INTEGER DEFAULT 1,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_mission user_missions%ROWTYPE;
    v_xp_earned INTEGER;
    v_new_progress INTEGER;
    v_is_completed BOOLEAN DEFAULT FALSE;
    v_streak_updated BOOLEAN DEFAULT FALSE;
BEGIN
    -- Get the mission details
    SELECT * INTO v_mission FROM user_missions WHERE id = p_user_mission_id AND user_id = auth.uid();
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Mission not found');
    END IF;
    
    -- Calculate new progress
    v_new_progress := LEAST(v_mission.current_progress + p_progress_value, v_mission.target_value);
    v_is_completed := v_new_progress >= v_mission.target_value;
    v_xp_earned := CASE WHEN v_is_completed THEN v_mission.xp_reward ELSE 0 END;
    
    -- Update mission progress
    UPDATE user_missions 
    SET current_progress = v_new_progress,
        status = CASE WHEN v_is_completed THEN 'completed' ELSE status END,
        updated_at = NOW()
    WHERE id = p_user_mission_id;
    
    -- Log the completion
    INSERT INTO user_mission_logs (user_id, user_mission_id, progress_value, notes, xp_earned)
    VALUES (auth.uid(), p_user_mission_id, p_progress_value, p_notes, v_xp_earned);
    
    -- Update user XP if mission completed
    IF v_is_completed AND v_xp_earned > 0 THEN
        UPDATE user_xp 
        SET total_xp = total_xp + v_xp_earned,
            updated_at = NOW()
        WHERE user_id = auth.uid();
    END IF;
    
    -- Update daily streak if it's a daily mission
    IF v_mission.frequency_type = 'daily' AND v_is_completed THEN
        INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_completion_date)
        VALUES (auth.uid(), 'daily_missions', 1, 1, CURRENT_DATE)
        ON CONFLICT (user_id, streak_type) DO UPDATE SET
            current_streak = CASE 
                WHEN user_streaks.last_completion_date = CURRENT_DATE - INTERVAL '1 day' THEN user_streaks.current_streak + 1
                WHEN user_streaks.last_completion_date = CURRENT_DATE THEN user_streaks.current_streak
                ELSE 1
            END,
            longest_streak = GREATEST(user_streaks.longest_streak, 
                CASE 
                    WHEN user_streaks.last_completion_date = CURRENT_DATE - INTERVAL '1 day' THEN user_streaks.current_streak + 1
                    WHEN user_streaks.last_completion_date = CURRENT_DATE THEN user_streaks.current_streak
                    ELSE 1
                END
            ),
            last_completion_date = CURRENT_DATE,
            updated_at = NOW();
        
        v_streak_updated := TRUE;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'mission_completed', v_is_completed,
        'xp_earned', v_xp_earned,
        'new_progress', v_new_progress,
        'streak_updated', v_streak_updated
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's daily missions summary
CREATE OR REPLACE FUNCTION get_daily_missions_summary(p_user_id UUID DEFAULT auth.uid())
RETURNS JSON AS $$
DECLARE
    v_total_daily INTEGER;
    v_completed_today INTEGER;
    v_current_streak INTEGER;
BEGIN
    -- Count total daily missions
    SELECT COUNT(*) INTO v_total_daily
    FROM user_missions 
    WHERE user_id = p_user_id 
    AND frequency_type = 'daily' 
    AND status = 'active';
    
    -- Count completed today (missions completed today)
    SELECT COUNT(DISTINCT um.id) INTO v_completed_today
    FROM user_missions um
    JOIN user_mission_logs uml ON um.id = uml.user_mission_id
    WHERE um.user_id = p_user_id 
    AND um.frequency_type = 'daily'
    AND um.status IN ('active', 'completed')
    AND DATE(uml.completed_at) = CURRENT_DATE;
    
    -- Get current streak
    SELECT COALESCE(current_streak, 0) INTO v_current_streak
    FROM user_streaks 
    WHERE user_id = p_user_id AND streak_type = 'daily_missions';
    
    RETURN json_build_object(
        'total_daily', v_total_daily,
        'completed_today', v_completed_today,
        'current_streak', v_current_streak,
        'completion_percentage', CASE WHEN v_total_daily > 0 THEN ROUND((v_completed_today::FLOAT / v_total_daily) * 100) ELSE 0 END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Updated timestamp triggers
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mission_categories_updated_at BEFORE UPDATE ON mission_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mission_templates_updated_at BEFORE UPDATE ON mission_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_missions_updated_at BEFORE UPDATE ON user_missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 