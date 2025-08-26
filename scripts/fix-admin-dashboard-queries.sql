-- Fix admin dashboard queries by creating missing views and fixing column references

-- Create view for active users (users with activity in the last 30 days)
CREATE OR REPLACE VIEW active_users_view AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_login,
    CASE 
        WHEN u.last_login >= NOW() - INTERVAL '30 days' THEN true
        ELSE false
    END as is_active
FROM users u
WHERE u.last_login IS NOT NULL;

-- Create view for daily logins (users who logged in this week)
CREATE OR REPLACE VIEW daily_logins_view AS
SELECT 
    u.id,
    u.email,
    u.last_login,
    DATE(u.last_login) as login_date
FROM users u
WHERE u.last_login >= NOW() - INTERVAL '7 days';

-- Create view for completed missions
CREATE OR REPLACE VIEW completed_missions_view AS
SELECT 
    um.id,
    um.user_id,
    um.title,
    um.category,
    um.status,
    um.completed_at,
    um.last_completion_date,
    um.frequency_type,
    um.xp_reward
FROM user_missions um
WHERE um.status = 'completed';

-- Create view for user training schemas
CREATE OR REPLACE VIEW user_training_schema_view AS
SELECT 
    u.id as user_id,
    u.email,
    u.selected_schema_id,
    ts.id as schema_id,
    ts.name as schema_name,
    ts.description as schema_description
FROM users u
LEFT JOIN training_schemas ts ON u.selected_schema_id = ts.id
WHERE u.selected_schema_id IS NOT NULL;

-- Grant permissions on views
GRANT SELECT ON active_users_view TO authenticated;
GRANT SELECT ON daily_logins_view TO authenticated;
GRANT SELECT ON completed_missions_view TO authenticated;
GRANT SELECT ON user_training_schema_view TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_user_missions_status ON user_missions(status);
CREATE INDEX IF NOT EXISTS idx_user_missions_completed_at ON user_missions(completed_at);
