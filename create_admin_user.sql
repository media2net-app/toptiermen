-- Admin gebruiker aanmaken voor Top Tier Men
-- Voer dit script uit in de Supabase SQL Editor

-- Stap 1: Maak een nieuwe gebruiker aan in auth.users (dit gebeurt automatisch via de app)
-- Stap 2: Voeg de gebruiker toe aan de users tabel met admin email

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
  created_at
) VALUES (
  gen_random_uuid(), -- Dit wordt vervangen door de echte user ID na registratie
  'admin@toptiermen.com',
  'Admin User',
  'Elite',
  1000,
  50,
  'Platform Administrator',
  'Netherlands',
  '["Leadership", "Management", "Technology"]'::jsonb,
  NOW()
);

-- Let op: Je moet eerst registreren met admin@toptiermen.com via de app
-- Daarna kun je dit script uitvoeren om de gebruiker admin rechten te geven 