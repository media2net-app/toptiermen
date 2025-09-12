# 🏆 Stap 5: Challenges

## 📋 **OVERZICHT**

De zesde stap van de onboarding is het selecteren van een challenge. Dit is een specifieke uitdaging die de gebruiker helpt om een specifiek doel te bereiken binnen een bepaalde tijdsperiode.

---

## **🎯 DOELSTELLING**

- **Challenge Selection**: Gebruiker kiest een specifieke uitdaging
- **Goal Achievement**: Challenge helpt bij het bereiken van doelen
- **Time-bound**: Duidelijke tijdsperiode en deadline
- **Motivation**: Extra motivatie en accountability

---

## **📍 TECHNISCHE DETAILS**

### **URL & Routing**
```
URL: /dashboard/challenges
Middleware: Stap 5 toegang
Component: ChallengesPage
API: /api/challenges
```

### **Database Updates**
```sql
-- user_challenges tabel
INSERT INTO user_challenges (
  user_id,
  challenge_id,
  selected_challenge,
  start_date,
  end_date,
  is_active,
  created_at
) VALUES (?, ?, ?, NOW(), ?, true, NOW());

-- onboarding_status tabel
UPDATE onboarding_status 
SET 
  step_5_completed = true,
  current_step = 6
WHERE user_id = ?;
```

---

## **🎮 GEBRUIKERSERVARING**

### **Challenge Opties**

#### **30-Dagen Challenges**
- **30-Day Fitness Challenge**: Dagelijkse workout routine
- **30-Day Nutrition Challenge**: Gezonde eetgewoonten
- **30-Day Mindset Challenge**: Positieve mindset ontwikkeling
- **30-Day Productivity Challenge**: Productiviteit verhogen

#### **60-Dagen Challenges**
- **60-Day Transformation**: Complete lifestyle verandering
- **60-Day Strength Challenge**: Kracht opbouw programma
- **60-Day Habit Builder**: Nieuwe gewoonten ontwikkelen

#### **90-Dagen Challenges**
- **90-Day Life Change**: Grote levensverandering
- **90-Day Mastery**: Meesterschap in specifiek gebied
- **90-Day Business Challenge**: Business/carrière groei

### **Challenge Informatie**
```typescript
interface Challenge {
  id: string;
  name: string;
  description: string;
  duration: number; // dagen
  category: 'fitness' | 'nutrition' | 'mindset' | 'productivity' | 'business';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  requirements: string[];
  rewards: {
    xp: number;
    badge: string;
    certificate: boolean;
  };
  dailyTasks: DailyTask[];
  milestones: Milestone[];
  community: {
    participants: number;
    completionRate: number;
  };
}
```

---

## **🔧 IMPLEMENTATIE**

### **Component Structuur**
```typescript
// src/app/dashboard/challenges/page.tsx
export default function ChallengesPage() {
  const { user } = useSupabaseAuth();
  const { currentStep, completeCurrentStep } = useOnboarding();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/challenges');
      
      if (!response.ok) {
        throw new Error('Failed to load challenges');
      }
      
      const data = await response.json();
      setChallenges(data.challenges);
    } catch (err) {
      console.error('Error loading challenges:', err);
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeSelect = (challengeId: string) => {
    setSelectedChallenge(challengeId);
  };

  const handleSubmit = async () => {
    if (!selectedChallenge) {
      setError('Selecteer een challenge');
      return;
    }

    try {
      // Save selected challenge
      await saveChallenge(selectedChallenge);
      
      // Complete step
      await completeCurrentStep();
    } catch (err) {
      setError('Kon challenge niet opslaan');
    }
  };
}
```

