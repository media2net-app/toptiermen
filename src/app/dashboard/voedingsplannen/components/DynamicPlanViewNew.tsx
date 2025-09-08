"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  PencilIcon,
  PlusIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';
import MealEditModal from './MealEditModal';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

// Function to map activity level to Dutch display text
function getActivityLevelDisplay(activityLevel: string): string {
  switch (activityLevel) {
    case 'sedentary':
      return 'Zittend (Licht actief)';
    case 'moderate':
      return 'Staand (Matig actief)';
    case 'very_active':
      return 'Lopend (Zeer actief)';
    default:
      return activityLevel;
  }
}

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
    target_calories: number;
    target_protein: number;
    target_carbs: number;
    target_fat: number;
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

const MEAL_NAMES = {
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
  const [customPlanData, setCustomPlanData] = useState<PlanData | null>(null);
  const [modifiedMeals, setModifiedMeals] = useState<Set<string>>(new Set());
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  const { isAdmin } = useSupabaseAuth();

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
    // Create custom plan data if it doesn't exist yet
    if (!customPlanData && planData) {
      console.log('🔄 Creating custom plan from base plan');
      setCustomPlanData({ ...planData });
    }
    
    setEditingMeal({ day, meal: mealType });
    console.log('✏️ Editing meal:', { day, meal: mealType });
  };

  const handleSaveMeal = async (ingredients: MealIngredient[]) => {
    if (!editingMeal || !customPlanData) return;

    try {
      // Use existing custom plan data
      let currentCustomData = { ...customPlanData };
      
      // Update the specific meal with new ingredients
      if (!currentCustomData.weekPlan[editingMeal.day]) {
        currentCustomData.weekPlan[editingMeal.day] = {
          ontbijt: { name: 'Ontbijt', ingredients: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
          snack1: { name: 'Ochtend Snack', ingredients: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
          lunch: { name: 'Lunch', ingredients: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
          snack2: { name: 'Lunch Snack', ingredients: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
          diner: { name: 'Diner', ingredients: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
          avondsnack: { name: 'Avond Snack', ingredients: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
          dailyTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
        };
      }

      // Calculate nutrition for the meal
      const nutrition = calculateMealNutrition(ingredients);
      
      // Update the meal
      currentCustomData.weekPlan[editingMeal.day][editingMeal.meal as keyof DayPlan] = {
        name: MEAL_TYPES_NL[editingMeal.meal as keyof typeof MEAL_TYPES_NL],
        ingredients,
        nutrition
      };

      // Recalculate daily totals
      currentCustomData.weekPlan[editingMeal.day].dailyTotals = calculateDailyTotals(currentCustomData.weekPlan[editingMeal.day]);

      // Update state
      setCustomPlanData(currentCustomData);
      setEditingMeal(null);

      // Save to database
      await saveCustomPlan(currentCustomData);

      toast.success('Maaltijd opgeslagen!');
    } catch (error) {
      console.error('❌ Error saving meal:', error);
      toast.error('Fout bij opslaan maaltijd');
    }
  };

  const calculateMealNutrition = (ingredients: MealIngredient[]) => {
    return ingredients.reduce((total, ingredient) => {
      const nutrition = calculateIngredientNutrition(ingredient);
      return {
        calories: total.calories + nutrition.calories,
        protein: total.protein + nutrition.protein,
        carbs: total.carbs + nutrition.carbs,
        fat: total.fat + nutrition.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const calculateDailyTotals = (dayPlan: DayPlan) => {
    const meals = [dayPlan.ontbijt, dayPlan.snack1, dayPlan.lunch, dayPlan.snack2, dayPlan.diner, dayPlan.avondsnack];
    return meals.reduce((total, meal) => ({
      calories: total.calories + meal.nutrition.calories,
      protein: total.protein + meal.nutrition.protein,
      carbs: total.carbs + meal.nutrition.carbs,
      fat: total.fat + meal.nutrition.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  // Check if a meal is back to its original state
  const checkIfMealIsBackToOriginal = (day: string, mealType: string, currentPlanData: PlanData) => {
    if (!planData) return false;
    
    const currentMeal = currentPlanData.weekPlan[day][mealType];
    const originalMeal = planData.weekPlan[day][mealType];
    
    if (!currentMeal || !originalMeal || !currentMeal.ingredients || !originalMeal.ingredients) {
      return false;
    }
    
    // Check if all ingredients match original amounts
    return currentMeal.ingredients.every((currentIngredient, index) => {
      const originalIngredient = originalMeal.ingredients[index];
      if (!originalIngredient) return false;
      
      return currentIngredient.amount === originalIngredient.amount &&
             currentIngredient.unit === originalIngredient.unit &&
             currentIngredient.name === originalIngredient.name;
    });
  };

  const saveCustomPlan = async (customData: PlanData) => {
    try {
      // Check if there are still modifications after potential reversions
      const hasModifications = modifiedMeals.size > 0;
      
      if (!hasModifications) {
        console.log('ℹ️ No modifications detected, skipping custom plan save');
        return;
      }

      console.log('💾 Saving custom plan with modifications:', modifiedMeals.size);
      
      const response = await fetch('/api/custom-nutrition-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          basePlanId: planId,
          customPlanData: customData,
          planName: `${planName} (Aangepast)`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save custom plan');
      }

      const result = await response.json();
      console.log('✅ Custom plan saved:', result);
      
      // Clear modified meals after successful save
      setModifiedMeals(new Set());
    } catch (error) {
      console.error('❌ Error saving custom plan:', error);
      throw error;
    }
  };

  const resetToOriginalPlan = async () => {
    try {
      // Delete custom plan from database
      const response = await fetch('/api/custom-nutrition-plans', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          basePlanId: planId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete custom plan');
      }

      // Reset local state
      setCustomPlanData(null);
      setModifiedMeals(new Set());
      
      toast.success('Plan gereset naar origineel!');
      console.log('✅ Plan reset to original');
    } catch (error) {
      console.error('❌ Error resetting plan:', error);
      toast.error('Fout bij resetten van plan');
    }
  };


  // Format unit display for better readability
  const formatUnitDisplay = (unit: string) => {
    switch (unit) {
      case 'per_100g': return 'g';
      case 'per_piece': return 'stuk';
      case 'per_ml': return 'ml';
      case 'per_tbsp': return 'eetlepel';
      case 'per_tsp': return 'theelepel';
      case 'per_cup': return 'kop';
      default: return unit;
    }
  };

  // Ingredient database - loaded from API
  const [ingredientDatabase, setIngredientDatabase] = useState<any>({});

  // Load ingredient database from API
  useEffect(() => {
    const loadIngredientDatabase = async () => {
      try {
        const response = await fetch('/api/nutrition-ingredients');
        const data = await response.json();
        if (data.success && data.ingredients) {
          setIngredientDatabase(data.ingredients);
          console.log('✅ Loaded ingredient database:', Object.keys(data.ingredients).length, 'ingredients');
        }
      } catch (error) {
        console.error('❌ Error loading ingredient database:', error);
      }
    };

    loadIngredientDatabase();
  }, []);

  // Calculate nutrition for a single ingredient based on amount and unit
  const calculateIngredientNutrition = (ingredient: any) => {
    const amount = ingredient.amount || 0;
    const unit = ingredient.unit || 'per_100g';
    const name = ingredient.name || '';
    
    // Get nutrition data from database
    const nutritionData = ingredientDatabase[name];
    if (!nutritionData) {
      console.warn(`⚠️ Nutrition data not found for ingredient: ${name}`);
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    // Convert based on unit type
    let multiplier = 1;
    switch (unit) {
      case 'per_100g':
        multiplier = amount / 100;
        break;
      case 'per_piece':
      case 'stuk':
        multiplier = amount; // For pieces, use amount directly
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
      calories: Math.round(nutritionData.calories_per_100g * multiplier * 10) / 10,
      protein: Math.round(nutritionData.protein_per_100g * multiplier * 10) / 10,
      carbs: Math.round(nutritionData.carbs_per_100g * multiplier * 10) / 10,
      fat: Math.round(nutritionData.fat_per_100g * multiplier * 10) / 10
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
      
      // Check if this meal is back to original state after state update
      const mealKey = `${day}-${mealType}`;
      const isBackToOriginal = checkIfMealIsBackToOriginal(day, mealType, updatedPlanData);
      
      if (isBackToOriginal) {
        // Remove from modified meals if back to original
        setModifiedMeals(prev => {
          const newSet = new Set(prev);
          newSet.delete(mealKey);
          return newSet;
        });
    } else {
        // Mark this meal as modified
        setModifiedMeals(prev => new Set([...prev, mealKey]));
      }
    }
  };

  const getDayTotal = (day: string) => {
    // Use custom data if available, otherwise use original plan data
    const dataSource = customPlanData || planData;
    if (!dataSource?.weekPlan[day]) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return dataSource.weekPlan[day].dailyTotals;
  };

  const getMealData = (day: string, mealType: string) => {
    // Use custom data if available, otherwise use original plan data
    const dataSource = customPlanData || planData;
    if (!dataSource?.weekPlan[day]) return null;
    return dataSource.weekPlan[day][mealType as keyof DayPlan];
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
                <h1 className="text-2xl font-bold text-white">
                  {planData.planName}
                  {customPlanData && (
                    <span className="ml-3 px-2 py-1 bg-[#8BAE5A] text-[#232D1A] text-sm rounded-full font-medium">
                      Aangepast
                    </span>
                  )}
                </h1>
                {customPlanData && (
                  <div className="mt-2">
                    <button
                      onClick={resetToOriginalPlan}
                      className="inline-flex items-center px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 text-sm rounded-lg hover:bg-red-600/30 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset naar origineel
                    </button>
                  </div>
                )}
                <p className="text-gray-300">
                  Gepersonaliseerd voor {planData.userProfile.weight}kg, {planData.userProfile.age} jaar, {planData.userProfile.height}cm, {getActivityLevelDisplay(planData.userProfile.activityLevel)} - {planData.userProfile.goal}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Debug Toggle for Admin */}
              {isAdmin && (
                <button
                  onClick={() => setShowDebugPanel(!showDebugPanel)}
                  className="flex items-center gap-2 px-3 py-2 bg-[#3A4D23] hover:bg-[#4A5D33] text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <BugAntIcon className="w-4 h-4" />
                  Debug
                </button>
              )}
            <button className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold">
              Selecteer dit plan
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel for Admin */}
      {isAdmin && showDebugPanel && (
        <div className="bg-[#1A1A1A] border-b border-[#3A4D23] p-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-lg font-bold text-[#8BAE5A] mb-4">🔍 Debug Informatie</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Scaling Info */}
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">⚖️ Scaling Informatie</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Scale Factor:</span>
                    <span className="text-white font-mono">
                      {planData?.scalingInfo?.scaleFactor || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">User Target:</span>
                    <span className="text-white font-mono">
                      {planData?.scalingInfo?.targetCalories || 'N/A'} kcal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Plan Target:</span>
                    <span className="text-white font-mono">
                      {planData?.scalingInfo?.planTargetCalories || 'N/A'} kcal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Scaling Actief:</span>
                    <span className={`font-mono ${(planData?.scalingInfo?.scaleFactor || 1) !== 1 ? 'text-orange-400' : 'text-green-400'}`}>
                      {(planData?.scalingInfo?.scaleFactor || 1) !== 1 ? 'JA' : 'NEE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Profile */}
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">👤 User Profiel</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Gewicht:</span>
                    <span className="text-white font-mono">
                      {planData?.userProfile?.weight || 'N/A'} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Leeftijd:</span>
                    <span className="text-white font-mono">
                      {planData?.userProfile?.age || 'N/A'} jaar
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Lengte:</span>
                    <span className="text-white font-mono">
                      {planData?.userProfile?.height || 'N/A'} cm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Doel:</span>
                    <span className="text-white font-mono">
                      {planData?.userProfile?.goal || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Plan Percentages */}
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">📊 Plan Macro's</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Eiwit:</span>
                    <span className="text-white font-mono">
                      {planData?.planPercentages?.protein || 'N/A'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Koolhydraten:</span>
                    <span className="text-white font-mono">
                      {planData?.planPercentages?.carbs || 'N/A'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Vet:</span>
                    <span className="text-white font-mono">
                      {planData?.planPercentages?.fat || 'N/A'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

                  {/* Ingredient Database Status */}
                  <div className="mt-6 bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">🗄️ Ingrediënten Database Status</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {['Appel', 'Banaan', 'Havermout', 'Whey Shake'].map(ingredient => {
                        const hasData = ingredientDatabase[ingredient];
                        return (
                          <div key={ingredient} className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${hasData ? 'bg-green-400' : 'bg-red-400'}`}></span>
                            <span className="text-gray-300">{ingredient}:</span>
                            <span className={`font-mono ${hasData ? 'text-green-400' : 'text-red-400'}`}>
                              {hasData ? 'OK' : 'MISSING'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 text-sm text-gray-400">
                      Totaal geladen: {Object.keys(ingredientDatabase).length} ingrediënten
                    </div>
                  </div>

            {/* Current Day Ingredients */}
            <div className="mt-6 bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">🍽️ Huidige Dag Ingrediënten ({selectedDay})</h4>
              <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                {currentDayData && Object.entries(currentDayData).map(([mealType, meal]: [string, any]) => {
                  if (!meal || !meal.ingredients) return null;
                  return (
                    <div key={mealType} className="border-l-2 border-[#8BAE5A] pl-3">
                      <div className="font-medium text-[#8BAE5A]">{MEAL_NAMES[mealType] || mealType}</div>
                      {meal.ingredients.map((ingredient: any, index: number) => (
                        <div key={index} className="ml-4 text-gray-300">
                          {ingredient.name}: {ingredient.amount} {ingredient.unit}
                                <span className="ml-2 text-xs text-gray-500">
                                  (DB: {ingredientDatabase[ingredient.name] ? '✓' : '✗'})
                                </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

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
                      <div className="text-2xl font-bold text-white">{planData.planTargets?.target_calories || 0}</div>
                      <div className="text-sm text-gray-400">Calorieën</div>
          </div>
                    <div className="text-center p-3 bg-[#232D1A] rounded-lg">
                      <div className="text-2xl font-bold text-white">{planData.planTargets?.target_protein || 0}g</div>
                      <div className="text-sm text-gray-400">Eiwit</div>
                    </div>
                    <div className="text-center p-3 bg-[#232D1A] rounded-lg">
                      <div className="text-2xl font-bold text-white">{planData.planTargets?.target_carbs || 0}g</div>
                      <div className="text-sm text-gray-400">Koolhydraten</div>
                    </div>
                    <div className="text-center p-3 bg-[#232D1A] rounded-lg">
                      <div className="text-2xl font-bold text-white">{planData.planTargets?.target_fat || 0}g</div>
                      <div className="text-sm text-gray-400">Vet</div>
                    </div>
            </div>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Daily Requirements */}
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
            <h3 className="text-xl font-bold text-white">Jouw Dagelijkse Behoefte</h3>
            </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
              <div className="text-2xl font-bold text-white">{planData.planTargets?.target_calories || 0}</div>
                <div className="text-sm text-gray-400">Calorieën per dag</div>
              </div>
              <div className="text-center">
              <div className="text-2xl font-bold text-white">{planData.planTargets?.target_protein || 0}g</div>
                <div className="text-sm text-gray-400">Eiwitten per dag</div>
              </div>
              <div className="text-center">
              <div className="text-2xl font-bold text-white">{planData.planTargets?.target_carbs || 0}g</div>
                <div className="text-sm text-gray-400">Koolhydraten per dag</div>
              </div>
              <div className="text-center">
              <div className="text-2xl font-bold text-white">{planData.planTargets?.target_fat || 0}g</div>
                <div className="text-sm text-gray-400">Vetten per dag</div>
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
          

          {/* Daily Totals Progress Bars */}
          <div className="space-y-4">
            {/* Calories Progress Bar */}
            {(() => {
              const current = getDayTotal(selectedDay).calories;
              const target = planData.scalingInfo.planTargetCalories;
              const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
              const difference = current - target;
              const isOver = difference > 0;
              const isUnder = difference < 0;
              const isPerfect = difference === 0;
              
              let statusText = '';
              let statusColor = '';
              let progressColor = '';
              
              if (isPerfect) {
                statusText = 'Doel bereikt! (100%)';
                statusColor = 'text-green-400';
                progressColor = 'bg-green-500';
              } else if (isOver) {
                statusText = `${Math.abs(difference)} kcal te veel (${percentage}%)`;
                // Over target - use percentage-based colors
                if (percentage <= 105) {
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage <= 110) {
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              } else {
                // Under target - use percentage-based colors
                if (percentage >= 95) {
                  statusText = `${Math.abs(difference)} kcal te weinig (${percentage}%)`;
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage >= 90) {
                  statusText = `${Math.abs(difference)} kcal te weinig (${percentage}%)`;
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusText = `${Math.abs(difference)} kcal te weinig (${percentage}%)`;
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              }
              
              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Kcal (Calorieën)</span>
                    <span className={`text-sm ${statusColor}`}>{statusText}</span>
              </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
              </div>
            </div>
              );
            })()}

            {/* Protein Progress Bar */}
            {(() => {
              const current = getDayTotal(selectedDay).protein;
              const target = planData.planTargets?.target_protein || 0;
              const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
              const difference = current - target;
              const isOver = difference > 0;
              const isUnder = difference < 0;
              const isPerfect = difference === 0;
              
              let statusText = '';
              let statusColor = '';
              let progressColor = '';
              
              if (isPerfect) {
                statusText = 'Doel bereikt! (100%)';
                statusColor = 'text-green-400';
                progressColor = 'bg-green-500';
              } else if (isOver) {
                statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te veel (${percentage}%)`;
                // Over target - use percentage-based colors
                if (percentage <= 105) {
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage <= 110) {
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              } else {
                // Under target - use percentage-based colors
                if (percentage >= 95) {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage >= 90) {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              }
              
              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Eiwit (Protein)</span>
                    <span className={`text-sm ${statusColor}`}>{statusText}</span>
            </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
            </div>
            </div>
              );
            })()}

            {/* Carbs Progress Bar */}
            {(() => {
              const current = getDayTotal(selectedDay).carbs;
              const target = planData.planTargets?.target_carbs || 0;
              const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
              const difference = current - target;
              const isOver = difference > 0;
              const isUnder = difference < 0;
              const isPerfect = difference === 0;
              
              let statusText = '';
              let statusColor = '';
              let progressColor = '';
              
              if (isPerfect) {
                statusText = 'Doel bereikt! (100%)';
                statusColor = 'text-green-400';
                progressColor = 'bg-green-500';
              } else if (isOver) {
                statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te veel (${percentage}%)`;
                // Over target - use percentage-based colors
                if (percentage <= 105) {
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage <= 110) {
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              } else {
                // Under target - use percentage-based colors
                if (percentage >= 95) {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage >= 90) {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              }
              
              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Koolhydraten (Carbohydrates)</span>
                    <span className={`text-sm ${statusColor}`}>{statusText}</span>
            </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
            </div>
              );
            })()}

            {/* Fat Progress Bar */}
            {(() => {
              const current = getDayTotal(selectedDay).fat;
              const target = planData.planTargets?.target_fat || 0;
              const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
              const difference = current - target;
              const isOver = difference > 0;
              const isUnder = difference < 0;
              const isPerfect = difference === 0;
              
              let statusText = '';
              let statusColor = '';
              let progressColor = '';
              
              if (isPerfect) {
                statusText = 'Doel bereikt! (100%)';
                statusColor = 'text-green-400';
                progressColor = 'bg-green-500';
              } else if (isOver) {
                statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te veel (${percentage}%)`;
                // Over target - use percentage-based colors
                if (percentage <= 105) {
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage <= 110) {
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              } else {
                // Under target - use percentage-based colors
                if (percentage >= 95) {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage >= 90) {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              }
              
              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Vet (Fat)</span>
                    <span className={`text-sm ${statusColor}`}>{statusText}</span>
            </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
            </div>
            </div>
              );
            })()}
          </div>

          {/* Safety Margin Notice */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-blue-300 font-semibold mb-1">Veilige Marge</h4>
                <p className="text-blue-200 text-sm">
                  Het is begrijpelijk dat je niet altijd precies uitkomt op je dagelijkse calorieën. 
                  Een marge van <span className="font-semibold">±200 kcal</span> is veilig en realistisch. 
                  Focus op consistentie over perfectie!
                </p>
              </div>
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
                        <div className="text-lg font-semibold text-gray-500">Koolhydraten 0g</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-500">Vet 0g</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            const mealKey = `${selectedDay}-${mealType}`;
            const isModified = modifiedMeals.has(mealKey);

            return (
              <div key={mealType} className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 relative">
                {/* Modified Label */}
                {isModified && (
                  <div className="absolute -top-2 -left-2 transform -rotate-12">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-lg shadow-lg text-xs font-bold">
                      ✏️ Aangepast
                    </div>
                  </div>
                )}
                
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
                    <div className="text-lg font-semibold text-white">Koolhydraten {'nutrition' in meal ? meal.nutrition.carbs : meal.carbs}g</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">Vet {'nutrition' in meal ? meal.nutrition.fat : meal.fat}g</div>
                  </div>
                </div>

                {/* Ingredients Table */}
                {'ingredients' in meal && meal.ingredients && meal.ingredients.length > 0 && (
                  <div className="mb-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#3A4D23]">
                            <th className="text-left py-2 text-gray-300">Ingrediënt</th>
                            <th className="text-center py-2 text-gray-300">Aantal</th>
                            <th className="text-center py-2 text-gray-300">Eenheid</th>
                            <th className="text-center py-2 text-gray-300">Kcal</th>
                            <th className="text-center py-2 text-gray-300">Eiwit</th>
                            <th className="text-center py-2 text-gray-300">Koolhydraten</th>
                            <th className="text-center py-2 text-gray-300">Vet</th>
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
                              <td className="py-3 text-center text-gray-300">
                                {ingredient.unit === 'per_100g' ? 'g' :
                                 ingredient.unit === 'per_piece' ? 'stuk' :
                                 ingredient.unit === 'per_ml' ? 'ml' :
                                 ingredient.unit === 'per_tbsp' ? 'eetlepel' :
                                 ingredient.unit === 'per_tsp' ? 'theelepel' :
                                 ingredient.unit === 'per_cup' ? 'kop' :
                                 'g'}
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* Meal Edit Modal */}
      {editingMeal && (
        <MealEditModal
          isOpen={!!editingMeal}
          onClose={() => setEditingMeal(null)}
          day={editingMeal.day}
          mealType={editingMeal.meal}
          currentIngredients={getMealData(editingMeal.day, editingMeal.meal)?.ingredients || []}
          onSave={handleSaveMeal}
        />
      )}
    </div>
  );
}
