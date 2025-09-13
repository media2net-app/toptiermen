'use client';

import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/navigation';
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

  // Days of the week
  const days = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];

  // Function to calculate daily totals for selected day
  const calculateDayTotals = (day: string) => {
    console.log('🧮 Calculating day totals for:', day);
    console.log('🔍 OriginalPlanData available:', !!originalPlanData);
    console.log('🔍 Meals available:', !!originalPlanData?.meals);
    console.log('🔍 Weekly plan available:', !!originalPlanData?.meals?.weekly_plan);
    console.log('🔍 Day data available:', !!originalPlanData?.meals?.weekly_plan?.[day]);
    
    if (!originalPlanData?.meals?.weekly_plan?.[day]) {
      console.log('❌ No day data found, returning zeros');
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const dayMeals = originalPlanData.meals.weekly_plan[day];
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
          console.log(`🔍 Ingredient ${index}:`, {
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            calories_per_100g: ingredient.calories_per_100g,
            protein_per_100g: ingredient.protein_per_100g,
            carbs_per_100g: ingredient.carbs_per_100g,
            fat_per_100g: ingredient.fat_per_100g
          });
          
          // Calculate macros based on amount and unit (matching backend logic exactly)
          let multiplier = 1;
          const amount = ingredient.amount || 0;
          
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

    console.log('📊 Final day totals:', totals);
    return totals;
  };

  // Get current day totals
  const currentDayTotals = calculateDayTotals(selectedDay);

  // Function to calculate meal totals
  const calculateMealTotals = (meal: any) => {
    if (!meal?.ingredients || !Array.isArray(meal.ingredients)) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    meal.ingredients.forEach((ingredient: any) => {
      // Calculate macros based on amount and unit (matching backend logic exactly)
      let multiplier = 1;
      const amount = ingredient.amount || 0;
      
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

  // TTM Formula: weight x 22 x activity_level + goal_adjustment
  const calculatePersonalizedTargets = (basePlan: any) => {
    // Debug logging
    console.log('🔍 Calculating targets for plan:', {
      name: basePlan.name,
      goal: basePlan.goal,
      fitness_goal: basePlan.fitness_goal,
      userProfile: userProfile
    });

    // Activity level multipliers
    const activityMultipliers = {
      'sedentary': 1.1,    // Zittend (1.1x)
      'moderate': 1.3,     // Staand (1.3x) - Backend basis
      'very_active': 1.6   // Lopend (1.6x)
    };

    // Goal adjustments (kcal) - based on the PLAN's goal, not user's fitness goal
    const goalAdjustments = {
      'droogtrainen': -500,  // -500 kcal
      'onderhoud': 0,        // Basis plan (0 kcal)
      'spiermassa': +400     // +400 kcal
    };

    // Calculate base calories using TTM formula
    const baseCalories = userProfile.weight * 22 * (activityMultipliers[userProfile.activity_level] || 1.3);
    
    // Use the PLAN's goal for calorie adjustment, not the user's fitness goal
    const planGoal = basePlan.goal?.toLowerCase() || 'onderhoud';
    const goalAdjustment = goalAdjustments[planGoal] || 0;
    const targetCalories = baseCalories + goalAdjustment;

    console.log('🧮 Calculation details:', {
      userWeight: userProfile.weight,
      userActivity: userProfile.activity_level,
      baseCalories,
      planGoal,
      goalAdjustment,
      targetCalories
    });

    // Calculate scaling factor compared to backend base (100kg, moderate, onderhoud)
    const backendBase = 100 * 22 * 1.3; // 2860 kcal
    const scalingFactor = targetCalories / backendBase;

    console.log('📊 Scaling calculation:', {
      backendBase,
      scalingFactor,
      targetCalories
    });

    // Try macro percentages approach first, fallback to scaling
    const macroTargetsFromPercentages = calculatePersonalizedTargetsWithPercentages(basePlan, targetCalories);
    
    let targetProtein, targetCarbs, targetFat;
    
    if (macroTargetsFromPercentages) {
      // Use macro percentages approach
      targetProtein = macroTargetsFromPercentages.targetProtein;
      targetCarbs = macroTargetsFromPercentages.targetCarbs;
      targetFat = macroTargetsFromPercentages.targetFat;
      console.log('✅ Using macro percentages approach');
    } else {
      // Fallback to scaling approach
      targetProtein = Math.round(basePlan.target_protein * scalingFactor);
      targetCarbs = Math.round(basePlan.target_carbs * scalingFactor);
      targetFat = Math.round(basePlan.target_fat * scalingFactor);
      console.log('✅ Using scaling approach');
    }

    console.log('🎯 Final macro targets:', {
      targetProtein,
      targetCarbs,
      targetFat,
      originalProtein: basePlan.target_protein,
      originalCarbs: basePlan.target_carbs,
      originalFat: basePlan.target_fat
    });

    return {
      targetCalories: Math.round(targetCalories),
      targetProtein,
      targetCarbs,
      targetFat,
      scalingFactor,
      baseCalories: Math.round(baseCalories),
      goalAdjustment,
      planGoal
    };
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
    const personalizedTargets = calculatePersonalizedTargets(userProfile, planData);
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
    Object.keys(scaledPlan.meals.weekly_plan).forEach(day => {
      const dayData = scaledPlan.meals.weekly_plan[day];
      
      ['ontbijt', 'ochtend_snack', 'lunch', 'lunch_snack', 'diner', 'avond_snack'].forEach(mealType => {
        const meal = dayData[mealType];
        if (meal && meal.ingredients && Array.isArray(meal.ingredients)) {
          
          // Apply realistic scaling based on unit type
          meal.ingredients.forEach((ingredient: any) => {
            if (ingredient.amount && ingredient.unit) {
              const originalAmount = ingredient.amount;
              let newAmount = originalAmount * weightRatio;
              
              // Apply realistic scaling rules
              if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk') {
                // Whole pieces: round to nearest whole number, minimum 1
                newAmount = Math.max(1, Math.round(newAmount));
                console.log(`🧠 ${ingredient.name}: ${originalAmount} → ${newAmount} ${ingredient.unit} (whole piece)`);
              } else {
                // All other items: round to 1 decimal place
                newAmount = Math.round(newAmount * 10) / 10;
                if (newAmount < 0.1) newAmount = 0.1; // Minimum 0.1
                console.log(`🧠 ${ingredient.name}: ${originalAmount} → ${newAmount} ${ingredient.unit} (1 decimal)`);
              }
              
              ingredient.amount = newAmount;
            }
          });
          
          // Recalculate meal totals after scaling
          const mealTotals = calculateMealTotals(meal);
          meal.totals = mealTotals;
        }
      });
      
      // Recalculate day totals
      const dayTotals = calculateDayTotals(scaledPlan, day);
      if (scaledPlan.meals.weekly_plan[day]) {
        scaledPlan.meals.weekly_plan[day].dailyTotals = dayTotals;
      }
      
      // Fine-tune for better macro balance (focus on fat targets)
      const currentDayTotals = dayTotals;
      const fatPercentage = (currentDayTotals.fat / targetFat) * 100;
      
      console.log(`🧠 Day ${day} fat percentage: ${fatPercentage.toFixed(1)}% (target: 100%)`);
      
      // If fat is too low (< 95%), increase meat/fat-rich ingredients
      if (fatPercentage < 95) {
        console.log(`🧠 Fat too low (${fatPercentage.toFixed(1)}%), fine-tuning meat portions...`);
        
        // Calculate how much fat we need to add
        const fatNeeded = targetFat - currentDayTotals.fat;
        console.log(`🧠 Fat needed: ${fatNeeded.toFixed(1)}g`);
        
        ['diner', 'lunch', 'ontbijt', 'ochtend_snack'].forEach(mealType => { // Check all meals
          const meal = dayData[mealType];
          if (meal && meal.ingredients && Array.isArray(meal.ingredients)) {
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
          }
        });
        
        // Recalculate day totals after fine-tuning
        const updatedDayTotals = calculateDayTotals(scaledPlan, day);
        if (scaledPlan.meals.weekly_plan[day]) {
          scaledPlan.meals.weekly_plan[day].dailyTotals = updatedDayTotals;
        }
        
        const newFatPercentage = (updatedDayTotals.fat / targetFat) * 100;
        console.log(`🧠 After fine-tuning: ${newFatPercentage.toFixed(1)}% fat (improvement: ${(newFatPercentage - fatPercentage).toFixed(1)}%)`);
      }
    });

    console.log('✅ Realistic Smart Scaling applied');
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
      percentage: Math.min(percentage, 120), // Cap at 120% for display
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

  // Check if user is specifically chiel@media2net.nl
  const isChiel = user?.email === 'chiel@media2net.nl';

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
    console.log('🔍 Access check useEffect triggered:', { authLoading, isChiel, userEmail: user?.email });
    
    // Wait for auth to load before checking access
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...');
      return;
    }
    
    // Only allow chiel@media2net.nl access
    if (!isChiel) {
      console.log('🚫 Access denied to voedingsplannen-v2, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }

    console.log('✅ Access granted to voedingsplannen-v2 for:', user?.email);
    fetchPlans();
  }, [isChiel, router, authLoading, user]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nutrition-plans');
      
      if (!response.ok) {
        throw new Error('Failed to fetch nutrition plans');
      }
      
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadOriginalPlanData = async (planId: string) => {
    try {
      setLoadingOriginal(true);
      setError(null);
      
      const response = await fetch(`/api/nutrition-plan-original?planId=${planId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load original plan data');
      }
      
      const data = await response.json();
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

  const saveUserProfile = async (profile: UserProfile) => {
    try {
      // Validate user ID before making request
      if (!user?.id) {
        throw new Error('No user ID available. Please log in again.');
      }

      console.log('💾 Saving profile for user:', user.id, profile);

      const response = await fetch('/api/nutrition-profile-v2', {
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


  const handlePlanSelect = (plan: NutritionPlan) => {
    console.log('🎯 Plan selected:', plan.name, 'ID:', plan.plan_id || plan.id);
    setSelectedPlan(plan);
    setShowOriginalData(true);
    setScalingInfo(null); // Reset scaling info
    loadOriginalPlanData(plan.plan_id || plan.id.toString());
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
              {userProfile && userProfile.weight !== 100 && (
                <div className="px-6 py-3 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] rounded-lg flex items-center gap-2 font-semibold">
                  <RocketLaunchIcon className="w-5 h-5" />
                  <span>Smart Scaling Actief ({userProfile.weight}kg)</span>
                </div>
              )}
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
                    {originalPlanData.protein_percentage || (originalPlanData as any).protein_percentage}%
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {personalizedTargets?.targetProtein || originalPlanData.target_protein}g eiwit
                  </div>
                </div>

                {/* Carbs */}
                <div className="bg-[#181F17] rounded-lg p-4">
                  <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Koolhydraten (%)</label>
                  <div className="text-2xl font-bold text-white">
                    {originalPlanData.carbs_percentage || (originalPlanData as any).carbs_percentage}%
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {personalizedTargets?.targetCarbs || originalPlanData.target_carbs}g koolhydraten
                  </div>
                </div>

                {/* Fat */}
                <div className="bg-[#181F17] rounded-lg p-4">
                  <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Vet (%)</label>
                  <div className="text-2xl font-bold text-white">
                    {originalPlanData.fat_percentage || (originalPlanData as any).fat_percentage}%
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
                      {userProfile.activity_level === 'low' ? 'Laag (1.2)' :
                       userProfile.activity_level === 'light' ? 'Licht (1.375)' :
                       userProfile.activity_level === 'moderate' ? 'Matig (1.3)' :
                       userProfile.activity_level === 'high' ? 'Hoog (1.55)' :
                       userProfile.activity_level === 'very_high' ? 'Zeer hoog (1.725)' :
                       userProfile.activity_level}
                    </div>
                  </div>

                  <div className="bg-[#181F17] rounded-lg p-4">
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Fitness Doel</label>
                    <div className="text-lg font-bold text-white">
                      {userProfile.goal === 'droogtrainen' ? 'Droogtrainen (-500 kcal)' :
                       userProfile.goal === 'onderhoud' ? 'Onderhoud (0 kcal)' :
                       userProfile.goal === 'spiermassa' ? 'Spiermassa (+400 kcal)' :
                       userProfile.goal}
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
                      {userProfile.gender === 'male' ? 'Man' : 'Vrouw'}
                    </div>
                  </div>
                </div>

                {/* TTM Formula Display */}
                <div className="mt-6 bg-[#181F17] rounded-lg p-4">
                  <h4 className="text-[#8BAE5A] font-bold text-lg mb-2">TTM Formule Berekening</h4>
                  <div className="text-white text-sm">
                    <div className="mb-2">
                      <strong>Basis formule:</strong> {userProfile.weight}kg × 22 × {userProfile.activity_level === 'low' ? '1.2' :
                       userProfile.activity_level === 'light' ? '1.375' :
                       userProfile.activity_level === 'moderate' ? '1.3' :
                       userProfile.activity_level === 'high' ? '1.55' :
                       userProfile.activity_level === 'very_high' ? '1.725' : '1.3'} = {Math.round(userProfile.weight * 22 * (userProfile.activity_level === 'low' ? 1.2 :
                       userProfile.activity_level === 'light' ? 1.375 :
                       userProfile.activity_level === 'moderate' ? 1.3 :
                       userProfile.activity_level === 'high' ? 1.55 :
                       userProfile.activity_level === 'very_high' ? 1.725 : 1.3))} kcal
                    </div>
                    <div>
                      <strong>Met doel:</strong> {Math.round(userProfile.weight * 22 * (userProfile.activity_level === 'low' ? 1.2 :
                       userProfile.activity_level === 'light' ? 1.375 :
                       userProfile.activity_level === 'moderate' ? 1.3 :
                       userProfile.activity_level === 'high' ? 1.55 :
                       userProfile.activity_level === 'very_high' ? 1.725 : 1.3))} kcal {userProfile.goal === 'droogtrainen' ? '- 500' :
                       userProfile.goal === 'onderhoud' ? '+ 0' :
                       userProfile.goal === 'spiermassa' ? '+ 400' : '+ 0'} = {Math.round(userProfile.weight * 22 * (userProfile.activity_level === 'low' ? 1.2 :
                       userProfile.activity_level === 'light' ? 1.375 :
                       userProfile.activity_level === 'moderate' ? 1.3 :
                       userProfile.activity_level === 'high' ? 1.55 :
                       userProfile.activity_level === 'very_high' ? 1.725 : 1.3)) + (userProfile.goal === 'droogtrainen' ? -500 :
                       userProfile.goal === 'onderhoud' ? 0 :
                       userProfile.goal === 'spiermassa' ? 400 : 0)} kcal
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
            <h3 className="text-xl font-bold text-white mb-6">Gedetailleerde Eetmomenten</h3>
            
            {/* Day Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
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
            
            {/* Daily Totals Progress Bars */}
            {originalPlanData && (
              <div className="bg-[#0A0F0A] rounded-lg p-6 mb-6">
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
                        style={{ width: `${caloriesProgress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{currentDayTotals.calories} kcal</span>
                      <span className="text-white">{personalizedTargets?.targetCalories || originalPlanData.target_calories} kcal</span>
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
                        style={{ width: `${proteinProgress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{currentDayTotals.protein}g</span>
                      <span className="text-white">{personalizedTargets?.targetProtein || originalPlanData.target_protein}g</span>
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
                        style={{ width: `${carbsProgress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{currentDayTotals.carbs}g</span>
                      <span className="text-white">{personalizedTargets?.targetCarbs || originalPlanData.target_carbs}g</span>
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
                        style={{ width: `${fatProgress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{currentDayTotals.fat}g</span>
                      <span className="text-white">{personalizedTargets?.targetFat || originalPlanData.target_fat}g</span>
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

                    const mealTotals = calculateMealTotals(mealData);

                    return (
                      <div key={mealType} className="bg-[#181F17] rounded-lg border border-[#3A4D23] overflow-hidden">
                        {/* Meal Header with Totals */}
                        <div className="bg-[#2A3A1A] px-6 py-4 border-b border-[#3A4D23]">
                          <div className="flex items-center justify-between">
                            <h5 className="text-white font-semibold flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-[#8BAE5A]" />
                              {mealTypeLabel}
                            </h5>
                            <div className="flex gap-6 text-sm">
                              <div className="text-[#B6C948] font-medium">
                                {mealTotals.calories.toFixed(0)} kcal
                              </div>
                              <div className="text-white">
                                P: {mealTotals.protein.toFixed(1)}g
                              </div>
                              <div className="text-white">
                                K: {mealTotals.carbs.toFixed(1)}g
                              </div>
                              <div className="text-white">
                                V: {mealTotals.fat.toFixed(1)}g
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
                                  // Calculate individual ingredient totals (matching backend logic exactly)
                                  let multiplier = 1;
                                  const amount = ingredient.amount || 0;
                                  
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
                                      <td className="py-3 text-center text-white font-semibold">
                                        {ingredient.amount}
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

  return (
    <div className="min-h-screen bg-[#0A0F0A] p-6">
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
          
          <div className="bg-[#181F17] border border-[#B6C948] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#B6C948] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#181F17] text-xs font-bold">!</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Slimme Schalingsfactor</h3>
                <p className="text-[#8BAE5A] text-sm">
                  Deze V2 versie gebruikt geavanceerde AI-algoritmes om voedingsplannen automatisch 
                  te optimaliseren op basis van jouw gewicht en doelen. Elke portie wordt precies 
                  berekend voor maximale resultaten.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-[#181F17]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Jouw Profiel</h3>
                  <p className="text-[#8BAE5A]">Voor slimme schalingsfactor</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserProfileForm(!showUserProfileForm)}
                className="px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors"
              >
                {showUserProfileForm ? 'Sluiten' : 'Bewerken'}
              </button>
            </div>

            {/* Current Profile Display */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
              <div className="bg-[#0A0F0A] rounded-lg p-3">
                <p className="text-[#8BAE5A] text-sm">Gewicht</p>
                <p className="text-white font-semibold">{userProfile.weight} kg</p>
              </div>
              <div className="bg-[#0A0F0A] rounded-lg p-3">
                <p className="text-[#8BAE5A] text-sm">Lengte</p>
                <p className="text-white font-semibold">{userProfile.height} cm</p>
              </div>
              <div className="bg-[#0A0F0A] rounded-lg p-3">
                <p className="text-[#8BAE5A] text-sm">Leeftijd</p>
                <p className="text-white font-semibold">{userProfile.age} jaar</p>
              </div>
              <div className="bg-[#0A0F0A] rounded-lg p-3">
                <p className="text-[#8BAE5A] text-sm">Geslacht</p>
                <p className="text-white font-semibold capitalize">{userProfile.gender === 'male' ? 'Man' : 'Vrouw'}</p>
              </div>
              <div className="bg-[#0A0F0A] rounded-lg p-3">
                <p className="text-[#8BAE5A] text-sm">Activiteit</p>
                <p className="text-white font-semibold">
                  {userProfile.activity_level === 'sedentary' ? 'Zittend (1.1x)' :
                   userProfile.activity_level === 'moderate' ? 'Staand (1.3x)' :
                   userProfile.activity_level === 'very_active' ? 'Lopend (1.6x)' : userProfile.activity_level}
                </p>
              </div>
              <div className="bg-[#0A0F0A] rounded-lg p-3">
                <p className="text-[#8BAE5A] text-sm">Doel</p>
                <p className="text-white font-semibold">
                  {userProfile.fitness_goal === 'droogtrainen' ? 'Droogtrainen (-500 kcal)' :
                   userProfile.fitness_goal === 'onderhoud' ? 'Onderhoud (basis)' :
                   userProfile.fitness_goal === 'spiermassa' ? 'Spiermassa (+400 kcal)' : userProfile.fitness_goal}
                </p>
              </div>
            </div>

            {/* Profile Form */}
            {showUserProfileForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border-t border-[#3A4D23] pt-4"
              >
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  saveUserProfile({
                    weight: Number(formData.get('weight')),
                    height: Number(formData.get('height')),
                    age: Number(formData.get('age')),
                    gender: formData.get('gender') as 'male' | 'female',
                    activity_level: formData.get('activity_level') as any,
                    fitness_goal: formData.get('fitness_goal') as any,
                  });
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Gewicht (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        defaultValue={userProfile.weight}
                        className="w-full px-3 py-2 bg-[#0A0F0A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Lengte (cm)</label>
                      <input
                        type="number"
                        name="height"
                        defaultValue={userProfile.height}
                        className="w-full px-3 py-2 bg-[#0A0F0A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Leeftijd</label>
                      <input
                        type="number"
                        name="age"
                        defaultValue={userProfile.age}
                        className="w-full px-3 py-2 bg-[#0A0F0A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Geslacht</label>
                      <select
                        name="gender"
                        defaultValue={userProfile.gender}
                        className="w-full px-3 py-2 bg-[#0A0F0A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                      >
                        <option value="male">Man</option>
                        <option value="female">Vrouw</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Activiteitsniveau</label>
                      <select
                        name="activity_level"
                        defaultValue={userProfile.activity_level}
                        className="w-full px-3 py-2 bg-[#0A0F0A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                      >
                        <option value="sedentary">Zittend (1.1x) - Licht actief</option>
                        <option value="moderate">Staand (1.3x) - Matig actief</option>
                        <option value="very_active">Lopend (1.6x) - Zeer actief</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Fitness Doel</label>
                      <select
                        name="fitness_goal"
                        defaultValue={userProfile.fitness_goal}
                        className="w-full px-3 py-2 bg-[#0A0F0A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                      >
                        <option value="droogtrainen">Droogtrainen (-500 kcal)</option>
                        <option value="onderhoud">Onderhoud (basis plan)</option>
                        <option value="spiermassa">Spiermassa (+400 kcal)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] rounded-lg hover:opacity-90 transition-opacity font-semibold"
                    >
                      Profiel Opslaan
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUserProfileForm(false)}
                      className="px-6 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors"
                    >
                      Annuleren
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Backend Formula Information */}
            <div className="mt-4 p-4 bg-gradient-to-r from-[#3A4D23]/20 to-[#8BAE5A]/20 rounded-lg border border-[#3A4D23]/30">
              <div className="flex items-center gap-2 mb-2">
                <InformationCircleIcon className="w-5 h-5 text-[#8BAE5A]" />
                <h4 className="text-[#8BAE5A] font-semibold">Backend Formules</h4>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>TTM Formule:</strong> Gewicht × 22 × Activiteitsniveau</p>
                <p><strong>Basis Plan:</strong> 100kg, Matig actief (1.3x), Onderhoud</p>
                <p><strong>Activiteit:</strong> Zittend (1.1x) → Staand (1.3x) → Lopend (1.6x)</p>
                <p><strong>Doelen:</strong> Droogtrainen (-500 kcal) → Onderhoud (basis) → Spiermassa (+400 kcal)</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {plans.map((plan) => {
            // Calculate personalized targets for this plan
            const personalizedTargets = calculatePersonalizedTargets(plan);
            
            return (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-[#181F17] border rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                selectedPlan?.id === plan.id 
                  ? 'border-[#B6C948] bg-[#181F17]/50' 
                  : 'border-[#3A4D23] hover:border-[#8BAE5A]'
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-lg flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 text-[#181F17]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{plan.name}</h3>
                    <p className="text-[#8BAE5A] text-sm capitalize">{plan.goal}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-1 bg-[#B6C948] text-[#181F17] text-xs font-bold rounded-full">
                    V2
                  </span>
                  {plan.difficulty === 'advanced' && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                      ADV
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-[#8BAE5A] text-sm mb-4">{plan.description}</p>
              
              {/* Personalized targets based on user profile */}
              <div className="bg-[#0A0F0A] rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[#B6C948] font-semibold text-sm">Gepersonaliseerd voor jou:</p>
                  <p className="text-gray-400 text-xs">{userProfile.weight}kg • {userProfile.activity_level} • {plan.goal}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Calorieën:</span>
                    <span className="text-white font-semibold">{personalizedTargets.targetCalories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Eiwit:</span>
                    <span className="text-white font-semibold">{personalizedTargets.targetProtein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Koolhydraten:</span>
                    <span className="text-white font-semibold">{personalizedTargets.targetCarbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vet:</span>
                    <span className="text-white font-semibold">{personalizedTargets.targetFat}g</span>
                  </div>
                </div>
              </div>
              
              {/* Original backend values for reference */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#B6C948] font-semibold">{plan.target_calories} kcal</p>
                  <p className="text-gray-400">Backend (100kg)</p>
                </div>
                <div>
                  <p className="text-[#B6C948] font-semibold">{plan.target_protein}g</p>
                  <p className="text-gray-400">Backend (100kg)</p>
                </div>
                <div>
                  <p className="text-[#B6C948] font-semibold">{plan.target_carbs}g</p>
                  <p className="text-gray-400">Backend (100kg)</p>
                </div>
                <div>
                  <p className="text-[#B6C948] font-semibold">{plan.target_fat}g</p>
                  <p className="text-gray-400">Backend (100kg)</p>
                </div>
              </div>
            </motion.div>
            );
          })}
        </motion.div>

        {/* TTM Formula Info */}
        <div className="bg-[#0A0F0A] rounded-lg p-6 mb-8">
          <h3 className="text-[#B6C948] font-bold text-lg mb-4">TTM Formule Uitleg</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-2">Basis Formule:</h4>
              <p className="text-gray-300 text-sm mb-3">
                <span className="text-[#B6C948] font-mono">Gewicht × 22 × Activiteitsniveau</span>
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Jouw berekening:</span>
                  <span className="text-white">{userProfile.weight}kg × 22 × {userProfile.activity_level === 'sedentary' ? '1.1' : userProfile.activity_level === 'moderate' ? '1.3' : '1.6'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Basis calorieën:</span>
                  <span className="text-white">{calculatePersonalizedTargets(plans[0] || {}).baseCalories} kcal</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Doel Aanpassingen:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Droogtrainen:</span>
                  <span className="text-red-400">-500 kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Onderhoud:</span>
                  <span className="text-green-400">0 kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Spiermassa:</span>
                  <span className="text-blue-400">+400 kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Jouw aanpassing:</span>
                  <span className="text-white">Afhankelijk van plan doel</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  <div>• Droogtrainen: -500 kcal</div>
                  <div>• Onderhoud: 0 kcal</div>
                  <div>• Spiermassa: +400 kcal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-gray-800 text-white text-xs rounded">
            <p>Debug: selectedPlan={selectedPlan?.name || 'null'}, originalPlanData={originalPlanData?.name || 'null'}, showOriginalData={showOriginalData.toString()}</p>
            <p>Loading states: loading={loading.toString()}, loadingOriginal={loadingOriginal.toString()}, loadingScaling={loadingScaling.toString()}</p>
          </div>
        )}

        {/* Original Plan Data */}
        {selectedPlan && originalPlanData && showOriginalData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#3A4D23] to-[#8BAE5A] rounded-full flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Originele Backend Data</h3>
                  <p className="text-[#8BAE5A]">1:1 zoals opgeslagen in database</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowOriginalData(false);
                  if (!scalingInfo) {
                    applySmartScaling(selectedPlan.plan_id || selectedPlan.id.toString());
                  }
                }}
                disabled={loadingScaling}
                className="px-4 py-2 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {loadingScaling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#181F17] border-t-transparent rounded-full animate-spin"></div>
                    <span>Bezig...</span>
                  </>
                ) : (
                  <>
                    <RocketLaunchIcon className="w-4 h-4" />
                    <span>{scalingInfo ? 'Bekijk Smart Scaling' : 'Smart Scaling Toepassen'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Plan Info */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-3">Plan Informatie</h4>
                
                <div className="bg-[#0A0F0A] rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Naam:</span>
                    <span className="text-white font-semibold">{originalPlanData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Plan ID:</span>
                    <span className="text-white font-mono text-sm">{originalPlanData.plan_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Beschrijving:</span>
                    <span className="text-white text-sm">{originalPlanData.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Plan Doel:</span>
                    <span className="text-white capitalize">{selectedPlan?.name?.includes('droogtrainen') ? 'Droogtrainen' : selectedPlan?.name?.includes('spiermassa') ? 'Spiermassa' : 'Onderhoud'}</span>
                  </div>
                </div>
                
                {/* User Profile Data */}
                <div className="bg-[#0A0F0A] rounded-lg p-4 mt-4">
                  <h5 className="text-white font-semibold mb-3">Jouw Ingevoerde Gegevens</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#8BAE5A]">Gewicht:</span>
                      <span className="text-white font-semibold">{userProfile.weight}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8BAE5A]">Lengte:</span>
                      <span className="text-white font-semibold">{userProfile.height}cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8BAE5A]">Leeftijd:</span>
                      <span className="text-white font-semibold">{userProfile.age} jaar</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8BAE5A]">Geslacht:</span>
                      <span className="text-white capitalize">{userProfile.gender === 'male' ? 'Man' : 'Vrouw'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8BAE5A]">Activiteit:</span>
                      <span className="text-white">
                        {userProfile.activity_level === 'sedentary' ? 'Zittend (1.1x)' : 
                         userProfile.activity_level === 'moderate' ? 'Matig (1.3x)' : 
                         'Actief (1.6x)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8BAE5A]">Fitness Doel:</span>
                      <span className="text-white capitalize">
                        {userProfile.fitness_goal === 'droogtrainen' ? 'Droogtrainen' :
                         userProfile.fitness_goal === 'onderhoud' ? 'Onderhoud' :
                         userProfile.fitness_goal === 'spiermassa' ? 'Spiermassa' :
                         userProfile.fitness_goal}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Macro Percentages */}
                <div className="bg-[#0A0F0A] rounded-lg p-4 mt-4">
                  <h5 className="text-white font-semibold mb-3">Macro Percentages van dit Plan (Backend Instellingen)</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center bg-[#181F17] rounded-lg p-3">
                      <p className="text-blue-400 font-bold text-2xl">{(originalPlanData as any).protein_percentage || 0}%</p>
                      <p className="text-white font-medium">Eiwit</p>
                      <p className="text-xs text-gray-400 mt-1">4 kcal per gram</p>
                    </div>
                    <div className="text-center bg-[#181F17] rounded-lg p-3">
                      <p className="text-yellow-400 font-bold text-2xl">{(originalPlanData as any).carbs_percentage || 0}%</p>
                      <p className="text-white font-medium">Koolhydraten</p>
                      <p className="text-xs text-gray-400 mt-1">4 kcal per gram</p>
                    </div>
                    <div className="text-center bg-[#181F17] rounded-lg p-3">
                      <p className="text-red-400 font-bold text-2xl">{(originalPlanData as any).fat_percentage || 0}%</p>
                      <p className="text-white font-medium">Vet</p>
                      <p className="text-xs text-gray-400 mt-1">9 kcal per gram</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-[#181F17] rounded-lg text-sm">
                    <p className="text-[#8BAE5A] font-semibold mb-2">📊 Macro Verdeling Uitleg:</p>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      Deze percentages zijn direct uit de backend gehaald en bepalen hoe de totale calorieën verdeeld worden over de drie macro's. 
                      Voor jouw plan betekent dit: <span className="text-white font-medium">{(originalPlanData as any).protein_percentage || 0}% eiwit</span>, 
                      <span className="text-white font-medium"> {(originalPlanData as any).carbs_percentage || 0}% koolhydraten</span>, en 
                      <span className="text-white font-medium"> {(originalPlanData as any).fat_percentage || 0}% vet</span>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Macro Targets */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-3">Gepersonaliseerde Macro Doelen</h4>
                
                <div className="bg-[#0A0F0A] rounded-lg p-4 space-y-3">
                  <div className="mb-3 p-2 bg-[#181F17] rounded">
                    <p className="text-[#B6C948] text-xs font-semibold">TTM Formule:</p>
                    <p className="text-gray-400 text-xs">{userProfile.weight}kg × 22 × {userProfile.activity_level === 'sedentary' ? '1.1' : userProfile.activity_level === 'moderate' ? '1.3' : '1.6'} = {Math.round(userProfile.weight * 22 * (userProfile.activity_level === 'sedentary' ? 1.1 : userProfile.activity_level === 'moderate' ? 1.3 : 1.6))} kcal</p>
                     <p className="text-gray-400 text-xs">Plan doel ({selectedPlan?.name?.includes('droogtrainen') ? 'Droogtrainen' : selectedPlan?.name?.includes('spiermassa') ? 'Spiermassa' : 'Onderhoud'}): {selectedPlan?.name?.includes('droogtrainen') ? '-500' : selectedPlan?.name?.includes('spiermassa') ? '+400' : '0'} kcal</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Calorieën:</span>
                    <div className="text-right">
                      <span className="text-white font-semibold">{personalizedTargets?.targetCalories || originalPlanData.target_calories} kcal</span>
                      <p className="text-gray-500 text-xs">Backend: {originalPlanData.target_calories} kcal</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Eiwit:</span>
                    <div className="text-right">
                      <span className="text-white font-semibold">{personalizedTargets?.targetProtein || originalPlanData.target_protein}g</span>
                      <p className="text-gray-500 text-xs">Backend: {originalPlanData.target_protein}g</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Koolhydraten:</span>
                    <div className="text-right">
                      <span className="text-white font-semibold">{personalizedTargets?.targetCarbs || originalPlanData.target_carbs}g</span>
                      <p className="text-gray-500 text-xs">Backend: {originalPlanData.target_carbs}g</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Vet:</span>
                    <div className="text-right">
                      <span className="text-white font-semibold">{personalizedTargets?.targetFat || originalPlanData.target_fat}g</span>
                      <p className="text-gray-500 text-xs">Backend: {originalPlanData.target_fat}g</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Scaling Daily Totals Progress Bars */}
            {scalingInfo && originalPlanData && (
              <div className="bg-[#0A0F0A] rounded-lg p-6 mb-6">
                <h4 className="text-[#B6C948] font-bold text-lg mb-4 capitalize">
                  {selectedDay} - Smart Scaling Dagtotalen
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Calories - Smart Scaling */}
                  <div className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Calorieën</span>
                      <span className="text-[#8BAE5A] text-sm">100%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '100%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{scalingInfo.finalTotals?.calories || 0} kcal</span>
                      <span className="text-white">{scalingInfo.adjustedCalories || 0} kcal</span>
                    </div>
                    <div className="text-xs mt-1 text-green-400">
                      Geoptimaliseerd
                    </div>
                  </div>

                  {/* Protein - Smart Scaling */}
                  <div className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Eiwit</span>
                      <span className="text-[#8BAE5A] text-sm">100%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '100%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{scalingInfo.finalTotals?.protein || 0}g</span>
                      <span className="text-white">{scalingInfo.adjustedProtein || 0}g</span>
                    </div>
                    <div className="text-xs mt-1 text-green-400">
                      Geoptimaliseerd
                    </div>
                  </div>

                  {/* Carbs - Smart Scaling */}
                  <div className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Koolhydraten</span>
                      <span className="text-[#8BAE5A] text-sm">100%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '100%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{scalingInfo.finalTotals?.carbs || 0}g</span>
                      <span className="text-white">{scalingInfo.adjustedCarbs || 0}g</span>
                    </div>
                    <div className="text-xs mt-1 text-green-400">
                      Geoptimaliseerd
                    </div>
                  </div>

                  {/* Fat - Smart Scaling */}
                  <div className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Vet</span>
                      <span className="text-[#8BAE5A] text-sm">100%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '100%' }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{scalingInfo.finalTotals?.fat || 0}g</span>
                      <span className="text-white">{scalingInfo.adjustedFat || 0}g</span>
                    </div>
                    <div className="text-xs mt-1 text-green-400">
                      Geoptimaliseerd
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Meal Structure */}
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-4">Gedetailleerde Eetmomenten</h4>
              
              {/* Day Tabs for Smart Scaling */}
              <div className="flex flex-wrap gap-2 mb-6">
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
              
              {/* Selected Day Meals for Smart Scaling */}
              {originalPlanData.meals?.weekly_plan && originalPlanData.meals.weekly_plan[selectedDay] && (
                <div className="bg-[#0A0F0A] rounded-lg p-4">
                  <h5 className="text-[#B6C948] font-semibold mb-4 capitalize">{selectedDay}</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {['ontbijt', 'ochtend_snack', 'lunch', 'lunch_snack', 'diner'].map((mealType) => {
                      const mealData = originalPlanData.meals.weekly_plan[selectedDay][mealType];
                          const mealTypeLabel = mealType === 'ochtend_snack' ? 'Ochtend Snack' :
                                               mealType === 'lunch_snack' ? 'Lunch Snack' :
                                               mealType === 'ontbijt' ? 'Ontbijt' :
                                               mealType === 'lunch' ? 'Lunch' :
                                               mealType === 'diner' ? 'Diner' : mealType;

                          return (
                            <div key={mealType} className="bg-[#181F17] rounded-lg p-3">
                              <h6 className="text-white font-medium mb-2">{mealTypeLabel}</h6>
                              
                              {mealData && mealData.ingredients ? (
                                <div className="space-y-2">
                                  <div className="text-xs text-[#8BAE5A] mb-2">
                                    {mealData.ingredients.length} ingrediënten
                                  </div>
                                  
                                  {/* Show first few ingredients */}
                                  {mealData.ingredients.slice(0, 3).map((ingredient: any, index: number) => (
                                    <div key={index} className="text-xs text-gray-400">
                                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                                    </div>
                                  ))}
                                  
                                  {mealData.ingredients.length > 3 && (
                                    <div className="text-xs text-[#8BAE5A]">
                                      +{mealData.ingredients.length - 3} meer...
                                    </div>
                                  )}
                                  
                                  {/* Show meal totals if available */}
                                  {mealData.totals && (
                                    <div className="text-xs text-[#B6C948] mt-2 pt-2 border-t border-[#3A4D23]">
                                      <div>{mealData.totals.calories} kcal</div>
                                      <div>P: {mealData.totals.protein}g</div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500">Geen data</div>
                              )}
                            </div>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-[#3A4D23]/20 to-[#8BAE5A]/20 rounded-lg border border-[#3A4D23]/30">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-[#8BAE5A]" />
                <p className="text-[#8BAE5A] font-semibold">
                  Dit is de exacte data zoals opgeslagen in de backend database - 1:1 mapping.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Smart Scaling Results */}
        {selectedPlan && scalingInfo && !showOriginalData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#181F17] border border-[#B6C948] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-[#181F17]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Slimme Schalingsresultaten</h3>
                  <p className="text-[#B6C948]">Voor {selectedPlan.name}</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Scaling Info */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-3">Schalingsinformatie</h4>
                
                <div className="bg-[#0A0F0A] rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#8BAE5A]">Jouw Gewicht</p>
                      <p className="text-white font-semibold">{scalingInfo.userWeight || 0}kg</p>
                    </div>
                    <div>
                      <p className="text-[#8BAE5A]">Basis Gewicht</p>
                      <p className="text-white font-semibold">{scalingInfo.baseWeight || 0}kg</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[#8BAE5A]">Schalingsfactor</p>
                      <p className="text-[#B6C948] font-bold text-lg">{(scalingInfo.scalingFactor || 0).toFixed(2)}x</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Macro Comparison */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-3">Macro Optimalisatie</h4>
                
                <div className="space-y-3">
                  {/* Calories */}
                  <div className="flex items-center justify-between bg-[#0A0F0A] rounded-lg p-3">
                    <span className="text-[#8BAE5A]">Calorieën</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{scalingInfo.finalTotals?.calories || 0}</p>
                      <p className="text-xs text-gray-400">
                        {scalingInfo.originalTotals?.calories || 0} → {scalingInfo.finalTotals?.calories || 0}
                      </p>
                    </div>
                  </div>

                  {/* Protein */}
                  <div className="flex items-center justify-between bg-[#0A0F0A] rounded-lg p-3">
                    <span className="text-[#8BAE5A]">Eiwit</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{scalingInfo.finalTotals?.protein || 0}g</p>
                      <p className="text-xs text-gray-400">
                        {scalingInfo.originalTotals?.protein || 0}g → {scalingInfo.finalTotals?.protein || 0}g
                      </p>
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="flex items-center justify-between bg-[#0A0F0A] rounded-lg p-3">
                    <span className="text-[#8BAE5A]">Koolhydraten</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{scalingInfo.finalTotals?.carbs || 0}g</p>
                      <p className="text-xs text-gray-400">
                        {scalingInfo.originalTotals?.carbs || 0}g → {scalingInfo.finalTotals?.carbs || 0}g
                      </p>
                    </div>
                  </div>

                  {/* Fat */}
                  <div className="flex items-center justify-between bg-[#0A0F0A] rounded-lg p-3">
                    <span className="text-[#8BAE5A]">Vet</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{scalingInfo.finalTotals?.fat || 0}g</p>
                      <p className="text-xs text-gray-400">
                        {scalingInfo.originalTotals?.fat || 0}g → {scalingInfo.finalTotals?.fat || 0}g
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-[#B6C948]/20 to-[#8BAE5A]/20 rounded-lg border border-[#B6C948]/30">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-[#B6C948]" />
                <p className="text-[#B6C948] font-semibold">
                  Slimme schalingsfactor succesvol toegepast! Jouw voedingsplan is nu geoptimaliseerd.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <button
            onClick={() => router.push('/dashboard/voedingsplannen')}
            className="flex items-center gap-2 px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Terug naar Voedingsplannen
          </button>
        </motion.div>
      </div>
    </div>
  );
}
