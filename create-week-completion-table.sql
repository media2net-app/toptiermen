-- Create user_week_completions table for tracking completed weeks
CREATE TABLE IF NOT EXISTS user_week_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 8),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_days JSONB NOT NULL, -- Array of completed day objects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one completion per user per schema per week
  UNIQUE(user_id, schema_id, week_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_week_completions_user_id ON user_week_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_week_completions_schema_id ON user_week_completions(schema_id);
CREATE INDEX IF NOT EXISTS idx_user_week_completions_week_number ON user_week_completions(week_number);
CREATE INDEX IF NOT EXISTS idx_user_week_completions_completed_at ON user_week_completions(completed_at);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_week_completion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_week_completions_updated_at ON user_week_completions;
CREATE TRIGGER update_user_week_completions_updated_at
  BEFORE UPDATE ON user_week_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_week_completion_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE user_week_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own week completions
CREATE POLICY "Users can view own week completions" ON user_week_completions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own week completions
CREATE POLICY "Users can create own week completions" ON user_week_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own week completions
CREATE POLICY "Users can update own week completions" ON user_week_completions
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can see all week completions
CREATE POLICY "Admins can view all week completions" ON user_week_completions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all week completions
CREATE POLICY "Admins can update all week completions" ON user_week_completions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete all week completions
CREATE POLICY "Admins can delete all week completions" ON user_week_completions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
