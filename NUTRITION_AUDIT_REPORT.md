# 🍽️ Voedingswaarden Audit Rapport - Top Tier Men

## 📊 Overzicht
Dit rapport bevat een uitgebreide analyse van de voedingswaarden en macro berekeningen in de voedingsplannen functionaliteit.

---

## 🚨 KRITIEKE PROBLEMEN GEVONDEN

### 1. **Incorrecte Macro Berekeningen in `calculateMacrosFromIngredients`**

#### Probleem:
- Macro waarden zijn hardcoded en niet accuraat
- Ontbrekende voedingsmiddelen in de database
- Incorrecte conversies voor verschillende eenheden

#### Specifieke Issues:

**A. Hardcoded Macro Database (Regels 1147-1180):**
```typescript
const macroValues: { [key: string]: { calories: number; protein: number; carbs: number; fat: number } } = {
  'Rundvlees (biefstuk)': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Kipfilet': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  // ... etc
};
```

**Problemen:**
- ❌ **Rundvlees (biefstuk):** 250 kcal/100g is te laag (moet ~280-320 kcal)
- ❌ **Kipfilet:** 31g eiwit/100g is te hoog (moet ~23-25g)
- ❌ **Eieren:** 155 kcal/100g is correct, maar 13g eiwit is te laag (moet ~12.5g)
- ❌ **Spek:** 541 kcal/100g is te hoog (moet ~400-450 kcal)

**B. Ontbrekende Voedingsmiddelen:**
- ❌ Havermout (gebruikt in balanced diet)
- ❌ Melk (gebruikt in balanced diet)
- ❌ Blauwe bessen (gebruikt in balanced diet)
- ❌ Walnoten (gebruikt in balanced diet)
- ❌ Volkoren wrap (gebruikt in balanced diet)
- ❌ Paprika (gebruikt in balanced diet)
- ❌ Komkommer (gebruikt in balanced diet)
- ❌ Hummus (gebruikt in balanced diet)
- ❌ Zoete aardappel (gebruikt in balanced diet)
- ❌ Broccoli (gebruikt in balanced diet)
- ❌ Griekse yoghurt (gebruikt in low_carb diet)
- ❌ Gemengde noten (gebruikt in low_carb diet)
- ❌ Lijnzaad (gebruikt in low_carb diet)
- ❌ Spinazie (gebruikt in low_carb diet)
- ❌ Tomaat (gebruikt in low_carb diet)
- ❌ Feta (gebruikt in low_carb diet)
- ❌ Courgette (gebruikt in low_carb diet)
- ❌ Avocado (gebruikt in low_carb diet)
- ❌ Proteïne poeder (gebruikt in high_protein diet)
- ❌ Magere kwark (gebruikt in high_protein diet)
- ❌ Tonijn uit blik (gebruikt in high_protein diet)
- ❌ Kidneybonen (gebruikt in high_protein diet)
- ❌ Olijfolie (gebruikt in high_protein diet)
- ❌ Sperziebonen (gebruikt in high_protein diet)

### 2. **Incorrecte Percentage Berekeningen in `generateMealPlan`**

#### Probleem:
- Macro percentages kloppen niet met de werkelijke voedingswaarden
- Som van percentages is niet altijd 100%

**Voorbeelden van incorrecte berekeningen:**

**Balanced Diet - Ontbijt:**
```typescript
calories: Math.round(goals.calories * 0.25),    // 25% van dagelijkse calorieën
protein: Math.round(goals.protein * 0.25),      // 25% van dagelijkse eiwit
carbs: Math.round(goals.carbs * 0.3),          // 30% van dagelijkse koolhydraten
fat: Math.round(goals.fat * 0.2),              // 20% van dagelijkse vetten
```

**Probleem:** Deze percentages zijn niet gebaseerd op de werkelijke ingrediënten, maar op willekeurige percentages.

### 3. **Incorrecte Conversies**

#### Probleem:
```typescript
if (unit === 'stuks' && name.toLowerCase().includes('eieren')) {
  grams = amount * 50; // 1 egg = ~50g
}
```

**Probleem:** 
- ❌ Alleen voor eieren, maar andere voedingsmiddelen hebben ook verschillende eenheden
- ❌ Geen conversie voor 'stuk' (wrap), 'blik' (tonijn), 'ml' (olijfolie)

---

## 🔧 OPLOSSINGEN

### 1. **Uitgebreide Macro Database**

```typescript
const NUTRITION_DATABASE = {
  // Vlees & Vis
  'Rundvlees (biefstuk)': { calories: 290, protein: 26, carbs: 0, fat: 20 },
  'Rundvlees (gehakt)': { calories: 242, protein: 23, carbs: 0, fat: 15 },
  'Kipfilet': { calories: 165, protein: 23, carbs: 0, fat: 3.6 },
  'Zalm': { calories: 208, protein: 25, carbs: 0, fat: 12 },
  'Tonijn': { calories: 144, protein: 30, carbs: 0, fat: 1 },
  
  // Eieren & Zuivel
  'Eieren': { calories: 155, protein: 12.5, carbs: 1.1, fat: 11 },
  'Griekse yoghurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  'Magere kwark': { calories: 98, protein: 11, carbs: 3.4, fat: 0.3 },
  
  // Granen & Brood
  'Havermout': { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
  'Volkoren wrap': { calories: 265, protein: 8.5, carbs: 49, fat: 3.2 },
  
  // Groenten & Fruit
  'Broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  'Spinazie': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  'Paprika': { calories: 31, protein: 1, carbs: 7, fat: 0.3 },
  'Komkommer': { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1 },
  'Tomaat': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  'Courgette': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  'Zoete aardappel': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  'Blauwe bessen': { calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3 },
  
  // Noten & Zaden
  'Walnoten': { calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2 },
  'Gemengde noten': { calories: 607, protein: 20, carbs: 19, fat: 54 },
  'Lijnzaad': { calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2 },
  
  // Vetten & Oliën
  'Boter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  'Olijfolie': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  
  // Overige
  'Hummus': { calories: 166, protein: 7.9, carbs: 14.3, fat: 9.6 },
  'Feta': { calories: 264, protein: 14.2, carbs: 4.1, fat: 21.3 },
  'Avocado': { calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
  'Kidneybonen': { calories: 127, protein: 8.7, carbs: 23, fat: 0.5 },
  'Proteïne poeder': { calories: 375, protein: 75, carbs: 12.5, fat: 2.5 },
  'Spek': { calories: 417, protein: 37, carbs: 0, fat: 28 },
  
  // Kruiden & Specerijen
  'Zout': { calories: 0, protein: 0, carbs: 0, fat: 0 },
  'Peper': { calories: 0, protein: 0, carbs: 0, fat: 0 }
};
```