### **Challenge Selection UI**
```typescript
const ChallengeCard = ({ challenge, isSelected, onSelect }: ChallengeCardProps) => (
  <div 
    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
      isSelected 
        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10' 
        : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
    }`}
    onClick={() => onSelect(challenge.id)}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-bold text-white">{challenge.name}</h3>
      <div className="flex gap-2">
        <span className={`px-3 py-1 rounded-full text-sm ${
          challenge.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
          challenge.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {challenge.difficulty}
        </span>
        <span className="px-3 py-1 bg-[#3A4D23] rounded-full text-sm text-[#8BAE5A]">
          {challenge.duration} dagen
        </span>
      </div>
    </div>
    
    <p className="text-[#8BAE5A]/70 mb-4">{challenge.description}</p>
    
    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
      <div>
        <span className="text-[#8BAE5A]">Categorie:</span>
        <span className="text-white ml-2 capitalize">{challenge.category}</span>
      </div>
      <div>
        <span className="text-[#8BAE5A]">XP Reward:</span>
        <span className="text-white ml-2">{challenge.rewards.xp}</span>
      </div>
      <div>
        <span className="text-[#8BAE5A]">Deelnemers:</span>
        <span className="text-white ml-2">{challenge.community.participants}</span>
      </div>
      <div>
        <span className="text-[#8BAE5A]">Succes Rate:</span>
        <span className="text-white ml-2">{challenge.community.completionRate}%</span>
      </div>
    </div>

    <div className="mb-4">
      <span className="text-[#8BAE5A] text-sm">Vereisten:</span>
      <ul className="mt-1 text-sm text-white">
        {challenge.requirements.map((req, index) => (
          <li key={index} className="flex items-center">
            <span className="w-2 h-2 bg-[#8BAE5A] rounded-full mr-2"></span>
            {req}
          </li>
        ))}
      </ul>
    </div>

    <div className="flex items-center justify-between">
      <div className="text-sm text-[#8BAE5A]/70">
        Badge: {challenge.rewards.badge}
      </div>
      {challenge.rewards.certificate && (
        <div className="text-sm text-[#FFD700]">
          🏆 Certificaat
        </div>
      )}
    </div>
  </div>
);
```

---

## **📊 CHALLENGES DATABASE**

### **Challenge Voorbeelden**
```typescript
const CHALLENGES = [
  {
    id: '30-day-fitness',
    name: '30-Day Fitness Challenge',
    description: 'Dagelijkse workout routine voor 30 dagen om je fitness niveau te verbeteren',
    duration: 30,
    category: 'fitness',
    difficulty: 'beginner',
    requirements: [
      'Dagelijks 30 minuten beweging',
      '3x per week krachttraining',
      '2x per week cardio',
      'Dagelijks stretchen'
    ],
    rewards: {
      xp: 1000,
      badge: 'Fitness Warrior',
      certificate: true
    },
    dailyTasks: [
      { day: 1, task: '10 minuten wandelen', xp: 25 },
      { day: 2, task: '15 minuten yoga', xp: 30 },
      { day: 3, task: '20 minuten krachttraining', xp: 40 },
      // ... meer taken
    ],
    milestones: [
      { day: 7, title: 'Eerste week voltooid', reward: 100 },
      { day: 14, title: 'Halverwege', reward: 200 },
      { day: 21, title: 'Derde week', reward: 300 },
      { day: 30, title: 'Challenge voltooid!', reward: 500 }
    ],
    community: {
      participants: 1250,
      completionRate: 78
    }
  },
  {
    id: '60-day-transformation',
    name: '60-Day Transformation',
    description: 'Complete lifestyle verandering in 60 dagen',
    duration: 60,
    category: 'fitness',
    difficulty: 'intermediate',
    requirements: [
      'Dagelijks 45 minuten beweging',
      'Strikt voedingsplan volgen',
      'Dagelijks journaling',
      'Weekelijkse progress foto\'s'
    ],
    rewards: {
      xp: 2500,
      badge: 'Transformation Master',
      certificate: true
    },
    dailyTasks: [
      { day: 1, task: 'Baseline metingen', xp: 50 },
      { day: 2, task: 'Meal prep voor de week', xp: 75 },
      { day: 3, task: 'Eerste workout', xp: 100 },
      // ... meer taken
    ],
    milestones: [
      { day: 14, title: 'Eerste checkpoint', reward: 200 },
      { day: 30, title: 'Halverwege', reward: 500 },
      { day: 45, title: 'Finale sprint', reward: 750 },
      { day: 60, title: 'Transformation voltooid!', reward: 1000 }
    ],
    community: {
      participants: 850,
      completionRate: 65
    }
  }
];
```

---

## **📊 TRACKING & ANALYTICS**

### **Events die worden getrackt**
- `challenges_loaded` - Challenges geladen
- `challenge_previewed` - Challenge preview bekeken
- `challenge_selected` - Challenge geselecteerd
- `challenge_submitted` - Challenge bevestigd
- `step_5_completed` - Stap voltooid

### **Metrics**
- **Challenge Selection Rate**: Populaire challenges
- **Duration Preferences**: Voorkeur voor challenge duur
- **Category Distribution**: Categorie keuzes
- **Completion Time**: Tijd om keuze te maken

---

## **🚨 TROUBLESHOOTING**

### **Veelvoorkomende Problemen**

#### **"Failed to load challenges" Error**
```typescript
// Debug API call
const debugChallenges = async () => {
  try {
    console.log('🔍 Testing challenges API...');
    const response = await fetch('/api/challenges');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Challenges:', data);
  } catch (error) {
    console.error('Challenges API error:', error);
  }
};
```

#### **Challenge Selection Issues**
- Check API response structure
- Verify challenge data format
- Controleer component state updates

#### **Database Save Issues**
```typescript
// Debug challenge saving
const debugChallengeSave = async (challengeId: string) => {
  try {
    const response = await fetch('/api/user-challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        challengeId: challengeId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Challenge saved:', result);
  } catch (error) {
    console.error('Failed to save challenge:', error);
  }
};
```

---

## **🧪 TESTING**

### **Test Scenarios**
1. **Happy Path**: Challenge geselecteerd en opgeslagen
2. **No Selection**: Geen challenge geselecteerd
3. **API Failure**: Network/server errors
4. **Empty State**: Geen challenges beschikbaar
5. **Preview Function**: Challenge preview bekijken

### **Test Data**
```typescript
// Test challenge selection
const testChallengeSelection = {
  challengeId: '30-day-fitness',
  userId: 'test-user-id',
  expectedResult: {
    success: true,
    message: 'Challenge saved successfully'
  }
};

// Verify challenge data
const verifyChallengeData = (challenge: Challenge) => {
  console.log('Challenge ID:', challenge.id);
  console.log('Challenge Name:', challenge.name);
  console.log('Duration:', challenge.duration, 'days');
  console.log('Category:', challenge.category);
  console.log('Difficulty:', challenge.difficulty);
  console.log('XP Reward:', challenge.rewards.xp);
  console.log('Participants:', challenge.community.participants);
};
```

---

## **📈 SUCCESS CRITERIA**

- ✅ Challenges laden binnen 3 seconden
- ✅ 95%+ success rate voor challenge loading
- ✅ Selectie werkt correct
- ✅ Database wordt correct bijgewerkt
- ✅ Smooth transition naar stap 6

---

## **🔗 GERELATEERDE BESTANDEN**

- `src/app/dashboard/challenges/page.tsx`
- `src/app/api/challenges/route.ts`
- `src/app/api/user-challenges/route.ts`
- `src/contexts/OnboardingContext.tsx`
- `src/middleware.ts` (redirect logic)

---

## **💡 UX TIPS**

### **Challenge Selection**
- **Visual Cards**: Duidelijke challenge cards met info
- **Difficulty Indicators**: Kleurgecodeerde moeilijkheidsgraad
- **Community Stats**: Toon deelnemers en succes rate
- **Preview Function**: Bekijk dagelijkse taken en milestones

### **Information Display**
- **Duration**: Duidelijke tijdsduur
- **Requirements**: Lijst van vereisten
- **Rewards**: XP, badges en certificaten
- **Community**: Aantal deelnemers en succes rate

---

*Laatste update: $(date)*
*Versie: 3.1.0*
