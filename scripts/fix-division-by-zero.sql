-- Fix Division by Zero Error in Email Analytics Summary
-- Voer dit uit in je Supabase SQL Editor

-- 1. Drop the existing trigger
DROP TRIGGER IF EXISTS trigger_update_analytics ON email_tracking;

-- 2. Drop the existing function
DROP FUNCTION IF EXISTS update_email_analytics_summary();

-- 3. Create the fixed function with NULLIF to prevent division by zero
CREATE OR REPLACE FUNCTION update_email_analytics_summary()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO email_analytics_summary (
        campaign_id, 
        date, 
        total_sent, 
        total_delivered, 
        total_opened, 
        total_clicked, 
        total_bounced, 
        total_unsubscribed,
        open_rate,
        click_rate,
        bounce_rate,
        unsubscribe_rate
    )
    SELECT 
        et.campaign_id,
        DATE(et.sent_at) as date,
        COUNT(*) as total_sent,
        COUNT(CASE WHEN et.status IN ('delivered', 'opened', 'clicked') THEN 1 END) as total_delivered,
        COUNT(CASE WHEN et.status IN ('opened', 'clicked') THEN 1 END) as total_opened,
        COUNT(CASE WHEN et.status = 'clicked' THEN 1 END) as total_clicked,
        COUNT(CASE WHEN et.status = 'bounced' THEN 1 END) as total_bounced,
        COUNT(CASE WHEN et.status = 'unsubscribed' THEN 1 END) as total_unsubscribed,
        ROUND(
            (COUNT(CASE WHEN et.status IN ('opened', 'clicked') THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(CASE WHEN et.status IN ('delivered', 'opened', 'clicked') THEN 1 END), 0)::DECIMAL) * 100, 2
        ) as open_rate,
        ROUND(
            (COUNT(CASE WHEN et.status = 'clicked' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(CASE WHEN et.status IN ('delivered', 'opened', 'clicked') THEN 1 END), 0)::DECIMAL) * 100, 2
        ) as click_rate,
        ROUND(
            (COUNT(CASE WHEN et.status = 'bounced' THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)::DECIMAL) * 100, 2
        ) as bounce_rate,
        ROUND(
            (COUNT(CASE WHEN et.status = 'unsubscribed' THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)::DECIMAL) * 100, 2
        ) as unsubscribe_rate
    FROM email_tracking et
    WHERE et.sent_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY et.campaign_id, DATE(et.sent_at)
    ON CONFLICT (campaign_id, date) DO UPDATE SET
        total_sent = EXCLUDED.total_sent,
        total_delivered = EXCLUDED.total_delivered,
        total_opened = EXCLUDED.total_opened,
        total_clicked = EXCLUDED.total_clicked,
        total_bounced = EXCLUDED.total_bounced,
        total_unsubscribed = EXCLUDED.total_unsubscribed,
        open_rate = EXCLUDED.open_rate,
        click_rate = EXCLUDED.click_rate,
        bounce_rate = EXCLUDED.bounce_rate,
        unsubscribe_rate = EXCLUDED.unsubscribe_rate,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recreate the trigger
CREATE TRIGGER trigger_update_analytics
    AFTER INSERT OR UPDATE ON email_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_email_analytics_summary();

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION update_email_analytics_summary() TO authenticated;

-- 6. Test the function
SELECT update_email_analytics_summary();

-- 7. Check if it worked
SELECT * FROM email_analytics_summary LIMIT 5;
