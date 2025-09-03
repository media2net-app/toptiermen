-- 📚 ACADEMY EBOOK CONTROLE DATABASE SETUP
-- Deze SQL maakt de benodigde tabel voor ebook beheer aan

-- 1. Maak de academy_ebook_files tabel (gescheiden van bestaande academy_ebooks)
CREATE TABLE IF NOT EXISTS academy_ebook_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL UNIQUE,
  path TEXT NOT NULL,
  title TEXT NOT NULL,
  module TEXT,
  style_type TEXT NOT NULL,
  style_description TEXT,
  has_inter_font BOOLEAN DEFAULT FALSE,
  has_segoe_ui BOOLEAN DEFAULT FALSE,
  has_ebook_container BOOLEAN DEFAULT FALSE,
  has_module_badge BOOLEAN DEFAULT FALSE,
  has_enhanced_styling BOOLEAN DEFAULT FALSE,
  has_table_of_contents BOOLEAN DEFAULT FALSE,
  has_reflection_section BOOLEAN DEFAULT FALSE,
  has_action_items BOOLEAN DEFAULT FALSE,
  file_size INTEGER,
  last_modified TIMESTAMP,
  status TEXT DEFAULT 'active',
  needs_update BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Maak indexes voor betere performance
CREATE INDEX IF NOT EXISTS idx_academy_ebook_files_style_type ON academy_ebook_files(style_type);
CREATE INDEX IF NOT EXISTS idx_academy_ebook_files_module ON academy_ebook_files(module);
CREATE INDEX IF NOT EXISTS idx_academy_ebook_files_status ON academy_ebook_files(status);
CREATE INDEX IF NOT EXISTS idx_academy_ebook_files_needs_update ON academy_ebook_files(needs_update);
CREATE INDEX IF NOT EXISTS idx_academy_ebook_files_priority ON academy_ebook_files(priority);

-- 4. Voeg RLS (Row Level Security) toe
ALTER TABLE academy_ebook_files ENABLE ROW LEVEL SECURITY;

-- 5. Maak RLS policies voor admin toegang
CREATE POLICY "Admin kan alles doen met ebook files" ON academy_ebook_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 6. Voeg sample data toe (dit is handmatig data op basis van onze analyse)
INSERT INTO academy_ebook_files (
  filename, path, title, module, style_type, style_description,
  has_inter_font, has_segoe_ui, has_ebook_container, has_module_badge,
  has_enhanced_styling, has_table_of_contents, has_reflection_section, 
  has_action_items, needs_update, priority
) VALUES 
-- MODERNE STYLING (Inter font) - GOED
('discipline-identiteit-wat-is-discipline-en-waarom-is-dit-essentieel-ebook.html', '/books/discipline-identiteit-wat-is-discipline-en-waarom-is-dit-essentieel-ebook.html', 'Wat is Discipline en waarom is dit Essentieel', 'Discipline & Identiteit', 'modern', 'Moderne Inter styling (zoals Module 1 Les 1)', true, false, true, false, false, true, true, true, false, 1),

('fysieke-dominantie-waarom-is-fysieke-dominantie-zo-belangrijk--ebook.html', '/books/fysieke-dominantie-waarom-is-fysieke-dominantie-zo-belangrijk--ebook.html', 'Waarom is fysieke dominantie zo belangrijk?', 'Fysieke Dominantie', 'modern', 'Moderne Inter styling', true, false, true, false, false, true, true, true, false, 1),

('brotherhood-waarom-een-brotherhood-ebook.html', '/books/brotherhood-waarom-een-brotherhood-ebook.html', 'Waarom een Brotherhood', 'Brotherhood', 'modern', 'Moderne Inter styling', true, false, true, false, false, true, true, true, false, 1),

('business-and-finance--de-financi-le-mindset--ebook.html', '/books/business-and-finance--de-financi-le-mindset--ebook.html', 'De Financiële Mindset', 'Business & Finance', 'modern', 'Moderne Inter styling', true, false, true, false, false, true, true, true, false, 1),

