-- =====================================================
-- Script om Dominiqueboot@outlook.com toe te voegen aan pre-launch lijst
-- Uitvoeren in Supabase SQL Editor
-- =====================================================

-- Eerst controleren of de tabel bestaat
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prelaunch_emails') THEN
        RAISE EXCEPTION 'Tabel prelaunch_emails bestaat niet. Voer eerst het setup script uit.';
    END IF;
END $$;

-- Controleren of het e-mailadres al bestaat
SELECT 
    'CONTROLE: Bestaande e-mail gevonden' as status,
    email,
    name,
    source,
    status as email_status,
    package,
    notes,
    subscribed_at,
    created_at
FROM public.prelaunch_emails 
WHERE email = 'Dominiqueboot@outlook.com';

-- E-mailadres toevoegen (of bijwerken als het al bestaat)
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

-- Verificatie: Toon het toegevoegde/bijgewerkte e-mailadres
SELECT 
    'SUCCES: E-mail toegevoegd/bijgewerkt' as status,
    email,
    name,
    source,
    status as email_status,
    package,
    notes,
    subscribed_at,
    created_at,
    updated_at
FROM public.prelaunch_emails 
WHERE email = 'Dominiqueboot@outlook.com';

-- Toon statistieken van de pre-launch lijst
SELECT 
    'STATISTIEKEN' as info,
    COUNT(*) as total_emails,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_emails,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_emails,
    COUNT(CASE WHEN status = 'unsubscribed' THEN 1 END) as unsubscribed_emails,
    COUNT(CASE WHEN package = 'BASIC' THEN 1 END) as basic_packages,
    COUNT(CASE WHEN package = 'PREMIUM' THEN 1 END) as premium_packages,
    COUNT(CASE WHEN package = 'ULTIMATE' THEN 1 END) as ultimate_packages
FROM public.prelaunch_emails;

-- Toon de laatste 5 toegevoegde e-mails
SELECT 
    'LAATSTE 5 E-MAILS' as info,
    email,
    name,
    source,
    status,
    package,
    created_at
FROM public.prelaunch_emails 
ORDER BY created_at DESC 
LIMIT 5;