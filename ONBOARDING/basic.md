# Basic Tier Onboarding Analysis

## Overzicht
Basic tier gebruikers hebben een vereenvoudigde onboarding flow zonder toegang tot training en nutrition features.

## Onboarding Flow (4 Stappen)

### Stap 0: Welkomstvideo
- **Component:** `OnboardingV2Modal` → `WelcomeVideoStep`
- **Locatie:** `/dashboard/welcome-video-v2`
- **Actie:** Video volledig bekijken
- **Volgende stap:** Dashboard (modal voor stap 1)

### Stap 1: Hoofddoel Instellen
- **Component:** `OnboardingV2Modal` → `SetGoalStep`
- **Locatie:** Dashboard met modal overlay
- **Actie:** Doel beschrijven in één zin
- **Volgende stap:** Challenges pagina

### Stap 2: Uitdagingen Selecteren
- **Component:** `MijnChallengesPage`
- **Locatie:** `/dashboard/mijn-challenges`
- **Actie:** 3 challenges selecteren/toevoegen
- **Volgende stap:** Forum introductie (skip training & nutrition)

### Stap 3: Forum Introductie
- **Component:** `ThreadPage` (Forum)
- **Locatie:** `/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden`
- **Actie:** Post plaatsen in introductie topic (topic_id: 19)
- **Volgende stap:** Onboarding voltooid

## Sidebar Gedrag

### Tijdens Onboarding
- **Stap 0-1:** Alleen Dashboard toegankelijk
- **Stap 2:** Alleen Challenges toegankelijk
- **Stap 3:** Alleen Brotherhood > Forum toegankelijk

### Na Onboarding
- **Volledige toegang** tot alle basic tier features
- **Training/Nutrition:** Upgrade prompts

## Database Schema

### `user_onboarding_status` tabel
```sql
welcome_video_shown: boolean
goal_set: boolean
missions_selected: boolean
training_schema_selected: boolean (false voor basic)
nutrition_plan_selected: boolean (false voor basic)
challenge_started: boolean
onboarding_completed: boolean
```

## Toegang Control

### Wat Basic Tier WEL heeft:
- ✅ Dashboard
- ✅ Challenges
- ✅ Forum
- ✅ Brotherhood
- ✅ Academy (beperkt)
- ✅ Finance & Business (beperkt)

### Wat Basic Tier NIET heeft:
- ❌ Training Schemas
- ❌ Nutrition Plans
- ❌ Mind & Focus
- ❌ Boekenkamer

## Problemen Geïdentificeerd

### 1. Inconsistente Step Mapping
- **API:** Step 3 = SELECT_TRAINING, Step 4 = SELECT_NUTRITION
- **Frontend:** Verwarrende redirects tussen stappen

### 2. Sidebar Logic Complexiteit
- `isMenuItemDisabled` functie heeft complexe logica
- Basic tier detection via `!hasTrainingAccess && !hasNutritionAccess`

### 3. Modal vs Page Transitions
- Stap 0-1: Modal overlay
- Stap 2+: Volledige pagina redirects
- Inconsistente user experience

## Aanbevelingen

### 1. Vereenvoudig Sidebar Logic
```typescript
const isBasicTier = packageType === 'basic';
const allowedSteps = {
  basic: [0, 1, 2, 5], // Skip 3,4
  premium: [0, 1, 2, 3, 4, 5]
};
```

### 2. Consistente Step Mapping
- Gebruik één centrale step definition
- Elimineer dubbele logica in API en frontend

### 3. Verbeter User Experience
- Consistent modal gedrag voor alle stappen
- Duidelijke progress indicator
- Betere error handling
