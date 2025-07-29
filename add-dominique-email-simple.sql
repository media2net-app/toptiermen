-- Add Dominiqueboot@outlook.com to pre-launch email list
-- This script can be run directly in Supabase SQL Editor

INSERT INTO public.prelaunch_emails (
  email,
  name,
  source,
  status,
  package,
  notes,
  subscribed_at
) VALUES (
  'Dominiqueboot@outlook.com',
  'Dominique Boot',
  'Manual Admin Addition',
  'active',
  'BASIC',
  'Added manually by admin - interested in Top Tier Men platform',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  source = EXCLUDED.source,
  status = EXCLUDED.status,
  package = EXCLUDED.package,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- Verify the insertion
SELECT 
  email,
  name,
  source,
  status,
  package,
  notes,
  subscribed_at,
  created_at
FROM public.prelaunch_emails 
WHERE email = 'Dominiqueboot@outlook.com';