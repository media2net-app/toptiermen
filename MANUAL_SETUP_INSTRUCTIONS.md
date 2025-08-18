# 🛠️ Handmatige Setup Voedingsplannen Tabel

## 📋 Stap 1: Ga naar Supabase Dashboard

1. Open: https://supabase.com/dashboard/project/wkjvstuttbeyqzyjayxj/sql
2. Log in met je Supabase account

## 📋 Stap 2: Voer SQL Script Uit

Kopieer en plak dit volledige SQL script in de SQL Editor:

```sql
-- Create nutrition_plans table for storing frontend migrated plans
CREATE TABLE IF NOT EXISTS nutrition_plans (
  id SERIAL PRIMARY KEY,
  plan_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon VARCHAR(10),
  color VARCHAR(100),
  meals JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_plan_id ON nutrition_plans(plan_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_active ON nutrition_plans(is_active);

-- Add RLS (Row Level Security) policies
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active plans
CREATE POLICY "Allow authenticated users to read active nutrition plans" ON nutrition_plans
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Allow only admins to insert/update/delete plans
CREATE POLICY "Allow admins to manage nutrition plans" ON nutrition_plans
  FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');
```

3. Klik op **"Run"** om het script uit te voeren

## 📋 Stap 3: Verificeer Tabel Creatie

1. Ga naar **Table Editor** in het linkermenu
2. Zoek naar **"nutrition_plans"** tabel
3. Controleer of de tabel bestaat met alle kolommen

## 📋 Stap 4: Voer Migratie Script Uit

Terug in je terminal:

```bash
cd /Users/gebruiker/Desktop/toptiermen
node scripts/run-nutrition-plans-migration.js
```

## 📋 Stap 5: Test de Koppeling

1. Start je development server:
```bash
npm run dev
```

2. Ga naar: http://localhost:3000/dashboard-admin/voedingsplannen
3. Klik op de **"Frontend Plannen"** tab
4. Klik op **"Herlaad Plannen"** om de migratie te testen

## 📋 Stap 6: Test Frontend

1. Ga naar: http://localhost:3000/dashboard/voedingsplannen
2. Test of de voedingsplannen correct worden geladen
3. Controleer of wijzigingen in admin direct zichtbaar zijn in frontend

## 🔧 Troubleshooting

### Als de tabel al bestaat:
```sql
DROP TABLE IF EXISTS nutrition_plans CASCADE;
```
Voer dit uit en herhaal stap 2.

### Als er RLS policy errors zijn:
```sql
DROP POLICY IF EXISTS "Allow authenticated users to read active nutrition plans" ON nutrition_plans;
DROP POLICY IF EXISTS "Allow admins to manage nutrition plans" ON nutrition_plans;
```
Voer dit uit en herhaal stap 2.

### Als er index errors zijn:
```sql
DROP INDEX IF EXISTS idx_nutrition_plans_plan_id;
DROP INDEX IF EXISTS idx_nutrition_plans_active;
```
Voer dit uit en herhaal stap 2.

## ✅ Succes Criteria

- ✅ Tabel `nutrition_plans` bestaat in Supabase
- ✅ Alle kolommen zijn correct aangemaakt
- ✅ RLS policies zijn actief
- ✅ Indexes zijn aangemaakt
- ✅ Migratie script voert zonder errors uit
- ✅ Admin dashboard toont gemigreerde plannen
- ✅ Frontend laadt plannen uit database
- ✅ Wijzigingen in admin zijn direct zichtbaar in frontend

## 🎯 Resultaat

Na deze setup kun je:
- Alle voedingsplannen beheren via admin dashboard
- Plannen aanpassen zonder code wijzigingen
- Real-time updates zien in de frontend
- Nieuwe plannen toevoegen via admin interface

---

**Status**: ⏳ Wacht op handmatige uitvoering  
**Volgende**: Voer SQL script uit in Supabase Dashboard
