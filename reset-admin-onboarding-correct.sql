-- Reset onboarding status voor Chiel en Rick (met correcte emails)
-- Chiel: chiel@media2net.nl
-- Rick: rick@toptiermen.eu

-- Eerste check: Welke admins hebben we?
SELECT 
    p.email,
    p.full_name,
    p.role,
    o.current_step,
    o.onboarding_completed
FROM profiles p
LEFT JOIN onboarding_status o ON p.id = o.user_id
WHERE p.email IN ('chiel@media2net.nl', 'rick@toptiermen.eu')
   OR p.role = 'admin';

-- ===== RESET START =====

-- 1. Delete bestaande onboarding status
DELETE FROM onboarding_status 
WHERE user_id IN (
    SELECT id FROM profiles 
    WHERE email IN ('chiel@media2net.nl', 'rick@toptiermen.eu')
);

-- 2. Maak nieuwe onboarding status records (stap 1)
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

-- 3. Reset hun geselecteerde schemas
UPDATE profiles
SET 
    selected_training_schema = NULL,
    training_goal = NULL
WHERE email IN ('chiel@media2net.nl', 'rick@toptiermen.eu');

-- 4. Delete hun user data
DELETE FROM user_missions 
WHERE user_id IN (
    SELECT id FROM profiles 
    WHERE email IN ('chiel@media2net.nl', 'rick@toptiermen.eu')
);

DELETE FROM custom_nutrition_plans 
WHERE user_id IN (
    SELECT id FROM profiles 
    WHERE email IN ('chiel@media2net.nl', 'rick@toptiermen.eu')
);

-- ===== VERIFICATIE =====

-- Check resultaat
SELECT 
    p.email,
    p.full_name,
    p.role,
    o.current_step,
    o.onboarding_completed,
    o.welcome_video_watched,
    p.selected_training_schema,
    p.training_goal
FROM profiles p
LEFT JOIN onboarding_status o ON p.id = o.user_id
WHERE p.email IN ('chiel@media2net.nl', 'rick@toptiermen.eu');

-- Samenvatting
SELECT 
    'Total admins' as label,
    COUNT(*) as count
FROM profiles
WHERE role = 'admin'
UNION ALL
SELECT 
    'Admins at step 1' as label,
    COUNT(*) as count
FROM profiles p
JOIN onboarding_status o ON p.id = o.user_id
WHERE p.role = 'admin' AND o.current_step = 1 AND o.onboarding_completed = false;

