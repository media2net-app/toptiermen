# 🥗 Stap 4: Voedingsplannen

## 📋 **OVERZICHT**

De vijfde stap van de onboarding is het selecteren van een voedingsplan. Gebruikers kiezen een passend voedingsprogramma gebaseerd op hun doelen en voorkeuren.

---

## **🎯 DOELSTELLING**

- **Voedingsplan**: Gebruiker selecteert passend voedingsprogramma
- **Doel Alignment**: Voeding ondersteunt fitness doelen
- **Lifestyle Fit**: Plan past bij dagelijkse routine
- **Sustainable Approach**: Langetermijn voedingsgewoonten

---

## **📍 TECHNISCHE DETAILS**

### **URL & Routing**
```
URL: /dashboard/voedingsplannen
Middleware: Stap 4 toegang
Component: VoedingsplannenPage
API: /api/nutrition-plan-simple
```

### **Database Updates**
```sql
-- user_nutrition_plans tabel
INSERT INTO user_nutrition_plans (
  user_id,
  plan_type,
  selected_plan,
  customizations,
  is_active,
  created_at
) VALUES (?, ?, ?, ?, true, NOW());

-- onboarding_status tabel
UPDATE onboarding_status 
SET 
  step_4_completed = true,
  current_step = 5
WHERE user_id = ?;
```

---

## **🎮 GEBRUIKERSERVARING**

### **Voedingsplan Opties**

#### **Gewichtsverlies Plannen**
- **Lean & Mean**: 1500-1800 kcal, 40% eiwit
- **Fat Burner**: 1200-1500 kcal, 45% eiwit
- **Metabolic Boost**: 1600-2000 kcal, 35% eiwit

#### **Spiermassa Plannen**
- **Muscle Builder**: 2500-3000 kcal, 30% eiwit
- **Lean Bulk**: 2200-2700 kcal, 35% eiwit
- **Performance Fuel**: 2800-3200 kcal, 25% eiwit

#### **Onderhoud Plannen**
- **Balanced Life**: 2000-2200 kcal, 25% eiwit
- **Active Lifestyle**: 2200-2500 kcal, 30% eiwit
- **Flexible Eating**: 1800-2200 kcal, 25% eiwit

### **Plan Informatie**
```typescript
interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance';
  calories: {
    min: number;
    max: number;
  };
  macros: {
    protein: number; // percentage
    carbs: number;   // percentage
    fat: number;     // percentage
  };
  meals: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snacks: Meal[];
  };
  restrictions: string[]; // ['vegetarian', 'gluten_free', etc.]
  prepTime: number; // minuten per dag
}
```

---

## **🔧 IMPLEMENTATIE**

### **Component Structuur**
```typescript
// src/app/dashboard/voedingsplannen/page.tsx
export default function VoedingsplannenPage() {
  const { user } = useSupabaseAuth();
  const { currentStep, completeCurrentStep } = useOnboarding();
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNutritionPlans();
  }, []);

  const fetchNutritionPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nutrition-plans');
      
      if (!response.ok) {
        throw new Error('Failed to load nutrition plans');
      }
      
      const data = await response.json();
      setPlans(data.plans);
    } catch (err) {
      console.error('Error loading nutrition plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to load nutrition plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubmit = async () => {
    if (!selectedPlan) {
      setError('Selecteer een voedingsplan');
      return;
    }

    try {
      // Save selected plan
      await saveNutritionPlan(selectedPlan);
      
      // Complete step
      await completeCurrentStep();
    } catch (err) {
      setError('Kon voedingsplan niet opslaan');
    }
  };
}
```

