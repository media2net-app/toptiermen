"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface DynamicPlanViewProps {
  planId: string;
  planName: string;
  userId: string;
  onBack: () => void;
}

// Exact match with backend API structure
interface MealIngredient {
  name: string;
  unit: string;
  amount: number;
}

interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  name: string;
  ingredients: MealIngredient[];
  nutrition: MealNutrition;
}

interface DayPlan {
  ontbijt: Meal;
  snack1: Meal;
  lunch: Meal;
  snack2: Meal;
  diner: Meal;
  avondsnack: Meal;
  dailyTotals: MealNutrition;
}

interface UserProfile {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  age: number;
  weight: number;
  height: number;
  goal: string;
}

interface ScalingInfo {
  basePlanCalories: number;
  scaleFactor: number;
  targetCalories: number;
  planTargetCalories: number;
}

interface WeeklyAverages {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface PlanData {
  planId: string;
  planName: string;
  userProfile: UserProfile;
  scalingInfo: ScalingInfo;
  weekPlan: Record<string, DayPlan>;
  weeklyAverages: WeeklyAverages;
  generatedAt: string;
  // New plan-specific macro data
  planPercentages?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  planTargets?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const DAYS_NL = {
  maandag: 'Maandag',
  dinsdag: 'Dinsdag', 
  woensdag: 'Woensdag',
  donderdag: 'Donderdag',
  vrijdag: 'Vrijdag',
  zaterdag: 'Zaterdag',
  zondag: 'Zondag'
};

const MEAL_TYPES_NL = {
  ontbijt: 'Ontbijt',
  snack1: 'Ochtend Snack',
  lunch: 'Lunch',
  snack2: 'Lunch Snack',
  diner: 'Diner',
  avondsnack: 'Avond Snack'
};

const MEAL_ORDER = ['ontbijt', 'snack1', 'lunch', 'snack2', 'diner', 'avondsnack'];

export default function DynamicPlanViewNew({ planId, planName, userId, onBack }: DynamicPlanViewProps) {
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('maandag');
  const [editingMeal, setEditingMeal] = useState<{day: string, meal: string} | null>(null);

  // Fetch dynamic plan data
  const fetchDynamicPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching dynamic plan:', { planId, userId });
      
      const response = await fetch(`/api/nutrition-plan-dynamic?planId=${planId}&userId=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dynamic plan');
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Dynamic plan loaded successfully:', data.data);
        setPlanData(data.data);
      } else {
        throw new Error(data.error || 'Failed to load dynamic plan');
      }
      
    } catch (error) {
      console.error('❌ Error fetching dynamic plan:', error);
      setError(error.message);
      toast.error('Fout bij laden voedingsplan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDynamicPlan();
  }, [planId, userId]);

  const handleEditMeal = (day: string, mealType: string) => {
    setEditingMeal({ day, meal: mealType });
    console.log('✏️ Editing meal:', { day, meal: mealType });
  };

  const handleAddSnack = (day: string, snackType: string) => {
    console.log('➕ Adding snack:', { day, snack: snackType });
    toast.success(`${MEAL_TYPES_NL[snackType as keyof typeof MEAL_TYPES_NL]} toegevoegd!`);
  };

  // Calculate nutrition for a single ingredient based on amount and unit
  const calculateIngredientNutrition = (ingredient: any) => {
    const amount = ingredient.amount || 0;
    const unit = ingredient.unit || 'per_100g';
    
    // Base nutrition per 100g (this would come from ingredient database)
    const baseNutrition = {
      calories: ingredient.calories_per_100g || 0,
      protein: ingredient.protein_per_100g || 0,
      carbs: ingredient.carbs_per_100g || 0,
      fat: ingredient.fat_per_100g || 0
    };

    // Convert based on unit type
    let multiplier = 1;
    switch (unit) {
      case 'per_100g':
        multiplier = amount / 100;
        break;
      case 'per_piece':
        multiplier = amount; // Assuming 1 piece = 100g for now
        break;
      case 'per_ml':
        multiplier = amount / 100; // Assuming 1ml = 1g for liquids
        break;
      case 'per_tbsp':
        multiplier = (amount * 15) / 100; // 1 tbsp = 15ml
        break;
      case 'per_tsp':
        multiplier = (amount * 5) / 100; // 1 tsp = 5ml
        break;
      case 'per_cup':
        multiplier = (amount * 240) / 100; // 1 cup = 240ml
        break;
      default:
        multiplier = amount / 100;
    }

    return {
      calories: baseNutrition.calories * multiplier,
      protein: baseNutrition.protein * multiplier,
      carbs: baseNutrition.carbs * multiplier,
      fat: baseNutrition.fat * multiplier
    };
  };

  // Handle ingredient changes
  const handleIngredientChange = (day: string, mealType: string, ingredientIndex: number, field: string, value: any) => {
    if (!planData) return;

    const updatedPlanData = { ...planData };
    const meal = updatedPlanData.weekPlan[day][mealType];
    
    if (meal && meal.ingredients && meal.ingredients[ingredientIndex]) {
      meal.ingredients[ingredientIndex][field] = value;
      
      // Recalculate meal nutrition
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      meal.ingredients.forEach((ingredient: any) => {
        const nutrition = calculateIngredientNutrition(ingredient);
        totalCalories += nutrition.calories;
        totalProtein += nutrition.protein;
        totalCarbs += nutrition.carbs;
        totalFat += nutrition.fat;
      });

      meal.nutrition = {
        calories: Math.round(totalCalories * 10) / 10,
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10
      };

      // Recalculate daily totals
      let dailyCalories = 0;
      let dailyProtein = 0;
      let dailyCarbs = 0;
      let dailyFat = 0;

      Object.values(updatedPlanData.weekPlan[day]).forEach((mealData: any) => {
        if (mealData && typeof mealData === 'object' && 'nutrition' in mealData && mealData.nutrition) {
          dailyCalories += mealData.nutrition.calories;
          dailyProtein += mealData.nutrition.protein;
          dailyCarbs += mealData.nutrition.carbs;
          dailyFat += mealData.nutrition.fat;
        }
      });

      updatedPlanData.weekPlan[day].dailyTotals = {
        calories: Math.round(dailyCalories),
        protein: Math.round(dailyProtein * 10) / 10,
        carbs: Math.round(dailyCarbs * 10) / 10,
        fat: Math.round(dailyFat * 10) / 10
      };

      setPlanData(updatedPlanData);
    }
  };

  // Handle ingredient removal
  const handleRemoveIngredient = (day: string, mealType: string, ingredientIndex: number) => {
    if (!planData) return;

    const updatedPlanData = { ...planData };
    const meal = updatedPlanData.weekPlan[day][mealType];
    
    if (meal && meal.ingredients) {
      meal.ingredients.splice(ingredientIndex, 1);
      
      // Recalculate meal nutrition
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      meal.ingredients.forEach((ingredient: any) => {
        const nutrition = calculateIngredientNutrition(ingredient);
        totalCalories += nutrition.calories;
        totalProtein += nutrition.protein;
        totalCarbs += nutrition.carbs;
        totalFat += nutrition.fat;
      });

      meal.nutrition = {
        calories: Math.round(totalCalories * 10) / 10,
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10
      };

      // Recalculate daily totals
      let dailyCalories = 0;
      let dailyProtein = 0;
      let dailyCarbs = 0;
      let dailyFat = 0;

      Object.values(updatedPlanData.weekPlan[day]).forEach((mealData: any) => {
        if (mealData && typeof mealData === 'object' && 'nutrition' in mealData && mealData.nutrition) {
          dailyCalories += mealData.nutrition.calories;
          dailyProtein += mealData.nutrition.protein;
          dailyCarbs += mealData.nutrition.carbs;
          dailyFat += mealData.nutrition.fat;
        }
      });

      updatedPlanData.weekPlan[day].dailyTotals = {
        calories: Math.round(dailyCalories),
        protein: Math.round(dailyProtein * 10) / 10,
        carbs: Math.round(dailyCarbs * 10) / 10,
        fat: Math.round(dailyFat * 10) / 10
      };

      setPlanData(updatedPlanData);
      toast.success('Ingrediënt verwijderd');
    }
  };

  const getDayTotal = (day: string) => {
    if (!planData?.weekPlan[day]) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    // Backend already calculates scaled daily totals, so return as-is
    return planData.weekPlan[day].dailyTotals;
  };

  const getMealData = (day: string, mealType: string) => {
    if (!planData?.weekPlan[day]) return null;
    // Backend already applies scaling, so return the meal as-is
    return planData.weekPlan[day][mealType as keyof DayPlan];
  };


  const getCalorieStatus = (day: string) => {
    const dayTotal = getDayTotal(day);
    const target = planData?.scalingInfo.planTargetCalories || 0;
    const difference = target - dayTotal.calories;
    
    if (difference > 0) {
      return { type: 'under', message: `Je zit ${difference} kcal ONDER je dagelijkse behoefte!` };
    } else if (difference < 0) {
      return { type: 'over', message: `Je zit ${Math.abs(difference)} kcal BOVEN je dagelijkse behoefte!` };
    } else {
      return { type: 'perfect', message: 'Perfect! Je zit precies op je dagelijkse behoefte.' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-white">Laden van voedingsplan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Fout bij laden</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchDynamicPlan}
            className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-white mb-2">Geen data gevonden</h2>
          <p className="text-gray-300">Er zijn geen voedingsgegevens beschikbaar.</p>
        </div>
      </div>
    );
  }

  const currentDayData = planData.weekPlan[selectedDay];
  const calorieStatus = getCalorieStatus(selectedDay);

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      {/* Header */}
      <div className="bg-[#181F17] border-b border-[#3A4D23] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Terug naar overzicht
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{planData.planName}</h1>
                <p className="text-gray-300">
                  Gepersonaliseerd voor {planData.userProfile.weight}kg, {planData.userProfile.age} jaar - {planData.userProfile.goal}
                </p>
              </div>
            </div>
            <button className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold">
              Selecteer dit plan
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Plan-Specific Macro Breakdown */}
        {(planData.planPercentages || planData.planTargets) && (
          <div className="bg-gradient-to-r from-[#1a1f17] to-[#2d3a23] border border-[#3a4d23] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
              <h3 className="text-xl font-bold text-white">Plan Macro Verdeling</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Macro Percentages */}
              {planData.planPercentages && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-[#8BAE5A] mb-3">Macro Percentages</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#232D1A] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-white font-medium">Eiwit</span>
                      </div>
                      <span className="text-white font-bold text-lg">{planData.planPercentages.protein}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#232D1A] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-white font-medium">Koolhydraten</span>
                      </div>
                      <span className="text-white font-bold text-lg">{planData.planPercentages.carbs}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#232D1A] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-white font-medium">Vet</span>
                      </div>
                      <span className="text-white font-bold text-lg">{planData.planPercentages.fat}%</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Target Values */}
              {planData.planTargets && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-[#8BAE5A] mb-3">Doelwaarden</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-[#232D1A] rounded-lg">
                      <div className="text-2xl font-bold text-white">{planData.planTargets.calories}</div>
                      <div className="text-sm text-gray-400">Calorieën</div>
                    </div>
                    <div className="text-center p-3 bg-[#232D1A] rounded-lg">
                      <div className="text-2xl font-bold text-white">{planData.planTargets.protein}g</div>
                      <div className="text-sm text-gray-400">Eiwit</div>
                    </div>
                    <div className="text-center p-3 bg-[#232D1A] rounded-lg">
                      <div className="text-2xl font-bold text-white">{planData.planTargets.carbs}g</div>
                      <div className="text-sm text-gray-400">Koolhydraten</div>
                    </div>
                    <div className="text-center p-3 bg-[#232D1A] rounded-lg">
                      <div className="text-2xl font-bold text-white">{planData.planTargets.fat}g</div>
                      <div className="text-sm text-gray-400">Vet</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Daily Requirements & Weekly Average */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Daily Requirements */}
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
              <h3 className="text-xl font-bold text-white">Jouw Dagelijkse Behoefte</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{planData.scalingInfo.planTargetCalories}</div>
                <div className="text-sm text-gray-400">Calorieën per dag</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{planData.userProfile.targetProtein}g</div>
                <div className="text-sm text-gray-400">Eiwitten per dag</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{planData.userProfile.targetCarbs}g</div>
                <div className="text-sm text-gray-400">Koolhydraten per dag</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{planData.userProfile.targetFat}g</div>
                <div className="text-sm text-gray-400">Vetten per dag</div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-300">
              Doel: {planData.userProfile.goal} • {planData.userProfile.weight}kg • {planData.userProfile.age} jaar
            </div>
            {planData.scalingInfo.scaleFactor && planData.scalingInfo.scaleFactor !== 1 && (
              <div className="mt-2 text-center text-xs text-[#8BAE5A]">
                ⚖️ Plan geschaald met factor {planData.scalingInfo.scaleFactor.toFixed(2)} 
                <br />
                (Basis: {planData.scalingInfo.basePlanCalories} kcal → Jouw doel: {planData.scalingInfo.targetCalories} kcal)
              </div>
            )}
          </div>

          {/* Weekly Average */}
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDaysIcon className="w-6 h-6 text-[#8BAE5A]" />
              <h3 className="text-xl font-bold text-white">Weekgemiddelde</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{Math.round(planData.weeklyAverages.calories)}</div>
                <div className="text-sm text-gray-400">Calorieën per dag</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{Math.round(planData.weeklyAverages.protein)}g</div>
                <div className="text-sm text-gray-400">Eiwitten per dag</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{Math.round(planData.weeklyAverages.carbs)}g</div>
                <div className="text-sm text-gray-400">Koolhydraten per dag</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{Math.round(planData.weeklyAverages.fat)}g</div>
                <div className="text-sm text-gray-400">Vetten per dag</div>
              </div>
            </div>
          </div>
        </div>

        {/* Day Selection */}
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Kies een dag</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(DAYS_NL).map(([dayKey, dayName]) => (
              <button
                key={dayKey}
                onClick={() => setSelectedDay(dayKey)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedDay === dayKey
                    ? 'bg-[#8BAE5A] text-[#232D1A]'
                    : 'bg-[#3A4D23] text-white hover:bg-[#4A5D33]'
                }`}
              >
                {dayName}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Totals & Warning */}
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {DAYS_NL[selectedDay as keyof typeof DAYS_NL]} - Dagtotalen
          </h3>
          
