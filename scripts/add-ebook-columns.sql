-- Voeg ontbrekende kolommen toe aan academy_ebooks tabel
ALTER TABLE academy_ebooks 
ADD COLUMN IF NOT EXISTS html_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES academy_lessons(id);

-- Voeg index toe voor betere performance
CREATE INDEX IF NOT EXISTS idx_academy_ebooks_lesson_id ON academy_ebooks(lesson_id);

-- Toon de nieuwe tabel structuur
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'academy_ebooks' 
ORDER BY ordinal_position;
