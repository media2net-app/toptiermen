-- Fix Module Slugs - Comprehensive Solution
-- Run this in your Supabase SQL editor

-- 1. Add slug column first (if it doesn't exist)
ALTER TABLE academy_modules ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Check current state
SELECT '=== CURRENT STATE ===' as info;

SELECT 
    id,
    title,
    slug,
    status,
    order_index
FROM academy_modules
ORDER BY order_index;

-- 3. Update existing modules with slugs based on title
UPDATE academy_modules 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- 4. Make slug unique and not-null
ALTER TABLE academy_modules ALTER COLUMN slug SET NOT NULL;

-- 5. Add unique constraint (drop if exists first)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_module_slug') THEN
        ALTER TABLE academy_modules DROP CONSTRAINT unique_module_slug;
    END IF;
END $$;

ALTER TABLE academy_modules ADD CONSTRAINT unique_module_slug UNIQUE (slug);

-- 6. Show final state
SELECT '=== FINAL STATE ===' as info;

SELECT 
    id,
    title,
    slug,
    status,
    order_index
FROM academy_modules
ORDER BY order_index;

-- 7. Test a specific module lookup
SELECT '=== TEST MODULE LOOKUP ===' as info;

-- Test with a UUID
SELECT 
    id,
    title,
    slug,
    status
FROM academy_modules
WHERE id = 'ba58a203-b2d0-442b-83a3-62cfb0a79478'
   OR slug = 'discipline-identiteit'
LIMIT 1;

-- 8. Show all modules with their slugs for reference
SELECT '=== ALL MODULES WITH SLUGS ===' as info;

SELECT 
    id,
    title,
    slug,
    status,
    order_index
FROM academy_modules
ORDER BY order_index; 