-- Create nutrition profiles table
CREATE TABLE IF NOT EXISTS nutrition_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    age INTEGER NOT NULL,
    height INTEGER NOT NULL, -- in cm
    weight DECIMAL(5,2) NOT NULL, -- in kg
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    activity_level VARCHAR(20) NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    goal VARCHAR(20) NOT NULL CHECK (goal IN ('cut', 'maintain', 'bulk')),
    target_calories INTEGER,
    target_protein INTEGER,
    target_carbs INTEGER,
    target_fat INTEGER,
    bmr DECIMAL(8,2), -- Basal Metabolic Rate
    tdee DECIMAL(8,2), -- Total Daily Energy Expenditure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nutrition_profiles_user_id ON nutrition_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_profiles_created_at ON nutrition_profiles(created_at);

-- Enable Row Level Security
ALTER TABLE nutrition_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own nutrition profile" ON nutrition_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition profile" ON nutrition_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition profile" ON nutrition_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition profile" ON nutrition_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_nutrition_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_nutrition_profiles_updated_at 
    BEFORE UPDATE ON nutrition_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_nutrition_profiles_updated_at();

-- Insert sample data for testing
INSERT INTO nutrition_profiles (
    user_id,
    age,
    height,
    weight,
    gender,
    activity_level,
    goal,
    target_calories,
    target_protein,
    target_carbs,
    target_fat,
    bmr,
    tdee
) VALUES 
(
    '061e43d5-c89a-42bb-8a4c-04be2ce99a7e', -- Chiel's user ID
    30,
    180,
    75.0,
    'male',
    'moderate',
    'maintain',
    2200,
    165,
    220,
    73,
    1750.0,
    2200.0
) ON CONFLICT (user_id) DO NOTHING;