          {/* Calorie Warning */}
          {calorieStatus.type !== 'perfect' && (
            <div className={`p-4 rounded-lg mb-4 ${
              calorieStatus.type === 'under' 
                ? 'bg-red-900/20 border border-red-500 text-red-300'
                : 'bg-yellow-900/20 border border-yellow-500 text-yellow-300'
            }`}>
              <div className="flex items-center gap-2">
                <FireIcon className="w-5 h-5" />
                <span className="font-semibold">{calorieStatus.message}</span>
              </div>
              <div className="text-sm mt-1">
                Doel: {planData.scalingInfo.planTargetCalories} kcal • Huidig: {getDayTotal(selectedDay).calories} kcal
              </div>
            </div>
          )}

          {/* Daily Totals Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Calories Card */}
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{getDayTotal(selectedDay).calories}</div>
              <div className="text-sm text-gray-400">Calorieën</div>
              <div className="text-xs text-gray-500">Doel: {planData.scalingInfo.planTargetCalories}</div>
              {(() => {
                const current = getDayTotal(selectedDay).calories;
                const target = planData.scalingInfo.planTargetCalories;
                const difference = current - target;
                const percentage = target > 0 ? Math.round((difference / target) * 100) : 0;
                const isOver = difference > 0;
                return (
                  <div className={`text-xs mt-1 ${isOver ? 'text-red-400' : 'text-green-400'}`}>
                    {isOver ? '+' : ''}{difference} kcal ({isOver ? '+' : ''}{percentage}%)
                  </div>
                );
              })()}
            </div>

