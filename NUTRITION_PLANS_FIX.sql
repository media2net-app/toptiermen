-- Complete fix voor nutrition_plans tabel
-- Voer dit uit in: https://supabase.com/dashboard/project/wkjvstuttbeyqzyjayxj/sql

-- 1. Voeg ontbrekende kolommen toe
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS color VARCHAR(100);
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS icon VARCHAR(10);
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS meals JSONB;
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE nutrition_plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Maak indexes aan
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_active ON nutrition_plans(is_active);

-- 3. Enable Row Level Security
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;

-- 4. Drop bestaande policies (als ze bestaan)
DROP POLICY IF EXISTS "Allow authenticated users to read active nutrition plans" ON nutrition_plans;
DROP POLICY IF EXISTS "Allow admins to manage nutrition plans" ON nutrition_plans;

-- 5. Maak nieuwe policies aan
CREATE POLICY "Allow authenticated users to read active nutrition plans" ON nutrition_plans
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Allow admins to manage nutrition plans" ON nutrition_plans
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- 6. Update bestaande records om is_active te zetten
UPDATE nutrition_plans SET is_active = true WHERE is_active IS NULL;

-- 7. Toon resultaat
SELECT 'Tabel fix voltooid!' as status;
SELECT COUNT(*) as total_plans FROM nutrition_plans;
