-- Add Dominiqueboot@outlook.com to pre-launch email list
INSERT INTO prelaunch_emails (
  email,
  name,
  source,
  status,
  package,
  notes,
  created_at
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
  created_at
FROM prelaunch_emails 
WHERE email = 'Dominiqueboot@outlook.com';