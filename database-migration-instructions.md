# Database Migration Instructions

## 🎯 **100% Database Migration - Manual Execution Required**

De database schemas zijn klaar, maar moeten handmatig worden uitgevoerd in de Supabase dashboard.

### 📋 **Stappen om uit te voeren:**

#### **1. Brotherhood Database Schema**
- Ga naar Supabase Dashboard → SQL Editor
- Kopieer en plak de inhoud van `brotherhood-schema.sql`
- Klik "Run" om uit te voeren

#### **2. Producten Database Schema**  
- Ga naar Supabase Dashboard → SQL Editor
- Kopieer en plak de inhoud van `producten-schema.sql`
- Klik "Run" om uit te voeren

#### **3. Workout Database Schema**
- Ga naar Supabase Dashboard → SQL Editor
- Kopieer en plak de inhoud van `workout-schema.sql`
- Klik "Run" om uit te voeren

#### **4. Mind & Focus Database Schema**
- Ga naar Supabase Dashboard → SQL Editor
- Kopieer en plak de inhoud van `mind-focus-schema.sql`
- Klik "Run" om uit te voeren

### ✅ **Verificatie:**
Na uitvoering van alle schemas, controleer of de volgende tabellen zijn aangemaakt:

**Brotherhood:**
- brotherhood_groups
- brotherhood_group_members
- brotherhood_events
- brotherhood_event_attendees
- brotherhood_group_posts
- brotherhood_group_activity

**Producten:**
- products
- product_categories
- product_features
- product_benefits
- product_ingredients
- product_dosage
- product_reviews
- product_affiliate_links

**Workout:**
- exercises
- workout_templates
- user_workout_sessions
- user_exercise_performances
- user_workout_progress

**Mind & Focus:**
- mind_focus_profiles
- mind_focus_sessions
- mind_focus_progress

### 🚀 **Na Database Setup:**
1. Test alle API endpoints
2. Verificeer frontend functionaliteit
3. Voeg sample data toe indien nodig

### 📊 **Status:**
- ✅ Database schemas: Klaar
- ✅ API endpoints: Klaar  
- ✅ Frontend updates: Klaar
- ⏳ Database execution: Handmatig vereist
- ⏳ Testing: Na database setup
