# 🍽️ VOEDINGSPLANNEN UPDATE ANALYSE

## 📋 OVERZICHT VAN DE UPDATE

We hebben een **complete herstructurering** van het voedingsplannen systeem doorgevoerd met nieuwe database schema, API endpoints, frontend componenten en berekeningsformules.

---

## 🗄️ DATABASE STRUCTUUR

### **Nieuwe Schema: `nutrition_plans` tabel**

```sql
CREATE TABLE nutrition_plans (
  id SERIAL PRIMARY KEY,
  plan_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  protein_percentage INTEGER,    -- NIEUW
  carbs_percentage INTEGER,      -- NIEUW
  fat_percentage INTEGER,        -- NIEUW
  duration_weeks INTEGER,
  difficulty VARCHAR(50),
  goal VARCHAR(100),
  fitness_goal VARCHAR(100),
  is_featured BOOLEAN,
  is_public BOOLEAN,
  meals JSONB,                   -- Uitgebreide structuur
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **Belangrijke Toevoegingen:**
- ✅ **Macro percentages** (`protein_percentage`, `carbs_percentage`, `fat_percentage`)
- ✅ **Target macro waarden** in grammen
- ✅ **Uitgebreide meals JSONB** structuur met weekly_plan
- ✅ **Fitness goals** (droogtrainen, spiermassa, onderhoud)

---

## 🧮 NIEUWE BEREKENINGSFORMULES

### **1. Calorie Berekening (TTM Formule)**
```javascript
// Nieuwe TTM formule: Gewicht x 22 x activiteitniveau
const tdee = weight * 22 * activityMultiplier;

// Activiteitniveaus:
const activityMultipliers = {
  sedentary: 1.1,    // Zittend (Licht actief)
  moderate: 1.3,     // Staand (Matig actief) 
  very_active: 1.6   // Lopend (Zeer actief)
};

// Doel aanpassingen:
if (goal === 'cut') targetCalories = tdee * 0.8;      // 20% deficit
if (goal === 'bulk') targetCalories = tdee * 1.15;    // 15% surplus
if (goal === 'maintain') targetCalories = tdee;       // Geen aanpassing
```

### **2. Macro Berekening (Plan-specifiek)**
```javascript
// Macros worden berekend op basis van plan-specifieke percentages
// Elke plan heeft eigen protein_percentage, carbs_percentage, fat_percentage

// Van percentages naar grammen:
const targetProtein = Math.round((proteinPercentage / 100) * targetCalories / 4);
const targetCarbs = Math.round((carbsPercentage / 100) * targetCalories / 4);
const targetFat = Math.round((fatPercentage / 100) * targetCalories / 9);

// Voorbeeld: Voedingsplan - Droogtrainen (40% - 40% - 20%)
// 2360 kcal: 236g eiwit, 236g koolhydraten, 52g vet
```

### **3. Percentage Berekening (Bidirectioneel)**
```javascript
// Van grammen naar percentages (voor berekening)
const proteinPercentage = Math.round((targetProtein * 4 / targetCalories) * 100);
const carbsPercentage = Math.round((targetCarbs * 4 / targetCalories) * 100);
const fatPercentage = Math.round((targetFat * 9 / targetCalories) * 100);

