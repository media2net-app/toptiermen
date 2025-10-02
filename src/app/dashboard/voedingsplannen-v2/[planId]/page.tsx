'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
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
    weekly_plan: Record<string, any>;
  };
}

interface UserProfile {
  weight: number;
  height: number;
  age: number;
  gender: string;
  activity_level: string;
  fitness_goal: string;
}

interface DayTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function NutritionPlanDetailPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { hasAccess, loading: subscriptionLoading } = useSubscription();
  const router = useRouter();
  const params = useParams();
  const planId = params?.planId as string;

  // State management
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [originalPlanData, setOriginalPlanData] = useState<OriginalPlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingOriginal, setLoadingOriginal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    weight: 100,
    height: 180,
    age: 30,
    gender: 'male',
    activity_level: 'moderate',
    fitness_goal: 'onderhoud'
  });
  const [selectedDay, setSelectedDay] = useState<string>('maandag');
  const [customAmounts, setCustomAmounts] = useState<{[key: string]: number}>({});
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [editingMealType, setEditingMealType] = useState<string>('');
  const [editingDay, setEditingDay] = useState<string>('');
  const [showSimpleModal, setShowSimpleModal] = useState(false);
  // Debug panel
  const [showDebug, setShowDebug] = useState<boolean>(true);

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

  // Check access
  const hasBasicAccess = !authLoading && user;

  // Define fetchPlans function first to avoid hoisting issues
  const fetchPlans = useCallback(async () => {
    try {
      console.log('🔧 DEBUG: fetchPlans called');
      setLoading(true);
      const response = await fetch('/api/nutrition-plans', { cache: 'no-store' });
      
      console.log('🔧 DEBUG: fetchPlans response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch nutrition plans: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🔧 DEBUG: fetchPlans data received:', { plansCount: data.plans?.length || 0, plans: data.plans });
      setPlans(data.plans || []);
      console.log('🔧 DEBUG: Plans state updated, setting loading to false');
    } catch (err) {
      console.error('🔧 DEBUG: fetchPlans error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      console.log('🔧 DEBUG: Setting loading to false in finally block');
      setLoading(false);
    }
  }, []);

  // Fetch user profile when component loads
  useEffect(() => {
    fetchUserProfile();
  }, [user?.id]);

  useEffect(() => {
    console.log('🔍 Access check useEffect triggered:', { authLoading, hasBasicAccess, userEmail: user?.email });
    
    // Wait for auth to load before checking access
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...');
      return;
    }
    
    // Check if user is authenticated
    if (!hasBasicAccess) {
      console.log('🚫 No authenticated user, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('✅ Access granted to voedingsplannen-v2 for:', user?.email);
    fetchPlans();
  }, [hasBasicAccess, router, authLoading, user, fetchPlans]);

  const loadOriginalPlanData = useCallback(async (planId: string) => {
    try {
      console.log('🔧 DEBUG: loadOriginalPlanData called with planId:', planId);
      setLoadingOriginal(true);
      // Prefer admin meals endpoint to ensure we mirror exact backend meals + nutrition
      const response = await fetch(`/api/admin/plan-meals?planId=${planId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch plan meals: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔧 DEBUG: Plan meals data received:', data);
      const plan = data?.plan || data;
      setOriginalPlanData(plan);
    } catch (err) {
      console.error('🔧 DEBUG: Error loading original plan data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load plan data');
    } finally {
      setLoadingOriginal(false);
    }
  }, []);

  // Define fetchUserProfile function outside useEffect so it can be reused
  const fetchUserProfile = async () => {
    if (!user?.id) {
      console.log('❌ No user ID available for profile fetch');
      return;
    }

    try {
      console.log('🔍 Fetching user profile for user:', user.id);
      const response = await fetch(`/api/nutrition-profile-v2?userId=${user.id}`, { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ User profile fetched:', data);
      
      if (data.profile) {
        setUserProfile({
          weight: data.profile.weight || 100,
          height: data.profile.height || 180,
          age: data.profile.age || 30,
          gender: data.profile.gender || 'male',
          activity_level: data.profile.activity_level || 'moderate',
          fitness_goal: data.profile.fitness_goal || 'onderhoud'
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Find the selected plan based on planId
  useEffect(() => {
    if (plans.length > 0 && planId) {
      const plan = plans.find(p => p.plan_id === planId || String(p.id) === String(planId));
      if (plan) {
        setSelectedPlan(plan);
        // Use numeric id for admin endpoint
        loadOriginalPlanData(plan.id.toString());
      }
    }
  }, [plans, planId, loadOriginalPlanData]);

  // Removed all smart-scaling logic. Use backend plan targets as-is.

  // Get current ingredients for a specific meal and day
  const getCurrentIngredients = (mealType: string, day: string) => {
    console.log('🔧 DEBUG: getCurrentIngredients called with:', { mealType, day, originalPlanData: !!originalPlanData });
    
    if (!originalPlanData?.meals?.weekly_plan?.[day]?.[mealType]) {
      console.log('🔧 DEBUG: No meal data found for:', { mealType, day });
      return [];
    }
    
    const meal = originalPlanData.meals.weekly_plan[day][mealType];
    console.log('🔧 DEBUG: Meal data found:', meal);
    
    if (meal.ingredients && Array.isArray(meal.ingredients)) {
      return meal.ingredients;
    }
    
    return [];
  };

  // Function to get ingredient key for custom amounts
  const getIngredientKey = (mealType: string, ingredientName: string, day: string) => {
    return `${day}_${mealType}_${ingredientName}`;
  };

  // Open ingredient edit modal
  const openIngredientModal = (mealType: string, day: string) => {
    console.log('🔧 DEBUG: openIngredientModal called with:', { mealType, day });
    setEditingMealType(mealType);
    setEditingDay(day);
    setShowIngredientModal(true);
  };

  // Calculate day totals
  const calculateDayTotals = (day: string): DayTotals => {
    if (!originalPlanData?.meals?.weekly_plan?.[day]) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    
    const dayData = originalPlanData.meals.weekly_plan[day];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    Object.keys(dayData).forEach(mealType => {
      const meal = dayData[mealType];
      // Prefer backend meal.nutrition if present to mirror backend precisely
      if (meal && meal.nutrition && typeof meal.nutrition === 'object') {
        totalCalories += Number(meal.nutrition.calories) || 0;
        totalProtein += Number(meal.nutrition.protein) || 0;
        totalCarbs += Number(meal.nutrition.carbs) || 0;
        totalFat += Number(meal.nutrition.fat) || 0;
        return;
      }
      // Otherwise compute from ingredient list
      if (meal && meal.ingredients && Array.isArray(meal.ingredients)) {
        let mealTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        meal.ingredients.forEach((ingredient: any) => {
          const ingredientKey = getIngredientKey(mealType, ingredient.name, day);
          const customAmount = customAmounts[ingredientKey];
          let amount = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
          const unit = String(ingredient.unit || '').toLowerCase();
          let multiplier = 1;
          if (['per_piece','stuk','per_plakje','handje','per_handful'].includes(unit)) {
            multiplier = amount;
          } else if (['per_100g','g','gram'].includes(unit)) {
            multiplier = amount / 100;
          } else if (['per_30g'].includes(unit)) {
            multiplier = (amount * 30) / 100;
          } else if (['per_ml','ml'].includes(unit)) {
            multiplier = amount / 100; // assume 1ml ≈ 1g
          } else if (['per_tbsp','tbsp','eetlepel'].includes(unit)) {
            multiplier = (amount * 15) / 100; // 1 tbsp = 15ml
          } else if (['per_tsp','tsp','theelepel'].includes(unit)) {
            multiplier = (amount * 5) / 100; // 1 tsp = 5ml
          } else if (['per_cup','cup','kop'].includes(unit)) {
            multiplier = (amount * 240) / 100; // 1 cup = 240ml
          } else {
            multiplier = amount / 100;
          }
          mealTotals.calories += (Number(ingredient.calories_per_100g) || 0) * multiplier;
          mealTotals.protein += (Number(ingredient.protein_per_100g) || 0) * multiplier;
          mealTotals.carbs += (Number(ingredient.carbs_per_100g) || 0) * multiplier;
          mealTotals.fat += (Number(ingredient.fat_per_100g) || 0) * multiplier;
        });
        totalCalories += mealTotals.calories;
        totalProtein += mealTotals.protein;
        totalCarbs += mealTotals.carbs;
        totalFat += mealTotals.fat;
      }
    });
    
    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10
    };
  };

  // Function to calculate macro percentages - FIXED
  const getMacroPercentages = (calories: number, protein: number, carbs: number, fat: number) => {
    const totalCalories = calories;
    if (totalCalories === 0) return { protein: 0, carbs: 0, fat: 0 };
    
    // Protein: 4 kcal per gram, Carbs: 4 kcal per gram, Fat: 9 kcal per gram
    const proteinCalories = protein * 4;
    const carbsCalories = carbs * 4;
    const fatCalories = fat * 9;
    
    const proteinPercent = Math.round((proteinCalories / totalCalories) * 100);
    const carbsPercent = Math.round((carbsCalories / totalCalories) * 100);
    const fatPercent = Math.round((fatCalories / totalCalories) * 100);
    
    console.log('🔧 DEBUG: Macro percentages:', {
      totalCalories,
      protein: `${protein}g (${proteinCalories} kcal)`,
      carbs: `${carbs}g (${carbsCalories} kcal)`,
      fat: `${fat}g (${fatCalories} kcal)`,
      proteinPercent: `${proteinPercent}%`,
      carbsPercent: `${carbsPercent}%`,
      fatPercent: `${fatPercent}%`
    });
    
    return {
      protein: proteinPercent,
      carbs: carbsPercent,
      fat: fatPercent
    };
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

  // Get progress percentage for progress bars (legacy function)
  const getProgressPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-gray-400">Laden...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/voedingsplannen-v2')}
            className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors"
          >
            Terug naar overzicht
          </button>
        </div>
      </div>
    );
  }

  // Check access permissions for nutrition plans
  if (!hasAccess('nutrition')) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center">
                <BookOpenIcon className="w-12 h-12 text-[#0A0F0A]" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Voedingsplannen V2</h1>
              <p className="text-xl text-gray-300 mb-8">
                Upgrade naar Premium of Lifetime voor toegang tot voedingsplannen
              </p>
            </div>
            
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">🚀 Upgrade je Account</h2>
              <p className="text-gray-300 mb-6">
                Voedingsplannen zijn alleen beschikbaar voor Premium en Lifetime leden. 
                Upgrade nu om toegang te krijgen tot:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-[#181F17] rounded-lg">
                  <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                    <BookOpenIcon className="w-4 h-4 text-[#0A0F0A]" />
                  </div>
                  <span className="text-white font-medium">Voedingsplannen V2</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#181F17] rounded-lg">
                  <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                    <RocketLaunchIcon className="w-4 h-4 text-[#0A0F0A]" />
                  </div>
                  <span className="text-white font-medium">AI-Optimalisatie</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#181F17] rounded-lg">
                  <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                    <ChartBarIcon className="w-4 h-4 text-[#0A0F0A]" />
                  </div>
                  <span className="text-white font-medium">Slimme Schaling</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#181F17] rounded-lg">
                  <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-[#0A0F0A]" />
                  </div>
                  <span className="text-white font-medium">Persoonlijke Plannen</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => {
                    alert('Mocht je deze onderdelen willen neem dan contact op met Rick voor het upgraden van je pakket');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#0A0F0A] font-bold rounded-lg hover:from-[#7A9E4A] hover:to-[#A6C838] transition-all duration-200 transform hover:scale-105"
                >
                  Upgrade naar Premium
                </button>
                <button 
                  onClick={() => {
                    alert('Mocht je deze onderdelen willen neem dan contact op met Rick voor het upgraden van je pakket');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0A0F0A] font-bold rounded-lg hover:from-[#E6C200] hover:to-[#E69500] transition-all duration-200 transform hover:scale-105"
                >
                  Upgrade naar Lifetime
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Plan not found
  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <InformationCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-400 mb-4">Voedingsplan niet gevonden</p>
          <button
            onClick={() => router.push('/dashboard/voedingsplannen-v2')}
            className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors"
          >
            Terug naar overzicht
          </button>
        </div>
      </div>
    );
  }

  // Use plan-led targets (backend) directly without scaling
  const personalizedMacros = useMemo(
    () => ({
      calories: selectedPlan?.target_calories || 0,
      protein: selectedPlan?.target_protein || 0,
      carbs: selectedPlan?.target_carbs || 0,
      fat: selectedPlan?.target_fat || 0,
    }),
    [selectedPlan]
  );
  // Get current day totals - recalculate when customAmounts change
  const dayTotals = useMemo(() => {
    if (!originalPlanData) {
      console.log('🔄 No originalPlanData available, returning zeros');
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    console.log('🔄 Recalculating day totals due to customAmounts change');
    return calculateDayTotals(selectedDay);
  }, [selectedDay, customAmounts, originalPlanData]);

  // Debug helpers inside component
  const backendTotals = useMemo(() => {
    if (!originalPlanData?.meals?.weekly_plan?.[selectedDay]) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const dayData: any = originalPlanData.meals.weekly_plan[selectedDay];
    let t = { calories: 0, protein: 0, carbs: 0, fat: 0 } as any;
    Object.values(dayData).forEach((meal: any) => {
      if (meal?.nutrition) {
        t.calories += Number(meal.nutrition.calories) || 0;
        t.protein += Number(meal.nutrition.protein) || 0;
        t.carbs += Number(meal.nutrition.carbs) || 0;
        t.fat += Number(meal.nutrition.fat) || 0;
      }
    });
    return {
      calories: Math.round(t.calories),
      protein: Math.round(t.protein * 10) / 10,
      carbs: Math.round(t.carbs * 10) / 10,
      fat: Math.round(t.fat * 10) / 10,
    };
  }, [originalPlanData, selectedDay]);

  const ingredientTotals = useMemo(() => {
    if (!originalPlanData?.meals?.weekly_plan?.[selectedDay]) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const dayData: any = originalPlanData.meals.weekly_plan[selectedDay];
    let t = { calories: 0, protein: 0, carbs: 0, fat: 0 } as any;
    Object.entries(dayData).forEach(([mealType, meal]: any) => {
      if (meal?.ingredients && Array.isArray(meal.ingredients)) {
        meal.ingredients.forEach((ingredient: any) => {
          const ingredientKey = `${selectedDay}_${mealType}_${ingredient.name}`;
          const customAmount = (customAmounts as any)[ingredientKey];
          let amount = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
          const unit = String(ingredient.unit || '').toLowerCase();
          let multiplier = 1;
          if (['per_piece','stuk','per_plakje','handje','per_handful'].includes(unit)) {
            multiplier = amount;
          } else if (['per_100g','g','gram'].includes(unit)) {
            multiplier = amount / 100;
          } else if (['per_30g'].includes(unit)) {
            multiplier = (amount * 30) / 100;
          } else if (['per_ml','ml'].includes(unit)) {
            multiplier = amount / 100;
          } else if (['per_tbsp','tbsp','eetlepel'].includes(unit)) {
            multiplier = (amount * 15) / 100;
          } else if (['per_tsp','tsp','theelepel'].includes(unit)) {
            multiplier = (amount * 5) / 100;
          } else if (['per_cup','cup','kop'].includes(unit)) {
            multiplier = (amount * 240) / 100;
          } else {
            multiplier = amount / 100;
          }
          t.calories += (Number(ingredient.calories_per_100g) || 0) * multiplier;
          t.protein += (Number(ingredient.protein_per_100g) || 0) * multiplier;
          t.carbs += (Number(ingredient.carbs_per_100g) || 0) * multiplier;
          t.fat += (Number(ingredient.fat_per_100g) || 0) * multiplier;
        });
      }
    });
    return {
      calories: Math.round(t.calories),
      protein: Math.round(t.protein * 10) / 10,
      carbs: Math.round(t.carbs * 10) / 10,
      fat: Math.round(t.fat * 10) / 10,
    };
  }, [originalPlanData, customAmounts, selectedDay]);


  // Get progress info for each macro using personalized targets
  const caloriesProgress = getProgressInfo(dayTotals.calories, personalizedMacros.calories);
  const proteinProgress = getProgressInfo(dayTotals.protein, personalizedMacros.protein);
  const carbsProgress = getProgressInfo(dayTotals.carbs, personalizedMacros.carbs);
  const fatProgress = getProgressInfo(dayTotals.fat, personalizedMacros.fat);

  // Calculate macro percentages for display
  const macroPercentages = getMacroPercentages(
    personalizedMacros.calories,
    personalizedMacros.protein,
    personalizedMacros.carbs,
    personalizedMacros.fat
  );

  // Debug: per-meal comparison between backend nutrition and recomputed ingredients
  const mealComparisons = useMemo(() => {
    const out: Array<{ mealType: string; label: string; backend: DayTotals; computed: DayTotals; delta: DayTotals } > = [];
    const dayData: any = originalPlanData?.meals?.weekly_plan?.[selectedDay];
    if (!dayData) return out;
    const mealOrder = ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'];
    mealOrder.forEach((mealType) => {
      const meal = dayData[mealType];
      if (!meal?.ingredients) return;
      const label = mealType === 'ochtend_snack' ? 'Ochtend Snack' :
                    mealType === 'lunch_snack' ? 'Lunch Snack' :
                    mealType === 'avond_snack' ? 'Avond Snack' :
                    mealType.charAt(0).toUpperCase() + mealType.slice(1);

      // backend nutrition (rounded)
      const backend: DayTotals = meal?.nutrition ? {
        calories: Math.round(Number(meal.nutrition.calories) || 0),
        protein: Math.round(((Number(meal.nutrition.protein) || 0)) * 10) / 10,
        carbs:   Math.round(((Number(meal.nutrition.carbs)   || 0)) * 10) / 10,
        fat:     Math.round(((Number(meal.nutrition.fat)     || 0)) * 10) / 10,
      } : { calories: 0, protein: 0, carbs: 0, fat: 0 };

      // computed from ingredients
      let c = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      meal.ingredients.forEach((ingredient: any) => {
        const key = `${selectedDay}_${mealType}_${ingredient.name}`;
        const customAmount = (customAmounts as any)[key];
        let amount = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
        const unit = String(ingredient.unit || '').toLowerCase();
        let mult = 1;
        if (['per_piece','stuk','stuks','per_plakje','plakje','plakjes','handje','per_handful'].includes(unit)) mult = amount;
        else if (['per_100g','g','gram'].includes(unit)) mult = amount / 100;
        else if (['per_ml','ml'].includes(unit)) mult = amount / 100;
        else if (['per_tbsp','tbsp','eetlepel'].includes(unit)) mult = (amount * 15) / 100;
        else if (['per_tsp','tsp','theelepel'].includes(unit)) mult = (amount * 5) / 100;
        else if (['per_cup','cup','kop'].includes(unit)) mult = (amount * 240) / 100;
        else if (['per_30g'].includes(unit)) mult = (amount * 30) / 100;
        else mult = amount / 100;
        c.calories += (Number(ingredient.calories_per_100g)||0) * mult;
        c.protein  += (Number(ingredient.protein_per_100g)||0)  * mult;
        c.carbs    += (Number(ingredient.carbs_per_100g)||0)    * mult;
        c.fat      += (Number(ingredient.fat_per_100g)||0)      * mult;
      });
      const computed: DayTotals = {
        calories: Math.round(c.calories),
        protein: Math.round(c.protein * 10) / 10,
        carbs:   Math.round(c.carbs   * 10) / 10,
        fat:     Math.round(c.fat     * 10) / 10,
      };
      const delta: DayTotals = {
        calories: +(computed.calories - backend.calories).toFixed(1),
        protein:  +(computed.protein  - backend.protein ).toFixed(1),
        carbs:    +(computed.carbs    - backend.carbs   ).toFixed(1),
        fat:      +(computed.fat      - backend.fat     ).toFixed(1),
      };
      out.push({ mealType, label, backend, computed, delta });
    });
    return out;
  }, [originalPlanData, selectedDay, customAmounts]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="bg-[#181F17] border-b border-[#2A2A2A] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/dashboard/voedingsplannen-v2')}
              className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <RocketLaunchIcon className="h-8 w-8 text-[#8BAE5A]" />
            <h1 className="text-2xl font-bold">{selectedPlan.name}</h1>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowDebug(d => !d)}
                className="px-3 py-1 rounded text-sm border bg-[#232D1A] text-white border-[#3A4D23] hover:bg-[#2A2A2A]"
                title="Debug panel"
              >
                Debug
              </button>
            </div>
          </div>
          <p className="text-gray-400">{selectedPlan.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* User Profile Section */}
        <div className="bg-[#181F17] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-[#8BAE5A]" />
            Jouw Profiel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#232D1A] rounded-lg p-4">
              <h3 className="text-sm text-gray-400 mb-1">Gewicht</h3>
              <p className="text-lg font-semibold">{userProfile.weight} kg</p>
            </div>
            <div className="bg-[#232D1A] rounded-lg p-4">
              <h3 className="text-sm text-gray-400 mb-1">Activiteitsniveau</h3>
              <p className="text-lg font-semibold">
                {userProfile.activity_level === 'sedentary' ? 'Zittend (Licht actief)' :
                 userProfile.activity_level === 'moderate' ? 'Staand (Matig actief)' :
                 userProfile.activity_level === 'very_active' ? 'Lopend (Zeer actief)' :
                 'Staand (Matig actief)'}
              </p>
            </div>
            <div className="bg-[#232D1A] rounded-lg p-4">
              <h3 className="text-sm text-gray-400 mb-1">Fitness Doel</h3>
              <p className="text-lg font-semibold">
                {userProfile.fitness_goal === 'droogtrainen' ? 'Droogtrainen (-500 kcal)' : 
                 userProfile.fitness_goal === 'spiermassa' ? 'Spiermassa (+500 kcal)' : 'Onderhoud'}
              </p>
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors">
            Bewerk Profiel
          </button>
        </div>

        {/* Plan Details */}
        <div className="bg-[#181F17] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-[#8BAE5A]" />
            Jouw Calorieën & Macro's
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#232D1A] rounded-lg p-4">
              <h3 className="text-sm text-gray-400 mb-1">Jouw Calorieën</h3>
              <p className="text-2xl font-bold text-[#8BAE5A]">{personalizedMacros.calories} kcal</p>
            </div>
            <div className="bg-[#232D1A] rounded-lg p-4">
              <h3 className="text-sm text-gray-400 mb-1">Eiwit</h3>
              <p className="text-lg font-semibold">{personalizedMacros.protein}g</p>
              <p className="text-xs text-[#8BAE5A]">{macroPercentages.protein}% van calorieën</p>
            </div>
            <div className="bg-[#232D1A] rounded-lg p-4">
              <h3 className="text-sm text-gray-400 mb-1">Koolhydraten</h3>
              <p className="text-lg font-semibold">{personalizedMacros.carbs}g</p>
              <p className="text-xs text-[#8BAE5A]">{macroPercentages.carbs}% van calorieën</p>
            </div>
            <div className="bg-[#232D1A] rounded-lg p-4">
              <h3 className="text-sm text-gray-400 mb-1">Vet</h3>
              <p className="text-lg font-semibold">{personalizedMacros.fat}g</p>
              <p className="text-xs text-[#8BAE5A]">{macroPercentages.fat}% van calorieën</p>
            </div>
          </div>
        </div>

        {/* Day Selection */}
        <div className="bg-[#181F17] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-[#8BAE5A]" />
            Dag Selectie
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`p-3 rounded-lg text-center transition-colors ${
                  selectedDay === day
                    ? 'bg-[#8BAE5A] text-[#181F17]'
                    : 'bg-[#232D1A] hover:bg-[#2A2A2A]'
                }`}
              >
                <div className="text-sm font-medium capitalize">{day.slice(0, 3)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Totals with Colored Progress Bars */}
        <div className="bg-[#181F17] rounded-xl p-6 mb-6">
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
          
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-[#8BAE5A]" />
            Dagelijkse Totalen - {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Calories */}
            <div className="bg-[#232D1A] rounded-lg p-4">
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
                <span className="text-gray-400">{dayTotals.calories.toFixed(1)} kcal</span>
                <span className="text-white">{personalizedMacros.calories.toFixed(1)} kcal</span>
            </div>
              <div className={`text-xs mt-1 ${caloriesProgress.textColor}`}>
                {caloriesProgress.difference > 0 ? '+' : ''}{caloriesProgress.difference.toFixed(1)} kcal
              </div>
            </div>

            {/* Protein */}
            <div className="bg-[#232D1A] rounded-lg p-4">
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
                <span className="text-gray-400">{dayTotals.protein.toFixed(1)}g</span>
                <span className="text-white">{personalizedMacros.protein.toFixed(1)}g</span>
            </div>
              <div className={`text-xs mt-1 ${proteinProgress.textColor}`}>
                {proteinProgress.difference > 0 ? '+' : ''}{proteinProgress.difference.toFixed(1)}g
              </div>
            </div>

            {/* Carbs */}
            <div className="bg-[#232D1A] rounded-lg p-4">
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
                <span className="text-gray-400">{dayTotals.carbs.toFixed(1)}g</span>
                <span className="text-white">{personalizedMacros.carbs.toFixed(1)}g</span>
            </div>
              <div className={`text-xs mt-1 ${carbsProgress.textColor}`}>
                {carbsProgress.difference > 0 ? '+' : ''}{carbsProgress.difference.toFixed(1)}g
              </div>
            </div>

            {/* Fat */}
            <div className="bg-[#232D1A] rounded-lg p-4">
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
                <span className="text-gray-400">{dayTotals.fat.toFixed(1)}g</span>
                <span className="text-white">{personalizedMacros.fat.toFixed(1)}g</span>
              </div>
              <div className={`text-xs mt-1 ${fatProgress.textColor}`}>
                {fatProgress.difference > 0 ? '+' : ''}{fatProgress.difference.toFixed(1)}g
              </div>
            </div>
          </div>
        </div>


        {/* Detailed Meals with Ingredients Table */}
        {originalPlanData?.meals?.weekly_plan?.[selectedDay] ? (
          <div className="bg-[#181F17] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5 text-[#8BAE5A]" />
              Maaltijden - {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
            </h2>
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

                // Calculate meal totals (prefer backend 'nutrition' for exact match)
                const computedTotals = mealData.ingredients.reduce((totals: any, ingredient: any) => {
                  const customAmount = customAmounts[getIngredientKey(mealType, ingredient.name, selectedDay)] || ingredient.amount;
                  let amount = customAmount;
                  const unit = String(ingredient.unit || '').toLowerCase();
                  
                  // Calculate multiplier based on unit type (mirror backend)
                  let multiplier = 1;
                  if (['per_piece','stuk','stuks','per_plakje','plakje','plakjes','handje','per_handful'].includes(unit)) {
                    multiplier = amount;
                  } else if (['per_100g','g','gram'].includes(unit)) {
                    multiplier = amount / 100;
                  } else if (['per_ml','ml'].includes(unit)) {
                    multiplier = amount / 100; // ~1ml = 1g
                  } else {
                    multiplier = amount / 100;
                  }
                  
                  totals.calories += (Number(ingredient.calories_per_100g) || 0) * multiplier;
                  totals.protein  += (Number(ingredient.protein_per_100g)  || 0) * multiplier;
                  totals.carbs    += (Number(ingredient.carbs_per_100g)    || 0) * multiplier;
                  totals.fat      += (Number(ingredient.fat_per_100g)      || 0) * multiplier;
                  
                  return totals;
                }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

                const mealTotals = mealData.nutrition && typeof mealData.nutrition === 'object'
                  ? {
                      calories: Math.round(Number(mealData.nutrition.calories) || 0),
                      protein: Math.round((Number(mealData.nutrition.protein) || 0) * 10) / 10,
                      carbs: Math.round((Number(mealData.nutrition.carbs) || 0) * 10) / 10,
                      fat: Math.round((Number(mealData.nutrition.fat) || 0) * 10) / 10,
                    }
                  : {
                      calories: Math.round(computedTotals.calories),
                      protein: Math.round(computedTotals.protein * 10) / 10,
                      carbs: Math.round(computedTotals.carbs * 10) / 10,
                      fat: Math.round(computedTotals.fat * 10) / 10,
                    };

                return (
                  <div key={mealType} className="bg-[#232D1A] rounded-lg border border-[#3A4D23] overflow-hidden">
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
                              
                              // Calculate individual ingredient totals (mirror backend unit rules)
                              let multiplier = 1;
                              {
                                const unit = String(ingredient.unit || '').toLowerCase();
                                if (['per_piece','stuk','stuks','per_plakje','plakje','plakjes','handje','per_handful'].includes(unit)) {
                                  multiplier = amount;
                                } else if (['per_100g','g','gram'].includes(unit)) {
                                  multiplier = amount / 100;
                                } else if (['per_ml','ml'].includes(unit)) {
                                  multiplier = amount / 100; // ~1ml = 1g
                                } else if (['per_tbsp','tbsp','eetlepel'].includes(unit)) {
                                  multiplier = (amount * 15) / 100;
                                } else if (['per_tsp','tsp','theelepel'].includes(unit)) {
                                  multiplier = (amount * 5) / 100;
                                } else if (['per_cup','cup','kop'].includes(unit)) {
                                  multiplier = (amount * 240) / 100;
                                } else if (['per_30g'].includes(unit)) {
                                  multiplier = (amount * 30) / 100;
                                } else {
                                  multiplier = amount / 100;
                                }
                              }

                              const ingredientCalories = (Number(ingredient.calories_per_100g) || 0) * multiplier;
                              const ingredientProtein  = (Number(ingredient.protein_per_100g)  || 0) * multiplier;
                              const ingredientCarbs    = (Number(ingredient.carbs_per_100g)    || 0) * multiplier;
                              const ingredientFat      = (Number(ingredient.fat_per_100g)      || 0) * multiplier;

                              // Convert database unit names to user-friendly labels
                              const getUnitLabel = (unit: string) => {
                                switch (unit) {
                                  case 'g': return 'gram';
                                  case 'plakje': return 'plakjes';
                                  case 'piece': return 'stuk';
                                  case 'per_100g': return 'gram';
                                  case 'per_plakje': return 'plakjes';
                                  case 'per_piece': return 'stuk';
                                  case 'per_ml': return 'ml';
                                  case 'handje': return 'handjes';
                                  default: return unit;
                                }
                              };

                              return (
                                <tr key={index} className="border-b border-[#2A3A1A] last:border-b-0">
                                  <td className="py-3 text-white font-medium">
                                    {ingredient.name}
                                  </td>
                                  <td className="py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <span className="w-16 px-2 py-1 bg-[#232D1A] border border-[#3A4D23] rounded text-white text-center text-sm">
                                        {amount}
                                      </span>
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
        ) : (
          /* Fallback when no meal data is available */
          <div className="bg-[#181F17] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5 text-[#8BAE5A]" />
              Maaltijden - {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
            </h2>
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg">Geen maaltijden data beschikbaar</p>
              </div>
              <div className="text-sm text-gray-500">
                <p>originalPlanData: {originalPlanData ? '✅' : '❌'}</p>
                <p>meals: {originalPlanData?.meals ? '✅' : '❌'}</p>
                <p>weekly_plan: {originalPlanData?.meals?.weekly_plan ? '✅' : '❌'}</p>
                <p>selectedDay ({selectedDay}): {originalPlanData?.meals?.weekly_plan?.[selectedDay] ? '✅' : '❌'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Debug Comparison Panel */}
        {showDebug && (
          <div className="bg-[#181F17] rounded-xl p-6 mt-6 border border-[#3A4D23]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              Debug: Vergelijk Backend vs Berekend ({selectedDay})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-[#8BAE5A]">
                  <tr className="border-b border-[#3A4D23]">
                    <th className="text-left py-2">Maaltijd</th>
                    <th className="text-right py-2">Backend kcal</th>
                    <th className="text-right py-2">Comp kcal</th>
                    <th className="text-right py-2">Δ kcal</th>
                    <th className="text-right py-2">Backend eiwit</th>
                    <th className="text-right py-2">Comp eiwit</th>
                    <th className="text-right py-2">Δ eiwit</th>
                    <th className="text-right py-2">Backend kh</th>
                    <th className="text-right py-2">Comp kh</th>
                    <th className="text-right py-2">Δ kh</th>
                    <th className="text-right py-2">Backend vet</th>
                    <th className="text-right py-2">Comp vet</th>
                    <th className="text-right py-2">Δ vet</th>
                  </tr>
                </thead>
                <tbody>
                  {mealComparisons.map((m) => (
                    <tr key={m.mealType} className="border-b border-[#2A3A1A] last:border-b-0">
                      <td className="py-2 text-white">{m.label}</td>
                      <td className="py-2 text-right">{m.backend.calories.toFixed(0)}</td>
                      <td className="py-2 text-right">{m.computed.calories.toFixed(0)}</td>
                      <td className={`py-2 text-right ${m.delta.calories === 0 ? 'text-gray-400' : 'text-yellow-400'}`}>{m.delta.calories.toFixed(1)}</td>
                      <td className="py-2 text-right">{m.backend.protein.toFixed(1)}g</td>
                      <td className="py-2 text-right">{m.computed.protein.toFixed(1)}g</td>
                      <td className={`py-2 text-right ${m.delta.protein === 0 ? 'text-gray-400' : 'text-yellow-400'}`}>{m.delta.protein.toFixed(1)}g</td>
                      <td className="py-2 text-right">{m.backend.carbs.toFixed(1)}g</td>
                      <td className="py-2 text-right">{m.computed.carbs.toFixed(1)}g</td>
                      <td className={`py-2 text-right ${m.delta.carbs === 0 ? 'text-gray-400' : 'text-yellow-400'}`}>{m.delta.carbs.toFixed(1)}g</td>
                      <td className="py-2 text-right">{m.backend.fat.toFixed(1)}g</td>
                      <td className="py-2 text-right">{m.computed.fat.toFixed(1)}g</td>
                      <td className={`py-2 text-right ${m.delta.fat === 0 ? 'text-gray-400' : 'text-yellow-400'}`}>{m.delta.fat.toFixed(1)}g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Simple Modal */}
        {showSimpleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#232D1A] rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Simpel Modal</h3>
                <button
                  onClick={() => setShowSimpleModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="text-gray-300">
                <p>Dit is een simpel modal zonder inhoud.</p>
                <p className="mt-2">We gaan dit stap voor stap uitbreiden.</p>
                <p className="mt-2 text-sm">Plan: {selectedPlan.name}</p>
                <p className="mt-1 text-sm">Dag: {selectedDay}</p>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowSimpleModal(false)}
                  className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ingredient Edit Modal */}
        {showIngredientModal && editingMealType && editingDay && (
          <IngredientEditModal
            isOpen={showIngredientModal}
            onClose={() => {
              setShowIngredientModal(false);
              setEditingMealType('');
              setEditingDay('');
            }}
            ingredients={getCurrentIngredients(editingMealType, editingDay)}
            mealType={editingMealType}
            day={editingDay}
            onSave={(updatedIngredients) => {
              console.log('🔧 DEBUG: Ingredients saved:', updatedIngredients);
              setShowIngredientModal(false);
              setEditingMealType('');
              setEditingDay('');
            }}
          />
        )}
      </div>
    </div>
  );
}
