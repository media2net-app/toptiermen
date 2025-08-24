-- Set badge-no-excuses.png as default image for all badges
-- Run this script in Supabase SQL Editor

-- 1. Add image_url column to badges table if it doesn't exist
ALTER TABLE badges 
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) DEFAULT '/badge-no-excuses.png';

-- 2. Update all existing badges to use the default image
UPDATE badges 
SET image_url = '/badge-no-excuses.png' 
WHERE image_url IS NULL OR image_url = '';

-- 3. Verify the changes
SELECT 
  id,
  title,
  icon_name,
  image_url,
  rarity_level
FROM badges 
ORDER BY id;

-- 4. Show count of updated badges
SELECT 
  COUNT(*) as total_badges,
  COUNT(CASE WHEN image_url = '/badge-no-excuses.png' THEN 1 END) as badges_with_default_image
FROM badges;
