-- Mind & Focus Todos Table
CREATE TABLE IF NOT EXISTS mind_focus_todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'general' CHECK (category IN ('mind-focus', 'stress-release', 'sleep-prep', 'recovery', 'general')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_mind_focus_todos_user_id ON mind_focus_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_mind_focus_todos_created_at ON mind_focus_todos(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE mind_focus_todos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own todos" ON mind_focus_todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" ON mind_focus_todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON mind_focus_todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON mind_focus_todos
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_mind_focus_todos_updated_at 
  BEFORE UPDATE ON mind_focus_todos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
