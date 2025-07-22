-- Publish all lessons from draft to published status
-- This script will update all academy_lessons that are currently in 'draft' status to 'published'

-- First, let's see what lessons are currently in draft status
SELECT 
    al.id,
    al.title,
    al.status,
    am.title as module_title,
    al.created_at
FROM academy_lessons al
JOIN academy_modules am ON al.module_id = am.id
WHERE al.status = 'draft'
ORDER BY am.title, al.order_index;

-- Update all draft lessons to published
UPDATE academy_lessons 
SET 
    status = 'published',
    updated_at = NOW()
WHERE status = 'draft';

-- Verify the changes
SELECT 
    al.id,
    al.title,
    al.status,
    am.title as module_title,
    al.updated_at
FROM academy_lessons al
JOIN academy_modules am ON al.module_id = am.id
WHERE al.status = 'published'
ORDER BY am.title, al.order_index;

-- Show summary of changes
SELECT 
    COUNT(*) as total_lessons,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_lessons,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_lessons,
    COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_lessons
FROM academy_lessons; 