-- Disable Problematic Trigger Only
-- Voer dit uit in je Supabase SQL Editor

-- 1. Just disable the problematic trigger
DROP TRIGGER IF EXISTS trigger_update_analytics ON email_tracking;

-- 2. Disable RLS for email tracking tables
ALTER TABLE email_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_opens DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns DISABLE ROW LEVEL SECURITY;

-- 3. Grant full permissions
GRANT ALL ON email_tracking TO authenticated;
GRANT ALL ON email_opens TO authenticated;
GRANT ALL ON email_campaigns TO authenticated;

-- 4. Test direct update on the latest tracking record
UPDATE email_tracking 
SET status = 'sent', sent_at = NOW(), updated_at = NOW() 
WHERE tracking_id = 'ttm_1756472475344_3j6agf2hm';

-- 5. Check result
SELECT tracking_id, status, sent_at, open_count FROM email_tracking 
WHERE tracking_id = 'ttm_1756472475344_3j6agf2hm';
