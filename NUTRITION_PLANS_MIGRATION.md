# 🍽️ Voedingsplannen Migratie & Koppeling

## 📋 Overzicht

De hardcoded voedingsplannen uit de frontend zijn nu gekoppeld aan het admin dashboard. Dit betekent dat je alle voedingsplannen kunt beheren via het admin panel in plaats van de code aan te passen.

## 🔄 Wat is er gemigreerd?

### Frontend Plannen (Nu in Database)
- **Gebalanceerd** (`balanced`) - Voor duurzame energie en algehele gezondheid
- **Koolhydraatarm / Keto** (`low_carb`) - Focus op vetverbranding
- **Carnivoor (Rick's Aanpak)** (`carnivore`) - Voor maximale eenvoud
- **High Protein** (`high_protein`) - Voor spieropbouw en herstel

### Database Structuur
```sql
nutrition_plans (
  id SERIAL PRIMARY KEY,
  plan_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon VARCHAR(10),
  color VARCHAR(100),
  meals JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🚀 Setup Instructies

### 1. Database Tabel Aanmaken
Voer het SQL script uit in je Supabase database:

```bash
# Ga naar Supabase Dashboard > SQL Editor
# Voer het script uit: scripts/create-nutrition-plans-table.sql
```

### 2. Migreer Frontend Plannen
Ga naar het admin dashboard en klik op de "Frontend Plannen" tab:

1. **Admin Dashboard** → **Voedingsplannen** → **Frontend Plannen**
2. Klik op **"Herlaad Plannen"** om de hardcoded plannen naar de database te migreren
3. De plannen verschijnen nu in de database en zijn beheerbaar

### 3. Frontend Gebruik
De frontend laadt nu automatisch de plannen uit de database:

- **Fallback**: Als een plan niet in de database staat, gebruikt de frontend de hardcoded versie
- **Database Prioriteit**: Plannen uit de database hebben voorrang op hardcoded plannen
- **Real-time Updates**: Wijzigingen in het admin dashboard zijn direct zichtbaar voor gebruikers

## 🛠️ Admin Beheer

### Beschikbare Acties
- ✅ **Bekijken**: Alle gemigreerde plannen zijn zichtbaar
- ✅ **Bewerken**: Plan details, maaltijden en ingrediënten aanpassen
- ✅ **Verwijderen**: Plannen deactiveren of verwijderen
- ✅ **Toevoegen**: Nieuwe plannen aanmaken

### Plan Structuur
Elk plan bevat:
```json
{
  "plan_id": "balanced",
  "name": "Gebalanceerd",
  "subtitle": "Voor duurzame energie en algehele gezondheid",
  "description": "Een mix van alle macronutriënten",
  "icon": "🥗",
  "color": "from-green-500 to-emerald-600",
  "meals": [
    {
      "id": "breakfast-1",
      "name": "Havermout met Blauwe Bessen & Walnoten",
      "image": "https://...",
      "ingredients": [...],
      "time": "08:00",
      "type": "breakfast"
    }
  ]
}
```

## 🔧 API Endpoints

### GET `/api/admin/migrate-nutrition-plans`
Haalt alle voedingsplannen op uit de database.

### POST `/api/admin/migrate-nutrition-plans`
Migreert de hardcoded plannen naar de database.

## 📱 Frontend Integratie

### Automatische Laad
De frontend laadt automatisch plannen uit de database:

```typescript
// In voedingsplannen/page.tsx
useEffect(() => {
  const fetchDatabasePlans = async () => {
    const response = await fetch('/api/admin/migrate-nutrition-plans');
    const data = await response.json();
    if (data.success && data.plans) {
      setDatabasePlans(data.plans);
    }
  };
  fetchDatabasePlans();
}, []);
```

### Plan Generatie
De `generateMealPlan` functie gebruikt nu database plannen:

```typescript
const generateMealPlan = (goals: NutritionGoals, dietType: string): MealPlan => {
  // Zoek het plan in de database
  const databasePlan = databasePlans.find(plan => plan.plan_id === dietType);
  
  if (databasePlan && databasePlan.meals) {
    // Gebruik de maaltijden uit de database
    return {
      meals: databasePlan.meals.map((meal: any) => ({
        ...meal,
        ...calculateMacrosFromIngredients(meal.ingredients)
      }))
    };
  }
  
  // Fallback naar hardcoded plannen
  // ...
};
```

## 🔒 Beveiliging

- **RLS Policies**: Alleen admins kunnen plannen beheren
- **Authenticatie**: Alle endpoints vereisen authenticatie
- **Validatie**: Input validatie op alle velden

## 🎯 Voordelen

1. **Geen Code Wijzigingen**: Plannen aanpassen zonder code deployment
2. **Real-time Updates**: Wijzigingen direct zichtbaar voor gebruikers
3. **Admin Controle**: Volledige controle via admin dashboard
4. **Fallback Systeem**: Hardcoded plannen als backup
5. **Schaalbaarheid**: Makkelijk nieuwe plannen toevoegen

## 🚨 Belangrijke Notities

- **Backup**: De hardcoded plannen blijven bestaan als fallback
- **Compatibiliteit**: Bestaande gebruikerservaring blijft intact
- **Performance**: Database queries zijn geoptimaliseerd met indexes
- **Monitoring**: Alle wijzigingen worden gelogd in de database

## 🔄 Volgende Stappen

1. **Test de migratie** in development
2. **Voer het SQL script uit** in production
3. **Migreer de plannen** via admin dashboard
4. **Test de frontend** om te controleren of alles werkt
5. **Pas plannen aan** naar wens via admin dashboard

---

**Status**: ✅ Klaar voor gebruik  
**Laatste Update**: September 2024  
**Auteur**: AI Assistant
