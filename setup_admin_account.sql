-- Veilig Admin Account Setup voor Top Tier Men
-- Voer dit script uit in de Supabase SQL Editor

-- Stap 1: Voeg role kolom toe aan users tabel
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Stap 2: Update bestaande gebruikers naar 'user' role
UPDATE public.users 
SET role = 'user' 
WHERE role IS NULL OR role NOT IN ('user', 'admin');

-- Stap 3: Maak een veilig admin account aan
-- Dit account wordt direct in de database aangemaakt (niet via registratie)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  gen_random_uuid(), -- admin_user_id
  (SELECT id FROM auth.instances LIMIT 1),
  'authenticated',
  'authenticated',
  'admin@toptiermen.com',
  crypt('Admin123!', gen_salt('bf')), -- Wachtwoord: Admin123!
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
);

-- Stap 4: Voeg admin gebruiker toe aan users tabel
INSERT INTO public.users (
  id,
  email,
  full_name,
  rank,
  points,
  missions_completed,
  bio,
  location,
  interests,
  role,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@toptiermen.com'),
  'admin@toptiermen.com',
  'Platform Administrator',
  'Elite',
  1000,
  50,
  'Top Tier Men Platform Administrator',
  'Netherlands',
  '["Leadership", "Management", "Technology", "Community"]'::jsonb,
  'admin',
  NOW()
);

-- Stap 5: Controleer dat alles correct is aangemaakt
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.rank,
  u.created_at
FROM public.users u
WHERE u.email = 'admin@toptiermen.com';

-- Admin Account Gegevens:
-- Email: admin@toptiermen.com
-- Wachtwoord: Admin123!
-- Role: admin
-- Naam: Platform Administrator 