            {/* Protein Card */}
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{getDayTotal(selectedDay).protein}g</div>
              <div className="text-sm text-gray-400">Eiwitten</div>
              <div className="text-xs text-gray-500">Doel: {planData.userProfile.targetProtein}g</div>
              {(() => {
                const current = getDayTotal(selectedDay).protein;
                const target = planData.userProfile.targetProtein;
                const difference = current - target;
                const percentage = target > 0 ? Math.round((difference / target) * 100) : 0;
                const isOver = difference > 0;
                return (
                  <div className={`text-xs mt-1 ${isOver ? 'text-red-400' : 'text-green-400'}`}>
                    {isOver ? '+' : ''}{Math.round(difference * 10) / 10}g ({isOver ? '+' : ''}{percentage}%)
                  </div>
                );
              })()}
            </div>

            {/* Carbs Card */}
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{getDayTotal(selectedDay).carbs}g</div>
              <div className="text-sm text-gray-400">Koolhydraten</div>
              <div className="text-xs text-gray-500">Doel: {planData.userProfile.targetCarbs}g</div>
              {(() => {
                const current = getDayTotal(selectedDay).carbs;
                const target = planData.userProfile.targetCarbs;
                const difference = current - target;
                const percentage = target > 0 ? Math.round((difference / target) * 100) : 0;
                const isOver = difference > 0;
                return (
                  <div className={`text-xs mt-1 ${isOver ? 'text-red-400' : 'text-green-400'}`}>
                    {isOver ? '+' : ''}{Math.round(difference * 10) / 10}g ({isOver ? '+' : ''}{percentage}%)
                  </div>
                );
              })()}
            </div>