### **Plan Selection UI**
```typescript
const NutritionPlanCard = ({ plan, isSelected, onSelect }: PlanCardProps) => (
  <div 
    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
      isSelected 
        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10' 
        : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
    }`}
    onClick={() => onSelect(plan.id)}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
      <span className={`px-3 py-1 rounded-full text-sm ${
        plan.goal === 'weight_loss' ? 'bg-red-500/20 text-red-400' :
        plan.goal === 'muscle_gain' ? 'bg-blue-500/20 text-blue-400' :
        'bg-green-500/20 text-green-400'
      }`}>
        {plan.goal === 'weight_loss' ? 'Gewichtsverlies' :
         plan.goal === 'muscle_gain' ? 'Spiermassa' : 'Onderhoud'}
      </span>
    </div>
    
    <p className="text-[#8BAE5A]/70 mb-4">{plan.description}</p>
    
    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
      <div>
        <span className="text-[#8BAE5A]">Calorieën:</span>
        <span className="text-white ml-2">{plan.calories.min}-{plan.calories.max} kcal</span>
      </div>
      <div>
        <span className="text-[#8BAE5A]">Eiwit:</span>
        <span className="text-white ml-2">{plan.macros.protein}%</span>
      </div>
      <div>
        <span className="text-[#8BAE5A]">Koolhydraten:</span>
        <span className="text-white ml-2">{plan.macros.carbs}%</span>
      </div>
      <div>
        <span className="text-[#8BAE5A]">Vetten:</span>
        <span className="text-white ml-2">{plan.macros.fat}%</span>
      </div>
    </div>

    {plan.restrictions.length > 0 && (
      <div className="mb-4">
        <span className="text-[#8BAE5A] text-sm">Restricties:</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {plan.restrictions.map(restriction => (
            <span key={restriction} className="px-2 py-1 bg-[#3A4D23] rounded text-xs">
              {restriction}
            </span>
          ))}
        </div>
      </div>
    )}

    <div className="text-sm text-[#8BAE5A]/70">
      <span>Bereidingstijd: {plan.prepTime} min/dag</span>
    </div>
  </div>
);
```

---

## **📊 NUTRITION PLANS DATABASE**

### **Plan Voorbeelden**
```typescript
const NUTRITION_PLANS = [
  {
    id: 'lean-mean',
    name: 'Lean & Mean',
    description: 'Perfect voor gewichtsverlies met behoud van spiermassa',
    goal: 'weight_loss',
    calories: { min: 1500, max: 1800 },
    macros: { protein: 40, carbs: 35, fat: 25 },
    meals: {
      breakfast: [
        { name: 'Omelet met groenten', calories: 300, protein: 25, carbs: 8, fat: 20 },
        { name: 'Griekse yoghurt met bessen', calories: 200, protein: 20, carbs: 15, fat: 5 }
      ],
      lunch: [
        { name: 'Gegrilde kip met quinoa', calories: 450, protein: 35, carbs: 40, fat: 12 },
        { name: 'Zalm met zoete aardappel', calories: 400, protein: 30, carbs: 35, fat: 15 }
      ],
      dinner: [
        { name: 'Kalkoen met groenten', calories: 350, protein: 30, carbs: 20, fat: 15 },
        { name: 'Vis met broccoli', calories: 300, protein: 25, carbs: 15, fat: 12 }
      ],
      snacks: [
        { name: 'Noten mix', calories: 150, protein: 5, carbs: 8, fat: 12 },
        { name: 'Appel met pindakaas', calories: 200, protein: 8, carbs: 20, fat: 10 }
      ]
    },
    restrictions: ['gluten_free'],
    prepTime: 30
  },
  {
    id: 'muscle-builder',
    name: 'Muscle Builder',
    description: 'Optimale voeding voor spiergroei en kracht',
    goal: 'muscle_gain',
    calories: { min: 2500, max: 3000 },
    macros: { protein: 30, carbs: 45, fat: 25 },
    meals: {
      breakfast: [
        { name: 'Havermout met eiwit', calories: 500, protein: 35, carbs: 60, fat: 12 },
        { name: 'Pancakes met banaan', calories: 600, protein: 30, carbs: 70, fat: 15 }
      ],
      lunch: [
        { name: 'Rijst met kip en groenten', calories: 700, protein: 45, carbs: 80, fat: 15 },
        { name: 'Pasta met rundvlees', calories: 650, protein: 40, carbs: 75, fat: 18 }
      ],
      dinner: [
        { name: 'Zalm met rijst', calories: 600, protein: 40, carbs: 60, fat: 20 },
        { name: 'Biefstuk met aardappel', calories: 550, protein: 35, carbs: 50, fat: 22 }
      ],
      snacks: [
        { name: 'Eiwitshake', calories: 200, protein: 25, carbs: 15, fat: 5 },
        { name: 'Griekse yoghurt', calories: 150, protein: 15, carbs: 10, fat: 8 }
      ]
    },
    restrictions: [],
    prepTime: 45
  }
];
```

---

## **📊 TRACKING & ANALYTICS**

### **Events die worden getrackt**
- `nutrition_plans_loaded` - Plannen geladen
- `plan_previewed` - Plan preview bekeken
- `plan_selected` - Plan geselecteerd
- `plan_submitted` - Plan bevestigd
- `step_4_completed` - Stap voltooid

### **Metrics**
- **Plan Selection Rate**: Populaire plannen
- **Goal Distribution**: Doel keuzes (verlies/groei/onderhoud)
- **Restriction Preferences**: Dieet restricties
- **Completion Time**: Tijd om keuze te maken

---

## **🚨 TROUBLESHOOTING**

### **Veelvoorkomende Problemen**

#### **"Failed to load nutrition plans" Error**
```typescript
// Debug API call
const debugNutritionPlans = async () => {
  try {
    console.log('🔍 Testing nutrition plans API...');
    const response = await fetch('/api/nutrition-plans');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Nutrition plans:', data);
  } catch (error) {
    console.error('Nutrition plans API error:', error);
  }
};
```

#### **Plan Selection Issues**
- Check API response structure
- Verify plan data format
- Controleer component state updates

#### **Database Save Issues**
```typescript
// Debug plan saving
const debugPlanSave = async (planId: string) => {
  try {
    const response = await fetch('/api/user-nutrition-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        planType: planId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Plan saved:', result);
  } catch (error) {
    console.error('Failed to save plan:', error);
  }
};
```

---

## **🧪 TESTING**

### **Test Scenarios**
1. **Happy Path**: Plan geselecteerd en opgeslagen
2. **No Selection**: Geen plan geselecteerd
3. **API Failure**: Network/server errors
4. **Empty State**: Geen plannen beschikbaar
5. **Preview Function**: Plan preview bekijken

### **Test Data**
```typescript
// Test plan selection
const testPlanSelection = {
  planId: 'lean-mean',
  userId: 'test-user-id',
  expectedResult: {
    success: true,
    message: 'Nutrition plan saved successfully'
  }
};

