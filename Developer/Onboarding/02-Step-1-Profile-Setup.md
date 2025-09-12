# 👤 Stap 1: Profile Setup

## 📋 **OVERZICHT**

De tweede stap van de onboarding is het invullen van het gebruikersprofiel. Gebruikers stellen hun basisgegevens in en kiezen hun hoofddoel voor het platform.

---

## **🎯 DOELSTELLING**

- **Profiel Completeren**: Basis gebruikersinformatie verzamelen
- **Hoofddoel Selecteren**: Gebruiker kiest hun primaire focus
- **Personalisatie**: Platform aanpassen aan gebruiker
- **Engagement**: Gebruiker betrekken bij hun journey

---

## **📍 TECHNISCHE DETAILS**

### **URL & Routing**
```
URL: /dashboard/profiel
Middleware: Stap 1 toegang
Component: ProfilePage
```

### **Database Updates**
```sql
-- profiles tabel
UPDATE profiles 
SET 
  full_name = ?,
  display_name = ?,
  bio = ?,
  location = ?,
  website = ?,
  interests = ?,
  main_goal = ?,
  updated_at = NOW()
WHERE id = ?;

-- onboarding_status tabel
UPDATE onboarding_status 
SET 
  step_1_completed = true,
  current_step = 2
WHERE user_id = ?;
```

---

## **🎮 GEBRUIKERSERVARING**

### **Formulier Velden**

#### **Verplichte Velden**
- **Volledige Naam**: `full_name` (string, max 100 chars)
- **Display Naam**: `display_name` (string, max 50 chars)
- **Hoofddoel**: `main_goal` (selectie uit voorgedefinieerde opties)

#### **Optionele Velden**
- **Bio**: `bio` (text, max 500 chars)
- **Locatie**: `location` (string, max 100 chars)
- **Website**: `website` (URL, max 200 chars)
- **Interesses**: `interests` (array van strings)

### **Hoofddoel Opties**
```typescript
const MAIN_GOALS = [
  {
    id: 'fitness',
    title: 'Fitness & Gezondheid',
    description: 'Verbeter je fysieke conditie en gezondheid',
    icon: '💪'
  },
  {
    id: 'mindset',
    title: 'Mindset & Focus',
    description: 'Ontwikkel een sterke mentale houding',
    icon: '🧠'
  },
  {
    id: 'business',
    title: 'Business & Carrière',
    description: 'Groeien in je professionele leven',
    icon: '💼'
  },
  {
    id: 'relationships',
    title: 'Relaties & Sociale Vaardigheden',
    description: 'Verbeter je sociale connecties',
    icon: '🤝'
  },
  {
    id: 'personal',
    title: 'Persoonlijke Groei',
    description: 'Algemene zelfontwikkeling',
    icon: '🌟'
  }
];
```

---

## **🔧 IMPLEMENTATIE**

### **Component Structuur**
```typescript
// src/app/dashboard/profiel/page.tsx
export default function ProfilePage() {
  const { user, profile } = useSupabaseAuth();
  const { currentStep, completeCurrentStep } = useOnboarding();
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    interests: profile?.interests || [],
    main_goal: profile?.main_goal || ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Valideer formulier
    if (!formData.full_name || !formData.main_goal) {
      setError('Vul alle verplichte velden in');
      return;
    }

    // Update profiel
    await updateProfile(formData);
    
    // Voltooi stap
    await completeCurrentStep();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulier velden */}
    </form>
  );
}
```

### **Formulier Validatie**
```typescript
const validateForm = (data: ProfileFormData) => {
  const errors: string[] = [];

  if (!data.full_name?.trim()) {
    errors.push('Volledige naam is verplicht');
  }

  if (!data.main_goal) {
    errors.push('Hoofddoel selecteren is verplicht');
  }

  if (data.website && !isValidUrl(data.website)) {
    errors.push('Website URL is ongeldig');
  }

  return errors;
};
```

---

## **📊 TRACKING & ANALYTICS**

### **Events die worden getrackt**
- `profile_form_started` - Gebruiker begint met invullen
- `profile_field_focused` - Gebruiker klikt op veld
- `profile_goal_selected` - Hoofddoel geselecteerd
- `profile_form_submitted` - Formulier ingediend
- `profile_step_completed` - Stap 1 voltooid

### **Metrics**
- **Completion Rate**: % gebruikers die profiel voltooien
- **Field Completion**: % per veld
- **Goal Distribution**: Populaire hoofddoelen
- **Time to Complete**: Gemiddelde invultijd

---

## **🚨 TROUBLESHOOTING**

### **Veelvoorkomende Problemen**

#### **Formulier Slaat Niet Op**
```typescript
// Debug database update
const updateProfile = async (data: ProfileFormData) => {
  try {
    const response = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Profile updated:', result);
  } catch (error) {
    console.error('Profile update failed:', error);
    setError('Profiel kon niet worden opgeslagen');
  }
};
```

#### **Validatie Errors**
- Controleer veld lengtes
- Verificeer URL format
- Check required fields

#### **Database Connection Issues**
- Check Supabase connection
- Verify user permissions
- Test API endpoints

---

## **🧪 TESTING**

### **Test Scenarios**
1. **Happy Path**: Alle velden correct ingevuld
2. **Minimal Data**: Alleen verplichte velden
3. **Invalid Data**: Ongeldige URLs, te lange teksten
4. **Network Issues**: Offline/online scenarios

### **Test Data**
```typescript
// Test profiel data
const testProfileData = {
  full_name: 'Test Gebruiker',
  display_name: 'TestUser',
  bio: 'Dit is een test bio voor onboarding testing',
  location: 'Amsterdam, Nederland',
  website: 'https://testuser.com',
  interests: ['fitness', 'business', 'mindset'],
  main_goal: 'fitness'
};
```

---

## **📈 SUCCESS CRITERIA**

- ✅ Formulier laadt binnen 2 seconden
- ✅ 90%+ completion rate
- ✅ Alle validaties werken correct
- ✅ Database wordt correct bijgewerkt
- ✅ Smooth transition naar stap 2

---

## **🔗 GERELATEERDE BESTANDEN**

- `src/app/dashboard/profiel/page.tsx`
- `src/app/api/profile/update/route.ts`
- `src/contexts/OnboardingContext.tsx`
- `src/middleware.ts` (redirect logic)

---

## **💡 UX TIPS**

### **Formulier Design**
- **Progress Indicator**: Toon voortgang
- **Auto-save**: Sla tussentijds op
- **Smart Defaults**: Vul velden in waar mogelijk
- **Help Text**: Geef uitleg bij complexe velden

### **Hoofddoel Selectie**
- **Visual Cards**: Gebruik iconen en beschrijvingen
- **Single Selection**: Duidelijke keuze
- **Preview**: Toon impact van keuze

---

*Laatste update: $(date)*
*Versie: 3.1.0*
