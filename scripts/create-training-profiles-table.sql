-- Create training_profiles table for personalized training schema recommendations

CREATE TABLE IF NOT EXISTS training_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  training_goal VARCHAR(50) NOT NULL CHECK (training_goal IN ('spiermassa', 'kracht_uithouding', 'power_kracht')),
  training_frequency INTEGER NOT NULL CHECK (training_frequency IN (3, 4, 5, 6)),
  experience_level VARCHAR(20) NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  equipment_type VARCHAR(20) NOT NULL CHECK (equipment_type IN ('gym', 'home', 'outdoor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_training_profiles_user_id ON training_profiles(user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_training_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_training_profiles_updated_at ON training_profiles;
CREATE TRIGGER trigger_update_training_profiles_updated_at
  BEFORE UPDATE ON training_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_training_profiles_updated_at();

-- Enable Row Level Security
ALTER TABLE training_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own training profile" ON training_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training profile" ON training_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training profile" ON training_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training profile" ON training_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON training_profiles TO authenticated;
GRANT ALL ON training_profiles TO service_role;