// Verify plan data
const verifyPlanData = (plan: NutritionPlan) => {
  console.log('Plan ID:', plan.id);
  console.log('Plan Name:', plan.name);
  console.log('Goal:', plan.goal);
  console.log('Calories:', plan.calories.min, '-', plan.calories.max);
  console.log('Macros:', plan.macros);
  console.log('Restrictions:', plan.restrictions);
};
```

---

## **📈 SUCCESS CRITERIA**

- ✅ Plannen laden binnen 3 seconden
- ✅ 95%+ success rate voor plan loading
- ✅ Selectie werkt correct
- ✅ Database wordt correct bijgewerkt
- ✅ Smooth transition naar stap 5

---

## **🔗 GERELATEERDE BESTANDEN**

- `src/app/dashboard/voedingsplannen/page.tsx`
- `src/app/api/nutrition-plans/route.ts`
- `src/app/api/user-nutrition-plans/route.ts`
- `src/contexts/OnboardingContext.tsx`
- `src/middleware.ts` (redirect logic)

---

## **💡 UX TIPS**

### **Plan Selection**
- **Visual Cards**: Duidelijke plan cards met macro info
- **Goal Indicators**: Kleurgecodeerde doelen
- **Preview Function**: Bekijk maaltijden en recepten
- **Restriction Filters**: Filter op dieet restricties

### **Information Display**
- **Calorie Range**: Duidelijke calorie ranges
- **Macro Breakdown**: Visuele macro verdeling
- **Meal Examples**: Voorbeelden van maaltijden
- **Prep Time**: Tijd investering per dag

---

*Laatste update: $(date)*
*Versie: 3.1.0*
