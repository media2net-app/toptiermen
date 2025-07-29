-- Check if Dominiqueboot@outlook.com already exists in pre-launch email list
-- This script can be run directly in Supabase SQL Editor

SELECT 
  email,
  name,
  source,
  status,
  package,
  notes,
  subscribed_at,
  created_at,
  updated_at
FROM public.prelaunch_emails 
WHERE email = 'Dominiqueboot@outlook.com';

-- Also show total count of pre-launch emails
SELECT 
  COUNT(*) as total_emails,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_emails,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_emails,
  COUNT(CASE WHEN status = 'unsubscribed' THEN 1 END) as unsubscribed_emails
FROM public.prelaunch_emails;