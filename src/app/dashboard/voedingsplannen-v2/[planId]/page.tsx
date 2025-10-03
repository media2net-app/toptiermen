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
  // SSR-safe client flag for debug terminal rendering
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
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
  // DB ingredient lookup to mirror backend macros
  const [ingredientLookup, setIngredientLookup] = useState<Record<string, any> | null>(null);
  // Scaling factor derived from weight (baseline 100kg)
  const scalingFactor = useMemo(() => {
    const w = Number(userProfile?.weight || 100);
    if (!Number.isFinite(w) || w <= 0) return 1;
    return w / 100;
  }, [userProfile?.weight]);

  // Reset modal state when component mounts
  useEffect(() => {
    setShowIngredientModal(false);
    setEditingMealType('');
    setEditingDay('');
  }, []);

  // Load ingredient lookup from API to ensure we use the same macros as backend
  useEffect(() => {
    const loadLookup = async () => {
      try {
        const res = await fetch('/api/nutrition-ingredients', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json?.ingredients) setIngredientLookup(json.ingredients);
        }
      } catch {}
    };
    loadLookup();
  }, []);

  const getFields = (ingredient: any) => {
    const name = String(ingredient?.name || '').trim();
    const ref = ingredientLookup?.[name];
    const calories_per_100g = Number(ref?.calories_per_100g ?? ingredient.calories_per_100g) || 0;
    const protein_per_100g  = Number(ref?.protein_per_100g  ?? ingredient.protein_per_100g)  || 0;
    const carbs_per_100g    = Number(ref?.carbs_per_100g    ?? ingredient.carbs_per_100g)    || 0;
    const fat_per_100g      = Number(ref?.fat_per_100g      ?? ingredient.fat_per_100g)      || 0;
    const unit_weight_g     = Number(ref?.unit_weight_g ?? ref?.grams_per_unit ?? ingredient.unit_weight_g ?? ingredient.grams_per_unit ?? ingredient.slice_weight_g ?? ingredient.plakje_gram ?? ingredient.unit_weight) || 0;
    return { calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, unit_weight_g };
  };

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

    // Pre-pass: compute fixed vs adjustable totals (without final adjust) to determine under-target increase factor
    let fixed = { cal: 0, p: 0, c: 0, f: 0 } as any;
    let adj   = { cal: 0, p: 0, c: 0, f: 0 } as any;
    Object.entries(dayData).forEach(([mealType, meal]: any) => {
      if (!meal?.ingredients) return;
      meal.ingredients.forEach((ingredient: any) => {
        const key = getIngredientKey(mealType as string, ingredient.name, day);
        const customAmount = (customAmounts as any)[key];
        const base = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
        const unit = String(ingredient.unit || '').toLowerCase();
        let amount = base * scalingFactor;
        let mult = 1;
        if (isPieceUnit(unit)) {
          amount = scalePiecesAmount(base, scalingFactor);
          const unitWeight = Number(
            ingredient.unit_weight_g ?? ingredient.grams_per_unit ?? ingredient.weight_per_unit ?? ingredient.per_piece_grams ?? ingredient.slice_weight_g ?? ingredient.plakje_gram ?? ingredient.unit_weight
          ) || 0;
          mult = unitWeight > 0 ? (amount * unitWeight) / 100 : amount;
          fixed.cal += (Number(ingredient.calories_per_100g)||0) * mult;
          fixed.p   += (Number(ingredient.protein_per_100g)||0)  * mult;
          fixed.c   += (Number(ingredient.carbs_per_100g)||0)    * mult;
          fixed.f   += (Number(ingredient.fat_per_100g)||0)      * mult;
        } else {
          if (['per_100g','g','gram'].includes(unit)) mult = amount / 100;
          else if (['per_ml','ml'].includes(unit)) mult = amount / 100;
          else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unit)) mult = (amount * 15) / 100;
          else if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unit)) mult = (amount * 5) / 100;
          else if (['per_cup','cup','kop'].includes(unit)) mult = (amount * 240) / 100;
          else if (['per_30g'].includes(unit)) mult = (amount * 30) / 100;
          else mult = amount / 100;
          adj.cal += (Number(ingredient.calories_per_100g)||0) * mult;
          adj.p   += (Number(ingredient.protein_per_100g)||0)  * mult;
          adj.c   += (Number(ingredient.carbs_per_100g)||0)    * mult;
          adj.f   += (Number(ingredient.fat_per_100g)||0)      * mult;
        }
      });
    });
    // Determine mode by comparing current (without final adjust) against targets
    const tgt = { cal: personalizedMacros.calories, p: personalizedMacros.protein, c: personalizedMacros.carbs, f: personalizedMacros.fat };
    const currNoFinal = { cal: fixed.cal + adj.cal, p: fixed.p + adj.p, c: fixed.c + adj.c, f: fixed.f + adj.f };
    const underFlags = {
      cal: tgt.cal>0 && currNoFinal.cal < 0.95*tgt.cal,
      p:   tgt.p>0   && currNoFinal.p   < 0.95*tgt.p,
      c:   tgt.c>0   && currNoFinal.c   < 0.95*tgt.c,
      f:   tgt.f>0   && currNoFinal.f   < 0.95*tgt.f,
    };
    const overFlags = {
      cal: tgt.cal>0 && currNoFinal.cal > 1.05*tgt.cal,
      p:   tgt.p>0   && currNoFinal.p   > 1.05*tgt.p,
      c:   tgt.c>0   && currNoFinal.c   > 1.05*tgt.c,
      f:   tgt.f>0   && currNoFinal.f   > 1.05*tgt.f,
    };
    const anyUnder = underFlags.cal || underFlags.p || underFlags.c || underFlags.f;
    const anyOver  = overFlags.cal  || overFlags.p  || overFlags.c  || overFlags.f;
    const mode: 'increase'|'reduce'|'neutral'|'mixed' = (anyUnder && anyOver) ? 'mixed' : (anyUnder ? 'increase' : (anyOver ? 'reduce' : 'neutral'));
    // Determine increase factor if we are under targets (>5% under)
    let incCandidates: number[] = [];
    if (mode === 'increase') {
      const needCal = Math.max(0, tgt.cal - fixed.cal);
      const needP   = Math.max(0, tgt.p   - fixed.p);
      const needC   = Math.max(0, tgt.c   - fixed.c);
      const needF   = Math.max(0, tgt.f   - fixed.f);
      if (tgt.cal > 0 && needCal > 0 && adj.cal > 0) incCandidates.push(needCal / adj.cal);
      if (tgt.p   > 0 && needP   > 0 && adj.p   > 0) incCandidates.push(needP   / adj.p);
      if (tgt.c   > 0 && needC   > 0 && adj.c   > 0) incCandidates.push(needC   / adj.c);
      if (tgt.f   > 0 && needF   > 0 && adj.f   > 0) incCandidates.push(needF   / adj.f);
    }
    // incFactor >=1 when under; clamp to [1, 1.5]
    let incFactor = 1;
    if (incCandidates.length) {
      incFactor = Math.max(1, Math.min(1.5, Math.min(...incCandidates)));
    }
    // Local macro-aware bias based on current deviation
    const overW = { cal: 0, p: 0, c: 0, f: 0 } as any;
    const underW = { cal: 0, p: 0, c: 0, f: 0 } as any;
    if (tgt.cal>0) { const r = currNoFinal.cal/tgt.cal; if (r>1.05) overW.cal=r-1; else if (r<0.95) underW.cal=1-r; }
    if (tgt.p>0)   { const r = currNoFinal.p/tgt.p;     if (r>1.05) overW.p  =r-1; else if (r<0.95) underW.p  =1-r; }
    if (tgt.c>0)   { const r = currNoFinal.c/tgt.c;     if (r>1.05) overW.c  =r-1; else if (r<0.95) underW.c  =1-r; }
    if (tgt.f>0)   { const r = currNoFinal.f/tgt.f;     if (r>1.05) overW.f  =r-1; else if (r<0.95) underW.f  =1-r; }
    const localBiasedAdjust = (dens: {cal:number,p:number,c:number,f:number}) => {
      if (mode === 'reduce') {
        const base = finalAdjustFactor;
        const score = (dens.p*overW.p)+(dens.c*overW.c)+(dens.f*overW.f)+(dens.cal*overW.cal);
        if (!isFinite(score) || score<=0) return base;
        const norm = Math.min(1, score/10);
        const beta = 0.2;
        return Math.max(0.6, Math.min(1, base - beta*norm));
      }
      if (mode === 'increase') {
        const score = (dens.p*underW.p)+(dens.c*underW.c)+(dens.f*underW.f)+(dens.cal*underW.cal);
        if (!isFinite(score) || score<=0) return 1 + (incFactor - 1) * 0.5; // neutral split
        const norm = Math.min(1, score/10);
        // Distribute within [1, incFactor] so totaal niet boven target komt
        return 1 + (incFactor - 1) * norm;
      }
      // mixed or neutral: adjust around base 1, reduce for overscore and increase for underscore
      const overScore = (dens.p*overW.p)+(dens.c*overW.c)+(dens.f*overW.f)+(dens.cal*overW.cal);
      const underScore = (dens.p*underW.p)+(dens.c*underW.c)+(dens.f*underW.f)+(dens.cal*underW.cal);
      if (isFinite(overScore) && overScore>0 && (!underScore || overScore>=underScore)) {
        const norm = Math.min(1, overScore/10);
        const beta = 0.2;
        return Math.max(0.6, 1 - beta*norm);
      }
      if (isFinite(underScore) && underScore>0) {
        const norm = Math.min(1, underScore/10);
        const cap = incFactor>1 ? incFactor : 1.45; // allow modest increase when neutral
        return Math.min(cap, 1 + (cap-1)*norm);
      }
      return 1;
    };
    
    Object.keys(dayData).forEach(mealType => {
      const meal = dayData[mealType];
      // Use backend nutrition only when there is no scaling at all
      const canUseBackend = !!(meal && meal.nutrition && typeof meal.nutrition === 'object') && (scalingFactor === 1 && finalAdjustFactor === 1);
      if (canUseBackend) {
        totalCalories += Number(meal.nutrition.calories) || 0;
        totalProtein += Number(meal.nutrition.protein) || 0;
        totalCarbs += Number(meal.nutrition.carbs) || 0;
        totalFat += Number(meal.nutrition.fat) || 0;
        return;
      }
      // Otherwise compute from ingredient list with scaling and macro-aware final adjust
      if (meal && meal.ingredients && Array.isArray(meal.ingredients)) {
        let mealTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        meal.ingredients.forEach((ingredient: any) => {
          const ingredientKey = getIngredientKey(mealType, ingredient.name, day);
          const customAmount = customAmounts[ingredientKey];
          const base = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
          const unit = String(ingredient.unit || '').toLowerCase();
          let amount = base * scalingFactor;
          let multiplier = 1;
          if (isPieceUnit(unit)) {
            // Do not decrease pieces unless we are in reduce mode; also keep in mixed/neutral
            const scaledPieces = scalePiecesAmount(base, scalingFactor);
            amount = mode === 'reduce' ? scaledPieces : Math.max(base, scaledPieces);
            const unitWeight = Number(
              ingredient.unit_weight_g ?? ingredient.grams_per_unit ?? ingredient.weight_per_unit ?? ingredient.per_piece_grams ?? ingredient.slice_weight_g ?? ingredient.plakje_gram ?? ingredient.unit_weight
            ) || 0;
            multiplier = unitWeight > 0 ? (amount * unitWeight) / 100 : amount;
          } else if (['per_100g','g','gram'].includes(unit)) {
            const flds = getFields(ingredient); const dens = { cal: flds.calories_per_100g, p: flds.protein_per_100g, c: flds.carbs_per_100g, f: flds.fat_per_100g };
            const factor = localBiasedAdjust(dens);
            amount = Math.round(amount * factor);
            multiplier = amount / 100;
          } else if (['per_ml','ml'].includes(unit)) {
            const flds = getFields(ingredient); const dens = { cal: flds.calories_per_100g, p: flds.protein_per_100g, c: flds.carbs_per_100g, f: flds.fat_per_100g };
            const factor = localBiasedAdjust(dens);
            amount = Math.round(amount * factor);
            multiplier = amount / 100; // assume 1ml ≈ 1g
          } else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unit)) {
            const flds = getFields(ingredient); const dens = { cal: flds.calories_per_100g, p: flds.protein_per_100g, c: flds.carbs_per_100g, f: flds.fat_per_100g };
            const factor = localBiasedAdjust(dens);
            amount = Math.round((amount * factor) * 2) / 2;
            multiplier = (amount * 15) / 100; // 1 tbsp = 15ml
          } else if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unit)) {
            const flds = getFields(ingredient); const dens = { cal: flds.calories_per_100g, p: flds.protein_per_100g, c: flds.carbs_per_100g, f: flds.fat_per_100g };
            const factor = localBiasedAdjust(dens);
            amount = Math.round((amount * factor) * 2) / 2;
            multiplier = (amount * 5) / 100; // 1 tsp = 5ml
          } else if (['per_cup','cup','kop'].includes(unit)) {
            const flds = getFields(ingredient); const dens = { cal: flds.calories_per_100g, p: flds.protein_per_100g, c: flds.carbs_per_100g, f: flds.fat_per_100g };
            const factor = localBiasedAdjust(dens);
            amount = Math.round((amount * factor) * 10) / 10;
            multiplier = (amount * 240) / 100; // 1 cup = 240ml
          } else if (['per_30g'].includes(unit)) {
            const flds = getFields(ingredient); const dens = { cal: flds.calories_per_100g, p: flds.protein_per_100g, c: flds.carbs_per_100g, f: flds.fat_per_100g };
            const factor = localBiasedAdjust(dens);
            amount = Math.round(amount * factor);
            multiplier = (amount * 30) / 100;
          } else {
            const flds = getFields(ingredient); const dens = { cal: flds.calories_per_100g, p: flds.protein_per_100g, c: flds.carbs_per_100g, f: flds.fat_per_100g };
            const factor = localBiasedAdjust(dens);
            amount = Math.round(amount * factor);
            multiplier = amount / 100;
          }
          const f = getFields(ingredient);
          mealTotals.calories += f.calories_per_100g * multiplier;
          mealTotals.protein  += f.protein_per_100g  * multiplier;
          mealTotals.carbs    += f.carbs_per_100g    * multiplier;
          mealTotals.fat      += f.fat_per_100g      * multiplier;
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

  // Helper: scale piece-based amounts with sensible rounding
  // - Downscaling (<1): floor, but never below 1 when base >= 1
  // - Upscaling (>=1): ceil
  const scalePiecesAmount = (base: number, factor: number) => {
    if (!Number.isFinite(base)) return 0;
    if (factor >= 1) return Math.ceil(base * factor);
    const v = Math.floor(base * factor);
    // If base was at least 1, never drop to 0
    return base >= 1 ? Math.max(1, v) : v;
  };

  // Personalized targets based on profile (weight/activity/goal)
  const personalizedMacros = useMemo(() => {
    const activityMultipliers: Record<string, number> = { sedentary: 1.1, moderate: 1.3, very_active: 1.6 };
    const profile = userProfile || { weight: 100, activity_level: 'moderate', fitness_goal: 'onderhoud' } as any;
    const w = Number(profile.weight || 100);
    const act = activityMultipliers[profile.activity_level] ?? 1.3;
    const baseCalories = w * 22 * act;
    const goalAdjMap: Record<string, number> = { droogtrainen: -500, onderhoud: 0, spiermassa: 400 };
    const goalAdj = goalAdjMap[profile.fitness_goal] ?? 0;
    const calories = Math.round(baseCalories + goalAdj);

    // Prefer plan macro percentages if defined
    const pPct = typeof (selectedPlan as any)?.protein_percentage === 'number' ? (selectedPlan as any).protein_percentage : 35;
    const cPct = typeof (selectedPlan as any)?.carbs_percentage === 'number'   ? (selectedPlan as any).carbs_percentage   : 40;
    const fPct = typeof (selectedPlan as any)?.fat_percentage === 'number'     ? (selectedPlan as any).fat_percentage     : 25;

    return {
      calories,
      protein: Math.round((calories * pPct) / 100 / 4),
      carbs:   Math.round((calories * cPct) / 100 / 4),
      fat:     Math.round((calories * fPct) / 100 / 9),
    };
  }, [userProfile, selectedPlan]);

  const isPieceUnit = (unit: string) =>
    ['per_piece','piece','pieces','per_stuk','stuk','stuks','per_plakje','plakje','plakjes','plak','per_plak','sneetje','per_sneetje','handje','per_handful']
      .includes(String(unit || '').toLowerCase());

  

  // Final adjust factor: proportionally scale only non-piece units to move totals toward personalized targets
  const finalAdjustFactor = useMemo(() => {
    const dayData: any = originalPlanData?.meals?.weekly_plan?.[selectedDay];
    if (!dayData) return 1;

    let fixed = { cal: 0, p: 0, c: 0, f: 0 };
    let adj   = { cal: 0, p: 0, c: 0, f: 0 };

    Object.entries(dayData).forEach(([mealType, meal]: any) => {
      if (!meal?.ingredients) return;
      meal.ingredients.forEach((ingredient: any) => {
        const key = `${selectedDay}_${mealType}_${ingredient.name}`;
        const customAmount = (customAmounts as any)[key];
        const base = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
        const unit = String(ingredient.unit || '').toLowerCase();

        let amount = base * scalingFactor;
        let mult = 1;
        if (isPieceUnit(unit)) {
          amount = scalePiecesAmount(base, scalingFactor);
          mult = amount;
          fixed.cal += (Number(ingredient.calories_per_100g)||0) * mult;
          fixed.p   += (Number(ingredient.protein_per_100g)||0)  * mult;
          fixed.c   += (Number(ingredient.carbs_per_100g)||0)    * mult;
          fixed.f   += (Number(ingredient.fat_per_100g)||0)      * mult;
        } else {
          if (['per_100g','g','gram'].includes(unit)) mult = amount / 100;
          else if (['per_ml','ml'].includes(unit)) mult = amount / 100;
          else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unit)) mult = (amount * 15) / 100;
          else if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unit)) mult = (amount * 5) / 100;
          else if (['per_cup','cup','kop'].includes(unit)) mult = (amount * 240) / 100;
          else if (['per_30g'].includes(unit)) mult = (amount * 30) / 100;
          else mult = amount / 100;
          adj.cal += (Number(ingredient.calories_per_100g)||0) * mult;
          adj.p   += (Number(ingredient.protein_per_100g)||0)  * mult;
          adj.c   += (Number(ingredient.carbs_per_100g)||0)    * mult;
          adj.f   += (Number(ingredient.fat_per_100g)||0)      * mult;
        }
      });
    });

    // If we're already under or exactly at targets, do nothing
    const tgt = { cal: personalizedMacros.calories, p: personalizedMacros.protein, c: personalizedMacros.carbs, f: personalizedMacros.fat };
    const needCal = tgt.cal - fixed.cal;
    const needP = tgt.p - fixed.p;
    const needC = tgt.c - fixed.c;
    const needF = tgt.f - fixed.f;

    // If adjustable part is zero (e.g. all pieces), return 1
    if (adj.cal <= 0.0001) return 1;

    // Ratios to hit target using only adjustable portion
    const rCal = needCal / adj.cal;
    const rP   = adj.p > 0.0001 ? (needP / adj.p) : 1;
    const rC   = adj.c > 0.0001 ? (needC / adj.c) : 1;
    const rF   = adj.f > 0.0001 ? (needF / adj.f) : 1;

    // We only want to reduce when we're over; take the smallest ratio below 1, clamp to [0.7, 1]
    const candidates = [rCal, rP, rC, rF].filter(v => isFinite(v) && v > 0 && v < 1);
    if (candidates.length === 0) return 1;
    const s = Math.max(0.7, Math.min(1, Math.min(...candidates)));
    return s;
  }, [originalPlanData, selectedDay, customAmounts, scalingFactor, personalizedMacros]);

  // moved early return blocks below (after all hooks)

  
  // Get current day totals - recalculate when customAmounts change
  const dayTotals = useMemo(() => {
    if (!originalPlanData) {
      console.log('🔄 No originalPlanData available, returning zeros');
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    console.log('🔄 Recalculating day totals due to customAmounts change');
    return calculateDayTotals(selectedDay);
  }, [selectedDay, customAmounts, originalPlanData, scalingFactor, finalAdjustFactor, personalizedMacros]);

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
          const base = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
          const unit = String(ingredient.unit || '').toLowerCase();
          let amount = base * scalingFactor;
          let multiplier = 1;
          if (isPieceUnit(unit)) {
            amount = scalePiecesAmount(base, scalingFactor);
            const unitWeight = Number(
              ingredient.unit_weight_g ?? ingredient.grams_per_unit ?? ingredient.weight_per_unit ?? ingredient.per_piece_grams ?? ingredient.slice_weight_g ?? ingredient.plakje_gram ?? ingredient.unit_weight
            ) || 0;
            multiplier = unitWeight > 0 ? (amount * unitWeight) / 100 : amount;
          } else if (['per_100g','g','gram'].includes(unit)) {
            amount = Math.round(amount * finalAdjustFactor);
            multiplier = amount / 100;
          } else if (['per_ml','ml'].includes(unit)) {
            amount = Math.round(amount * finalAdjustFactor);
            multiplier = amount / 100;
          } else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unit)) {
            amount = Math.round((amount * finalAdjustFactor) * 2) / 2;
            multiplier = (amount * 15) / 100;
          } else if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unit)) {
            amount = Math.round((amount * finalAdjustFactor) * 2) / 2;
            multiplier = (amount * 5) / 100;
          } else if (['per_cup','cup','kop'].includes(unit)) {
            amount = Math.round((amount * finalAdjustFactor) * 10) / 10;
            multiplier = (amount * 240) / 100;
          } else if (['per_30g'].includes(unit)) {
            amount = Math.round(amount * finalAdjustFactor);
            multiplier = (amount * 30) / 100;
          } else {
            amount = Math.round(amount * finalAdjustFactor);
            multiplier = amount / 100;
          }
          const f = getFields(ingredient);
          t.calories += f.calories_per_100g * multiplier;
          t.protein  += f.protein_per_100g  * multiplier;
          t.carbs    += f.carbs_per_100g    * multiplier;
          t.fat      += f.fat_per_100g      * multiplier;
        });
      }
    });
    return {
      calories: Math.round(t.calories),
      protein: Math.round(t.protein * 10) / 10,
      carbs: Math.round(t.carbs * 10) / 10,
      fat: Math.round(t.fat * 10) / 10,
    };
  }, [originalPlanData, customAmounts, selectedDay, scalingFactor, finalAdjustFactor]);

  // Macro-aware biasing: determine which macro(s) are overshooting/undershooting >5% (computed AFTER ingredientTotals to avoid TDZ)
  const overshootWeights = useMemo(() => {
    const tCal = personalizedMacros.calories || 0;
    const tP = personalizedMacros.protein || 0;
    const tC = personalizedMacros.carbs || 0;
    const tF = personalizedMacros.fat || 0;
    const cCal = ingredientTotals.calories || 0;
    const cP = ingredientTotals.protein || 0;
    const cC = ingredientTotals.carbs || 0;
    const cF = ingredientTotals.fat || 0;
    const over = { cal: 0, p: 0, c: 0, f: 0 } as any;
    const under = { cal: 0, p: 0, c: 0, f: 0 } as any;
    if (tCal > 0) { const r = cCal / tCal; if (r > 1.05) over.cal = r - 1; else if (r < 0.95) under.cal = 1 - r; }
    if (tP > 0)   { const r = cP   / tP;   if (r > 1.05) over.p   = r - 1; else if (r < 0.95) under.p   = 1 - r; }
    if (tC > 0)   { const r = cC   / tC;   if (r > 1.05) over.c   = r - 1; else if (r < 0.95) under.c   = 1 - r; }
    if (tF > 0)   { const r = cF   / tF;   if (r > 1.05) over.f   = r - 1; else if (r < 0.95) under.f   = 1 - r; }
    return { over, under };
  }, [ingredientTotals, personalizedMacros]);

  // Given ingredient densities and overshoot weights, compute a per-ingredient bias factor <= 1
  const computeBiasedAdjust = (dens: {cal:number,p:number,c:number,f:number}) => {
    // Baseline guard: no scaling at all
    if (scalingFactor === 1 && finalAdjustFactor === 1) return 1;
    // Reduce if overshoot, increase if undershoot
    const o = overshootWeights.over || {cal:0,p:0,c:0,f:0};
    const u = overshootWeights.under || {cal:0,p:0,c:0,f:0};
    const overScore = (dens.p * o.p) + (dens.c * o.c) + (dens.f * o.f) + (dens.cal * o.cal);
    const underScore = (dens.p * u.p) + (dens.c * u.c) + (dens.f * u.f) + (dens.cal * u.cal);
    // If we are over on any macro: prefer reduction using global finalAdjustFactor as base
    if (isFinite(overScore) && overScore > 0) {
      const norm = Math.min(1, overScore / 10);
      const beta = 0.2; // strength for reduction
      const base = finalAdjustFactor;
      return Math.max(0.6, Math.min(1, base - beta * norm));
    }
    // If we are under on any macro: increase up to +20%
    if (isFinite(underScore) && underScore > 0) {
      const norm = Math.min(1, underScore / 10);
      const gamma = 0.45; // even stronger increase to hit 100%
      return Math.min(1.5, 1 + gamma * norm);
    }
    // Neutral
    return 1;
  };


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

  // Debug: summarize macro-aware scaling application on adjustable ingredients
  const scalingDebug = useMemo(() => {
    const dayData: any = originalPlanData?.meals?.weekly_plan?.[selectedDay];
    if (!dayData) return { adjustableCount: 0, minAdj: 1, maxAdj: 1, avgAdj: 1 };
    let cnt = 0, sum = 0, minAdj = 1, maxAdj = 1;
    Object.entries(dayData).forEach(([mealType, meal]: any) => {
      if (!meal?.ingredients) return;
      meal.ingredients.forEach((ingredient: any) => {
        const unit = String(ingredient.unit || '').toLowerCase();
        if (isPieceUnit(unit)) return; // only adjustable
        // compute density
        const f = getFields(ingredient);
        const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
        const perAdj = computeBiasedAdjust(dens);
        cnt++; sum += perAdj; minAdj = Math.min(minAdj, perAdj); maxAdj = Math.max(maxAdj, perAdj);
      });
    });
    const avgAdj = cnt > 0 ? +(sum / cnt).toFixed(3) : 1;
    return { adjustableCount: cnt, minAdj: +minAdj.toFixed(3), maxAdj: +maxAdj.toFixed(3), avgAdj };
  }, [originalPlanData, selectedDay, computeBiasedAdjust]);

  // Day calculation debug: mirrors calculateDayTotals pre-pass and incFactor decision
  const dayCalcDebug = useMemo(() => {
    const dayData: any = originalPlanData?.meals?.weekly_plan?.[selectedDay];
    if (!dayData) return null;
    let fixed = { cal: 0, p: 0, c: 0, f: 0 } as any;
    let adj   = { cal: 0, p: 0, c: 0, f: 0 } as any;
    Object.entries(dayData).forEach(([mealType, meal]: any) => {
      if (!meal?.ingredients) return;
      meal.ingredients.forEach((ingredient: any) => {
        const key = `${selectedDay}_${mealType}_${ingredient.name}`;
        const customAmount = (customAmounts as any)[key];
        const base = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
        const unit = String(ingredient.unit || '').toLowerCase();
        let amount = base * scalingFactor;
        let mult = 1;
        if (isPieceUnit(unit)) {
          amount = scalePiecesAmount(base, scalingFactor);
          const unitWeight = Number(
            ingredient.unit_weight_g ?? ingredient.grams_per_unit ?? ingredient.weight_per_unit ?? ingredient.per_piece_grams ?? ingredient.slice_weight_g ?? ingredient.plakje_gram ?? ingredient.unit_weight
          ) || 0;
          mult = unitWeight > 0 ? (amount * unitWeight) / 100 : amount;
          fixed.cal += (Number(ingredient.calories_per_100g)||0) * mult;
          fixed.p   += (Number(ingredient.protein_per_100g)||0)  * mult;
          fixed.c   += (Number(ingredient.carbs_per_100g)||0)    * mult;
          fixed.f   += (Number(ingredient.fat_per_100g)||0)      * mult;
        } else {
          if (['per_100g','g','gram'].includes(unit)) mult = amount / 100;
          else if (['per_ml','ml'].includes(unit)) mult = amount / 100;
          else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unit)) mult = (amount * 15) / 100;
          else if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unit)) mult = (amount * 5) / 100;
          else if (['per_cup','cup','kop'].includes(unit)) mult = (amount * 240) / 100;
          else if (['per_30g'].includes(unit)) mult = (amount * 30) / 100;
          else mult = amount / 100;
          adj.cal += (Number(ingredient.calories_per_100g)||0) * mult;
          adj.p   += (Number(ingredient.protein_per_100g)||0)  * mult;
          adj.c   += (Number(ingredient.carbs_per_100g)||0)    * mult;
          adj.f   += (Number(ingredient.fat_per_100g)||0)      * mult;
        }
      });
    });
    const tgt = { cal: personalizedMacros.calories, p: personalizedMacros.protein, c: personalizedMacros.carbs, f: personalizedMacros.fat };
    const need = { cal: Math.max(0, tgt.cal - fixed.cal), p: Math.max(0, tgt.p - fixed.p), c: Math.max(0, tgt.c - fixed.c), f: Math.max(0, tgt.f - fixed.f) };
    const incCandidates: number[] = [];
    if (tgt.cal > 0 && need.cal > 0 && adj.cal > 0) incCandidates.push(need.cal / adj.cal);
    if (tgt.p   > 0 && need.p   > 0 && adj.p   > 0) incCandidates.push(need.p   / adj.p);
    if (tgt.c   > 0 && need.c   > 0 && adj.c   > 0) incCandidates.push(need.c   / adj.c);
    if (tgt.f   > 0 && need.f   > 0 && adj.f   > 0) incCandidates.push(need.f   / adj.f);
    let incFactor = 1;
    if (incCandidates.length) incFactor = Math.max(1, Math.min(1.5, Math.min(...incCandidates)));
    const mode = incFactor > 1 ? 'increase' : (finalAdjustFactor < 1 ? 'reduce' : 'neutral');
    return { mode, incFactor: +incFactor.toFixed(3), fixed, adj, need, tgt };
  }, [originalPlanData, selectedDay, customAmounts, scalingFactor, personalizedMacros, finalAdjustFactor]);

  // Build a terminal-like step log for the selected day (red on black)
  const terminalLog = useMemo(() => {
    if (!isClient) return ["[debug waiting for client]"]; // avoid hydration mismatch
    const lines: string[] = [];
    const stamp = 'LOG';
    lines.push(`[${stamp}] Boot >> NutritionPlanDetailPage mounted`);
    lines.push(`[${stamp}] Plan >> loaded: ${!!originalPlanData}, day: ${selectedDay}`);
    lines.push(`[${stamp}] Targets >> kcal=${personalizedMacros.calories}, P=${personalizedMacros.protein}g, C=${personalizedMacros.carbs}g, F=${personalizedMacros.fat}g`);
    lines.push(`[${stamp}] Factors >> scalingFactor=${Number(scalingFactor).toFixed(3)}, finalAdjustFactor=${Number(finalAdjustFactor).toFixed(3)}`);
    if (dayCalcDebug) {
      lines.push(`[${stamp}] Mode >> ${dayCalcDebug.mode}, incFactor=${dayCalcDebug.incFactor}`);
      const f = dayCalcDebug.fixed, a = dayCalcDebug.adj, n = dayCalcDebug.need, t = dayCalcDebug.tgt;
      lines.push(`[${stamp}] Fixed >> kcal=${Math.round(f.cal)}, P=${f.p.toFixed(1)}, C=${f.c.toFixed(1)}, F=${f.f.toFixed(1)}`);
      lines.push(`[${stamp}] Adjustable >> kcal=${Math.round(a.cal)}, P=${a.p.toFixed(1)}, C=${a.c.toFixed(1)}, F=${a.f.toFixed(1)}`);
      lines.push(`[${stamp}] Need(>0 under) >> kcal=${Math.round(n.cal)}, P=${n.p.toFixed(1)}, C=${n.c.toFixed(1)}, F=${n.f.toFixed(1)}`);
    }
    const dayData: any = originalPlanData?.meals?.weekly_plan?.[selectedDay];
    if (!dayData) return lines;
    const factorForAmount = (unit: string) => {
      if (scalingFactor === 1 && finalAdjustFactor === 1) return 1;
      const mode = dayCalcDebug?.mode;
      if (mode === 'increase') return dayCalcDebug?.incFactor || 1;
      if (mode === 'reduce') return finalAdjustFactor;
      return 1; // mixed/neutral
    };
    const mealsOrder = ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'];
    mealsOrder.forEach((meal) => {
      const m = dayData[meal];
      if (!m?.ingredients) return;
      lines.push(`[${stamp}] Meal >> ${meal}`);
      m.ingredients.forEach((ingredient: any) => {
        const key = `${selectedDay}_${meal}_${ingredient.name}`;
        const customAmount = (customAmounts as any)[key];
        const base = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
        const unit = String(ingredient.unit || '').toLowerCase();
        let amtBaseScaled = base * scalingFactor;
        let amtUsed = amtBaseScaled;
        let mult = 1;
        if (isPieceUnit(unit)) {
          amtUsed = scalePiecesAmount(base, scalingFactor);
          const unitWeight = Number(
            ingredient.unit_weight_g ?? ingredient.grams_per_unit ?? ingredient.weight_per_unit ?? ingredient.per_piece_grams ?? ingredient.slice_weight_g ?? ingredient.plakje_gram ?? ingredient.unit_weight
          ) || 0;
          mult = unitWeight > 0 ? (amtUsed * unitWeight) / 100 : amtUsed;
        } else if (['per_100g','g','gram'].includes(unit)) {
          amtUsed = Math.round(amtBaseScaled * factorForAmount(unit));
          mult = amtUsed / 100;
        } else if (['per_ml','ml'].includes(unit)) {
          amtUsed = Math.round(amtBaseScaled * factorForAmount(unit));
          mult = amtUsed / 100;
        } else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unit)) {
          amtUsed = Math.round((amtBaseScaled * factorForAmount(unit)) * 2) / 2;
          mult = (amtUsed * 15) / 100;
        } else if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unit)) {
          amtUsed = Math.round((amtBaseScaled * factorForAmount(unit)) * 2) / 2;
          mult = (amtUsed * 5) / 100;
        } else if (['per_cup','cup','kop'].includes(unit)) {
          amtUsed = Math.round((amtBaseScaled * factorForAmount(unit)) * 10) / 10;
          mult = (amtUsed * 240) / 100;
        } else if (['per_30g'].includes(unit)) {
          amtUsed = Math.round(amtBaseScaled * factorForAmount(unit));
          mult = (amtUsed * 30) / 100;
        } else {
          amtUsed = Math.round(amtBaseScaled * factorForAmount(unit));
          mult = amtUsed / 100;
        }
        const c = (Number(ingredient.calories_per_100g)||0) * mult;
        const p = (Number(ingredient.protein_per_100g)||0)  * mult;
        const cb = (Number(ingredient.carbs_per_100g)||0)    * mult;
        const f = (Number(ingredient.fat_per_100g)||0)      * mult;
        lines.push(`  - ${ingredient.name} | unit=${unit} | base=${base} -> used=${amtUsed} | kcal=${c.toFixed(1)}, P=${p.toFixed(1)}, C=${cb.toFixed(1)}, F=${f.toFixed(1)}`);
      });
    });
    lines.push(`[${stamp}] Totals >> cards: kcal=${dayTotals.calories}, P=${dayTotals.protein}, C=${dayTotals.carbs}, F=${dayTotals.fat}`);
    return lines;
  }, [isClient, originalPlanData, selectedDay, customAmounts, scalingFactor, finalAdjustFactor, dayCalcDebug, dayTotals]);

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
        if (['per_piece','stuk','stuks','per_plakje','plakje','plakjes','plak','per_plak','sneetje','per_sneetje','handje','per_handful'].includes(unit)) mult = amount;
        else if (['per_100g','g','gram'].includes(unit)) mult = amount / 100;
        else if (['per_ml','ml'].includes(unit)) mult = amount / 100;
        else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unit)) mult = (amount * 15) / 100;
        else if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unit)) mult = (amount * 5) / 100;
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
            <h1 className="text-2xl font-bold">{selectedPlan?.name ?? 'Voedingsplan'}</h1>
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
          <p className="text-gray-400">{selectedPlan?.description ?? ''}</p>
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
                  const base = customAmounts[getIngredientKey(mealType, ingredient.name, selectedDay)] ?? ingredient.amount ?? 0;
                  const unit = String(ingredient.unit || '').toLowerCase();
                  let amount = base * scalingFactor;
                  let multiplier = 1;
                  if (isPieceUnit(unit)) {
                    amount = scalePiecesAmount(base, scalingFactor);
                    const unitWeight = Number(
                      ingredient.unit_weight_g ?? ingredient.grams_per_unit ?? ingredient.weight_per_unit ?? ingredient.per_piece_grams ?? ingredient.slice_weight_g ?? ingredient.plakje_gram ?? ingredient.unit_weight
                    ) || 0;
                    multiplier = unitWeight > 0 ? (amount * unitWeight) / 100 : amount;
                  } else if (['per_100g','g','gram'].includes(unit)) {
                    const f = getFields(ingredient);
                    const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                    const perAdj = computeBiasedAdjust(dens);
                    amount = Math.round(amount * perAdj);
                    multiplier = amount / 100;
                  } else if (['per_ml','ml'].includes(unit)) {
                    const f = getFields(ingredient); const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                    const perAdj = computeBiasedAdjust(dens);
                    amount = Math.round(amount * perAdj);
                    multiplier = amount / 100;
                  } else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unit)) {
                    const f = getFields(ingredient); const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                    const perAdj = computeBiasedAdjust(dens);
                    amount = Math.round((amount * perAdj) * 2) / 2;
                    multiplier = (amount * 15) / 100;
                  } else if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unit)) {
                    const f = getFields(ingredient); const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                    const perAdj = computeBiasedAdjust(dens);
                    amount = Math.round((amount * perAdj) * 2) / 2;
                    multiplier = (amount * 5) / 100;
                  } else if (['per_cup','cup','kop'].includes(unit)) {
                    const f = getFields(ingredient); const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                    const perAdj = computeBiasedAdjust(dens);
                    amount = Math.round((amount * perAdj) * 10) / 10;
                    multiplier = (amount * 240) / 100;
                  } else if (['per_30g'].includes(unit)) {
                    const f = getFields(ingredient); const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                    const perAdj = computeBiasedAdjust(dens);
                    amount = Math.round(amount * perAdj);
                    multiplier = (amount * 30) / 100;
                  } else {
                    const f = getFields(ingredient); const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                    const perAdj = computeBiasedAdjust(dens);
                    amount = Math.round(amount * perAdj);
                    multiplier = amount / 100;
                  }
                  const f = getFields(ingredient);
                  totals.calories += f.calories_per_100g * multiplier;
                  totals.protein  += f.protein_per_100g  * multiplier;
                  totals.carbs    += f.carbs_per_100g    * multiplier;
                  totals.fat      += f.fat_per_100g      * multiplier;
                  return totals;
                }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

                const useBackend = !!mealData.nutrition && (scalingFactor === 1 && finalAdjustFactor === 1);
                const mealTotals = useBackend
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
                              let amountBase = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
                              let amount = amountBase * scalingFactor; // apply scaling
                              
                              // Calculate individual ingredient totals (mirror backend unit rules)
                              let multiplier = 1;
                              {
                                const unit = String(ingredient.unit || '').toLowerCase();
                                if (['per_piece','piece','pieces','per_stuk','stuk','stuks','per_plakje','plakje','plakjes','plak','per_plak','sneetje','per_sneetje','handje','per_handful'].includes(unit)) {
                                  // Discrete scaling: never show fractional pieces and never drop below 1 when base >= 1
                                  amount = scalePiecesAmount(amountBase, scalingFactor);
                                  const unitWeight = Number(
                                    ingredient.unit_weight_g ?? ingredient.grams_per_unit ?? ingredient.weight_per_unit ?? ingredient.per_piece_grams ?? ingredient.slice_weight_g ?? ingredient.plakje_gram ?? ingredient.unit_weight
                                  ) || 0;
                                  multiplier = unitWeight > 0 ? (amount * unitWeight) / 100 : amount;
                                } else if (['per_100g','g','gram'].includes(unit)) {
                                  const f = getFields(ingredient); const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                                  const perAdj = computeBiasedAdjust(dens);
                                  amount = Math.round(amount * perAdj);
                                  multiplier = amount / 100;
                                } else if (['per_ml','ml'].includes(unit)) {
                                  const f = getFields(ingredient); const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                                  const perAdj = computeBiasedAdjust(dens);
                                  amount = Math.round(amount * perAdj);
                                  multiplier = amount / 100; // ~1ml = 1g
                                } else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unit)) {
                                  // round to nearest 0.5 spoon after final adjust
                                  const f = getFields(ingredient); const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                                  const perAdj = computeBiasedAdjust(dens);
                                  amount = Math.round((amount * perAdj) * 2) / 2;
                                  multiplier = (amount * 15) / 100;
                                } else if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unit)) {
                                  const f = getFields(ingredient); const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                                  const perAdj = computeBiasedAdjust(dens);
                                  amount = Math.round((amount * perAdj) * 2) / 2;
                                  multiplier = (amount * 5) / 100;
                                } else if (['per_cup','cup','kop'].includes(unit)) {
                                  const f = getFields(ingredient); const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                                  const perAdj = computeBiasedAdjust(dens);
                                  amount = Math.round((amount * perAdj) * 10) / 10;
                                  multiplier = (amount * 240) / 100;
                                } else if (['per_30g'].includes(unit)) {
                                  const f = getFields(ingredient); const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                                  const perAdj = computeBiasedAdjust(dens);
                                  amount = Math.round(amount * perAdj);
                                  multiplier = (amount * 30) / 100;
                                } else {
                                  const f = getFields(ingredient); const dens = { cal: f.calories_per_100g, p: f.protein_per_100g, c: f.carbs_per_100g, f: f.fat_per_100g };
                                  const perAdj = computeBiasedAdjust(dens);
                                  amount = Math.round(amount * perAdj);
                                  multiplier = amount / 100;
                                }
                              }

                              const ingredientCalories = (Number(ingredient.calories_per_100g) || 0) * multiplier;
                              const ingredientProtein  = (Number(ingredient.protein_per_100g)  || 0) * multiplier;
                              const ingredientCarbs    = (Number(ingredient.carbs_per_100g)    || 0) * multiplier;
                              const ingredientFat      = (Number(ingredient.fat_per_100g)      || 0) * multiplier;

                              // Original 100kg (no scaling, no custom) for green debug display
                              const unitLower = String(ingredient.unit || '').toLowerCase();
                              const baseAmt = Number(ingredient.amount || 0);
                              let origAmt = baseAmt;
                              let origMult = 1;
                              if (['per_piece','piece','pieces','per_stuk','stuk','stuks','per_plakje','plakje','plakjes','plak','per_plak','sneetje','per_sneetje','handje','per_handful'].includes(unitLower)) {
                                const unitWeight = Number(
                                  ingredient.unit_weight_g ?? ingredient.grams_per_unit ?? ingredient.weight_per_unit ?? ingredient.per_piece_grams ?? ingredient.slice_weight_g ?? ingredient.plakje_gram ?? ingredient.unit_weight
                                ) || 0;
                                origAmt = Math.max(1, Math.round(baseAmt));
                                origMult = unitWeight > 0 ? (origAmt * unitWeight) / 100 : origAmt;
                              } else if (['per_100g','g','gram'].includes(unitLower)) {
                                origMult = baseAmt / 100;
                              } else if (['per_ml','ml'].includes(unitLower)) {
                                origMult = baseAmt / 100;
                              } else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unitLower)) {
                                origMult = (baseAmt * 15) / 100;
                              } else if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unitLower)) {
                                origMult = (baseAmt * 5) / 100;
                              } else if (['per_cup','cup','kop'].includes(unitLower)) {
                                origMult = (baseAmt * 240) / 100;
                              } else if (['per_30g'].includes(unitLower)) {
                                origMult = (baseAmt * 30) / 100;
                              } else {
                                origMult = baseAmt / 100;
                              }
                              const okc = (Number(ingredient.calories_per_100g) || 0) * origMult;
                              const opr = (Number(ingredient.protein_per_100g)  || 0) * origMult;
                              const och = (Number(ingredient.carbs_per_100g)    || 0) * origMult;
                              const oft = (Number(ingredient.fat_per_100g)      || 0) * origMult;

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
                                    <div className="flex flex-col items-center justify-center gap-1">
                                      <span className="w-16 px-2 py-1 bg-[#232D1A] border border-[#3A4D23] rounded text-white text-center text-sm">
                                        {amount}
                                      </span>
                                      <span className="text-[11px] text-green-400">orig: {origAmt}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 text-center text-gray-300 text-xs">
                                    {getUnitLabel(ingredient.unit)}
                                  </td>
                                  <td className="py-3 text-right text-white font-medium">
                                    <div className="flex flex-col items-end">
                                      <span>{ingredientCalories.toFixed(0)}</span>
                                      <span className="text-[11px] text-green-400">{okc.toFixed(0)}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 text-right text-white">
                                    <div className="flex flex-col items-end">
                                      <span>{ingredientProtein.toFixed(1)}g</span>
                                      <span className="text-[11px] text-green-400">{opr.toFixed(1)}g</span>
                                    </div>
                                  </td>
                                  <td className="py-3 text-right text-white">
                                    <div className="flex flex-col items-end">
                                      <span>{ingredientCarbs.toFixed(1)}g</span>
                                      <span className="text=[11px] text-green-400">{och.toFixed(1)}g</span>
                                    </div>
                                  </td>
                                  <td className="py-3 text-right text-white">
                                    <div className="flex flex-col items-end">
                                      <span>{ingredientFat.toFixed(1)}g</span>
                                      <span className="text-[11px] text-green-400">{oft.toFixed(1)}g</span>
                                    </div>
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

            {/* Extra: Lunch Snack ingredient breakdown */}
            {originalPlanData?.meals?.weekly_plan?.[selectedDay]?.['lunch_snack']?.ingredients && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Lunch Snack – Ingredient breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="text-[#8BAE5A]">
                      <tr className="border-b border-[#3A4D23]">
                        <th className="text-left py-2">Ingrediënt</th>
                        <th className="text-right py-2">Amount</th>
                        <th className="text-right py-2">Unit</th>
                        <th className="text-right py-2">Multiplier</th>
                        <th className="text-right py-2">kcal</th>
                        <th className="text-right py-2">Eiwit</th>
                        <th className="text-right py-2">KH</th>
                        <th className="text-right py-2">Vet</th>
                        <th className="text-right py-2 text-green-400">Orig Amt</th>
                        <th className="text-right py-2 text-green-400">Orig kcal</th>
                        <th className="text-right py-2 text-green-400">Orig Eiwit</th>
                        <th className="text-right py-2 text-green-400">Orig KH</th>
                        <th className="text-right py-2 text-green-400">Orig Vet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const ls = originalPlanData.meals.weekly_plan[selectedDay]['lunch_snack'];
                        return ls.ingredients.map((ingredient: any, idx: number) => {
                          const key = `${selectedDay}_lunch_snack_${ingredient.name}`;
                          const customAmount = (customAmounts as any)[key];
                          let amountBase = (customAmount !== undefined ? customAmount : (ingredient.amount || 0));
                          let amount = amountBase * scalingFactor;
                          const unit = String(ingredient.unit || '').toLowerCase();
                          let mult = 1;
                          if (['per_piece','piece','pieces','per_stuk','stuk','stuks','per_plakje','plakje','plakjes','plak','per_plak','sneetje','per_sneetje','handje','per_handful'].includes(unit)) {
                            amount = scalePiecesAmount(amountBase, scalingFactor);
                            mult = amount;
                          }
                          else if (['per_100g','g','gram'].includes(unit)) mult = amount / 100;
                          else if (['per_ml','ml'].includes(unit)) mult = amount / 100;
                          else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unit)) mult = (amount * 15) / 100;
                          else if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unit)) mult = (amount * 5) / 100;
                          else if (['per_cup','cup','kop'].includes(unit)) mult = (amount * 240) / 100;
                          else if (['per_30g'].includes(unit)) mult = (amount * 30) / 100;
                          else mult = amount / 100;
                          const ff = getFields(ingredient);
                          const kc = ff.calories_per_100g * mult;
                          const pr = ff.protein_per_100g * mult;
                          const ch = ff.carbs_per_100g * mult;
                          const ft = ff.fat_per_100g * mult;

                          // Original 100kg (no scaling, no custom override) baselines
                          let origAmt = (ingredient.amount || 0);
                          let origMult = 1;
                          if (['per_piece','stuk','stuks','per_plakje','plakje','plakjes','plak','per_plak','sneetje','per_sneetje','handje','per_handful'].includes(unit)) {
                            origAmt = Math.max(1, Math.round(origAmt));
                            origMult = origAmt;
                          } else if (['per_100g','g','gram'].includes(unit)) {
                            origMult = origAmt / 100;
                          } else if (['per_ml','ml'].includes(unit)) {
                            origMult = origAmt / 100;
                          } else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unit)) {
                            origMult = (origAmt * 15) / 100;
                          } else if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unit)) {
                            origMult = (origAmt * 5) / 100;
                          } else if (['per_cup','cup','kop'].includes(unit)) {
                            origMult = (origAmt * 240) / 100;
                          } else if (['per_30g'].includes(unit)) {
                            origMult = (origAmt * 30) / 100;
                          } else {
                            origMult = origAmt / 100;
                          }
                          const okc = ff.calories_per_100g * origMult;
                          const opr = ff.protein_per_100g * origMult;
                          const och = ff.carbs_per_100g * origMult;
                          const oft = ff.fat_per_100g * origMult;
                          return (
                            <tr key={idx} className="border-b border-[#2A3A1A] last:border-b-0">
                              <td className="py-2 text-white">{ingredient.name}</td>
                              <td className="py-2 text-right">{amount}</td>
                              <td className="py-2 text-right">{unit}</td>
                              <td className="py-2 text-right">{mult.toFixed(3)}</td>
                              <td className="py-2 text-right">{kc.toFixed(1)}</td>
                              <td className="py-2 text-right">{pr.toFixed(1)}g</td>
                              <td className="py-2 text-right">{ch.toFixed(1)}g</td>
                              <td className="py-2 text-right">{ft.toFixed(1)}g</td>
                              <td className="py-2 text-right text-green-400">{origAmt}</td>
                              <td className="py-2 text-right text-green-400">{okc.toFixed(1)}</td>
                              <td className="py-2 text-right text-green-400">{opr.toFixed(1)}g</td>
                              <td className="py-2 text-right text-green-400">{och.toFixed(1)}g</td>
                              <td className="py-2 text-right text-green-400">{oft.toFixed(1)}g</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* End Lunch Snack ingredient breakdown */}
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
                <p className="mt-2 text-sm">Plan: {selectedPlan?.name ?? ''}</p>
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

        {/* Sticky Debug Panel: right-center */}
        {showDebug && (
          <div
            className="fixed z-40 w-80 bg-[#111511] border border-[#2F3E22] rounded-lg shadow-xl p-4 text-sm"
            style={{ right: 16, top: 30 }}
          >
            <div className="text-[#B6C948] font-semibold mb-2">Scaling Debug</div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-400">scalingFactor</span><span>{Number(scalingFactor).toFixed(3)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">finalAdjustFactor</span><span>{Number(finalAdjustFactor).toFixed(3)}</span></div>
              <div className="mt-2 text-[#B6C948] font-semibold">Overshoot Weights</div>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center"><div className="text-gray-400">kcal</div><div>{((overshootWeights.over?.cal)||0).toFixed(3)}</div></div>
                <div className="text-center"><div className="text-gray-400">P</div><div>{((overshootWeights.over?.p)||0).toFixed(3)}</div></div>
                <div className="text-center"><div className="text-gray-400">C</div><div>{((overshootWeights.over?.c)||0).toFixed(3)}</div></div>
                <div className="text-center"><div className="text-gray-400">F</div><div>{((overshootWeights.over?.f)||0).toFixed(3)}</div></div>
              </div>
              <div className="mt-2 text-[#B6C948] font-semibold">Deficit Weights</div>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center"><div className="text-gray-400">kcal</div><div>{((overshootWeights.under?.cal)||0).toFixed(3)}</div></div>
                <div className="text-center"><div className="text-gray-400">P</div><div>{((overshootWeights.under?.p)||0).toFixed(3)}</div></div>
                <div className="text-center"><div className="text-gray-400">C</div><div>{((overshootWeights.under?.c)||0).toFixed(3)}</div></div>
                <div className="text-center"><div className="text-gray-400">F</div><div>{((overshootWeights.under?.f)||0).toFixed(3)}</div></div>
              </div>
              <div className="mt-2 text-[#B6C948] font-semibold">Per-Ingredient Adj</div>
              <div className="flex justify-between"><span className="text-gray-400">adjustable</span><span>{scalingDebug.adjustableCount}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">minAdj</span><span>{scalingDebug.minAdj}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">avgAdj</span><span>{scalingDebug.avgAdj}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">maxAdj</span><span>{scalingDebug.maxAdj}</span></div>
            </div>
          </div>
        )}

        {/* Bottom Terminal Log (red on black) */}
        {showDebug && (
          <div className="fixed inset-x-0 bottom-0 z-40 bg-black border-t-2 border-red-600 p-3 h-64 overflow-y-auto font-mono text-xs text-red-500 shadow-[0_-4px_12px_rgba(0,0,0,0.6)]">
            {terminalLog && terminalLog.length > 0 ? (
              <pre className="whitespace-pre-wrap leading-5">
                {terminalLog.join('\n')}
              </pre>
            ) : (
              <div className="text-red-400">[no logs]</div>
            )}
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
