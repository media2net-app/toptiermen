-- Create nutrition_plans table for storing frontend migrated plans
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id SERIAL PRIMARY KEY,
  plan_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon VARCHAR(10),
  color VARCHAR(100),
  meals JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_plan_id ON nutrition_plans(plan_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_active ON nutrition_plans(is_active);

-- Add RLS (Row Level Security) policies
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active plans
CREATE POLICY "Allow authenticated users to read active nutrition plans" ON nutrition_plans
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Allow only admins to insert/update/delete plans
CREATE POLICY "Allow admins to manage nutrition plans" ON nutrition_plans
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Insert some sample data (optional)
INSERT INTO nutrition_plans (plan_id, name, subtitle, description, icon, color, meals, is_active) VALUES
(
  'balanced',
  'Gebalanceerd',
  'Voor duurzame energie en algehele gezondheid',
  'Een mix van alle macronutriënten',
  '🥗',
  'from-green-500 to-emerald-600',
  '[]'::jsonb,
  true
),
(
  'low_carb',
  'Koolhydraatarm / Keto',
  'Focus op vetverbranding en een stabiele bloedsuikerspiegel',
  'Minimale koolhydraten, hoog in gezonde vetten',
  '🥑',
  'from-purple-500 to-indigo-600',
  '[]'::jsonb,
  true
),
(
  'carnivore',
  'Carnivoor (Rick''s Aanpak)',
  'Voor maximale eenvoud en het elimineren van potentiële triggers',
  'Eet zoals de oprichter',
  '🥩',
  'from-red-500 to-orange-600',
  '[]'::jsonb,
  true
),
(
  'high_protein',
  'High Protein',
  'Geoptimaliseerd voor maximale spieropbouw en herstel',
  'Maximale eiwitinname voor spiergroei',
  '💪',
  'from-blue-500 to-cyan-600',
  '[]'::jsonb,
  true
)
ON CONFLICT (plan_id) DO NOTHING;
