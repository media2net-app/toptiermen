'use client';
import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  ChartBarIcon,
  BoltIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import PlanBuilder from './components/PlanBuilder';
import FoodItemModal from './components/FoodItemModal';
import AdminCard from '@/components/admin/AdminCard';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminButton from '@/components/admin/AdminButton';

// Progress bar color helper (module scope)
const barColor = (avg: number, target: number) => {
  const t = Math.max(1, target);
  const diffPct = Math.abs((avg - t) / t) * 100;
  if (diffPct <= 5) return 'bg-[#8BAE5A]'; // groen
  if (diffPct <= 10) return 'bg-[#E6B800]'; // oranje
  return 'bg-[#EF4444]'; // rood
};

// Known meal keys ordering and labels (including aliases)
const MEAL_KEYS_ORDER = [
  'ontbijt',
  'ochtend_snack', 'ontbijt_snack',
  'lunch',
  'middag_snack', 'lunch_snack',
  'diner',
  'avond_snack', 'diner_snack',
];
const MEAL_LABELS: Record<string, string> = {
  ontbijt: 'Ontbijt',
  ochtend_snack: 'Ochtend snack',
  ontbijt_snack: 'Ochtend snack',
  lunch: 'Lunch',
  middag_snack: 'Middag snack',
  lunch_snack: 'Middag snack',
  diner: 'Diner',
  avond_snack: 'Avond snack',
  diner_snack: 'Avond snack',
};

// V1.2: Use regular Supabase client instead of service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types
interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  description: string;
  is_active: boolean;
  is_carnivore?: boolean;
  unit_type?: string;
  created_at: string;
  updated_at: string;
}

const getUnitTypeLabel = (unitType?: string) => {
  // Dynamic mapping for all unit types
  const unitTypeMap: { [key: string]: string } = {
    'per_100g': 'Per 100 gram',
    'per_30g': 'Per 30 gram',
    'per_piece': 'Per stuk',
    'per_handful': 'Per handje',
    'per_plakje': 'Per plakje'
  };

  return unitTypeMap[unitType || 'per_100g'] || unitType || 'Per 100 gram';
};

interface MealStructure {
  mealType: string;
  recipes: string[]; // Recipe IDs
}

interface NutritionPlan {
  id?: string;
  plan_id?: string;
  name: string;
  description: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  duration_weeks?: number;
  difficulty?: string;
  goal?: string;
  fitness_goal?: 'droogtrainen' | 'spiermassa' | 'onderhoud';
  is_featured?: boolean;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
  meals?: {
    weekly_plan: {
      [key: string]: {
        [key: string]: {
          time: string;
          ingredients: Array<{
            id: string;
            name: string;
            amount: number;
            unit: string;
            calories_per_100g: number;
            protein_per_100g: number;
            carbs_per_100g: number;
            fat_per_100g: number;
          }>;
          nutrition: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
          };
        };
      };
    };
    weekly_averages: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  };
}

