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
  ontbijt_snack?: Meal; // Optional morning snack
  lunch_snack?: Meal; // Optional lunch snack
  diner_snack?: Meal; // Optional evening snack
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
  diner: 'Diner',
  ontbijt_snack: 'Ochtend Snack',
  lunch_snack: 'Lunch Snack',
  diner_snack: 'Avond Snack'
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

  const handleSaveMeal = async (ingredients: MealIngredient[], closeModal: boolean = false) => {
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
      
      ['ontbijt', 'lunch', 'diner', 'ontbijt_snack', 'lunch_snack', 'diner_snack'].forEach(mealType => {
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
      setHasUnsavedChanges(true);
      
      // Auto-save the plan immediately
      await savePlanToDatabase(updatedPlanData);
      
      // Only close modal if explicitly requested (manual save button)
      if (closeModal) {
        setEditingMeal(null);
        toast.success('Maaltijd aangepast en opgeslagen!');
      } else {
        toast.success('Wijzigingen automatisch opgeslagen!');
      }
      
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('Fout bij opslaan van maaltijd');
    }
  };

  const calculateMealNutrition = (ingredients: MealIngredient[]) => {
    // Use the same comprehensive ingredient database as MealEditor
    const INGREDIENT_DATABASE = {
      // Carnivoor ingrediënten
      'Eieren': { calories: 155, protein: 13, carbs: 1, fat: 11 },
      'Ei': { calories: 155, protein: 13, carbs: 1, fat: 11 },
      'Spek': { calories: 541, protein: 37, carbs: 0, fat: 42 },
      'Rundvlees': { calories: 250, protein: 26, carbs: 0, fat: 15 },
      'Boter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
      'Zalm': { calories: 208, protein: 25, carbs: 0, fat: 12 },
      'Ham': { calories: 145, protein: 21, carbs: 0, fat: 6 },
      'Kipfilet': { calories: 165, protein: 31, carbs: 0, fat: 4 },
      'Kipfilet (Stukjes)': { calories: 165, protein: 31, carbs: 0, fat: 4 },
      'Varkensvlees': { calories: 242, protein: 27, carbs: 0, fat: 14 },
      'Tonijn': { calories: 144, protein: 30, carbs: 0, fat: 1 },
      'Tonijn (Blikje)': { calories: 144, protein: 30, carbs: 0, fat: 1 },
      'Olijfolie': { calories: 884, protein: 0, carbs: 0, fat: 100 },
      'Biefstuk': { calories: 250, protein: 26, carbs: 0, fat: 15 },
      'Salami': { calories: 336, protein: 20, carbs: 0, fat: 28 },
      'Makreel': { calories: 205, protein: 19, carbs: 0, fat: 14 },
      'Lamsvlees': { calories: 294, protein: 25, carbs: 0, fat: 21 },
      'Bacon': { calories: 541, protein: 37, carbs: 0, fat: 42 },
      'Chorizo': { calories: 455, protein: 24, carbs: 2, fat: 38 },
      'Sardines': { calories: 208, protein: 25, carbs: 0, fat: 11 },
      'Ossenhaas': { calories: 258, protein: 26, carbs: 0, fat: 16 },
      'Kabeljauw': { calories: 82, protein: 18, carbs: 0, fat: 1 },
      'Entrecote': { calories: 250, protein: 26, carbs: 0, fat: 15 },
      'Rookworst': { calories: 300, protein: 20, carbs: 0, fat: 25 },
      'Garnalen': { calories: 106, protein: 20, carbs: 1, fat: 2 },
      'Ribeye': { calories: 250, protein: 26, carbs: 0, fat: 15 },

      // Voedingsplan op maat ingrediënten
      'Havermout': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
      'Banaan': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      'Amandelen': { calories: 579, protein: 21, carbs: 22, fat: 50 },
      'Melk': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
      'Volkoren brood': { calories: 247, protein: 13, carbs: 41, fat: 4 },
      'Avocado': { calories: 160, protein: 2, carbs: 9, fat: 15 },
      'Tomaat': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
      'Bruine rijst': { calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
      'Broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
      'Griekse yoghurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
      'Blauwe bessen': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
      'Walnoten': { calories: 654, protein: 15, carbs: 14, fat: 65 },
      'Honing': { calories: 304, protein: 0.3, carbs: 82, fat: 0 },
      'Quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9 },
      'Kikkererwten': { calories: 164, protein: 8, carbs: 27, fat: 2.6 },
      'Komkommer': { calories: 16, protein: 0.7, carbs: 4, fat: 0.1 },
      'Zoete aardappel': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
      'Spinazie': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
      'Volkoren toast': { calories: 247, protein: 13, carbs: 41, fat: 4 },
      'Feta kaas': { calories: 264, protein: 14, carbs: 4, fat: 21 },
      'Wraptortilla': { calories: 218, protein: 6, carbs: 36, fat: 6 },
      'Kalkoen': { calories: 135, protein: 30, carbs: 0, fat: 1 },
      'Hummus': { calories: 166, protein: 8, carbs: 14, fat: 10 },
      'Paprika': { calories: 31, protein: 1, carbs: 7, fat: 0.3 },
      'Aardappel': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
      'Courgette': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
      'Kruidenolie': { calories: 884, protein: 0, carbs: 0, fat: 100 },
      'Smoothie bowl': { calories: 150, protein: 4, carbs: 30, fat: 3 },
      'Mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
      'Chiazaad': { calories: 486, protein: 17, carbs: 42, fat: 31 },
      'Kokosmelk': { calories: 230, protein: 2.3, carbs: 6, fat: 24 },
      'Volkoren pasta': { calories: 124, protein: 5, carbs: 25, fat: 1.1 },
      'Cherrytomaatjes': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
      'Basilicum pesto': { calories: 263, protein: 5, carbs: 4, fat: 25 },
      'Bulgur': { calories: 83, protein: 3, carbs: 19, fat: 0.2 },
      'Aubergine': { calories: 25, protein: 1, carbs: 6, fat: 0.2 },
      'Tahini': { calories: 595, protein: 17, carbs: 21, fat: 54 },
      'Pannenkoek': { calories: 227, protein: 6, carbs: 28, fat: 10 },
      'Aardbeien': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3 },
      'Ricotta': { calories: 174, protein: 11, carbs: 3, fat: 13 },
      'Ahornstroop': { calories: 260, protein: 0, carbs: 67, fat: 0.2 },
      'Salade bowl': { calories: 50, protein: 2, carbs: 10, fat: 1 },
      'Gegrilde kip': { calories: 165, protein: 31, carbs: 0, fat: 4 },
      'Rode bonen': { calories: 127, protein: 9, carbs: 23, fat: 0.5 },
      'Avocado dressing': { calories: 160, protein: 1, carbs: 3, fat: 16 },
      'Geroosterde groenten': { calories: 35, protein: 1.5, carbs: 7, fat: 0.5 },
      'Volkoren couscous': { calories: 112, protein: 3.8, carbs: 23, fat: 0.2 },
      'Rozemarijn olie': { calories: 884, protein: 0, carbs: 0, fat: 100 },
      'French toast': { calories: 200, protein: 6, carbs: 25, fat: 8 },
      'Kiwi': { calories: 61, protein: 1.1, carbs: 15, fat: 0.5 },
      'Gebroken lijnzaad': { calories: 534, protein: 18, carbs: 29, fat: 42 },
      'Sushi bowl': { calories: 250, protein: 12, carbs: 40, fat: 5 },
      'Zalm sashimi': { calories: 208, protein: 25, carbs: 0, fat: 12 },
      'Sushi rijst': { calories: 130, protein: 2.4, carbs: 29, fat: 0.2 },
      'Edamame': { calories: 121, protein: 11, carbs: 8, fat: 5 },
      'Lamsbout': { calories: 294, protein: 25, carbs: 0, fat: 21 },
      'Mediterrane groenten': { calories: 35, protein: 1.5, carbs: 7, fat: 0.5 },
      'Wilde rijst': { calories: 101, protein: 4, carbs: 21, fat: 0.3 },
      'Harissa': { calories: 70, protein: 3, carbs: 14, fat: 1 },
      'Weekend omelet': { calories: 200, protein: 15, carbs: 2, fat: 15 },
      'Champignons': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
      'Geitenkaas': { calories: 364, protein: 22, carbs: 0.1, fat: 30 },
      'Burger': { calories: 250, protein: 20, carbs: 20, fat: 12 },
      'Volkoren broodje': { calories: 247, protein: 13, carbs: 41, fat: 4 },
      'Lentils burger': { calories: 180, protein: 15, carbs: 20, fat: 6 },
      'Zoete aardappel friet': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
      'Zeebaars': { calories: 97, protein: 18, carbs: 0, fat: 2.5 },
      'Risotto': { calories: 130, protein: 2.4, carbs: 29, fat: 0.2 },
      'Asperges': { calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1 },
      'Truffelolie': { calories: 884, protein: 0, carbs: 0, fat: 100 }
    };

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    ingredients.forEach(ingredient => {
      const nutritionData = INGREDIENT_DATABASE[ingredient.name];
      if (nutritionData) {
        let multiplier = 0;
        
        if (ingredient.unit === 'stuks' || ingredient.unit === 'portie' || ingredient.unit === 'sneden') {
          multiplier = ingredient.amount;
        } else if (ingredient.unit === 'handje') {
          multiplier = ingredient.amount;
        } else if (ingredient.unit === 'ml') {
          multiplier = ingredient.amount / 100;
        } else {
          // gram
          multiplier = ingredient.amount / 100;
        }
        
        console.log(`🍽️ DynamicPlanView calculating nutrition for ${ingredient.name}:`, {
          amount: ingredient.amount,
          unit: ingredient.unit,
          multiplier,
          baseNutrition: nutritionData,
          calculated: {
            calories: nutritionData.calories * multiplier,
            protein: nutritionData.protein * multiplier,
            carbs: nutritionData.carbs * multiplier,
            fat: nutritionData.fat * multiplier
          }
        });
        
        totalCalories += nutritionData.calories * multiplier;
        totalProtein += nutritionData.protein * multiplier;
        totalCarbs += nutritionData.carbs * multiplier;
        totalFat += nutritionData.fat * multiplier;
      } else {
        console.warn(`⚠️ DynamicPlanView: Nutrition data not found for ingredient: ${ingredient.name}`);
      }
    });
    
    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10
    };
  };

  const savePlanToDatabase = async (planDataToSave: any) => {
    try {
      console.log('💾 Auto-saving customized plan for user:', userId);
      
      const response = await fetch('/api/nutrition-plan-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planId,
          customizedPlan: planDataToSave
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save plan');
      }

      const data = await response.json();
      
      if (data.success) {
        setHasUnsavedChanges(false);
        return true;
      } else {
        throw new Error(data.error || 'Failed to save plan');
      }
    } catch (error: any) {
      console.error('Error auto-saving plan:', error);
      return false;
    }
  };

  const handleSavePlan = async () => {
    if (!planData || !hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      const success = await savePlanToDatabase(planData);
      if (success) {
        toast.success('🎉 Je aangepaste voedingsplan is opgeslagen!');
      } else {
        toast.error('Fout bij opslaan van voedingsplan');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectPlan = async () => {
    console.log('🔍 handleSelectPlan called');
    console.log('🔍 planData:', planData);
    console.log('🔍 userId:', userId);
    console.log('🔍 planId:', planId);
    
    if (!planData) {
      console.error('❌ No planData available');
      toast.error('Geen plan data beschikbaar');
      return;
    }
    
    try {
      console.log('🎯 Selecting plan for user:', userId, 'plan:', planId);
      
      // First, save the current plan data (including any modifications) to the database
      console.log('💾 Saving current plan data before selection...');
      
      const saveResponse = await fetch('/api/nutrition-plan-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planId: planData.planId,
          customizedPlan: planData // Save the entire current plan data
        }),
      });

      console.log('💾 Save response status:', saveResponse.status);
      console.log('💾 Save response ok:', saveResponse.ok);

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error('❌ Save response error:', errorText);
        throw new Error(`Failed to save plan data: ${saveResponse.status}`);
      }

      const saveResult = await saveResponse.json();
      console.log('💾 Save result:', saveResult);
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save plan data');
      }
      
      console.log('✅ Plan data saved successfully');
      
      // Then, select the plan as active
      console.log('🎯 Selecting plan as active...');
      const selectResponse = await fetch('/api/nutrition-plan-select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planId: planData.planId
        }),
      });

      console.log('🎯 Select response status:', selectResponse.status);
      console.log('🎯 Select response ok:', selectResponse.ok);

      if (!selectResponse.ok) {
        const errorText = await selectResponse.text();
        console.error('❌ Select response error:', errorText);
        throw new Error(`Failed to select plan: ${selectResponse.status}`);
      }

      const selectResult = await selectResponse.json();
      console.log('🎯 Select result:', selectResult);
      
      if (selectResult.success) {
        toast.success(`🎉 ${planData.planName} is nu je actieve voedingsplan!`);
        setHasUnsavedChanges(false); // Mark as saved
        // Go back to overview immediately to show the updated selection
        console.log('✅ Plan selected successfully, calling onBack() to return to overview');
        onBack();
      } else {
        throw new Error(selectResult.error || 'Failed to select plan');
      }
      
    } catch (error) {
      console.error('❌ Error selecting plan:', error);
      toast.error(`Fout bij selecteren van plan: ${error.message}`);
    }
  };

  const handleRestorePlan = async () => {
    if (!planData) return;
    
    try {
      console.log('🔄 Restoring original plan for user:', userId, 'plan:', planId);
      
      // Delete the customized plan data to restore to original
      const deleteResponse = await fetch('/api/nutrition-plan-save', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planId: planData.planId
        }),
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to restore plan');
      }

      const deleteResult = await deleteResponse.json();
      
      if (deleteResult.success) {
        toast.success('Plan hersteld naar originele versie!');
        // Reload the plan to show the original version
        await fetchDynamicPlan();
        setHasUnsavedChanges(false);
      } else {
        throw new Error(deleteResult.error || 'Failed to restore plan');
      }
      
    } catch (error) {
      console.error('Error restoring plan:', error);
      toast.error('Fout bij herstellen van plan');
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
          {/* Restore Plan Button */}
          <button
            onClick={handleRestorePlan}
            className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            🔄 Herstel plan
          </button>
          
          {/* Select Plan Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔍 Button clicked!');
              handleSelectPlan();
            }}
            disabled={!planData}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-semibold ${
              planData 
                ? 'bg-[#8BAE5A] text-[#232D1A] hover:bg-[#B6C948] cursor-pointer' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            🎯 Selecteer dit plan
          </button>
          
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
          {['ontbijt', 'lunch', 'diner'].map((mealType) => {
            const meal = selectedDayPlan[mealType];
            const snackType = `${mealType}_snack` as keyof DayPlan;
            const snack = selectedDayPlan[snackType];
            
            return (
              <div key={mealType} className="space-y-4">
                {/* Main Meal */}
                <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white flex items-center">
                      <ClockIcon className="w-5 h-5 text-[#8BAE5A] mr-2" />
                      {MEAL_TYPES_NL[mealType as keyof typeof MEAL_TYPES_NL]}
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

                {/* Snack for this meal */}
                {snack && snack.ingredients.length > 0 ? (
                  <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] ml-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-white flex items-center">
                        <ClockIcon className="w-5 h-5 text-[#8BAE5A] mr-2" />
                        {MEAL_TYPES_NL[snackType as keyof typeof MEAL_TYPES_NL]}
                        <span className="ml-4 text-sm text-gray-400">
                          {snack.nutrition.calories} kcal
                        </span>
                      </h4>
                      <button
                        onClick={() => handleEditMeal(selectedDay, snackType)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors text-sm font-semibold"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Bewerken
                      </button>
                    </div>
                    
                    {/* Snack Ingredients */}
                    <div className="space-y-3 mb-4">
                      {snack.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center justify-between bg-[#181F17] rounded-lg p-3">
                          <span className="text-white font-medium">{ingredient.name}</span>
                          <span className="text-[#8BAE5A] font-semibold">
                            {formatAmount(ingredient.amount, ingredient.unit)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Snack nutrition */}
                    <div className="grid grid-cols-4 gap-3 text-sm">
                      <div className="text-center">
                        <p className="text-gray-400">Kcal</p>
                        <p className="text-white font-semibold">{snack.nutrition.calories}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Eiwit</p>
                        <p className="text-white font-semibold">{snack.nutrition.protein}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">KH</p>
                        <p className="text-white font-semibold">{snack.nutrition.carbs}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Vet</p>
                        <p className="text-white font-semibold">{snack.nutrition.fat}g</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Add Snack Button */
                  <div className="bg-[#232D1A] rounded-2xl p-4 border-2 border-dashed border-[#3A4D23] hover:border-[#8BAE5A]/50 transition-colors ml-4">
                    <div className="text-center">
                      <button
                        onClick={() => {
                          // Create empty snack meal
                          const emptySnack = {
                            ingredients: [],
                            nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
                          };
                          
                          // Update plan data
                          const updatedPlanData = { ...planData };
                          updatedPlanData.weekPlan[selectedDay][snackType] = emptySnack;
                          setPlanData(updatedPlanData);
                          
                          // Open meal editor
                          handleEditMeal(selectedDay, snackType);
                        }}
                        className="px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold text-sm"
                      >
                        + {MEAL_TYPES_NL[snackType as keyof typeof MEAL_TYPES_NL]} toevoegen
                      </button>
                    </div>
                  </div>
                )}
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
