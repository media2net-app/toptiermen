-- Create user_online_status table if it doesn't exist
-- This table tracks which users are currently online in real-time

CREATE TABLE IF NOT EXISTS user_online_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on is_online for faster queries
CREATE INDEX IF NOT EXISTS idx_user_online_status_is_online ON user_online_status(is_online);

-- Create an index on last_seen for cleanup queries
CREATE INDEX IF NOT EXISTS idx_user_online_status_last_seen ON user_online_status(last_seen);

-- Cleanup function to mark users offline if they haven't been seen in 5 minutes
CREATE OR REPLACE FUNCTION cleanup_stale_online_status()
RETURNS void AS $$
BEGIN
  UPDATE user_online_status
  SET is_online = false
  WHERE is_online = true 
    AND last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a function to be called periodically (can be set up with pg_cron or external cron)
-- This would be called every minute to clean up stale online statuses
-- SELECT cleanup_stale_online_status();


