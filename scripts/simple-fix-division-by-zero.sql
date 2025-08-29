-- Simple Fix for Division by Zero Error
-- Voer dit uit in je Supabase SQL Editor

-- 1. Just disable the problematic trigger temporarily
DROP TRIGGER IF EXISTS trigger_update_analytics ON email_tracking;

-- 2. Test direct update on the latest tracking record
UPDATE email_tracking 
SET status = 'sent', sent_at = NOW(), updated_at = NOW() 
WHERE tracking_id = 'ttm_1756472475344_3j6agf2hm';

-- 3. Check result
SELECT tracking_id, status, sent_at, open_count FROM email_tracking 
WHERE tracking_id = 'ttm_1756472475344_3j6agf2hm';

-- 4. Test open tracking update
UPDATE email_tracking 
SET status = 'opened', opened_at = NOW(), open_count = open_count + 1, updated_at = NOW() 
WHERE tracking_id = 'ttm_1756472475344_3j6agf2hm';

-- 5. Check final result
SELECT tracking_id, status, sent_at, opened_at, open_count FROM email_tracking 
WHERE tracking_id = 'ttm_1756472475344_3j6agf2hm';
