-- Fix admin dashboard queries by creating missing views and fixing column references

-- Create view for active users (users with activity in the last 30 days)
CREATE OR REPLACE VIEW active_users_view AS
SELECT 
    p.id,
    p.email,
    p.created_at,
    p.last_login,
    CASE 
        WHEN p.last_login >= NOW() - INTERVAL '30 days' THEN true
        ELSE false
    END as is_active
FROM profiles p
WHERE p.last_login IS NOT NULL;

-- Create view for daily logins (users who logged in this week)
CREATE OR REPLACE VIEW daily_logins_view AS
SELECT 
    p.id,
    p.email,
    p.last_login,
    DATE(p.last_login) as login_date
FROM profiles p
WHERE p.last_login >= NOW() - INTERVAL '7 days';

-- Create view for completed missions
CREATE OR REPLACE VIEW completed_missions_view AS
SELECT 
    um.id,
    um.user_id,
    um.mission_id,
    um.completed,
    um.completed_at,
    m.title as mission_title,
    m.category as mission_category
FROM user_missions um
JOIN missions m ON um.mission_id = m.id
WHERE um.completed = true;

-- Create view for user training schemas
CREATE OR REPLACE VIEW user_training_schema_view AS
SELECT 
    p.id as user_id,
    p.email,
    p.selected_schema_id,
    ts.id as schema_id,
    ts.name as schema_name,
    ts.description as schema_description
FROM profiles p
LEFT JOIN training_schemas ts ON p.selected_schema_id = ts.id
WHERE p.selected_schema_id IS NOT NULL;

-- Grant permissions on views
GRANT SELECT ON active_users_view TO authenticated;
GRANT SELECT ON daily_logins_view TO authenticated;
GRANT SELECT ON completed_missions_view TO authenticated;
GRANT SELECT ON user_training_schema_view TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login);
CREATE INDEX IF NOT EXISTS idx_user_missions_completed ON user_missions(completed);
CREATE INDEX IF NOT EXISTS idx_user_missions_completed_at ON user_missions(completed_at);
