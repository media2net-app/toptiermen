import { NUTRITION_DATABASE, findBestMatch } from './nutrition-database';

// Accurate unit conversion function
export function convertToGrams(amount: number, unit: string, ingredientName: string): number {
  const name = ingredientName.toLowerCase();
  
  switch (unit.toLowerCase()) {
    case 'stuks':
      if (name.includes('eieren') || name.includes('ei')) return amount * 50; // 1 ei = 50g
      if (name.includes('wrap')) return amount * 60; // 1 wrap = 60g
      if (name.includes('banaan')) return amount * 120; // 1 banaan = 120g
      if (name.includes('appel')) return amount * 180; // 1 appel = 180g
      if (name.includes('sinaasappel')) return amount * 150; // 1 sinaasappel = 150g
      if (name.includes('tomaat')) return amount * 100; // 1 tomaat = 100g
      if (name.includes('paprika')) return amount * 120; // 1 paprika = 120g
      if (name.includes('avocado')) return amount * 150; // 1 avocado = 150g
      return amount * 100; // Default: 1 stuk = 100g
      
    case 'blik':
      if (name.includes('tonijn')) return amount * 142; // 1 blik = 142g
      if (name.includes('kikkererwten')) return amount * 240; // 1 blik = 240g
      if (name.includes('kidneybonen')) return amount * 240; // 1 blik = 240g
      if (name.includes('linzen')) return amount * 240; // 1 blik = 240g
      return amount * 100; // Default
      
    case 'ml':
      if (name.includes('olijfolie')) return amount * 0.92; // 1ml = 0.92g
      if (name.includes('melk')) return amount * 1.03; // 1ml = 1.03g
      if (name.includes('amandelmelk')) return amount * 1.01; // 1ml = 1.01g
      if (name.includes('sojamelk')) return amount * 1.02; // 1ml = 1.02g
      if (name.includes('water')) return amount * 1; // 1ml = 1g
      return amount; // Default: 1ml = 1g
      
    case 'gram':
    case 'g':
      return amount;
      
    case 'kg':
      return amount * 1000;
      
    case 'l':
    case 'liter':
      return amount * 1000;
      
    case 'eetlepel':
    case 'eetlepels':
      if (name.includes('olijfolie')) return amount * 13.8; // 1 eetlepel = 15ml * 0.92
      if (name.includes('pindakaas')) return amount * 16; // 1 eetlepel = 16g
      if (name.includes('honing')) return amount * 21; // 1 eetlepel = 21g
      return amount * 15; // Default: 1 eetlepel = 15g
      
    case 'theelepel':
    case 'theelepels':
      if (name.includes('olijfolie')) return amount * 4.6; // 1 theelepel = 5ml * 0.92
      if (name.includes('zout')) return amount * 5; // 1 theelepel = 5g
      if (name.includes('peper')) return amount * 2; // 1 theelepel = 2g
      return amount * 5; // Default: 1 theelepel = 5g
      
    case 'handje':
    case 'handjes':
      if (name.includes('noten') || name.includes('amandelen') || name.includes('walnoten')) return amount * 30; // 1 handje = 30g
      if (name.includes('olijven')) return amount * 25; // 1 handje = 25g
      return amount * 30; // Default: 1 handje = 30g
      
    case 'kopje':
    case 'kopjes':
      if (name.includes('havermout')) return amount * 80; // 1 kopje = 80g
      if (name.includes('rijst')) return amount * 185; // 1 kopje = 185g
      if (name.includes('quinoa')) return amount * 170; // 1 kopje = 170g
      return amount * 100; // Default: 1 kopje = 100g
      
    default:
      return amount;
  }
}

// Accurate macro calculation from ingredients
export function calculateMacrosFromIngredients(ingredients: { name: string; amount: number; unit: string }[]) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let missingIngredients: string[] = [];

  ingredients.forEach(ingredient => {
    const { name, amount, unit } = ingredient;
    
    // Convert to grams
    const grams = convertToGrams(amount, unit, name);
    
    // Find the best match in the nutrition database
    const bestMatch = findBestMatch(name);
    
    if (bestMatch) {
      // Get macro values from database
      const macro = NUTRITION_DATABASE[bestMatch];
      const multiplier = grams / 100; // Per 100g basis

      totalCalories += macro.calories * multiplier;
      totalProtein += macro.protein * multiplier;
      totalCarbs += macro.carbs * multiplier;
      totalFat += macro.fat * multiplier;
    } else {
      // Log missing ingredients for debugging
      missingIngredients.push(name);
      console.warn(`⚠️ Missing nutrition data for: ${name}`);
    }
  });

  // Log missing ingredients if any
  if (missingIngredients.length > 0) {
    console.warn('Missing nutrition data for ingredients:', missingIngredients);
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10, // 1 decimal voor precisie
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    missingIngredients
  };
}

// Calculate macro percentages
export function calculateMacroPercentages(calories: number, protein: number, carbs: number, fat: number) {
  const proteinKcal = protein * 4;
  const carbsKcal = carbs * 4;
  const fatKcal = fat * 9;
  
  return {
    proteinPercentage: Math.round((proteinKcal / calories) * 100),
    carbsPercentage: Math.round((carbsKcal / calories) * 100),
    fatPercentage: Math.round((fatKcal / calories) * 100)
  };
}

// Validate nutrition data
export function validateNutritionData(ingredients: { name: string; amount: number; unit: string }[]) {
  const missingIngredients: string[] = [];
  
  ingredients.forEach(ingredient => {
    const bestMatch = findBestMatch(ingredient.name);
    if (!bestMatch) {
      missingIngredients.push(ingredient.name);
    }
  });
  
  return {
    isValid: missingIngredients.length === 0,
    missingIngredients,
    coverage: ((ingredients.length - missingIngredients.length) / ingredients.length) * 100
  };
}

// Format macro display
export function formatMacroDisplay(value: number, unit: string = 'g'): string {
  return `${value.toFixed(1)}${unit}`;
}

// Calculate daily macro targets based on user data
export function calculateDailyMacroTargets(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: number,
  goal: 'cut' | 'maintain' | 'bulk'
) {
  // BMR berekening (Mifflin-St Jeor)
  let bmr = gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
    
  let calories = bmr * activityLevel;
  
  // Calorie aanpassing voor doel
  if (goal === "cut") calories -= 400;
  if (goal === "bulk") calories += 300;
  
  // Macro verdeling
  const protein = Math.round(weight * 1.8); // 1.8g per kg lichaamsgewicht
  const fat = Math.round(weight * 1); // 1g per kg lichaamsgewicht
  const proteinKcal = protein * 4;
  const fatKcal = fat * 9;
  const carbs = Math.round((calories - proteinKcal - fatKcal) / 4);
  
  return {
    calories: Math.round(calories),
    protein,
    carbs,
    fat
  };
} 