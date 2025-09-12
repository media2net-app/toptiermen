# 🎯 Stap 2: Uitdagingen

## 📋 **OVERZICHT**

De derde stap van de onboarding is het selecteren van 3-5 uitdagingen (challenges) die de gebruiker dagelijks wil voltooien. Dit is een kritieke stap die de basis legt voor dagelijkse engagement.

---

## **🎯 DOELSTELLING**

- **Dagelijkse Routine**: Gebruiker stelt dagelijkse uitdagingen in
- **Engagement**: Zorgt voor dagelijkse terugkeer naar platform
- **Progressie**: Meetbare doelen voor motivatie
- **Personalisatie**: Uitdagingen passend bij hoofddoel

---

## **📍 TECHNISCHE DETAILS**

### **URL & Routing**
```
URL: /dashboard/mijn-uitdagingen
Middleware: Stap 2 toegang
Component: MijnUitdagingenPage
API: /api/missions-simple
```

### **Database Updates**
```sql
-- user_missions tabel (voor elke geselecteerde uitdaging)
INSERT INTO user_missions (
  user_id,
  mission_id,
  title,
  category_slug,
  frequency_type,
  points,
  is_active,
  created_at
) VALUES (?, ?, ?, ?, 'daily', ?, true, NOW());

-- onboarding_status tabel
UPDATE onboarding_status 
SET 
  step_2_completed = true,
  current_step = 3
WHERE user_id = ?;
```

---

## **🎮 GEBRUIKERSERVARING**

### **Uitdagingen Bibliotheek**

#### **Categorieën**
- **Fitness & Gezondheid**: Lichamelijke uitdagingen
- **Mindset & Focus**: Mentale uitdagingen  
- **Business & Carrière**: Professionele uitdagingen
- **Relaties & Sociale Vaardigheden**: Sociale uitdagingen
- **Persoonlijke Groei**: Algemene ontwikkeling

#### **Moeilijkheidsgraden**
- **Easy** (🟢): 30-50 XP, 5-15 minuten
- **Medium** (🟡): 60-80 XP, 15-30 minuten
- **Hard** (🔴): 90-100 XP, 30+ minuten

### **Selectie Proces**
```
1. Gebruiker bekijkt uitdagingen bibliotheek
2. Filtert op categorie/moeilijkheid
3. Selecteert 3-5 uitdagingen
4. Bevestigt selectie
5. Uitdagingen worden toegevoegd aan profiel
```

---

## **🔧 IMPLEMENTATIE**

### **Component Structuur**
```typescript
// src/app/dashboard/mijn-uitdagingen/page.tsx
export default function MijnUitdagingenPage() {
  const { user } = useSupabaseAuth();
  const { currentStep, completeCurrentStep } = useOnboarding();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);

  // Load existing challenges
  useEffect(() => {
    loadChallenges();
  }, [user?.id]);

  const loadChallenges = async () => {
    try {
      const response = await fetch(`/api/missions-simple?userId=${user.id}`);
      const data = await response.json();
      setChallenges(data.missions);
    } catch (error) {
      setError('Failed to load challenges');
    }
  };

  const handleChallengeSelect = (challengeId: string) => {
    setSelectedChallenges(prev => {
      if (prev.includes(challengeId)) {
        return prev.filter(id => id !== challengeId);
      } else if (prev.length < 5) {
        return [...prev, challengeId];
      }
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (selectedChallenges.length < 3) {
      setError('Selecteer minimaal 3 uitdagingen');
      return;
    }

    // Add selected challenges to user profile
    await addChallenges(selectedChallenges);
    
    // Complete step
    await completeCurrentStep();
  };
}
```

