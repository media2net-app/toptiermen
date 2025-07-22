-- Fix Testosteron module position to 7
-- Run this in your Supabase SQL editor

-- 1. First, let's see the current state
SELECT 
    id,
    title,
    order_index,
    status
FROM academy_modules 
WHERE title LIKE '%Testosteron%'
ORDER BY order_index;

-- 2. Update Testosteron module to position 7
UPDATE academy_modules 
SET order_index = 7
WHERE title = 'Testosteron';

-- 3. Verify the change
SELECT 
    id,
    title,
    order_index,
    status
FROM academy_modules 
WHERE title = 'Testosteron';

-- 4. Show all modules in correct order
SELECT 
    id,
    title,
    order_index,
    status
FROM academy_modules 
ORDER BY order_index; 