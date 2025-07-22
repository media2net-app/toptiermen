-- Check and fix module order_index values
-- Run this in your Supabase SQL editor

-- 1. Check current order_index values
SELECT 
    id,
    title,
    order_index,
    status,
    created_at
FROM academy_modules 
ORDER BY order_index;

-- 2. Check if there are any modules with NULL or 0 order_index
SELECT 
    id,
    title,
    order_index,
    status
FROM academy_modules 
WHERE order_index IS NULL OR order_index = 0
ORDER BY created_at;

-- 3. Update order_index based on creation date if needed
-- This will assign order_index 1, 2, 3, etc. based on when modules were created
UPDATE academy_modules 
SET order_index = subquery.new_order
FROM (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY created_at) as new_order
    FROM academy_modules
    WHERE status = 'published'
) as subquery
WHERE academy_modules.id = subquery.id;

-- 4. If you want to manually set specific order_index values:
-- UPDATE academy_modules SET order_index = 7 WHERE title = 'Testosteron';
-- UPDATE academy_modules SET order_index = 1 WHERE title = 'Discipline & Identiteit';
-- UPDATE academy_modules SET order_index = 2 WHERE title = 'Fysieke Dominantie';
-- etc.

-- 5. Check final result
SELECT 
    id,
    title,
    order_index,
    status,
    created_at
FROM academy_modules 
ORDER BY order_index; 