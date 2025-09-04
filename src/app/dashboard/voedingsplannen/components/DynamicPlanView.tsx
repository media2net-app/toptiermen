"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import MealEditor from './MealEditor';

interface DynamicPlanViewProps {
  planId: string;
  planName: string;
  userId: string;
  onBack: () => void;
}

interface MealIngredient {
  name: string;
  amount: number;
  unit: string;
  baseAmount: number;
}

interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  ingredients: MealIngredient[];
  nutrition: MealNutrition;
}

interface DayPlan {
  ontbijt: Meal;
  lunch: Meal;
  diner: Meal;
  dailyTotals: MealNutrition;
}

interface PlanData {
  planId: string;
  planName: string;
  userProfile: {
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    age: number;
    weight: number;
    height: number;
    goal: string;
  };
  scalingInfo: {
    basePlanCalories: number;
    scaleFactor: number;
    targetCalories: number;
  };
  weekPlan: Record<string, DayPlan>;
  weeklyAverages: MealNutrition;
  generatedAt: string;
}

const DAYS_NL = {
  monday: 'Maandag',
  tuesday: 'Dinsdag', 
  wednesday: 'Woensdag',
  thursday: 'Donderdag',
  friday: 'Vrijdag',
  saturday: 'Zaterdag',
  sunday: 'Zondag'
};

const MEAL_TYPES_NL = {
  ontbijt: 'Ontbijt',
  lunch: 'Lunch',
  diner: 'Diner'
};

