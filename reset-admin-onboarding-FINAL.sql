-- ===== FINAL CORRECT SCRIPT =====
-- Reset Chiel en Rick's onboarding
-- Correcte emails: chiel@media2net.nl en rick@toptiermen.eu

-- STAP 1: Check huidige situatie
SELECT 
    p.email,
    p.full_name,
    p.role,
    p.selected_schema_id,
    o.current_step,
    o.onboarding_completed
FROM profiles p
LEFT JOIN onboarding_status o ON p.id = o.user_id
WHERE p.email IN ('chiel@media2net.nl', 'rick@toptiermen.eu');

-- STAP 2: Delete bestaande onboarding status
DELETE FROM onboarding_status 
WHERE user_id IN (
    SELECT id FROM profiles 
    WHERE email IN ('chiel@media2net.nl', 'rick@toptiermen.eu')
);

-- STAP 3: Maak nieuwe onboarding status (stap 1)
INSERT INTO onboarding_status (user_id, onboarding_completed, current_step, welcome_video_watched, created_at, updated_at)
SELECT 
    id as user_id,
    false as onboarding_completed,
    1 as current_step,
    false as welcome_video_watched,
    NOW() as created_at,
    NOW() as updated_at
FROM profiles
WHERE email IN ('chiel@media2net.nl', 'rick@toptiermen.eu');

-- STAP 4: Reset hun geselecteerde training schema (dit is de correcte kolom naam!)
UPDATE profiles
SET selected_schema_id = NULL
WHERE email IN ('chiel@media2net.nl', 'rick@toptiermen.eu');

-- STAP 5: Delete hun missions
DELETE FROM user_missions 
WHERE user_id IN (
    SELECT id FROM profiles 
    WHERE email IN ('chiel@media2net.nl', 'rick@toptiermen.eu')
);

-- STAP 6: Delete custom nutrition plans (als tabel bestaat)
DELETE FROM custom_nutrition_plans 
WHERE user_id IN (
    SELECT id FROM profiles 
    WHERE email IN ('chiel@media2net.nl', 'rick@toptiermen.eu')
);

-- STAP 7: Delete academy progress (als tabel bestaat)
DELETE FROM academy_completions 
WHERE user_id IN (
    SELECT id FROM profiles 
    WHERE email IN ('chiel@media2net.nl', 'rick@toptiermen.eu')
);

-- VERIFICATIE: Check resultaat
SELECT 
    p.email,
    p.full_name,
    p.role,
    p.selected_schema_id,
    o.current_step,
    o.onboarding_completed,
    o.welcome_video_watched
FROM profiles p
LEFT JOIN onboarding_status o ON p.id = o.user_id
WHERE p.email IN ('chiel@media2net.nl', 'rick@toptiermen.eu');

