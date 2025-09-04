'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface Meal {
  name: string;
  time: string;
  ingredients: Ingredient[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  preparation?: string;
}

interface DayPlan {
  day: string;
  dayName: string;
  meals: {
    ontbijt: Meal;
    snack1: Meal;
    lunch: Meal;
    snack2: Meal;
    diner: Meal;
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  duration_weeks?: number;
  difficulty?: string;
  goal?: string;
}

interface WeeklyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: NutritionPlan | null;
}

export default function WeeklyPlanModal({ isOpen, onClose, plan }: WeeklyPlanModalProps) {
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('monday');

  const daysOfWeek = [
    { key: 'monday', name: 'Maandag', short: 'Ma' },
    { key: 'tuesday', name: 'Dinsdag', short: 'Di' },
    { key: 'wednesday', name: 'Woensdag', short: 'Wo' },
    { key: 'thursday', name: 'Donderdag', short: 'Do' },
    { key: 'friday', name: 'Vrijdag', short: 'Vr' },
    { key: 'saturday', name: 'Zaterdag', short: 'Za' },
    { key: 'sunday', name: 'Zondag', short: 'Zo' }
  ];

  // Convert meals data from database to DayPlan format
  const convertMealsDataToDayPlan = (mealsData: any): DayPlan[] => {
    const nutritionDB: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
      'Ribeye Steak': { calories: 250, protein: 26, carbs: 0, fat: 15 },
      'Biefstuk': { calories: 250, protein: 26, carbs: 0, fat: 15 },
      'T-Bone Steak': { calories: 247, protein: 24, carbs: 0, fat: 16 },
      'Rundergehakt (15% vet)': { calories: 254, protein: 20, carbs: 0, fat: 18 },
      'Rundergehakt (20% vet)': { calories: 272, protein: 19, carbs: 0, fat: 21 },
      'Mager Rundergehakt': { calories: 220, protein: 22, carbs: 0, fat: 14 },
      'Eendenborst': { calories: 337, protein: 19, carbs: 0, fat: 28 },
      'Zalm (Wild)': { calories: 208, protein: 25, carbs: 0, fat: 12 },
      'Haring': { calories: 158, protein: 18, carbs: 0, fat: 9 },
      'Makreel': { calories: 205, protein: 19, carbs: 0, fat: 14 },
      'Sardines': { calories: 208, protein: 25, carbs: 0, fat: 11 },
      'Tonijn in Olijfolie': { calories: 189, protein: 25, carbs: 0, fat: 9 },
      'Witvis': { calories: 82, protein: 18, carbs: 0, fat: 1 },
      'Kipfilet (Gegrild)': { calories: 165, protein: 31, carbs: 0, fat: 4 },
      'Kalkoenfilet (Gegrild)': { calories: 135, protein: 30, carbs: 0, fat: 1 },
      'Kippendijen': { calories: 250, protein: 26, carbs: 0, fat: 15 },
      'Gans': { calories: 259, protein: 25, carbs: 0, fat: 17 },
      'Varkenshaas': { calories: 143, protein: 26, carbs: 0, fat: 4 },
      'Spek': { calories: 541, protein: 37, carbs: 0, fat: 42 },
      'Ham': { calories: 145, protein: 21, carbs: 0, fat: 6 },
      'Worst': { calories: 300, protein: 20, carbs: 0, fat: 25 },
      'Duitse Biefstuk': { calories: 250, protein: 16, carbs: 0, fat: 20 },
      'Salami': { calories: 336, protein: 20, carbs: 0, fat: 28 },
      'Lamsvlees': { calories: 294, protein: 25, carbs: 0, fat: 21 },
      'Lamskotelet': { calories: 294, protein: 25, carbs: 0, fat: 21 },
      'Orgaanvlees (Lever)': { calories: 135, protein: 20, carbs: 4, fat: 4 },
      'Orgaanvlees (Hart)': { calories: 112, protein: 17, carbs: 0, fat: 4 },
      'Runderlever': { calories: 135, protein: 20, carbs: 4, fat: 4 },
      'Runderhart': { calories: 112, protein: 17, carbs: 0, fat: 4 },
      'Tartaar': { calories: 220, protein: 22, carbs: 0, fat: 14 },
      'Carpaccio': { calories: 120, protein: 21, carbs: 0, fat: 4 },
      '1 Ei': { calories: 155, protein: 13, carbs: 1, fat: 11 },
      '1 Handje Walnoten': { calories: 26, protein: 0.6, carbs: 0.5, fat: 2.6 },
      '1 Handje Amandelen': { calories: 23, protein: 0.8, carbs: 0.9, fat: 2.0 },
      '1 Handje Cashewnoten': { calories: 22, protein: 0.7, carbs: 1.2, fat: 1.8 },
      '1 Handje Hazelnoten': { calories: 25, protein: 0.6, carbs: 0.7, fat: 2.4 },
      '1 Handje Pecannoten': { calories: 28, protein: 0.4, carbs: 0.6, fat: 2.8 },
      '1 Handje Pistachenoten': { calories: 23, protein: 0.8, carbs: 1.1, fat: 1.8 },
      '1 Handje Macadamia Noten': { calories: 30, protein: 0.3, carbs: 0.6, fat: 3.0 }
    };

    const calculateMealNutrition = (ingredients: any[]) => {
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      ingredients.forEach(ingredient => {
        const nutritionData = nutritionDB[ingredient.name];
        if (nutritionData) {
          let multiplier = 0;
          
          if (ingredient.unit === 'stuks' && ingredient.name === '1 Ei') {
            multiplier = ingredient.amount;
          } else if (ingredient.unit === 'handje') {
            multiplier = ingredient.amount;
          } else {
            multiplier = ingredient.amount / 100;
          }
          
          totalCalories += nutritionData.calories * multiplier;
          totalProtein += nutritionData.protein * multiplier;
          totalCarbs += nutritionData.carbs * multiplier;
          totalFat += nutritionData.fat * multiplier;
        }
      });
      
      return {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10
      };
    };

    return daysOfWeek.map(day => {
      const dayData = mealsData[day.key];
      if (!dayData) {
        // Return empty day if no data
        return {
          day: day.key,
          dayName: day.name,
          meals: {
            ontbijt: { name: 'Geen ontbijt', time: '08:00', ingredients: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
            snack1: { name: 'Geen snack', time: '10:00', ingredients: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
            lunch: { name: 'Geen lunch', time: '13:00', ingredients: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
            snack2: { name: 'Geen snack', time: '16:00', ingredients: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
            diner: { name: 'Geen diner', time: '19:00', ingredients: [], calories: 0, protein: 0, carbs: 0, fat: 0 }
          },
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0
        };
      }

      // Convert ingredients format
      const convertIngredients = (ingredients: any[]) => {
        return ingredients.map(ing => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          calories: 0, // Will be calculated
          protein: 0,
          carbs: 0,
          fat: 0
        }));
      };

      const ontbijtIngredients = convertIngredients(dayData.ontbijt || []);
      const lunchIngredients = convertIngredients(dayData.lunch || []);
      const dinerIngredients = convertIngredients(dayData.diner || []);

      const ontbijtNutrition = calculateMealNutrition(dayData.ontbijt || []);
      const lunchNutrition = calculateMealNutrition(dayData.lunch || []);
      const dinerNutrition = calculateMealNutrition(dayData.diner || []);

      return {
        day: day.key,
        dayName: day.name,
        meals: {
          ontbijt: {
            name: 'Carnivoor Ontbijt',
            time: '08:00',
            ingredients: ontbijtIngredients,
            ...ontbijtNutrition
          },
          snack1: {
            name: 'Geen snack',
            time: '10:00',
            ingredients: [],
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          },
          lunch: {
            name: 'Carnivoor Lunch',
            time: '13:00',
            ingredients: lunchIngredients,
            ...lunchNutrition
          },
          snack2: {
            name: 'Geen snack',
            time: '16:00',
            ingredients: [],
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          },
          diner: {
            name: 'Carnivoor Diner',
            time: '19:00',
            ingredients: dinerIngredients,
            ...dinerNutrition
          }
        },
        totalCalories: ontbijtNutrition.calories + lunchNutrition.calories + dinerNutrition.calories,
        totalProtein: Math.round((ontbijtNutrition.protein + lunchNutrition.protein + dinerNutrition.protein) * 10) / 10,
        totalCarbs: Math.round((ontbijtNutrition.carbs + lunchNutrition.carbs + dinerNutrition.carbs) * 10) / 10,
        totalFat: Math.round((ontbijtNutrition.fat + lunchNutrition.fat + dinerNutrition.fat) * 10) / 10
      };
    });
  };

  useEffect(() => {
    if (isOpen && plan) {
      generateWeeklyPlan();
    }
  }, [isOpen, plan]);

  const generateWeeklyPlan = async () => {
    if (!plan) return;
    
    setIsLoading(true);
    try {
      console.log('🗓️ Loading weekly plan for:', plan.name);
      
      // Check if plan has meals data (new format)
      if ((plan as any).meals) {
        console.log('📊 Using plan meals data from database');
        const mealsData = (plan as any).meals;
        const convertedPlan = convertMealsDataToDayPlan(mealsData);
        setWeeklyPlan(convertedPlan);
        setIsLoading(false);
        return;
      }
      
      // Fallback: Generate plan if no meals data
      console.log('🔄 No meals data found, generating default plan');
      
      // Fetch carnivore ingredients
      const response = await fetch('/api/admin/nutrition-ingredients');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to fetch ingredients');
      }

      const carnivoreIngredients = result.ingredients.filter((ing: any) => 
        ['vlees', 'vis', 'eieren', 'zuivel'].includes(ing.category)
      );

      console.log(`🥩 Found ${carnivoreIngredients.length} carnivore ingredients`);

      // Generate 7-day plan
      const weekPlan: DayPlan[] = daysOfWeek.map((day, index) => {
        return generateDayPlan(day, plan, carnivoreIngredients, index);
      });

      setWeeklyPlan(weekPlan);
      console.log('✅ Weekly plan generated successfully');
      
    } catch (error) {
      console.error('❌ Error generating weekly plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDayPlan = (day: any, plan: NutritionPlan, ingredients: any[], dayIndex: number): DayPlan => {
    // Ensure target_calories is valid, use default for carnivore plans
    const baseCalories = Number(plan.target_calories) || 2200;
    
    const targetCaloriesPerMeal = {
      ontbijt: Math.round(baseCalories * 0.25), // 25%
      snack1: Math.round(baseCalories * 0.10),  // 10%
      lunch: Math.round(baseCalories * 0.30),   // 30%
      snack2: Math.round(baseCalories * 0.10),  // 10%
      diner: Math.round(baseCalories * 0.25)    // 25%
    };

    // Create different meal variations based on day
    const meatOptions = ingredients.filter(i => i.category === 'vlees');
    const fishOptions = ingredients.filter(i => i.category === 'vis');
    const eggOptions = ingredients.filter(i => i.category === 'eieren');
    const dairyOptions = ingredients.filter(i => i.category === 'zuivel');
    
    // For spiermassa carnivore plans, allow some fruit
    const fruitOptions = ingredients.filter(i => i.category === 'fruit');
    const isSpiermassa = plan.name.toLowerCase().includes('spiermassa');
    const allowedFruit = isSpiermassa ? fruitOptions : [];

    const meals = {
      ontbijt: generateMeal('ontbijt', targetCaloriesPerMeal.ontbijt, eggOptions, dairyOptions, dayIndex, plan),
      snack1: generateMeal('snack1', targetCaloriesPerMeal.snack1, dairyOptions, allowedFruit.length > 0 ? allowedFruit : eggOptions, dayIndex, plan),
      lunch: generateMeal('lunch', targetCaloriesPerMeal.lunch, meatOptions, fishOptions, dayIndex, plan),
      snack2: generateMeal('snack2', targetCaloriesPerMeal.snack2, dairyOptions, meatOptions, dayIndex, plan),
      diner: generateMeal('diner', targetCaloriesPerMeal.diner, meatOptions, fishOptions, dayIndex, plan)
    };

    const totalCalories = Object.values(meals).reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = Object.values(meals).reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = Object.values(meals).reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFat = Object.values(meals).reduce((sum, meal) => sum + meal.fat, 0);

    return {
      day: day.key,
      dayName: day.name,
      meals,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    };
  };

  const generateMeal = (mealType: string, targetCalories: number, primaryIngredients: any[], secondaryIngredients: any[], dayIndex: number, plan: NutritionPlan): Meal => {
    const mealTemplates = {
      ontbijt: [
        { name: 'Carnivoor Ontbijt', time: '08:00' },
        { name: 'Eieren met Spek', time: '08:00' },
        { name: 'Omelet met Kaas', time: '08:00' }
      ],
      snack1: [
        { name: 'Carnivoor Snack', time: '10:30' },
        { name: 'Boerenkaas Blokjes', time: '10:30' },
        { name: 'Gekookt Ei', time: '10:30' }
      ],
      lunch: [
        { name: 'Carnivoor Lunch', time: '13:00' },
        { name: 'Gegrilde Biefstuk', time: '13:00' },
        { name: 'Gebakken Vis', time: '13:00' }
      ],
      snack2: [
        { name: 'Afternoon Protein', time: '15:30' },
        { name: 'Mozzarella', time: '15:30' },
        { name: 'Mini Omelet', time: '15:30' }
      ],
      diner: [
        { name: 'Carnivoor Diner', time: '19:00' },
        { name: 'Ribeye Steak', time: '19:00' },
        { name: 'Gegrilde Zalm', time: '19:00' }
      ]
    };

    const template = mealTemplates[mealType as keyof typeof mealTemplates][dayIndex % 3];
    
    // Select ingredients based on meal type and target calories
    const selectedIngredients: Ingredient[] = [];
    let currentCalories = 0;
    let currentProtein = 0;
    let currentCarbs = 0;
    let currentFat = 0;

    // Add primary ingredient
    if (primaryIngredients.length > 0) {
      const primaryIng = primaryIngredients[dayIndex % primaryIngredients.length];
      const amount = calculateAmount(primaryIng, targetCalories * 0.7); // 70% of calories from primary
      
      // Ensure we have valid numeric values
      const calories = Number(primaryIng.calories_per_100g) || 0;
      const protein = Number(primaryIng.protein_per_100g) || 0;
      const carbs = Number(primaryIng.carbs_per_100g) || 0;
      const fat = Number(primaryIng.fat_per_100g) || 0;
      
      // For carnivore plans, eliminate carbs (except spiermassa can have minimal fruit)
      const isPlanCarnivore = plan.name.toLowerCase().includes('carnivoor');
      const isSpiermassa = plan.name.toLowerCase().includes('spiermassa');
      const adjustedCarbs = isPlanCarnivore && !isSpiermassa ? 0 : carbs;
      
      selectedIngredients.push({
        name: primaryIng.name,
        amount: Math.round(amount),
        unit: 'gram',
        calories: Math.round((calories * amount) / 100),
        protein: Math.round((protein * amount) / 100),
        carbs: Math.round((adjustedCarbs * amount) / 100),
        fat: Math.round((fat * amount) / 100)
      });

      currentCalories += selectedIngredients[0].calories || 0;
      currentProtein += selectedIngredients[0].protein || 0;
      currentCarbs += selectedIngredients[0].carbs || 0;
      currentFat += selectedIngredients[0].fat || 0;
    }

    // Add secondary ingredient if needed
    if (secondaryIngredients.length > 0 && currentCalories < targetCalories * 0.8) {
      const secondaryIng = secondaryIngredients[(dayIndex + 1) % secondaryIngredients.length];
      const remainingCalories = targetCalories - currentCalories;
      const amount = calculateAmount(secondaryIng, remainingCalories);
      
      if (amount > 10) { // Only add if meaningful amount
        // Ensure we have valid numeric values
        const calories = Number(secondaryIng.calories_per_100g) || 0;
        const protein = Number(secondaryIng.protein_per_100g) || 0;
        const carbs = Number(secondaryIng.carbs_per_100g) || 0;
        const fat = Number(secondaryIng.fat_per_100g) || 0;
        
        // For carnivore plans, eliminate carbs (except spiermassa can have minimal fruit)
        const isPlanCarnivore = plan.name.toLowerCase().includes('carnivoor');
        const isSpiermassa = plan.name.toLowerCase().includes('spiermassa');
        const adjustedCarbs = isPlanCarnivore && !isSpiermassa ? 0 : carbs;
        
        selectedIngredients.push({
          name: secondaryIng.name,
          amount: Math.round(amount),
          unit: 'gram',
          calories: Math.round((calories * amount) / 100),
          protein: Math.round((protein * amount) / 100),
          carbs: Math.round((adjustedCarbs * amount) / 100),
          fat: Math.round((fat * amount) / 100)
        });

        currentCalories += selectedIngredients[1].calories || 0;
        currentProtein += selectedIngredients[1].protein || 0;
        currentCarbs += selectedIngredients[1].carbs || 0;
        currentFat += selectedIngredients[1].fat || 0;
      }
    }

    return {
      name: template.name,
      time: template.time,
      ingredients: selectedIngredients,
      calories: currentCalories,
      protein: currentProtein,
      carbs: currentCarbs,
      fat: currentFat,
      preparation: generatePreparation(selectedIngredients)
    };
  };

  const calculateAmount = (ingredient: any, targetCalories: number): number => {
    // Ensure we have valid numeric values
    const calories = Number(ingredient.calories_per_100g) || 0;
    const target = Number(targetCalories) || 0;
    
    if (calories === 0 || target === 0) return 100; // fallback to 100g
    return Math.max(10, (target * 100) / calories); // minimum 10g
  };

  const generatePreparation = (ingredients: Ingredient[]): string => {
    const preparations = [
      `Grill de ${ingredients[0]?.name.toLowerCase()} voor 8-10 minuten per kant`,
      `Bak de ${ingredients[0]?.name.toLowerCase()} in boter tot goudbruin`,
      `Kook de ${ingredients[0]?.name.toLowerCase()} voor 15-20 minuten`,
      `Rooster de ${ingredients[0]?.name.toLowerCase()} in de oven op 180°C`
    ];
    return preparations[Math.floor(Math.random() * preparations.length)];
  };

  const selectedDayPlan = weeklyPlan.find(day => day.day === selectedDay);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F1419] rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-8 w-8 text-[#8BAE5A]" />
            <div>
              <h2 className="text-2xl font-bold text-white">{plan?.name}</h2>
              <p className="text-gray-400">{plan?.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-gray-400">Weekplan wordt gegenereerd...</p>
          </div>
        ) : (
          <div className="flex h-[600px]">
            {/* Day Navigation */}
            <div className="w-48 bg-[#1F2D17] border-r border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Week Overzicht</h3>
              <div className="space-y-2">
                {daysOfWeek.map((day) => {
                  const dayPlan = weeklyPlan.find(d => d.day === day.key);
                  return (
                    <button
                      key={day.key}
                      onClick={() => setSelectedDay(day.key)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedDay === day.key 
                          ? 'bg-[#8BAE5A] text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-medium">{day.short}</div>
                      <div className="text-sm opacity-75">{day.name}</div>
                      {dayPlan && (
                        <div className="text-xs mt-1">
                          {dayPlan.totalCalories} kcal
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Week Summary */}
              {weeklyPlan.length > 0 && (
                <div className="mt-6 p-3 bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Week Gemiddeld</h4>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>🔥 {Math.round(weeklyPlan.reduce((sum, day) => sum + day.totalCalories, 0) / 7)} kcal</div>
                    <div>💪 {Math.round(weeklyPlan.reduce((sum, day) => sum + day.totalProtein, 0) / 7)}g eiwit</div>
                    <div>🥑 {Math.round(weeklyPlan.reduce((sum, day) => sum + day.totalFat, 0) / 7)}g vet</div>
                  </div>
                </div>
              )}
            </div>

            {/* Day Details */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedDayPlan ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">{selectedDayPlan.dayName}</h3>
                    <div className="flex space-x-4 text-sm">
                      <div className="bg-gray-800 px-3 py-1 rounded-lg">
                        <FireIcon className="h-4 w-4 inline mr-1 text-orange-400" />
                        <span className="text-white">{selectedDayPlan.totalCalories} kcal</span>
                      </div>
                      <div className="bg-gray-800 px-3 py-1 rounded-lg">
                        <span className="text-blue-400">💪 {selectedDayPlan.totalProtein}g</span>
                      </div>
                      <div className="bg-gray-800 px-3 py-1 rounded-lg">
                        <span className="text-green-400">🥑 {selectedDayPlan.totalFat}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Meals */}
                  <div className="space-y-6">
                    {Object.entries(selectedDayPlan.meals).map(([mealType, meal]) => (
                      <div key={mealType} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <ClockIcon className="h-5 w-5 text-[#8BAE5A]" />
                            <h4 className="text-lg font-semibold text-white capitalize">{meal.name}</h4>
                            <span className="text-sm text-gray-400">{meal.time}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {meal.calories} kcal • {meal.protein}g eiwit
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-white mb-2">Ingrediënten:</h5>
                            <ul className="space-y-1">
                              {meal.ingredients.map((ingredient, idx) => (
                                <li key={idx} className="text-sm text-gray-300">
                                  • {ingredient.amount}{ingredient.unit} {ingredient.name}
                                  <span className="text-gray-500 ml-2">
                                    ({ingredient.calories} kcal, {ingredient.protein}g eiwit)
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {meal.preparation && (
                            <div>
                              <h5 className="text-sm font-medium text-white mb-2">Bereiding:</h5>
                              <p className="text-sm text-gray-300">{meal.preparation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 mt-8">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecteer een dag om het menu te bekijken</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
