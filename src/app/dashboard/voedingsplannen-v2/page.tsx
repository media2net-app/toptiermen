'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { useRouter } from 'next/navigation';
import OnboardingV2Progress from '@/components/OnboardingV2Progress';
import OnboardingNotice from '@/components/OnboardingNotice';
import OnboardingLoadingOverlay from '@/components/OnboardingLoadingOverlay';
import ModalBase from '@/components/ui/ModalBase';
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
  HeartIcon,
  CheckIcon
} from '@heroicons/react/24/solid';
import { PencilIcon } from '@heroicons/react/24/outline';
import IngredientEditModal from '@/components/IngredientEditModal';
import PostOnboardingNutritionModal from '@/components/PostOnboardingNutritionModal';
import UpgradeModal from '@/components/UpgradeModal';
import { toast } from 'react-hot-toast';
import { useSubscription } from '@/hooks/useSubscription';

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
        avond_snack?: any;
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
  const { completeStep, currentStep, isCompleted, showLoadingOverlay, loadingText, loadingProgress } = useOnboardingV2();
  const { hasAccess, loading: subscriptionLoading } = useSubscription();
  const canAccessNutrition = hasAccess('nutrition');
  const router = useRouter();
  
  // Check user access to nutrition plans
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [originalPlanData, setOriginalPlanData] = useState<OriginalPlanData | null>(null);
  const [scaledPlanData, setScaledPlanData] = useState<any>(null);
  const [scalingInfo, setScalingInfo] = useState<SmartScalingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingOriginal, setLoadingOriginal] = useState(false);
  const [loadingScaling, setLoadingScaling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOriginalData, setShowOriginalData] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showUserProfileForm, setShowUserProfileForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('maandag');
  const [customAmounts, setCustomAmounts] = useState<{[key: string]: number}>({});
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [editingMealType, setEditingMealType] = useState<string>('');
  const [editingDay, setEditingDay] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  // Debug: Smart Scaling toggle
  const [smartScalingOn, setSmartScalingOn] = useState<boolean>(false);
  // Debug: Raw (unscaled) plan for testing
  const [rawPlanData, setRawPlanData] = useState<any>(null);
  // Debug: Scaling test modal/results
  const [showScalingTestModal, setShowScalingTestModal] = useState(false);
  const [scalingTestResults, setScalingTestResults] = useState<any[]>([]);
  
  // Post-onboarding modal state
  const [showPostOnboardingModal, setShowPostOnboardingModal] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<NutritionPlan | null>(null);
  // Onboarding next-step modal when a plan is selected during onboarding
  const [showOnboardingNextModal, setShowOnboardingNextModal] = useState(false);
  // Unavailable notice modal for 'Bekijk Plan'
  const [showPlanUnavailableModal, setShowPlanUnavailableModal] = useState(false);
  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Debug: Log modal state changes
  useEffect(() => {
    console.log('🔧 DEBUG: showUpgradeModal state changed:', showUpgradeModal);
  }, [showUpgradeModal]);
  const nutritionNextBtnId = 'onb-nutrition-next-btn';
  const nextModalRef = useRef<HTMLDivElement | null>(null);
  // Ingredient lookup from DB (name -> macros/unit)
  const [ingredientLookup, setIngredientLookup] = useState<any | null>(null);

  useEffect(() => {
    if (!canAccessNutrition) return; // Skip heavy ingredient load for Basic users
    const loadIngredients = async () => {
      try {
        const res = await fetch('/api/nutrition-ingredients', { cache: 'no-store' });
        const json = await res.json();
        if (json?.ingredients) {
          setIngredientLookup(json.ingredients);
          const DEBUG = process.env.NEXT_PUBLIC_DEBUG === '1';
          if (DEBUG) {
            const keys = Object.keys(json.ingredients || {});
            console.log('🍽️ Ingredient lookup loaded:', keys.length, 'items. Sample:', keys.slice(0, 20));
          }
        }
      } catch (e) { console.warn('Could not fetch ingredient lookup', e); }
    };
    loadIngredients();
  }, [canAccessNutrition]);

  // Choose which plan to render: scaled if available and enabled, else original
  const planToRender = useMemo(() => {
    if (smartScalingOn && scaledPlanData) return scaledPlanData;
    return originalPlanData;
  }, [smartScalingOn, scaledPlanData, originalPlanData]);

  // Auto-enable smart scaling for weights different from 100kg
  useEffect(() => {
    if (!userProfile) return;
    const w = Number(userProfile.weight);
    if (w && w !== 100 && !smartScalingOn) {
      console.log('✅ Auto-enabling Smart Scaling for weight', w);
      setSmartScalingOn(true);
    }
  }, [userProfile, smartScalingOn]);

  // When a plan gets selected during onboarding, show focus modal to proceed to next step
  useEffect(() => {
    if (!isCompleted && selectedPlan) {
      setShowOnboardingNextModal(true);
      // Ensure the modal receives focus shortly after mount
      setTimeout(() => {
        try {
          const btn = document.querySelector<HTMLButtonElement>('#onb-nutrition-next-btn');
          btn?.focus();
        } catch {}
      }, 60);
    }
  }, [selectedPlan, isCompleted]);

  // Focus-scroll when the modal is visible
  useEffect(() => {
    if (showOnboardingNextModal) {
      setTimeout(() => {
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
        try { document.getElementById(nutritionNextBtnId)?.focus(); } catch {}
        try { nextModalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
      }, 120);
    }
  }, [showOnboardingNextModal]);

  // Check for post-onboarding modal
  useEffect(() => {
    if (!canAccessNutrition) return; // Basic users: no post-onboarding nutrition modal checks
    if (!user?.email || !isCompleted) return;
    
    const checkPostOnboardingModal = async () => {
      try {
        const response = await fetch(`/api/onboarding-v2?email=${user.email}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.onboarding.isCompleted && data.onboarding.status?.nutrition_plan_selected && data.onboarding.status?.selected_nutrition_plan_id) {
            console.log('🎯 User completed onboarding with selected nutrition plan, checking for post-onboarding modal...');
            // Check if this is the first visit after onboarding completion
            const hasSeenPostOnboardingModal = localStorage.getItem('hasSeenPostOnboardingNutritionModal');
            if (!hasSeenPostOnboardingModal) {
              console.log('🎯 First visit after onboarding completion, showing nutrition modal...');
              // Find the selected plan in the loaded plans
              const selectedPlan = plans.find(plan => (plan.plan_id || plan.id) === data.onboarding.status.selected_nutrition_plan_id);
              if (selectedPlan) {
                setSelectedPlanForModal(selectedPlan);
                setShowPostOnboardingModal(true);
                localStorage.setItem('hasSeenPostOnboardingNutritionModal', 'true');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking post-onboarding status:', error);
      }
    };
    
    checkPostOnboardingModal();
  }, [user?.email, isCompleted, plans, canAccessNutrition]);

  // Check user subscription on component mount
  useEffect(() => {
    if (!canAccessNutrition) return; // Skip user preferences fetch for Basic users
    const checkUserSubscription = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/user-preferences?userId=${user.id}`, { cache: 'no-store' });
        const data = await response.json();
        
        if (data.success && data.preferences) {
          setUserSubscription(data.preferences);
        }
      } catch (error) {
        console.error('Error fetching user subscription:', error);
      }
    };
    
    checkUserSubscription();
  }, [user, canAccessNutrition]);

  // Reset modal state when component mounts
  useEffect(() => {
    setShowIngredientModal(false);
    setEditingMealType('');
    setEditingDay('');
  }, []);

  // Auto-scroll the reset modal into view when it opens
  useEffect(() => {
    if (!showResetConfirm) return;
    const scrollToModal = () => {
      const el = document.getElementById('reset-confirm-modal-v2');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < viewportH * 0.2 || rect.bottom > viewportH * 0.8) {
        const modalCenterY = rect.top + rect.height / 2;
        const viewportCenterY = viewportH / 2;
        const delta = modalCenterY - viewportCenterY;
        window.scrollBy({ top: delta, behavior: 'smooth' });
      }
    };
    const t1 = setTimeout(scrollToModal, 50);
    const t2 = setTimeout(scrollToModal, 250);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [showResetConfirm]);

  // Load active selection on mount so it persists after refresh
  useEffect(() => {
    if (!canAccessNutrition) return; // Skip active selection preload for Basic users
    const loadActiveSelection = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/nutrition-plan-active?userId=${user.id}`, { cache: 'no-cache' });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.success && data?.hasActivePlan && data?.activePlanId) {
          setSelectedPlanId(data.activePlanId);
        }
      } catch (e) {
        console.warn('Failed to load active nutrition plan', e);
      }
    };
    loadActiveSelection();
  }, [user?.id, canAccessNutrition]);

  // Reset modal state when no plan is selected
  useEffect(() => {
    if (!selectedPlan) {
      setShowIngredientModal(false);
      setEditingMealType('');
      setEditingDay('');
    }
  }, [selectedPlan]);

  // If we have an active selectedPlanId and plans are loaded, auto-select and load detail
  // Skip this behavior during onboarding step 5 to avoid redirecting to plan detail
  useEffect(() => {
    if (selectedPlan || !selectedPlanId || plans.length === 0) return;
    // Onboarding: do NOT open detail view (we show modal instead)
    if (!isCompleted && currentStep === 5) return;
    const plan = plans.find(p => (p.plan_id || p.id) === selectedPlanId);
    if (plan) {
      setSelectedPlan(plan);
      // Load original data to render detail view
      const idToLoad = (plan.plan_id || plan.id).toString();
      fetch(`/api/nutrition-plan-original?planId=${idToLoad}`, { cache: 'no-store' })
        .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to load plan')))
        .then(data => setOriginalPlanData(data.plan ? data.plan : data))
        .catch(err => console.error('Error preloading original plan data:', err));
    }
  }, [selectedPlanId, plans, selectedPlan, isCompleted, currentStep]);

  // Debug: Log modal state changes
  useEffect(() => {
    console.log('🔧 DEBUG: Modal state changed:', { showIngredientModal, editingMealType, editingDay });
  }, [showIngredientModal, editingMealType, editingDay]);

  // Days of the week
  const days = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];

  // Check if user has access to nutrition plans using useSubscription hook
  const hasNutritionAccess = () => {
    return hasAccess('nutrition');
  };

  // Convert absolute grams to the unit used by the ingredient
  const gramsToUnits = (ingredient: any, grams: number) => {
    const unit = ingredient.unit;
    if (unit === 'g') return grams;             // 1 unit = 1 gram
    if (unit === 'per_100g') return grams / 100; // 1 unit = 100 g
    if (unit === 'per_ml') return grams;        // approx ml ~ g
    // piece-based or unknown: return as-is (no safe conversion)
    return grams;
  };

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

      // 6) Auto-add up to 2 helper ingredients from DB if still off by >1% or >5g
      if (ingredientLookup) {
        const personalized = calculatePersonalizedTargets(planToRender || selectedPlan || ({} as any));
        if (!personalized) {
          console.log('ℹ️ Skip helper ingredients; no personalized targets available');
          return;
        }
        const totalsNow = calculateDayTotals(day, planToRender);
        const needProt = (personalized.targetProtein - totalsNow.protein) > Math.max(5, personalized.targetProtein*0.01);
        const needCarb = (personalized.targetCarbs - totalsNow.carbs)   > Math.max(5, personalized.targetCarbs*0.01);
        const needFat  = (personalized.targetFat - totalsNow.fat)       > Math.max(3, personalized.targetFat*0.01);
        let adds = 0;
        const addIng = (meal:any, name:string, unit:string, amount:number) => {
          const info = ingredientLookup[name];
          if (!info) return false;
          const newIng:any = {
            name,
            unit,
            amount,
            calories_per_100g: info.calories_per_100g || 0,
            protein_per_100g: info.protein_per_100g || 0,
            carbs_per_100g: info.carbs_per_100g || 0,
            fat_per_100g: info.fat_per_100g || 0,
            _baseline: 0,
            _highlight: 'added'
          };
          // rounding + clamping
          newIng.amount = roundByCategory(newIng, newIng.amount);
          newIng.amount = clampByCategory(newIng, newIng.amount);
          meal.ingredients.push(newIng);
          meal.totals = calculateMealTotals(meal, undefined, day);
          return true;
        };

        // Build dynamic candidates by macro density
        const names = Object.keys(ingredientLookup || {});
        const byProt = names.map(n=>({
          n, i: ingredientLookup[n], score: (ingredientLookup[n].protein_per_100g||0) - (ingredientLookup[n].fat_per_100g||0)*0.5
        })).sort((a,b)=> b.score - a.score);
        const byCarb = names.map(n=>({
          n, i: ingredientLookup[n], score: (ingredientLookup[n].carbs_per_100g||0) - (ingredientLookup[n].fat_per_100g||0)*0.3
        })).sort((a,b)=> b.score - a.score);
        const byFat = names.map(n=>({
          n, i: ingredientLookup[n], score: (ingredientLookup[n].fat_per_100g||0)
        })).sort((a,b)=> b.score - a.score);

        const mealOrder = ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'];
        for (const mealType of mealOrder) {
          if (adds >= 2) break;
          const meal = planToRender?.meals?.weekly_plan?.[day]?.[mealType];
          if (!meal?.ingredients) continue;
          if (needProt && adds < 2) {
            // Prefer explicit names, else top protein-dense candidate
            if (ingredientLookup['Whey Shake'] && addIng(meal, 'Whey Shake', 'stuk', 1)) { adds++; }
            else if (ingredientLookup['Magere Kwark'] && addIng(meal, 'Magere Kwark', 'per_100g', 1.5)) { adds++; }
            else if (byProt[0]) {
              const cand = byProt[0];
              const unit = (cand.i.unit_type === 'per_piece' || cand.i.unit_type === 'stuk') ? 'stuk' : 'per_100g';
              const amt = unit === 'stuk' ? 1 : 1.5; // 1 piece or 150 g
              if (addIng(meal, cand.n, unit, amt)) { adds++; }
            } else {
              // Hard fallback whey-like item
              const dummy:any = { name: 'Whey Shake', unit: 'stuk', amount: 1, calories_per_100g: 400, protein_per_100g: 80, carbs_per_100g: 8, fat_per_100g: 6, _baseline: 0, _highlight: 'added' };
              meal.ingredients.push(dummy);
              meal.totals = calculateMealTotals(meal, undefined, day);
              adds++;
            }
          }
          if (adds >= 2) break;
          if (needCarb && adds < 2) {
            if (ingredientLookup['Rijstwafel'] && addIng(meal, 'Rijstwafel', 'stuk', 1)) { adds++; }
            else if (ingredientLookup['Basmati Rijst'] && addIng(meal, 'Basmati Rijst', 'g', 40)) { adds++; }
            else if (byCarb[0]) {
              const cand = byCarb[0];
              const unit = (cand.i.unit_type === 'per_piece' || cand.i.unit_type === 'stuk') ? 'stuk' : (cand.i.unit_type === 'g' ? 'g' : 'per_100g');
              const amt = unit === 'stuk' ? 1 : (unit === 'g' ? 40 : 0.4); // 1 piece or 40 g or 40 g via per_100g unit
              if (addIng(meal, cand.n, unit, amt)) { adds++; }
            }
          }
          if (adds >= 2) break;
          if (needFat && adds < 2) {
            if (ingredientLookup['Olijfolie'] && addIng(meal, 'Olijfolie', 'g', 3)) { adds++; }
            else if (ingredientLookup['Roomboter'] && addIng(meal, 'Roomboter', 'g', 3)) { adds++; }
            else if (byFat[0]) {
              const cand = byFat[0];
              const unit = (cand.i.unit_type === 'g' || cand.i.unit_type === 'per_100g') ? 'g' : 'per_100g';
              const amt = unit === 'g' ? 3 : 0.03; // ~3 g fat
              if (addIng(meal, cand.n, unit, amt)) { adds++; }
            } else {
              // Hard fallback oil-like item
              const dummy:any = { name: 'Olijfolie', unit: 'g', amount: 3, calories_per_100g: 900, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, _baseline: 0, _highlight: 'added' };
              dummy.amount = roundByCategory(dummy, dummy.amount);
              dummy.amount = clampByCategory(dummy, dummy.amount);
              meal.ingredients.push(dummy);
              meal.totals = calculateMealTotals(meal, undefined, day);
              adds++;
            }
          }
        }
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
      const response = await fetch('/api/nutrition-profile-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          weight: profile.weight,
          height: profile.height,
          age: profile.age,
          gender: profile.gender,
          activity_level: profile.activity_level,
          fitness_goal: profile.fitness_goal
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
      toast.success('Profiel opgeslagen!');
      console.log('✅ User profile saved:', result);
    } catch (err) {
      console.error('❌ Save profile error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
      setError(errorMessage);
      toast.error('Fout bij opslaan profiel');
    }
  };

  // Function to calculate display targets for a plan
  // IMPORTANT: Personalize calories by weight/activity/goal. Use DB targets only when no profile.
  const calculatePersonalizedTargets = (plan: NutritionPlan | any, profileOverride?: UserProfile) => {
    if (!plan) return null;

    const planTargetCalories = plan?.target_calories ?? plan?.meals?.target_calories ?? 0;
    const planTargetProtein  = plan?.target_protein  ?? plan?.meals?.target_protein  ?? null;
    const planTargetCarbs    = plan?.target_carbs    ?? plan?.meals?.target_carbs    ?? null;
    const planTargetFat      = plan?.target_fat      ?? plan?.meals?.target_fat      ?? null;

    const proteinPercentage = plan?.protein_percentage ?? plan?.meals?.protein_percentage ?? null;
    const carbsPercentage   = plan?.carbs_percentage   ?? plan?.meals?.carbs_percentage   ?? null;
    const fatPercentage     = plan?.fat_percentage     ?? plan?.meals?.fat_percentage     ?? null;

    const profile = profileOverride || userProfile;
    const activityMultipliers = { sedentary: 1.1, moderate: 1.3, very_active: 1.6 } as const;
    let dynamicCalories: number | null = null;
    if (profile) {
      const baseCalories = profile.weight * 22 * activityMultipliers[profile.activity_level];
      const goalAdjustments = { droogtrainen: -500, onderhoud: 0, spiermassa: 400 } as const;
      const planGoal = (plan.goal?.toLowerCase?.() || 'onderhoud') as keyof typeof goalAdjustments;
      dynamicCalories = Math.round(baseCalories + (goalAdjustments[planGoal] ?? 0));
    }

    // If we have dynamicCalories (e.g. 90kg != 100kg), use that; else fall back to DB plan target
    const targetCalories = dynamicCalories ?? Math.round(planTargetCalories || 0);

    // Derive grams: prefer explicit percentages; else if grams exist in DB, scale proportionally
    if (proteinPercentage && carbsPercentage && fatPercentage) {
      return {
        targetCalories,
        targetProtein: Math.round((targetCalories * proteinPercentage / 100) / 4),
        targetCarbs:   Math.round((targetCalories * carbsPercentage   / 100) / 4),
        targetFat:     Math.round((targetCalories * fatPercentage     / 100) / 9),
      };
    }

    const hasAllMacroGrams = [planTargetProtein, planTargetCarbs, planTargetFat].every(v => typeof v === 'number' && !Number.isNaN(v));
    if (hasAllMacroGrams && planTargetCalories) {
      const scale = targetCalories / planTargetCalories;
      return {
        targetCalories,
        targetProtein: Math.round((planTargetProtein as number) * scale),
        targetCarbs:   Math.round((planTargetCarbs   as number) * scale),
        targetFat:     Math.round((planTargetFat     as number) * scale),
      };
    }

    // Fallback defaults by plan type/name
    const isCarnivore = String(plan.name || '').toLowerCase().includes('carnivoor');
    const pPct = isCarnivore ? 35 : 35;
    const cPct = isCarnivore ? 5  : 40;
    const fPct = isCarnivore ? 60 : 25;
    return {
      targetCalories,
      targetProtein: Math.round((targetCalories * pPct) / 100 / 4),
      targetCarbs:   Math.round((targetCalories * cPct) / 100 / 4),
      targetFat:     Math.round((targetCalories * fPct) / 100 / 9),
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
      const hasTotals = !!meal?.totals;
      const hasNutrition = !!meal?.nutrition;
      console.log(`🔍 ${mealType}:`, meal ? 'exists' : 'missing', hasTotals ? 'has totals' : (hasNutrition ? 'has nutrition' : 'no totals'));      
      
      if (hasNutrition) {
        // Backend stores 'nutrition' with rounded values
        console.log(`📊 ${mealType} nutrition:`, meal.nutrition);
        totals.calories += meal.nutrition.calories || 0;
        totals.protein += meal.nutrition.protein || 0;
        totals.carbs += meal.nutrition.carbs || 0;
        totals.fat += meal.nutrition.fat || 0;
      } else if (hasTotals) {
        // Legacy/local computed totals
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
          if (ingredient.unit === 'per_piece' || ingredient.unit === 'stuks' || ingredient.unit === 'stuk' || ingredient.unit === 'per_plakje' || ingredient.unit === 'plakje' || ingredient.unit === 'plakjes') {
            multiplier = amount;
          } else if (ingredient.unit === 'per_100g' || ingredient.unit === 'g' || ingredient.unit === 'gram') {
            multiplier = amount / 100;
          } else if (ingredient.unit === 'per_ml') {
            multiplier = amount / 100; // Assuming 1ml = 1g for liquids
          } else if (ingredient.unit === 'per_handful' || ingredient.unit === 'handje' || ingredient.unit === 'handjes') {
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

    // Align rounding with backend summarize style
    const rounded = {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
    };
    console.log('📊 Final day totals for', day, ':', rounded);
    return rounded;
  };

  // Get current day totals - recalculate when customAmounts change
  const currentDayTotals = useMemo(() => {
    if (!planToRender) {
      console.log('🔄 No originalPlanData available, returning zeros');
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    console.log('🔄 Recalculating day totals due to customAmounts change');
    return calculateDayTotals(selectedDay, planToRender);
  }, [selectedDay, customAmounts, planToRender]);

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

  // === Unit-aware helpers for Smart Scaling ===
  const gramsPerUnit = (ingredient: any) => {
    if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk' || ingredient.unit === 'handje') return 1; // piece-based unit
    if (ingredient.unit === 'per_ml') return 1; // approx 1ml ~ 1g
    // per_100g / g
    return 0.01; // 1g is 0.01 of 100g base
  };

  const macroPerUnit = (ingredient: any) => {
    const k = gramsPerUnit(ingredient);
    const p100 = ingredient.protein_per_100g || 0;
    const c100 = ingredient.carbs_per_100g || 0;
    const f100 = ingredient.fat_per_100g || 0;
    if (ingredient.unit === 'g') {
      return { p: p100 / 100, c: c100 / 100, f: f100 / 100 };
    }
    return { p: p100 * k, c: c100 * k, f: f100 * k };
  };

  const roundUnitAmount = (ingredient: any, x: number) => {
    if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk' || ingredient.unit === 'handje') {
      return Math.max(1, Math.round(x));
    }
    if (ingredient.unit === 'per_100g' || ingredient.unit === 'g' || ingredient.unit === 'per_ml') {
      const step = 5; // 5g step
      return Math.max(0.1, Math.round(x / step) * step);
    }
    // default
    return Math.max(0.1, Math.round(x * 10) / 10);
  };

  // === Ingredient categorization and caps for realistic scaling ===
  const getIngredientCategory = (name: string): 'fat' | 'cheese' | 'dairy' | 'meat' | 'egg' | 'carb' | 'other' => {
    const n = (name || '').toLowerCase();
    if (n.includes('ei')) return 'egg';
    if (n.includes('kaas') || n.includes('cheddar') || n.includes('mozz') || n.includes('parme')) return 'cheese';
    if (n.includes('boter') || n.includes('roomboter') || n.includes('ghee') || n.includes('olijfolie') || n.includes('olie') || n.includes('slagroom') || n.includes('room')) return 'fat';
    if (n.includes('melk') || n.includes('yoghurt') || n.includes('kwark')) return 'dairy';
    if (n.includes('bief') || n.includes('rund') || n.includes('kip') || n.includes('spek') || n.includes('vark') || n.includes('lam') || n.includes('vis') || n.includes('zalm') || n.includes('tonijn')) return 'meat';
    // Carb-dominant bronnen
    if (
      n.includes('havermout') || n.includes('rijst') || n.includes('pasta') || n.includes('spaghetti') ||
      n.includes('brood') || n.includes('wrap') || n.includes('tortilla') || n.includes('rijstwafel') ||
      n.includes('quinoa') || n.includes('couscous') || n.includes('bulgur') || n.includes('aardappel') ||
      n.includes('zoete aardappel') || n.includes('muesli') || n.includes('granola')
    ) return 'carb';
    return 'other';
  };

  const CATEGORY_CAPS = {
    eggPieces: 3,            // max eggs per snack/meal (prevent exploding eggs)
    fatGramsPerItem: 50,     // per fat item cap to avoid absurd amounts
    cheeseGramsPerItem: 120,
    dairyMlPerItem: 400,
    meatGramsPerItem: 600,
  } as const;

  const clampByCategory = (ing:any, amount:number) => {
    const cat = getIngredientCategory(ing.name || '');
    const unit = ing.unit;
    let cap = Infinity;
    if (cat === 'egg' && (unit === 'per_piece' || unit === 'stuk' || unit === 'per_plakje')) cap = CATEGORY_CAPS.eggPieces;
    if (cat === 'fat' && (unit === 'g' || unit === 'per_100g')) cap = CATEGORY_CAPS.fatGramsPerItem / gramsPerUnit(ing);
    if (cat === 'cheese' && (unit === 'g' || unit === 'per_100g')) cap = CATEGORY_CAPS.cheeseGramsPerItem / gramsPerUnit(ing);
    if (cat === 'dairy' && (unit === 'ml' || unit === 'per_ml')) cap = CATEGORY_CAPS.dairyMlPerItem / gramsPerUnit(ing);
    if (cat === 'meat' && (unit === 'g' || unit === 'per_100g')) cap = CATEGORY_CAPS.meatGramsPerItem / gramsPerUnit(ing);
    let x = Math.min(amount, cap);
    // Logical floors to keep meals realistic (only for weight-based units)
    if (cat === 'meat' && (unit === 'g' || unit === 'per_100g')) {
      const minUnits = gramsToUnits(ing, 75); // ≥75 g vlees
      x = Math.max(minUnits, x);
    }
    if (cat === 'carb' && (unit === 'g' || unit === 'per_100g')) {
      const minUnits = gramsToUnits(ing, 50); // ≥50 g granen
      x = Math.max(minUnits, x);
    }
    // Cheese slices: limit total slices and growth vs baseline
    if (cat === 'cheese' && (unit === 'per_plakje' || unit === 'stuk')) {
      const baseline = typeof ing._baseline === 'number' ? ing._baseline : 0;
      const maxTotal = Math.max(2, Math.min(4, baseline + 2)); // total ≤ 4 and ≤ baseline+2
      x = Math.min(x, maxTotal);
    }
    // Relative change guard vs baseline: total change within ±60%
    if (typeof ing._baseline === 'number') {
      const base = ing._baseline as number;
      const minRel = base * 0.4; // -60%
      const maxRel = base * 1.6; // +60%
      x = Math.max(minRel, Math.min(maxRel, x));
    }
    if (cat === 'egg' && (unit === 'per_piece' || unit === 'stuk')) {
      x = Math.round(x); // whole eggs only
    }
    return Math.max(0, x);
  };

  const roundByCategory = (ing:any, amount:number) => {
    const cat = getIngredientCategory(ing.name || '');
    const unit = ing.unit;
    if (cat === 'egg' && (unit === 'per_piece' || unit === 'stuk')) return Math.round(amount); // whole eggs
    if ((cat === 'fat') && (unit === 'g' || unit === 'per_100g')) {
      // 5g steps for fats (boter/olie)
      const grams = amount * gramsPerUnit(ing);
      const stepped = Math.round(grams / 5) * 5;
      return Math.max(0, stepped / gramsPerUnit(ing));
    }
    if ((cat === 'cheese') && (unit === 'g' || unit === 'per_100g')) {
      const grams = amount * gramsPerUnit(ing);
      const stepped = Math.round(grams / 10) * 10;
      return Math.max(0, stepped / gramsPerUnit(ing));
    }
    if ((cat === 'dairy') && (unit === 'ml' || unit === 'per_ml')) {
      const ml = amount * gramsPerUnit(ing);
      const stepped = Math.round(ml / 100) * 100;
      return Math.max(0, stepped / gramsPerUnit(ing));
    }
    if ((cat === 'meat') && (unit === 'g' || unit === 'per_100g')) {
      const grams = amount * gramsPerUnit(ing);
      const stepped = Math.round(grams / 25) * 25;
      return Math.max(0, stepped / gramsPerUnit(ing));
    }
    return roundUnitAmount(ing, amount);
  };


  // Smart Scaling Algorithm - Focus on Macro Balance Optimization
  const applySmartScaling = (planData: any, userProfile: any) => {
    if (!planData || !userProfile) return planData;
    const scaledPlan = JSON.parse(JSON.stringify(planData));

    // Preserve baseline amounts on each ingredient for logical constraints later
    Object.keys(scaledPlan?.meals?.weekly_plan || {}).forEach((day:string) => {
      ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'].forEach(mealType => {
        const meal = scaledPlan.meals?.weekly_plan?.[day]?.[mealType];
        meal?.ingredients?.forEach((ing:any) => { if (typeof ing._baseline !== 'number') ing._baseline = ing.amount; });
      });
    });

    const days = Object.keys(scaledPlan?.meals?.weekly_plan || {});
    days.forEach(day => {
      const personalized = calculatePersonalizedTargets(scaledPlan, userProfile);
      if (!personalized) return;

      // 1) Calorie-first global scaling
      const totalsBefore = calculateDayTotals(day, scaledPlan);
      if (totalsBefore.calories > 0) {
        const fCal = personalized.targetCalories / totalsBefore.calories;
        ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'].forEach(mealType => {
          const meal = scaledPlan.meals.weekly_plan[day]?.[mealType];
          if (meal?.ingredients) {
            meal.ingredients.forEach((ing: any) => {
              if (typeof ing.amount === 'number') ing.amount = roundUnitAmount(ing, ing.amount * fCal);
            });
            meal.totals = calculateMealTotals(meal, mealType, day);
          }
        });
      }

      // 2) Macro balancing (more iterations + priority by largest relative deviation)
      for (let iter = 0; iter < 8; iter++) {
        const t = calculateDayTotals(day, scaledPlan);
        const dP = personalized.targetProtein - t.protein;
        const dC = personalized.targetCarbs - t.carbs;
        const dF = personalized.targetFat - t.fat;

        const within5 = (actual:number, target:number) => Math.abs(actual - target) <= Math.max(5, target * 0.05);
        if (within5(t.calories, personalized.targetCalories)
          && within5(t.protein, personalized.targetProtein)
          && within5(t.carbs, personalized.targetCarbs)
          && within5(t.fat, personalized.targetFat)) break;

        let proteinSources:any[] = [];
        let carbSources:any[]   = [];
        let fatSources:any[]    = [];

        ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'].forEach(mealType => {
          const meal = scaledPlan.meals.weekly_plan[day]?.[mealType];
          meal?.ingredients?.forEach((ing:any) => {
            const m = macroPerUnit(ing);
            const cat = getIngredientCategory(ing.name || '');
            // Protein: prioritise lean sources (low fat) such as kwark/whey/kip/tonijn, then others
            if (m.p > 0.03 && (cat === 'meat' || cat === 'cheese' || cat === 'egg' || cat === 'dairy')) {
              const leanness = m.p / Math.max(0.01, (m.f + 0.01));
              proteinSources.push({ ing, m, cat, score: leanness });
            }
            // Carbs: include true carb sources (grains/bread/rice/oats/wafels etc.) and carb-dairy if any
            if (m.c > 0.03 && (cat === 'carb' || cat === 'dairy')) {
              const carbDensity = m.c;
              carbSources.push({ ing, m, cat, score: carbDensity });
            }
            // Fats via oils/butter/cheese/egg
            if (m.f > 0.02 && (cat === 'fat' || cat === 'cheese' || cat === 'egg')) {
              const fatDensity = m.f;
              fatSources.push({ ing, m, cat, score: fatDensity });
            }
          });
        });

        // Prioritise sources: highest impact first
        proteinSources = proteinSources.sort((a,b)=> b.score - a.score);
        carbSources    = carbSources.sort((a,b)=> b.score - a.score);
        fatSources     = fatSources.sort((a,b)=> b.score - a.score);

        const applyDelta = (sources:any[], delta:number, key:'p'|'c'|'f', stepVal:number) => {
          if (sources.length === 0 || Math.abs(delta) < 0.5) return;
          const weights = sources.map(s => Math.max(0.01, s.m[key]));
          const sumW = weights.reduce((a:number,b:number)=>a+b,0);
          sources.forEach((s, i) => {
            const share = (weights[i] / sumW) * delta * stepVal; // grams macro target
            const unitsChange = share / Math.max(0.001, s.m[key]);
            const baseAmount = typeof s.ing.amount === 'number' ? s.ing.amount : 0;
            // Per-iteration step limits to avoid unrealistic jumps
            const unit = s.ing.unit;
            let stepLimit = 0;
            if (unit === 'g' || unit === 'per_100g') stepLimit = gramsToUnits(s.ing, 50); // ≤50g per iter
            else if (unit === 'per_piece' || unit === 'stuk' || unit === 'per_plakje') stepLimit = 2; // ≤2 pieces per iter
            else if (unit === 'per_ml') stepLimit = 100; // ≤100 ml per iter
            const limitedChange = Math.max(-stepLimit, Math.min(stepLimit, unitsChange));

            let proposed = baseAmount + limitedChange;
            proposed = roundByCategory(s.ing, proposed);
            proposed = clampByCategory(s.ing, proposed);
            s.ing.amount = Math.max(0, proposed);
          });
        };

        // Main balancing: act first on the macro with largest relative deviation
        const rel = (delta:number, target:number) => Math.abs(target) < 1 ? 0 : Math.abs(delta / target);
        const order = [
          { key: 'p' as const, delta: dP, target: personalized.targetProtein, sources: proteinSources },
          { key: 'c' as const, delta: dC, target: personalized.targetCarbs,   sources: carbSources },
          { key: 'f' as const, delta: dF, target: personalized.targetFat,     sources: fatSources },
        ].sort((a,b)=> rel(b.delta,b.target) - rel(a.delta,a.target));

        const mainStep = 0.6; // stronger convergence
        for (const item of order) {
          if (item.delta !== 0) applyDelta(item.sources, item.delta, item.key, item.key === 'f' ? mainStep + 0.05 : mainStep);
        }

        // refresh meal totals
        ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'].forEach(mealType => {
          const meal = scaledPlan.meals.weekly_plan[day]?.[mealType];
          if (meal) meal.totals = calculateMealTotals(meal, mealType, day);
        });
      }

      // 3) Final calorie normalization to converge kcal precisely
      const after = calculateDayTotals(day, scaledPlan);
      if (after.calories > 0) {
        const f2 = personalized.targetCalories / after.calories;
        if (Math.abs(1 - f2) > 0.005) { // >0.5% difference
          ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'].forEach(mealType => {
            const meal = scaledPlan.meals.weekly_plan[day]?.[mealType];
            if (meal?.ingredients) {
              meal.ingredients.forEach((ing:any) => {
                if (typeof ing.amount === 'number') {
                  let next = ing.amount * f2;
                  next = roundByCategory(ing, next);
                  next = clampByCategory(ing, next);
                  ing.amount = next;
                }
              });
              meal.totals = calculateMealTotals(meal, mealType, day);
            }
          });
        }
      }

      // 4) Micro macro correction after kcal normalization
      const tFinal = calculateDayTotals(day, scaledPlan);
      const dP2 = personalized.targetProtein - tFinal.protein;
      const dC2 = personalized.targetCarbs - tFinal.carbs;
      const dF2 = personalized.targetFat - tFinal.fat;
      const microStep = 0.35; // stronger fine-tune
      if (Math.abs(dP2) > 0.5 || Math.abs(dC2) > 0.5 || Math.abs(dF2) > 0.5) {
        const proteinSources2:any[] = [];
        const carbSources2:any[]   = [];
        const fatSources2:any[]    = [];
        ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'].forEach(mealType => {
          const meal = scaledPlan.meals.weekly_plan[day]?.[mealType];
          meal?.ingredients?.forEach((ing:any) => {
            const m = macroPerUnit(ing);
            if (m.p > 0.03) proteinSources2.push({ ing, m });
            if (m.c > 0.03) carbSources2.push({ ing, m });
            if (m.f > 0.02) fatSources2.push({ ing, m });
          });
        });
        // Logical preference filtering
        let proteinForIncrease = proteinSources2;
        let proteinForDecrease = proteinSources2;
        if (dP2 > 0) {
          // Prefer lean meat/dairy (kwark/whey/kip/tonijn); de-prioritise cheese when increasing protein
          proteinForIncrease = proteinSources2
            .map(s=>({ ...s, leanScore: s.m.p/Math.max(0.05,s.m.f) }))
            .sort((a,b)=> b.leanScore - a.leanScore)
            .filter(s=>{
              const name = (s.ing.name||'').toLowerCase();
              const cat = getIngredientCategory(name);
              return cat !== 'cheese';
            });
        } else if (dP2 < 0) {
          // When lowering protein, prefer reducing whey/kwark first (low impact on fats)
          proteinForDecrease = proteinSources2
            .map(s=>({ ...s, leanScore: s.m.p/Math.max(0.05,s.m.f) }))
            .sort((a,b)=> b.leanScore - a.leanScore);
        }
        let carbsForDecrease = carbSources2;
        if (dC2 < 0) {
          // Prefer high carb density grains first (already high to low by m.c when sorted later)
          carbsForDecrease = carbSources2.sort((a,b)=> b.m.c - a.m.c);
        }
        let fatsForIncrease = fatSources2;
        if (dF2 > 0) {
          // Prefer pure fats (oil/boter) over cheese/egg when bumping fats
          fatsForIncrease = fatSources2.sort((a,b)=>{
            const na = (a.ing.name||'').toLowerCase();
            const nb = (b.ing.name||'').toLowerCase();
            const pa = (na.includes('olie')||na.includes('boter')) ? 1 : 0;
            const pb = (nb.includes('olie')||nb.includes('boter')) ? 1 : 0;
            return pb - pa;
          });
        }
        const microApplyDelta = (sources:any[], delta:number, key:'p'|'c'|'f', stepVal:number) => {
          if (sources.length === 0 || Math.abs(delta) < 0.5) return;
          const weights = sources.map((s:any) => Math.max(0.01, s.m[key]));
          const sumW = weights.reduce((a:number,b:number)=>a+b,0);
          sources.forEach((s:any, i:number) => {
            const share = (weights[i] / sumW) * delta * stepVal;
            const unitsChange = share / Math.max(0.001, s.m[key]);
            const baseAmount = typeof s.ing.amount === 'number' ? s.ing.amount : 0;
            // Per-iteration step limits
            const unit = s.ing.unit;
            let stepLimit = 0;
            if (unit === 'g' || unit === 'per_100g') stepLimit = gramsToUnits(s.ing, 30); // ≤30g in micro pass
            else if (unit === 'per_piece' || unit === 'stuk' || unit === 'per_plakje') stepLimit = 1; // ≤1 piece
            else if (unit === 'per_ml') stepLimit = 50; // ≤50 ml
            const limitedChange = Math.max(-stepLimit, Math.min(stepLimit, unitsChange));

            let proposed = baseAmount + limitedChange;
            proposed = roundByCategory(s.ing, proposed);
            proposed = clampByCategory(s.ing, proposed);
            s.ing.amount = Math.max(0, proposed);
          });
        };
        if (dP2 !== 0) microApplyDelta(dP2>0 ? proteinForIncrease : proteinForDecrease, dP2, 'p', microStep);
        if (dC2 !== 0) microApplyDelta(carbsForDecrease,    dC2, 'c', microStep);
        if (dF2 !== 0) microApplyDelta(fatsForIncrease,     dF2, 'f', microStep + 0.03);
        ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'].forEach(mealType => {
          const meal = scaledPlan.meals.weekly_plan[day]?.[mealType];
          if (meal) meal.totals = calculateMealTotals(meal, mealType, day);
        });
      }

      // Final tiny fat bump if still below target after all passes (2–3 g oil if present)
      const totalsPost = calculateDayTotals(day, scaledPlan);
      if (totalsPost.fat + 1 < personalized.targetFat) {
        const meals = ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'];
        for (const mealType of meals) {
          const meal = scaledPlan.meals.weekly_plan[day]?.[mealType];
          const oil = meal?.ingredients?.find((ing:any)=>{
            const n=(ing.name||'').toLowerCase();
            return n.includes('olie')||n.includes('olijfolie')||n.includes('boter');
          });
          if (oil) {
            const addUnits = gramsToUnits(oil, 3); // add ~3 g fat via oil/butter
            let next = (oil.amount||0) + addUnits;
            next = roundByCategory(oil, next);
            next = clampByCategory(oil, next);
            oil.amount = next;
            meal.totals = calculateMealTotals(meal, mealType, day);
            break;
          }
        }
      }

      // 5) Meal-level guard: keep a primary protein ≥100 g at dinner
      const dinner = scaledPlan.meals.weekly_plan[day]?.['diner'];
      if (dinner?.ingredients) {
        let hasPrimaryProtein = false;
        dinner.ingredients.forEach((ing:any) => {
          const cat = getIngredientCategory(ing.name || '');
          if (cat === 'meat' && (ing.unit === 'g' || ing.unit === 'per_100g')) {
            const grams = ing.unit === 'g' ? ing.amount : ing.amount * 100;
            if (grams >= 100) hasPrimaryProtein = true;
          }
        });
        if (!hasPrimaryProtein) {
          const candidate = dinner.ingredients.find((ing:any) => getIngredientCategory(ing.name || '') === 'meat' && (ing.unit === 'g' || ing.unit === 'per_100g'));
          if (candidate) {
            const requiredUnits = gramsToUnits(candidate, 100);
            candidate.amount = Math.max(candidate.amount, requiredUnits);
            candidate.amount = roundByCategory(candidate, candidate.amount);
            candidate.amount = clampByCategory(candidate, candidate.amount);
            dinner.totals = calculateMealTotals(dinner, 'diner', day);
          }
        }
      }
      // 6) FORCE DUMMY ADDITIONS FOR DEMO VISIBILITY + SMALL CARB REDUCTIONS
      try {
        const totalsNowDemo = calculateDayTotals(day, scaledPlan);
        // a) Reduce carbs gently: first Honing (-20g), then Havermout (-15g)
        if (totalsNowDemo.carbs > 0) {
          const mealOrder = ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'];
          let remainingCarbOver = Math.max(0, totalsNowDemo.carbs - personalized.targetCarbs);
          for (const mt of mealOrder) {
            if (remainingCarbOver < 1) break;
            const meal = scaledPlan.meals.weekly_plan[day]?.[mt];
            if (!meal?.ingredients) continue;
            const honey = meal.ingredients.find((x:any)=> (x.name||'').toLowerCase().includes('honing') && (x.unit==='g' || x.unit==='per_100g'));
            if (honey && remainingCarbOver >= 5) {
              let next = Math.max(0, (honey.amount||0) - gramsToUnits(honey, 20));
              next = roundByCategory(honey, next);
              next = clampByCategory(honey, next);
              honey.amount = next;
              meal.totals = calculateMealTotals(meal, mt, day);
              remainingCarbOver = Math.max(0, remainingCarbOver - 20);
            }
            const oats = meal.ingredients.find((x:any)=> (x.name||'').toLowerCase().includes('havermout') && (x.unit==='g' || x.unit==='per_100g'));
            if (oats && remainingCarbOver >= 5) {
              let next = Math.max(0, (oats.amount||0) - gramsToUnits(oats, 15));
              next = roundByCategory(oats, next);
              next = clampByCategory(oats, next);
              oats.amount = next;
              meal.totals = calculateMealTotals(meal, mt, day);
              remainingCarbOver = Math.max(0, remainingCarbOver - 15);
            }
          }
        }

        // b) Add visible dummy fat if still low
        const totalsAfterReduce = calculateDayTotals(day, scaledPlan);
        if (totalsAfterReduce.fat + 2 < personalized.targetFat) {
          const mealD = scaledPlan.meals.weekly_plan[day]?.['diner'];
          if (mealD?.ingredients) {
            const dummyOil:any = { name: 'Olijfolie', unit: 'g', amount: 5, calories_per_100g: 900, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, _baseline: 0, _highlight: 'added' };
            dummyOil.amount = roundByCategory(dummyOil, dummyOil.amount);
            dummyOil.amount = clampByCategory(dummyOil, dummyOil.amount);
            mealD.ingredients.push(dummyOil);
            mealD.totals = calculateMealTotals(mealD, 'diner', day);
          }
        }

        // c) Add visible dummy protein if still low
        const totalsAfterFat = calculateDayTotals(day, scaledPlan);
        if (totalsAfterFat.protein + 10 < personalized.targetProtein) {
          const snack = scaledPlan.meals.weekly_plan[day]?.['avond_snack'] || scaledPlan.meals.weekly_plan[day]?.['ochtend_snack'];
          if (snack?.ingredients) {
            const dummyQuark:any = { name: 'Magere Kwark', unit: 'g', amount: 150, calories_per_100g: 67, protein_per_100g: 12, carbs_per_100g: 3.6, fat_per_100g: 0.4, _baseline: 0, _highlight: 'added' };
            dummyQuark.amount = roundByCategory(dummyQuark, dummyQuark.amount);
            dummyQuark.amount = clampByCategory(dummyQuark, dummyQuark.amount);
            snack.ingredients.push(dummyQuark);
            const snackType = scaledPlan.meals.weekly_plan[day]?.['avond_snack'] === snack ? 'avond_snack' : 'ochtend_snack';
            snack.totals = calculateMealTotals(snack, snackType as any, day);
          }
        }
      } catch (e) {
        console.warn('Dummy add step failed', e);
      }
    });

    return scaledPlan;
  };

  // Run 5-profile scaling tests and store results
  const runSmartScalingTests = async () => {
    try {
      // Prefer a pristine raw plan; fallback to currently loaded originalPlanData
      const basePlan = rawPlanData ? deepClone(rawPlanData) : (originalPlanData ? deepClone(originalPlanData) : null);
      if (!basePlan) {
        console.warn('No plan data available for tests');
        toast.error('Geen plandata beschikbaar voor test');
        return;
      }
      const plan = basePlan;
      const profiles: UserProfile[] = [
        { weight: 70, height: 180, age: 28, gender: 'male', activity_level: 'sedentary', fitness_goal: 'onderhoud' },
        { weight: 80, height: 182, age: 32, gender: 'male', activity_level: 'moderate', fitness_goal: 'droogtrainen' },
        { weight: 90, height: 185, age: 35, gender: 'male', activity_level: 'very_active', fitness_goal: 'spiermassa' },
        { weight: 100, height: 188, age: 30, gender: 'male', activity_level: 'moderate', fitness_goal: 'onderhoud' },
        { weight: 110, height: 190, age: 38, gender: 'male', activity_level: 'very_active', fitness_goal: 'spiermassa' },
      ];

      // Choose a valid day present in the plan
      const availableDays = Object.keys(plan?.meals?.weekly_plan || {});
      const day = availableDays.includes('maandag') ? 'maandag' : (availableDays[0] || 'maandag');
      if (!plan?.meals?.weekly_plan?.[day]) {
        console.warn('Selected test day not found in plan; test may yield zeros', { availableDays });
      }
      const results: any[] = [];

      for (const profile of profiles) {
        const targets = calculatePersonalizedTargets(plan, profile);
        if (!targets) continue;
        const scaled = applySmartScaling(plan, profile);
        const totals = calculateDayTotals(day, scaled);
        const pct = {
          calories: (totals.calories / Math.max(1, targets.targetCalories)) * 100,
          protein: (totals.protein / Math.max(1, targets.targetProtein)) * 100,
          carbs: (totals.carbs / Math.max(1, targets.targetCarbs)) * 100,
          fat: (totals.fat / Math.max(1, targets.targetFat)) * 100,
        };
        const dev = {
          calories: pct.calories - 100,
          protein: pct.protein - 100,
          carbs: pct.carbs - 100,
          fat: pct.fat - 100,
        };
        const within5 = (v:number) => Math.abs(v) <= 5;
        const allWithin5 = within5(dev.calories) && within5(dev.protein) && within5(dev.carbs) && within5(dev.fat);
        results.push({
          profile,
          planGoal: (plan.goal || 'onderhoud'),
          target: { calories: targets.targetCalories, protein: targets.targetProtein, carbs: targets.targetCarbs, fat: targets.targetFat },
          actual: { calories: Math.round(totals.calories), protein: Math.round(totals.protein), carbs: Math.round(totals.carbs), fat: Math.round(totals.fat) },
          percent: pct,
          deviation: dev,
          allWithin5,
        });
      }

      setScalingTestResults(results);
      if (results.length === 0) {
        console.warn('Smart scaling test produced no results');
        toast.error('Test gaf geen resultaten. Controleer of plandata aanwezig is.');
      }
    } catch (e) {
      console.error('Smart scaling tests failed', e);
      toast.error('Fout tijdens Smart Scaling test');
    }
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
  }, [userProfile?.weight, userProfile?.activity_level]);
  
  // Get personalized targets for progress calculations
  // Calculate personalized targets when originalPlanData is available
  const personalizedTargets = React.useMemo(() => {
    if (!originalPlanData || !userProfile?.weight) {
      return null;
    }
    const targets = calculatePersonalizedTargets(originalPlanData);
    console.log('🧮 Calculated personalized targets:', targets);
    return targets;
  }, [originalPlanData, userProfile?.weight, userProfile?.activity_level, forceUpdate]);
  
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
    if (!user?.email) {
      console.log('❌ No user email available for profile fetch');
      return;
    }
    
    try {
      console.log('📊 Fetching user profile for email:', user.email);
      const response = await fetch(`/api/nutrition-profile-v2?email=${user.email}`);
      console.log('📊 Profile fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 V2 API Response:', data);
        if (data.profile && data.profile.weight && data.profile.height && data.profile.age) {
          console.log('📊 Fetched user profile:', data.profile);
          const newProfile = {
            weight: data.profile.weight,
            height: data.profile.height,
            age: data.profile.age,
            gender: data.profile.gender || 'male',
            activity_level: data.profile.activity_level || 'moderate',
            fitness_goal: (data.profile.goal === 'cut' ? 'droogtrainen' : 
                         data.profile.goal === 'maintain' ? 'onderhoud' : 
                         data.profile.goal === 'bulk' ? 'spiermassa' : 'onderhoud') as 'droogtrainen' | 'onderhoud' | 'spiermassa'
          };
          console.log('📊 Setting user profile to:', newProfile);
          setUserProfile(newProfile);
        } else {
          console.log('📊 No complete profile found, user needs to fill in profile first');
          setUserProfile(null);
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
  }, [user?.email]);

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
      // Keep a pristine copy for tests
      setRawPlanData(JSON.parse(JSON.stringify(data.plan)));
      // Store original first
      setOriginalPlanData(planData);
      console.log('✅ Plan data loaded:', planData.name, '(original, pending scaling if enabled)');
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
      
      // If user profile already present and scaling enabled, apply immediately
      if ((smartScalingOn || (userProfile && Number(userProfile.weight) !== 100)) && rawPlanData) {
        try {
          const scaledNow = applySmartScaling(JSON.parse(JSON.stringify(data.plan)), userProfile || {
            weight: 100, height: 180, age: 30, gender: 'male', activity_level: 'moderate', fitness_goal: 'onderhoud'
          });
          setOriginalPlanData(scaledNow);
          console.log('⚙️ Applied smart scaling immediately after load');
        } catch (e) {
          console.warn('Could not apply immediate scaling:', e);
        }
      }

      // Also fetch user profile when loading plan data (to ensure we have it next renders)
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



  const handlePlanView = (plan: NutritionPlan) => {
    // Navigate to detail page using numeric ID to align with admin meals endpoint
    const idToLoad = String(plan.id);
    router.push(`/dashboard/voedingsplannen-v2/${idToLoad}`);
  };

  const handlePlanSelect = async (plan: NutritionPlan) => {
    console.log('🔧 DEBUG: handlePlanSelect called with plan:', { name: plan.name, id: plan.plan_id || plan.id });
    console.log('🔧 DEBUG: Onboarding status:', { isCompleted, currentStep });
    
    // Set the selected plan ID for visual selection (always safe)
    setSelectedPlanId(plan.plan_id || plan.id);
    
    // Persist selection for the user
    if (user?.id) {
      try {
        const res = await fetch('/api/nutrition-plan-select', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, planId: plan.plan_id || plan.id })
        });
        if (!res.ok) {
          const txt = await res.text();
          console.error('❌ Failed to persist plan selection:', txt);
          toast.error('Opslaan van voedingsplan mislukt');
        } else {
          toast.success('Voedingsplan geselecteerd');
        }
      } catch (e) {
        console.error('❌ Error persisting plan selection:', e);
        toast.error('Opslaan van voedingsplan mislukt');
      }
    }
    
    // Onboarding step 5 behavior: do NOT open detail view; show the modal with CTA
    if (!isCompleted && currentStep === 5) {
      console.log('🎯 Onboarding step 5: showing next-step modal instead of opening plan detail');
      // Trigger the modal flow
      setShowOnboardingNextModal(true);
      // Explicit focus/scroll handled by effect on showOnboardingNextModal
      return;
    }

    // Normal flow (outside onboarding): open detail view
    handlePlanView(plan);
  };

  const handleBackToPlans = () => {
    setSelectedPlan(null);
    setOriginalPlanData(null);
    setScalingInfo(null);
    setShowOriginalData(true);
  };

  // Reload plan when Smart Scaling toggle changes
  useEffect(() => {
    if (!selectedPlan) return;
    setLoadingOriginal(true);
    setScalingInfo(null);
    loadOriginalPlanData((selectedPlan.plan_id || selectedPlan.id).toString());
    // Keep detail view open
    setLoadingOriginal(false);
  }, [smartScalingOn]);

  // Apply Smart Scaling v2 when profile and raw plan are available
  useEffect(() => {
    if (!rawPlanData) return;
    if (smartScalingOn && userProfile && Number(userProfile.weight) !== 100) {
      const scaled = applySmartScaling(rawPlanData, userProfile);
      setScaledPlanData(scaled);
    } else {
      // show original baseline
      setScaledPlanData(null);
      setOriginalPlanData(rawPlanData);
    }
  }, [smartScalingOn, userProfile, rawPlanData, ingredientLookup]);

  // Helper to read original baseline amount for display
  const getOriginalAmountDisplay = (mealType: string, ingredientName: string, day: string) => {
    try {
      const baseMeal = rawPlanData?.meals?.weekly_plan?.[day]?.[mealType];
      const ing = baseMeal?.ingredients?.find((x: any) => x.name === ingredientName);
      if (!ing) return null;
      return { amount: ing.amount, unit: ing.unit };
    } catch { return null; }
  };

  // Show subscription loading state
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <RocketLaunchIcon className="w-8 h-8 text-[#181F17]" />
          </div>

        {/* Reset confirm modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowResetConfirm(false)} />
            <div className="relative bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 w-[90%] max-w-md text-white">
              <h3 className="text-xl font-bold mb-2">Plan resetten?</h3>
              <p className="text-gray-300 mb-4">We adviseren je om je plan minimaal 8 weken te volgen voor zichtbaar resultaat. Weet je zeker dat je je huidige plan wilt wijzigen?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 bg-[#3A4D23] hover:bg-[#4A5D33] rounded-lg">Annuleren</button>
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/nutrition-plan-select', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user?.id })
                      });
                    } catch {}
                    setSelectedPlan(null);
                    setOriginalPlanData(null);
                    setSelectedPlanId(null);
                    setShowResetConfirm(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Ja, reset plan
                </button>
              </div>
            </div>
          </div>
        )}
          <h3 className="text-xl font-bold text-white mb-2">Laden...</h3>
          <p className="text-[#B6C948]">Controleer toegang...</p>
        </div>
      </div>
    );
  }

  // Show upgrade modal for Basic Tier users
  if (!hasNutritionAccess()) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-[#181F17] rounded-xl p-8 text-center border border-[#3A3D23]">
            {/* Icon */}
            <div className="w-20 h-20 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center mx-auto mb-6">
              <RocketLaunchIcon className="w-10 h-10 text-[#181F17]" />
            </div>
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-4">Voedingsplannen</h1>
            <p className="text-[#B6C948] text-lg mb-8">
              Upgrade naar Premium of Lifetime voor toegang tot voedingsplannen
            </p>
            
            {/* Upgrade Box */}
            <div className="bg-[#2A3A1A] rounded-lg p-6 border border-[#3A3D23]">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                🚀 Upgrade je Account
              </h2>
              <p className="text-gray-300 mb-6">
                Voedingsplannen zijn alleen beschikbaar voor Premium en Lifetime leden. Upgrade nu om toegang te krijgen tot:
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircleIcon className="w-5 h-5 text-[#8BAE5A]" />
                    <span>Persoonlijke voedingsplannen</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircleIcon className="w-5 h-5 text-[#8BAE5A]" />
                    <span>Macro tracking</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircleIcon className="w-5 h-5 text-[#8BAE5A]" />
                    <span>Recepten database</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircleIcon className="w-5 h-5 text-[#8BAE5A]" />
                    <span>Voedingsadvies</span>
                  </div>
                </div>
              </div>
              
              {/* Upgrade Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    console.log('🔧 DEBUG: Upgrade button clicked, setting modal to true');
                    setShowUpgradeModal(true);
                  }}
                  className="flex-1 bg-[#8BAE5A] text-[#181F17] px-6 py-3 rounded-lg font-semibold hover:bg-[#B6C948] transition-colors"
                >
                  Upgrade naar Premium
                </button>
                <button 
                  onClick={() => {
                    console.log('🔧 DEBUG: Upgrade button clicked, setting modal to true');
                    setShowUpgradeModal(true);
                  }}
                  className="flex-1 bg-[#B6C948] text-[#181F17] px-6 py-3 rounded-lg font-semibold hover:bg-[#8BAE5A] transition-colors"
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

  // Show detail page when a plan is selected and user profile is complete
  if (selectedPlan && planToRender && userProfile) {
    const isActivePlan = !!selectedPlanId && (selectedPlan.plan_id || (selectedPlan as any).id) === selectedPlanId;
    return (
      <div className="min-h-screen bg-[#0A0F0A] p-6">
        {/* Top bar: show reset only for active plan, else show back button */}
        <div className="mb-4">
          {isActivePlan ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#181F17] border border-[#3A4D23] rounded-xl p-4">
              <div className="text-gray-300 text-sm">
                <div className="text-white font-semibold mb-1">Je plan is vergrendeld</div>
                <div>Voor optimale resultaten adviseren we om een plan minimaal 8 weken te volgen. Wil je toch wisselen? Reset dan je plan hieronder.</div>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors font-semibold"
              >
                Reset plan
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 bg-[#181F17] border border-[#3A4D23] rounded-xl p-4">
              <div className="text-gray-300 text-sm">je bekijkt een plan (niet geselecteerd)</div>
              <button
                onClick={handleBackToPlans}
                className="px-4 py-2 bg-[#3A4D23] hover:bg-[#4A5D33] text-white rounded-lg transition-colors font-semibold"
              >
                ← Terug naar plannen
              </button>
            </div>
          )}
        </div>

        {/* Reset confirm modal - visible in detail view */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowResetConfirm(false)} />
            <div id="reset-confirm-modal-v2" className="relative bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 w-[90%] max-w-md text-white">
              <h3 className="text-xl font-bold mb-2">Plan resetten?</h3>
              <p className="text-gray-300 mb-4">We adviseren je om je plan minimaal 8 weken te volgen voor zichtbaar resultaat. Weet je zeker dat je je huidige plan wilt wijzigen?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 bg-[#3A4D23] hover:bg-[#4A5D33] rounded-lg">Annuleren</button>
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/nutrition-plan-select', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user?.id })
                      });
                    } catch {}
                    setSelectedPlan(null);
                    setOriginalPlanData(null);
                    setSelectedPlanId(null);
                    setShowResetConfirm(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Ja, reset plan
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Back Button hidden when a plan is active/locked */}

        {/* Plan Detail Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">{selectedPlan.name}</h1>
              {smartScalingOn && Number(userProfile.weight) !== 100 ? (
                <span className="inline-block mt-2 ml-2 text-[11px] font-semibold px-2 py-1 rounded-md bg-[#24401a] text-[#9fd466] border border-[#385a27] align-middle">
                  Smart Scaling v2: actief ({userProfile.weight} kg)
                </span>
              ) : null}
              {!isActivePlan && (
                <span className="inline-block mt-1 text-xs font-semibold px-2 py-1 rounded-md bg-[#3A4D23] text-[#8BAE5A] border border-[#4A5D33]">
                  Niet geselecteerd
                </span>
              )}
            </div>

            {/* Target Macros Section */}
            <div className="bg-[#0A0F0A] rounded-lg p-3 md:p-6 mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold text-[#8BAE5A] mb-3 md:mb-4">Target Macros</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {/* Calories */}
                <div className="bg-[#181F17] rounded-lg p-3 md:p-4">
                  <label className="block text-[#8BAE5A] text-xs md:text-sm font-medium mb-1 md:mb-2">Calorieën</label>
                  <div className="text-xl md:text-2xl font-bold text-white">
                    {personalizedTargets?.targetCalories || planToRender?.target_calories}
                  </div>
                </div>

                {/* Protein */}
                <div className="bg-[#181F17] rounded-lg p-3 md:p-4">
                  <label className="block text-[#8BAE5A] text-xs md:text-sm font-medium mb-1 md:mb-2">Eiwit (%)</label>
                  <div className="text-xl md:text-2xl font-bold text-white">
                    {(planToRender as any)?.protein_percentage}%
                  </div>
                  <div className="text-xs md:text-sm text-gray-300 mt-0.5 md:mt-1">
                    {personalizedTargets?.targetProtein || planToRender?.target_protein}g eiwit
                  </div>
                </div>

                {/* Carbs */}
                <div className="bg-[#181F17] rounded-lg p-3 md:p-4">
                  <label className="block text-[#8BAE5A] text-xs md:text-sm font-medium mb-1 md:mb-2">Koolhydraten (%)</label>
                  <div className="text-xl md:text-2xl font-bold text-white">
                    {(planToRender as any)?.carbs_percentage}%
                  </div>
                  <div className="text-xs md:text-sm text-gray-300 mt-0.5 md:mt-1">
                    {personalizedTargets?.targetCarbs || planToRender?.target_carbs}g koolhydraten
                  </div>
                </div>

                {/* Fat */}
                <div className="bg-[#181F17] rounded-lg p-3 md:p-4">
                  <label className="block text-[#8BAE5A] text-xs md:text-sm font-medium mb-1 md:mb-2">Vet (%)</label>
                  <div className="text-xl md:text-2xl font-bold text-white">
                    {(planToRender as any)?.fat_percentage}%
                  </div>
                  <div className="text-xs md:text-sm text-gray-300 mt-0.5 md:mt-1">
                    {personalizedTargets?.targetFat || planToRender?.target_fat}g vet
                  </div>
                </div>
              </div>

            </div>

            {/* Your Profile Data Section */}
            {userProfile && (
              <div className="bg-[#0A0F0A] rounded-lg p-3 md:p-6 mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-bold text-[#8BAE5A] mb-3 md:mb-4">Jouw Ingevoerde Gegevens</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-[#181F17] rounded-lg p-3 md:p-4">
                    <label className="block text-[#8BAE5A] text-xs md:text-sm font-medium mb-1 md:mb-2">Gewicht</label>
                    <div className="text-base md:text-2xl font-bold text-white">
                      {userProfile.weight} kg
                    </div>
                  </div>

                  <div className="bg-[#181F17] rounded-lg p-3 md:p-4">
                    <label className="block text-[#8BAE5A] text-xs md:text-sm font-medium mb-1 md:mb-2">Activiteitsniveau</label>
                    <div className="text-xs md:text-base font-bold text-white leading-snug">
                      {userProfile.activity_level === 'sedentary' ? 'Zittend (Licht actief)' :
                       userProfile.activity_level === 'moderate' ? 'Staand (Matig actief)' :
                       userProfile.activity_level === 'very_active' ? 'Lopend (Zeer actief)' :
                       'Staand (Matig actief)'}
                    </div>
                    <div className="text-[10px] md:text-xs text-gray-300 mt-0.5 md:mt-1 leading-snug">
                      {userProfile.activity_level === 'sedentary' ? 'Kantoorbaan, weinig beweging' :
                       userProfile.activity_level === 'moderate' ? 'Staand werk, regelmatige beweging' :
                       userProfile.activity_level === 'very_active' ? 'Fysiek werk, veel beweging' :
                       'Staand werk, regelmatige beweging'}
                    </div>
                  </div>

                  <div className="bg-[#181F17] rounded-lg p-3 md:p-4">
                    <label className="block text-[#8BAE5A] text-xs md:text-sm font-medium mb-1 md:mb-2">Fitness Doel</label>
                    <div className="text-sm md:text-lg font-bold text-white">
                      {userProfile.fitness_goal === 'droogtrainen' ? 'Droogtrainen' :
                       userProfile.fitness_goal === 'onderhoud' ? 'Onderhoud' :
                       userProfile.fitness_goal === 'spiermassa' ? 'Spiermassa' :
                       userProfile.fitness_goal}
                    </div>
                  </div>

                  {/* Geslacht verplaatst naar eerste grid om naast Fitness Doel te staan */}
                  <div className="bg-[#181F17] rounded-lg p-3 md:p-4">
                    <label className="block text-[#8BAE5A] text-xs md:text-sm font-medium mb-1 md:mb-2">Geslacht</label>
                    <div className="text-sm md:text-lg font-bold text-white">
                      Man
                    </div>
                  </div>
                </div>

                <div className="mt-3 md:mt-4 grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-[#181F17] rounded-lg p-3 md:p-4">
                    <label className="block text-[#8BAE5A] text-xs md:text-sm font-medium mb-1 md:mb-2">Leeftijd</label>
                    <div className="text-sm md:text-lg font-bold text-white">
                      {userProfile.age} jaar
                    </div>
                  </div>

                  <div className="bg-[#181F17] rounded-lg p-3 md:p-4">
                    <label className="block text-[#8BAE5A] text-xs md:text-sm font-medium mb-1 md:mb-2">Lengte</label>
                    <div className="text-sm md:text-lg font-bold text-white">
                      {userProfile.height} cm
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </motion.div>

        {/* Smart Scaling Test Results Modal removed */}

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
              {/* Mobile: dropdown */}
              <div className="w-full md:hidden">
                <label className="block text-[#8BAE5A] text-xs font-medium mb-1">Dag</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full bg-[#0A0F0A] border border-[#3A4D23] text-white rounded-lg p-2 capitalize"
                >
                  {days.map((day) => (
                    <option key={day} value={day} className="capitalize">{day}</option>
                  ))}
                </select>
              </div>

              {/* Desktop/Tablet: buttons */}
              <div className="hidden md:flex flex-wrap gap-2">
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
            {planToRender && (
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
                      <span className="text-white">{(personalizedTargets?.targetCalories || planToRender.target_calories).toFixed(1)} kcal</span>
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
                      <span className="text-white">{(personalizedTargets?.targetProtein || planToRender.target_protein).toFixed(1)}g</span>
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
                      <span className="text-white">{(personalizedTargets?.targetCarbs || planToRender.target_carbs).toFixed(1)}g</span>
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
                      <span className="text-white">{(personalizedTargets?.targetFat || planToRender.target_fat).toFixed(1)}g</span>
                    </div>
                    <div className={`text-xs mt-1 ${fatProgress.textColor}`}>
                      {fatProgress.difference > 0 ? '+' : ''}{fatProgress.difference.toFixed(1)}g
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Day Meals - Table Layout */}
            {planToRender.meals?.weekly_plan && planToRender.meals.weekly_plan[selectedDay] && (
              <div className="bg-[#0A0F0A] rounded-lg p-6">
                <h4 className="text-[#B6C948] font-bold text-lg mb-6 capitalize">{selectedDay}</h4>
                    
                <div className="space-y-6">
                  {['ontbijt', 'ochtend_snack', 'lunch', 'lunch_snack', 'diner', 'avond_snack'].map((mealType) => {
                    const mealData = planToRender.meals.weekly_plan[selectedDay][mealType];
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
                        {/* Meal Header (title only) */}
                        <div className="bg-[#2A3A1A] px-6 py-4 border-b border-[#3A4D23]">
                          <div className="flex items-center justify-between">
                            <h5 className="text-white font-semibold flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-[#8BAE5A]" />
                              {mealTypeLabel}
                            </h5>
                            {/* Desktop/tablet totals (hidden on mobile) */}
                            <div className="hidden md:flex items-center gap-4">
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

                        {/* Ingredients Table removed; using compact mobile-first list below */}

                        {/* Ingredients List (mobile) */}
                        <div className="p-3 md:p-6 md:hidden">
                          <div className="space-y-3">
                            {mealData.ingredients.map((ingredient: any, index: number) => {
                              const ingredientKey = getIngredientKey(mealType, ingredient.name, selectedDay);
                              const customAmount = customAmounts[ingredientKey];
                              let amount = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
                              if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk') {
                                amount = Math.round(amount);
                              }
                              let multiplier = 1;
                              if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk') {
                                multiplier = amount;
                              } else if (ingredient.unit === 'per_100g' || ingredient.unit === 'g') {
                                multiplier = amount / 100;
                              } else if (ingredient.unit === 'per_ml') {
                                multiplier = amount / 100;
                              } else if (ingredient.unit === 'handje') {
                                multiplier = amount;
                              } else {
                                multiplier = amount / 100;
                              }
                              const kcal = (ingredient.calories_per_100g || 0) * multiplier;
                              const p = (ingredient.protein_per_100g || 0) * multiplier;
                              const c = (ingredient.carbs_per_100g || 0) * multiplier;
                              const f = (ingredient.fat_per_100g || 0) * multiplier;
                              const getUnitLabel = (unit: string) => {
                                switch (unit) {
                                  case 'g': return 'g';
                                  case 'plakje': return 'pl';
                                  case 'piece': return 'st';
                                  case 'per_100g': return 'g';
                                  case 'per_plakje': return 'pl';
                                  case 'per_piece': return 'st';
                                  case 'per_ml': return 'ml';
                                  case 'handje': return 'hj';
                                  default: return unit;
                                }
                              };
                              const orig = getOriginalAmountDisplay(mealType, ingredient.name, selectedDay);
                              return (
                                <div key={index} className="bg-[#0F1411] border border-[#2A3A1A] rounded-lg p-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className={`${ingredient._highlight==='added' ? 'text-yellow-300' : 'text-white'} font-medium leading-5 flex items-center gap-2`}>
                                        {ingredient.name}
                                        {ingredient._highlight==='added' && (
                                          <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-yellow-900/50 text-yellow-300 border border-yellow-600 font-semibold">Nieuw</span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-400 mt-0.5">
                                        {formatAmountDisplay(amount, ingredient.unit)} {getUnitLabel(ingredient.unit)}
                                        {orig ? (
                                          <span className="text-green-400 ml-2">(orig: {formatAmountDisplay(orig.amount || 0, orig.unit)} {getUnitLabel(orig.unit)})</span>
                                        ) : null}
                                        {' '}• {Math.round(kcal)} kcal
                                      </div>
                                    </div>
                                    <div className="text-right text-xs text-gray-300 min-w-[140px]">
                                      <div><span className="text-[#8BAE5A] font-semibold">Eiwitten</span> {p.toFixed(1)}g</div>
                                      <div><span className="text-orange-400 font-semibold">Koolhydraten</span> {c.toFixed(1)}g</div>
                                      <div><span className="text-yellow-300 font-semibold">Vetten</span> {f.toFixed(1)}g</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Mobile meal totals footer */}
                        <div className="px-3 pb-4 md:hidden">
                          <div className="mt-2 pt-3 border-t border-[#2A3A1A] text-xs text-gray-300 grid grid-cols-2 gap-y-2">
                            <div className="font-semibold text-[#B6C948] col-span-2">Totaal maaltijd</div>
                            <div>Calorieën</div>
                            <div className="text-right">{mealTotals.calories.toFixed(1)} kcal</div>
                            <div>Eiwitten</div>
                            <div className="text-right">{mealTotals.protein.toFixed(1)} g</div>
                            <div>Koolhydraten</div>
                            <div className="text-right">{mealTotals.carbs.toFixed(1)} g</div>
                            <div>Vetten</div>
                            <div className="text-right">{mealTotals.fat.toFixed(1)} g</div>
                          </div>
                        </div>

                        {/* Desktop ingredients table (visible md+) */}
                        <div className="hidden md:block p-6">
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
                                  const ingredientKey = getIngredientKey(mealType, ingredient.name, selectedDay);
                                  const customAmount = customAmounts[ingredientKey];
                                  let amount = customAmount !== undefined ? customAmount : (ingredient.amount || 0);
                                  if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk') {
                                    amount = Math.round(amount);
                                  }
                                  let multiplier = 1;
                                  if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk') {
                                    multiplier = amount;
                                  } else if (ingredient.unit === 'per_100g' || ingredient.unit === 'g') {
                                    multiplier = amount / 100;
                                  } else if (ingredient.unit === 'per_ml') {
                                    multiplier = amount / 100; // 1ml≈1g
                                  } else if (ingredient.unit === 'handje') {
                                    multiplier = amount;
                                  } else {
                                    multiplier = amount / 100;
                                  }
                                  const ingredientCalories = (ingredient.calories_per_100g || 0) * multiplier;
                                  const ingredientProtein = (ingredient.protein_per_100g || 0) * multiplier;
                                  const ingredientCarbs = (ingredient.carbs_per_100g || 0) * multiplier;
                                  const ingredientFat = (ingredient.fat_per_100g || 0) * multiplier;
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
                                  const orig = getOriginalAmountDisplay(mealType, ingredient.name, selectedDay);
                                  return (
                                    <tr key={index} className="border-b border-[#2A3A1A] last:border-b-0">
                                      <td className="py-3 text-white font-medium">{ingredient.name}</td>
                                      <td className="py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          <span className="w-16 px-2 py-1 bg-[#232D1A] border border-[#3A4D23] rounded text-white text-center text-sm">
                                            {formatAmountDisplay(amount, ingredient.unit)}
                                          </span>
                                          {orig ? (
                                            <span className="text-xs text-green-400">({formatAmountDisplay(orig.amount || 0, orig.unit)})</span>
                                          ) : null}
                                        </div>
                                      </td>
                                      <td className="py-3 text-center text-gray-300 text-xs">{getUnitLabel(ingredient.unit)}</td>
                                      <td className="py-3 text-right text-white font-medium">{ingredientCalories.toFixed(0)}</td>
                                      <td className="py-3 text-right text-white">{ingredientProtein.toFixed(1)}g</td>
                                      <td className="py-3 text-right text-white">{ingredientCarbs.toFixed(1)}g</td>
                                      <td className="py-3 text-right text-white">{ingredientFat.toFixed(1)}g</td>
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

  // Overview page - show when no plan is selected and user profile is complete
  return (
    <div className="min-h-screen bg-[#0A0F0A]">
      <OnboardingV2Progress />
      <OnboardingNotice />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-white">Voedingsplannen</h1>
            <p className="text-[#B6C948]">Persoonlijk op basis van gewicht, doel en activiteitsniveau</p>
          </div>
        </motion.div>

        {/* User Profile Form */}
        {(
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
          {userProfile && (
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
                  {userProfile.activity_level === 'sedentary' ? 'Zittend (Licht actief)' :
                   userProfile.activity_level === 'moderate' ? 'Staand (Matig actief)' :
                   userProfile.activity_level === 'very_active' ? 'Lopend (Zeer actief)' :
                   'Staand (Matig actief)'}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  {userProfile.activity_level === 'sedentary' ? 'Kantoorbaan, weinig beweging' :
                   userProfile.activity_level === 'moderate' ? 'Staand werk, regelmatige beweging' :
                   userProfile.activity_level === 'very_active' ? 'Fysiek werk, veel beweging' :
                   'Staand werk, regelmatige beweging'}
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
          )}

          {/* Profile Form */}
          {(showUserProfileForm || !userProfile) && (
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
                      defaultValue={userProfile?.weight || ''}
                      min="40"
                      max="200"
                      step="0.1"
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                      placeholder="Voer je gewicht in"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Lengte (cm)</label>
                    <input
                      type="number"
                      name="height"
                      defaultValue={userProfile?.height || ''}
                      min="140"
                      max="220"
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                      placeholder="Voer je lengte in"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Leeftijd</label>
                    <input
                      type="number"
                      name="age"
                      defaultValue={userProfile?.age || ''}
                      min="16"
                      max="80"
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                      placeholder="Voer je leeftijd in"
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
                      defaultValue={userProfile?.activity_level || ''}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                      required
                    >
                      <option value="">Selecteer activiteitsniveau</option>
                      <option value="sedentary">Zittend (Licht actief) - Kantoorbaan, weinig beweging</option>
                      <option value="moderate">Staand (Matig actief) - Staand werk, regelmatige beweging</option>
                      <option value="very_active">Lopend (Zeer actief) - Fysiek werk, veel beweging</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Fitness Doel</label>
                    <select
                      name="fitness_goal"
                      defaultValue={userProfile?.fitness_goal || ''}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                      required
                    >
                      <option value="">Selecteer fitness doel</option>
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
        )}

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
        {!loading && !error && userProfile && (
          <div>
            {/* Instructions for onboarding users */}
            {!isCompleted && currentStep === 4 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 mb-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center">
                    <span className="text-[#181F17] font-bold text-sm">4</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Selecteer Je Voedingsplan</h3>
                </div>
                <p className="text-[#8BAE5A] text-sm">
                  Kies het voedingsplan dat het beste bij jouw doel past. Klik op "Selecteer Dit Plan" om door te gaan naar de volgende stap.
                </p>
              </motion.div>
            )}
            
            {/* Volgende Stap Button - Show when any plan is selected in onboarding */}
            {!isCompleted && currentStep === 5 && selectedPlanId && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-3 sm:mx-4 md:mx-6 bg-gradient-to-r from-[#8BAE5A]/10 to-[#8BAE5A]/5 border border-[#8BAE5A]/30 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6"
              >
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-[#8BAE5A]/20 rounded-lg">
                      <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#8BAE5A]" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-white">Voedingsplan Geselecteerd!</h3>
                      <p className="text-xs sm:text-sm text-gray-400">Je bent klaar voor de volgende stap</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const selectedPlan = plans.find(plan => (plan.plan_id || plan.id) === selectedPlanId);
                      if (selectedPlan) {
                        handlePlanSelect(selectedPlan);
                      }
                    }}
                    data-next-step-button
                    className="px-6 sm:px-8 py-2 sm:py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold shadow-lg shadow-[#8BAE5A]/20 flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">Doorgaan naar Volgende Stap</span>
                    <span className="sm:hidden">Volgende Stap</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans
              .filter((plan) => {
                // Filter plans based on user's fitness goal
                const planGoal = plan.goal?.toLowerCase();
                const userGoal = userProfile?.fitness_goal;
                
                // Map user goals to plan goals
                const goalMapping = {
                  'droogtrainen': 'droogtrainen',
                  'onderhoud': 'onderhoud', 
                  'spiermassa': 'spiermassa'
                };
                
                return userGoal && planGoal === goalMapping[userGoal];
              })
              .map((plan) => {
              // Calculate personalized targets for this plan
              const personalizedTargets = calculatePersonalizedTargets(plan);
              
              const isSelected = selectedPlanId === (plan.plan_id || plan.id);
              
              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-xl p-6 cursor-pointer transition-all duration-200 relative group ${
                    isSelected 
                      ? 'bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] border-2 border-[#B6C948] shadow-lg shadow-[#8BAE5A]/20' 
                      : 'bg-[#181F17] border border-[#3A4D23] hover:border-[#B6C948]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold ${isSelected ? 'text-[#181F17]' : 'text-white'}`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <CheckCircleIcon className="w-6 h-6 text-[#181F17]" />
                      )}
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isSelected 
                          ? 'bg-[#181F17] text-[#8BAE5A]' 
                          : 'bg-[#8BAE5A] text-[#181F17]'
                      }`}>
                        {plan.goal}
                      </div>
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-4 ${isSelected ? 'text-[#181F17]' : 'text-[#8BAE5A]'}`}>
                    {plan.description}
                  </p>
                  
                  {/* Personalized Calories */}
                  <div className="space-y-3">
                    {personalizedTargets && (
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${isSelected ? 'text-[#181F17]' : 'text-gray-400'}`}>
                          Jouw Calorieën:
                        </span>
                        <span className={`font-bold text-lg ${isSelected ? 'text-[#181F17]' : 'text-[#8BAE5A]'}`}>
                          {personalizedTargets.targetCalories} kcal
                        </span>
                      </div>
                    )}
                    
                    {/* Macro Breakdown */}
                    <div className={`grid grid-cols-3 gap-2 pt-2 border-t ${isSelected ? 'border-[#181F17]' : 'border-[#3A4D23]'}`}>
                      <div className="text-center">
                        <div className={`text-xs ${isSelected ? 'text-[#181F17]' : 'text-gray-400'}`}>Eiwit</div>
                        <div className={`text-sm font-semibold ${isSelected ? 'text-[#181F17]' : 'text-white'}`}>
                          {personalizedTargets?.targetProtein || plan.target_protein}g
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xs ${isSelected ? 'text-[#181F17]' : 'text-gray-400'}`}>Koolhydraten</div>
                        <div className={`text-sm font-semibold ${isSelected ? 'text-[#181F17]' : 'text-white'}`}>
                          {personalizedTargets?.targetCarbs || plan.target_carbs}g
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xs ${isSelected ? 'text-[#181F17]' : 'text-gray-400'}`}>Vet</div>
                        <div className={`text-sm font-semibold ${isSelected ? 'text-[#181F17]' : 'text-white'}`}>
                          {personalizedTargets?.targetFat || plan.target_fat}g
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Plan Action Buttons */}
                  <div className={`mt-4 pt-4 border-t space-y-2 ${isSelected ? 'border-[#181F17]' : 'border-[#3A4D23]'}`}>
                    {/* Bekijk Plan Button - Always visible */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanView(plan);
                      }}
                      className={`w-full px-4 py-2 rounded-lg transition-all duration-200 font-semibold border ${
                        isSelected 
                          ? 'bg-[#181F17] text-[#8BAE5A] border-[#8BAE5A] hover:bg-[#2A3A2A]' 
                          : 'bg-[#3A4D23] text-[#8BAE5A] border-[#8BAE5A] hover:bg-[#4A5D33]'
                      }`}
                    >
                      Bekijk Plan
                    </button>
                    
                    {/* Select Plan Button - Always visible */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanSelect(plan);
                      }}
                      className={`w-full px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
                        isSelected 
                          ? 'bg-[#181F17] text-[#8BAE5A] border border-[#8BAE5A] hover:bg-[#2A3A2A]' 
                          : 'bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] hover:from-[#8BAE5A] hover:to-[#B6C948]'
                      }`}
                    >
                      {isSelected ? 'Geselecteerd' : 'Selecteer Dit Plan'}
                    </button>
                    
                    {/* Volgende Stap Button - Only show in onboarding when plan is selected */}
                    {!isCompleted && currentStep === 5 && isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlanSelect(plan);
                        }}
                        data-next-step-button
                        className="w-full px-4 py-2 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:from-[#8BAE5A] hover:to-[#B6C948] transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <span>Volgende Stap</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
            </div>
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

      {/* Onboarding Loading Overlay */}
      <OnboardingLoadingOverlay 
        show={showLoadingOverlay}
        text={loadingText}
        progress={loadingProgress}
      />
      
      {/* Post-Onboarding Nutrition Modal */}
      <PostOnboardingNutritionModal
        isOpen={showPostOnboardingModal}
        onClose={() => setShowPostOnboardingModal(false)}
        selectedPlan={selectedPlanForModal}
      />

      {/* Onboarding Next-Step Modal (Step 5 -> Step 6) */}
      <ModalBase isOpen={!isCompleted && showOnboardingNextModal} onClose={() => setShowOnboardingNextModal(false)}>
        <div ref={nextModalRef} className="relative bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#8BAE5A]/20 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Voedingsplan geselecteerd</h3>
                <p className="text-gray-300 text-sm">Je hebt een plan gekozen. Ga verder naar stap 6.</p>
              </div>
            </div>
            <button
              onClick={() => setShowOnboardingNextModal(false)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Sluiten"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <p className="text-gray-300 mb-6 text-sm">
            We hebben je keuze opgeslagen. Klik op "Ga verder" om door te gaan naar de volgende stap van de onboarding.
          </p>

          <div className="flex justify-end">
            <button
              id={nutritionNextBtnId}
              onClick={async () => {
                try {
                  // Complete DB step 4 (SELECT_NUTRITION)
                  await completeStep(4);
                } catch {}
                setShowOnboardingNextModal(false);
                // Route to dashboard; dashboard redirect logic will send user to step 6
                router.replace('/dashboard');
              }}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] font-semibold hover:from-[#8BAE5A] hover:to-[#B6C948] transition-colors text-sm"
            >
              Ga verder naar stap 6 →
            </button>
          </div>
        </div>
      </ModalBase>

      {/* Plan Unavailable Notice Modal */}
      <ModalBase isOpen={showPlanUnavailableModal} onClose={() => setShowPlanUnavailableModal(false)}>
        <div className="relative bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-3">Voedingsplan tijdelijk niet beschikbaar</h3>
          <p className="text-gray-300 mb-4">
            Huidige voedingsplannen zijn niet voorzien van auto scaling, en dus niet beschikbaar, onze excuses voor het ongemak (wij werken aan de oplossing).
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setShowPlanUnavailableModal(false)}
              className="px-4 py-2 bg-[#3A4D23] hover:bg-[#4A5D33] rounded-lg"
            >
              Sluiten
            </button>
          </div>
        </div>
      </ModalBase>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        type="nutrition"
      />
    </div>
  );
}

// === Debug helpers ===
function deepClone<T>(obj:T):T { return JSON.parse(JSON.stringify(obj)); }

// (no-op placeholder removed)
