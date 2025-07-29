-- =====================================================
-- Verificatie script voor Dominiqueboot@outlook.com
-- Uitvoeren in Supabase SQL Editor
-- =====================================================

-- Controleer of het e-mailadres bestaat
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ E-mail gevonden'
        ELSE '❌ E-mail niet gevonden'
    END as status,
    COUNT(*) as aantal_gevonden
FROM public.prelaunch_emails 
WHERE email = 'Dominiqueboot@outlook.com';

-- Toon details van het e-mailadres
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

-- Toon totale aantal e-mails in de lijst
SELECT 
    'TOTAAL AANTAL E-MAILS' as info,
    COUNT(*) as total_emails
FROM public.prelaunch_emails;