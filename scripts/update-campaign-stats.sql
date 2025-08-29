-- Update campaign statistics with correct values
UPDATE bulk_email_campaigns
SET
    sent_count = 6,
    open_count = 0,
    click_count = 0,
    updated_at = NOW()
WHERE id = '04d3f4a1-f62f-4e08-8e06-4373dafcda43';

-- Verify the update
SELECT 
    id,
    name,
    sent_count,
    open_count,
    click_count,
    total_recipients,
    updated_at
FROM bulk_email_campaigns
WHERE id = '04d3f4a1-f62f-4e08-8e06-4373dafcda43';

-- Show recipient status breakdown
SELECT 
    status,
    COUNT(*) as count
FROM bulk_email_recipients
WHERE campaign_id = '04d3f4a1-f62f-4e08-8e06-4373dafcda43'
GROUP BY status
ORDER BY status;
