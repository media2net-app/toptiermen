-- Veilig Admin Account Setup voor Rick
-- Voer dit script uit in de Supabase SQL Editor

-- Stap 1: Voeg role kolom toe aan users tabel (indien nog niet aanwezig)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Stap 2: Update bestaande gebruikers naar 'user' role
UPDATE public.users 
SET role = 'user' 
WHERE role IS NULL OR role NOT IN ('user', 'admin');

-- Stap 3: Geef Rick admin rechten
UPDATE public.users 
SET role = 'admin'
WHERE id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c' 
AND email = 'rick@toptiermen.eu';

-- Stap 4: Controleer dat de update succesvol was
SELECT 
  id,
  email,
  full_name,
  role,
  rank,
  created_at
FROM public.users 
WHERE id = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';

-- Stap 5: Toon alle admin gebruikers (zou er maar 1 moeten zijn)
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.users 
WHERE role = 'admin';

-- Admin Account Gegevens:
-- UUID: 9d6aa8ba-58ab-4188-9a9f-09380a67eb0c
-- Email: rick@toptiermen.eu
-- Role: admin
-- Naam: Rick (zoals in de database staat)
