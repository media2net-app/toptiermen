-- Create unit_types table for managing ingredient unit types
-- This table will store new unit types that can be added via the UI
CREATE TABLE IF NOT EXISTS unit_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  value VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table for managing ingredient categories
-- This table will store new categories that can be added via the UI
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#8BAE5A',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default unit types (only if they don't exist)
INSERT INTO unit_types (name, value, description) VALUES
  ('Per 100 gram', 'per_100g', 'Standaard voedingswaarden per 100 gram'),
  ('Per 30 gram', 'per_30g', 'Voedingswaarden per 30 gram (handje noten)'),
  ('Per stuk', 'per_piece', 'Voedingswaarden per individueel stuk'),
  ('Per handje', 'per_handful', 'Voedingswaarden per handje (ongeveer 30-50g)')
ON CONFLICT (value) DO NOTHING;

-- Insert default categories (only if they don't exist)
INSERT INTO categories (name, description, color) VALUES
  ('Granen', 'Brood, pasta, rijst en andere granen', '#F59E0B'),
  ('Eiwitten', 'Vlees, vis, eieren en andere eiwitbronnen', '#EF4444'),
  ('Vetten', 'Oliën, boter en andere vetbronnen', '#8B5CF6'),
  ('Fruit', 'Vers fruit en vruchten', '#EC4899'),
  ('Zuivel', 'Melk, kaas, yoghurt en andere zuivelproducten', '#06B6D4'),
  ('Vlees', 'Rundvlees, varkensvlees, kip en andere vleessoorten', '#EF4444'),
  ('Vis', 'Zeevruchten en vissoorten', '#3B82F6'),
  ('Groenten', 'Verse groenten en bladgroenten', '#8BAE5A'),
  ('Noten', 'Noten, zaden en pitten', '#F97316'),
  ('Eieren', 'Eieren in verschillende bereidingen', '#F59E0B'),
  ('Peulvruchten', 'Bonen, linzen en andere peulvruchten', '#8BAE5A'),
  ('Orgaanvlees', 'Lever, nieren en ander orgaanvlees', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_unit_types_value ON unit_types(value);
CREATE INDEX IF NOT EXISTS idx_unit_types_name ON unit_types(name);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Enable Row Level Security
ALTER TABLE unit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read unit types and categories
CREATE POLICY "Allow authenticated users to read unit types" ON unit_types
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read categories" ON categories
  FOR SELECT TO authenticated USING (true);

-- Allow service role to manage unit types and categories
CREATE POLICY "Allow service role to manage unit types" ON unit_types
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role to manage categories" ON categories
  FOR ALL TO service_role USING (true);

-- Verify the tables were created successfully
SELECT 'unit_types table created successfully' as status, COUNT(*) as record_count FROM unit_types;
SELECT 'categories table created successfully' as status, COUNT(*) as record_count FROM categories;
