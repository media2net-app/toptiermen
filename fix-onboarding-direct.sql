-- Direct SQL om onboarding status te resetten voor alle users
-- Voer dit uit in Supabase SQL Editor

-- 1. Verwijder alle bestaande onboarding status
DELETE FROM onboarding_status;

-- 2. Maak nieuwe onboarding status voor alle users
INSERT INTO onboarding_status (user_id, onboarding_completed, current_step, welcome_video_watched, created_at, updated_at)
SELECT 
    id as user_id,
    false as onboarding_completed,
    1 as current_step,
    false as welcome_video_watched,
    NOW() as created_at,
    NOW() as updated_at
FROM profiles;

-- 3. Verificatie: Toon alle users met hun onboarding status
SELECT 
    p.email,
    p.full_name,
    p.role,
    o.current_step,
    o.onboarding_completed,
    o.welcome_video_watched
FROM profiles p
LEFT JOIN onboarding_status o ON p.id = o.user_id
ORDER BY p.role DESC, p.email;

-- 4. Samenvatting
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN o.current_step = 1 THEN 1 END) as users_at_step_1,
    COUNT(CASE WHEN o.onboarding_completed = false THEN 1 END) as users_not_completed
FROM profiles p
LEFT JOIN onboarding_status o ON p.id = o.user_id;

