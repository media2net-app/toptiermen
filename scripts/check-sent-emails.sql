-- Check all emails sent today from bulk_email_recipients
SELECT 
    'BULK EMAIL RECIPIENTS' as source,
    ber.email,
    ber.full_name,
    ber.status,
    ber.sent_at,
    bec.name as campaign_name
FROM bulk_email_recipients ber
JOIN bulk_email_campaigns bec ON ber.campaign_id = bec.id
WHERE ber.status = 'sent' 
AND ber.sent_at::date = CURRENT_DATE
ORDER BY ber.sent_at DESC;

-- Check all emails sent today from email_tracking (old system)
SELECT 
    'EMAIL TRACKING' as source,
    et.recipient_email as email,
    et.recipient_name as full_name,
    et.status,
    et.sent_at,
    ec.name as campaign_name
FROM email_tracking et
JOIN email_campaigns ec ON et.campaign_id = ec.id
WHERE et.sent_at::date = CURRENT_DATE
ORDER BY et.sent_at DESC;

-- Summary of all sent emails today
SELECT 
    'SUMMARY' as type,
    COUNT(*) as total_sent_today,
    STRING_AGG(DISTINCT email, ', ') as all_recipients
FROM (
    SELECT email FROM bulk_email_recipients 
    WHERE status = 'sent' AND sent_at::date = CURRENT_DATE
    UNION ALL
    SELECT recipient_email as email FROM email_tracking 
    WHERE sent_at::date = CURRENT_DATE
) all_emails;