export default function AdminVoedingsplannenPage() {
  const [activeTab, setActiveTab] = useState<'voeding' | 'custom'>('voeding');
  const [editMode, setEditMode] = useState(false);
  const [showFoodItemModal, setShowFoodItemModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [savingBeforeBack, setSavingBeforeBack] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [carnivoreFilter, setCarnivoreFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFoodItems, setIsLoadingFoodItems] = useState(true);
  const [customPlans, setCustomPlans] = useState<any[]>([]);
  const [isLoadingCustomPlans, setIsLoadingCustomPlans] = useState(false);

  // Test Profiel state
  const [testWeight, setTestWeight] = useState<number>(100);
  const [testHeight, setTestHeight] = useState<number>(180);
  const [testAge, setTestAge] = useState<number>(30);
  const [testGender, setTestGender] = useState<'male' | 'female'>('male');
  const [testActivity, setTestActivity] = useState<'sedentary' | 'light' | 'moderate' | 'very' | 'extra'>('moderate');
  const [testGoal, setTestGoal] = useState<'onderhoud' | 'droogtrainen' | 'spiermassa'>('onderhoud');
  const [testPlanId, setTestPlanId] = useState<string | undefined>(undefined);
  const [testResult, setTestResult] = useState<null | {
    planName: string;
    avgCalories: number; avgProtein: number; avgCarbs: number; avgFat: number;
    targetCalories: number; targetProtein: number; targetCarbs: number; targetFat: number;
  }>(null);
  // Local editable copy of selected plan for test mode (not persisted)
  const [testWorkingPlan, setTestWorkingPlan] = useState<NutritionPlan | null>(null);
  const [testSelectedDay, setTestSelectedDay] = useState<string>('maandag');
  const [showIngredientDetails, setShowIngredientDetails] = useState<boolean>(true);

  // Recompute when profile inputs change (targets update) – do not scale portions
  useEffect(() => {
    if (testWorkingPlan) {
      recomputeAveragesFromWorking(testWorkingPlan);
    }
  }, [testWeight, testHeight, testAge, testGender, testActivity, testGoal]);

  // Helpers for test targets (Mifflin-St Jeor + activity + simple goal factor)
  const calcBmr = (gender: 'male' | 'female', weight: number, height: number, age: number) => {
    return gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  };
  const activityFactor = (lvl: typeof testActivity) => ({
    sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, extra: 1.9
  })[lvl] || 1.55;
  const goalAdj = (goal: typeof testGoal) => ({
    onderhoud: 1.0, droogtrainen: 0.85, spiermassa: 1.10
  })[goal] || 1.0;
  const calcTargets = () => {
    const bmr = calcBmr(testGender, testWeight, testHeight, testAge);
    const kcal = Math.round(bmr * activityFactor(testActivity) * goalAdj(testGoal));
    // Macro split: Protein 2.0 g/kg, Fat 25% kcal, Carbs rest
    const protein = Math.round(testWeight * 2.0);
    const fat = Math.round((kcal * 0.25) / 9);
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { kcal, protein, carbs, fat };
  };

  // Pure helper to compute targets for an arbitrary profile (used by V2 display only)
  const calcTargetsForProfile = (
    gender: 'male' | 'female',
    weight: number,
    height: number,
    age: number,
    activity: 'sedentary' | 'light' | 'moderate' | 'very' | 'extra',
    goal: 'onderhoud' | 'droogtrainen' | 'spiermassa'
  ) => {
    const bmr = calcBmr(gender, weight, height, age);
    const kcal = Math.round(bmr * activityFactor(activity) * goalAdj(goal));
    const protein = Math.round(weight * 2.0);
    const fat = Math.round((kcal * 0.25) / 9);
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { kcal, protein, carbs, fat };
  };

  const handleRunTest = () => {
    if (!testPlanId) { setTestResult(null); return; }
    const plan = plans.find(p => String(p.id || p.plan_id) === String(testPlanId));
    if (!plan) { setTestResult(null); return; }
    // Deep clone to work on a mutable copy
    const working = JSON.parse(JSON.stringify(plan)) as NutritionPlan;
    setTestWorkingPlan(working);
    const status = getPlanStatus(working);
    const t = calcTargets();
    setTestResult({
      planName: plan.name,
      avgCalories: (status as any).avgCalories ?? 0,
      avgProtein: (status as any).avgProtein ?? 0,
      avgCarbs: (status as any).avgCarbs ?? 0,
      avgFat: (status as any).avgFat ?? 0,
      targetCalories: t.kcal,
      targetProtein: t.protein,
      targetCarbs: t.carbs,
      targetFat: t.fat,
    });
  };

  // --- Test recompute helpers (preview only) ---
  type MealNutri = { calories: number; protein: number; carbs: number; fat: number };
  const computeMealNutrition = (ingredients: Array<{ amount: number; unit?: string; calories_per_100g: number; protein_per_100g: number; carbs_per_100g: number; fat_per_100g: number; }>): MealNutri => {
    let c = 0, p = 0, cb = 0, f = 0;
    for (const ing of (ingredients || [])) {
      // Assume amount in gram; fallback: treat amount as gram-equivalent
      const grams = Number(ing.amount) || 0;
      c += (grams * (ing.calories_per_100g || 0)) / 100;
      p += (grams * (ing.protein_per_100g || 0)) / 100;
      cb += (grams * (ing.carbs_per_100g || 0)) / 100;
      f += (grams * (ing.fat_per_100g || 0)) / 100;
    }
    return { calories: Math.round(c), protein: Math.round(p), carbs: Math.round(cb), fat: Math.round(f) };
  };

  const recomputeAveragesFromWorking = (working: NutritionPlan | null) => {
    if (!working || !working.meals || !working.meals.weekly_plan) return;
    const days = ['maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag','zondag'];
    const getOrderedMealKeys = (dayObj: any) => {
      const present = Object.keys(dayObj || {});
      const ordered = MEAL_KEYS_ORDER.filter(k => present.includes(k));
      const extras = present.filter(k => !MEAL_KEYS_ORDER.includes(k));
      return [...ordered, ...extras];
    };
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    for (const d of days) {
      const dayObj: any = (working.meals as any).weekly_plan[d] || {};
      for (const m of getOrderedMealKeys(dayObj)) {
        const mealObj: any = dayObj[m];
        if (mealObj && Array.isArray(mealObj.ingredients)) {
          const nut = computeMealNutrition(mealObj.ingredients);
          // Store back into meal nutrition preview
          mealObj.nutrition = nut;
          totalCalories += nut.calories;
          totalProtein += nut.protein;
          totalCarbs += nut.carbs;
          totalFat += nut.fat;
        }
      }
    }
    const avgCalories = Math.round(totalCalories / 7);
    const avgProtein = Math.round(totalProtein / 7);
    const avgCarbs = Math.round(totalCarbs / 7);
    const avgFat = Math.round(totalFat / 7);
    const t = calcTargets();
    setTestResult({
      planName: working.name,
      avgCalories, avgProtein, avgCarbs, avgFat,
      targetCalories: t.kcal,
      targetProtein: t.protein,
      targetCarbs: t.carbs,
      targetFat: t.fat,
    });
  };

  const onChangeIngredientAmount = (day: string, mealKey: string, index: number, newAmount: number) => {
    if (!testWorkingPlan || !testWorkingPlan.meals?.weekly_plan) return;
    const working = JSON.parse(JSON.stringify(testWorkingPlan)) as NutritionPlan;
    const meal: any = (working.meals as any).weekly_plan?.[day]?.[mealKey];
    if (!meal || !meal.ingredients || !meal.ingredients[index]) return;
    meal.ingredients[index].amount = Math.max(0, Number(newAmount) || 0);
    // Recompute meal and overall averages
    const nut = computeMealNutrition(meal.ingredients);
    meal.nutrition = nut;
    setTestWorkingPlan(working);
    recomputeAveragesFromWorking(working);
  };

  // Helper function to calculate plan completion status
  const getPlanStatus = (plan: NutritionPlan) => {
    if (!plan.meals || !plan.meals.weekly_plan) {
      return { completion: 0, quality: 0, status: 'empty', label: 'Leeg' };
    }

    const weeklyPlan = plan.meals.weekly_plan;
    const days = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    const getOrderedMealKeys = (dayObj: any) => {
      const present = Object.keys(dayObj || {});
      const ordered = MEAL_KEYS_ORDER.filter(k => present.includes(k));
      const extras = present.filter(k => !MEAL_KEYS_ORDER.includes(k));
      return [...ordered, ...extras];
    };
    
    let totalMeals = 0;
    let filledMeals = 0;
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    days.forEach(day => {
      const dayObj: any = (weeklyPlan as any)[day] || {};
      getOrderedMealKeys(dayObj).forEach(meal => {
        totalMeals++;
        if (dayObj && dayObj[meal] && dayObj[meal].ingredients && dayObj[meal].ingredients.length > 0) {
          filledMeals++;
          // Use the new database structure - nutrition is directly in the meal object
          if (dayObj[meal].nutrition) {
            totalCalories += dayObj[meal].nutrition.calories || 0;
            totalProtein += dayObj[meal].nutrition.protein || 0;
            totalCarbs += dayObj[meal].nutrition.carbs || 0;
            totalFat += dayObj[meal].nutrition.fat || 0;
          }
        }
      });
    });
    const completion = Math.round((filledMeals / totalMeals) * 100);
    const avgCalories = totalCalories / 7; // Average per day
    const avgProtein = totalProtein / 7;
    const avgCarbs = totalCarbs / 7;
    const avgFat = totalFat / 7;

    // Calculate quality based on how close we are to targets
    let qualityScore = 0;
    if (plan.target_calories) {
      const calorieAccuracy = Math.max(0, 100 - Math.abs((avgCalories - plan.target_calories) / plan.target_calories * 100));
      qualityScore += calorieAccuracy * 0.4; // 40% weight for calories
    }
    if (plan.target_protein) {
      const proteinAccuracy = Math.max(0, 100 - Math.abs((avgProtein - plan.target_protein) / plan.target_protein * 100));
      qualityScore += proteinAccuracy * 0.2; // 20% weight for protein
    }
    if (plan.target_carbs) {
      const carbsAccuracy = Math.max(0, 100 - Math.abs((avgCarbs - plan.target_carbs) / plan.target_carbs * 100));
      qualityScore += carbsAccuracy * 0.2; // 20% weight for carbs
    }
    if (plan.target_fat) {
      const fatAccuracy = Math.max(0, 100 - Math.abs((avgFat - plan.target_fat) / plan.target_fat * 100));
      qualityScore += fatAccuracy * 0.2; // 20% weight for fat
    }

    const quality = Math.round(qualityScore);

    // Determine status
    let status = 'empty';
    let label = 'Leeg';
    let color = 'gray';

    if (completion === 0) {
      status = 'empty';
      label = 'Leeg';
      color = 'gray';
    } else if (completion < 25) {
      status = 'started';
      label = 'Gestart';
      color = 'red';
    } else if (completion < 75) {
      status = 'partial';
      label = 'Gedeeltelijk';
      color = 'yellow';
    } else if (completion < 100) {
      status = 'almost';
      label = 'Bijna klaar';
      color = 'blue';
    } else {
      status = 'complete';
      label = 'Volledig';
      color = 'green';
    }

    return { 
      completion, 
      quality, 
      status, 
      label, 
      color,
      avgCalories: Math.round(avgCalories),
      avgProtein: Math.round(avgProtein * 10) / 10,
      avgCarbs: Math.round(avgCarbs * 10) / 10,
      avgFat: Math.round(avgFat * 10) / 10
    };
  };

  // Fetch all data functions
  const fetchFoodItems = async () => {
    try {
      setIsLoadingFoodItems(true);
      console.log('🥗 Fetching nutrition ingredients from database...');
      
      const response = await fetch('/api/admin/nutrition-ingredients');
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error fetching nutrition ingredients:', result.error);
        return;
      }
      
      setFoodItems(result.ingredients || []);
      console.log('✅ Nutrition ingredients loaded:', result.ingredients?.length || 0);
    } catch (err) {
      console.error('❌ Exception fetching nutrition ingredients:', err);
    } finally {
      setIsLoadingFoodItems(false);
    }
  };


  const fetchPlans = async () => {
    try {
      console.log('📊 Fetching nutrition plans from database...');
      
      const response = await fetch('/api/admin/nutrition-plans');
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error fetching plans:', result.error);
        return;
      }
      
      console.log('✅ Raw plans response:', result);
      console.log('📋 Plans array:', result.plans);
      
      // Debug specific plans
      const carnivoorDroogtrainen = result.plans?.find((p: any) => p.plan_id === 'carnivoor-droogtrainen');
      const carnivoorOnderhoud = result.plans?.find((p: any) => p.plan_id === 'carnivoor-onderhoud');
      
      if (carnivoorDroogtrainen) {
        console.log('🥩 Carnivoor-droogtrainen plan found:');
        console.log('📊 Plan details:', carnivoorDroogtrainen);
        console.log('🍽️ Meals data:', carnivoorDroogtrainen.meals);
        
        if (carnivoorDroogtrainen.meals && carnivoorDroogtrainen.meals.weekly_plan) {
          console.log('📅 Weekly plan data:', carnivoorDroogtrainen.meals.weekly_plan);
          console.log('🗓️ Monday data:', carnivoorDroogtrainen.meals.weekly_plan.monday);
        } else {
          console.log('⚠️ No weekly_plan found in carnivoor-droogtrainen plan meals data');
        }
      } else {
        console.log('❌ Carnivoor-droogtrainen plan not found in response');
      }
      
      if (carnivoorOnderhoud) {
        console.log('🥩 Carnivoor-onderhoud plan found:');
        console.log('📊 Plan details:', carnivoorOnderhoud);
        console.log('🍽️ Meals data:', carnivoorOnderhoud.meals);
        
        if (carnivoorOnderhoud.meals && carnivoorOnderhoud.meals.weekly_plan) {
          console.log('📅 Weekly plan data:', carnivoorOnderhoud.meals.weekly_plan);
          console.log('🗓️ Monday data:', carnivoorOnderhoud.meals.weekly_plan.monday);
          console.log('🍳 Monday ontbijt:', carnivoorOnderhoud.meals.weekly_plan.monday?.ontbijt);
          console.log('🥓 Monday ontbijt ingredients:', carnivoorOnderhoud.meals.weekly_plan.monday?.ontbijt?.ingredients);
        } else {
          console.log('⚠️ No weekly_plan found in carnivoor-onderhoud plan meals data');
        }
      } else {
        console.log('❌ Carnivoor-onderhoud plan not found in response');
      }
      
      setPlans(result.plans || []);
      console.log('✅ Plans loaded:', result.plans?.length || 0);
    } catch (err) {
      console.error('❌ Exception fetching plans:', err);
    }
  };

  const fetchCustomPlans = async () => {
    try {
      setIsLoadingCustomPlans(true);
      console.log('🔍 Fetching custom nutrition plans from database...');
      
      const response = await fetch('/api/admin/custom-nutrition-plans');
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error fetching custom plans:', result.error);
        return;
      }
      
      console.log('✅ Custom plans loaded:', result.customPlans?.length || 0);
      setCustomPlans(result.customPlans || []);
    } catch (err) {
      console.error('❌ Exception fetching custom plans:', err);
    } finally {
      setIsLoadingCustomPlans(false);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch data sequentially to avoid race conditions
      await fetchPlans();
      await fetchFoodItems();
      await fetchCustomPlans();
    } catch (error) {
      console.error('❌ Error fetching all data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new empty plan immediately, then open editor (in-component scope)
  const handleCreateNewPlan = async () => {
    try {
      const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
      const name = `Nieuw plan ${stamp}`;
      const response = await fetch('/api/admin/nutrition-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: '' })
      });
      const result = await response.json();
      if (!response.ok || !result?.plan) {
        alert('Fout bij aanmaken nieuw plan: ' + (result?.error || response.statusText));
        return;
      }
      await fetchPlans();
      setSelectedPlan(result.plan);
      setEditMode(true);
      setActiveTab('voeding');
      console.log('✅ Nieuw plan aangemaakt:', result.plan.name);
    } catch (e: any) {
      console.error('❌ Fout bij aanmaken nieuw plan', e);
      alert('Fout bij aanmaken nieuw plan');
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Force data loading on component mount
  useEffect(() => {
    if (plans.length === 0 && foodItems.length === 0) {
      fetchAllData();
    }
  }, [plans.length, foodItems.length]);

  // Debug: Log current state
  useEffect(() => {
    console.log('🔍 Admin page state:', {
      plans: plans.length,
      foodItems: foodItems.length,
      isLoading
    });
  }, [plans.length, foodItems.length, isLoading]);

  // Force data loading on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (plans.length === 0 && foodItems.length === 0) {
        console.log('🔄 Force loading data...');
        fetchAllData();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Removed V2 cloning logic and tab

  // Emergency fallback - if after 3 seconds we still have no data, try direct API calls
  useEffect(() => {
    const emergencyTimer = setTimeout(async () => {
      if (plans.length === 0) {
        console.log('🚨 Emergency data loading...');
        try {
          const response = await fetch('/api/admin/nutrition-plans');
          const result = await response.json();
          if (result.success && result.plans) {
            setPlans(result.plans);
            console.log('✅ Emergency plans loaded:', result.plans.length);
          }
        } catch (error) {
          console.error('❌ Emergency plans fetch failed:', error);
        }
      }
      
      if (foodItems.length === 0) {
        try {
          const response = await fetch('/api/admin/nutrition-ingredients');
          const result = await response.json();
          if (result.success && result.ingredients) {
            setFoodItems(result.ingredients);
            console.log('✅ Emergency ingredients loaded:', result.ingredients.length);
          }
        } catch (error) {
          console.error('❌ Emergency ingredients fetch failed:', error);
        }
      }
    }, 3000);
    return () => clearTimeout(emergencyTimer);
  }, []);


  const handleSavePlan = async (planData: any) => {
    try {
      console.log('🔍 DEBUG: Starting handleSavePlan...');
      console.log('🔍 DEBUG: planData received:', planData);
      console.log('🔍 DEBUG: selectedPlan:', selectedPlan);
      
      const method = selectedPlan ? 'PUT' : 'POST';
      const url = '/api/admin/nutrition-plans';
      
      // Clean payload - remove invalid columns and only include valid database fields
      const { weekly_plan, created_at, updated_at, ...cleanPlanData } = planData;
      
      const payload = selectedPlan 
        ? { ...cleanPlanData, id: selectedPlan.id }
        : cleanPlanData;
        
      console.log('🔍 DEBUG: Method determined:', method);
      console.log('🔍 DEBUG: URL:', url);

      console.log('🔍 DEBUG: Saving plan with method:', method);
      console.log('🔍 DEBUG: Payload:', JSON.stringify(payload, null, 2));
      console.log('🔍 DEBUG: Selected plan ID:', selectedPlan?.id);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('🔍 DEBUG: Response status:', response.status);
      console.log('🔍 DEBUG: Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('🔍 DEBUG: Response body:', result);
      
      if (!response.ok) {
        console.error('❌ Error saving plan:', result.error);
        console.error('❌ Full error response:', result);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response statusText:', response.statusText);
        alert('Fout bij opslaan van plan: ' + (result.error || result.message || `HTTP ${response.status}: ${response.statusText}`));
        return;
      }

      console.log('✅ Plan saved successfully:', result);


      await fetchAllData();
      
      // Use a small delay to ensure state has updated, then find the updated plan
      setTimeout(() => {
        const updatedPlan = plans.find((p: any) => p.id === selectedPlan?.id);
        if (updatedPlan) {
          console.log('🔄 Keeping updated plan selected:', updatedPlan.name);
          setSelectedPlan(updatedPlan);
        } else {
          console.log('⚠️ Could not find updated plan, resetting selection');
          setSelectedPlan(null);
        }
      }, 100);
      
      // Keep edit mode open, just refresh the data
      
    } catch (error) {
      console.error('❌ Error saving plan:', error);
      console.error('❌ Error details:', error);
      alert('Fout bij opslaan van plan: ' + (error instanceof Error ? error.message : 'Onbekende fout'));
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Weet je zeker dat je dit voedingsplan wilt verwijderen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/nutrition-plans?id=${planId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error deleting plan:', result.error);
        alert('Fout bij verwijderen van plan: ' + (result.error || 'Onbekende fout'));
        return;
      }

      console.log('✅ Plan deleted successfully:', result);
      await fetchAllData();
      
    } catch (error) {
      console.error('❌ Error deleting plan:', error);
      alert('Fout bij verwijderen van plan');
    }
  };

  const handleEditPlan = async (plan: NutritionPlan) => {
    console.log('🔄 Opening plan for editing:', plan.name);
    // Ensure correct tab context is active based on plan_id
    try {
      // Always use the main 'voeding' tab; V2 is removed
      setActiveTab('voeding');
    } catch {}
    
    // Helper to recompute meal nutrition using ingredient list
    const computeMealNutritionLocal = (ings: Array<{ amount: number; unit?: string; calories_per_100g: number; protein_per_100g: number; carbs_per_100g: number; fat_per_100g: number; }>) => {
      let c = 0, p = 0, cb = 0, f = 0;
      for (const ing of (ings || [])) {
        const amt = Number(ing.amount) || 0;
        const unit = ing.unit || 'per_100g';
        let factor = 1;
        if (unit === 'per_100g' || unit === 'gram') factor = amt / 100;
        else if (unit === 'per_piece' || unit === 'stuks' || unit === 'stuk' || unit === 'per_blikje' || unit === 'per_sneedje') factor = amt;
        else if (unit === 'per_handful' || unit === 'handje' || unit === 'handjes') factor = amt;
        else if (unit === 'per_plakje' || unit === 'plakje' || unit === 'plakjes') factor = amt;
        else if (unit === 'per_30g') factor = amt * 0.3;
        else if (unit === 'per_100ml') factor = amt / 100;
        else if (unit === 'per_eetlepel_15g') factor = amt * 0.15;
        else factor = amt / 100;
        c += (ing.calories_per_100g || 0) * factor;
        p += (ing.protein_per_100g || 0) * factor;
        cb += (ing.carbs_per_100g || 0) * factor;
        f += (ing.fat_per_100g || 0) * factor;
      }
      return { calories: Math.round(c), protein: Math.round(p * 10) / 10, carbs: Math.round(cb * 10) / 10, fat: Math.round(f * 10) / 10 };
    };

    // Normalize plan ingredient units against current foodItems list
    const normalizePlanUnits = (pl: any) => {
      if (!pl?.meals?.weekly_plan) return pl;
      const days = ['maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag','zondag'];
      const getOrderedMealKeys = (dayObj: any) => {
        const present = Object.keys(dayObj || {});
        const ordered = MEAL_KEYS_ORDER.filter(k => present.includes(k));
        const extras = present.filter(k => !MEAL_KEYS_ORDER.includes(k));
        return [...ordered, ...extras];
      };
      const clone = JSON.parse(JSON.stringify(pl));
      for (const d of days) {
        const dayObj: any = clone.meals.weekly_plan[d] || {};
        for (const mk of getOrderedMealKeys(dayObj)) {
          const mealObj: any = dayObj[mk];
          if (!mealObj || !Array.isArray(mealObj.ingredients)) continue;
          mealObj.ingredients = mealObj.ingredients.map((ing: any) => {
            const found = foodItems.find(fi => String(fi.id) === String(ing.id));
            if (found && found.unit_type && ing.unit !== found.unit_type) {
              ing.unit = found.unit_type; // normalize unit
            }
            return ing;
          });
          // Recompute nutrition after normalization
          mealObj.nutrition = computeMealNutritionLocal(mealObj.ingredients);
        }
      }
      return clone;
    };

    // Load fresh data from the new API to ensure we have the latest
    try {
      const response = await fetch(`/api/admin/plan-meals?planId=${plan.id}`);
      const result = await response.json();
      
      if (result.success && result.plan) {
        console.log('✅ Fresh plan data loaded:', result.plan.name);
        const normalized = normalizePlanUnits(result.plan);
        setSelectedPlan(normalized);
        // Persist normalized meals silently
        try {
          await fetch('/api/admin/nutrition-plans', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: normalized.id, meals: normalized.meals })
          });
        } catch {}
      } else {
        console.log('⚠️ Using cached plan data:', plan.name);
        const normalized = normalizePlanUnits(plan);
        setSelectedPlan(normalized);
      }
    } catch (error) {
      console.error('❌ Error loading fresh plan data:', error);
      console.log('⚠️ Using cached plan data as fallback:', plan.name);
      const normalized = normalizePlanUnits(plan);
      setSelectedPlan(normalized);
    }
    
    setEditMode(true);
  };

  const handleBackToOverview = async () => {
    console.log('🔄 handleBackToOverview called');
    
    if (selectedPlan) {
      setSavingBeforeBack(true);
      console.log('💾 Persisting plan changes before going back...');
      try {
        // Only send updatable fields; backend merges correctly
        const { id, name, description, target_calories, target_protein, target_carbs, target_fat, protein_percentage, carbs_percentage, fat_percentage, goal, is_featured, is_public } = selectedPlan as any;
        const response = await fetch('/api/admin/nutrition-plans', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            name,
            description,
            target_calories,
            target_protein,
            target_carbs,
            target_fat,
            protein_percentage,
            carbs_percentage,
            fat_percentage,
            goal,
            is_featured,
            is_public,
          })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          console.error('❌ Failed to save plan on back:', result.error || response.statusText);
        } else {
          console.log('✅ Plan saved on back');
        }
      } catch (error) {
        console.error('❌ Error saving plan on back:', error);
      } finally {
        setSavingBeforeBack(false);
      }
    }
    
    setEditMode(false);
    setSelectedPlan(null);
    await fetchPlans();
  };


  const handleEditFoodItem = (foodItem: FoodItem) => {
    setSelectedFoodItem(foodItem);
    setShowFoodItemModal(true);
  };

  const handleSaveFoodItem = async (foodItemData: any) => {
    try {
      const method = selectedFoodItem ? 'PUT' : 'POST';
      const url = '/api/admin/nutrition-ingredients';
      
      const payload = selectedFoodItem 
        ? { ...foodItemData, id: selectedFoodItem.id }
        : foodItemData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error saving food item:', result.error);
        alert('Fout bij opslaan van ingrediënt: ' + (result.error || 'Onbekende fout'));
        return;
      }

      console.log('✅ Food item saved successfully:', result);
      await fetchFoodItems();
      setShowFoodItemModal(false);
      setSelectedFoodItem(null);
      
    } catch (error) {
      console.error('❌ Error saving food item:', error);
      alert('Fout bij opslaan van ingrediënt');
    }
  };

  const handleDeleteFoodItem = async (foodItemId: string) => {
    if (!confirm('Weet je zeker dat je dit ingrediënt wilt verwijderen?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting ingredient with ID:', foodItemId);
      
      const response = await fetch(`/api/admin/nutrition-ingredients?id=${foodItemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error deleting food item:', result.error);
        alert('Fout bij verwijderen van ingrediënt: ' + (result.error || 'Onbekende fout'));
        return;
      }

      console.log('✅ Food item deleted successfully:', result);
      await fetchFoodItems();
      
    } catch (error) {
      console.error('❌ Error deleting food item:', error);
      alert('Fout bij verwijderen van ingrediënt');
    }
  };

  const filteredPlans = plans
    .filter(plan => !String((plan as any).plan_id || '').endsWith('-v2'))
    .filter(plan =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // First sort by type: Carnivoor plans first, then normal meal plans
      const aIsCarnivore = a.name.toLowerCase().includes('carnivoor');
      const bIsCarnivore = b.name.toLowerCase().includes('carnivoor');
      
      if (aIsCarnivore && !bIsCarnivore) return -1;
      if (!aIsCarnivore && bIsCarnivore) return 1;
      
      // Within each type, sort by calories (low to high)
      return (a.target_calories || 0) - (b.target_calories || 0);
    });

  // Filtered V2 plans (copy of filteredPlans logic but only plans with plan_id ending in -v2)
  const filteredPlansV2 = plans
    .filter(plan => String((plan as any).plan_id || '').endsWith('-v2'))
    .filter(plan =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aIsCarnivore = a.name.toLowerCase().includes('carnivoor');
      const bIsCarnivore = b.name.toLowerCase().includes('carnivoor');
      if (aIsCarnivore && !bIsCarnivore) return -1;
      if (!aIsCarnivore && bIsCarnivore) return 1;
      return (a.target_calories || 0) - (b.target_calories || 0);
    });

  const filteredFoodItems = foodItems.filter(item => {
    // Text search filter
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Carnivore filter
    const matchesCarnivore = carnivoreFilter === 'all' || 
      (carnivoreFilter === 'yes' && (item as any).is_carnivore === true) ||
      (carnivoreFilter === 'no' && (item as any).is_carnivore !== true);
    
    return matchesSearch && matchesCarnivore;
  });


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Admin Voedingsplannen laden...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#181F17] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">
            Admin Voedingsplannen Beheer
          </h1>
          <p className="text-gray-300">
            Beheer voedingsplannen, ingrediënten en maaltijden voor het platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AdminStatsCard
            title="Voedingsplannen"
            value={plans.length.toString()}
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="blue"
          />
          <AdminStatsCard
            title="Ingrediënten"
            value={foodItems.length.toString()}
            icon={<BoltIcon className="w-6 h-6" />}
            color="green"
          />
          <AdminStatsCard
            title="Custom Plannen"
            value={customPlans.length.toString()}
            icon={<PencilIcon className="w-6 h-6" />}
            color="orange"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('voeding')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'voeding'
                ? 'bg-[#8BAE5A] text-[#181F17] font-semibold'
                : 'bg-[#232D1A] text-gray-300 hover:bg-[#2A3420]'
            }`}
          >
            Voedingsplannen
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'custom'
                ? 'bg-[#8BAE5A] text-[#181F17] font-semibold'
                : 'bg-[#232D1A] text-gray-300 hover:bg-[#2A3420]'
            }`}
          >
            Custom Plannen ({customPlans.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Zoeken naar ingrediënten, voedingsplannen, maaltijden..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-12 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:border-[#8BAE5A] focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 w-5 h-5 text-gray-400 hover:text-[#8BAE5A] transition-colors"
                  title="Wis zoekterm"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}

        {/* Removed Test profiel UI */}
          </div>
          
        </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-400">
              <span>
                Zoekresultaten voor: <span className="text-[#8BAE5A] font-medium">"{searchTerm}"</span>
              </span>
            </div>
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'voeding' && (
          <div>
            {editMode && selectedPlan ? (
              // Edit Mode - Show PlanBuilder integrated in content
              <div>
                {/* Back Button */}
                <div className="mb-6">
                  <button
                    onClick={handleBackToOverview}
                    disabled={savingBeforeBack}
                    className="flex items-center space-x-2 text-[#8BAE5A] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingBeforeBack ? (
                      <div className="w-5 h-5 border-2 border-[#8BAE5A] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    )}
                    <span>{savingBeforeBack ? 'Opslaan...' : 'Terug naar overzicht'}</span>
                  </button>
                </div>
                
                {/* PlanBuilder integrated in content */}
                <div className="bg-[#0F150E] rounded-xl border border-[#3A4D23]">
                  <PlanBuilder
                    plan={selectedPlan}
                    onSave={handleSavePlan}
                    onClose={handleBackToOverview}
                    onChange={(p:any)=> setSelectedPlan(p)}
                    isPageMode={true}
                  />
                </div>
              </div>
            ) : (
              // Overview Mode - Show plans list
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Voedingsplannen</h2>
                  <AdminButton
                    onClick={handleCreateNewPlan}
                    icon={<PlusIcon className="w-4 h-4" />}
                    variant="primary"
                  >
                    + Nieuw Plan
                  </AdminButton>
                </div>

            {filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">Geen voedingsplannen</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Maak je eerste voedingsplan aan om te beginnen.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {filteredPlans.map((plan) => {
                   const planStatus = getPlanStatus(plan);
                   return (
                   <div key={plan.id} className="bg-[#181F17] rounded-xl border border-[#3A4D23] overflow-hidden hover:border-[#8BAE5A]/50 transition-all duration-200 group">
                     {/* Header */}
                     <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#B6C948]/10 p-4 border-b border-[#3A4D23]">
                       <div className="flex items-start justify-between">
                         <div className="flex-1">
                           <h3 className="text-lg font-bold text-[#8BAE5A] mb-1">{plan.name}</h3>
                           <p className="text-gray-300 text-sm leading-relaxed">{plan.description}</p>
                         </div>
                       </div>
                     </div>
                     
                     {/* Profile Data */}
                     <div className="p-4 border-b border-[#3A4D23]">
                       <div className="bg-[#0F150E] rounded-lg p-3 border border-[#2A3520]">
                         <div className="flex items-center justify-center space-x-2">
                           <div className="w-2 h-2 bg-[#8BAE5A] rounded-full"></div>
                           <span className="text-xs text-[#8BAE5A] font-medium">Gebaseerd op profieldata</span>
                         </div>
                         <div className="text-xs text-[#B6C948] text-center mt-1">100kg - Staand (Matig actief)</div>
                       </div>
                     </div>
                     
                     {/* Nutrition Overview */}
                     {plan.target_calories && (
                       <div className="p-4">
                         <div className="space-y-3">
                           {/* Calories */}
                           <div className="text-center">
                             <div className="text-2xl font-bold text-white">{plan.target_calories}</div>
                             <div className="text-sm text-gray-400">kcal per dag</div>
                           </div>
                           
                           {/* Macros Grid */}
                           <div className="grid grid-cols-3 gap-3">
                             {plan.target_protein && (
                               <div className="text-center">
                                 <div className="text-lg font-semibold text-white">{plan.target_protein}g</div>
                                 <div className="text-xs text-[#8BAE5A] font-medium">
                                   {Math.round((plan.target_protein * 4 / plan.target_calories) * 100)}%
                                 </div>
                                 <div className="text-xs text-gray-400">Eiwit</div>
                               </div>
                             )}
                             {plan.target_carbs && (
                               <div className="text-center">
                                 <div className="text-lg font-semibold text-white">{plan.target_carbs}g</div>
                                 <div className="text-xs text-[#8BAE5A] font-medium">
                                   {Math.round((plan.target_carbs * 4 / plan.target_calories) * 100)}%
                                 </div>
                                 <div className="text-xs text-gray-400">Koolhydraten</div>
                               </div>
                             )}
                             {plan.target_fat && (
                               <div className="text-center">
                                 <div className="text-lg font-semibold text-white">{plan.target_fat}g</div>
                                 <div className="text-xs text-[#8BAE5A] font-medium">
                                   {Math.round((plan.target_fat * 9 / plan.target_calories) * 100)}%
                                 </div>
                                 <div className="text-xs text-gray-400">Vet</div>
                               </div>
                             )}
                           </div>

                         </div>
                       </div>
                     )}
                     
                     {/* Actions */}
                     <div className="p-4 bg-[#0F150E] border-t border-[#3A4D23]">
                       <div className="flex space-x-2">
                         <button
                           onClick={() => handleEditPlan(plan)}
                           className="flex-1 bg-[#8BAE5A] hover:bg-[#8BAE5A]/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                         >
                           <PencilIcon className="w-4 h-4" />
                           <span>Bewerken</span>
                         </button>
                         <button
                           onClick={() => plan.id && handleDeletePlan(plan.id)}
                           className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                         >
                           <TrashIcon className="w-4 h-4" />
                           <span>Verwijderen</span>
                         </button>
                       </div>
                     </div>
                   </div>
                   );
                 })}
              </div>
            )}
              </div>
            )}
          </div>
        )}

        {/* V2 tab and section removed */}

        {/* Custom Plans Tab */}
        {activeTab === 'custom' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Custom Plannen</h2>
              <p className="text-gray-300">
                Overzicht van alle aangepaste plannen die gebruikers hebben gemaakt
              </p>
            </div>

            {isLoadingCustomPlans ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
                <p className="text-gray-300">Custom plannen laden...</p>
              </div>
            ) : customPlans.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Geen custom plannen</h3>
                <p className="text-gray-400">
                  Er zijn nog geen aangepaste plannen gemaakt door gebruikers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customPlans.map((customPlan) => (
                  <div key={customPlan.id} className="bg-[#232D1A] rounded-lg border border-[#3A4D23] p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white mb-2">{customPlan.plan_name}</h3>
                      <p className="text-sm text-gray-400 mb-2">
                        Gebaseerd op: <span className="text-[#8BAE5A]">{customPlan.base_plan_id}</span>
                      </p>
                      <p className="text-sm text-gray-400">
                        Gebruiker: <span className="text-[#8BAE5A]">{customPlan.user_email || 'Onbekend'}</span>
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-1">Aangemaakt</div>
                      <div className="text-sm text-white">
                        {new Date(customPlan.created_at).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-1">Laatst bijgewerkt</div>
                      <div className="text-sm text-white">
                        {new Date(customPlan.updated_at).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          // TODO: Implement view custom plan functionality
                          console.log('View custom plan:', customPlan.id);
                        }}
                        className="flex-1 bg-[#8BAE5A] hover:bg-[#8BAE5A]/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Bekijken</span>
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Weet je zeker dat je dit custom plan wilt verwijderen?')) {
                            try {
                              const response = await fetch('/api/admin/custom-nutrition-plans', {
                                method: 'DELETE',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  customPlanId: customPlan.id
                                }),
                              });

                              if (response.ok) {
                                // Refresh custom plans
                                await fetchCustomPlans();
                                alert('Custom plan succesvol verwijderd!');
                              } else {
                                alert('Fout bij verwijderen van custom plan');
                              }
                            } catch (error) {
                              console.error('Error deleting custom plan:', error);
                              alert('Fout bij verwijderen van custom plan');
                            }
                          }
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Verwijderen</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}

        {showFoodItemModal && (
          <FoodItemModal
            isOpen={showFoodItemModal}
            foodItem={selectedFoodItem}
            onSave={async () => {
              console.log('🔄 Refreshing ingredient data after save...');
              await fetchFoodItems();
              setShowFoodItemModal(false);
              setSelectedFoodItem(null);
            }}
            onClose={() => {
              setShowFoodItemModal(false);
              setSelectedFoodItem(null);
            }}
          />
        )}

      </div>
    </div>
  );
}