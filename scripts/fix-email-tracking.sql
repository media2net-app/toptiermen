-- FIX EMAIL TRACKING ISSUES
-- This script fixes the email tracking functionality

-- 1. Update RLS policies to allow tracking updates
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON email_tracking;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON email_tracking;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON email_tracking;

CREATE POLICY "Enable read access for authenticated users" ON email_tracking
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON email_tracking
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON email_tracking
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 2. Update RLS policies for email_opens
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON email_opens;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON email_opens;

CREATE POLICY "Enable read access for authenticated users" ON email_opens
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON email_opens
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Update RLS policies for email_clicks
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON email_clicks;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON email_clicks;

CREATE POLICY "Enable read access for authenticated users" ON email_clicks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON email_clicks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Update RLS policies for email_campaigns
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON email_campaigns;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON email_campaigns;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON email_campaigns;

CREATE POLICY "Enable read access for authenticated users" ON email_campaigns
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON email_campaigns
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON email_campaigns
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Create the missing increment functions
CREATE OR REPLACE FUNCTION increment_open_count(tracking_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE email_tracking 
    SET open_count = open_count + 1
    WHERE id = tracking_id
    RETURNING open_count INTO new_count;
    
    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_click_count(tracking_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE email_tracking 
    SET click_count = click_count + 1
    WHERE id = tracking_id
    RETURNING click_count INTO new_count;
    
    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 6. Create improved tracking functions
CREATE OR REPLACE FUNCTION track_email_open_improved(tracking_id_param VARCHAR(100))
RETURNS VOID AS $$
DECLARE
    tracking_record_id UUID;
BEGIN
    -- Find the tracking record
    SELECT id INTO tracking_record_id
    FROM email_tracking 
    WHERE tracking_id = tracking_id_param;
    
    IF tracking_record_id IS NULL THEN
        RAISE EXCEPTION 'Tracking record not found: %', tracking_id_param;
    END IF;
    
    -- Update the main tracking record
    UPDATE email_tracking 
    SET 
        status = 'opened',
        opened_at = COALESCE(opened_at, NOW()),
        open_count = open_count + 1,
        updated_at = NOW()
    WHERE id = tracking_record_id;
    
    -- Update campaign stats
    UPDATE email_campaigns 
    SET 
        open_count = open_count + 1,
        updated_at = NOW()
    WHERE id = (
        SELECT campaign_id 
        FROM email_tracking 
        WHERE id = tracking_record_id
    );
    
    -- Insert detailed open record
    INSERT INTO email_opens (tracking_id, opened_at)
    VALUES (tracking_record_id, NOW());
    
    RAISE NOTICE 'Email open tracked successfully for tracking_id: %', tracking_id_param;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to update tracking status to sent
CREATE OR REPLACE FUNCTION update_tracking_to_sent(tracking_id_param VARCHAR(100))
RETURNS VOID AS $$
DECLARE
    tracking_record_id UUID;
    campaign_record_id UUID;
BEGIN
    -- Find the tracking record
    SELECT id, campaign_id INTO tracking_record_id, campaign_record_id
    FROM email_tracking 
    WHERE tracking_id = tracking_id_param;
    
    IF tracking_record_id IS NULL THEN
        RAISE EXCEPTION 'Tracking record not found: %', tracking_id_param;
    END IF;
    
    -- Update tracking record to sent
    UPDATE email_tracking 
    SET 
        status = 'sent',
        sent_at = NOW(),
        updated_at = NOW()
    WHERE id = tracking_record_id;
    
    -- Update campaign stats
    UPDATE email_campaigns 
    SET 
        sent_count = sent_count + 1,
        updated_at = NOW()
    WHERE id = campaign_record_id;
    
    RAISE NOTICE 'Tracking status updated to sent for tracking_id: %', tracking_id_param;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to get tracking status
CREATE OR REPLACE FUNCTION get_tracking_status(tracking_id_param VARCHAR(100))
RETURNS TABLE(
    id UUID,
    status VARCHAR(50),
    open_count INTEGER,
    click_count INTEGER,
    opened_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        et.id,
        et.status,
        et.open_count,
        et.click_count,
        et.opened_at,
        et.sent_at
    FROM email_tracking et
    WHERE et.tracking_id = tracking_id_param;
END;
$$ LANGUAGE plpgsql;

-- 9. Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION track_email_open_improved(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION update_tracking_to_sent(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tracking_status(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_open_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_click_count(UUID) TO authenticated;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_tracking_tracking_id ON email_tracking(tracking_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_status ON email_tracking(status);
CREATE INDEX IF NOT EXISTS idx_email_tracking_campaign_id ON email_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_opens_tracking_id ON email_opens(tracking_id);
CREATE INDEX IF NOT EXISTS idx_email_clicks_tracking_id ON email_clicks(tracking_id);

-- 11. Update existing tracking records to sent status if they have sent_at
UPDATE email_tracking 
SET status = 'sent' 
WHERE sent_at IS NOT NULL AND status = 'pending';

-- 12. Create a view for debugging tracking issues
CREATE OR REPLACE VIEW tracking_debug_view AS
SELECT 
    et.tracking_id,
    et.status,
    et.sent_at,
    et.opened_at,
    et.open_count,
    et.click_count,
    et.recipient_email,
    ec.name as campaign_name,
    ec.sent_count as campaign_sent,
    ec.open_count as campaign_opens
FROM email_tracking et
LEFT JOIN email_campaigns ec ON et.campaign_id = ec.id
ORDER BY et.created_at DESC;

-- 13. Grant permissions on the debug view
GRANT SELECT ON tracking_debug_view TO authenticated;

-- 14. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;

COMMENT ON FUNCTION track_email_open_improved(VARCHAR) IS 'Improved function to track email opens with better error handling';
COMMENT ON FUNCTION update_tracking_to_sent(VARCHAR) IS 'Function to update tracking status to sent';
COMMENT ON FUNCTION get_tracking_status(VARCHAR) IS 'Function to get tracking status for debugging';
COMMENT ON FUNCTION increment_open_count(UUID) IS 'Function to increment open count for tracking';
COMMENT ON FUNCTION increment_click_count(UUID) IS 'Function to increment click count for tracking';
COMMENT ON VIEW tracking_debug_view IS 'Debug view for tracking issues';
