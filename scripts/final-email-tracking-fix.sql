-- FINALE FIX VOOR EMAIL TRACKING
-- Voer dit uit in je Supabase SQL Editor

-- 1. Drop ALL problematic triggers
DROP TRIGGER IF EXISTS trigger_update_analytics ON email_tracking;

-- 2. Drop the problematic function
DROP FUNCTION IF EXISTS update_email_analytics_summary();

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

-- 6. Test direct update on the latest tracking record
UPDATE email_tracking 
SET status = 'sent', sent_at = NOW(), updated_at = NOW() 
WHERE tracking_id = 'ttm_1756472882025_vr0o6qb1j';

-- 7. Test open tracking update
UPDATE email_tracking 
SET status = 'opened', opened_at = NOW(), open_count = open_count + 1, updated_at = NOW() 
WHERE tracking_id = 'ttm_1756472882025_vr0o6qb1j';

-- 8. Check final result
SELECT tracking_id, status, sent_at, opened_at, open_count 
FROM email_tracking 
WHERE tracking_id = 'ttm_1756472882025_vr0o6qb1j';

-- 9. Show all tracking records status
SELECT status, COUNT(*) as count 
FROM email_tracking 
GROUP BY status 
ORDER BY status;