// Van percentages naar grammen (voor weergave)
const targetProtein = Math.round((proteinPercentage / 100) * targetCalories / 4);
const targetCarbs = Math.round((carbsPercentage / 100) * targetCalories / 4);
const targetFat = Math.round((fatPercentage / 100) * targetCalories / 9);
```

---

## 🏗️ API ENDPOINTS

### **Admin Endpoints:**
- ✅ `GET /api/admin/nutrition-plans` - Haal alle plannen op
- ✅ `POST /api/admin/nutrition-plans` - Maak nieuw plan
- ✅ `PUT /api/admin/nutrition-plans` - Update bestaand plan
- ✅ `DELETE /api/admin/nutrition-plans` - Verwijder plan
- ✅ `GET /api/admin/plan-meals` - Haal plan maaltijden op
- ✅ `POST /api/admin/plan-meals` - Voeg ingrediënt toe
- ✅ `PUT /api/admin/plan-meals` - Update maaltijd

### **User Endpoints:**
- ✅ `GET /api/nutrition-plans` - Haal beschikbare plannen op
- ✅ `GET /api/nutrition-profile` - Haal gebruikersprofiel op
- ✅ `POST /api/nutrition-profile` - Maak/update profiel
- ✅ `GET /api/nutrition-plan-dynamic` - Genereer dynamisch plan
- ✅ `GET /api/nutrition-plan-simple` - Eenvoudige plan data

---

## 🎨 FRONTEND COMPONENTEN

### **Admin Interface:**
- ✅ **`PlanBuilder.tsx`** - Complete plan editor met macro percentages
- ✅ **`MealEditModal.tsx`** - Ingrediënt editor met unit types
- ✅ **Admin voedingsplannen pagina** - Overzicht en beheer

### **User Interface:**
- ✅ **Voedingsplannen pagina** - Plan selectie en weergave
- ✅ **`DynamicPlanViewNew.tsx`** - Dynamische plan weergave
- ✅ **`WeekPlanView.tsx`** - Weekplan visualisatie
- ✅ **Nutrition calculator** - BMR/TDEE berekening

---

## 📊 HUIDIGE PLANNEN (6 TOTAAL)

### **Carnivoor Plannen:**
1. **Carnivoor - Droogtrainen** (ID: 67)
   - 2360 kcal, 207g eiwit (35%), 30g koolhydraten (5%), 157g vet (60%)

2. **Carnivoor - Onderhoud** (ID: 68)
   - 2860 kcal, 250g eiwit (35%), 36g koolhydraten (5%), 191g vet (60%)

3. **Carnivoor - Spiermassa** (ID: 69)
   - 3260 kcal, 285g eiwit (35%), 204g koolhydraten (25%), 218g vet (40%)

### **Gebalanceerde Plannen:**
4. **Voedingsplan - Droogtrainen** (ID: 70)
   - 2360 kcal, 236g eiwit (40%), 236g koolhydraten (40%), 52g vet (20%)

5. **Voedingsplan - Onderhoud** (ID: 71)
   - 2860 kcal, 250g eiwit (35%), 286g koolhydraten (40%), 79g vet (25%)

6. **Voedingsplan - Spiermassa** (ID: 72)
   - 3260 kcal, 245g eiwit (30%), 408g koolhydraten (50%), 72g vet (20%)

### **Belangrijk:**
- ✅ **Macro percentages** zijn per plan configureerbaar in de admin interface
- ✅ **Target grammen** worden automatisch berekend op basis van percentages
- ✅ **Flexibiliteit**: Elke plan kan eigen macro verdeling hebben

---

## 🔧 RECENTE FIXES

### **Macro Calculation Discrepancy Fix:**
- ❌ **Probleem**: Edit view toonde 79g vet, card view toonde 52g vet
- ✅ **Oorzaak**: PlanBuilder laadde verouderde data uit `meals` object
- ✅ **Oplossing**: Gebruik altijd hoofdtabel data voor target values
- ✅ **Database fix**: Gecorrigeerd alle verouderde `meals` target data

---

## 🎯 VOLGENDE STAP: FRONTEND INTEGRATIE

### **Wat moet er gebeuren:**
1. **Plan Weergave** - Zorg dat nieuwe macro percentages correct worden getoond
2. **Dynamische Plannen** - Integreer nieuwe berekeningsformules
3. **User Experience** - Verbeter plan selectie en weergave
4. **Data Synchronisatie** - Zorg voor consistente data tussen admin en user views

### **Belangrijke Punten:**
- ✅ Database schema is compleet en correct
- ✅ API endpoints zijn volledig functioneel
- ✅ Admin interface werkt perfect
- 🔄 **User interface moet worden geüpdatet** voor nieuwe structuur
- 🔄 **Dynamische plan generatie** moet nieuwe formules gebruiken

---

## 📈 TECHNISCHE VOORDELEN

1. **Flexibiliteit** - Macro percentages kunnen per plan worden aangepast via admin interface
2. **Consistentie** - Eén bron van waarheid voor alle macro data (percentages in database)
3. **Schaalbaarheid** - Nieuwe plannen kunnen eenvoudig worden toegevoegd met eigen macro verdeling
4. **Precisie** - TTM-specifieke calorie berekening + plan-specifieke macro percentages
5. **Onderhoudbaarheid** - Duidelijke scheiding tussen admin en user interfaces
6. **Bidirectioneel** - Percentages ↔ grammen conversie werkt beide kanten op

---

## 🚀 CONCLUSIE

De voedingsplannen update is **technisch compleet** en **production-ready**. De database, API's en admin interface zijn volledig functioneel. De volgende stap is het **updaten van de user-facing frontend** om de nieuwe structuur en formules te gebruiken.

**Status: ✅ Backend Complete | 🔄 Frontend Update Required**
