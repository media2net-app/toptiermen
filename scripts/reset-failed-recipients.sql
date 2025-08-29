-- Reset failed recipients back to pending status
UPDATE bulk_email_recipients 
SET 
    status = 'pending',
    sent_at = NULL,
    bounce_reason = NULL,
    updated_at = NOW()
WHERE 
    campaign_id = '04d3f4a1-f62f-4e08-8e06-4373dafcda43' 
    AND status = 'failed';

-- Show the results
SELECT 
    status,
    COUNT(*) as count
FROM bulk_email_recipients 
WHERE campaign_id = '04d3f4a1-f62f-4e08-8e06-4373dafcda43'
GROUP BY status
ORDER BY status;
