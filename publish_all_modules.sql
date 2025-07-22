-- Publish all modules from draft to published status
-- This script will update all academy_modules that are currently in 'draft' status to 'published'

-- First, let's see what modules are currently in draft status
SELECT 
    id,
    title,
    status,
    slug,
    created_at
FROM academy_modules
WHERE status = 'draft'
ORDER BY order_index;

-- Update all draft modules to published
UPDATE academy_modules 
SET 
    status = 'published',
    updated_at = NOW()
WHERE status = 'draft';

-- Verify the changes
SELECT 
    id,
    title,
    status,
    slug,
    updated_at
FROM academy_modules
WHERE status = 'published'
ORDER BY order_index;

-- Show summary of all modules
SELECT 
    COUNT(*) as total_modules,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_modules,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_modules,
    COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_modules
FROM academy_modules; 