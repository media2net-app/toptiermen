-- SESSION LOGGING DATABASE SETUP
-- This script creates all necessary tables for user session monitoring

-- 1. Create user_session_logs table
CREATE TABLE IF NOT EXISTS user_session_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_type TEXT DEFAULT 'user' CHECK (user_type IN ('rick', 'chiel', 'test', 'admin', 'user')),
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    page_visits INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    loop_detections INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'idle', 'stuck', 'error', 'completed')),
    current_page TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_activities table for detailed activity tracking
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_type TEXT DEFAULT 'user' CHECK (user_type IN ('rick', 'chiel', 'test', 'admin', 'user')),
    action_type TEXT NOT NULL CHECK (action_type IN ('page_load', 'navigation', 'error', 'loop_detected', 'cache_hit', 'cache_miss', 'login', 'logout', 'api_call')),
    current_page TEXT,
    previous_page TEXT,
    error_message TEXT,
    error_stack TEXT,
    load_time_ms INTEGER,
    cache_hit BOOLEAN DEFAULT FALSE,
    loop_detected BOOLEAN DEFAULT FALSE,
    user_agent TEXT,
    ip_address TEXT,
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'warning', 'critical')),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create user_session_summary table for aggregated data
CREATE TABLE IF NOT EXISTS user_session_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_type TEXT DEFAULT 'user',
    date DATE DEFAULT CURRENT_DATE,
    total_sessions INTEGER DEFAULT 0,
    total_page_visits INTEGER DEFAULT 0,
    total_errors INTEGER DEFAULT 0,
    total_loops INTEGER DEFAULT 0,
    avg_session_duration_minutes INTEGER DEFAULT 0,
    most_visited_page TEXT,
    error_rate_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_session_logs_user_id ON user_session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_session_logs_user_type ON user_session_logs(user_type);
CREATE INDEX IF NOT EXISTS idx_user_session_logs_status ON user_session_logs(status);
CREATE INDEX IF NOT EXISTS idx_user_session_logs_created_at ON user_session_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_session_logs_last_activity ON user_session_logs(last_activity);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_type ON user_activities(user_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_action_type ON user_activities(action_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_status ON user_activities(status);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_user_session_summary_user_id ON user_session_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_user_session_summary_date ON user_session_summary(date);

-- 5. Create RLS (Row Level Security) policies
ALTER TABLE user_session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_session_summary ENABLE ROW LEVEL SECURITY;

-- Policy for admins to read all session data
CREATE POLICY "Admins can read all session logs" ON user_session_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email LIKE '%admin%'
        )
    );

CREATE POLICY "Admins can read all user activities" ON user_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email LIKE '%admin%'
        )
    );

CREATE POLICY "Admins can read all session summaries" ON user_session_summary
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email LIKE '%admin%'
        )
    );

-- Policy for users to insert their own session data
CREATE POLICY "Users can insert their own session logs" ON user_session_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session summaries" ON user_session_summary
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own session data
CREATE POLICY "Users can update their own session logs" ON user_session_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own session summaries" ON user_session_summary
    FOR UPDATE USING (auth.uid() = user_id);

-- 6. Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_session_log_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create triggers for automatic timestamp updates
CREATE TRIGGER update_session_logs_updated_at
    BEFORE UPDATE ON user_session_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_session_log_activity();

CREATE TRIGGER update_session_summary_updated_at
    BEFORE UPDATE ON user_session_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_session_log_activity();

-- 8. Create function to clean old session data (older than 30 days)
CREATE OR REPLACE FUNCTION clean_old_session_data()
RETURNS void AS $$
BEGIN
    DELETE FROM user_session_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    DELETE FROM user_activities 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    DELETE FROM user_session_summary 
    WHERE date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 9. Insert sample data for testing (only if real users exist)
-- Note: This will only work if the users actually exist in auth.users table
-- You can uncomment and modify these lines after creating real users

