# 💪 Stap 3: Trainingsschemas

## 📋 **OVERZICHT**

De vierde stap van de onboarding is het selecteren van een trainingsschema. Gebruikers kiezen een passend trainingsprogramma gebaseerd op hun niveau en doelen.

---

## **🎯 DOELSTELLING**

- **Training Schema**: Gebruiker selecteert passend trainingsprogramma
- **Niveau Matching**: Schema past bij fitness niveau
- **Doel Alignment**: Training ondersteunt hoofddoel
- **Structured Approach**: Georganiseerde trainingsroutine

---

## **📍 TECHNISCHE DETAILS**

### **URL & Routing**
```
URL: /dashboard/trainingsschemas
Middleware: Stap 3 toegang
Component: TrainingsschemasPage
API: /api/training-schemas
```

### **Database Updates**
```sql
-- user_training_progress tabel
INSERT INTO user_training_progress (
  user_id,
  training_schema_id,
  selected_schema,
  current_week,
  current_day,
  is_active,
  created_at
) VALUES (?, ?, ?, 1, 1, true, NOW());

-- onboarding_status tabel
UPDATE onboarding_status 
SET 
  step_3_completed = true,
  current_step = 4
WHERE user_id = ?;
```

---

## **🎮 GEBRUIKERSERVARING**

### **Training Schema Opties**

#### **Beginner Schemas**
- **Start Strong**: 4 weken basis krachttraining
- **Cardio Kickstart**: 6 weken conditie opbouw
- **Bodyweight Basics**: 8 weken lichaamsgewicht training

#### **Intermediate Schemas**
- **Strength Builder**: 12 weken kracht opbouw
- **Hybrid Hero**: 10 weken gecombineerde training
- **Performance Plus**: 8 weken prestatie verbetering

#### **Advanced Schemas**
- **Elite Training**: 16 weken geavanceerde training
- **Competition Prep**: 12 weken wedstrijd voorbereiding
- **Peak Performance**: 20 weken piek prestatie

### **Schema Informatie**
```typescript
interface TrainingSchema {
  id: string;
  name: string;
  description: string;
  duration: number; // weken
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: string[]; // ['strength', 'cardio', 'flexibility']
  equipment: string[]; // benodigde equipment
  timePerSession: number; // minuten
  sessionsPerWeek: number;
  preview: {
    week1: Exercise[];
    week2: Exercise[];
    // ... meer weken
  };
}
```

---

## **🔧 IMPLEMENTATIE**

### **Component Structuur**
```typescript
// src/app/dashboard/trainingsschemas/page.tsx
export default function TrainingsschemasPage() {
  const { user } = useSupabaseAuth();
  const { currentStep, completeCurrentStep } = useOnboarding();
  const [schemas, setSchemas] = useState<TrainingSchema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrainingSchemas();
  }, []);

  const fetchTrainingSchemas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/training-schemas');
      
      if (!response.ok) {
        throw new Error('Failed to load training schemas');
      }
      
      const data = await response.json();
      setSchemas(data.schemas);
    } catch (err) {
      console.error('Error loading training schemas:', err);
      setError(err instanceof Error ? err.message : 'Failed to load training schemas');
    } finally {
      setLoading(false);
    }
  };

  const handleSchemaSelect = (schemaId: string) => {
    setSelectedSchema(schemaId);
  };

  const handleSubmit = async () => {
    if (!selectedSchema) {
      setError('Selecteer een trainingsschema');
      return;
    }

    try {
      // Save selected schema
      await saveTrainingSchema(selectedSchema);
      
      // Complete step
      await completeCurrentStep();
    } catch (err) {
      setError('Kon trainingsschema niet opslaan');
    }
  };
}
```

