# Manual Reset Instructions

## ⚠️ RLS Policy Issue

Het reset script kon de onboarding_status niet aanmaken vanwege Row Level Security policies.

## ✅ Wat is al gedaan:
- ✓ Alle user data gewist (missions, workout logs, custom plans, academy progress)
- ✓ Training schemas en voedingsplannen gereset
- ✗ Onboarding status moet handmatig gefixed worden

## 🔧 Oplossing:

### Optie 1: SQL Script in Supabase (AANBEVOLEN)

1. Ga naar **Supabase Dashboard** → **SQL Editor**
2. Plak en voer uit: `fix-onboarding-direct.sql`
3. Dit zal:
   - Alle bestaande onboarding status verwijderen
   - Nieuwe records aanmaken voor alle users
   - Status zetten op step 1, niet completed
   - Verificatie output tonen

### Optie 2: Tijdelijk RLS Uitschakelen

Als je de Service Key hebt:

```bash
# In .env.local, voeg toe:
SUPABASE_SERVICE_KEY=je_service_key_hier

# Run dan:
node fix-onboarding-status.js
```

### Optie 3: RLS Policy Aanpassen

Voeg een policy toe die INSERT toestaat:

```sql
CREATE POLICY "Allow insert for authenticated users"
ON onboarding_status
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Of tijdelijk alles toestaan:
CREATE POLICY "Allow all for service role"
ON onboarding_status
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

## ✅ Verificatie

Na het uitvoeren van de SQL:

```bash
node verify-reset.js
```

Dit zou moeten tonen:
- ✓ 19 users at step 1
- ✓ No missions found
- ✓ No workout logs found
- ✓ No custom plans found
- ✓ No academy progress found

## 🎯 Verwacht Resultaat

Alle users zien bij inloggen:
1. Welkom video (stap 1)
2. Moeten door onboarding
3. Geen geselecteerde schemas/plannen
4. Schone lei!

## 📞 Als er problemen zijn

De snelste manier: SQL script in Supabase SQL Editor uitvoeren.
Dat omzeilt alle RLS policies en creëert direct de records.

