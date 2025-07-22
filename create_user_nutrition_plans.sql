-- Create tables for storing personalized nutrition plans
-- Run this SQL in your Supabase SQL editor

-- 1. User Nutrition Plans Table
CREATE TABLE IF NOT EXISTS user_nutrition_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL, -- 'balanced', 'low_carb', 'carnivore', 'high_protein'
    nutrition_goals JSONB NOT NULL, -- calories, protein, carbs, fat
    user_data JSONB NOT NULL, -- age, height, weight, activity_level, goal
    week_plan JSONB NOT NULL, -- the complete week plan with meals
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, is_active) -- Only one active plan per user
);

-- 2. User Meal Customizations Table
CREATE TABLE IF NOT EXISTS user_meal_customizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES user_nutrition_plans(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL, -- 'monday', 'tuesday', etc.
    meal_id VARCHAR(100) NOT NULL, -- the meal identifier
    original_meal JSONB NOT NULL, -- the original meal data
    customized_meal JSONB NOT NULL, -- the customized meal data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Nutrition Progress Table
CREATE TABLE IF NOT EXISTS user_nutrition_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES user_nutrition_plans(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    meals_completed JSONB DEFAULT '[]', -- array of completed meal IDs
    calories_consumed INTEGER DEFAULT 0,
    protein_consumed INTEGER DEFAULT 0,
    carbs_consumed INTEGER DEFAULT 0,
    fat_consumed INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_nutrition_plans_user_id ON user_nutrition_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_nutrition_plans_active ON user_nutrition_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_meal_customizations_user_id ON user_meal_customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_meal_customizations_plan_id ON user_meal_customizations(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_nutrition_progress_user_id ON user_nutrition_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_nutrition_progress_date ON user_nutrition_progress(date);

-- Enable Row Level Security (RLS)
ALTER TABLE user_nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meal_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_nutrition_plans
CREATE POLICY "Users can view their own nutrition plans" ON user_nutrition_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition plans" ON user_nutrition_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition plans" ON user_nutrition_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition plans" ON user_nutrition_plans
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_meal_customizations
CREATE POLICY "Users can view their own meal customizations" ON user_meal_customizations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal customizations" ON user_meal_customizations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal customizations" ON user_meal_customizations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal customizations" ON user_meal_customizations
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_nutrition_progress
CREATE POLICY "Users can view their own nutrition progress" ON user_nutrition_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition progress" ON user_nutrition_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition progress" ON user_nutrition_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition progress" ON user_nutrition_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE user_nutrition_plans IS 'Stores personalized nutrition plans for each user';
COMMENT ON TABLE user_meal_customizations IS 'Stores customizations made to individual meals';
COMMENT ON TABLE user_nutrition_progress IS 'Tracks daily nutrition progress and meal completion'; 