-- Disable RLS for Email Tracking Tables
-- Voer dit uit in je Supabase SQL Editor

-- 1. Drop all RLS policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON email_tracking;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON email_tracking;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON email_tracking;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON email_tracking;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON email_opens;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON email_opens;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON email_opens;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON email_opens;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON email_campaigns;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON email_campaigns;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON email_campaigns;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON email_campaigns;

-- 2. Disable RLS temporarily
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

-- 6. Test open tracking update
UPDATE email_tracking 
SET status = 'opened', opened_at = NOW(), open_count = open_count + 1, updated_at = NOW() 
WHERE tracking_id = 'ttm_1756472475344_3j6agf2hm';

-- 7. Check final result
SELECT tracking_id, status, sent_at, opened_at, open_count FROM email_tracking 
WHERE tracking_id = 'ttm_1756472475344_3j6agf2hm';
