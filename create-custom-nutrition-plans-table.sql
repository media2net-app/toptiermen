-- Create custom_nutrition_plans table
CREATE TABLE IF NOT EXISTS custom_nutrition_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  base_plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint on user_id and base_plan_id
CREATE UNIQUE INDEX IF NOT EXISTS custom_nutrition_plans_user_base_plan_unique 
ON custom_nutrition_plans(user_id, base_plan_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS custom_nutrition_plans_user_id_idx 
ON custom_nutrition_plans(user_id);

CREATE INDEX IF NOT EXISTS custom_nutrition_plans_base_plan_id_idx 
ON custom_nutrition_plans(base_plan_id);

-- Enable RLS
ALTER TABLE custom_nutrition_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own custom plans" ON custom_nutrition_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom plans" ON custom_nutrition_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom plans" ON custom_nutrition_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom plans" ON custom_nutrition_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE custom_nutrition_plans IS 'Stores user-customized nutrition plans based on base plans';
COMMENT ON COLUMN custom_nutrition_plans.user_id IS 'ID of the user who created the custom plan';
COMMENT ON COLUMN custom_nutrition_plans.base_plan_id IS 'ID of the base plan this custom plan is based on';
COMMENT ON COLUMN custom_nutrition_plans.plan_name IS 'Display name for the custom plan';
COMMENT ON COLUMN custom_nutrition_plans.plan_data IS 'Complete plan data including meals, ingredients, and nutrition info';