### **Schema Selection UI**
```typescript
const SchemaCard = ({ schema, isSelected, onSelect }: SchemaCardProps) => (
  <div 
    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
      isSelected 
        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10' 
        : 'border-[#3A4D23] hover:border-[#8BAE5A]/50'
    }`}
    onClick={() => onSelect(schema.id)}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-bold text-white">{schema.name}</h3>
      <span className={`px-3 py-1 rounded-full text-sm ${
        schema.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
        schema.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        {schema.difficulty}
      </span>
    </div>
    
    <p className="text-[#8BAE5A]/70 mb-4">{schema.description}</p>
    
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-[#8BAE5A]">Duur:</span>
        <span className="text-white ml-2">{schema.duration} weken</span>
      </div>
      <div>
        <span className="text-[#8BAE5A]">Sessies/week:</span>
        <span className="text-white ml-2">{schema.sessionsPerWeek}</span>
      </div>
      <div>
        <span className="text-[#8BAE5A]">Tijd/sessie:</span>
        <span className="text-white ml-2">{schema.timePerSession} min</span>
      </div>
      <div>
        <span className="text-[#8BAE5A]">Focus:</span>
        <span className="text-white ml-2">{schema.focus.join(', ')}</span>
      </div>
    </div>
  </div>
);
```

---

## **📊 TRAINING SCHEMAS DATABASE**

### **Schema Voorbeelden**
```typescript
const TRAINING_SCHEMAS = [
  {
    id: 'start-strong',
    name: 'Start Strong',
    description: 'Perfect voor beginners die willen starten met krachttraining',
    duration: 4,
    difficulty: 'beginner',
    focus: ['strength', 'form'],
    equipment: ['dumbbells', 'bench'],
    timePerSession: 45,
    sessionsPerWeek: 3,
    preview: {
      week1: [
        { name: 'Squats', sets: 3, reps: '8-10', rest: '60s' },
        { name: 'Push-ups', sets: 3, reps: '5-8', rest: '60s' },
        { name: 'Plank', sets: 3, reps: '30s', rest: '60s' }
      ]
    }
  },
  {
    id: 'strength-builder',
    name: 'Strength Builder',
    description: 'Geavanceerd krachttrainingsprogramma voor ervaren sporters',
    duration: 12,
    difficulty: 'intermediate',
    focus: ['strength', 'power'],
    equipment: ['barbell', 'plates', 'rack'],
    timePerSession: 75,
    sessionsPerWeek: 4,
    preview: {
      week1: [
        { name: 'Deadlift', sets: 5, reps: '5', rest: '3min' },
        { name: 'Bench Press', sets: 4, reps: '6-8', rest: '2min' },
        { name: 'Pull-ups', sets: 4, reps: '6-10', rest: '2min' }
      ]
    }
  }
];
```

---

## **📊 TRACKING & ANALYTICS**

### **Events die worden getrackt**
- `training_schemas_loaded` - Schemas geladen
- `schema_previewed` - Schema preview bekeken
- `schema_selected` - Schema geselecteerd
- `schema_submitted` - Schema bevestigd
- `step_3_completed` - Stap voltooid

### **Metrics**
- **Schema Selection Rate**: Populaire schemas
- **Difficulty Distribution**: Niveau keuzes
- **Preview Engagement**: Hoe vaak previews worden bekeken
- **Completion Time**: Tijd om keuze te maken

---

## **🚨 TROUBLESHOOTING**

### **Veelvoorkomende Problemen**

#### **"Failed to load training schemas" Error**
```typescript
// Debug API call
const debugTrainingSchemas = async () => {
  try {
    console.log('🔍 Testing training schemas API...');
    const response = await fetch('/api/training-schemas');
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Training schemas:', data);
  } catch (error) {
    console.error('Training schemas API error:', error);
  }
};
```

#### **Schema Selection Issues**
- Check API response structure
- Verify schema data format
- Controleer component state updates

#### **Database Save Issues**
```typescript
// Debug schema saving
const debugSchemaSave = async (schemaId: string) => {
  try {
    const response = await fetch('/api/user-training-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        trainingSchemaId: schemaId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Schema saved:', result);
  } catch (error) {
    console.error('Failed to save schema:', error);
  }
};
```

---

## **🧪 TESTING**

### **Test Scenarios**
1. **Happy Path**: Schema geselecteerd en opgeslagen
2. **No Selection**: Geen schema geselecteerd
3. **API Failure**: Network/server errors
4. **Empty State**: Geen schemas beschikbaar
5. **Preview Function**: Schema preview bekijken

### **Test Data**
```typescript
// Test schema selection
const testSchemaSelection = {
  schemaId: 'start-strong',
  userId: 'test-user-id',
  expectedResult: {
    success: true,
    message: 'Training schema saved successfully'
  }
};

// Verify schema data
const verifySchemaData = (schema: TrainingSchema) => {
  console.log('Schema ID:', schema.id);
  console.log('Schema Name:', schema.name);
  console.log('Duration:', schema.duration, 'weeks');
  console.log('Difficulty:', schema.difficulty);
  console.log('Sessions per week:', schema.sessionsPerWeek);
};
```

---

## **📈 SUCCESS CRITERIA**

- ✅ Schemas laden binnen 3 seconden
- ✅ 95%+ success rate voor schema loading
- ✅ Selectie werkt correct
- ✅ Database wordt correct bijgewerkt
- ✅ Smooth transition naar stap 4

---

## **🔗 GERELATEERDE BESTANDEN**

- `src/app/dashboard/trainingsschemas/page.tsx`
- `src/app/api/training-schemas/route.ts`
- `src/app/api/user-training-progress/route.ts`
- `src/contexts/OnboardingContext.tsx`
- `src/middleware.ts` (redirect logic)

---

## **💡 UX TIPS**

### **Schema Selection**
- **Visual Cards**: Duidelijke schema cards met preview
- **Difficulty Indicators**: Kleurgecodeerde moeilijkheidsgraad
- **Preview Function**: Bekijk eerste week oefeningen
- **Recommendations**: Suggesties gebaseerd op profiel

### **Information Display**
- **Duration**: Duidelijke tijdsduur
- **Equipment**: Benodigde equipment lijst
- **Time Commitment**: Tijd per sessie en per week
- **Focus Areas**: Wat wordt getraind

---

*Laatste update: $(date)*
*Versie: 3.1.0*
