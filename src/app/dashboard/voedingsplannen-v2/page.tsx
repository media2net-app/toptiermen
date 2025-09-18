'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { useRouter } from 'next/navigation';
import OnboardingV2Progress from '@/components/OnboardingV2Progress';
import { motion } from 'framer-motion';
import { 
  BookOpenIcon, 
  RocketLaunchIcon, 
  ChartBarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  FireIcon,
  HeartIcon
} from '@heroicons/react/24/solid';
import { PencilIcon } from '@heroicons/react/24/outline';
import IngredientEditModal from '@/components/IngredientEditModal';

interface NutritionPlan {
  id: string | number;
  plan_id?: string;
  name: string;
  description: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  goal: string;
  difficulty: string;
  created_at: string;
}

interface OriginalPlanData {
  id: string;
  plan_id: string;
  name: string;
  description: string;
  meals: {
    weekly_plan: {
      [key: string]: {
        ontbijt: any;
        ochtend_snack: any;
        lunch: any;
        lunch_snack: any;
        diner: any;
      };
    };
  };
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
}

interface SmartScalingInfo {
  userWeight: number;
  baseWeight: number;
  scalingFactor: number;
  adjustedCalories: number;
  adjustedProtein: number;
  adjustedCarbs: number;
  adjustedFat: number;
  originalTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  finalTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface UserProfile {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activity_level: 'sedentary' | 'moderate' | 'very_active';
  fitness_goal: 'droogtrainen' | 'onderhoud' | 'spiermassa';
}

export default function VoedingsplannenV2Page() {
  const { user, isAdmin, loading: authLoading } = useSupabaseAuth();
  const { completeStep, currentStep, isCompleted } = useOnboardingV2();
  const router = useRouter();
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [originalPlanData, setOriginalPlanData] = useState<OriginalPlanData | null>(null);
  const [scalingInfo, setScalingInfo] = useState<SmartScalingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingOriginal, setLoadingOriginal] = useState(false);
  const [loadingScaling, setLoadingScaling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOriginalData, setShowOriginalData] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    weight: 100,  // Backend basis plan is 100kg
    height: 180,
    age: 30,
    gender: 'male',
    activity_level: 'moderate',  // Backend basis plan is matig actief
    fitness_goal: 'onderhoud'   // Backend basis plan is onderhoud
  });
  const [showUserProfileForm, setShowUserProfileForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('maandag');
  const [customAmounts, setCustomAmounts] = useState<{[key: string]: number}>({});
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [editingMealType, setEditingMealType] = useState<string>('');
  const [editingDay, setEditingDay] = useState<string>('');

  // Reset modal state when component mounts
  useEffect(() => {
    setShowIngredientModal(false);
    setEditingMealType('');
    setEditingDay('');
  }, []);

  // Reset modal state when no plan is selected
  useEffect(() => {
    if (!selectedPlan) {
      setShowIngredientModal(false);
      setEditingMealType('');
      setEditingDay('');
    }
  }, [selectedPlan]);

  // Debug: Log modal state changes
  useEffect(() => {
    console.log('🔧 DEBUG: Modal state changed:', { showIngredientModal, editingMealType, editingDay });
  }, [showIngredientModal, editingMealType, editingDay]);

  // Days of the week
  const days = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];

  // Function to update custom amounts
  const updateCustomAmount = (ingredientKey: string, amount: number) => {
    // Find the ingredient to check its unit type
    const [day, mealType, ingredientName] = ingredientKey.split('_');
    const mealData = originalPlanData?.meals?.weekly_plan?.[day]?.[mealType];
    const ingredient = mealData?.ingredients?.find((ing: any) => ing.name === ingredientName);
    
    let finalAmount = amount;
    
    // Round to whole numbers for pieces/slices and per_100g
    if (ingredient && (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk' || ingredient.unit === 'per_100g' || ingredient.unit === 'g')) {
      finalAmount = Math.round(amount);
    }
    
    setCustomAmounts(prev => ({
      ...prev,
      [ingredientKey]: finalAmount
    }));
  };

  // Function to get ingredient key for custom amounts
  const getIngredientKey = (mealType: string, ingredientName: string, day: string) => {
    return `${day}_${mealType}_${ingredientName}`;
  };

  // Function to format amount display based on unit type
  const formatAmountDisplay = (amount: number, unit: string) => {
    if (unit === 'per_piece' || unit === 'per_plakje' || unit === 'stuk' || unit === 'per_100g' || unit === 'g') {
      return Math.round(amount).toString();
    }
    return amount.toFixed(1);
  };

  // Function to reset all custom amounts
  const resetAllCustomAmounts = () => {
    setCustomAmounts({});
    console.log('🔄 All custom amounts reset');
  };

  // Function to check if all days have the same structure
  const checkDayConsistency = () => {
    if (!originalPlanData?.meals?.weekly_plan) return;
    
    const days = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    const firstDay = days[0];
    const firstDayData = originalPlanData.meals.weekly_plan[firstDay];
    
    if (!firstDayData) return;
    
    console.log('🔍 Checking day consistency...');
    days.forEach(day => {
      const dayData = originalPlanData.meals.weekly_plan[day];
      if (dayData) {
        const dayTotals = calculateDayTotals(day);
        console.log(`📊 ${day} totals:`, dayTotals);
      }
    });
  };

  // Function to open ingredient edit modal
  const openIngredientModal = (mealType: string, day: string) => {
    console.log('🔧 DEBUG: openIngredientModal called with:', { mealType, day });
    console.log('🔧 DEBUG: Current modal state before change:', { showIngredientModal, editingMealType, editingDay });
    console.log('🔧 DEBUG: Selected plan:', selectedPlan?.name);
    
    // Only open modal if a plan is selected
    if (!selectedPlan) {
      console.log('🔧 DEBUG: No plan selected, cannot open modal');
      return;
    }
    
    // Set all values at once
    setEditingMealType(mealType);
    setEditingDay(day);
    setShowIngredientModal(true);
    
    console.log('🔧 DEBUG: Modal state set to true');
    
    // Debug: Check if modal state is actually set
    setTimeout(() => {
      console.log('🔧 DEBUG: Modal state after timeout:', { showIngredientModal, editingMealType, editingDay });
    }, 100);
  };

  // Function to save edited ingredients
  const saveEditedIngredients = (newIngredients: any[]) => {
    if (!originalPlanData || !editingMealType || !editingDay) return;

    // Update the original plan data with new ingredients
    const updatedPlan = { ...originalPlanData };
    if (updatedPlan.meals?.weekly_plan?.[editingDay]?.[editingMealType]) {
      updatedPlan.meals.weekly_plan[editingDay][editingMealType].ingredients = newIngredients;
      
      // Recalculate meal totals
      const mealTotals = calculateMealTotals(updatedPlan.meals.weekly_plan[editingDay][editingMealType], editingMealType, editingDay);
      updatedPlan.meals.weekly_plan[editingDay][editingMealType].totals = mealTotals;
      
      // Recalculate day totals
      const dayTotals = calculateDayTotals(editingDay, updatedPlan);
      (updatedPlan.meals.weekly_plan[editingDay] as any).dailyTotals = dayTotals;
      
      setOriginalPlanData(updatedPlan);
    }
  };

  // Function to get current ingredients for editing
  const getCurrentIngredients = () => {
    if (!originalPlanData || !editingMealType || !editingDay) return [];
    
    const mealData = originalPlanData.meals?.weekly_plan?.[editingDay]?.[editingMealType];
    return mealData?.ingredients || [];
  };

  // Function to save user profile
  const saveUserProfile = async (profile: UserProfile) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/nutrition-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          age: profile.age,
          height: profile.height,
          weight: profile.weight,
          gender: profile.gender,
          activityLevel: profile.activity_level,
          goal: profile.fitness_goal
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        throw new Error(`${errorData.error || 'Failed to save profile'}${errorData.details ? ` - ${errorData.details}` : ''}`);
      }

      const result = await response.json();
      setUserProfile(profile);
      setShowUserProfileForm(false);
      setError(null); // Clear any previous errors
      console.log('✅ User profile saved:', result);
    } catch (err) {
      console.error('❌ Save profile error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
      setError(errorMessage);
    }
  };

  // Function to calculate personalized targets for a plan
  const calculatePersonalizedTargets = (plan: NutritionPlan | any) => {
    if (!userProfile) return null;

    // Use TTM Formula: weight x 22 x activity_level
    const activityMultipliers = {
      sedentary: 1.1,
      moderate: 1.3,
      very_active: 1.6
    };
    
    const baseCalories = userProfile.weight * 22 * activityMultipliers[userProfile.activity_level];

    // Apply goal adjustment based on the PLAN's goal, not user's fitness goal
    const goalAdjustments = {
      droogtrainen: -500,
      onderhoud: 0,
      spiermassa: 400
    };
    
    // Use the plan's goal for calorie adjustment
    const planGoal = plan.goal?.toLowerCase() || 'onderhoud';
    const goalAdjustment = goalAdjustments[planGoal] || 0;
    const targetCalories = Math.round(baseCalories + goalAdjustment);

    // Calculate macro targets based on plan type and percentages
    const isCarnivore = plan.name.toLowerCase().includes('carnivoor');
    
    let proteinPercentage, carbsPercentage, fatPercentage;
    
    if (isCarnivore) {
      // Carnivore plans: higher protein, lower carbs
      proteinPercentage = 35;
      carbsPercentage = 5;
      fatPercentage = 60;
    } else {
      // Regular plans: balanced macros
      proteinPercentage = 25;
      carbsPercentage = 45;
      fatPercentage = 30;
    }

    const targetProtein = Math.round((targetCalories * proteinPercentage / 100) / 4); // 4 kcal per gram protein
    const targetCarbs = Math.round((targetCalories * carbsPercentage / 100) / 4);     // 4 kcal per gram carbs
    const targetFat = Math.round((targetCalories * fatPercentage / 100) / 9);         // 9 kcal per gram fat

    return {
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat
    };
  };

  // Function to calculate daily totals for selected day
  const calculateDayTotals = (day: string, planData?: any) => {
    const dataToUse = planData || originalPlanData;
    console.log('🧮 Calculating day totals for:', day);
    console.log('🔍 DataToUse available:', !!dataToUse);
    console.log('🔍 Meals available:', !!dataToUse?.meals);
    console.log('🔍 Weekly plan available:', !!dataToUse?.meals?.weekly_plan);
    console.log('🔍 Day data available:', !!dataToUse?.meals?.weekly_plan?.[day]);
    
    if (!dataToUse?.meals?.weekly_plan?.[day]) {
      console.log('❌ No day data found, returning zeros');
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const dayMeals = dataToUse.meals.weekly_plan[day];
    console.log('🔍 Day meals structure:', Object.keys(dayMeals));
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    ['ontbijt', 'ochtend_snack', 'lunch', 'lunch_snack', 'diner', 'avond_snack'].forEach(mealType => {
      const meal = dayMeals[mealType];
      console.log(`🔍 ${mealType}:`, meal ? 'exists' : 'missing', meal?.totals ? 'has totals' : 'no totals');
      
      if (meal?.totals) {
        // Use existing totals if available
        console.log(`📊 ${mealType} totals:`, meal.totals);
        totals.calories += meal.totals.calories || 0;
        totals.protein += meal.totals.protein || 0;
        totals.carbs += meal.totals.carbs || 0;
        totals.fat += meal.totals.fat || 0;
      } else if (meal?.ingredients && Array.isArray(meal.ingredients)) {
        // Calculate totals from individual ingredients
        console.log(`🧮 Calculating ${mealType} from ${meal.ingredients.length} ingredients`);
        let mealTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        
        meal.ingredients.forEach((ingredient: any, index: number) => {
          // Get custom amount or use original amount
          // IMPORTANT: Only apply custom amounts if they exist for this specific day
          const ingredientKey = getIngredientKey(mealType, ingredient.name, day);
          const customAmount = customAmounts[ingredientKey];
          let amount = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
          
          // Round to whole numbers for pieces/slices and per_100g
          if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk' || ingredient.unit === 'per_100g' || ingredient.unit === 'g') {
            amount = Math.round(amount);
          }
          
          console.log(`🔍 Ingredient ${index}:`, {
            name: ingredient.name,
            originalAmount: ingredient.amount,
            customAmount: customAmount,
            finalAmount: amount,
            unit: ingredient.unit,
            hasCustomAmount: customAmount !== undefined,
            calories_per_100g: ingredient.calories_per_100g,
            protein_per_100g: ingredient.protein_per_100g,
            carbs_per_100g: ingredient.carbs_per_100g,
            fat_per_100g: ingredient.fat_per_100g
          });
          
          // Calculate macros based on amount and unit (matching backend logic exactly)
          let multiplier = 1;
          
          // Handle different unit types based on database unit_type (matching backend exactly)
          if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk') {
            multiplier = amount;
          } else if (ingredient.unit === 'per_100g' || ingredient.unit === 'g') {
            multiplier = amount / 100;
          } else if (ingredient.unit === 'per_ml') {
            multiplier = amount / 100; // Assuming 1ml = 1g for liquids
          } else if (ingredient.unit === 'handje') {
            multiplier = amount;
          } else {
            // Default to per 100g calculation
            multiplier = amount / 100;
          }
          
          mealTotals.calories += (ingredient.calories_per_100g || 0) * multiplier;
          mealTotals.protein += (ingredient.protein_per_100g || 0) * multiplier;
          mealTotals.carbs += (ingredient.carbs_per_100g || 0) * multiplier;
          mealTotals.fat += (ingredient.fat_per_100g || 0) * multiplier;
        });
        
        console.log(`📊 ${mealType} calculated totals:`, mealTotals);
        totals.calories += mealTotals.calories;
        totals.protein += mealTotals.protein;
        totals.carbs += mealTotals.carbs;
        totals.fat += mealTotals.fat;
      }
    });

    console.log('📊 Final day totals for', day, ':', totals);
    return totals;
  };

  // Get current day totals - recalculate when customAmounts change
  const currentDayTotals = useMemo(() => {
    if (!originalPlanData) {
      console.log('🔄 No originalPlanData available, returning zeros');
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    console.log('🔄 Recalculating day totals due to customAmounts change');
    return calculateDayTotals(selectedDay);
  }, [selectedDay, customAmounts, originalPlanData]);

  // Function to calculate meal totals
  const calculateMealTotals = (meal: any, mealType?: string, day?: string) => {
    if (!meal?.ingredients || !Array.isArray(meal.ingredients)) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    meal.ingredients.forEach((ingredient: any) => {
      // Get custom amount or use original amount
      let amount = ingredient.amount || 0;
      if (mealType && day) {
        const ingredientKey = getIngredientKey(mealType, ingredient.name, day);
        const customAmount = customAmounts[ingredientKey];
        if (customAmount !== undefined) {
          amount = customAmount;
        }
      }
      
      // Calculate macros based on amount and unit (matching backend logic exactly)
      let multiplier = 1;
      
      // Handle different unit types based on database unit_type (matching backend exactly)
      if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk') {
        multiplier = amount;
      } else if (ingredient.unit === 'per_100g' || ingredient.unit === 'g') {
        multiplier = amount / 100;
      } else if (ingredient.unit === 'per_ml') {
        multiplier = amount / 100; // Assuming 1ml = 1g for liquids
      } else if (ingredient.unit === 'handje') {
        multiplier = amount;
      } else {
        // Default to per 100g calculation
        multiplier = amount / 100;
      }
      
      totals.calories += (ingredient.calories_per_100g || 0) * multiplier;
      totals.protein += (ingredient.protein_per_100g || 0) * multiplier;
      totals.carbs += (ingredient.carbs_per_100g || 0) * multiplier;
      totals.fat += (ingredient.fat_per_100g || 0) * multiplier;
    });

    return totals;
  };

  // Alternative approach: Use macro percentages from backend
  const calculatePersonalizedTargetsWithPercentages = (basePlan: any, targetCalories: number) => {
    // Use macro percentages from backend if available
    if (basePlan.protein_percentage && basePlan.carbs_percentage && basePlan.fat_percentage) {
      const proteinCalories = (targetCalories * basePlan.protein_percentage) / 100;
      const carbsCalories = (targetCalories * basePlan.carbs_percentage) / 100;
      const fatCalories = (targetCalories * basePlan.fat_percentage) / 100;

      const targetProtein = Math.round(proteinCalories / 4); // 4 kcal per gram protein
      const targetCarbs = Math.round(carbsCalories / 4);     // 4 kcal per gram carbs
      const targetFat = Math.round(fatCalories / 9);         // 9 kcal per gram fat

      console.log('🎯 Using macro percentages:', {
        protein_percentage: basePlan.protein_percentage,
        carbs_percentage: basePlan.carbs_percentage,
        fat_percentage: basePlan.fat_percentage,
        targetProtein,
        targetCarbs,
        targetFat
      });

      return {
        targetProtein,
        targetCarbs,
        targetFat
      };
    }

    // Fallback to scaling approach
    return null;
  };


  // Smart Scaling Algorithm with Realistic Constraints
  const applySmartScaling = (planData: any, userProfile: any) => {
    if (!planData || !userProfile || userProfile.weight === 100) {
      // No scaling needed for 100kg users
      return planData;
    }

    console.log('🧠 Applying Realistic Smart Scaling for weight:', userProfile.weight);
    
    const baseWeight = 100;
    const weightRatio = userProfile.weight / baseWeight;
    const scaledPlan = JSON.parse(JSON.stringify(planData)); // Deep clone
    
    // Get personalized targets
    const personalizedTargets = calculatePersonalizedTargets(planData);
    if (!personalizedTargets) return null;
    
    const targetCalories = personalizedTargets.targetCalories;
    const targetProtein = personalizedTargets.targetProtein;
    const targetCarbs = personalizedTargets.targetCarbs;
    const targetFat = personalizedTargets.targetFat;
    
    console.log('🎯 Smart Scaling Targets:', {
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      weightRatio
    });

    // Scale ingredients for each day and meal with realistic constraints
    const days = Object.keys(scaledPlan.meals.weekly_plan);
    console.log(`🧠 Scaling ${days.length} days:`, days);
    
    days.forEach(day => {
      const dayData = scaledPlan.meals.weekly_plan[day];
      console.log(`🧠 Processing day: ${day}`);
      
      ['ontbijt', 'ochtend_snack', 'lunch', 'lunch_snack', 'diner', 'avond_snack'].forEach(mealType => {
        const meal = dayData[mealType];
        if (meal && meal.ingredients && Array.isArray(meal.ingredients)) {
          console.log(`🧠 Processing ${day} ${mealType} with ${meal.ingredients.length} ingredients`);
          
          // Apply realistic scaling based on unit type
          meal.ingredients.forEach((ingredient: any) => {
            if (ingredient.amount && ingredient.unit) {
              const originalAmount = ingredient.amount;
              let newAmount = originalAmount * weightRatio;
              
              // Apply realistic scaling rules
              if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk') {
                // Whole pieces: round to nearest whole number, minimum 1
                newAmount = Math.max(1, Math.round(newAmount));
                console.log(`🧠 ${day} ${ingredient.name}: ${originalAmount} → ${newAmount} ${ingredient.unit} (whole piece)`);
              } else {
                // All other items: round to 1 decimal place
                newAmount = Math.round(newAmount * 10) / 10;
                if (newAmount < 0.1) newAmount = 0.1; // Minimum 0.1
                console.log(`🧠 ${day} ${ingredient.name}: ${originalAmount} → ${newAmount} ${ingredient.unit} (1 decimal)`);
              }
              
              ingredient.amount = newAmount;
            }
          });
          
          // Recalculate meal totals after scaling
          const mealTotals = calculateMealTotals(meal);
          meal.totals = mealTotals;
          console.log(`🧠 ${day} ${mealType} totals after scaling:`, mealTotals);
        }
      });
      
      // Recalculate day totals
      const dayTotals = calculateDayTotals(day, scaledPlan);
      
      if (scaledPlan.meals.weekly_plan[day]) {
        scaledPlan.meals.weekly_plan[day].dailyTotals = dayTotals;
      }
      
      // Fine-tune for better macro balance (focus on fat targets)
      const currentDayTotals = dayTotals;
      const fatPercentage = (currentDayTotals.fat / targetFat) * 100;
      
      console.log(`🧠 Day ${day} fat percentage: ${fatPercentage.toFixed(1)}% (target: 100%)`);
      console.log(`🧠 Day ${day} totals:`, currentDayTotals);
      
      // If fat is too low (< 95%), increase meat/fat-rich ingredients
      if (fatPercentage < 95) {
        console.log(`🧠 Fat too low (${fatPercentage.toFixed(1)}%), fine-tuning meat portions for ${day}...`);
        
        // Calculate how much fat we need to add
        const fatNeeded = targetFat - currentDayTotals.fat;
        console.log(`🧠 Fat needed: ${fatNeeded.toFixed(1)}g`);
        
        ['diner', 'lunch', 'ontbijt', 'ochtend_snack'].forEach(mealType => { // Check all meals
          const meal = dayData[mealType];
          if (meal && meal.ingredients && Array.isArray(meal.ingredients)) {
            console.log(`🧠 Fine-tuning ${day} ${mealType}...`);
            meal.ingredients.forEach((ingredient: any) => {
              // Increase meat and fat-rich ingredients more aggressively
              if (ingredient.unit === 'per_100g' && 
                  (ingredient.name.toLowerCase().includes('vlees') || 
                   ingredient.name.toLowerCase().includes('rund') ||
                   ingredient.name.toLowerCase().includes('kip') ||
                   ingredient.name.toLowerCase().includes('zalm') ||
                   ingredient.name.toLowerCase().includes('olie') ||
                   ingredient.name.toLowerCase().includes('boter') ||
                   ingredient.name.toLowerCase().includes('kaas') ||
                   ingredient.name.toLowerCase().includes('noten'))) {
                const currentAmount = ingredient.amount;
                
                // More aggressive increase based on fat deficit
                let increasePercent = 0.20; // 20% base increase
                if (fatPercentage < 90) increasePercent = 0.30; // 30% if very low
                if (fatPercentage < 85) increasePercent = 0.40; // 40% if extremely low
                
                const increase = Math.max(10, Math.round(currentAmount * increasePercent * 10) / 10); // Round to 1 decimal
                ingredient.amount = Math.round((currentAmount + increase) * 10) / 10; // Round final to 1 decimal
                console.log(`🧠 Increased ${ingredient.name}: ${currentAmount}g → ${ingredient.amount}g for fat balance (+${increasePercent * 100}%)`);
              }
            });
            
            // Recalculate meal totals after fine-tuning
            const mealTotals = calculateMealTotals(meal);
            meal.totals = mealTotals;
            console.log(`🧠 ${day} ${mealType} totals after fine-tuning:`, mealTotals);
          }
        });
        
        // Recalculate day totals after fine-tuning
        const updatedDayTotals = calculateDayTotals(day, scaledPlan);
        
        if (scaledPlan.meals.weekly_plan[day]) {
          scaledPlan.meals.weekly_plan[day].dailyTotals = updatedDayTotals;
        }
        
        const newFatPercentage = (updatedDayTotals.fat / targetFat) * 100;
        console.log(`🧠 After fine-tuning ${day}: ${newFatPercentage.toFixed(1)}% fat (improvement: ${(newFatPercentage - fatPercentage).toFixed(1)}%)`);
      }
    });

    console.log('✅ Realistic Smart Scaling applied');
    
    // Debug: Check if scaling was applied correctly
    console.log('🔍 Post-scaling verification:');
    days.forEach(day => {
      const dayData = scaledPlan.meals.weekly_plan[day];
      if (dayData.ontbijt && dayData.ontbijt.ingredients) {
        const kaasIngredient = dayData.ontbijt.ingredients.find((ing: any) => ing.name === 'Kaas 30+');
        if (kaasIngredient) {
          console.log(`🔍 ${day} Kaas 30+: ${kaasIngredient.amount} plakjes`);
        }
      }
    });
    
    return scaledPlan;
  };

  // Function to calculate progress and color for progress bars
  const getProgressInfo = (current: number, target: number) => {
    if (!target || target === 0) {
      return {
        percentage: 0,
        difference: 0,
        isGood: false,
        color: 'bg-gray-500',
        textColor: 'text-gray-400'
      };
    }
    
    const percentage = (current / target) * 100;
    const difference = current - target;
    const deviation = Math.abs(percentage - 100);
    
    let color = 'bg-red-500';
    let textColor = 'text-red-400';
    let isGood = false;
    
    if (deviation <= 5) {
      color = 'bg-green-500'; // ±5% = Groen
      textColor = 'text-green-400';
      isGood = true;
    } else if (deviation <= 10) {
      color = 'bg-orange-500'; // ±10% = Oranje
      textColor = 'text-orange-400';
    } else {
      color = 'bg-red-500'; // >10% = Rood
      textColor = 'text-red-400';
    }
    
    return {
      percentage: percentage, // Real percentage for text display
      displayPercentage: Math.min(percentage, 100), // Capped percentage for progress bar width
      difference,
      isGood,
      color,
      textColor
    };
  };

  // Force re-render when userProfile changes
  const [forceUpdate, setForceUpdate] = useState(0);
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [userProfile.weight, userProfile.activity_level]);
  
  // Get personalized targets for progress calculations
  // Calculate personalized targets when originalPlanData is available
  const personalizedTargets = React.useMemo(() => {
    if (!originalPlanData || !userProfile.weight) {
      return null;
    }
    const targets = calculatePersonalizedTargets(originalPlanData);
    console.log('🧮 Calculated personalized targets:', targets);
    return targets;
  }, [originalPlanData, userProfile.weight, userProfile.activity_level, forceUpdate]);
  
  // Debug: Log current user profile and personalized targets
  console.log('🔍 Current userProfile:', userProfile);
  console.log('🔍 OriginalPlanData:', originalPlanData);
  console.log('🔍 Personalized targets:', personalizedTargets);
  console.log('🔍 Personalized targets calculation:', personalizedTargets ? {
    targetCalories: personalizedTargets.targetCalories,
    targetProtein: personalizedTargets.targetProtein,
    targetCarbs: personalizedTargets.targetCarbs,
    targetFat: personalizedTargets.targetFat
  } : 'null');
  
  // Get progress info for each macro using personalized targets
  const caloriesProgress = getProgressInfo(currentDayTotals.calories, personalizedTargets?.targetCalories || originalPlanData?.target_calories || 0);
  const proteinProgress = getProgressInfo(currentDayTotals.protein, personalizedTargets?.targetProtein || originalPlanData?.target_protein || 0);
  const carbsProgress = getProgressInfo(currentDayTotals.carbs, personalizedTargets?.targetCarbs || originalPlanData?.target_carbs || 0);
  const fatProgress = getProgressInfo(currentDayTotals.fat, personalizedTargets?.targetFat || originalPlanData?.target_fat || 0);

  // Removed hardcoded access control - now allows all authenticated users

  // Define fetchUserProfile function outside useEffect so it can be reused
  const fetchUserProfile = async () => {
    if (!user?.id) {
      console.log('❌ No user ID available for profile fetch');
      return;
    }
    
    try {
      console.log('📊 Fetching user profile for userId:', user.id);
      const response = await fetch(`/api/nutrition-profile-v2?userId=${user.id}`);
      console.log('📊 Profile fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 V2 API Response:', data);
        if (data.profile) {
          console.log('📊 Fetched user profile:', data.profile);
          const newProfile = {
            weight: data.profile.weight || 100,
            height: data.profile.height || 180,
            age: data.profile.age || 30,
            gender: data.profile.gender || 'male',
            activity_level: data.profile.activity_level || 'moderate',
            fitness_goal: (data.profile.goal === 'cut' ? 'droogtrainen' : 
                         data.profile.goal === 'maintain' ? 'onderhoud' : 
                         data.profile.goal === 'bulk' ? 'spiermassa' : 'onderhoud') as 'droogtrainen' | 'onderhoud' | 'spiermassa'
          };
          console.log('📊 Setting user profile to:', newProfile);
          setUserProfile(newProfile);
        } else {
          console.log('📊 No profile found, using defaults');
        }
      } else {
        console.error('Failed to fetch user profile:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch user profile when component loads
  useEffect(() => {
    fetchUserProfile();
  }, [user?.id]);

  useEffect(() => {
    console.log('🔍 Access check useEffect triggered:', { authLoading, userEmail: user?.email });
    
    // Wait for auth to load before checking access
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...');
      return;
    }
    
    // Check if user is authenticated
    if (!user) {
      console.log('🚫 No user authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('✅ Access granted to voedingsplannen-v2 for:', user?.email);
    fetchPlans();
  }, [router, authLoading, user]);

  const fetchPlans = async () => {
    try {
      console.log('🔧 DEBUG: fetchPlans called');
      setLoading(true);
      const response = await fetch('/api/nutrition-plans');
      
      console.log('🔧 DEBUG: fetchPlans response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch nutrition plans');
      }
      
      const data = await response.json();
      console.log('🔧 DEBUG: fetchPlans data received:', { plansCount: data.plans?.length || 0, plans: data.plans });
      setPlans(data.plans || []);
    } catch (err) {
      console.error('🔧 DEBUG: fetchPlans error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadOriginalPlanData = async (planId: string) => {
    try {
      console.log('🔧 DEBUG: loadOriginalPlanData called with planId:', planId);
      setLoadingOriginal(true);
      setError(null);
      
      const response = await fetch(`/api/nutrition-plan-original?planId=${planId}`);
      
      console.log('🔧 DEBUG: loadOriginalPlanData response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to load original plan data');
      }
      
      const data = await response.json();
      console.log('🔧 DEBUG: loadOriginalPlanData data received:', { planName: data.plan?.name, hasMeals: !!data.plan?.meals });
      let planData = data.plan;
      
      // Apply smart scaling automatically if user weight is not 100kg
      if (userProfile && userProfile.weight !== 100) {
        planData = applySmartScaling(data.plan, userProfile);
        console.log('🧠 Smart scaling applied automatically');
      }
      
      setOriginalPlanData(planData);
      console.log('✅ Plan data loaded:', planData.name, userProfile?.weight === 100 ? '(original)' : '(smart scaled)');
      console.log('🔍 Plan data structure:', {
        hasMeals: !!data.plan.meals,
        hasWeeklyPlan: !!data.plan.meals?.weekly_plan,
        maandagExists: !!data.plan.meals?.weekly_plan?.maandag,
        maandagStructure: data.plan.meals?.weekly_plan?.maandag ? Object.keys(data.plan.meals.weekly_plan.maandag) : 'N/A',
        maandagMeals: data.plan.meals?.weekly_plan?.maandag ? Object.keys(data.plan.meals.weekly_plan.maandag).join(', ') : 'N/A',
        macroPercentages: {
          protein: data.plan.protein_percentage,
          carbs: data.plan.carbs_percentage,
          fat: data.plan.fat_percentage
        },
        allPlanKeys: Object.keys(data.plan)
      });
      
      // Check day consistency after loading
      setTimeout(() => {
        checkDayConsistency();
      }, 100);
      
      // Log detailed ingredient structure for first meal
      if (data.plan.meals?.weekly_plan?.maandag?.ontbijt) {
        console.log('🔍 Ontbijt ingredient structure:', {
          ingredients: data.plan.meals.weekly_plan.maandag.ontbijt.ingredients?.length || 0,
          firstIngredient: data.plan.meals.weekly_plan.maandag.ontbijt.ingredients?.[0],
          ingredientKeys: data.plan.meals.weekly_plan.maandag.ontbijt.ingredients?.[0] ? Object.keys(data.plan.meals.weekly_plan.maandag.ontbijt.ingredients[0]) : []
        });
      }
      
      // Also fetch user profile when loading plan data
      if (user?.id) {
        console.log('🔄 Fetching user profile after plan load...');
        await fetchUserProfile();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load original plan data');
    } finally {
      setLoadingOriginal(false);
    }
  };



  const handlePlanSelect = async (plan: NutritionPlan) => {
    console.log('🔧 DEBUG: handlePlanSelect called with plan:', { name: plan.name, id: plan.plan_id || plan.id });
    setSelectedPlan(plan);
    setShowOriginalData(true);
    setScalingInfo(null); // Reset scaling info
    loadOriginalPlanData(plan.plan_id || plan.id.toString());
    
    // Complete onboarding step 4 if in onboarding
    if (!isCompleted && currentStep === 4) {
      try {
        await completeStep(4, { nutritionPlan: plan.plan_id || plan.id });
        console.log('✅ Onboarding step 4 completed');
      } catch (error) {
        console.error('❌ Error completing onboarding step 4:', error);
      }
    }
  };

  const handleBackToPlans = () => {
    setSelectedPlan(null);
    setOriginalPlanData(null);
    setScalingInfo(null);
    setShowOriginalData(true);
  };

  // Show loading state
  if ((loading && plans.length === 0) || loadingOriginal) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <RocketLaunchIcon className="w-8 h-8 text-[#181F17]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {loadingOriginal ? 'Originele Plan Data Laden' : 'Voedingsplannen V2 Laden'}
          </h3>
          <p className="text-[#B6C948]">
            {loadingOriginal ? 'Backend data wordt geladen...' : 'Slimme schalingsfactor wordt voorbereid...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Fout</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#B6C948] text-[#181F17] rounded-lg hover:bg-[#8BAE5A] transition-colors"
          >
            Opnieuw Proberen
          </button>
        </div>
      </div>
    );
  }

  // Show detail page when a plan is selected
  if (selectedPlan && originalPlanData) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] p-6">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBackToPlans}
            className="flex items-center gap-2 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Terug naar Plannen</span>
          </button>
        </div>

        {/* Plan Detail Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center">
                  <BookOpenIcon className="w-6 h-6 text-[#181F17]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{selectedPlan.name}</h1>
                  <p className="text-[#8BAE5A]">
                    {userProfile && userProfile.weight !== 100 
                      ? `Smart Scaling Toegepast - Aangepast voor ${userProfile.weight}kg gebruiker`
                      : 'Originele Backend Data - 1:1 zoals opgeslagen in database'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Target Macros Section */}
            <div className="bg-[#0A0F0A] rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-[#8BAE5A] mb-4">Target Macros</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Calories */}
                <div className="bg-[#181F17] rounded-lg p-4">
                  <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Calorieën</label>
                  <div className="text-2xl font-bold text-white">
                    {personalizedTargets?.targetCalories || originalPlanData.target_calories}
                  </div>
                </div>

                {/* Protein */}
                <div className="bg-[#181F17] rounded-lg p-4">
                  <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Eiwit (%)</label>
                  <div className="text-2xl font-bold text-white">
                    {(originalPlanData as any).protein_percentage}%
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {personalizedTargets?.targetProtein || originalPlanData.target_protein}g eiwit
                  </div>
                </div>

                {/* Carbs */}
                <div className="bg-[#181F17] rounded-lg p-4">
                  <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Koolhydraten (%)</label>
                  <div className="text-2xl font-bold text-white">
                    {(originalPlanData as any).carbs_percentage}%
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {personalizedTargets?.targetCarbs || originalPlanData.target_carbs}g koolhydraten
                  </div>
                </div>

                {/* Fat */}
                <div className="bg-[#181F17] rounded-lg p-4">
                  <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Vet (%)</label>
                  <div className="text-2xl font-bold text-white">
                    {(originalPlanData as any).fat_percentage}%
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {personalizedTargets?.targetFat || originalPlanData.target_fat}g vet
                  </div>
                </div>
              </div>

              {/* Confirmation Message */}
              <div className="mt-4 bg-green-600 rounded-lg p-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-medium">Macro verdeling is correct (100%)</span>
              </div>
            </div>

            {/* Your Profile Data Section */}
            {userProfile && (
              <div className="bg-[#0A0F0A] rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-[#8BAE5A] mb-4">Jouw Ingevoerde Gegevens</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#181F17] rounded-lg p-4">
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Gewicht</label>
                    <div className="text-2xl font-bold text-white">
                      {userProfile.weight} kg
                    </div>
                  </div>

                  <div className="bg-[#181F17] rounded-lg p-4">
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Activiteitsniveau</label>
                    <div className="text-lg font-bold text-white">
                      {userProfile.activity_level === 'sedentary' ? 'Zittend' :
                       userProfile.activity_level === 'moderate' ? 'Matig' :
                       userProfile.activity_level === 'very_active' ? 'Lopend' :
                       'Matig'}
                    </div>
                  </div>

                  <div className="bg-[#181F17] rounded-lg p-4">
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Fitness Doel</label>
                    <div className="text-lg font-bold text-white">
                      {userProfile.fitness_goal === 'droogtrainen' ? 'Droogtrainen' :
                       userProfile.fitness_goal === 'onderhoud' ? 'Onderhoud' :
                       userProfile.fitness_goal === 'spiermassa' ? 'Spiermassa' :
                       userProfile.fitness_goal}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#181F17] rounded-lg p-4">
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Leeftijd</label>
                    <div className="text-lg font-bold text-white">
                      {userProfile.age} jaar
                    </div>
                  </div>

                  <div className="bg-[#181F17] rounded-lg p-4">
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Lengte</label>
                    <div className="text-lg font-bold text-white">
                      {userProfile.height} cm
                    </div>
                  </div>

                  <div className="bg-[#181F17] rounded-lg p-4">
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Geslacht</label>
                    <div className="text-lg font-bold text-white">
                      Man
                    </div>
                  </div>
                </div>

                {/* TTM Formula Display */}
                <div className="mt-6 bg-[#181F17] rounded-lg p-4">
                  <h4 className="text-[#8BAE5A] font-bold text-lg mb-2">TTM Formule Berekening</h4>
                  <div className="text-white text-sm">
                    <div className="mb-2">
                      <strong>Basis formule:</strong> {userProfile.weight}kg × 22 × {userProfile.activity_level === 'sedentary' ? '1.1' :
                       userProfile.activity_level === 'moderate' ? '1.3' :
                       userProfile.activity_level === 'very_active' ? '1.6' : '1.3'} = {Math.round(userProfile.weight * 22 * (userProfile.activity_level === 'sedentary' ? 1.1 :
                       userProfile.activity_level === 'moderate' ? 1.3 :
                       userProfile.activity_level === 'very_active' ? 1.6 : 1.3))} kcal
                    </div>
                    <div>
                      <strong>Met doel:</strong> {Math.round(userProfile.weight * 22 * (userProfile.activity_level === 'sedentary' ? 1.1 :
                       userProfile.activity_level === 'moderate' ? 1.3 :
                       userProfile.activity_level === 'very_active' ? 1.6 : 1.3))} kcal {userProfile.fitness_goal === 'droogtrainen' ? '- 500' :
                       userProfile.fitness_goal === 'onderhoud' ? '+ 0' :
                       userProfile.fitness_goal === 'spiermassa' ? '+ 400' : '+ 0'} = {Math.round(userProfile.weight * 22 * (userProfile.activity_level === 'sedentary' ? 1.1 :
                       userProfile.activity_level === 'moderate' ? 1.3 :
                       userProfile.activity_level === 'very_active' ? 1.6 : 1.3)) + (userProfile.fitness_goal === 'droogtrainen' ? -500 :
                       userProfile.fitness_goal === 'onderhoud' ? 0 :
                       userProfile.fitness_goal === 'spiermassa' ? 400 : 0)} kcal
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Plan Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Plan Info */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Plan Informatie</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[#8BAE5A] font-medium">Naam:</span>
                    <span className="text-white ml-2">{originalPlanData.name}</span>
                  </div>
                  <div>
                    <span className="text-[#8BAE5A] font-medium">Plan ID:</span>
                    <span className="text-white ml-2">{originalPlanData.plan_id}</span>
                  </div>
                  <div>
                    <span className="text-[#8BAE5A] font-medium">Beschrijving:</span>
                    <p className="text-white mt-1">{selectedPlan.description}</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Macro Targets */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Macro Doelen</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0A0F0A] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FireIcon className="w-5 h-5 text-[#B6C948]" />
                      <span className="text-[#8BAE5A] font-medium">Calorieën</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{personalizedTargets?.targetCalories || originalPlanData.target_calories} kcal</p>
                  </div>
                  <div className="bg-[#0A0F0A] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ChartBarIcon className="w-5 h-5 text-[#B6C948]" />
                      <span className="text-[#8BAE5A] font-medium">Eiwit</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{personalizedTargets?.targetProtein || originalPlanData.target_protein}g</p>
                  </div>
                  <div className="bg-[#0A0F0A] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="w-5 h-5 text-[#B6C948]" />
                      <span className="text-[#8BAE5A] font-medium">Koolhydraten</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{personalizedTargets?.targetCarbs || originalPlanData.target_carbs}g</p>
                  </div>
                  <div className="bg-[#0A0F0A] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <HeartIcon className="w-5 h-5 text-[#B6C948]" />
                      <span className="text-[#8BAE5A] font-medium">Vet</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{personalizedTargets?.targetFat || originalPlanData.target_fat}g</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Meal Structure */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Gedetailleerde Eetmomenten</h3>
              {Object.keys(customAmounts).length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#B6C948] text-[#181F17] rounded-full text-sm font-semibold">
                  <span>✏️</span>
                  {Object.keys(customAmounts).length} aangepast
                </div>
              )}
            </div>
            
            {/* Day Tabs and Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 capitalize ${
                    selectedDay === day
                      ? 'bg-[#8BAE5A] text-[#181F17]'
                      : 'bg-[#0A0F0A] text-white hover:bg-[#3A4D23] border border-[#3A4D23]'
                  }`}
                >
                  {day}
                </button>
              ))}
              </div>
              
              {/* Reset All Button */}
              {Object.keys(customAmounts).length > 0 && (
                <button
                  onClick={resetAllCustomAmounts}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <span>↺</span>
                  Reset Alle Aantallen
                </button>
              )}
              
            </div>
            
            {/* Daily Totals Progress Bars */}
            {originalPlanData && (
              <div className="bg-[#0A0F0A] rounded-lg p-6 mb-6">
                {/* Safe Range Information */}
                <div className="bg-[#1A2A1A] border border-[#3A4D23] rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                        <span className="text-[#181F17] text-sm font-bold">ℹ️</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-[#B6C948] font-semibold text-sm mb-2">Veilige Range</h5>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        We begrijpen dat het lastig is om exact alle waardes op 100% te krijgen. 
                        <span className="text-[#8BAE5A] font-medium"> Zolang je binnen de veilige range van -100kcal en +100kcal zit, zit je goed.</span> 
                        Je hoeft niet naar perfectie te streven - consistentie is belangrijker dan perfectie.
                      </p>
                    </div>
                  </div>
                </div>
                
                <h4 className="text-[#B6C948] font-bold text-lg mb-4 capitalize">
                  {selectedDay} - Dagtotalen
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Calories */}
                  <div className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Calorieën</span>
                      <span className={`text-sm ${caloriesProgress.textColor}`}>{caloriesProgress.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${caloriesProgress.color}`}
                        style={{ width: `${caloriesProgress.displayPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{currentDayTotals.calories.toFixed(1)} kcal</span>
                      <span className="text-white">{(personalizedTargets?.targetCalories || originalPlanData.target_calories).toFixed(1)} kcal</span>
                    </div>
                    <div className={`text-xs mt-1 ${caloriesProgress.textColor}`}>
                      {caloriesProgress.difference > 0 ? '+' : ''}{caloriesProgress.difference.toFixed(1)} kcal
                    </div>
                  </div>

                  {/* Protein */}
                  <div className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Eiwit</span>
                      <span className={`text-sm ${proteinProgress.textColor}`}>{proteinProgress.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${proteinProgress.color}`}
                        style={{ width: `${proteinProgress.displayPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{currentDayTotals.protein.toFixed(1)}g</span>
                      <span className="text-white">{(personalizedTargets?.targetProtein || originalPlanData.target_protein).toFixed(1)}g</span>
                    </div>
                    <div className={`text-xs mt-1 ${proteinProgress.textColor}`}>
                      {proteinProgress.difference > 0 ? '+' : ''}{proteinProgress.difference.toFixed(1)}g
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Koolhydraten</span>
                      <span className={`text-sm ${carbsProgress.textColor}`}>{carbsProgress.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${carbsProgress.color}`}
                        style={{ width: `${carbsProgress.displayPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{currentDayTotals.carbs.toFixed(1)}g</span>
                      <span className="text-white">{(personalizedTargets?.targetCarbs || originalPlanData.target_carbs).toFixed(1)}g</span>
                    </div>
                    <div className={`text-xs mt-1 ${carbsProgress.textColor}`}>
                      {carbsProgress.difference > 0 ? '+' : ''}{carbsProgress.difference.toFixed(1)}g
                    </div>
                  </div>

                  {/* Fat */}
                  <div className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Vet</span>
                      <span className={`text-sm ${fatProgress.textColor}`}>{fatProgress.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${fatProgress.color}`}
                        style={{ width: `${fatProgress.displayPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{currentDayTotals.fat.toFixed(1)}g</span>
                      <span className="text-white">{(personalizedTargets?.targetFat || originalPlanData.target_fat).toFixed(1)}g</span>
                    </div>
                    <div className={`text-xs mt-1 ${fatProgress.textColor}`}>
                      {fatProgress.difference > 0 ? '+' : ''}{fatProgress.difference.toFixed(1)}g
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Day Meals - Table Layout */}
            {originalPlanData.meals?.weekly_plan && originalPlanData.meals.weekly_plan[selectedDay] && (
              <div className="bg-[#0A0F0A] rounded-lg p-6">
                <h4 className="text-[#B6C948] font-bold text-lg mb-6 capitalize">{selectedDay}</h4>
                    
                <div className="space-y-6">
                  {['ontbijt', 'ochtend_snack', 'lunch', 'lunch_snack', 'diner', 'avond_snack'].map((mealType) => {
                    const mealData = originalPlanData.meals.weekly_plan[selectedDay][mealType];
                    const mealTypeLabel = mealType === 'ochtend_snack' ? 'Ochtend Snack' :
                                         mealType === 'lunch_snack' ? 'Lunch Snack' :
                                         mealType === 'avond_snack' ? 'Avond Snack' :
                                         mealType === 'ontbijt' ? 'Ontbijt' :
                                         mealType === 'lunch' ? 'Lunch' :
                                         mealType === 'diner' ? 'Diner' : mealType;

                    if (!mealData || !mealData.ingredients) return null;

                    const mealTotals = calculateMealTotals(mealData, mealType, selectedDay);

                    return (
                      <div key={mealType} className="bg-[#181F17] rounded-lg border border-[#3A4D23] overflow-hidden">
                        {/* Meal Header with Totals */}
                        <div className="bg-[#2A3A1A] px-6 py-4 border-b border-[#3A4D23]">
                          <div className="flex items-center justify-between">
                            <h5 className="text-white font-semibold flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-[#8BAE5A]" />
                              {mealTypeLabel}
                            </h5>
                            <div className="flex items-center gap-4">
                            <div className="flex gap-6 text-sm">
                              <div className="text-[#B6C948] font-medium">
                                {mealTotals.calories.toFixed(1)} kcal
                              </div>
                              <div className="text-white">
                                Eiwitten: {mealTotals.protein.toFixed(1)}g
                              </div>
                              <div className="text-white">
                                Koolhydraten: {mealTotals.carbs.toFixed(1)}g
                              </div>
                              <div className="text-white">
                                Vetten: {mealTotals.fat.toFixed(1)}g
                              </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Ingredients Table */}
                        <div className="p-6">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-[#3A4D23]">
                                  <th className="text-left text-[#8BAE5A] font-medium py-2">Ingrediënt</th>
                                  <th className="text-center text-[#8BAE5A] font-medium py-2">Aantal</th>
                                  <th className="text-center text-[#8BAE5A] font-medium py-2">Eenheid</th>
                                  <th className="text-right text-[#8BAE5A] font-medium py-2">kcal</th>
                                  <th className="text-right text-[#8BAE5A] font-medium py-2">Eiwit</th>
                                  <th className="text-right text-[#8BAE5A] font-medium py-2">Koolhydraten</th>
                                  <th className="text-right text-[#8BAE5A] font-medium py-2">Vet</th>
                                </tr>
                              </thead>
                              <tbody>
                                {mealData.ingredients.map((ingredient: any, index: number) => {
                                  // Get custom amount or use original amount
                                  const ingredientKey = getIngredientKey(mealType, ingredient.name, selectedDay);
                                  const customAmount = customAmounts[ingredientKey];
                                  let amount = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
                                  
                                  // Round to whole numbers for pieces/slices
                                  if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk') {
                                    amount = Math.round(amount);
                                  }
                                  
                                  // Calculate individual ingredient totals (matching backend logic exactly)
                                  let multiplier = 1;
                                  
                                  // Handle different unit types based on database unit_type (matching backend exactly)
                                  if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk') {
                                    multiplier = amount;
                                  } else if (ingredient.unit === 'per_100g' || ingredient.unit === 'g') {
                                    multiplier = amount / 100;
                                  } else if (ingredient.unit === 'per_ml') {
                                    multiplier = amount / 100; // Assuming 1ml = 1g for liquids
                                  } else if (ingredient.unit === 'handje') {
                                    multiplier = amount;
                                  } else {
                                    // Default to per 100g calculation
                                    multiplier = amount / 100;
                                  }

                                  const ingredientCalories = (ingredient.calories_per_100g || 0) * multiplier;
                                  const ingredientProtein = (ingredient.protein_per_100g || 0) * multiplier;
                                  const ingredientCarbs = (ingredient.carbs_per_100g || 0) * multiplier;
                                  const ingredientFat = (ingredient.fat_per_100g || 0) * multiplier;

                                  // Convert database unit names to user-friendly labels
                                  const getUnitLabel = (unit: string) => {
                                    switch (unit) {
                                      case 'g': return 'Per 100g';
                                      case 'plakje': return 'Per plakje';
                                      case 'piece': return 'Per stuk';
                                      case 'per_100g': return 'Per 100g';
                                      case 'per_plakje': return 'Per plakje';
                                      case 'per_piece': return 'Per stuk';
                                      default: return `Per ${unit}`;
                                    }
                                  };

                                  return (
                                    <tr key={index} className="border-b border-[#2A3A1A] last:border-b-0">
                                      <td className="py-3 text-white font-medium">
                                        {ingredient.name}
                                      </td>
                                      <td className="py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          <input
                                            type="number"
                                            value={formatAmountDisplay(amount, ingredient.unit)}
                                            onChange={(e) => {
                                              const newValue = parseFloat(e.target.value) || 0;
                                              let finalValue = newValue;
                                              
                                              // Round to whole numbers for pieces/slices and per_100g
                                              if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk' || ingredient.unit === 'per_100g' || ingredient.unit === 'g') {
                                                finalValue = Math.round(newValue);
                                              }
                                              
                                              updateCustomAmount(ingredientKey, finalValue);
                                            }}
                                            className="w-16 px-2 py-1 bg-[#232D1A] border border-[#3A4D23] rounded text-white text-center text-sm focus:border-[#B6C948] focus:outline-none"
                                            min="0"
                                            step={ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk' || ingredient.unit === 'per_100g' || ingredient.unit === 'g' ? "1" : "0.1"}
                                          />
                                          {customAmount !== undefined && customAmount !== ingredient.amount && (
                                            <button
                                              onClick={() => updateCustomAmount(ingredientKey, ingredient.amount)}
                                              className="text-[#8BAE5A] hover:text-[#B6C948] text-xs"
                                              title="Reset naar origineel"
                                            >
                                              ↺
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-3 text-center text-gray-300 text-xs">
                                        {getUnitLabel(ingredient.unit)}
                                      </td>
                                      <td className="py-3 text-right text-white font-medium">
                                        {ingredientCalories.toFixed(0)}
                                      </td>
                                      <td className="py-3 text-right text-white">
                                        {ingredientProtein.toFixed(1)}g
                                      </td>
                                      <td className="py-3 text-right text-white">
                                        {ingredientCarbs.toFixed(1)}g
                                      </td>
                                      <td className="py-3 text-right text-white">
                                        {ingredientFat.toFixed(1)}g
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Smart Scaling Results */}
        {scalingInfo && !showOriginalData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center">
                    <RocketLaunchIcon className="w-6 h-6 text-[#181F17]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Smart Scaling Resultaten</h2>
                    <p className="text-[#8BAE5A]">Geoptimaliseerd voor jouw profiel ({userProfile.weight}kg, {userProfile.activity_level}, {userProfile.fitness_goal})</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOriginalData(true)}
                  className="px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors flex items-center gap-2"
                >
                  <BookOpenIcon className="w-4 h-4" />
                  <span>Bekijk Originele Data</span>
                </button>
              </div>

              {/* Scaling Info Display */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-[#0A0F0A] rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Scaling Informatie</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#8BAE5A]">Jouw gewicht:</span>
                      <span className="text-white font-semibold">{scalingInfo.userWeight || 0}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8BAE5A]">Basis gewicht:</span>
                      <span className="text-white font-semibold">{scalingInfo.baseWeight || 0}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8BAE5A]">Scaling factor:</span>
                      <span className="text-[#B6C948] font-bold">{(scalingInfo.scalingFactor || 0).toFixed(2)}x</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0A0F0A] rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Aangepaste Macro Doelen</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[#8BAE5A] text-sm">Calorieën</span>
                      <p className="text-xl font-bold text-white">{scalingInfo.adjustedCalories || 0}</p>
                    </div>
                    <div>
                      <span className="text-[#8BAE5A] text-sm">Eiwit</span>
                      <p className="text-xl font-bold text-white">{scalingInfo.adjustedProtein || 0}g</p>
                    </div>
                    <div>
                      <span className="text-[#8BAE5A] text-sm">Koolhydraten</span>
                      <p className="text-xl font-bold text-white">{scalingInfo.adjustedCarbs || 0}g</p>
                    </div>
                    <div>
                      <span className="text-[#8BAE5A] text-sm">Vet</span>
                      <p className="text-xl font-bold text-white">{scalingInfo.adjustedFat || 0}g</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // Overview page - show when no plan is selected
  return (
    <div className="min-h-screen bg-[#0A0F0A]">
      <OnboardingV2Progress />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center">
              <RocketLaunchIcon className="w-6 h-6 text-[#181F17]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Voedingsplannen V2</h1>
              <p className="text-[#B6C948]">Slimme schalingsfactor met AI-optimalisatie</p>
            </div>
          </div>
        </motion.div>

        {/* User Profile Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <UserIcon className="w-6 h-6 text-[#8BAE5A]" />
              <h2 className="text-xl font-bold text-white">Jouw Profiel</h2>
            </div>
            <button
              onClick={() => setShowUserProfileForm(!showUserProfileForm)}
              className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
            >
              {showUserProfileForm ? 'Verberg' : 'Bewerk Profiel'}
            </button>
          </div>

          {/* Current Profile Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#0A0F0A] rounded-lg p-4">
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Gewicht</label>
              <div className="text-2xl font-bold text-white">
                {userProfile.weight} kg
              </div>
            </div>
            <div className="bg-[#0A0F0A] rounded-lg p-4">
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Activiteitsniveau</label>
              <div className="text-lg font-bold text-white">
                {userProfile.activity_level === 'sedentary' ? 'Zittend' :
                 userProfile.activity_level === 'moderate' ? 'Matig' :
                 userProfile.activity_level === 'very_active' ? 'Lopend' :
                 'Matig'}
              </div>
            </div>
            <div className="bg-[#0A0F0A] rounded-lg p-4">
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Fitness Doel</label>
              <div className="text-lg font-bold text-white">
                {userProfile.fitness_goal === 'droogtrainen' ? 'Droogtrainen' :
                 userProfile.fitness_goal === 'onderhoud' ? 'Onderhoud' :
                 userProfile.fitness_goal === 'spiermassa' ? 'Spiermassa' :
                 userProfile.fitness_goal}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          {showUserProfileForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[#0A0F0A] rounded-lg p-6"
            >
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const profile = {
                  weight: parseFloat(formData.get('weight') as string),
                  height: parseFloat(formData.get('height') as string),
                  age: parseInt(formData.get('age') as string),
                  gender: 'male' as 'male' | 'female',
                  activity_level: formData.get('activity_level') as 'sedentary' | 'moderate' | 'very_active',
                  fitness_goal: formData.get('fitness_goal') as 'droogtrainen' | 'onderhoud' | 'spiermassa'
                };
                saveUserProfile(profile);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Gewicht (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      defaultValue={userProfile.weight}
                      min="40"
                      max="200"
                      step="0.1"
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Lengte (cm)</label>
                    <input
                      type="number"
                      name="height"
                      defaultValue={userProfile.height}
                      min="140"
                      max="220"
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Leeftijd</label>
                    <input
                      type="number"
                      name="age"
                      defaultValue={userProfile.age}
                      min="16"
                      max="80"
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Geslacht</label>
                    <div className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white">
                      Man
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Activiteitsniveau</label>
                    <select
                      name="activity_level"
                      defaultValue={userProfile.activity_level}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                    >
                      <option value="sedentary">Zittend</option>
                      <option value="moderate">Matig</option>
                      <option value="very_active">Lopend</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Fitness Doel</label>
                    <select
                      name="fitness_goal"
                      defaultValue={userProfile.fitness_goal}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                    >
                      <option value="droogtrainen">Droogtrainen</option>
                      <option value="onderhoud">Onderhoud</option>
                      <option value="spiermassa">Spiermassa</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUserProfileForm(false)}
                    className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
                  >
                    Opslaan
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]"></div>
            <span className="ml-3 text-[#8BAE5A]">Voedingsplannen laden...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-400 font-semibold">Fout bij laden</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans
              .filter((plan) => {
                // Filter plans based on user's fitness goal
                const planGoal = plan.goal?.toLowerCase();
                const userGoal = userProfile.fitness_goal;
                
                // Map user goals to plan goals
                const goalMapping = {
                  'droogtrainen': 'droogtrainen',
                  'onderhoud': 'onderhoud', 
                  'spiermassa': 'spiermassa'
                };
                
                return planGoal === goalMapping[userGoal];
              })
              .map((plan) => {
              // Calculate personalized targets for this plan
              const personalizedTargets = calculatePersonalizedTargets(plan);
              
              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlanSelect(plan)}
                  className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 cursor-pointer hover:border-[#B6C948] transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <div className="px-3 py-1 bg-[#8BAE5A] text-[#181F17] rounded-full text-xs font-semibold">
                      {plan.goal}
                    </div>
                  </div>
                  
                  <p className="text-[#8BAE5A] text-sm mb-4">{plan.description}</p>
                  
                  {/* Personalized Calories */}
                  <div className="space-y-3">
                    {personalizedTargets && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Jouw Calorieën:</span>
                        <span className="text-[#8BAE5A] font-bold text-lg">{personalizedTargets.targetCalories} kcal</span>
                      </div>
                    )}
                    
                    {/* Macro Breakdown */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#3A4D23]">
                      <div className="text-center">
                        <div className="text-xs text-gray-400">Eiwit</div>
                        <div className="text-sm font-semibold text-white">
                          {personalizedTargets?.targetProtein || plan.target_protein}g
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-400">Koolhydraten</div>
                        <div className="text-sm font-semibold text-white">
                          {personalizedTargets?.targetCarbs || plan.target_carbs}g
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-400">Vet</div>
                        <div className="text-sm font-semibold text-white">
                          {personalizedTargets?.targetFat || plan.target_fat}g
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
                                  
        {/* No Plans State */}
        {!loading && !error && plans.length === 0 && (
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Geen voedingsplannen gevonden</h3>
            <p className="text-gray-500">Er zijn momenteel geen voedingsplannen beschikbaar.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
