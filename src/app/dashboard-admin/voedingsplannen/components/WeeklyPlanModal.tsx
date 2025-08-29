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
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  duration_weeks: number;
  difficulty: string;
  goal: string;
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

  useEffect(() => {
    if (isOpen && plan) {
      generateWeeklyPlan();
    }
  }, [isOpen, plan]);

  const generateWeeklyPlan = async () => {
    if (!plan) return;
    
    setIsLoading(true);
    try {
      console.log('🗓️ Generating weekly plan for:', plan.name);
      
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
    const targetCaloriesPerMeal = {
      ontbijt: Math.round(plan.target_calories * 0.25), // 25%
      snack1: Math.round(plan.target_calories * 0.10),  // 10%
      lunch: Math.round(plan.target_calories * 0.30),   // 30%
      snack2: Math.round(plan.target_calories * 0.10),  // 10%
      diner: Math.round(plan.target_calories * 0.25)    // 25%
    };

    // Create different meal variations based on day
    const meatOptions = ingredients.filter(i => i.category === 'vlees');
    const fishOptions = ingredients.filter(i => i.category === 'vis');
    const eggOptions = ingredients.filter(i => i.category === 'eieren');
    const dairyOptions = ingredients.filter(i => i.category === 'zuivel');

    const meals = {
      ontbijt: generateMeal('ontbijt', targetCaloriesPerMeal.ontbijt, eggOptions, dairyOptions, dayIndex),
      snack1: generateMeal('snack1', targetCaloriesPerMeal.snack1, dairyOptions, eggOptions, dayIndex),
      lunch: generateMeal('lunch', targetCaloriesPerMeal.lunch, meatOptions, fishOptions, dayIndex),
      snack2: generateMeal('snack2', targetCaloriesPerMeal.snack2, dairyOptions, meatOptions, dayIndex),
      diner: generateMeal('diner', targetCaloriesPerMeal.diner, meatOptions, fishOptions, dayIndex)
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

  const generateMeal = (mealType: string, targetCalories: number, primaryIngredients: any[], secondaryIngredients: any[], dayIndex: number): Meal => {
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
      
      selectedIngredients.push({
        name: primaryIng.name,
        amount: Math.round(amount),
        unit: 'gram',
        calories: Math.round((primaryIng.calories_per_100g * amount) / 100),
        protein: Math.round((primaryIng.protein_per_100g * amount) / 100),
        carbs: Math.round((primaryIng.carbs_per_100g * amount) / 100),
        fat: Math.round((primaryIng.fat_per_100g * amount) / 100)
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
        selectedIngredients.push({
          name: secondaryIng.name,
          amount: Math.round(amount),
          unit: 'gram',
          calories: Math.round((secondaryIng.calories_per_100g * amount) / 100),
          protein: Math.round((secondaryIng.protein_per_100g * amount) / 100),
          carbs: Math.round((secondaryIng.carbs_per_100g * amount) / 100),
          fat: Math.round((secondaryIng.fat_per_100g * amount) / 100)
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
    if (!ingredient.calories_per_100g || ingredient.calories_per_100g === 0) return 100;
    return (targetCalories * 100) / ingredient.calories_per_100g;
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
