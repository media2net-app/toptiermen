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
  const { user, isAdmin } = useSupabaseAuth();
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
    if (!originalPlanData?.meals?.weekly_plan?.[day]) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const dayMeals = originalPlanData.meals.weekly_plan[day];
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    ['ontbijt', 'ochtend_snack', 'lunch', 'lunch_snack', 'diner'].forEach(mealType => {
      const meal = dayMeals[mealType];
      if (meal?.totals) {
        totals.calories += meal.totals.calories || 0;
        totals.protein += meal.totals.protein || 0;
        totals.carbs += meal.totals.carbs || 0;
        totals.fat += meal.totals.fat || 0;
      }
    });

    return totals;
  };

  // Get current day totals
  const currentDayTotals = calculateDayTotals(selectedDay);

  // TTM Formula: weight x 22 x activity_level + goal_adjustment
  const calculatePersonalizedTargets = (basePlan: any) => {
    // Activity level multipliers
    const activityMultipliers = {
      'sedentary': 1.1,    // Zittend (1.1x)
      'moderate': 1.3,     // Staand (1.3x) - Backend basis
      'very_active': 1.6   // Lopend (1.6x)
    };

    // Goal adjustments (kcal)
    const goalAdjustments = {
      'droogtrainen': -500,  // -500 kcal
      'onderhoud': 0,        // Basis plan (0 kcal)
      'spiermassa': +400     // +400 kcal
    };

    // Calculate base calories using TTM formula
    const baseCalories = userProfile.weight * 22 * (activityMultipliers[userProfile.activity_level] || 1.3);
    const goalAdjustment = goalAdjustments[userProfile.fitness_goal] || 0;
    const targetCalories = baseCalories + goalAdjustment;

    // Calculate scaling factor compared to backend base (100kg, moderate, onderhoud)
    const backendBase = 100 * 22 * 1.3; // 2860 kcal
    const scalingFactor = targetCalories / backendBase;

    // Apply scaling to macros (assuming macro ratios stay the same)
    const targetProtein = Math.round(basePlan.target_protein * scalingFactor);
    const targetCarbs = Math.round(basePlan.target_carbs * scalingFactor);
    const targetFat = Math.round(basePlan.target_fat * scalingFactor);

    return {
      targetCalories: Math.round(targetCalories),
      targetProtein,
      targetCarbs,
      targetFat,
      scalingFactor,
      baseCalories: Math.round(baseCalories),
      goalAdjustment
    };
  };

  // Function to calculate progress and color for progress bars
  const getProgressInfo = (current: number, target: number) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    const difference = current - target;
    const isGood = percentage >= 95 && percentage <= 105; // Green if within 95-105%
    const color = isGood ? 'bg-green-500' : 'bg-red-500';
    
    return {
      percentage: Math.min(percentage, 120), // Cap at 120% for display
      difference,
      isGood,
      color,
      textColor: isGood ? 'text-green-400' : 'text-red-400'
    };
  };

  // Get progress info for each macro
  const caloriesProgress = getProgressInfo(currentDayTotals.calories, originalPlanData?.target_calories || 0);
  const proteinProgress = getProgressInfo(currentDayTotals.protein, originalPlanData?.target_protein || 0);
  const carbsProgress = getProgressInfo(currentDayTotals.carbs, originalPlanData?.target_carbs || 0);
  const fatProgress = getProgressInfo(currentDayTotals.fat, originalPlanData?.target_fat || 0);

  // Check if user is specifically chiel@media2net.nl
  const isChiel = user?.email === 'chiel@media2net.nl';

  useEffect(() => {
    // Only allow chiel@media2net.nl access
    if (!isChiel) {
      router.push('/dashboard');
      return;
    }

    fetchPlans();
  }, [isChiel, router]);

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
      setOriginalPlanData(data.plan);
      console.log('✅ Original plan data loaded:', data.plan.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load original plan data');
    } finally {
      setLoadingOriginal(false);
    }
  };

  const saveUserProfile = async (profile: UserProfile) => {
    try {
      const response = await fetch('/api/nutrition-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
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

  const applySmartScaling = async (planId: string) => {
    try {
      setLoadingScaling(true);
      setError(null);
      
      // Include user profile data in the scaling request
      const response = await fetch(`/api/nutrition-plan-smart-scaling?planId=${planId}&userId=${user?.id}&weight=${userProfile.weight}&height=${userProfile.height}&age=${userProfile.age}&gender=${userProfile.gender}&activity_level=${userProfile.activity_level}&fitness_goal=${userProfile.fitness_goal}`);
      
      if (!response.ok) {
        throw new Error('Failed to apply smart scaling');
      }
      
      const data = await response.json();
      setScalingInfo(data.scalingInfo);
      console.log('✅ Smart scaling applied:', data.scalingInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Smart scaling failed');
    } finally {
      setLoadingScaling(false);
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
                  <p className="text-[#8BAE5A]">Originele Backend Data - 1:1 zoals opgeslagen in database</p>
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
                className="px-6 py-3 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 font-semibold"
              >
                {loadingScaling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#181F17] border-t-transparent rounded-full animate-spin"></div>
                    <span>Bezig...</span>
                  </>
                ) : (
                  <>
                    <RocketLaunchIcon className="w-5 h-5" />
                    <span>{scalingInfo ? 'Bekijk Smart Scaling' : 'Smart Scaling Toepassen'}</span>
                  </>
                )}
              </button>
            </div>

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
                    <p className="text-2xl font-bold text-white">{originalPlanData.target_calories} kcal</p>
                  </div>
                  <div className="bg-[#0A0F0A] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ChartBarIcon className="w-5 h-5 text-[#B6C948]" />
                      <span className="text-[#8BAE5A] font-medium">Eiwit</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{originalPlanData.target_protein}g</p>
                  </div>
                  <div className="bg-[#0A0F0A] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="w-5 h-5 text-[#B6C948]" />
                      <span className="text-[#8BAE5A] font-medium">Koolhydraten</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{originalPlanData.target_carbs}g</p>
                  </div>
                  <div className="bg-[#0A0F0A] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <HeartIcon className="w-5 h-5 text-[#B6C948]" />
                      <span className="text-[#8BAE5A] font-medium">Vet</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{originalPlanData.target_fat}g</p>
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
                      <span className="text-[#8BAE5A] text-sm">{caloriesProgress.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${caloriesProgress.color}`}
                        style={{ width: `${caloriesProgress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{currentDayTotals.calories} kcal</span>
                      <span className="text-white">{originalPlanData.target_calories} kcal</span>
                    </div>
                    <div className={`text-xs mt-1 ${caloriesProgress.textColor}`}>
                      {caloriesProgress.difference > 0 ? '+' : ''}{caloriesProgress.difference.toFixed(1)} kcal
                    </div>
                  </div>

                  {/* Protein */}
                  <div className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Eiwit</span>
                      <span className="text-[#8BAE5A] text-sm">{proteinProgress.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${proteinProgress.color}`}
                        style={{ width: `${proteinProgress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{currentDayTotals.protein}g</span>
                      <span className="text-white">{originalPlanData.target_protein}g</span>
                    </div>
                    <div className={`text-xs mt-1 ${proteinProgress.textColor}`}>
                      {proteinProgress.difference > 0 ? '+' : ''}{proteinProgress.difference.toFixed(1)}g
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Koolhydraten</span>
                      <span className="text-[#8BAE5A] text-sm">{carbsProgress.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${carbsProgress.color}`}
                        style={{ width: `${carbsProgress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{currentDayTotals.carbs}g</span>
                      <span className="text-white">{originalPlanData.target_carbs}g</span>
                    </div>
                    <div className={`text-xs mt-1 ${carbsProgress.textColor}`}>
                      {carbsProgress.difference > 0 ? '+' : ''}{carbsProgress.difference.toFixed(1)}g
                    </div>
                  </div>

                  {/* Fat */}
                  <div className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Vet</span>
                      <span className="text-[#8BAE5A] text-sm">{fatProgress.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${fatProgress.color}`}
                        style={{ width: `${fatProgress.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{currentDayTotals.fat}g</span>
                      <span className="text-white">{originalPlanData.target_fat}g</span>
                    </div>
                    <div className={`text-xs mt-1 ${fatProgress.textColor}`}>
                      {fatProgress.difference > 0 ? '+' : ''}{fatProgress.difference.toFixed(1)}g
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Day Meals */}
            {originalPlanData.meals?.weekly_plan && originalPlanData.meals.weekly_plan[selectedDay] && (
              <div className="bg-[#0A0F0A] rounded-lg p-6">
                <h4 className="text-[#B6C948] font-bold text-lg mb-4 capitalize">{selectedDay}</h4>
                    
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {['ontbijt', 'ochtend_snack', 'lunch', 'lunch_snack', 'diner'].map((mealType) => {
                    const mealData = originalPlanData.meals.weekly_plan[selectedDay][mealType];
                        const mealTypeLabel = mealType === 'ochtend_snack' ? 'Ochtend Snack' :
                                             mealType === 'lunch_snack' ? 'Lunch Snack' :
                                             mealType === 'ontbijt' ? 'Ontbijt' :
                                             mealType === 'lunch' ? 'Lunch' :
                                             mealType === 'diner' ? 'Diner' : mealType;

                        return (
                          <div key={mealType} className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
                            <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-[#8BAE5A]" />
                              {mealTypeLabel}
                            </h5>
                            
                            {mealData && mealData.ingredients ? (
                              <div className="space-y-3">
                                <div className="text-xs text-[#8BAE5A] mb-2">
                                  {mealData.ingredients.length} ingrediënten
                                </div>
                                
                                {/* Show all ingredients */}
                                {mealData.ingredients.map((ingredient: any, index: number) => (
                                  <div key={index} className="text-sm text-gray-300 bg-[#0A0F0A] rounded p-2">
                                    <div className="font-medium text-white">
                                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                                    </div>
                                    {ingredient.calories && (
                                      <div className="text-xs text-[#8BAE5A] mt-1">
                                        {ingredient.calories} kcal • P: {ingredient.protein}g • K: {ingredient.carbs}g • V: {ingredient.fat}g
                                      </div>
                                    )}
                                  </div>
                                ))}
                                
                                {/* Show meal totals if available */}
                                {mealData.totals && (
                                  <div className="text-sm text-[#B6C948] mt-3 pt-3 border-t border-[#3A4D23] font-semibold">
                                    <div>Totaal: {mealData.totals.calories} kcal</div>
                                    <div>Eiwit: {mealData.totals.protein}g • Koolhydraten: {mealData.totals.carbs}g • Vet: {mealData.totals.fat}g</div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">Geen data beschikbaar</div>
                            )}
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
                  <p className="text-gray-400 text-xs">{userProfile.weight}kg • {userProfile.activity_level} • {userProfile.fitness_goal}</p>
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
                  <span className="text-white">{calculatePersonalizedTargets(plans[0] || {}).goalAdjustment} kcal</span>
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
                </div>
              </div>

              {/* Macro Targets */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-3">Macro Doelen</h4>
                
                <div className="bg-[#0A0F0A] rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Calorieën:</span>
                    <span className="text-white font-semibold">{originalPlanData.target_calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Eiwit:</span>
                    <span className="text-white font-semibold">{originalPlanData.target_protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Koolhydraten:</span>
                    <span className="text-white font-semibold">{originalPlanData.target_carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Vet:</span>
                    <span className="text-white font-semibold">{originalPlanData.target_fat}g</span>
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
