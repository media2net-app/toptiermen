-- SIMPLE FIX ALL TRIGGERS - Remove all problematic triggers
-- Voer dit uit in je Supabase SQL Editor

-- 1. Drop ALL triggers on email_tracking table
DROP TRIGGER IF EXISTS trigger_update_analytics ON email_tracking;
DROP TRIGGER IF EXISTS trigger_update_analytics_summary ON email_tracking;
DROP TRIGGER IF EXISTS trigger_email_tracking_update ON email_tracking;
DROP TRIGGER IF EXISTS trigger_email_tracking_insert ON email_tracking;

-- 2. Drop ALL problematic functions
DROP FUNCTION IF EXISTS update_email_analytics_summary();
DROP FUNCTION IF EXISTS update_email_analytics_summary(VOID);
DROP FUNCTION IF EXISTS update_email_analytics_summary(TRIGGER);

-- 3. Disable RLS for ALL email tracking tables
ALTER TABLE email_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_opens DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_clicks DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_bounces DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_unsubscribes DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics_summary DISABLE ROW LEVEL SECURITY;

-- 4. Grant ALL permissions to authenticated user
GRANT ALL ON email_tracking TO authenticated;
GRANT ALL ON email_opens TO authenticated;
GRANT ALL ON email_clicks TO authenticated;
GRANT ALL ON email_campaigns TO authenticated;
GRANT ALL ON email_bounces TO authenticated;
GRANT ALL ON email_unsubscribes TO authenticated;
GRANT ALL ON email_analytics_summary TO authenticated;

-- 5. Update ALL pending tracking records to sent
UPDATE email_tracking 
SET status = 'sent', sent_at = NOW(), updated_at = NOW() 
WHERE status = 'pending';

-- 6. Show all tracking records status
SELECT status, COUNT(*) as count 
FROM email_tracking 
GROUP BY status 
ORDER BY status;

-- 7. Show latest tracking records
SELECT tracking_id, status, sent_at, opened_at, open_count 
FROM email_tracking 
ORDER BY created_at DESC 
LIMIT 5;
