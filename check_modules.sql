-- Check which modules exist in the database
-- Run this SQL in your Supabase SQL editor

-- Show all modules with their details
SELECT 
    id,
    title,
    status,
    order_index,
    created_at
FROM academy_modules 
ORDER BY order_index;

-- Check if there's a module with "Mindset" in the title
SELECT 
    id,
    title,
    status
FROM academy_modules 
WHERE title ILIKE '%mindset%' 
   OR title ILIKE '%focus%'
   OR title ILIKE '%mentale%'
ORDER BY title;

-- Count total modules
SELECT COUNT(*) as total_modules FROM academy_modules; 