export default function DynamicPlanView({ planId, planName, userId, onBack }: DynamicPlanViewProps) {
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [editingMeal, setEditingMeal] = useState<{
    day: string;
    mealType: string;
    ingredients: MealIngredient[];
    nutrition: MealNutrition;
  } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDynamicPlan();
  }, [planId, userId]);

  const fetchDynamicPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching dynamic plan:', { planId, userId });
      
      // First check if user has a customized plan
      const customizedResponse = await fetch(`/api/nutrition-plan-save?planId=${planId}&userId=${userId}`);
      
      if (customizedResponse.ok) {
        const customizedData = await customizedResponse.json();
        
        if (customizedData.success && customizedData.hasCustomizedPlan) {
          console.log('📋 Found customized plan, loading...');
          setPlanData(customizedData.customizedPlan);
          setHasUnsavedChanges(false); // It's saved
          console.log('✅ Customized plan loaded');
          setLoading(false);
          return;
        }
      }
      
      // If no customized plan, load the default dynamic plan
      console.log('🆕 No customized plan found, loading default dynamic plan');
      
      const response = await fetch(`/api/nutrition-plan-dynamic-v2?planId=${planId}&userId=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dynamic plan');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPlanData(data.data);
        setHasUnsavedChanges(false); // Fresh plan, no changes yet
        console.log('✅ Dynamic plan loaded:', data.data);
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

  const formatAmount = (amount: number, unit: string) => {
    if (unit === 'stuks') {
      return `${amount} ${unit}`;
    } else if (unit === 'handje') {
      return `${amount} ${unit}`;
    } else {
      return `${amount}${unit}`;
    }
  };

  const handleEditMeal = (day: string, mealType: string) => {
    if (!planData?.weekPlan[day]?.[mealType]) return;
    
    const meal = planData.weekPlan[day][mealType];
    setEditingMeal({
      day,
      mealType,
      ingredients: meal.ingredients,
      nutrition: meal.nutrition
    });
  };

  const handleSaveMeal = async (ingredients: MealIngredient[]) => {
    if (!editingMeal || !planData) return;

    try {
      // Calculate new nutrition for the updated ingredients
      const newNutrition = calculateMealNutrition(ingredients);
      
      // Update the plan data locally
      const updatedPlanData = { ...planData };
      const dayPlan = updatedPlanData.weekPlan[editingMeal.day];
      
      // Update the specific meal
      dayPlan[editingMeal.mealType] = {
        ingredients,
        nutrition: newNutrition
      };
      
      // Recalculate daily totals
      let dailyCalories = 0;
      let dailyProtein = 0;
      let dailyCarbs = 0;
      let dailyFat = 0;
      
      ['ontbijt', 'lunch', 'diner'].forEach(mealType => {
        const meal = dayPlan[mealType];
        if (meal) {
          dailyCalories += meal.nutrition.calories;
          dailyProtein += meal.nutrition.protein;
          dailyCarbs += meal.nutrition.carbs;
          dailyFat += meal.nutrition.fat;
        }
      });
      
      dayPlan.dailyTotals = {
        calories: Math.round(dailyCalories),
        protein: Math.round(dailyProtein * 10) / 10,
        carbs: Math.round(dailyCarbs * 10) / 10,
        fat: Math.round(dailyFat * 10) / 10
      };
      
      // Recalculate weekly averages
      const days = Object.keys(updatedPlanData.weekPlan);
      let weeklyCalories = 0;
      let weeklyProtein = 0;
      let weeklyCarbs = 0;
      let weeklyFat = 0;
      
      days.forEach(day => {
        const dailyTotals = updatedPlanData.weekPlan[day].dailyTotals;
        weeklyCalories += dailyTotals.calories;
        weeklyProtein += dailyTotals.protein;
        weeklyCarbs += dailyTotals.carbs;
        weeklyFat += dailyTotals.fat;
      });
      
      updatedPlanData.weeklyAverages = {
        calories: Math.round(weeklyCalories / 7),
        protein: Math.round((weeklyProtein / 7) * 10) / 10,
        carbs: Math.round((weeklyCarbs / 7) * 10) / 10,
        fat: Math.round((weeklyFat / 7) * 10) / 10
      };
      
      setPlanData(updatedPlanData);
      setEditingMeal(null);
      setHasUnsavedChanges(true);
      
      toast.success('Maaltijd aangepast! Vergeet niet op te slaan.');
      
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('Fout bij opslaan van maaltijd');
    }
  };

  const calculateMealNutrition = (ingredients: MealIngredient[]) => {
    // Same logic as in the API
    const CARNIVOOR_INGREDIENTS = {
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

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    ingredients.forEach(ingredient => {
      const nutritionData = CARNIVOOR_INGREDIENTS[ingredient.name];
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

  const handleSavePlan = async () => {
    if (!planData || !hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      console.log('💾 Saving customized plan for user:', userId);
      
      const response = await fetch('/api/nutrition-plan-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planId,
          customizedPlan: planData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save plan');
      }

      const data = await response.json();
      
      if (data.success) {
        setHasUnsavedChanges(false);
        toast.success('🎉 Je aangepaste voedingsplan is opgeslagen!');
      } else {
        throw new Error(data.error || 'Failed to save plan');
      }
      
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Fout bij opslaan van voedingsplan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectPlan = async () => {
    if (!planData) return;
    
    try {
      console.log('🎯 Selecting plan for user:', userId, 'plan:', planId);
      
      const response = await fetch('/api/nutrition-plan-select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planId: planData.planId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to select plan');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(`🎉 ${planData.planName} is nu je actieve voedingsplan!`);
        // Optionally go back to overview to show the updated selection
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to select plan');
      }
      
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast.error('Fout bij selecteren van plan');
    }
  };

  const getCalorieWarning = (dailyCalories: number, targetCalories: number) => {
    const difference = dailyCalories - targetCalories;
    const absoDifference = Math.abs(difference);
    
    if (absoDifference >= 200) {
      if (difference > 0) {
        return {
          type: 'warning',
          message: `⚠️ Je zit ${absoDifference} kcal BOVEN je dagelijkse behoefte! Dit kan leiden tot gewichtstoename.`,
          color: 'text-orange-400 bg-orange-900/30 border-orange-500/50'
        };
      } else {
        return {
          type: 'warning', 
          message: `⚠️ Je zit ${absoDifference} kcal ONDER je dagelijkse behoefte! Dit kan leiden tot extreme gewichtsverlies.`,
          color: 'text-red-400 bg-red-900/30 border-red-500/50'
        };
      }
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-[#8BAE5A] hover:text-[#B6C948] transition-colors mr-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Terug naar overzicht
          </button>
        </div>
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-gray-300">Voedingsplan laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-[#8BAE5A] hover:text-[#B6C948] transition-colors mr-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Terug naar overzicht
          </button>
        </div>
        
        <div className="text-center py-12 text-red-500">
          <p className="text-lg font-semibold mb-2">Fout bij laden voedingsplan</p>
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={fetchDynamicPlan}
            className="mt-4 px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  if (!planData) {
    return null;
  }

  const selectedDayPlan = planData.weekPlan[selectedDay];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-[#8BAE5A] hover:text-[#B6C948] transition-colors mr-6"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Terug naar overzicht
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{planData.planName}</h1>
            <p className="text-gray-300">
              Gepersonaliseerd voor {planData.userProfile.weight}kg, {planData.userProfile.age} jaar - {planData.userProfile.goal}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Select Plan Button */}
          <button
            onClick={handleSelectPlan}
            className="flex items-center gap-2 px-6 py-3 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors font-semibold"
          >
            🎯 Selecteer dit plan
          </button>
          
          {/* Save Button */}
          {hasUnsavedChanges && (
            <button
              onClick={handleSavePlan}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#232D1A]"></div>
                  Opslaan...
                </>
              ) : (
                <>
                  💾 Plan Opslaan
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* User Daily Needs */}
      <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] mb-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 text-[#8BAE5A] mr-2" />
          Jouw Dagelijkse Behoefte
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-[#181F17] rounded-lg p-4 text-center">
            <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Calorieën</h4>
            <p className="text-2xl font-bold text-white">{planData.userProfile.targetCalories}</p>
            <p className="text-xs text-gray-400">per dag</p>
          </div>
          <div className="bg-[#181F17] rounded-lg p-4 text-center">
            <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Eiwitten</h4>
            <p className="text-2xl font-bold text-white">{planData.userProfile.targetProtein}g</p>
            <p className="text-xs text-gray-400">per dag</p>
          </div>
          <div className="bg-[#181F17] rounded-lg p-4 text-center">
            <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Koolhydraten</h4>
            <p className="text-2xl font-bold text-white">{planData.userProfile.targetCarbs}g</p>
            <p className="text-xs text-gray-400">per dag</p>
          </div>
          <div className="bg-[#181F17] rounded-lg p-4 text-center">
            <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Vetten</h4>
            <p className="text-2xl font-bold text-white">{planData.userProfile.targetFat}g</p>
            <p className="text-xs text-gray-400">per dag</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-400">
            Doel: <span className="text-[#8BAE5A] font-semibold capitalize">{planData.userProfile.goal}</span>
            {planData.userProfile.weight && planData.userProfile.age && (
              <> • {planData.userProfile.weight}kg • {planData.userProfile.age} jaar</>
            )}
          </span>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] mb-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 text-[#8BAE5A] mr-2" />
          Weekgemiddelde
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-[#181F17] rounded-lg p-4 text-center">
            <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Calorieën</h4>
            <p className="text-2xl font-bold text-white">{planData.weeklyAverages.calories}</p>
            <p className="text-xs text-gray-400">per dag</p>
          </div>
          <div className="bg-[#181F17] rounded-lg p-4 text-center">
            <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Eiwitten</h4>
            <p className="text-2xl font-bold text-white">{planData.weeklyAverages.protein}g</p>
            <p className="text-xs text-gray-400">per dag</p>
          </div>
          <div className="bg-[#181F17] rounded-lg p-4 text-center">
            <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Koolhydraten</h4>
            <p className="text-2xl font-bold text-white">{planData.weeklyAverages.carbs}g</p>
            <p className="text-xs text-gray-400">per dag</p>
          </div>
          <div className="bg-[#181F17] rounded-lg p-4 text-center">
            <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Vetten</h4>
            <p className="text-2xl font-bold text-white">{planData.weeklyAverages.fat}g</p>
            <p className="text-xs text-gray-400">per dag</p>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] mb-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <CalendarDaysIcon className="w-6 h-6 text-[#8BAE5A] mr-2" />
          Kies een dag
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(DAYS_NL).map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDay === day
                  ? 'bg-[#8BAE5A] text-[#232D1A]'
                  : 'bg-[#181F17] text-gray-300 hover:bg-[#3A4D23]'
              }`}
            >
              {DAYS_NL[day]}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Plan */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Day Totals */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <h3 className="text-xl font-bold text-white mb-4">
              {DAYS_NL[selectedDay]} - Dagtotalen
            </h3>
            
            {/* Calorie Warning */}
            {(() => {
              const warning = getCalorieWarning(selectedDayPlan.dailyTotals.calories, planData.userProfile.targetCalories);
              if (warning) {
                return (
                  <div className={`mb-4 p-4 rounded-lg border-2 ${warning.color}`}>
                    <p className="font-semibold text-sm">{warning.message}</p>
                    <p className="text-xs mt-1 opacity-80">
                      Doel: {planData.userProfile.targetCalories} kcal • Huidig: {selectedDayPlan.dailyTotals.calories} kcal
                    </p>
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-[#181F17] rounded-lg p-4 text-center">
                <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Calorieën</h4>
                <p className="text-xl font-bold text-white">{selectedDayPlan.dailyTotals.calories}</p>
                <p className="text-xs text-gray-400">Doel: {planData.userProfile.targetCalories}</p>
              </div>
              <div className="bg-[#181F17] rounded-lg p-4 text-center">
                <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Eiwitten</h4>
                <p className="text-xl font-bold text-white">{selectedDayPlan.dailyTotals.protein}g</p>
              </div>
              <div className="bg-[#181F17] rounded-lg p-4 text-center">
                <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Koolhydraten</h4>
                <p className="text-xl font-bold text-white">{selectedDayPlan.dailyTotals.carbs}g</p>
              </div>
              <div className="bg-[#181F17] rounded-lg p-4 text-center">
                <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Vetten</h4>
                <p className="text-xl font-bold text-white">{selectedDayPlan.dailyTotals.fat}g</p>
              </div>
            </div>
          </div>

          {/* Meals */}
          {Object.entries(MEAL_TYPES_NL).map(([mealType, mealName]) => {
            const meal = selectedDayPlan[mealType];
            
            return (
              <div key={mealType} className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white flex items-center">
                    <ClockIcon className="w-5 h-5 text-[#8BAE5A] mr-2" />
                    {mealName}
                    <span className="ml-4 text-sm text-gray-400">
                      {meal.nutrition.calories} kcal
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
                
                {/* Ingredients */}
                <div className="space-y-3 mb-4">
                  {meal.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#181F17] rounded-lg p-3">
                      <span className="text-white font-medium">{ingredient.name}</span>
                      <span className="text-[#8BAE5A] font-semibold">
                        {formatAmount(ingredient.amount, ingredient.unit)}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Meal nutrition */}
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">Kcal</p>
                    <p className="text-white font-semibold">{meal.nutrition.calories}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Eiwit</p>
                    <p className="text-white font-semibold">{meal.nutrition.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">KH</p>
                    <p className="text-white font-semibold">{meal.nutrition.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Vet</p>
                    <p className="text-white font-semibold">{meal.nutrition.fat}g</p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Meal Editor Modal */}
      {editingMeal && (
        <MealEditor
          isOpen={!!editingMeal}
          onClose={() => setEditingMeal(null)}
          mealType={editingMeal.mealType}
          day={editingMeal.day}
          ingredients={editingMeal.ingredients}
          nutrition={editingMeal.nutrition}
          onSave={handleSaveMeal}
          planType="carnivoor"
        />
      )}
    </div>
  );
}
