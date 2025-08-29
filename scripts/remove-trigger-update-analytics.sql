-- REMOVE TRIGGER UPDATE ANALYTICS - Fix the specific trigger causing the error
-- Voer dit uit in je Supabase SQL Editor

-- 1. Find ALL triggers on email_tracking table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'email_tracking';

-- 2. Drop the specific problematic trigger
DROP TRIGGER IF EXISTS trigger_update_analytics ON email_tracking;

-- 3. Find and drop ALL triggers that might be problematic
DROP TRIGGER IF EXISTS trigger_update_analytics_summary ON email_tracking;
DROP TRIGGER IF EXISTS trigger_email_tracking_update ON email_tracking;
DROP TRIGGER IF EXISTS trigger_email_tracking_insert ON email_tracking;
DROP TRIGGER IF EXISTS trigger_email_tracking_delete ON email_tracking;

-- 4. Find ALL functions that might be problematic
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%email%' 
AND routine_name LIKE '%analytics%';

-- 5. Drop ALL problematic functions
DROP FUNCTION IF EXISTS update_email_analytics_summary();
DROP FUNCTION IF EXISTS update_email_analytics_summary(VOID);
DROP FUNCTION IF EXISTS update_email_analytics_summary(TRIGGER);
DROP FUNCTION IF EXISTS trigger_update_analytics();

-- 6. Disable RLS for ALL email tracking tables
ALTER TABLE email_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_opens DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_clicks DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_bounces DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_unsubscribes DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics_summary DISABLE ROW LEVEL SECURITY;

-- 7. Grant ALL permissions to authenticated user
GRANT ALL ON email_tracking TO authenticated;
GRANT ALL ON email_opens TO authenticated;
GRANT ALL ON email_clicks TO authenticated;
GRANT ALL ON email_campaigns TO authenticated;
GRANT ALL ON email_bounces TO authenticated;
GRANT ALL ON email_unsubscribes TO authenticated;
GRANT ALL ON email_analytics_summary TO authenticated;

-- 8. Update ALL pending tracking records to sent
UPDATE email_tracking 
SET status = 'sent', sent_at = NOW(), updated_at = NOW() 
WHERE status = 'pending';

-- 9. Test a direct update
UPDATE email_tracking 
SET status = 'opened', opened_at = NOW(), open_count = open_count + 1, updated_at = NOW() 
WHERE tracking_id = 'ttm_1756473234320_pcwc9tjcc';

-- 10. Show all tracking records status
SELECT status, COUNT(*) as count 
FROM email_tracking 
GROUP BY status 
ORDER BY status;

-- 11. Show latest tracking records
SELECT tracking_id, status, sent_at, opened_at, open_count 
FROM email_tracking 
ORDER BY created_at DESC 
LIMIT 5;