### 2. **Verbeterde Conversie Functie**

```typescript
const convertToGrams = (amount: number, unit: string, ingredientName: string): number => {
  const name = ingredientName.toLowerCase();
  
  switch (unit) {
    case 'stuks':
      if (name.includes('eieren')) return amount * 50; // 1 ei = 50g
      if (name.includes('wrap')) return amount * 60; // 1 wrap = 60g
      return amount * 100; // Default: 1 stuk = 100g
      
    case 'blik':
      if (name.includes('tonijn')) return amount * 142; // 1 blik = 142g
      return amount * 100; // Default
      
    case 'ml':
      if (name.includes('olijfolie')) return amount * 0.92; // 1ml = 0.92g
      if (name.includes('melk')) return amount * 1.03; // 1ml = 1.03g
      return amount; // Default: 1ml = 1g
      
    case 'gram':
    case 'g':
      return amount;
      
    default:
      return amount;
  }
};
```

### 3. **Accurate Macro Berekening**

```typescript
const calculateMacrosFromIngredients = (ingredients: { name: string; amount: number; unit: string }[]) => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  ingredients.forEach(ingredient => {
    const { name, amount, unit } = ingredient;
    
    // Convert to grams
    const grams = convertToGrams(amount, unit, name);
    
    // Get macro values from database
    const macro = NUTRITION_DATABASE[name] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const multiplier = grams / 100;

    totalCalories += macro.calories * multiplier;
    totalProtein += macro.protein * multiplier;
    totalCarbs += macro.carbs * multiplier;
    totalFat += macro.fat * multiplier;
  });

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10, // 1 decimal
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10
  };
};
```

---

## 📋 IMPLEMENTATIE PLAN

### Fase 1: Database Update (Prioriteit: KRITIEK)
- [ ] Nieuwe `NUTRITION_DATABASE` implementeren
- [ ] `convertToGrams` functie toevoegen
- [ ] `calculateMacrosFromIngredients` updaten
- [ ] Testen met bestaande recepten

### Fase 2: Recept Validatie (Prioriteit: HOOG)
- [ ] Alle hardcoded recepten controleren
- [ ] Macro berekeningen valideren
- [ ] Percentage distributie corrigeren
- [ ] Testen met verschillende dieet types

### Fase 3: UI Verbeteringen (Prioriteit: MEDIUM)
- [ ] Macro display verbeteren (1 decimal)
- [ ] Calorie berekening real-time updaten
- [ ] Warning systeem voor incorrecte data
- [ ] User feedback voor macro discrepanties

### Fase 4: Database Integratie (Prioriteit: MEDIUM)
- [ ] Voedingswaarden database tabel maken
- [ ] API endpoints voor voedingswaarden
- [ ] Admin interface voor voedingswaarden beheer
- [ ] Import/export functionaliteit

---

## 🎯 SUCCES CRITERIA

### Voor Implementatie:
1. ✅ Alle macro waarden zijn accuraat (±5% van wetenschappelijke waarden)
2. ✅ Alle ingrediënten uit recepten zijn opgenomen in database
3. ✅ Conversies zijn correct voor alle eenheden
4. ✅ Berekeningen zijn consistent en reproduceerbaar

### Na Implementatie:
1. ✅ Macro percentages kloppen met werkelijke ingrediënten
2. ✅ Calorie berekeningen zijn accuraat
3. ✅ User feedback is positief over voedingswaarden
4. ✅ Geen meer incorrecte macro data

---

## 📊 VOORBEELDEN VAN CORRECTIES

### Voor: Havermout met Blauwe Bessen & Walnoten
**Incorrecte berekening:**
- Calorieën: 25% van dagelijkse behoefte (willekeurig)
- Eiwit: 25% van dagelijkse behoefte (willekeurig)

**Correcte berekening:**
- Havermout (60g): 233 kcal, 10.1g eiwit, 39.8g koolhydraten, 4.1g vet
- Melk (250ml): 258 kcal, 8.5g eiwit, 12.5g koolhydraten, 14.3g vet
- Blauwe bessen (50g): 29 kcal, 0.4g eiwit, 7.3g koolhydraten, 0.2g vet
- Walnoten (15g): 98 kcal, 2.3g eiwit, 2.1g koolhydraten, 9.8g vet
- **Totaal: 618 kcal, 21.3g eiwit, 61.7g koolhydraten, 28.4g vet**

---

*Laatste update: Augustus 2024*  
*Status: KRITIEK - Implementatie vereist voor data kwaliteit*  
*Impact: Gebruikerservaring en geloofwaardigheid platform* 