-- Create user_preferences table for storing dismiss states and other user preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preference_key VARCHAR(100) NOT NULL,
  preference_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);

-- Add RLS policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Insert some default preferences for existing users
INSERT INTO user_preferences (user_id, preference_key, preference_value)
SELECT 
  id as user_id,
  'daily_completion_dismissed' as preference_key,
  'false' as preference_value
FROM users
ON CONFLICT (user_id, preference_key) DO NOTHING;

INSERT INTO user_preferences (user_id, preference_key, preference_value)
SELECT 
  id as user_id,
  'almost_completed_dismissed' as preference_key,
  'false' as preference_value
FROM users
ON CONFLICT (user_id, preference_key) DO NOTHING;

INSERT INTO user_preferences (user_id, preference_key, preference_value)
SELECT 
  id as user_id,
  'last_dismiss_date' as preference_key,
  '2024-01-01' as preference_value
FROM users
ON CONFLICT (user_id, preference_key) DO NOTHING; 