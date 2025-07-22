-- Publish all content from draft to published status
-- This script will update all academy_modules and academy_lessons that are currently in 'draft' status to 'published'

-- =====================================================
-- STEP 1: Show current status before changes
-- =====================================================

-- Show current module status
SELECT 'MODULES STATUS BEFORE:' as info;
SELECT 
    COUNT(*) as total_modules,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_modules,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_modules,
    COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_modules
FROM academy_modules;

-- Show current lesson status
SELECT 'LESSONS STATUS BEFORE:' as info;
SELECT 
    COUNT(*) as total_lessons,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_lessons,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_lessons,
    COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_lessons
FROM academy_lessons;

-- Show draft modules that will be published
SELECT 'DRAFT MODULES TO PUBLISH:' as info;
SELECT 
    id,
    title,
    status,
    slug,
    order_index
FROM academy_modules
WHERE status = 'draft'
ORDER BY order_index;

-- Show draft lessons that will be published
SELECT 'DRAFT LESSONS TO PUBLISH:' as info;
SELECT 
    al.id,
    al.title,
    al.status,
    am.title as module_title,
    al.order_index
FROM academy_lessons al
JOIN academy_modules am ON al.module_id = am.id
WHERE al.status = 'draft'
ORDER BY am.title, al.order_index;

-- =====================================================
-- STEP 2: Publish all draft content
-- =====================================================

-- Publish all draft modules
UPDATE academy_modules 
SET 
    status = 'published',
    updated_at = NOW()
WHERE status = 'draft';

-- Publish all draft lessons
UPDATE academy_lessons 
SET 
    status = 'published',
    updated_at = NOW()
WHERE status = 'draft';

-- =====================================================
-- STEP 3: Verify changes
-- =====================================================

-- Show final module status
SELECT 'MODULES STATUS AFTER:' as info;
SELECT 
    COUNT(*) as total_modules,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_modules,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_modules,
    COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_modules
FROM academy_modules;

-- Show final lesson status
SELECT 'LESSONS STATUS AFTER:' as info;
SELECT 
    COUNT(*) as total_lessons,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_lessons,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_lessons,
    COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_lessons
FROM academy_lessons;

-- Show all published modules
SELECT 'ALL PUBLISHED MODULES:' as info;
SELECT 
    id,
    title,
    status,
    slug,
    order_index,
    updated_at
FROM academy_modules
WHERE status = 'published'
ORDER BY order_index;

-- Show all published lessons
SELECT 'ALL PUBLISHED LESSONS:' as info;
SELECT 
    al.id,
    al.title,
    al.status,
    am.title as module_title,
    al.order_index,
    al.updated_at
FROM academy_lessons al
JOIN academy_modules am ON al.module_id = am.id
WHERE al.status = 'published'
ORDER BY am.title, al.order_index;

-- =====================================================
-- SUMMARY
-- =====================================================
SELECT 'PUBLISHING COMPLETE!' as status;
SELECT 'All draft content has been published successfully.' as message; 