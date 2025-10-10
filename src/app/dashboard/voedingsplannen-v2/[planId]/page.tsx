'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { motion } from 'framer-motion';
import { 
  BookOpenIcon, 
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
  const [loadingStep, setLoadingStep] = useState(0); // 0: generating, 1: kcal, 2: protein, 3: carbs, 4: fat
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
  const [showDebug, setShowDebug] = useState<boolean>(false);
  // Debug modal to inspect loaded ingredients per meal
  const [showIngredientsModal, setShowIngredientsModal] = useState<boolean>(false);
  // DB ingredient lookup to mirror backend macros
  const [ingredientLookup, setIngredientLookup] = useState<Record<string, any> | null>(null);
  // Compact reset modal for locked plan
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const resetModalRef = useRef<HTMLDivElement | null>(null);
  // Check if this plan is the active/locked plan
  const [isPlanLocked, setIsPlanLocked] = useState<boolean>(false);
  // Scaling factor based on FULL TTM formula (weight, activity, goal)
  // This ensures the plan scales correctly for ALL combinations
  const scalingFactor = useMemo(() => {
    const w = Number(userProfile?.weight || 100);
    if (!Number.isFinite(w) || w <= 0) return 1;
    
    // Calculate baseline TTM (100kg, moderate activity, maintenance)
    const baselineTTM = 100 * 22 * 1.3; // 2860 kcal
    
    // Calculate user's TTM (same factors as detail page)
    let userActivityFactor = 1.3; // Staand (Matig actief) - default
    if (userProfile?.activity_level === 'sedentary') userActivityFactor = 1.1; // Zittend (Licht actief)
    else if (userProfile?.activity_level === 'very_active') userActivityFactor = 1.6; // Lopend (Zeer actief)
    
    let goalAdjustment = 0;
    if (userProfile?.fitness_goal === 'droogtrainen') {
      goalAdjustment = -500;
    } else if (userProfile?.fitness_goal === 'spiermassa') {
      goalAdjustment = 400;
    }
    
    const userTTM = (w * 22 * userActivityFactor) + goalAdjustment;
    
    // Calculate scaling factor as ratio of TTMs
    const rawFactor = userTTM / baselineTTM;
    
    // Clamp tussen 0.5x en 1.5x voor veilige range
    return Math.max(0.5, Math.min(1.5, rawFactor));
  }, [userProfile?.weight, userProfile?.activity_level, userProfile?.fitness_goal]);

  // Reset modal state when component mounts
  useEffect(() => {
    setShowIngredientModal(false);
    setEditingMealType('');
    setEditingDay('');
  }, []);

  // Animate loading steps
  useEffect(() => {
    // Only animate when actually loading data
    if (!loadingOriginal && originalPlanData) {
      setLoadingStep(0);
      return;
    }
    
    const steps = [0, 1, 2, 3, 4]; // generating, kcal, protein, carbs, fat
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < steps.length) {
        setLoadingStep(steps[currentIndex]);
      } else {
        clearInterval(interval);
      }
    }, 400); // Change step every 400ms
    
    return () => clearInterval(interval);
  }, [loadingOriginal, originalPlanData]);

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

  // Auto-scroll and focus the reset modal when it opens (mobile-friendly)
  useEffect(() => {
    if (showResetModal) {
      const t = setTimeout(() => {
        try {
          resetModalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          resetModalRef.current?.focus({ preventScroll: true } as any);
        } catch {}
      }, 50);
      return () => clearTimeout(t);
    }
  }, [showResetModal]);

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
      setLoadingStep(0); // Reset to generating step
      
      // Prefer admin meals endpoint to ensure we mirror exact backend meals + nutrition
      const response = await fetch(`/api/admin/plan-meals?planId=${planId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch plan meals: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔧 DEBUG: Plan meals data received:', data);
      const plan = data?.plan || data;
      console.log('🔧 DEBUG: Plan ID:', plan?.id, 'Plan name:', plan?.name);
      console.log('🔧 DEBUG: Plan target_calories:', plan?.target_calories);
      console.log('🔧 DEBUG: Monday data:', plan?.meals?.weekly_plan?.maandag);
      console.log('🔧 DEBUG: Monday ontbijt:', plan?.meals?.weekly_plan?.maandag?.ontbijt);
      console.log('🔧 DEBUG: Monday ontbijt ingredients:', plan?.meals?.weekly_plan?.maandag?.ontbijt?.ingredients);
      setOriginalPlanData(plan);
    } catch (err) {
      console.error('🔧 DEBUG: Error loading original plan data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load plan data');
    } finally {
      setLoadingOriginal(false);
      setLoadingStep(0);
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
        // Map database goal values (cut, maintain, bulk) to Dutch terms (droogtrainen, onderhoud, spiermassa)
        const goalMapping: Record<string, 'droogtrainen' | 'onderhoud' | 'spiermassa'> = {
          'cut': 'droogtrainen',
          'maintain': 'onderhoud',
          'maintenance': 'onderhoud',
          'bulk': 'spiermassa'
        };
        
        const dbGoal = data.profile.goal || data.profile.fitness_goal || 'maintain';
        const mappedGoal = goalMapping[dbGoal] || 'onderhoud';
        
        console.log('🎯 Goal mapping:', { dbGoal, mappedGoal });
        
        setUserProfile({
          weight: data.profile.weight || 100,
          height: data.profile.height || 180,
          age: data.profile.age || 30,
          gender: data.profile.gender || 'male',
          activity_level: data.profile.activity_level || 'moderate',
          fitness_goal: mappedGoal
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Check if this plan is the active/locked plan
  useEffect(() => {
    if (!user?.id || !planId) return;
    
    const checkActivePlan = async () => {
      try {
        const res = await fetch(`/api/nutrition-plan-active?userId=${user.id}`, { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.success && data?.hasActivePlan && data?.activePlanId) {
          // Check if current plan matches active plan (by ID or plan_id)
          const currentPlan = plans.find(p => p.plan_id === planId || String(p.id) === String(planId));
          const isThisPlanActive = data.activePlanId === planId || 
                                   data.activePlanId === String(currentPlan?.id) ||
                                   data.activePlanId === currentPlan?.plan_id;
          setIsPlanLocked(isThisPlanActive);
        } else {
          setIsPlanLocked(false);
        }
      } catch (e) {
        console.warn('Failed to check if plan is locked', e);
        setIsPlanLocked(false);
      }
    };
    
    checkActivePlan();
  }, [user?.id, planId, plans]);

  // Find the selected plan based on planId (supports friendly slugs like 'carnivoor-onderhoud')
  useEffect(() => {
    if (plans.length > 0 && planId) {
      const slugify = (s: string) => s
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const pid = String(planId).toLowerCase();
      const plan = plans.find(p => {
        const byId = p.plan_id === planId || String(p.id) === String(planId);
        if (byId) return true;
        const nameSlug = slugify(String(p.name || ''));
        return nameSlug === pid || nameSlug.includes(pid);
      });
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

  // Compact reset handlers (inside component scope)
  const handleResetClick = useCallback(() => setShowResetModal(true), []);
  const handleConfirmReset = useCallback(async () => {
    try {
      await fetch('/api/nutrition-plan-select', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
    } catch {}
    router.push('/dashboard/voedingsplannen-v2');
  }, [router, user?.id]);

  // Calculate day totals using V3 simple scaling + surplus reduction
  const calculateDayTotals = (day: string): DayTotals => {
    const srcDay: any = originalPlanData?.meals?.weekly_plan?.[day];
    if (!srcDay) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const copy = JSON.parse(JSON.stringify(srcDay));
    // 1) scale only non-piece units by weight factor
    ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'].forEach(mt => {
      const meal = copy?.[mt];
      if (!meal?.ingredients) return;
      meal.ingredients.forEach((ing:any) => {
        if (typeof ing.amount !== 'number') return;
        const u = String(ing.unit||'').toLowerCase();
        if (['per_piece','piece','pieces','per_stuk','stuk','stuks','per_plakje','plakje','plakjes','plak','per_plak','sneetje','per_sneetje','handje','per_handful'].includes(u)) return;
        let next = ing.amount * scalingFactor;
        // simple rounding per unit family
        if (['per_100g','g','gram','per_ml','ml'].includes(u)) next = Math.round(next);
        else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel','per_tsp','tsp','theelepel','tl','per_theelepel'].includes(u)) next = Math.round(next*2)/2;
        else if (['per_cup','cup','kop'].includes(u)) next = Math.round(next*10)/10;
        else if (['per_30g'].includes(u)) next = Math.round(next);
        ing.amount = next;
      });
    });
    // 🔧 V3 LOGICA: Helper functies voor clean berekening
    const gramsPerUnit = (ing: any) => {
      const u = String(ing?.unit || '').toLowerCase();
      if (u === 'g' || u === 'gram') return 100; // FIX: "g" means grams, not 1 gram per unit
      if (u === 'per_100g') return 100;
      if (u === 'ml' || u === 'per_ml') return 1;
      if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(u)) return 15;
      if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(u)) return 5;
      if (['per_cup','cup','kop'].includes(u)) return 240;
      if (u === 'per_30g') return 30;
      const w = Number(ing.unit_weight_g ?? ing.grams_per_unit ?? ing.weight_per_unit ?? ing.per_piece_grams ?? ing.slice_weight_g ?? ing.plakje_gram ?? ing.unit_weight);
      return Number.isFinite(w) && w > 0 ? w : 100;
    };
    
    const macroPerUnit = (ing: any) => {
      const g100 = {
        cal: Number(ing.calories_per_100g || 0),
        p: Number(ing.protein_per_100g || 0),
        c: Number(ing.carbs_per_100g || 0),
        f: Number(ing.fat_per_100g || 0),
      };
      const gPerUnit = gramsPerUnit(ing);
      const factor = gPerUnit / 100;
      return {
        cal: g100.cal * factor,
        p: g100.p * factor,
        c: g100.c * factor,
        f: g100.f * factor,
      };
    };
    
    // helper to compute totals - EXACT V3 LOGICA
    const computeTotals = (data:any) => {
      let t = { cal:0,p:0,c:0,f:0 } as any;
      ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'].forEach(mt => {
        const meal = data?.[mt];
        if (!meal?.ingredients) return;
        meal.ingredients.forEach((ing:any)=>{
          const per = macroPerUnit(ing);
          const amount = Number(ing.amount || 0);
          const u = String(ing.unit || '').toLowerCase();
          
          // 🔧 V3 FORMULE: Voor pieces direct amount, voor rest amount/gramsPerUnit
          const multiplier = isPieceUnit(u) ? amount : amount / gramsPerUnit(ing);
          
          t.cal += per.cal * multiplier;
          t.p   += per.p   * multiplier;
          t.c   += per.c   * multiplier;
          t.f   += per.f   * multiplier;
        });
      });
      return t;
    };
    let totals = computeTotals(copy);
    const tgt = { cal: personalizedMacros.calories, p: personalizedMacros.protein, c: personalizedMacros.carbs, f: personalizedMacros.fat };
    const surplus = Math.max(0, Math.round(totals.cal) - tgt.cal);
    if (surplus > 5) {
      const mealTypes = ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'];
      const mealAdj = mealTypes.map(mt => {
        const meal = copy?.[mt];
        if (!meal?.ingredients) return { mt, kcal: 0 };
        let kcal = 0;
        meal.ingredients.forEach((ing:any)=>{
          if (isPieceUnit(ing.unit)) return;
          const dens = macroPerUnit(ing);
          const perUnitK = dens.p * 4 + dens.c * 4 + dens.f * 9;
          kcal += perUnitK * (Number(ing.amount||0) / Math.max(1, gramsPerUnit(ing)));
        });
        return { mt, kcal };
      });
      const totalAdj = mealAdj.reduce((a,b)=>a+(b.kcal||0),0);
      if (totalAdj > 0) {
        mealAdj.forEach(entry => {
          if (!entry.kcal) return;
          const meal = copy?.[entry.mt];
          if (!meal?.ingredients) return;
          let remaining = surplus * (entry.kcal / totalAdj);
          const adjustable = meal.ingredients.filter((ing:any)=> !isPieceUnit(ing.unit));
          const perUnitKs = adjustable.map((ing:any)=>{
            const dens = macroPerUnit(ing);
            return dens.p * 4 + dens.c * 4 + dens.f * 9;
          });
          const sumPerUnitK = perUnitKs.reduce((a:number,b:number)=>a+b,0);
          adjustable.forEach((ing:any, idx:number)=>{
            if (remaining <= 0) return;
            const perK = perUnitKs[idx] || 0;
            if (perK <= 0) return;
            const portion = sumPerUnitK > 0 ? perK/sumPerUnitK : 0;
            const reduceK = remaining * portion;
            const gPer = gramsPerUnit(ing);
            const deltaUnits = reduceK / perK;
            let next = Math.max(0, (Number(ing.amount||0) - deltaUnits * gPer));
            const u = String(ing.unit||'').toLowerCase();
            // rounding
            if (['per_100g','g','gram','per_ml','ml'].includes(u)) next = Math.round(next);
            else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel','per_tsp','tsp','theelepel','tl','per_theelepel'].includes(u)) next = Math.round(next*2)/2;
            else if (['per_cup','cup','kop'].includes(u)) next = Math.round(next*10)/10;
            remaining -= Math.max(0, (Number(ing.amount||0) - next)) / Math.max(1, gPer) * perK;
            ing.amount = next;
          });
        });
        totals = computeTotals(copy);
      }
    }

    // deficit-fill: only when under target, increase only adjustable items evenly across meals
    const deficit = Math.max(0, tgt.cal - Math.round(totals.cal));
    if (deficit > 5) {
      const mealTypes2 = ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'];
      const mealAdj2 = mealTypes2.map(mt => {
        const meal = copy?.[mt];
        if (!meal?.ingredients) return { mt, kcal: 0 } as any;
        let kcal = 0;
        meal.ingredients.forEach((ing:any)=>{
          if (isPieceUnit(ing.unit)) return;
          const dens = macroPerUnit(ing);
          const perUnitK = dens.p * 4 + dens.c * 4 + dens.f * 9;
          kcal += perUnitK * (Number(ing.amount||0) / Math.max(1, gramsPerUnit(ing)));
        });
        return { mt, kcal };
      });
      const totalAdj2 = mealAdj2.reduce((a,b)=>a+(b.kcal||0),0);
      if (totalAdj2 > 0) {
        mealAdj2.forEach(entry => {
          if (!entry.kcal) return;
          const meal = copy?.[entry.mt];
          if (!meal?.ingredients) return;
          let remaining = deficit * (entry.kcal / totalAdj2);
          const adjustable = meal.ingredients.filter((ing:any)=> !isPieceUnit(ing.unit));
          const perUnitKs = adjustable.map((ing:any)=>{
            const dens = macroPerUnit(ing);
            return dens.p * 4 + dens.c * 4 + dens.f * 9;
          });
          const sumPerUnitK = perUnitKs.reduce((a:number,b:number)=>a+b,0);
          adjustable.forEach((ing:any, idx:number)=>{
            if (remaining <= 0) return;
            const perK = perUnitKs[idx] || 0;
            if (perK <= 0) return;
            const portion = sumPerUnitK > 0 ? perK/sumPerUnitK : 0;
            const addK = remaining * portion;
            const gPer = gramsPerUnit(ing);
            const deltaUnits = addK / perK;
            let next = Number(ing.amount||0) + deltaUnits * gPer;
            const u = String(ing.unit||'').toLowerCase();
            if (['per_100g','g','gram','per_ml','ml'].includes(u)) next = Math.round(next);
            else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel','per_tsp','tsp','theelepel','tl','per_theelepel'].includes(u)) next = Math.round(next*2)/2;
            else if (['per_cup','cup','kop'].includes(u)) next = Math.round(next*10)/10;
            remaining -= Math.max(0, (next - Number(ing.amount||0))) / Math.max(1, gPer) * perK;
            ing.amount = next;
          });
        });
        totals = computeTotals(copy);
      }
    }
    return {
      calories: Math.round(totals.cal),
      protein: Math.round(totals.p*10)/10,
      carbs: Math.round(totals.c*10)/10,
      fat: Math.round(totals.f*10)/10,
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

  // TTM-based calories calculation (same formula as overview page)
  const userTTMCalories = useMemo(() => {
    if (!userProfile) return 2574; // Default fallback
    
    const weight = Number(userProfile.weight) || 100;
    
    // Activity factor based on activity level
    let activityFactor = 1.3; // Staand (Matig actief) - default
    if (userProfile.activity_level === 'sedentary') {
      activityFactor = 1.1; // Zittend (Licht actief)
    } else if (userProfile.activity_level === 'very_active') {
      activityFactor = 1.6; // Lopend (Zeer actief)
    }
    
    // TTM Formula: weight × 22 × activity factor (= onderhoud calorieën)
    const maintenanceCalories = Math.round(weight * 22 * activityFactor);
    
    // Goal adjustment - Use database values (Dutch terms)
    let goalAdjustment = 0;
    if (userProfile.fitness_goal === 'droogtrainen') {
      goalAdjustment = -500; // Droogtrainen: -500 kcal
    } else if (userProfile.fitness_goal === 'spiermassa') {
      goalAdjustment = 400; // Spiermassa: +400 kcal
    }
    // 'maintenance'/'onderhoud' blijft 0 (geen aanpassing)
    
    const targetCalories = maintenanceCalories + goalAdjustment;
    
    console.log('🎯 Detail Page TTM Calculation:', {
      weight,
      activityLevel: userProfile.activity_level,
      activityFactor,
      fitnessGoal: userProfile.fitness_goal,
      maintenanceCalories,
      goalAdjustment,
      calculation: `${weight} × 22 × ${activityFactor} ${goalAdjustment >= 0 ? '+' : ''}${goalAdjustment}`,
      result: targetCalories
    });
    
    return targetCalories;
  }, [userProfile?.weight, userProfile?.activity_level, userProfile?.fitness_goal]);

  // V3 targets: derive from selected day's backend values, then scale by weight factor
  const personalizedMacros = useMemo(() => {
    const factor = scalingFactor || 1;
    const src: any = (originalPlanData as any)?.meals?.weekly_plan?.[selectedDay];
    let baseCal = 0, baseP = 0, baseC = 0, baseF = 0;
    if (src) {
      const dayTargets = src?.targets || src?.day_targets || src?.doelen || {};
      const tCal = Number(dayTargets.calories ?? dayTargets.kcal ?? dayTargets.target_calories ?? 0);
      const tP   = Number(dayTargets.protein  ?? dayTargets.p   ?? dayTargets.target_protein  ?? 0);
      const tC   = Number(dayTargets.carbs    ?? dayTargets.c   ?? dayTargets.target_carbs    ?? 0);
      const tF   = Number(dayTargets.fat      ?? dayTargets.f   ?? dayTargets.target_fat      ?? 0);
      if (tCal > 0) { baseCal = tCal; baseP = tP; baseC = tC; baseF = tF; }
      if (baseCal === 0) {
        let t = { cal: 0, p: 0, c: 0, f: 0 } as any;
        ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'].forEach(mt => {
          const meal = src?.[mt];
          if (!meal) return;
          if (meal.nutrition) {
            t.cal += Number(meal.nutrition.calories)||0;
            t.p   += Number(meal.nutrition.protein)||0;
            t.c   += Number(meal.nutrition.carbs)||0;
            t.f   += Number(meal.nutrition.fat)||0;
          } else if (Array.isArray(meal.ingredients)) {
            meal.ingredients.forEach((ing:any) => {
              const u = String(ing.unit||'').toLowerCase();
              const amount = Number(ing.amount||0);
              const per100 = { cal: Number(ing.calories_per_100g)||0, p: Number(ing.protein_per_100g)||0, c: Number(ing.carbs_per_100g)||0, f: Number(ing.fat_per_100g)||0 };
              // Estimate grams per unit
              const gPerUnit = (()=>{
                if (['per_100g','g','gram'].includes(u)) return 100;
                if (['per_ml','ml'].includes(u)) return 100;
                if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(u)) return 15;
                if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(u)) return 5;
                if (['per_cup','cup','kop'].includes(u)) return 240;
                if (['per_30g'].includes(u)) return 30;
                const w = Number(ing.unit_weight_g ?? ing.grams_per_unit ?? ing.weight_per_unit ?? ing.per_piece_grams ?? ing.slice_weight_g ?? ing.plakje_gram ?? ing.unit_weight) || 0;
                return w>0 ? w : 100;
              })();
              const units = ['per_100g','g','gram','per_ml','ml','per_tbsp','tbsp','eetlepel','el','per_eetlepel','per_tsp','tsp','theelepel','tl','per_theelepel','per_cup','cup','kop','per_30g'].includes(u)
                ? amount / gPerUnit
                : amount; // pieces
              t.cal += per100.cal * units;
              t.p   += per100.p   * units;
              t.c   += per100.c   * units;
              t.f   += per100.f   * units;
            });
          }
        });
        baseCal = Math.round(t.cal); baseP = Math.round(t.p); baseC = Math.round(t.c); baseF = Math.round(t.f);
      }
    }
    // Use TTM calories instead of scaled base calories
    const targetCalories = userTTMCalories;
    
    // Get plan percentages from selectedPlan or originalPlanData
    const planData: any = selectedPlan || originalPlanData;
    const proteinPercentage = planData?.protein_percentage ?? planData?.meals?.protein_percentage ?? null;
    const carbsPercentage   = planData?.carbs_percentage   ?? planData?.meals?.carbs_percentage   ?? null;
    const fatPercentage     = planData?.fat_percentage     ?? planData?.meals?.fat_percentage     ?? null;
    
    // If percentages are available, use them
    if (proteinPercentage && carbsPercentage && fatPercentage) {
    return {
        calories: targetCalories,
        protein: Math.round((targetCalories * proteinPercentage / 100) / 4),
        carbs: Math.round((targetCalories * carbsPercentage / 100) / 4),
        fat: Math.round((targetCalories * fatPercentage / 100) / 9),
      };
    }
    
    // If percentages not available, use plan target macros and scale them
    const planTargetProtein = planData?.target_protein ?? planData?.meals?.target_protein ?? null;
    const planTargetCarbs   = planData?.target_carbs   ?? planData?.meals?.target_carbs   ?? null;
    const planTargetFat     = planData?.target_fat     ?? planData?.meals?.target_fat     ?? null;
    const planTargetCalories = planData?.target_calories ?? planData?.meals?.target_calories ?? baseCal;
    
    const hasAllMacroGrams = [planTargetProtein, planTargetCarbs, planTargetFat].every(v => typeof v === 'number' && !Number.isNaN(v));
    if (hasAllMacroGrams && planTargetCalories) {
      const scale = targetCalories / planTargetCalories;
      return {
        calories: targetCalories,
        protein: Math.round((planTargetProtein as number) * scale),
        carbs: Math.round((planTargetCarbs as number) * scale),
        fat: Math.round((planTargetFat as number) * scale),
      };
    }
    
    // Fallback: use carnivore-aware defaults
    const isCarnivore = String(planData?.name || '').toLowerCase().includes('carnivoor');
    const pPct = isCarnivore ? 35 : 35;
    const cPct = isCarnivore ? 5  : 40;
    const fPct = isCarnivore ? 60 : 25;
    
    return {
      calories: targetCalories,
      protein: Math.round((targetCalories * pPct) / 100 / 4),
      carbs: Math.round((targetCalories * cPct) / 100 / 4),
      fat: Math.round((targetCalories * fPct) / 100 / 9),
    };
  }, [scalingFactor, originalPlanData, selectedDay, selectedPlan, userTTMCalories]);

  const isPieceUnit = (unit: string) =>
    ['per_piece','piece','pieces','per_stuk','stuk','stuks','per_plakje','plakje','plakjes','plak','per_plak','sneetje','per_sneetje','handje','per_handful']
      .includes(String(unit || '').toLowerCase());

  

  // Remove legacy final adjust: use simple scaling only
  const finalAdjustFactor = 1;

  // moved early return blocks below (after all hooks)

  
  // Get current day totals - USE BACKEND DATA DIRECTLY (already correct in DB)
  const dayTotals = useMemo(() => {
    if (!originalPlanData?.meals?.weekly_plan?.[selectedDay]) {
      console.log('🔄 No originalPlanData available, returning zeros');
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    
    console.log('🔄 Calculating day totals from backend nutrition data');
    const dayData: any = originalPlanData.meals.weekly_plan[selectedDay];
    let t = { calories: 0, protein: 0, carbs: 0, fat: 0 } as any;
    
    // Sum up all meal nutrition values from backend
    Object.values(dayData).forEach((meal: any) => {
      if (meal?.nutrition) {
        t.calories += Number(meal.nutrition.calories) || 0;
        t.protein += Number(meal.nutrition.protein) || 0;
        t.carbs += Number(meal.nutrition.carbs) || 0;
        t.fat += Number(meal.nutrition.fat) || 0;
      }
    });
    
    // STEP 1: Apply simple proportional scaling
    let scaledCalories = Math.round(t.calories * scalingFactor);
    let scaledProtein = Math.round(t.protein * scalingFactor * 10) / 10;
    let scaledCarbs = Math.round(t.carbs * scalingFactor * 10) / 10;
    let scaledFat = Math.round(t.fat * scalingFactor * 10) / 10;
    
    console.log('🔧 Backend totals (100kg baseline):', t);
    console.log('🔧 Scaled totals (simple scaling):', {
      calories: scaledCalories,
      protein: scaledProtein,
      carbs: scaledCarbs,
      fat: scaledFat
    });
    
    // STEP 2: Check if we need intelligent macro-optimization
    // Get target macros from personalizedMacros (calculated based on TTM + plan percentages)
    const targetCalories = userTTMCalories;
    const planData: any = selectedPlan || originalPlanData;
    const proteinPct = planData?.protein_percentage ?? planData?.meals?.protein_percentage ?? 35;
    const carbsPct = planData?.carbs_percentage ?? planData?.meals?.carbs_percentage ?? 5;
    const fatPct = planData?.fat_percentage ?? planData?.meals?.fat_percentage ?? 60;
    
    const targetProtein = Math.round((targetCalories * proteinPct / 100) / 4);
    const targetCarbs = Math.round((targetCalories * carbsPct / 100) / 4);
    const targetFat = Math.round((targetCalories * fatPct / 100) / 9);
    
    // Calculate percentages
    const proteinPercentage = targetProtein > 0 ? Math.round((scaledProtein / targetProtein) * 100) : 100;
    const carbsPercentage = targetCarbs > 0 ? Math.round((scaledCarbs / targetCarbs) * 100) : 100;
    const fatPercentage = targetFat > 0 ? Math.round((scaledFat / targetFat) * 100) : 100;
    const caloriesPercentage = targetCalories > 0 ? Math.round((scaledCalories / targetCalories) * 100) : 100;
    
    // Check if all macros are within green range (95-105%)
    const allGreen = [caloriesPercentage, proteinPercentage, carbsPercentage, fatPercentage].every(
      pct => pct >= 95 && pct <= 105
    );
    
    // STEP 3: INTELLIGENT MACRO-TARGETED SCALING
    // Only apply if simple scaling didn't achieve 4x green
    if (!allGreen) {
      console.log('⚠️ Simple scaling not optimal, applying intelligent macro-optimization');
      console.log('📊 Target macros:', { targetProtein, targetCarbs, targetFat, targetCalories });
      console.log('📊 Current percentages:', { proteinPercentage, carbsPercentage, fatPercentage, caloriesPercentage });
      
      // Calculate individual scaling factors per macro to reach 100%
      const proteinAdjustment = targetProtein / scaledProtein;
      const carbsAdjustment = targetCarbs / scaledCarbs;
      const fatAdjustment = targetFat / scaledFat;
      
      // Apply macro-specific scaling
      scaledProtein = Math.round((scaledProtein * proteinAdjustment) * 10) / 10;
      scaledCarbs = Math.round((scaledCarbs * carbsAdjustment) * 10) / 10;
      scaledFat = Math.round((scaledFat * fatAdjustment) * 10) / 10;
      
      // Recalculate calories based on optimized macros
      scaledCalories = Math.round((scaledProtein * 4) + (scaledCarbs * 4) + (scaledFat * 9));
      
      console.log('✅ Optimized totals:', {
        calories: scaledCalories,
        protein: scaledProtein,
        carbs: scaledCarbs,
        fat: scaledFat
      });
    } else {
      console.log('✅ Simple scaling already optimal (4x green)');
    }
    
    return {
      calories: scaledCalories,
      protein: scaledProtein,
      carbs: scaledCarbs,
      fat: scaledFat
    };
  }, [selectedDay, originalPlanData, scalingFactor, userTTMCalories, selectedPlan]);

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

  // Simplify ingredientTotals to use the same calculation as dayTotals
  const ingredientTotals = useMemo(() => {
    return calculateDayTotals(selectedDay);
  }, [selectedDay, originalPlanData, scalingFactor, personalizedMacros]);

  // Remove macro-aware biasing (legacy)

  // Legacy biasing removed: keep a no-op to satisfy old call sites (not used in V3 flow)
  const computeBiasedAdjust = (_dens?: {cal:number,p:number,c:number,f:number}) => 1;


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
  const scalingDebug = { adjustableCount: 0, minAdj: 1, maxAdj: 1, avgAdj: 1 } as const;

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
    const out: Array<{ mealType: string; label: string; backend: DayTotals; computed: DayTotals; delta: DayTotals }> = [];
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

  // Show loading modal if we're loading OR if we don't have data yet
  const showLoadingModal = loadingOriginal || (!originalPlanData && !error);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Loading Modal - Render first so it shows immediately */}
      {showLoadingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#181F17] border-2 border-[#8BAE5A] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            {/* Main Title */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <FireIcon className="w-16 h-16 text-[#8BAE5A]" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Persoonlijk voedingsplan wordt gegenereerd...
              </h2>
              <p className="text-gray-400 text-sm">
                Even geduld, we berekenen jouw macronutriënten
              </p>
            </div>

            {/* Loading Steps */}
            <div className="space-y-4">
              {/* Step 1: Kcal */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: loadingStep >= 1 ? 1 : 0.3,
                  x: 0
                }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  loadingStep >= 1 
                    ? 'bg-[#8BAE5A]/20 border-[#8BAE5A]' 
                    : 'bg-[#232D1A] border-[#3A4D23]'
                }`}
              >
                {loadingStep >= 1 ? (
                  <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A]" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                )}
                <span className={`font-semibold ${loadingStep >= 1 ? 'text-[#8BAE5A]' : 'text-gray-500'}`}>
                  Calorieën berekenen
                </span>
              </motion.div>

              {/* Step 2: Protein */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: loadingStep >= 2 ? 1 : 0.3,
                  x: 0
                }}
                transition={{ delay: 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  loadingStep >= 2 
                    ? 'bg-[#8BAE5A]/20 border-[#8BAE5A]' 
                    : 'bg-[#232D1A] border-[#3A4D23]'
                }`}
              >
                {loadingStep >= 2 ? (
                  <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A]" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                )}
                <span className={`font-semibold ${loadingStep >= 2 ? 'text-[#8BAE5A]' : 'text-gray-500'}`}>
                  Eiwitten optimaliseren
                </span>
              </motion.div>

              {/* Step 3: Carbs */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: loadingStep >= 3 ? 1 : 0.3,
                  x: 0
                }}
                transition={{ delay: 0.2 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  loadingStep >= 3 
                    ? 'bg-[#8BAE5A]/20 border-[#8BAE5A]' 
                    : 'bg-[#232D1A] border-[#3A4D23]'
                }`}
              >
                {loadingStep >= 3 ? (
                  <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A]" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                )}
                <span className={`font-semibold ${loadingStep >= 3 ? 'text-[#8BAE5A]' : 'text-gray-500'}`}>
                  Koolhydraten aanpassen
                </span>
              </motion.div>

              {/* Step 4: Fat */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: loadingStep >= 4 ? 1 : 0.3,
                  x: 0
                }}
                transition={{ delay: 0.3 }}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  loadingStep >= 4 
                    ? 'bg-[#8BAE5A]/20 border-[#8BAE5A]' 
                    : 'bg-[#232D1A] border-[#3A4D23]'
                }`}
              >
                {loadingStep >= 4 ? (
                  <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A]" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                )}
                <span className={`font-semibold ${loadingStep >= 4 ? 'text-[#8BAE5A]' : 'text-gray-500'}`}>
                  Vetten balanceren
                </span>
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="h-2 bg-[#232D1A] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(loadingStep / 4) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-center text-gray-400 text-xs mt-2">
                {Math.round((loadingStep / 4) * 100)}% voltooid
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content - Only render when data is loaded */}
      {!showLoadingModal && (
        <>
          {/* Header */}
          <div className="bg-[#181F17] border-b border-[#2A2A2A] p-6">
            <div className="max-w-7xl mx-auto">
              {/* Mobile Layout */}
              <div className="md:hidden space-y-3 mb-4">
                {/* Back button - full width */}
                {!isPlanLocked && (
                  <button
                    onClick={() => router.push('/dashboard/voedingsplannen-v2')}
                    className="w-full px-4 py-2 bg-[#232D1A] hover:bg-[#2A2A2A] rounded-lg transition-colors text-sm text-gray-300 hover:text-white text-left"
                  >
                    ← Terug naar overzicht
                  </button>
                )}
                
                {/* Title - full width */}
                <h1 className="text-2xl font-bold">{selectedPlan?.name ?? 'Voedingsplan'}</h1>
                
                {/* Locked banner */}
                {isPlanLocked && (
                  <div className="bg-[#111511] border border-[#2F3E22] rounded-lg p-3 text-sm">
                    <div className="mb-2">
                      <div className="text-white font-semibold">Je plan is vergrendeld</div>
                      <div className="text-gray-300">Volg je plan minimaal 4 weken. Wisselen? Reset hieronder.</div>
                    </div>
                    <button onClick={handleResetClick} className="w-full px-3 py-1.5 bg-red-600/20 border border-red-500/30 text-red-400 rounded hover:bg-red-600/30">Reset plan</button>
                  </div>
                )}
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex flex-row items-start md:items-stretch gap-3 md:gap-4 mb-4">
                {/* Title row - 50% width on desktop */}
                <div className="order-2 md:order-1 flex items-center gap-3 md:gap-4 w-full md:w-1/2">
                  {!isPlanLocked && (
                    <button
                      onClick={() => router.push('/dashboard/voedingsplannen-v2')}
                      className="px-4 py-2 bg-[#232D1A] hover:bg-[#2A2A2A] rounded-lg transition-colors text-sm text-gray-300 hover:text-white whitespace-nowrap"
                    >
                      ← Terug naar overzicht
                    </button>
                  )}
                  <h1 className="text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis md:whitespace-normal md:overflow-visible">{selectedPlan?.name ?? 'Voedingsplan'}</h1>
                </div>

                {/* Locked banner - 50% width on desktop */}
                {isPlanLocked && (
                  <div className="order-1 md:order-2 w-full md:w-1/2">
                    <div className="flex items-center justify-between bg-[#111511] border border-[#2F3E22] rounded-lg p-3 text-sm h-full">
                      <div className="pr-3">
                        <div className="text-white font-semibold">Je plan is vergrendeld</div>
                        <div className="text-gray-300">Volg je plan minimaal 4 weken. Wisselen? Reset hieronder.</div>
                      </div>
                      <button onClick={handleResetClick} className="px-3 py-1.5 bg-red-600/20 border border-red-500/30 text-red-400 rounded hover:bg-red-600/30 whitespace-nowrap">Reset plan</button>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-gray-400">{selectedPlan?.description ?? ''}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-6">
        {/* User Profile Section */}
        <div className="bg-[#181F17] rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#8BAE5A]" />
            Jouw Profiel
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            <div className="bg-[#232D1A] rounded-lg p-2 sm:p-3 md:p-4">
              <h3 className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Gewicht</h3>
              <p className="text-sm sm:text-base md:text-lg font-semibold">{userProfile.weight} kg</p>
            </div>
            <div className="bg-[#232D1A] rounded-lg p-2 sm:p-3 md:p-4">
              <h3 className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Activiteitsniveau</h3>
              <p className="text-sm sm:text-base md:text-lg font-semibold">
                <span className="sm:hidden">
                  {userProfile.activity_level === 'sedentary' ? 'Zittend' :
                   userProfile.activity_level === 'moderate' ? 'Staand' :
                   userProfile.activity_level === 'very_active' ? 'Lopend' :
                   'Staand'}
                </span>
                <span className="hidden sm:inline">
                {userProfile.activity_level === 'sedentary' ? 'Zittend (Licht actief)' :
                 userProfile.activity_level === 'moderate' ? 'Staand (Matig actief)' :
                 userProfile.activity_level === 'very_active' ? 'Lopend (Zeer actief)' :
                 'Staand (Matig actief)'}
                </span>
              </p>
            </div>
            <div className="bg-[#232D1A] rounded-lg p-2 sm:p-3 md:p-4 col-span-2 md:col-span-1">
              <h3 className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Fitness Doel</h3>
              <p className="text-sm sm:text-base md:text-lg font-semibold">
                <span className="sm:hidden">
                  {userProfile.fitness_goal === 'droogtrainen' ? 'Droogtrainen' : 
                   userProfile.fitness_goal === 'spiermassa' ? 'Spiermassa' : 'Onderhoud'}
                </span>
                <span className="hidden sm:inline">
                {userProfile.fitness_goal === 'droogtrainen' ? 'Droogtrainen (-500 kcal)' : 
                 userProfile.fitness_goal === 'spiermassa' ? 'Spiermassa (+500 kcal)' : 'Onderhoud'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Plan Details */}
        <div className="bg-[#181F17] rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#8BAE5A]" />
            Jouw Calorieën & Macro's
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="bg-[#232D1A] rounded-lg p-2 sm:p-3 md:p-4">
              <h3 className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Jouw Calorieën</h3>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-[#8BAE5A]">{Math.round(personalizedMacros.calories)} kcal</p>
            </div>
            <div className="bg-[#232D1A] rounded-lg p-2 sm:p-3 md:p-4">
              <h3 className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Eiwit</h3>
              <p className="text-sm sm:text-base md:text-lg font-semibold">{Math.round(personalizedMacros.protein)}g</p>
              <p className="text-[10px] sm:text-xs text-[#8BAE5A]">{macroPercentages.protein}% van calorieën</p>
            </div>
            <div className="bg-[#232D1A] rounded-lg p-2 sm:p-3 md:p-4">
              <h3 className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Koolhydraten</h3>
              <p className="text-sm sm:text-base md:text-lg font-semibold">{Math.round(personalizedMacros.carbs)}g</p>
              <p className="text-[10px] sm:text-xs text-[#8BAE5A]">{macroPercentages.carbs}% van calorieën</p>
            </div>
            <div className="bg-[#232D1A] rounded-lg p-2 sm:p-3 md:p-4">
              <h3 className="text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1">Vet</h3>
              <p className="text-sm sm:text-base md:text-lg font-semibold">{Math.round(personalizedMacros.fat)}g</p>
              <p className="text-[10px] sm:text-xs text-[#8BAE5A]">{macroPercentages.fat}% van calorieën</p>
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
        <div className="bg-[#181F17] rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          {/* Safe Range Information */}
          <div className="bg-[#1A2A1A] border border-[#3A4D23] rounded-lg p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                  <span className="text-[#181F17] text-xs sm:text-sm font-bold">ℹ️</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-[#B6C948] font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Veilige Range</h5>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  <span className="hidden sm:inline">We begrijpen dat het lastig is om exact alle waardes op 100% te krijgen. </span>
                  <span className="text-[#8BAE5A] font-medium">Zolang je binnen -100 en +100 kcal zit, zit je goed.</span>
                  <span className="hidden md:inline"> Je hoeft niet naar perfectie te streven - consistentie is belangrijker.</span>
                </p>
              </div>
            </div>
          </div>
          
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <FireIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#8BAE5A]" />
            <span className="truncate">Dagtotalen - {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}</span>
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {/* Calories */}
            <div className="bg-[#232D1A] rounded-lg p-2 sm:p-3 md:p-4">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-white font-semibold text-xs sm:text-sm md:text-base">Calorieën</span>
                <span className={`text-xs sm:text-sm ${caloriesProgress.textColor}`}>{caloriesProgress.percentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2 mb-1 sm:mb-2">
                <div 
                  className={`h-1.5 sm:h-2 rounded-full ${caloriesProgress.color}`}
                  style={{ width: `${caloriesProgress.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs md:text-sm">
                <span className="text-gray-400">{Math.round(dayTotals.calories)} kcal</span>
                <span className="text-white">{Math.round(personalizedMacros.calories)} kcal</span>
            </div>
              <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${caloriesProgress.textColor}`}>
                {caloriesProgress.difference > 0 ? '+' : ''}{Math.round(caloriesProgress.difference)} kcal
              </div>
            </div>

            {/* Protein */}
            <div className="bg-[#232D1A] rounded-lg p-2 sm:p-3 md:p-4">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-white font-semibold text-xs sm:text-sm md:text-base">Eiwit</span>
                <span className={`text-xs sm:text-sm ${proteinProgress.textColor}`}>{proteinProgress.percentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2 mb-1 sm:mb-2">
                <div 
                  className={`h-1.5 sm:h-2 rounded-full ${proteinProgress.color}`}
                  style={{ width: `${proteinProgress.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs md:text-sm">
                <span className="text-gray-400">{dayTotals.protein.toFixed(1)}g</span>
                <span className="text-white">{personalizedMacros.protein.toFixed(1)}g</span>
            </div>
              <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${proteinProgress.textColor}`}>
                {proteinProgress.difference > 0 ? '+' : ''}{proteinProgress.difference.toFixed(0)}g
              </div>
            </div>

            {/* Carbs */}
            <div className="bg-[#232D1A] rounded-lg p-2 sm:p-3 md:p-4">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-white font-semibold text-xs sm:text-sm md:text-base">Koolhydr.</span>
                <span className={`text-xs sm:text-sm ${carbsProgress.textColor}`}>{carbsProgress.percentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2 mb-1 sm:mb-2">
                <div 
                  className={`h-1.5 sm:h-2 rounded-full ${carbsProgress.color}`}
                  style={{ width: `${carbsProgress.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs md:text-sm">
                <span className="text-gray-400">{dayTotals.carbs.toFixed(1)}g</span>
                <span className="text-white">{personalizedMacros.carbs.toFixed(1)}g</span>
            </div>
              <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${carbsProgress.textColor}`}>
                {carbsProgress.difference > 0 ? '+' : ''}{carbsProgress.difference.toFixed(0)}g
              </div>
            </div>

            {/* Fat */}
            <div className="bg-[#232D1A] rounded-lg p-2 sm:p-3 md:p-4">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-white font-semibold text-xs sm:text-sm md:text-base">Vet</span>
                <span className={`text-xs sm:text-sm ${fatProgress.textColor}`}>{fatProgress.percentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2 mb-1 sm:mb-2">
                <div 
                  className={`h-1.5 sm:h-2 rounded-full ${fatProgress.color}`}
                  style={{ width: `${fatProgress.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] sm:text-xs md:text-sm">
                <span className="text-gray-400">{dayTotals.fat.toFixed(1)}g</span>
                <span className="text-white">{personalizedMacros.fat.toFixed(1)}g</span>
              </div>
              <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${fatProgress.textColor}`}>
                {fatProgress.difference > 0 ? '+' : ''}{fatProgress.difference.toFixed(0)}g
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

            {/* Food Waste Prevention Notice */}
            <div className="mb-6 bg-gradient-to-r from-[#8BAE5A]/10 to-[#B6C948]/5 border-l-4 border-[#8BAE5A] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-[#8BAE5A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#B6C948] mb-1">
                    💡 Tip: Geen voedselverspilling
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Heb je een verpakking van 100g maar staat er 90g in je plan? <strong className="text-white">Gebruik gerust de hele verpakking!</strong> Zolang je dagelijks binnen <strong className="text-[#8BAE5A]">±100 kcal</strong> van je doel blijft, zit je in de veilige zone. Kleine verschillen in porties zijn prima en helpen voedselverspilling te voorkomen.
                  </p>
                </div>
              </div>
            </div>
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

                // Calculate meal totals proportionally from day totals (ensures exact sum)
                // This prevents rounding errors from accumulating
                const mealTotals = (() => {
                  if (!mealData.nutrition) {
                    // Fallback: use computed totals if no backend nutrition data
                    return {
                      calories: Math.round(computedTotals.calories),
                      protein: Math.round(computedTotals.protein * 10) / 10,
                      carbs: Math.round(computedTotals.carbs * 10) / 10,
                      fat: Math.round(computedTotals.fat * 10) / 10,
                    };
                  }
                  
                  // Calculate this meal's percentage of the 100kg baseline day total
                  const dayData = originalPlanData.meals.weekly_plan[selectedDay];
                  const baselineDayTotal = {
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                  };
                  
                  ['ontbijt', 'ochtend_snack', 'lunch', 'lunch_snack', 'diner', 'avond_snack'].forEach(mt => {
                    const meal = dayData?.[mt];
                    if (meal?.nutrition) {
                      baselineDayTotal.calories += Number(meal.nutrition.calories) || 0;
                      baselineDayTotal.protein += Number(meal.nutrition.protein) || 0;
                      baselineDayTotal.carbs += Number(meal.nutrition.carbs) || 0;
                      baselineDayTotal.fat += Number(meal.nutrition.fat) || 0;
                    }
                  });
                  
                  // Calculate percentage this meal contributes
                  const mealPercentage = {
                    calories: baselineDayTotal.calories > 0 ? Number(mealData.nutrition.calories) / baselineDayTotal.calories : 0,
                    protein: baselineDayTotal.protein > 0 ? Number(mealData.nutrition.protein) / baselineDayTotal.protein : 0,
                    carbs: baselineDayTotal.carbs > 0 ? Number(mealData.nutrition.carbs) / baselineDayTotal.carbs : 0,
                    fat: baselineDayTotal.fat > 0 ? Number(mealData.nutrition.fat) / baselineDayTotal.fat : 0,
                  };
                  
                  // Apply percentage to scaled day totals (which may be optimized)
                  return {
                    calories: Math.round(dayTotals.calories * mealPercentage.calories),
                    protein: Math.round((dayTotals.protein * mealPercentage.protein) * 10) / 10,
                    carbs: Math.round((dayTotals.carbs * mealPercentage.carbs) * 10) / 10,
                    fat: Math.round((dayTotals.fat * mealPercentage.fat) * 10) / 10,
                  };
                })();
                
                // Calculate ingredient adjustment factors
                // If dayTotals were optimized, we need to adjust individual ingredients proportionally
                // so their sum matches the optimized mealTotals
                const ingredientAdjustmentFactors = {
                  protein: computedTotals.protein > 0 ? mealTotals.protein / computedTotals.protein : 1,
                  carbs: computedTotals.carbs > 0 ? mealTotals.carbs / computedTotals.carbs : 1,
                  fat: computedTotals.fat > 0 ? mealTotals.fat / computedTotals.fat : 1,
                  calories: computedTotals.calories > 0 ? mealTotals.calories / computedTotals.calories : 1,
                    };

                return (
                  <div key={mealType} className="bg-[#232D1A] rounded-lg border border-[#3A4D23] overflow-hidden">
                    {/* Meal Header with Totals */}
                    <div className="bg-[#2A3A1A] px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-[#3A4D23]">
                      {/* Mobile Layout */}
                      <div className="md:hidden">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-white font-semibold flex items-center gap-1.5 text-sm">
                            <ClockIcon className="w-3.5 h-3.5 text-[#8BAE5A]" />
                            {mealTypeLabel}
                          </h5>
                          <div className="text-[#B6C948] font-medium text-sm">
                            {Math.round(mealTotals.calories)} kcal
                          </div>
                        </div>
                        <div className="flex gap-3 text-xs text-white">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">E:</span>
                            <span>{Math.round(mealTotals.protein)}g</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">K:</span>
                            <span>{Math.round(mealTotals.carbs)}g</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">V:</span>
                            <span>{Math.round(mealTotals.fat)}g</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Desktop Layout */}
                      <div className="hidden md:flex items-center justify-between">
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

                    {/* Ingredients Table - Desktop */}
                    <div className="p-6 hidden md:block">
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

                              // Apply adjustment factors to match optimized meal totals
                              const ingredientCalories = ((Number(ingredient.calories_per_100g) || 0) * multiplier) * ingredientAdjustmentFactors.calories;
                              const ingredientProtein  = ((Number(ingredient.protein_per_100g)  || 0) * multiplier) * ingredientAdjustmentFactors.protein;
                              const ingredientCarbs    = ((Number(ingredient.carbs_per_100g)    || 0) * multiplier) * ingredientAdjustmentFactors.carbs;
                              const ingredientFat      = ((Number(ingredient.fat_per_100g)      || 0) * multiplier) * ingredientAdjustmentFactors.fat;

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
                                      <span className="w-16 px-2 py-1 bg-[#232D1A] border border-[#3A4D43] rounded text-white text-center text-sm">
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

                    {/* Ingredients List - Mobile (Compact Cards) */}
                    <div className="p-4 md:hidden space-y-3">
                      {mealData.ingredients.map((ingredient: any, index: number) => {
                        // Same calculation logic as desktop
                        const ingredientKey = getIngredientKey(mealType, ingredient.name, selectedDay);
                        const customAmount = customAmounts[ingredientKey];
                        let amountBase = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
                        let amount = amountBase * scalingFactor;
                        
                        let multiplier = 1;
                        const unit = String(ingredient.unit || '').toLowerCase();
                        if (['per_piece','piece','pieces','per_stuk','stuk','stuks','per_plakje','plakje','plakjes','plak','per_plak','sneetje','per_sneetje','handje','per_handful'].includes(unit)) {
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

                        // Apply adjustment factors to match optimized meal totals
                        const ingredientCalories = ((Number(ingredient.calories_per_100g) || 0) * multiplier) * ingredientAdjustmentFactors.calories;
                        const ingredientProtein  = ((Number(ingredient.protein_per_100g)  || 0) * multiplier) * ingredientAdjustmentFactors.protein;
                        const ingredientCarbs    = ((Number(ingredient.carbs_per_100g)    || 0) * multiplier) * ingredientAdjustmentFactors.carbs;
                        const ingredientFat      = ((Number(ingredient.fat_per_100g)      || 0) * multiplier) * ingredientAdjustmentFactors.fat;

                        // Original 100kg (no scaling, no custom) for green debug display
                        const baseAmt = Number(ingredient.amount || 0);
                        let origAmt = baseAmt;
                        let origMult = 1;
                        if (['per_piece','piece','pieces','per_stuk','stuk','stuks','per_plakje','plakje','plakjes','plak','per_plak','sneetje','per_sneetje','handje','per_handful'].includes(unit)) {
                          const unitWeight = Number(
                            ingredient.unit_weight_g ?? ingredient.grams_per_unit ?? ingredient.weight_per_unit ?? ingredient.per_piece_grams ?? ingredient.slice_weight_g ?? ingredient.plakje_gram ?? ingredient.unit_weight
                          ) || 0;
                          origAmt = Math.max(1, Math.round(baseAmt));
                          origMult = unitWeight > 0 ? (origAmt * unitWeight) / 100 : origAmt;
                        } else if (['per_100g','g','gram'].includes(unit)) {
                          origMult = baseAmt / 100;
                        } else if (['per_ml','ml'].includes(unit)) {
                          origMult = baseAmt / 100;
                        } else if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unit)) {
                          origMult = (baseAmt * 15) / 100;
                        } else if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unit)) {
                          origMult = (baseAmt * 5) / 100;
                        } else if (['per_cup','cup','kop'].includes(unit)) {
                          origMult = (baseAmt * 240) / 100;
                        } else if (['per_30g'].includes(unit)) {
                          origMult = (baseAmt * 30) / 100;
                        } else {
                          origMult = baseAmt / 100;
                        }
                        const okc = (Number(ingredient.calories_per_100g) || 0) * origMult;
                        const opr = (Number(ingredient.protein_per_100g)  || 0) * origMult;
                        const och = (Number(ingredient.carbs_per_100g)    || 0) * origMult;
                        const oft = (Number(ingredient.fat_per_100g)      || 0) * origMult;

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
                          <div key={index} className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-3">
                            {/* Ingredient Name & Amount */}
                              <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium text-sm">{ingredient.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-[#181F17] border border-[#3A4D23] rounded text-white text-sm font-medium">
                                  {amount}
                                </span>
                                <span className="text-gray-400 text-xs">{getUnitLabel(ingredient.unit)}</span>
                              </div>
                            </div>
                            
                            {/* Nutritional Values */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-[#181F17] rounded px-2 py-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400">Kcal:</span>
                                  <span className="text-[#8BAE5A] font-medium">{ingredientCalories.toFixed(0)}</span>
                                </div>
                              </div>
                              <div className="bg-[#181F17] rounded px-2 py-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400">Eiwit:</span>
                                  <span className="text-white font-medium">{ingredientProtein.toFixed(1)}g</span>
                                </div>
                              </div>
                              <div className="bg-[#181F17] rounded px-2 py-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400">Koolhydr:</span>
                                  <span className="text-white font-medium">{ingredientCarbs.toFixed(1)}g</span>
                                </div>
                              </div>
                              <div className="bg-[#181F17] rounded px-2 py-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400">Vet:</span>
                                  <span className="text-white font-medium">{ingredientFat.toFixed(1)}g</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
          </div>

        {/* Compact Reset Confirm Modal */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowResetModal(false)} />
            <div
              ref={resetModalRef}
              tabIndex={-1}
              aria-modal="true"
              role="dialog"
              className="relative bg-[#181F17] border border-[#3A4D23] rounded-xl p-5 w-[90%] max-w-md outline-none"
            >
              <div className="text-white text-lg font-semibold mb-2">Plan resetten?</div>
              <div className="text-gray-300 text-sm mb-4">Je kunt daarna een nieuw plan kiezen.</div>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-[#3A4D23] hover:bg-[#4A5D33] rounded" onClick={() => setShowResetModal(false)}>Annuleren</button>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded" onClick={handleConfirmReset}>Ja, reset</button>
              </div>
            </div>
          </div>
        )}

        {/* Ingredients Debug Modal */}
        {showIngredientsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-[#111511] border border-[#2F3E22] rounded-lg shadow-xl p-4 text-sm text-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-semibold">Ingrediënten Debug – {selectedDay} [Test Chiel]</div>
                  <div className="text-xs text-gray-400">Plan: {selectedPlan?.name} • Dagtotalen (berekend): {dayTotals.calories} kcal, P {dayTotals.protein}g, C {dayTotals.carbs}g, F {dayTotals.fat}g</div>
                  {(() => {
                    const tgtP = Number(personalizedMacros?.protein)||0;
                    const tgtC = Number(personalizedMacros?.carbs)||0;
                    const tgtF = Number(personalizedMacros?.fat)||0;
                    const tgtK_fromMacros = Math.round(tgtP*4 + tgtC*4 + tgtF*9);
                    const tgtK = Number(personalizedMacros?.calories)||0;
                    const delta = tgtK - tgtK_fromMacros;
                    return (
                      <div className="mt-1 text-[11px]">
                        <span className={`px-2 py-1 rounded-md ${delta===0?'bg-green-900 text-green-300':'bg-yellow-900 text-yellow-300'}`}>
                          Doel-consistentie: {tgtK} kcal vs 4P+4C+9F = {tgtK_fromMacros} → {delta>0?`+${delta}`:delta} kcal {delta===0?'op doel':'verschil'}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <button
                  onClick={() => setShowIngredientsModal(false)}
                  className="px-3 py-1 rounded text-sm border bg-[#232D1A] border-[#3A4D23] hover:bg-[#2A2A2A]"
                >
                  Sluiten
                </button>
              </div>

              {/* Targets vs totals summary with colored progress bars */}
              {(() => {
                const cal = getProgressInfo(dayTotals.calories, personalizedMacros.calories);
                const pr  = getProgressInfo(dayTotals.protein,  personalizedMacros.protein);
                const cb  = getProgressInfo(dayTotals.carbs,    personalizedMacros.carbs);
                const ft  = getProgressInfo(dayTotals.fat,      personalizedMacros.fat);
                const delta = (v:number, t:number) => v - t;
                const fmt = (n:number) => (Math.round(n * 10) / 10);
                const overUnderText = (v:number, t:number, unit:string) => {
                  const d = v - t;
                  if (Math.abs(d) < 0.05) return `op doel (100%)`;
                  return d > 0 ? `+${unit === 'kcal' ? Math.round(d) : fmt(d)} ${unit} te veel (${Math.round((v/Math.max(1,t))*100)}%)`
                                : `${fmt(Math.abs(d))} ${unit} te weinig (${Math.round((v/Math.max(1,t))*100)}%)`;
                };
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-[#0F130F] rounded p-3 border border-[#3A4D23]">
                      <div className="text-xs text-gray-400">Calorieën</div>
                      <div className="text-lg font-bold text-[#8BAE5A]">{dayTotals.calories} / {personalizedMacros.calories} kcal</div>
                      <div className={`text-[11px] ${dayTotals.calories - personalizedMacros.calories === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {dayTotals.calories - personalizedMacros.calories > 0 ? `+${Math.round(dayTotals.calories - personalizedMacros.calories)} kcal te veel` : `${Math.round(Math.abs(dayTotals.calories - personalizedMacros.calories))} kcal te weinig`}
                      </div>
                      <div className="w-full bg-[#0F150E] rounded-full h-1.5 mt-1">
                        <div className={`h-1.5 rounded-full ${cal.color}`} style={{ width: `${Math.min(cal.percentage, 100)}%` }} />
                      </div>
                      <div className="text-[10px] text-[#B6C948] mt-1">{overUnderText(dayTotals.calories, personalizedMacros.calories, 'kcal')}</div>
                    </div>
                    <div className="bg-[#0F130F] rounded p-3 border border-[#3A4D23]">
                      <div className="text-xs text-gray-400">Eiwit</div>
                      <div className="text-lg font-bold text-blue-400">{dayTotals.protein}g / {personalizedMacros.protein}g</div>
                      <div className={`text-[11px] ${(dayTotals.protein - personalizedMacros.protein) === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {dayTotals.protein - personalizedMacros.protein > 0 ? `+${(Math.round((dayTotals.protein - personalizedMacros.protein)*10)/10)} g te veel` : `${(Math.round((personalizedMacros.protein - dayTotals.protein)*10)/10)} g te weinig`}
                      </div>
                      <div className="w-full bg-[#0F150E] rounded-full h-1.5 mt-1">
                        <div className={`h-1.5 rounded-full ${pr.color}`} style={{ width: `${Math.min(pr.percentage, 100)}%` }} />
                      </div>
                      <div className="text-[10px] text-[#B6C948] mt-1">{overUnderText(dayTotals.protein, personalizedMacros.protein, 'g')}</div>
                    </div>
                    <div className="bg-[#0F130F] rounded p-3 border border-[#3A4D23]">
                      <div className="text-xs text-gray-400">Koolhydraten</div>
                      <div className="text-lg font-bold text-orange-400">{dayTotals.carbs}g / {personalizedMacros.carbs}g</div>
                      <div className={`text-[11px] ${(dayTotals.carbs - personalizedMacros.carbs) === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {dayTotals.carbs - personalizedMacros.carbs > 0 ? `+${(Math.round((dayTotals.carbs - personalizedMacros.carbs)*10)/10)} g te veel` : `${(Math.round((personalizedMacros.carbs - dayTotals.carbs)*10)/10)} g te weinig`}
                      </div>
                      <div className="w-full bg-[#0F150E] rounded-full h-1.5 mt-1">
                        <div className={`h-1.5 rounded-full ${cb.color}`} style={{ width: `${Math.min(cb.percentage, 100)}%` }} />
                      </div>
                      <div className="text-[10px] text-[#B6C948] mt-1">{overUnderText(dayTotals.carbs, personalizedMacros.carbs, 'g')}</div>
                    </div>
                    <div className="bg-[#0F130F] rounded p-3 border border-[#3A4D23]">
                      <div className="text-xs text-gray-400">Vet</div>
                      <div className="text-lg font-bold text-yellow-400">{dayTotals.fat}g / {personalizedMacros.fat}g</div>
                      <div className={`text-[11px] ${(dayTotals.fat - personalizedMacros.fat) === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {dayTotals.fat - personalizedMacros.fat > 0 ? `+${(Math.round((dayTotals.fat - personalizedMacros.fat)*10)/10)} g te veel` : `${(Math.round((personalizedMacros.fat - dayTotals.fat)*10)/10)} g te weinig`}
                      </div>
                      <div className="w-full bg-[#0F150E] rounded-full h-1.5 mt-1">
                        <div className={`h-1.5 rounded-full ${ft.color}`} style={{ width: `${Math.min(ft.percentage, 100)}%` }} />
                      </div>
                      <div className="text-[10px] text-[#B6C948] mt-1">{overUnderText(dayTotals.fat, personalizedMacros.fat, 'g')}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Compact delta summary vs doelen (badges) */}
              {(() => {
                const fmt = (n:number) => Math.round(n * 10) / 10;
                const dCal = dayTotals.calories - personalizedMacros.calories;
                const dP   = fmt(dayTotals.protein - personalizedMacros.protein);
                const dC   = fmt(dayTotals.carbs   - personalizedMacros.carbs);
                const dF   = fmt(dayTotals.fat     - personalizedMacros.fat);
                const Badge = ({label, val, unit}:{label:string; val:number; unit:'kcal'|'g'}) => (
                  <span className={`px-2 py-1 rounded-md text-[11px] mr-2 mb-2 inline-block ${val===0?'bg-green-900 text-green-300':'bg-yellow-900 text-yellow-300'}`}>
                    {label}: {val>0?'+':''}{unit==='kcal'?Math.round(val):fmt(val)} {unit} {val>0?'te veel':'te weinig'}
                  </span>
                );
                return (
                  <div className="mb-3">
                    <Badge label="Calorieën" val={dCal} unit="kcal" />
                    <Badge label="Eiwit" val={dP} unit="g" />
                    <Badge label="Koolhydraten" val={dC} unit="g" />
                    <Badge label="Vet" val={dF} unit="g" />
                  </div>
                );
              })()}

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {(() => {
                  const dayData: any = originalPlanData?.meals?.weekly_plan?.[selectedDay] || {};
                  const mealOrder = ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'];
                  const present = Object.keys(dayData);
                  const ordered = mealOrder.filter(k => present.includes(k)).concat(present.filter(k => !mealOrder.includes(k)));
                  if (ordered.length === 0) {
                    return (<div className="text-gray-400">Geen maaltijden gevonden voor deze dag.</div>);
                  }
                  // Consistency check (day): stored kcal vs derived from day macros
                  let storedDayKcal = 0;
                  ordered.forEach((key: string) => {
                    const m = dayData[key];
                    if (m?.nutrition?.calories) storedDayKcal += Number(m.nutrition.calories) || 0;
                  });
                  const dayKcalFromMacros = Math.round((dayTotals.protein || 0) * 4 + (dayTotals.carbs || 0) * 4 + (dayTotals.fat || 0) * 9);
                  const dayDelta = storedDayKcal - dayKcalFromMacros;
                  const pctVsDerived = Math.round((storedDayKcal / Math.max(1, dayKcalFromMacros)) * 100);
                  
                  const DaySummary = (
                    <div className="border border-[#2F3E22] rounded-md p-3 bg-[#0F130F]">
                      <div className="font-semibold text-[#B6C948] mb-1">Consistentiecheck (dag)</div>
                      <div className="text-xs text-gray-300">
                        Opgeslagen kcal: <span className="text-white font-semibold">{storedDayKcal}</span> • Afgeleid uit macro's: <span className="text-white font-semibold">{dayKcalFromMacros}</span>
                        {' '}• Delta: <span className={dayDelta === 0 ? 'text-green-400' : 'text-yellow-400'}>{dayDelta > 0 ? `+${dayDelta}` : dayDelta} kcal</span>
                        {' '}({pctVsDerived}% t.o.v. afgeleid)
                      </div>
                    </div>
                  );
                  
                  return (
                    <>
                      {DaySummary}

                      {/* Dagtotalen vs Doel (op basis van ingrediënten) */}
                      {(() => {
                        const rows = [
                          { label: 'Calorieën', cur: Math.round(dayTotals.calories), tgt: Math.round(personalizedMacros.calories), unit: 'kcal' as const },
                          { label: 'Eiwit',      cur: Math.round(dayTotals.protein*10)/10,  tgt: Math.round(personalizedMacros.protein*10)/10,  unit: 'g' as const },
                          { label: 'Koolhydraten',cur: Math.round(dayTotals.carbs*10)/10,    tgt: Math.round(personalizedMacros.carbs*10)/10,    unit: 'g' as const },
                          { label: 'Vet',        cur: Math.round(dayTotals.fat*10)/10,      tgt: Math.round(personalizedMacros.fat*10)/10,      unit: 'g' as const },
                        ].map(r => ({ ...r, delta: Number((r.cur - r.tgt).toFixed(r.unit==='kcal'?0:1)) }));
                        return (
                          <div className="border border-[#2F3E22] rounded-md p-3 bg-[#0F130F] mb-2">
                            <div className="font-semibold text-[#B6C948] mb-2">Dagtotalen vs Doel (op basis van ingrediënten)</div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead className="text-gray-400">
                                  <tr>
                                    <th className="py-1 pr-2">Macro</th>
                                    <th className="py-1 pr-2">Huidig</th>
                                    <th className="py-1 pr-2">Doel</th>
                                    <th className="py-1 pr-2">Δ</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rows.map((r, i) => (
                                    <tr key={i} className="border-t border-[#2F3E22]">
                                      <td className="py-1 pr-2">{r.label}</td>
                                      <td className="py-1 pr-2">{r.cur} {r.unit}</td>
                                      <td className="py-1 pr-2">{r.tgt} {r.unit}</td>
                                      <td className={`py-1 pr-2 ${r.delta===0?'text-green-400':'text-yellow-400'}`}>{r.delta>0?`+${r.delta}`:r.delta} {r.unit} {r.delta>0?'te veel':'te weinig'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Cumulatieve stapeltotalen per maaltijd (in volgorde) */}
                      {(() => {
                        let runP = 0, runC = 0, runF = 0, runStoredKcal = 0;
                        const rows = ordered.map((key: string) => {
                          const m = dayData[key];
                          const n = m?.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 };
                          runP += Number(n.protein)  || 0;
                          runC += Number(n.carbs)    || 0;
                          runF += Number(n.fat)      || 0;
                          runStoredKcal += Number(n.calories) || 0;
                          const km = Math.round((runP*4) + (runC*4) + (runF*9));
                          return {
                            label: key.replace('_',' ').replace('_',' '),
                            storedKcal: runStoredKcal,
                            kcalFromMacros: km,
                            protein: Math.round(runP*10)/10,
                            carbs: Math.round(runC*10)/10,
                            fat: Math.round(runF*10)/10,
                            deltaKcal: runStoredKcal - km,
                          };
                        });
                        return (
                          <div className="border border-[#2F3E22] rounded-md p-3 bg-[#0F130F] mb-2">
                            <div className="font-semibold text-[#B6C948] mb-2">Cumulatieve totalen per maaltijd</div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead className="text-gray-400">
                                  <tr>
                                    <th className="py-1 pr-2">Tot en met</th>
                                    <th className="py-1 pr-2">Kcal (opgeslagen)</th>
                                    <th className="py-1 pr-2">Kcal (afgeleid)</th>
                                    <th className="py-1 pr-2">Δ kcal</th>
                                    <th className="py-1 pr-2">Eiwit (g)</th>
                                    <th className="py-1 pr-2">Koolhydraten (g)</th>
                                    <th className="py-1 pr-2">Vet (g)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rows.map((r, i) => (
                                    <tr key={i} className="border-t border-[#2F3E22]">
                                      <td className="py-1 pr-2">{r.label}</td>
                                      <td className="py-1 pr-2">{r.storedKcal}</td>
                                      <td className="py-1 pr-2">{r.kcalFromMacros}</td>
                                      <td className={`py-1 pr-2 ${r.deltaKcal===0 ? 'text-green-400' : 'text-yellow-400'}`}>{r.deltaKcal>0?`+${r.deltaKcal}`:r.deltaKcal}</td>
                                      <td className="py-1 pr-2">{r.protein}</td>
                                      <td className="py-1 pr-2">{r.carbs}</td>
                                      <td className="py-1 pr-2">{r.fat}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })()}

                      {ordered.map((mealKey: string) => {
                        const meal = dayData[mealKey];
                        const ing = Array.isArray(meal?.ingredients) ? meal.ingredients : [];
                        const stored = meal?.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 };
                        const derivedMealKcal = Math.round((Number(stored.protein)||0)*4 + (Number(stored.carbs)||0)*4 + (Number(stored.fat)||0)*9);
                        const deltaMeal = (Number(stored.calories)||0) - derivedMealKcal;
                        // Ingredient-based recalculation
                        let sumG = 0, sumP = 0, sumC = 0, sumF = 0, sumK = 0;
                        const rows = (ing||[]).map((it: any) => {
                          const unit = String(it?.unit||'per_100g');
                          const amount = Number(it?.amount)||0;
                          const perCal = Number(it?.calories_per_100g ?? it?.calories_per_piece ?? it?.kcal_per_100g ?? it?.kcal) || 0;
                          const perP = Number(it?.protein_per_100g ?? it?.protein_per_piece ?? it?.protein) || 0;
                          const perC = Number(it?.carbs_per_100g ?? it?.carbs_per_piece ?? it?.carbs) || 0;
                          const perF = Number(it?.fat_per_100g ?? it?.fat_per_piece ?? it?.fat) || 0;
                          const unitW = Number(it?.unit_weight_g ?? it?.grams_per_unit ?? it?.weight_per_unit ?? it?.per_piece_grams ?? it?.slice_weight_g ?? it?.plakje_gram ?? it?.unit_weight) || 0;
                          let basis: 'per100'|'per_piece'|'unknown' = 'unknown';
                          let grams = 0, k=0, p=0, c=0, f=0;
                          if (unit === 'per_100g' || unit === 'per_100ml' || unit === 'gram' || unit === 'g') {
                            basis = 'per100';
                            grams = (unit==='per_100g' || unit==='per_100ml') ? amount : amount; // treat as grams
                            k = perCal * (grams/100);
                            p = perP * (grams/100);
                            c = perC * (grams/100);
                            f = perF * (grams/100);
                          } else if (unit.startsWith('per_piece') || unit === 'piece' || unit === 'stuk') {
                            if (unitW > 0) {
                              basis = 'per100';
                              grams = amount * unitW;
                              k = perCal * (grams/100);
                              p = perP * (grams/100);
                              c = perC * (grams/100);
                              f = perF * (grams/100);
                            } else {
                              basis = 'per_piece';
                              grams = 0;
                              k = perCal * amount;
                              p = perP * amount;
                              c = perC * amount;
                              f = perF * amount;
                            }
                          } else {
                            // Fallback assume per100
                            basis = 'per100';
                            grams = amount;
                            k = perCal * (grams/100);
                            p = perP * (grams/100);
                            c = perC * (grams/100);
                            f = perF * (grams/100);
                          }
                          sumG += grams;
                          sumK += k; sumP += p; sumC += c; sumF += f;
                          return { name: it?.name, amount, unit, unitW, basis, grams: Math.round(grams), k: Math.round(k), p: Math.round(p*10)/10, c: Math.round(c*10)/10, f: Math.round(f*10)/10,
                            perCal, perP, perC, perF };
                        });
                        const tot = { k: Math.round(sumK), p: Math.round(sumP*10)/10, c: Math.round(sumC*10)/10, f: Math.round(sumF*10)/10 };
                        const dVsStored = {
                          k: Math.round((Number(stored.calories)||0) - tot.k),
                          p: Math.round(((Number(stored.protein)||0) - tot.p)*10)/10,
                          c: Math.round(((Number(stored.carbs)||0) - tot.c)*10)/10,
                          f: Math.round(((Number(stored.fat)||0) - tot.f)*10)/10,
                        };
                        return (
                          <div key={mealKey} className="border border-[#2F3E22] rounded-md p-3 bg-[#0F130F]">
                            <div className="font-semibold text-[#B6C948] mb-2">{mealKey.replace('_',' ').replace('_',' ')}</div>
                            <div className="text-xs text-gray-400 mb-1">Opgeslagen voeding (backend): {stored.calories} kcal • P {stored.protein}g • C {stored.carbs}g • F {stored.fat}g</div>
                            <div className="text-xs text-gray-300 mb-1">Afgeleid uit macro's: <span className="text-white font-semibold">{derivedMealKcal} kcal</span> • Δ kcal: <span className={deltaMeal === 0 ? 'text-green-400' : 'text-yellow-400'}>{deltaMeal > 0 ? `+${deltaMeal}` : deltaMeal}</span></div>
                            <div className="text-xs text-gray-300 mb-2">
                              Ingrediënten-berekening totaal: <span className="text-white font-semibold">{tot.k} kcal</span> • P {tot.p}g • C {tot.c}g • F {tot.f}g
                              {' '}| Δ vs opgeslagen: kcal <span className={`${dVsStored.k===0?'text-green-400':'text-yellow-400'}`}>{dVsStored.k>0?`+${dVsStored.k}`:dVsStored.k}</span>,
                              P <span className={`${dVsStored.p===0?'text-green-400':'text-yellow-400'}`}>{dVsStored.p>0?`+${dVsStored.p}`:dVsStored.p}</span>,
                              C <span className={`${dVsStored.c===0?'text-green-400':'text-yellow-400'}`}>{dVsStored.c>0?`+${dVsStored.c}`:dVsStored.c}</span>,
                              F <span className={`${dVsStored.f===0?'text-green-400':'text-yellow-400'}`}>{dVsStored.f>0?`+${dVsStored.f}`:dVsStored.f}</span>
                            </div>
                            {rows.length === 0 ? (
                              <div className="text-gray-400 text-sm">Geen ingrediënten</div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead className="text-gray-400">
                                    <tr>
                                      <th className="py-1 pr-2">Ingrediënt</th>
                                      <th className="py-1 pr-2">Hoeveelheid</th>
                                      <th className="py-1 pr-2">Unit</th>
                                      <th className="py-1 pr-2">kcal/100g</th>
                                      <th className="py-1 pr-2">P/100g</th>
                                      <th className="py-1 pr-2">C/100g</th>
                                      <th className="py-1 pr-2">F/100g</th>
                                      <th className="py-1 pr-2">unit_gewicht(g)</th>
                                      <th className="py-1 pr-2">basis</th>
                                      <th className="py-1 pr-2">eff. gram</th>
                                      <th className="py-1 pr-2">kcal (calc)</th>
                                      <th className="py-1 pr-2">P (calc)</th>
                                      <th className="py-1 pr-2">C (calc)</th>
                                      <th className="py-1 pr-2">F (calc)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.map((r: any, idx: number) => (
                                      <tr key={idx} className="border-t border-[#2F3E22]">
                                        <td className="py-1 pr-2 whitespace-nowrap">{r.name}</td>
                                        <td className="py-1 pr-2">{r.amount}</td>
                                        <td className="py-1 pr-2">{r.unit}</td>
                                        <td className="py-1 pr-2">{r.perCal}</td>
                                        <td className="py-1 pr-2">{r.perP}</td>
                                        <td className="py-1 pr-2">{r.perC}</td>
                                        <td className="py-1 pr-2">{r.perF}</td>
                                        <td className="py-1 pr-2">{r.unitW || '-'}</td>
                                        <td className="py-1 pr-2">{r.basis}</td>
                                        <td className="py-1 pr-2">{r.grams || '-'}</td>
                                        <td className="py-1 pr-2">{r.k}</td>
                                        <td className="py-1 pr-2">{r.p}</td>
                                        <td className="py-1 pr-2">{r.c}</td>
                                        <td className="py-1 pr-2">{r.f}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
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
              {/* Legacy overshoot/deficit weights removed */}
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
        </>
      )}
    </div>
  );
}