/*
-- First, check if users exist and get their real UUIDs
DO $$
DECLARE
    rick_id UUID;
    chiel_id UUID;
    test_id UUID;
BEGIN
    -- Get Rick's ID
    SELECT id INTO rick_id FROM auth.users WHERE email LIKE '%rick%' OR email LIKE '%cuijpers%' LIMIT 1;
    
    -- Get Chiel's ID  
    SELECT id INTO chiel_id FROM auth.users WHERE email LIKE '%chiel%' LIMIT 1;
    
    -- Get a test user ID
    SELECT id INTO test_id FROM auth.users WHERE email LIKE '%test%' OR email LIKE '%demo%' LIMIT 1;
    
    -- Insert sample data only if users exist
    IF rick_id IS NOT NULL THEN
        INSERT INTO user_session_logs (user_id, user_email, user_type, current_page, status) VALUES
            (rick_id, (SELECT email FROM auth.users WHERE id = rick_id), 'rick', '/dashboard', 'active')
        ON CONFLICT DO NOTHING;
        
        INSERT INTO user_activities (user_id, user_email, user_type, action_type, current_page, status, details) VALUES
            (rick_id, (SELECT email FROM auth.users WHERE id = rick_id), 'rick', 'page_load', '/dashboard', 'success', '{"load_time": 1200, "cache_hit": false}'),
            (rick_id, (SELECT email FROM auth.users WHERE id = rick_id), 'rick', 'loop_detected', '/dashboard', 'warning', '{"reload_count": 5, "time_span": 10000}')
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF chiel_id IS NOT NULL THEN
        INSERT INTO user_session_logs (user_id, user_email, user_type, current_page, status) VALUES
            (chiel_id, (SELECT email FROM auth.users WHERE id = chiel_id), 'chiel', '/trainingscentrum', 'active')
        ON CONFLICT DO NOTHING;
        
        INSERT INTO user_activities (user_id, user_email, user_type, action_type, current_page, status, details) VALUES
            (chiel_id, (SELECT email FROM auth.users WHERE id = chiel_id), 'chiel', 'navigation', '/trainingscentrum', 'success', '{"from": "/dashboard", "to": "/trainingscentrum"}')
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF test_id IS NOT NULL THEN
        INSERT INTO user_session_logs (user_id, user_email, user_type, current_page, status) VALUES
            (test_id, (SELECT email FROM auth.users WHERE id = test_id), 'test', '/onboarding', 'stuck')
        ON CONFLICT DO NOTHING;
        
        INSERT INTO user_activities (user_id, user_email, user_type, action_type, current_page, status, details) VALUES
            (test_id, (SELECT email FROM auth.users WHERE id = test_id), 'test', 'error', '/onboarding', 'error', '{"error": "Authentication failed", "retry_count": 3}')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
*/

-- 10. Create view for easy querying of recent activity
CREATE OR REPLACE VIEW recent_user_activity AS
SELECT 
    ua.id,
    ua.user_email,
    ua.user_type,
    ua.action_type,
    ua.current_page,
    ua.status,
    ua.created_at,
    ua.details,
    CASE 
        WHEN ua.status = 'error' THEN '🔴'
        WHEN ua.status = 'warning' THEN '🟡'
        WHEN ua.status = 'success' THEN '🟢'
        ELSE '⚪'
    END as status_icon
FROM user_activities ua
ORDER BY ua.created_at DESC;

-- 11. Create view for stuck users
CREATE OR REPLACE VIEW stuck_users AS
SELECT 
    usl.user_email,
    usl.user_type,
    usl.current_page,
    usl.last_activity,
    usl.error_count,
    usl.loop_detections,
    EXTRACT(EPOCH FROM (NOW() - usl.last_activity))/60 as minutes_inactive
FROM user_session_logs usl
WHERE usl.status = 'stuck' 
   OR usl.error_count > 5 
   OR usl.loop_detections > 3
   OR usl.last_activity < NOW() - INTERVAL '10 minutes'
ORDER BY usl.last_activity ASC;

-- Success message
SELECT 'Session logging database setup completed successfully!' as status;
