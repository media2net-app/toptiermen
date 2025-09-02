-- Add slug column to academy_lessons table
ALTER TABLE academy_lessons ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Create index on slug for better performance
CREATE INDEX IF NOT EXISTS idx_academy_lessons_slug ON academy_lessons(slug);

-- Update existing lessons with slugs based on their titles
UPDATE academy_lessons 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Show the results
SELECT 
  id,
  title,
  slug,
  order_index,
  module_id
FROM academy_lessons 
ORDER BY order_index 
LIMIT 10;
