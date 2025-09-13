-- Create V2 nutrition profiles table for better data management
CREATE TABLE IF NOT EXISTS nutrition_profiles_v2 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0 AND weight < 500),
    height INTEGER NOT NULL CHECK (height > 0 AND height < 300),
    age INTEGER NOT NULL CHECK (age > 0 AND age < 120),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
    activity_level VARCHAR(20) NOT NULL CHECK (activity_level IN ('sedentary', 'moderate', 'very_active')),
    fitness_goal VARCHAR(20) NOT NULL CHECK (fitness_goal IN ('droogtrainen', 'onderhoud', 'spiermassa')),
    target_calories INTEGER,
    target_protein DECIMAL(6,2),
    target_carbs DECIMAL(6,2),
    target_fat DECIMAL(6,2),
    bmr DECIMAL(8,2),
    tdee DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nutrition_profiles_v2_user_id ON nutrition_profiles_v2(user_id);

-- Enable RLS
ALTER TABLE nutrition_profiles_v2 ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own nutrition profile v2" ON nutrition_profiles_v2
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition profile v2" ON nutrition_profiles_v2
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition profile v2" ON nutrition_profiles_v2
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition profile v2" ON nutrition_profiles_v2
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_nutrition_profiles_v2_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_nutrition_profiles_v2_updated_at
    BEFORE UPDATE ON nutrition_profiles_v2
    FOR EACH ROW
    EXECUTE FUNCTION update_nutrition_profiles_v2_updated_at();
