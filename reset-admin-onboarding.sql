-- Reset onboarding status voor specifieke admin gebruikers
-- Chiel en Rick moeten ook door onboarding

-- Eerst: Check huidige status
SELECT 
    p.email,
    p.full_name,
    p.role,
    o.current_step,
    o.onboarding_completed,
    o.welcome_video_watched
FROM profiles p
LEFT JOIN onboarding_status o ON p.id = o.user_id
WHERE p.email IN ('chiel@media2net.nl', 'rick@media2net.nl');

-- Reset onboarding status voor deze admins
DELETE FROM onboarding_status 
WHERE user_id IN (
    SELECT id FROM profiles 
    WHERE email IN ('chiel@media2net.nl', 'rick@media2net.nl')
);

-- Maak nieuwe onboarding status records
INSERT INTO onboarding_status (user_id, onboarding_completed, current_step, welcome_video_watched, created_at, updated_at)
SELECT 
    id as user_id,
    false as onboarding_completed,
    1 as current_step,
    false as welcome_video_watched,
    NOW() as created_at,
    NOW() as updated_at
FROM profiles
WHERE email IN ('chiel@media2net.nl', 'rick@media2net.nl');

-- Reset hun geselecteerde schemas en plannen
UPDATE profiles
SET 
    selected_training_schema = NULL,
    training_goal = NULL,
    selected_nutrition_plan = NULL,
    selected_nutrition_plan_v2 = NULL
WHERE email IN ('chiel@media2net.nl', 'rick@media2net.nl');

-- Verificatie: Toon nieuwe status
SELECT 
    p.email,
    p.full_name,
    p.role,
    o.current_step,
    o.onboarding_completed,
    o.welcome_video_watched,
    p.selected_training_schema,
    p.selected_nutrition_plan
FROM profiles p
LEFT JOIN onboarding_status o ON p.id = o.user_id
WHERE p.email IN ('chiel@media2net.nl', 'rick@media2net.nl');

