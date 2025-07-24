-- Create user_presence table for real-time online status
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS user_presence_user_id_idx ON user_presence(user_id);

-- Create index on is_online for fast filtering
CREATE INDEX IF NOT EXISTS user_presence_is_online_idx ON user_presence(is_online);

-- Create index on last_seen for cleanup operations
CREATE INDEX IF NOT EXISTS user_presence_last_seen_idx ON user_presence(last_seen);

-- Enable Row Level Security
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read all presence data (for online status)
CREATE POLICY "Users can read all presence data" ON user_presence
  FOR SELECT USING (true);

-- Users can only update their own presence
CREATE POLICY "Users can update own presence" ON user_presence
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own presence
CREATE POLICY "Users can insert own presence" ON user_presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(is_online_status BOOLEAN)
RETURNS void AS $$
BEGIN
  INSERT INTO user_presence (user_id, is_online, last_seen)
  VALUES (auth.uid(), is_online_status, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark user as online
CREATE OR REPLACE FUNCTION mark_user_online()
RETURNS void AS $$
BEGIN
  PERFORM update_user_presence(true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark user as offline
CREATE OR REPLACE FUNCTION mark_user_offline()
RETURNS void AS $$
BEGIN
  PERFORM update_user_presence(false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old offline records (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_presence()
RETURNS void AS $$
BEGIN
  DELETE FROM user_presence 
  WHERE is_online = false 
  AND last_seen < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for the user_presence table
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- Insert initial presence records for existing users
INSERT INTO user_presence (user_id, is_online, last_seen)
SELECT id, false, NOW() - INTERVAL '1 hour'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_presence); 