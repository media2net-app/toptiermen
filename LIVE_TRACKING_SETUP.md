# Live Platform Tracking - Setup Instructies

## ✅ Wat is gemaakt:

### 1. **Live Tracking Admin Pagina**
- **Locatie**: `/dashboard-admin/live-tracking`
- **Features**:
  - ✅ Real-time lijst van online gebruikers (actief in laatste 5 minuten)
  - ✅ Onboarding status per gebruiker
  - ✅ Welke stap ze zijn in onboarding
  - ✅ Auto-refresh elke 10 seconden
  - ✅ Toggle tussen "Alleen Online" en "Alle Gebruikers"
  - ✅ Live statistieken (online count, totaal users, onboarding completed, etc.)
  - ✅ Mooie UI met brand kleuren (oranje #E33412 en groen #8BAE5A)

### 2. **Navigatie**
- ✅ Link toegevoegd in admin sidebar onder "ANALYTICS"
- ✅ Badge "LIVE" voor zichtbaarheid
- ✅ Signal icon voor real-time karakter

### 3. **Database Schema**
- SQL script gemaakt: `add-last-active-column.sql`

## ⚠️ BELANGRIJK: Database Setup Vereist

Voor deze feature correct werkt, moet je **eenmalig** dit SQL script uitvoeren in Supabase:

### Stap 1: Voer SQL uit in Supabase

Ga naar **Supabase Dashboard** → **SQL Editor** en voer uit:

```sql
-- Add last_active column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active DESC);

-- Update existing users to have a last_active timestamp
UPDATE profiles 
SET last_active = updated_at 
WHERE last_active IS NULL AND updated_at IS NOT NULL;

-- If updated_at is also NULL, use created_at
UPDATE profiles 
SET last_active = created_at 
WHERE last_active IS NULL;

-- Create a function to automatically update last_active
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update last_active on profile updates
DROP TRIGGER IF EXISTS trigger_update_last_active ON profiles;
CREATE TRIGGER trigger_update_last_active
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();
```

Dit script doet:
1. ✅ Voegt `last_active` kolom toe aan `profiles` tabel
2. ✅ Maakt een index voor snelle queries
3. ✅ Vult bestaande users met hun laatste activiteit
4. ✅ Maakt een trigger die automatisch `last_active` update bij elke profile update

### Stap 2: Verificatie

Na het uitvoeren, controleer of het gelukt is:

```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(last_active) as users_with_last_active,
  MAX(last_active) as most_recent_activity
FROM profiles;
```

Je zou moeten zien dat alle users een `last_active` timestamp hebben.

## 🎯 Hoe te gebruiken:

1. **Ga naar Admin Dashboard**
   - Navigeer naar `/dashboard-admin/live-tracking`
   - Of klik op "Live Platform Tracking" in de sidebar (ANALYTICS sectie)

2. **Online Users Bekijken**
   - Groene dot = Online (actief in laatste 5 minuten)
   - Grijze dot = Offline
   - Automatische refresh elke 10 seconden

3. **Onboarding Tracking**
   - Zie exact bij welke stap elke gebruiker is
   - Groen = Onboarding voltooid
   - Oranje = Nog bezig met onboarding
   - Stappen: 1=Welkom video, 2=Basis info, 3=Training, 4=Voeding, 5=Afronding

4. **Filters**
   - "Alleen Online" - Toon alleen actieve users
   - "Alle Gebruikers" - Toon iedereen, gesorteerd op laatste activiteit

## 📊 Features:

### Live Statistieken
- **Online Nu**: Aantal users actief in laatste 5 minuten
- **Totaal Gebruikers**: Alle geregistreerde users
- **Onboarding Voltooid**: Users die setup hebben afgerond
- **In Onboarding**: Users die nog bezig zijn

### User Details
Voor elke user zie je:
- ✅ Online/Offline status (met animatie voor online)
- ✅ Naam en email
- ✅ Rol (admin/user)
- ✅ Onboarding stap en status
- ✅ Abonnement status
- ✅ Laatst actief (bijv. "2m geleden", "1u geleden")

### Auto-Refresh
- Pagina ververst automatisch elke 10 seconden
- Handmatige refresh met de "Ververs" knop
- Laatste update tijd wordt getoond

## 🔧 Technische Details:

### Online Detectie
Een gebruiker wordt als "online" beschouwd als:
- `last_active` timestamp < 5 minuten geleden
- Anders wordt de user als "offline" getoond

### Data Flow
1. Frontend haalt data op via Supabase client
2. Joined query tussen `profiles` en `onboarding_status`
3. Filtering en sorting gebeurt in frontend
4. Auto-refresh met `setInterval()`

### Performance
- Index op `last_active` voor snelle queries
- Efficient sorting (ORDER BY last_active DESC)
- Client-side filtering (geen extra database calls)

## 🚀 Volgende Stappen (Optioneel):

Voor nog betere tracking kun je overwegen:
1. **Heartbeat systeem** - Frontend stuurt elke minuut een ping om `last_active` te updaten
2. **Real-time updates** - Supabase Realtime subscriptions voor live updates zonder polling
3. **Activity logging** - Specifieke acties tracken (bijv. video bekeken, workout gelogd)
4. **Sessie duur** - Bijhouden hoelang users gemiddeld online zijn

## ✅ Deployment Status:

- [x] Code gepusht naar GitHub
- [x] Vercel zal automatisch deployen
- [ ] SQL script uitvoeren in Supabase (jouw actie vereist!)

Na het uitvoeren van het SQL script is de feature volledig functioneel! 🎉