('mentale-kracht-weerbaarheid-wat-is-mentale-kracht-ebook.html', '/books/mentale-kracht-weerbaarheid-wat-is-mentale-kracht-ebook.html', 'Wat is mentale kracht', 'Mentale Kracht & Weerbaarheid', 'modern', 'Moderne Inter styling', true, false, true, false, false, true, true, true, false, 1),

-- ENHANCED STYLING (Segoe UI met module badge) - REDELIJK GOED
('cut-the-weak-enhanced-ebook.html', '/books/cut-the-weak-enhanced-ebook.html', 'Cut The Weak - Brotherhood', 'Brotherhood', 'enhanced', 'Enhanced styling met module badge', false, true, false, true, true, true, true, true, true, 2),

('de-basisprincipes-van-voeding-enhanced-ebook.html', '/books/de-basisprincipes-van-voeding-enhanced-ebook.html', 'De Basisprincipes van Voeding', 'Voeding & Gezondheid', 'enhanced', 'Enhanced styling met module badge', false, true, false, true, true, true, true, true, true, 2),

('testosteron-doping-enhanced-ebook.html', '/books/testosteron-doping-enhanced-ebook.html', 'De Waarheid over Testosteron Doping', 'Testosteron', 'enhanced', 'Enhanced styling met module badge', false, true, false, true, true, true, true, true, true, 2),

-- BASIC STYLING MET MODULE BADGE - MOET WORDEN GEÜPDATET
('wat-is-testosteron-ebook.html', '/books/wat-is-testosteron-ebook.html', 'Wat is Testosteron', 'Testosteron', 'badge', 'Basis styling met module badge', false, true, false, true, false, true, false, true, true, 3),

('embrace-the-suck-ebook.html', '/books/embrace-the-suck-ebook.html', 'Embrace the Suck', 'Fysieke Dominantie', 'badge', 'Basis styling met module badge', false, true, false, true, false, true, false, true, true, 3),

('de-waarheid-over-testosteron-doping-ebook.html', '/books/de-waarheid-over-testosteron-doping-ebook.html', 'De Waarheid over Testosteron Doping', 'Testosteron', 'badge', 'Basis styling met module badge', false, true, false, true, false, true, false, true, true, 3),

-- BASIC STYLING ZONDER MODULE BADGE - HOOGSTE PRIORITEIT OM TE UPDATEN
('testosteron-basis-ebook.html', '/books/testosteron-basis-ebook.html', 'Wat is Testosteron - Basis', 'Testosteron', 'basic', 'Basis styling zonder module badge', false, true, false, false, false, false, false, false, true, 4),

('discipline-basis-ebook.html', '/books/discipline-basis-ebook.html', 'De Basis van Discipline', 'Discipline & Identiteit', 'basic', 'Basis styling zonder module badge', false, true, false, false, false, false, false, false, true, 4)

ON CONFLICT (filename) DO NOTHING;

-- 7. Update statistieken
ANALYZE academy_ebook_files;

-- 8. Maak een view voor eenvoudige statistieken
CREATE OR REPLACE VIEW academy_ebook_files_stats AS
SELECT 
  COUNT(*) as total_ebooks,
  COUNT(CASE WHEN style_type = 'modern' THEN 1 END) as modern_count,
  COUNT(CASE WHEN style_type = 'enhanced' THEN 1 END) as enhanced_count,
  COUNT(CASE WHEN style_type = 'badge' THEN 1 END) as badge_count,
  COUNT(CASE WHEN style_type = 'basic' THEN 1 END) as basic_count,
  COUNT(CASE WHEN needs_update = true THEN 1 END) as needs_update_count,
  COUNT(DISTINCT module) as unique_modules,
  ROUND(
    (COUNT(CASE WHEN style_type = 'modern' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
    2
  ) as modern_percentage
FROM academy_ebook_files;

-- 9. Voeg een trigger toe voor automatische updated_at timestamp
CREATE OR REPLACE FUNCTION update_academy_ebook_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER academy_ebook_files_updated_at
  BEFORE UPDATE ON academy_ebook_files
  FOR EACH ROW
  EXECUTE FUNCTION update_academy_ebook_files_updated_at();

-- ✅ SETUP COMPLEET
-- Voer deze SQL uit in je Supabase SQL editor om de ebook controle functionaliteit te activeren