### **API Integration**
```typescript
// API call naar missions-simple
const response = await fetch(`/api/missions-simple?userId=${user.id}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
// data.missions bevat de uitdagingen
// data.summary bevat statistieken
```

---

## **📊 CHALLENGE LIBRARY**

### **Fitness & Gezondheid**
```typescript
const FITNESS_CHALLENGES = [
  {
    id: 'fitness-1',
    title: '30 minuten wandelen',
    category: 'Fitness & Gezondheid',
    icon: '🚶‍♂️',
    description: 'Dagelijkse wandeling voor cardiovasculaire gezondheid',
    xp_reward: 50,
    difficulty: 'easy'
  },
  {
    id: 'fitness-2',
    title: '20 push-ups',
    category: 'Fitness & Gezondheid',
    icon: '💪',
    description: 'Versterk je bovenlichaam met push-ups',
    xp_reward: 75,
    difficulty: 'medium'
  },
  // ... meer uitdagingen
];
```

### **Mindset & Focus**
```typescript
const MINDSET_CHALLENGES = [
  {
    id: 'mind-1',
    title: '10 minuten mediteren',
    category: 'Mindset & Focus',
    icon: '🧘‍♀️',
    description: 'Verbeter je mentale helderheid en focus',
    xp_reward: 80,
    difficulty: 'medium'
  },
  {
    id: 'mind-2',
    title: '30 minuten lezen',
    category: 'Mindset & Focus',
    icon: '📚',
    description: 'Stimuleer je brein met dagelijkse leesroutine',
    xp_reward: 70,
    difficulty: 'medium'
  },
  // ... meer uitdagingen
];
```

---

## **📊 TRACKING & ANALYTICS**

### **Events die worden getrackt**
- `challenges_page_loaded` - Pagina geladen
- `challenge_filtered` - Filter toegepast
- `challenge_selected` - Uitdaging geselecteerd
- `challenge_deselected` - Uitdaging gedeselecteerd
- `challenges_submitted` - Selectie bevestigd
- `step_2_completed` - Stap voltooid

### **Metrics**
- **Selection Rate**: % uitdagingen die worden geselecteerd
- **Category Preferences**: Populaire categorieën
- **Difficulty Distribution**: Moeilijkheidsgraad keuzes
- **Completion Time**: Tijd om selectie te maken

---

## **🚨 TROUBLESHOOTING**

### **Veelvoorkomende Problemen**

#### **"Failed to load challenges" Error**
```typescript
// Dit was het probleem dat we net hebben opgelost
// Oplossing: API endpoint van /api/challenges-simple naar /api/missions-simple

// Debug API call
const debugAPI = async () => {
  try {
    console.log('🔍 Testing API endpoint...');
    const response = await fetch(`/api/missions-simple?userId=${user.id}`);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
  } catch (error) {
    console.error('API error:', error);
  }
};
```

#### **Challenges Niet Zichtbaar**
- Check API response structuur
- Verify data.missions vs data.challenges
- Controleer component state updates

#### **Selectie Slaat Niet Op**
```typescript
// Debug challenge selection
const debugSelection = async (challengeIds: string[]) => {
  try {
    const response = await fetch('/api/missions-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        challengeIds: challengeIds
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Challenges added:', result);
  } catch (error) {
    console.error('Failed to add challenges:', error);
  }
};
```

---

## **🧪 TESTING**

### **Test Scenarios**
1. **Happy Path**: 3-5 uitdagingen geselecteerd
2. **Minimal Selection**: Exact 3 uitdagingen
3. **Maximum Selection**: Exact 5 uitdagingen
4. **API Failure**: Network/server errors
5. **Empty State**: Geen uitdagingen beschikbaar

### **Test Data**
```typescript
// Test challenge selection
const testChallengeSelection = [
  'fitness-1', // 30 minuten wandelen
  'mind-1',    // 10 minuten mediteren
  'business-1' // 30 minuten leren
];

// Verify selection
const verifySelection = (selectedIds: string[]) => {
  console.log('Selected challenges:', selectedIds);
  console.log('Count:', selectedIds.length);
  console.log('Valid:', selectedIds.length >= 3 && selectedIds.length <= 5);
};
```

---

## **📈 SUCCESS CRITERIA**

- ✅ API laadt challenges binnen 3 seconden
- ✅ 95%+ success rate voor challenge loading
- ✅ Selectie werkt correct (3-5 challenges)
- ✅ Database wordt correct bijgewerkt
- ✅ Smooth transition naar stap 3

---

## **🔗 GERELATEERDE BESTANDEN**

- `src/app/dashboard/mijn-uitdagingen/page.tsx`
- `src/app/api/missions-simple/route.ts`
- `src/contexts/OnboardingContext.tsx`
- `src/middleware.ts` (redirect logic)

---

## **💡 UX TIPS**

### **Challenge Selection**
- **Visual Cards**: Duidelijke uitdaging cards
- **Progress Indicator**: Toon selectie voortgang
- **Smart Recommendations**: Suggesties gebaseerd op hoofddoel
- **Quick Add**: Snelle toevoeging van populaire uitdagingen

### **Filtering & Search**
- **Category Filters**: Filter op categorie
- **Difficulty Filters**: Filter op moeilijkheid
- **Search Function**: Zoek in uitdagingen
- **Favorites**: Markeer favoriete uitdagingen

---

*Laatste update: $(date)*
*Versie: 3.1.0*
