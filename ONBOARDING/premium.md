# Premium Tier Onboarding Analysis

## Overzicht
Premium tier gebruikers hebben toegang tot alle features en doorlopen een volledige onboarding flow van 6 stappen.

## Onboarding Flow (6 Stappen)

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
- **Volgende stap:** Training schemas

### Stap 3: Trainingsschema Kiezen
- **Component:** `TrainingschemasPage`
- **Locatie:** `/dashboard/trainingsschemas`
- **Actie:** Schema selecteren en bevestigen
- **Volgende stap:** Nutrition plans

### Stap 4: Voedingsplan Selecteren
- **Component:** `VoedingsplannenV2Page`
- **Locatie:** `/dashboard/voedingsplannen-v2`
- **Actie:** Nutrition plan selecteren
- **Volgende stap:** Forum introductie

### Stap 5: Forum Introductie
- **Component:** `ThreadPage` (Forum)
- **Locatie:** `/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden`
- **Actie:** Post plaatsen in introductie topic (topic_id: 19)
- **Volgende stap:** Onboarding voltooid

## Sidebar Gedrag

### Tijdens Onboarding
- **Stap 0-1:** Alleen Dashboard toegankelijk
- **Stap 2:** Alleen Challenges toegankelijk
- **Stap 3:** Alleen Trainingsschemas toegankelijk
- **Stap 4:** Alleen Voedingsplannen toegankelijk
- **Stap 5:** Alleen Brotherhood > Forum toegankelijk

### Na Onboarding
- **Volledige toegang** tot alle premium features

## Database Schema

### `user_onboarding_status` tabel
```sql
welcome_video_shown: boolean
goal_set: boolean
missions_selected: boolean
training_schema_selected: boolean
nutrition_plan_selected: boolean
challenge_started: boolean
onboarding_completed: boolean
```

## Toegang Control

### Wat Premium Tier WEL heeft:
- ✅ Dashboard
- ✅ Challenges
- ✅ Training Schemas
- ✅ Nutrition Plans
- ✅ Forum
- ✅ Brotherhood
- ✅ Academy (volledig)
- ✅ Finance & Business (volledig)
- ✅ Mind & Focus (binnenkort)
- ✅ Boekenkamer (binnenkort)

### Package Type Detection
```typescript
const hasTrainingAccess = packageType === 'premium' || packageType === 'lifetime' || 
                         packageType === 'Premium Tier' || packageType === 'Lifetime Tier';
```

## Problemen Geïdentificeerd

### 1. Step Mapping Inconsistentie
- **API Logic:** Step 3 = SELECT_TRAINING, Step 4 = SELECT_NUTRITION
- **Dashboard Redirect:** Was incorrect (nu gefixed)
- **Modal Logic:** Correct maar complex

### 2. Authentication Issues
- **Probleem:** Premium users werden uitgelogd tijdens step 4
- **Oorzaak:** Verkeerde redirect naar niet-bestaande pagina
- **Fix:** Correcte step mapping geïmplementeerd

### 3. Complex Sidebar Logic
```typescript
// Huidige complexe logica
const isBasicTier = !hasTrainingAccess && !hasNutritionAccess;
const isLastStep = isBasicTier ? actualCurrentStep === 5 : actualCurrentStep === 5;
```

### 4. Modal vs Page Inconsistentie
- Stap 0-1: Modal overlay (OnboardingV2Modal)
- Stap 2+: Volledige pagina redirects
- Geen consistente user experience

## Code Complexiteit

### OnboardingV2Modal
- **Probleem:** Toont alleen stappen 0-1, rest wordt geredirect
- **Complexiteit:** `renderStep()` heeft switch case voor alle stappen maar gebruikt router.push

### Dashboard Redirects
- **Probleem:** Hardcoded redirects in useEffect
- **Risico:** Inconsistent met API step mapping

### API Step Logic
- **Complexiteit:** Dubbele logica voor basic vs premium
- **Probleem:** Stappen 3,4 worden geskipt voor basic tier

## Aanbevelingen

### 1. Vereenvoudig Architecture
```typescript
// Centrale step definition
const ONBOARDING_STEPS = {
  WELCOME_VIDEO: { id: 0, component: 'modal', requiresAccess: null },
  SET_GOAL: { id: 1, component: 'modal', requiresAccess: null },
  SELECT_CHALLENGES: { id: 2, component: 'page', requiresAccess: null },
  SELECT_TRAINING: { id: 3, component: 'page', requiresAccess: 'training' },
  SELECT_NUTRITION: { id: 4, component: 'page', requiresAccess: 'nutrition' },
  FORUM_INTRO: { id: 5, component: 'page', requiresAccess: null }
};
```

### 2. Elimineer Dubbele Logica
- Één centrale step manager
- Geen dubbele redirects in modal en dashboard
- Consistente step completion logic

### 3. Verbeter Sidebar Logic
```typescript
const getCurrentStepAccess = (step: number, userTier: 'basic' | 'premium') => {
  const allowedSteps = userTier === 'basic' ? [0,1,2,5] : [0,1,2,3,4,5];
  return allowedSteps.includes(step);
};
```

### 4. Consistent User Experience
- Alle stappen als modals OF alle als pages
- Geen mix van modal/page transitions
- Duidelijke progress indicator

## Kritieke Issues

### 1. Authentication Stability
- Premium users kunnen uitloggen tijdens onboarding
- Session management tijdens redirects
- Token refresh tijdens lange onboarding flow

### 2. State Management
- Onboarding state wordt op meerdere plekken beheerd
- Race conditions tussen API calls
- Inconsistent state updates

### 3. Error Handling
- Geen fallback voor failed step completions
- Gebruikers kunnen vast komen te zitten in onboarding
- Geen retry mechanisme
