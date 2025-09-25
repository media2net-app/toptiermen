-- Create user_week_completion_modal_views table for tracking modal views
CREATE TABLE IF NOT EXISTS user_week_completion_modal_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schema_id UUID NOT NULL REFERENCES training_schemas(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 8),
  modal_shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modal_closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one modal view record per user per schema per week
  UNIQUE(user_id, schema_id, week_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_week_completion_modal_views_user_id ON user_week_completion_modal_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_week_completion_modal_views_schema_id ON user_week_completion_modal_views(schema_id);
CREATE INDEX IF NOT EXISTS idx_user_week_completion_modal_views_week_number ON user_week_completion_modal_views(week_number);

-- Enable Row Level Security (RLS)
ALTER TABLE user_week_completion_modal_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own modal views
CREATE POLICY "Users can view own modal views" ON user_week_completion_modal_views
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own modal views
CREATE POLICY "Users can create own modal views" ON user_week_completion_modal_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own modal views
CREATE POLICY "Users can update own modal views" ON user_week_completion_modal_views
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can see all modal views
CREATE POLICY "Admins can view all modal views" ON user_week_completion_modal_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
