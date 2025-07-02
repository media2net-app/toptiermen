# Environment Setup voor Top Tier Men

## Probleem: Login blijft hangen

Het login probleem wordt waarschijnlijk veroorzaakt door ontbrekende Supabase configuratie. Volg deze stappen om het op te lossen:

## 1. Maak een .env.local bestand aan

Maak een `.env.local` bestand aan in de root van het project met de volgende inhoud:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 2. Haal je Supabase credentials op

1. Ga naar [supabase.com](https://supabase.com)
2. Maak een nieuw project aan of gebruik een bestaand project
3. Ga naar **Settings** > **API** in je Supabase dashboard
4. Kopieer de **Project URL** en vervang `https://your-project-id.supabase.co`
5. Kopieer de **anon public** key en vervang `your-anon-key-here`

## 3. Database Setup

Voer de SQL scripts uit in je Supabase SQL Editor (zie `SUPABASE_SETUP.md` voor details):

1. Ga naar **SQL Editor** in je Supabase dashboard
2. Voer de scripts uit uit de `.sql` bestanden in de root van dit project
3. Begin met `create_academy_tables.sql` en voer de andere scripts uit

## 4. Authentication Settings

1. Ga naar **Authentication** > **Settings** in je Supabase dashboard
2. Zet "Enable email confirmations" **UIT** voor development
3. Voeg je domain toe aan "Site URL" (bijv. `http://localhost:3000`)
4. Voeg redirect URLs toe: `http://localhost:3000/dashboard`, `http://localhost:3000/dashboard-admin`

## 5. Test de applicatie

1. Herstart je development server: `npm run dev`
2. Ga naar `http://localhost:3000/register` en maak een test account
3. Test inloggen op `http://localhost:3000/login`

## 6. Troubleshooting

Als de login nog steeds blijft hangen:

1. **Controleer de browser console** voor errors
2. **Controleer de Supabase logs** in het dashboard
3. **Verifieer dat alle environment variables correct zijn ingesteld**
4. **Controleer of de database tabellen correct zijn aangemaakt**
5. **Zorg dat RLS policies correct zijn ingesteld**

## 7. Veelvoorkomende problemen

### "Invalid API key" error
- Controleer of je anon key correct is gekopieerd
- Zorg dat er geen extra spaties zijn

### "Project not found" error  
- Controleer of je project URL correct is
- Zorg dat je project actief is in Supabase

### Database errors
- Voer alle SQL scripts uit in de juiste volgorde
- Controleer of de `users` tabel bestaat en de juiste structuur heeft

### Authentication errors
- Controleer of email confirmations uit staat
- Verifieer dat je domain is toegevoegd aan de Site URL 