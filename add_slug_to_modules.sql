-- Voeg slug kolom toe aan academy_modules tabel
ALTER TABLE academy_modules ADD COLUMN IF NOT EXISTS slug TEXT;

-- Update bestaande modules met slug op basis van titel
UPDATE academy_modules 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Maak slug uniek en niet-null
ALTER TABLE academy_modules ALTER COLUMN slug SET NOT NULL;
ALTER TABLE academy_modules ADD CONSTRAINT unique_module_slug UNIQUE (slug);
