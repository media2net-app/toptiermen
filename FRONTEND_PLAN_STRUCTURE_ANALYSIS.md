# Frontend Plan Structure Analysis

## 🎯 **Huidige Situatie**

### **1. Plan Loading Flow**
```
User clicks plan → DynamicPlanViewNew → /api/nutrition-plan-dynamic → Database
```

### **2. Data Structure**
- **Main Page**: `VoedingsplannenPage` - toont alle plannen met filtering
- **Plan View**: `DynamicPlanViewNew` - toont individueel plan met maaltijden
- **API**: `/api/nutrition-plan-dynamic` - genereert dynamische plannen

### **3. Huidige Problemen**
- ✅ **FIXED**: `toFixed` error door null `scaleFactor`
- ✅ **FIXED**: Plan filtering werkt nu correct
- 🔄 **PENDING**: Nieuwe macro percentage structuur implementeren

## 🏗️ **Nieuwe Structuur Vereisten**

### **1. Plan-Specifieke Macro Percentages**
```typescript
interface NutritionPlan {
  // Bestaande velden
  id: number;
  plan_id: string;
  name: string;
  goal: string;
  
  // NIEUWE VELDEN
  protein_percentage: number;    // 35%
  carbs_percentage: number;      // 25% 
  fat_percentage: number;        // 40%
  
  // Target macro waarden (berekend)
  target_calories: number;       // 2860
  target_protein: number;        // 250g (35% van 2860)
  target_carbs: number;          // 179g (25% van 2860)
  target_fat: number;            // 127g (40% van 2860)
}
```

### **2. Frontend Component Updates**

#### **A. Plan Card Display**
```typescript
// In VoedingsplannenPage - plan cards
<div className="plan-card">
  <h3>{plan.name}</h3>
  <div className="macro-percentages">
    <span>Eiwit: {plan.protein_percentage}%</span>
    <span>Koolhydraten: {plan.carbs_percentage}%</span>
    <span>Vet: {plan.fat_percentage}%</span>
  </div>
  <div className="target-macros">
    <span>Doel: {plan.target_calories} kcal</span>
    <span>Eiwit: {plan.target_protein}g</span>
    <span>Koolhydraten: {plan.target_carbs}g</span>
    <span>Vet: {plan.target_fat}g</span>
  </div>
</div>
```

#### **B. Dynamic Plan View**
```typescript
// In DynamicPlanViewNew - header sectie
<div className="plan-header">
  <h2>{planData.planName}</h2>
  <div className="macro-breakdown">
    <div className="macro-item">
      <span className="percentage">{planData.planPercentages.protein}%</span>
      <span className="grams">{planData.planTargets.protein}g</span>
      <span className="label">Eiwit</span>
    </div>
    <div className="macro-item">
      <span className="percentage">{planData.planPercentages.carbs}%</span>
      <span className="grams">{planData.planTargets.carbs}g</span>
      <span className="label">Koolhydraten</span>
    </div>
    <div className="macro-item">
      <span className="percentage">{planData.planPercentages.fat}%</span>
      <span className="grams">{planData.planTargets.fat}g</span>
      <span className="label">Vet</span>
    </div>
  </div>
</div>
```

### **3. API Updates**

#### **A. Nutrition Plans API**
```typescript
// /api/nutrition-plans - GET handler
const { data: plans } = await supabase
  .from('nutrition_plans')
  .select(`
    *,
    protein_percentage,
    carbs_percentage, 
    fat_percentage,
    target_calories,
    target_protein,
    target_carbs,
    target_fat
  `);
```

#### **B. Dynamic Plan API**
```typescript
// /api/nutrition-plan-dynamic - response structure
{
  success: true,
  data: {
    planId: "carnivoor-onderhoud",
    planName: "Carnivoor - Onderhoud",
    
    // Plan-specifieke percentages
    planPercentages: {
      protein: 35,
      carbs: 25,
      fat: 40
    },
    
    // Plan target waarden
    planTargets: {
      calories: 2860,
      protein: 250,
      carbs: 179,
      fat: 127
    },
    
    // User profile (voor scaling)
    userProfile: {
      targetCalories: 2860,
      targetProtein: 250,
      targetCarbs: 179,
      targetFat: 127
    },
    
    // Scaling info
    scalingInfo: {
      basePlanCalories: 210,
      scaleFactor: 13.62,
      targetCalories: 2860,
      planTargetCalories: 2860
    },
    
    // Weekplan data
    weekPlan: { /* ... */ },
    weeklyAverages: { /* ... */ }
  }
}
```

## 🔄 **Implementatie Plan**

### **Fase 1: Database Integration** ✅
- [x] Macro percentage kolommen toegevoegd
- [x] Target macro waarden berekend
- [x] API endpoints bijgewerkt

### **Fase 2: Frontend Updates** 🔄
- [ ] Plan card display bijwerken
- [ ] Dynamic plan view header bijwerken
- [ ] Macro percentage visualisatie
- [ ] Target vs actual macro vergelijking

### **Fase 3: User Experience** 📋
- [ ] Macro percentage tooltips
- [ ] Plan vergelijking functionaliteit
- [ ] Macro aanpassing interface
- [ ] Progress tracking

## 🎨 **UI/UX Verbeteringen**

### **1. Plan Card Design**
```css
.plan-card {
  background: linear-gradient(135deg, #1a1f17 0%, #2d3a23 100%);
  border: 1px solid #3a4d23;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 174, 90, 0.15);
}

.macro-percentages {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  padding: 8px 12px;
  background: rgba(139, 174, 90, 0.1);
  border-radius: 8px;
}

.target-macros {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}
```

### **2. Dynamic Plan Header**
```css
.plan-header {
  background: linear-gradient(135deg, #1a1f17 0%, #2d3a23 100%);
  border: 1px solid #3a4d23;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.macro-breakdown {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.macro-item {
  text-align: center;
  padding: 16px;
  background: rgba(139, 174, 90, 0.1);
  border-radius: 12px;
  min-width: 120px;
}

.macro-item .percentage {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #8bae5a;
}

.macro-item .grams {
  display: block;
  font-size: 18px;
  color: #ffffff;
  margin: 4px 0;
}

.macro-item .label {
  display: block;
  font-size: 14px;
  color: #9ca3af;
}
```

## 📊 **Data Flow Diagram**

```
Database (nutrition_plans)
    ↓
API (/api/nutrition-plans)
    ↓
Frontend (VoedingsplannenPage)
    ↓
Plan Selection
    ↓
API (/api/nutrition-plan-dynamic)
    ↓
Frontend (DynamicPlanViewNew)
    ↓
User Interaction
```

## 🚀 **Volgende Stappen**

1. **Plan Card Updates**: Macro percentages en target waarden tonen
2. **Dynamic Plan Header**: Plan-specifieke macro breakdown
3. **API Response**: Plan percentages en targets toevoegen
4. **UI Polish**: Styling en animaties
5. **Testing**: Alle plan types testen

## ✅ **Status**

- **Database**: ✅ Klaar
- **API**: ✅ Klaar  
- **Frontend**: 🔄 In progress
- **Testing**: 📋 Pending
