-- Fix duplicate modules by removing duplicates and keeping only the first occurrence
-- Run this SQL in your Supabase SQL editor

-- First, let's see what duplicates we have
SELECT 
    title,
    COUNT(*) as count,
    array_agg(id ORDER BY created_at) as module_ids,
    array_agg(created_at ORDER BY created_at) as created_dates
FROM academy_modules 
GROUP BY title 
HAVING COUNT(*) > 1
ORDER BY title;

-- Now remove duplicates, keeping only the first (oldest) occurrence of each module
DELETE FROM academy_modules 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at) as rn
        FROM academy_modules
    ) ranked
    WHERE rn > 1
);

-- Verify the result - should show no duplicates
SELECT 
    title,
    COUNT(*) as count
FROM academy_modules 
GROUP BY title 
HAVING COUNT(*) > 1
ORDER BY title;

-- Show final modules
SELECT 
    id,
    title,
    status,
    order_index,
    created_at
FROM academy_modules 
ORDER BY order_index; 