            {/* Fat Card */}
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{getDayTotal(selectedDay).fat}g</div>
              <div className="text-sm text-gray-400">Vetten</div>
              <div className="text-xs text-gray-500">Doel: {planData.userProfile.targetFat}g</div>
              {(() => {
                const current = getDayTotal(selectedDay).fat;
                const target = planData.userProfile.targetFat;
                const difference = current - target;
                const percentage = target > 0 ? Math.round((difference / target) * 100) : 0;
                const isOver = difference > 0;
                return (
                  <div className={`text-xs mt-1 ${isOver ? 'text-red-400' : 'text-green-400'}`}>
                    {isOver ? '+' : ''}{Math.round(difference * 10) / 10}g ({isOver ? '+' : ''}{percentage}%)
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-4">
          {MEAL_ORDER.map((mealType) => {
            const meal = getMealData(selectedDay, mealType);
            // Show all meal types, even if they don't have data
            if (!meal) {
              return (
                <div key={mealType} className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
                  {/* Meal Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white flex items-center">
                      <ClockIcon className="w-5 h-5 text-[#8BAE5A] mr-2" />
                      {MEAL_TYPES_NL[mealType as keyof typeof MEAL_TYPES_NL]}
                      <span className="ml-4 text-sm text-gray-400">0 kcal</span>
                    </h4>
                    <button
                      onClick={() => handleEditMeal(selectedDay, mealType)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors text-sm font-semibold"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Bewerken
                    </button>
                  </div>

                  {/* Empty Meal Content */}
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">Geen maaltijd gedefinieerd</div>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-500">Kcal 0</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-500">Eiwit 0g</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-500">KH 0g</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-500">Vet 0g</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={mealType} className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
                {/* Meal Header */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white flex items-center">
                    <ClockIcon className="w-5 h-5 text-[#8BAE5A] mr-2" />
                    {MEAL_TYPES_NL[mealType as keyof typeof MEAL_TYPES_NL]}
                    <span className="ml-4 text-sm text-gray-400">
                      {'nutrition' in meal ? meal.nutrition.calories : meal.calories} kcal
                    </span>
                  </h4>
                  <button
                    onClick={() => handleEditMeal(selectedDay, mealType)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors text-sm font-semibold"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Bewerken
                  </button>
                </div>

                {/* Meal Nutrition */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">Kcal {'nutrition' in meal ? meal.nutrition.calories : meal.calories}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">Eiwit {'nutrition' in meal ? meal.nutrition.protein : meal.protein}g</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">KH {'nutrition' in meal ? meal.nutrition.carbs : meal.carbs}g</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">Vet {'nutrition' in meal ? meal.nutrition.fat : meal.fat}g</div>
                  </div>
                </div>

                {/* Ingredients Table */}
                {'ingredients' in meal && meal.ingredients && meal.ingredients.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-300 mb-3">Ingrediënten:</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#3A4D23]">
                            <th className="text-left py-2 text-gray-300">Ingrediënt</th>
                            <th className="text-center py-2 text-gray-300">Aantal</th>
                            <th className="text-center py-2 text-gray-300">Eenheid</th>
                            <th className="text-center py-2 text-gray-300">Kcal</th>
                            <th className="text-center py-2 text-gray-300">Eiwit</th>
                            <th className="text-center py-2 text-gray-300">KH</th>
                            <th className="text-center py-2 text-gray-300">Vet</th>
                            <th className="text-center py-2 text-gray-300">Acties</th>
                          </tr>
                        </thead>
                        <tbody>
                      {meal.ingredients.map((ingredient, index) => (
                            <tr key={index} className="border-b border-[#3A4D23]/50 hover:bg-[#1F2D17]">
                              <td className="py-3 text-white font-medium">{ingredient.name}</td>
                              <td className="py-3 text-center">
                                <input
                                  type="number"
                                  value={ingredient.amount || 0}
                                  onChange={(e) => handleIngredientChange(selectedDay, mealType, index, 'amount', parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 bg-[#181F17] border border-[#3A4D23] rounded text-white text-center focus:outline-none focus:border-[#8BAE5A]"
                                  min="0"
                                  step="1"
                                />
                              </td>
                              <td className="py-3 text-center">
                                <select
                                  value={ingredient.unit || 'per_100g'}
                                  onChange={(e) => handleIngredientChange(selectedDay, mealType, index, 'unit', e.target.value)}
                                  className="px-2 py-1 bg-[#181F17] border border-[#3A4D23] rounded text-white text-center focus:outline-none focus:border-[#8BAE5A] text-xs"
                                >
                                  <option value="per_100g">per 100g</option>
                                  <option value="per_piece">per stuk</option>
                                  <option value="per_ml">per ml</option>
                                  <option value="per_tbsp">per eetlepel</option>
                                  <option value="per_tsp">per theelepel</option>
                                  <option value="per_cup">per kop</option>
                                </select>
                              </td>
                              <td className="py-3 text-center text-white">
                                {calculateIngredientNutrition(ingredient).calories.toFixed(1)}
                              </td>
                              <td className="py-3 text-center text-white">
                                {calculateIngredientNutrition(ingredient).protein.toFixed(1)}g
                              </td>
                              <td className="py-3 text-center text-white">
                                {calculateIngredientNutrition(ingredient).carbs.toFixed(1)}g
                              </td>
                              <td className="py-3 text-center text-white">
                                {calculateIngredientNutrition(ingredient).fat.toFixed(1)}g
                              </td>
                              <td className="py-3 text-center">
                                <button
                                  onClick={() => handleRemoveIngredient(selectedDay, mealType, index)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Verwijder ingrediënt"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Add Snack Button for snack meals */}
                {(mealType === 'snack1' || mealType === 'snack2' || mealType === 'avondsnack') && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleAddSnack(selectedDay, mealType)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors text-sm font-semibold"
                    >
                      <PlusIcon className="w-4 h-4" />
                      + {MEAL_TYPES_NL[mealType as keyof typeof MEAL_TYPES_NL]} toevoegen
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
