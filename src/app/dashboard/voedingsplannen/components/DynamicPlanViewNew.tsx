"use client";

import { useState, useEffect } from 'react';
import { computeScaling20Targets } from '@/lib/nutrition/scaling20';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  PencilIcon,
  PlusIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';
import MealEditModal from './MealEditModal';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

// Function to map activity level to Dutch display text
function getActivityLevelDisplay(activityLevel: string): string {
  switch (activityLevel) {
    case 'sedentary':
      return 'Zittend (Licht actief)';
    case 'moderate':
      return 'Staand (Matig actief)';
    case 'very_active':
      return 'Lopend (Zeer actief)';
    default:
      return activityLevel;
  }
}

interface DynamicPlanViewProps {
  planId: string;
  planName: string;
  userId: string;
  onBack: () => void;
}

// Exact match with backend API structure
interface MealIngredient {
  name: string;
  unit: string;
  amount: number;
  originalAmount?: number; // Optional original amount for debug purposes
  adjustmentFactor?: number; // Smart scaling adjustment factor
  adjustmentReason?: string; // Reason for adjustment
}

interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  name: string;
  ingredients: MealIngredient[];
  nutrition: MealNutrition;
}

interface DayPlan {
  ontbijt: Meal;
  snack1: Meal;
  lunch: Meal;
  snack2: Meal;
  diner: Meal;
  avondsnack: Meal;
  dailyTotals: MealNutrition;
}

interface UserProfile {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  age: number;
  weight: number;
  height: number;
  goal: string;
  activityLevel?: string;
}

interface ScalingInfo {
  basePlanCalories: number;
  scaleFactor: number;
  targetCalories: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  planTargetCalories: number;
  debugInfo?: {
    originalTotals: any;
    targetTotals: any;
    macroAdjustments: any;
    ingredientAdjustments: any[];
  };
}

interface WeeklyAverages {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface PlanData {
  planId: string;
  planName: string;
  userProfile: UserProfile | null;
  scalingInfo: ScalingInfo | null;
  weekPlan: Record<string, DayPlan>;
  weeklyAverages: WeeklyAverages;
  generatedAt: string;
  // New plan-specific macro data
  planPercentages?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  planTargets?: {
    target_calories: number;
    target_protein: number;
    target_carbs: number;
    target_fat: number;
  };
}

const DAYS_NL = {
  maandag: 'Maandag',
  dinsdag: 'Dinsdag', 
  woensdag: 'Woensdag',
  donderdag: 'Donderdag',
  vrijdag: 'Vrijdag',
  zaterdag: 'Zaterdag',
  zondag: 'Zondag'
};

const MEAL_TYPES_NL = {
  ontbijt: 'Ontbijt',
  snack1: 'Ochtend Snack',
  lunch: 'Lunch',
  snack2: 'Lunch Snack',
  diner: 'Diner',
  avondsnack: 'Avond Snack'
};

const MEAL_NAMES = {
  ontbijt: 'Ontbijt',
  snack1: 'Ochtend Snack',
  lunch: 'Lunch',
  snack2: 'Lunch Snack',
  diner: 'Diner',
  avondsnack: 'Avond Snack'
};

const MEAL_ORDER = ['ontbijt', 'snack1', 'lunch', 'snack2', 'diner', 'avondsnack'];

export default function DynamicPlanViewNew({ planId, planName, userId, onBack }: DynamicPlanViewProps) {
  const NEW_SCALING = true; // use V3 simple scaling in locked view
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('maandag');
  const [editingMeal, setEditingMeal] = useState<{day: string, meal: string} | null>(null);
  const [customPlanData, setCustomPlanData] = useState<PlanData | null>(null);
  const [modifiedMeals, setModifiedMeals] = useState<Set<string>>(new Set());
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [isStickyActive, setIsStickyActive] = useState(false);
  const [smartScalingEnabled, setSmartScalingEnabled] = useState(true);
  // Scaling 2.0: pull user weight and apply client-side scaling
  const [userWeightKg, setUserWeightKg] = useState<number>(100);
  const baseWeightKg = 100; // baseline plans are designed for 100kg
  
  const { isAdmin } = useSupabaseAuth();

  // Ingredient database - loaded from API (must be declared before usage below)
  const [ingredientDatabase, setIngredientDatabase] = useState<any>({});

  // Load ingredient database from API
  useEffect(() => {
    const loadIngredientDatabase = async () => {
      try {
        // Add cache-busting parameter
        const response = await fetch(`/api/nutrition-ingredients?t=${Date.now()}`);
        const data = await response.json();
        if (data.success && data.ingredients) {
          setIngredientDatabase(data.ingredients);
          console.log('✅ Loaded ingredient database:', Object.keys(data.ingredients).length, 'ingredients');
          if (data.lastUpdated) {
            console.log('📅 Ingredients last updated:', new Date(data.lastUpdated).toISOString());
          }
        }
      } catch (error) {
        console.error('❌ Error loading ingredient database:', error);
      }
    };

    loadIngredientDatabase();
  }, []);

  // Scroll detection for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentPlanDataElement = document.getElementById('current-plan-data-original');
      if (currentPlanDataElement) {
        const rect = currentPlanDataElement.getBoundingClientRect();
        const isScrolledPast = rect.bottom < 100; // 100px threshold
        console.log('Scroll debug:', { 
          bottom: rect.bottom, 
          isScrolledPast, 
          isStickyActive 
        });
        setIsStickyActive(isScrolledPast);
      }
    };

    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user profile to get weight for Scaling 2.0
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/nutrition-profile?userId=${userId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const w = Number(json?.profile?.weight || 100);
        if (w && !Number.isNaN(w)) setUserWeightKg(w);
      } catch (e) { /* ignore */ }
    };
    loadProfile();
  }, [userId]);

  // Helper: round by unit category
  const roundAmountByUnit = (unit: string, amount: number) => {
    if (unit === 'per_piece' || unit === 'per_plakje' || unit === 'stuk' || unit === 'handje') return Math.max(0, Math.round(amount));
    if (unit === 'g') return Math.round(amount); // grams integer
    if (unit === 'per_100g') return Math.round(amount * 10) / 10; // 0.1 x 100g = 10g steps
    if (unit === 'per_ml') return Math.round(amount); // ml integer
    return Math.round(amount * 10) / 10;
  };

  // V3-style helpers
  const isPieceUnit = (u?: string) => {
    const unit = String(u || '').toLowerCase();
    return ['per_piece','piece','pieces','per_stuk','stuk','stuks','per_plakje','plakje','plakjes','plak','per_plak','sneetje','per_sneetje','handje','per_handful'].includes(unit);
  };
  const gramsPerUnit = (ing: any) => {
    const u = String(ing.unit || '').toLowerCase();
    if (['per_100g','g','gram'].includes(u)) return 100;
    if (['per_ml','ml'].includes(u)) return 100;
    if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(u)) return 15;
    if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(u)) return 5;
    if (['per_cup','cup','kop'].includes(u)) return 240;
    if (['per_30g'].includes(u)) return 30;
    const w = Number(ing.unit_weight_g ?? ing.grams_per_unit ?? ing.weight_per_unit ?? ing.per_piece_grams ?? ing.slice_weight_g ?? ing.plakje_gram ?? ing.unit_weight) || 0;
    return w > 0 ? w : 100;
  };
  const macroPerUnit = (ing: any) => {
    const name = String(ing?.name || '');
    const db = ingredientDatabase?.[name] || {};
    return {
      cal: Number(ing.calories_per_100g ?? db.calories_per_100g ?? 0),
      p: Number(ing.protein_per_100g ?? db.protein_per_100g ?? 0),
      c: Number(ing.carbs_per_100g ?? db.carbs_per_100g ?? 0),
      f: Number(ing.fat_per_100g ?? db.fat_per_100g ?? 0),
    };
  };
  const roundAmount = (ing: any, amount: number) => roundAmountByUnit(String(ing.unit||'per_100g'), amount);
  // Display label for units
  const unitLabel = (u?: string) => {
    const unit = String(u || '').toLowerCase();
    if (unit === 'per_100g' || unit === 'g' || unit === 'gram') return 'g';
    if (unit === 'per_ml' || unit === 'ml') return 'ml';
    if (unit === 'per_piece' || unit === 'stuk' || unit === 'pieces') return 'stuk';
    if (unit === 'per_plakje' || unit === 'plakje') return 'plakje';
    if (['per_tbsp','tbsp','eetlepel','el','per_eetlepel'].includes(unit)) return 'eetlepel';
    if (['per_tsp','tsp','theelepel','tl','per_theelepel'].includes(unit)) return 'theelepel';
    if (['per_cup','cup','kop'].includes(unit)) return 'kop';
    return unit || '-';
  };

  // Compute day targets from original totals preserving macro ratios, then scale by factor
  const computeDayTargets = (dayKey: string, sourcePlan: any) => {
    const day = sourcePlan?.meals?.weekly_plan?.[dayKey];
    if (!day) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'].forEach(mt => {
      const m = day?.[mt];
      const t = m?.totals || m?.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 };
      totals.calories += t.calories || 0; totals.protein += t.protein || 0; totals.carbs += t.carbs || 0; totals.fat += t.fat || 0;
    });
    const baseKcal = Math.max(1, Math.round(totals.calories));
    const input = {
      baseKcal,
      baseProteinG: Math.max(0, totals.protein),
      baseCarbsG: Math.max(0, totals.carbs),
      baseFatG: Math.max(0, totals.fat),
      baseWeightKg,
      userWeightKg,
    };
    const s = computeScaling20Targets(input);
    return { calories: s.kcal, protein: s.proteinG, carbs: s.carbsG, fat: s.fatG };
  };

  // Apply Scaling 2.0 to the in-memory plan (client-only)
  const applyScaling20 = (original: any) => {
    if (!original || !original.meals?.weekly_plan) return null;
    const factor = baseWeightKg > 0 ? (userWeightKg / baseWeightKg) : 1;
    const week = JSON.parse(JSON.stringify(original.meals.weekly_plan));

    const adjusterPref = {
      protein: ['Whey Shake','Magere Kwark','Kipfilet'],
      carbs: ['Basmati Rijst','Rijstwafel','Havermout'],
      fat: ['Olijfolie','Roomboter','Amandelen']
    };

    const mealKeys = ['ontbijt','ochtend_snack','lunch','lunch_snack','diner','avond_snack'];

    const adjustByName = (dayObj: any, name: string, deltaG: number) => {
      for (const mk of mealKeys) {
        const meal = dayObj?.[mk];
        if (!meal?.ingredients) continue;
        const idx = meal.ingredients.findIndex((ing: any) => ing.name === name);
        if (idx === -1) continue;
        const ing = meal.ingredients[idx];
        const unit = ing.unit || 'per_100g';
        if (unit === 'per_piece' || unit === 'per_plakje' || unit === 'stuk' || unit === 'handje') {
          // change by 1 piece if significant
          const step = deltaG > 0 ? 1 : -1;
          const newAmt = Math.max(0, (ing.amount || 0) + step);
          ing.amount = roundAmountByUnit(unit, newAmt);
          return true;
        }
        // grams-based
        const newAmt = (unit === 'per_100g') ? (ing.amount || 0) + (deltaG / 100) : (ing.amount || 0) + deltaG; // per_100g uses units = 100g
        ing.amount = roundAmountByUnit(unit, newAmt);
        return true;
      }
      return false;
    };

    const days = Object.keys(week);
    for (const day of days) {
      const dayObj = week[day];
      // 1) initial scale
      for (const mk of mealKeys) {
        const meal = dayObj?.[mk];
        if (!meal?.ingredients) continue;
        meal.ingredients.forEach((ing: any) => {
          const unit = ing.unit || 'per_100g';
          const scaled = unit === 'per_piece' || unit === 'per_plakje' || unit === 'stuk' || unit === 'handje'
            ? Math.max(0, Math.round((ing.amount || 0) * factor))
            : (ing.amount || 0) * factor;
          ing.originalAmount = ing.originalAmount ?? ing.amount;
          ing.amount = roundAmountByUnit(unit, scaled);
        });
      }

      // 2) compute targets and current totals
      const targets = computeDayTargets(day, { meals: { weekly_plan: week } });
      const totalsNow = ((): { calories:number; protein:number; carbs:number; fat:number } => {
        let t = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        for (const mk of mealKeys) {
          const meal = dayObj?.[mk];
          if (!meal?.ingredients) continue;
          let m = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          meal.ingredients.forEach((ing: any) => {
            const n = calculateIngredientNutrition(ing);
            m.calories += n.calories; m.protein += n.protein; m.carbs += n.carbs; m.fat += n.fat;
          });
          meal.nutrition = m;
          t.calories += m.calories; t.protein += m.protein; t.carbs += m.carbs; t.fat += m.fat;
        }
        return { calories: Math.round(t.calories), protein: Math.round(t.protein), carbs: Math.round(t.carbs), fat: Math.round(t.fat) };
      })();

      // 3) simple compensation loop using adjusters (small steps)
      const maxSteps = 20;
      let steps = 0;
      const within = (cur:number, tgt:number, tolPct=5) => (Math.abs((cur/tgt)*100 - 100) <= tolPct);
      while (steps < maxSteps && (
        !(within(totalsNow.calories, targets.calories)) ||
        !(within(totalsNow.protein, targets.protein)) ||
        !(within(totalsNow.carbs, targets.carbs)) ||
        !(within(totalsNow.fat, targets.fat))
      )) {
        steps++;
        // decide which macro to fix first by largest deviation
        const deviations = [
          { key: 'protein', cur: totalsNow.protein, tgt: targets.protein },
          { key: 'carbs', cur: totalsNow.carbs, tgt: targets.carbs },
          { key: 'fat', cur: totalsNow.fat, tgt: targets.fat },
        ].sort((a,b)=> Math.abs((b.cur/b.tgt)-1) - Math.abs((a.cur/a.tgt)-1));
        const top = deviations[0];
        const dir = top.cur < top.tgt ? 1 : -1;
        const stepG = top.key === 'fat' ? 3 : 10; // small nudge
        let adjusted = false;
        for (const name of adjusterPref[top.key as 'protein'|'carbs'|'fat']) {
          adjusted = adjustByName(dayObj, name, dir * stepG);
          if (adjusted) break;
        }
        if (!adjusted) break; // cannot adjust
        // recompute totalsNow
        let t = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        for (const mk of mealKeys) {
          const meal = dayObj?.[mk];
          if (!meal?.ingredients) continue;
          let m = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          meal.ingredients.forEach((ing: any) => {
            const n = calculateIngredientNutrition(ing);
            m.calories += n.calories; m.protein += n.protein; m.carbs += n.carbs; m.fat += n.fat;
          });
          meal.nutrition = m;
          t.calories += m.calories; t.protein += m.protein; t.carbs += m.carbs; t.fat += m.fat;
        }
        totalsNow.calories = Math.round(t.calories);
        totalsNow.protein = Math.round(t.protein);
        totalsNow.carbs = Math.round(t.carbs);
        totalsNow.fat = Math.round(t.fat);
      }

      // save dailyTotals
      dayObj.dailyTotals = {
        calories: Math.round(totalsNow.calories),
        protein: Math.round(totalsNow.protein),
        carbs: Math.round(totalsNow.carbs),
        fat: Math.round(totalsNow.fat)
      };
    }

    return week;
  };

  // When original plan, ingredients and profile are ready, apply NEW V3 scaling
  useEffect(() => {
    if (!NEW_SCALING) return;
    if (!planData?.weekPlan || !ingredientDatabase || !userWeightKg) return;
    const factor = baseWeightKg > 0 ? (userWeightKg / baseWeightKg) : 1;
    const copy = JSON.parse(JSON.stringify(planData.weekPlan));
    const mealTypes = ['ontbijt','snack1','lunch','snack2','diner','avondsnack'];
    const computeTotals = (dayObj: any) => {
      let t = { cal:0,p:0,c:0,f:0 } as any;
      mealTypes.forEach(mt => {
        const meal = dayObj?.[mt];
        if (!meal?.ingredients) return;
        meal.ingredients.forEach((ing:any)=>{
          const units = isPieceUnit(ing.unit) ? (Number(ing.amount||0)) : (Number(ing.amount||0) / Math.max(1, gramsPerUnit(ing)));
          const per = macroPerUnit(ing);
          t.cal += per.cal * units; t.p += per.p * units; t.c += per.c * units; t.f += per.f * units;
        });
      });
      return t;
    };
    const deriveTargets = (dayKey: string) => {
      const src = { meals: { weekly_plan: copy } } as any;
      // reuse computeScaling20Targets would deviate; instead sum baseline of original planData then scale by factor
      const dayOrig = planData?.weekPlan?.[dayKey];
      if (!dayOrig) return { cal:0,p:0,c:0,f:0 };
      let t = { cal:0,p:0,c:0,f:0 } as any;
      mealTypes.forEach(mt => {
        const meal = dayOrig?.[mt];
        if (!meal) return;
        if (meal.nutrition) {
          t.cal += Number(meal.nutrition.calories)||0;
          t.p   += Number(meal.nutrition.protein)||0;
          t.c   += Number(meal.nutrition.carbs)||0;
          t.f   += Number(meal.nutrition.fat)||0;
        } else if (Array.isArray(meal.ingredients)) {
          meal.ingredients.forEach((ing:any)=>{
            const units = isPieceUnit(ing.unit) ? (Number(ing.amount||0)) : (Number(ing.amount||0) / Math.max(1, gramsPerUnit(ing)));
            const per = macroPerUnit(ing);
            t.cal += per.cal * units; t.p += per.p * units; t.c += per.c * units; t.f += per.f * units;
          });
        }
      });
      return { cal: Math.round(t.cal*factor), p: Math.round(t.p*factor), c: Math.round(t.c*factor), f: Math.round(t.f*factor) };
    };
    Object.keys(copy || {}).forEach((dayKey:string)=>{
      const day = copy[dayKey];
      if (!day) return;
      // 1) initial scale: only non-piece units by factor
      mealTypes.forEach(mt=>{
        const meal = day?.[mt]; if (!meal?.ingredients) return;
        meal.ingredients.forEach((ing:any)=>{
          if (typeof ing.amount !== 'number') return;
          if (isPieceUnit(ing.unit)) return; // keep pieces
          let next = Number(ing.amount||0) * factor;
          next = roundAmount(ing, next);
          ing.amount = next;
        });
      });
      const tgt = deriveTargets(dayKey);
      let totals = computeTotals(day);
      // 2) surplus reduce evenly by kcal/unit
      let surplus = Math.max(0, Math.round(totals.cal) - tgt.cal);
      if (surplus > 5) {
        const mealAdj = mealTypes.map(mt=>{
          const meal = day?.[mt]; if (!meal?.ingredients) return { mt, kcal: 0 };
          let kcal = 0; meal.ingredients.forEach((ing:any)=>{ if (isPieceUnit(ing.unit)) return; const per=macroPerUnit(ing); const perK = per.p*4+per.c*4+per.f*9; kcal += perK * (Number(ing.amount||0)/Math.max(1,gramsPerUnit(ing))); });
          return { mt, kcal };
        });
        const sum = mealAdj.reduce((a,b)=>a+(b.kcal||0),0);
        if (sum>0){
          mealAdj.forEach(entry=>{
            if (!entry.kcal) return; const meal = day?.[entry.mt]; if (!meal?.ingredients) return;
            let remaining = surplus * (entry.kcal/sum);
            const adjustable = meal.ingredients.filter((ing:any)=>!isPieceUnit(ing.unit));
            const perKs = adjustable.map((ing:any)=>{ const per=macroPerUnit(ing); return per.p*4+per.c*4+per.f*9; });
            const sPK = perKs.reduce((a:number,b:number)=>a+b,0);
            adjustable.forEach((ing:any,idx:number)=>{
              if (remaining<=0) return; const perK = perKs[idx]||0; if (perK<=0) return;
              const portion = sPK>0 ? perK/sPK : 0; const reduceK = remaining*portion;
              const deltaUnits = reduceK/perK; let next = Math.max(0, Number(ing.amount||0) - deltaUnits*gramsPerUnit(ing));
              next = roundAmount(ing, next);
              remaining -= Math.max(0, (Number(ing.amount||0)-next))/Math.max(1,gramsPerUnit(ing))*perK;
              ing.amount = next;
            });
          });
          totals = computeTotals(day);
        }
      }
      // 3) deficit fill evenly
      const deficit = Math.max(0, tgt.cal - Math.round(totals.cal));
      if (deficit > 5) {
        const mealAdj = mealTypes.map(mt=>{
          const meal = day?.[mt]; if (!meal?.ingredients) return { mt, kcal: 0 };
          let kcal = 0; meal.ingredients.forEach((ing:any)=>{ if (isPieceUnit(ing.unit)) return; const per=macroPerUnit(ing); const perK = per.p*4+per.c*4+per.f*9; kcal += perK * (Number(ing.amount||0)/Math.max(1,gramsPerUnit(ing))); });
          return { mt, kcal };
        });
        const sum = mealAdj.reduce((a,b)=>a+(b.kcal||0),0);
        if (sum>0){
          mealAdj.forEach(entry=>{
            if (!entry.kcal) return; const meal = day?.[entry.mt]; if (!meal?.ingredients) return;
            let remaining = deficit * (entry.kcal/sum);
            const adjustable = meal.ingredients.filter((ing:any)=>!isPieceUnit(ing.unit));
            const perKs = adjustable.map((ing:any)=>{ const per=macroPerUnit(ing); return per.p*4+per.c*4+per.f*9; });
            const sPK = perKs.reduce((a:number,b:number)=>a+b,0);
            adjustable.forEach((ing:any,idx:number)=>{
              if (remaining<=0) return; const perK = perKs[idx]||0; if (perK<=0) return;
              const portion = sPK>0 ? perK/sPK : 0; const addK = remaining*portion;
              const deltaUnits = addK/perK; let next = Number(ing.amount||0) + deltaUnits*gramsPerUnit(ing);
              next = roundAmount(ing, next);
              remaining -= Math.max(0, (next-Number(ing.amount||0)))/Math.max(1,gramsPerUnit(ing))*perK;
              ing.amount = next;
            });
          });
        }
      }
      // 4) write per-meal nutrition and dailyTotals for UI
      let dayTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 } as any;
      mealTypes.forEach(mt => {
        const meal = day?.[mt];
        if (!meal?.ingredients) return;
        let m = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        meal.ingredients.forEach((ing:any)=>{
          const n = calculateIngredientNutrition(ing);
          m.calories += n.calories; m.protein += n.protein; m.carbs += n.carbs; m.fat += n.fat;
        });
        meal.nutrition = {
          calories: Math.round(m.calories),
          protein: Math.round(m.protein*10)/10,
          carbs: Math.round(m.carbs*10)/10,
          fat: Math.round(m.fat*10)/10,
        };
        dayTotals.calories += meal.nutrition.calories;
        dayTotals.protein  += meal.nutrition.protein;
        dayTotals.carbs    += meal.nutrition.carbs;
        dayTotals.fat      += meal.nutrition.fat;
      });
      day.dailyTotals = {
        calories: Math.round(dayTotals.calories),
        protein: Math.round(dayTotals.protein),
        carbs: Math.round(dayTotals.carbs),
        fat: Math.round(dayTotals.fat),
      };
    });
    setPlanData(prev => prev ? ({ ...prev, weekPlan: copy }) : prev);
  }, [NEW_SCALING, planData?.weekPlan, ingredientDatabase, userWeightKg]);

  // Fetch dynamic plan data
  const fetchDynamicPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use original plan (no scaling) to show 1:1 backend data
      const apiEndpoint = `/api/nutrition-plan-original?planId=${planId}`;
      
      console.log('🧠 Using API endpoint:', apiEndpoint);
      
      const response = await fetch(apiEndpoint);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dynamic plan');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Handle original plan data (1:1 from backend, no scaling)
        const originalPlan = data.plan;
        
        // Convert backend structure to frontend expected format
        const planData = {
          planId: planId,
          planName: planName,
          weekPlan: originalPlan.meals.weekly_plan, // Original backend structure
          scalingInfo: null, // No scaling applied
          userProfile: null, // No user-specific data
          weeklyAverages: {
            calories: 0, // Will be calculated from original data
            protein: 0,
            carbs: 0,
            fat: 0
          },
          generatedAt: new Date().toISOString()
        };
        
        console.log('📋 Original plan loaded (1:1 from backend):', planData);
        setPlanData(planData);
      } else {
        throw new Error(data.error || 'Failed to load original plan');
      }
      
    } catch (error) {
      console.error('❌ Error fetching dynamic plan:', error);
      setError(`Kon voedingsplan niet laden: ${error.message}`);
      toast.error('Fout bij laden voedingsplan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    if (planId && userId && userId !== 'anonymous') {
      fetchDynamicPlan();
    }
  }, [planId, userId, smartScalingEnabled]);

  const handleEditMeal = (day: string, mealType: string) => {
    // Create custom plan data if it doesn't exist yet
    if (!customPlanData && planData) {
      console.log('🔄 Creating custom plan from base plan');
      setCustomPlanData({ ...planData });
    }
    
    setEditingMeal({ day, meal: mealType });
    console.log('✏️ Editing meal:', { day, meal: mealType });
  };

  const handleSaveMeal = async (ingredients: MealIngredient[]) => {
    if (!editingMeal || !customPlanData) return;

    try {
      // Use existing custom plan data
      let currentCustomData = { ...customPlanData };
      
      // Update the specific meal with new ingredients
      if (!currentCustomData.weekPlan?.[editingMeal.day]) {
        if (!currentCustomData.weekPlan) currentCustomData.weekPlan = {};
        currentCustomData.weekPlan[editingMeal.day] = {
          ontbijt: { name: 'Ontbijt', ingredients: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
          snack1: { name: 'Ochtend Snack', ingredients: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
          lunch: { name: 'Lunch', ingredients: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
          snack2: { name: 'Lunch Snack', ingredients: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
          diner: { name: 'Diner', ingredients: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
          avondsnack: { name: 'Avond Snack', ingredients: [], nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
          dailyTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
        };
      }

      // Calculate nutrition for the meal
      const nutrition = calculateMealNutrition(ingredients);
      
      // Update the meal
      if (!currentCustomData.weekPlan) currentCustomData.weekPlan = {};
      currentCustomData.weekPlan[editingMeal.day][editingMeal.meal as keyof DayPlan] = {
        name: MEAL_TYPES_NL[editingMeal.meal as keyof typeof MEAL_TYPES_NL],
        ingredients,
        nutrition,
        ...nutrition
      };

      // Recalculate daily totals
      if (!currentCustomData.weekPlan) currentCustomData.weekPlan = {};
      currentCustomData.weekPlan[editingMeal.day].dailyTotals = calculateDailyTotals(currentCustomData.weekPlan[editingMeal.day]);

      // Update state
      setCustomPlanData(currentCustomData);
      setEditingMeal(null);

      // Save to database
      await saveCustomPlan(currentCustomData);

      toast.success('Maaltijd opgeslagen!');
    } catch (error) {
      console.error('❌ Error saving meal:', error);
      toast.error('Fout bij opslaan maaltijd');
    }
  };

  const calculateMealNutrition = (ingredients: MealIngredient[]) => {
    return ingredients.reduce((total, ingredient) => {
      const nutrition = calculateIngredientNutrition(ingredient);
      return {
        calories: total.calories + nutrition.calories,
        protein: total.protein + nutrition.protein,
        carbs: total.carbs + nutrition.carbs,
        fat: total.fat + nutrition.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const calculateDailyTotals = (dayPlan: DayPlan) => {
    const meals = [dayPlan.ontbijt, dayPlan.snack1, dayPlan.lunch, dayPlan.snack2, dayPlan.diner, dayPlan.avondsnack];
    return meals.reduce((total, meal) => ({
      calories: total.calories + meal.nutrition.calories,
      protein: total.protein + meal.nutrition.protein,
      carbs: total.carbs + meal.nutrition.carbs,
      fat: total.fat + meal.nutrition.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  // Check if a meal is back to its original state
  const checkIfMealIsBackToOriginal = (day: string, mealType: string, currentPlanData: PlanData) => {
    if (!planData) return false;
    
    const currentMeal = currentPlanData.weekPlan?.[day]?.[mealType];
    const originalMeal = planData.weekPlan?.[day]?.[mealType];
    
    if (!currentMeal || !originalMeal || !currentMeal.ingredients || !originalMeal.ingredients) {
      return false;
    }
    
    // Check if all ingredients match original amounts
    return currentMeal.ingredients.every((currentIngredient, index) => {
      const originalIngredient = originalMeal.ingredients[index];
      if (!originalIngredient) return false;
      
      return currentIngredient.amount === originalIngredient.amount &&
             currentIngredient.unit === originalIngredient.unit &&
             currentIngredient.name === originalIngredient.name;
    });
  };

  // Check if a specific meal has been modified
  const isMealModified = (day: string, mealType: string) => {
    const mealKey = `${day}-${mealType}`;
    return modifiedMeals.has(mealKey);
  };

  const saveCustomPlan = async (customData: PlanData) => {
    try {
      // Check if there are still modifications after potential reversions
      const hasModifications = modifiedMeals.size > 0;
      
      if (!hasModifications) {
        console.log('ℹ️ No modifications detected, skipping custom plan save');
        return;
      }

      console.log('💾 Saving custom plan with modifications:', modifiedMeals.size);
      
      const response = await fetch('/api/custom-nutrition-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          basePlanId: planId,
          customPlanData: customData,
          planName: `${planName} (Aangepast)`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save custom plan');
      }

      const result = await response.json();
      console.log('✅ Custom plan saved:', result);
      
      // Clear modified meals after successful save
      setModifiedMeals(new Set());
    } catch (error) {
      console.error('❌ Error saving custom plan:', error);
      throw error;
    }
  };

  const resetToOriginalPlan = async () => {
    try {
      // Delete custom plan from user_nutrition_plans table
      const response = await fetch('/api/nutrition-plan-save', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planId: planId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete custom plan');
      }

      // Reset local state
      setCustomPlanData(null);
      setModifiedMeals(new Set());
      
      // Reload the plan to get the original version
      await fetchDynamicPlan();
      
      toast.success('Plan gereset naar origineel!');
      console.log('✅ Plan reset to original');
    } catch (error) {
      console.error('❌ Error resetting plan:', error);
      toast.error('Fout bij resetten van plan');
    }
  };

  const selectThisPlan = async () => {
    try {
      // Get current plan data (either custom or original)
      const currentPlanData = customPlanData || planData;
      
      if (!currentPlanData) {
        toast.error('Geen plan data beschikbaar');
        return;
      }

      console.log('💾 Saving and selecting plan:', { 
        hasModifications: modifiedMeals.size > 0, 
        hasCustomData: !!customPlanData,
        planId 
      });

      // Save this plan as active for the user (this will store in user_nutrition_plans)
      const response = await fetch('/api/nutrition-plan-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planId: planId,
          customizedPlan: currentPlanData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to select plan');
      }

      const result = await response.json();
      console.log('✅ Plan selected and saved successfully:', result);
      
      toast.success('Plan geselecteerd en opgeslagen!');
      
      // Navigate back to overview
      onBack();
      
    } catch (error) {
      console.error('❌ Error selecting plan:', error);
      toast.error('Fout bij selecteren van plan: ' + error.message);
    }
  };


  // Format unit display for better readability
  const formatUnitDisplay = (unit: string) => {
    switch (unit) {
      case 'per_100g': return 'g';
      case 'per_piece': return 'stuk';
      case 'per_ml': return 'ml';
      case 'per_tbsp': return 'eetlepel';
      case 'per_tsp': return 'theelepel';
      case 'per_cup': return 'kop';
      default: return unit;
    }
  };

  

  // Calculate nutrition for a single ingredient based on amount and unit
  const calculateIngredientNutrition = (ingredient: any) => {
    const amount = ingredient.amount || 0;
    const name = ingredient.name || '';

    // Prefer macro values embedded in the plan ingredient (backend-leading)
    const embed = {
      calories_per_100g: ingredient.calories_per_100g,
      protein_per_100g: ingredient.protein_per_100g,
      carbs_per_100g: ingredient.carbs_per_100g,
      fat_per_100g: ingredient.fat_per_100g,
      unit_type: ingredient.unit
    };

    // Fallback to ingredient database by name
    const db = ingredientDatabase[name];
    if (!db && (embed.calories_per_100g == null)) {
      console.warn(`⚠️ Nutrition data not found for ingredient: ${name}`);
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const nutritionData = {
      calories_per_100g: embed.calories_per_100g ?? db?.calories_per_100g ?? 0,
      protein_per_100g: embed.protein_per_100g ?? db?.protein_per_100g ?? 0,
      carbs_per_100g: embed.carbs_per_100g ?? db?.carbs_per_100g ?? 0,
      fat_per_100g: embed.fat_per_100g ?? db?.fat_per_100g ?? 0,
      unit_type: embed.unit_type ?? db?.unit_type ?? 'per_100g'
    };

    // Use ingredient.unit if present, else database unit_type
    const unit = ingredient.unit || nutritionData.unit_type || 'per_100g';

    // Convert based on unit type
    let multiplier = 1;
    switch (unit) {
      case 'per_100g':
        multiplier = amount / 100;
        break;
      case 'per_piece':
      case 'stuk':
        multiplier = amount; // For pieces, use amount directly
        break;
      case 'per_plakje':
        multiplier = amount; // For slices, use amount directly
        break;
      case 'per_ml':
        multiplier = amount / 100; // Assuming 1ml = 1g for liquids
        break;
      case 'per_tbsp':
        multiplier = (amount * 15) / 100; // 1 tbsp = 15ml
        break;
      case 'per_tsp':
        multiplier = (amount * 5) / 100; // 1 tsp = 5ml
        break;
      case 'per_cup':
        multiplier = (amount * 240) / 100; // 1 cup = 240ml
        break;
      default:
        multiplier = amount / 100;
    }

    return {
      calories: Math.round(nutritionData.calories_per_100g * multiplier * 10) / 10,
      protein: Math.round(nutritionData.protein_per_100g * multiplier * 10) / 10,
      carbs: Math.round(nutritionData.carbs_per_100g * multiplier * 10) / 10,
      fat: Math.round(nutritionData.fat_per_100g * multiplier * 10) / 10
    };
  };

  // Calculate original ingredient values before scaling (for debug mode)
  const calculateOriginalIngredientNutrition = (ingredient: any) => {
    const amount = ingredient.amount || 0;
    const name = ingredient.name || '';
    const scaleFactor = planData?.scalingInfo?.scaleFactor || 1;

    // Prefer embedded values from plan
    const embed = {
      calories_per_100g: ingredient.calories_per_100g,
      protein_per_100g: ingredient.protein_per_100g,
      carbs_per_100g: ingredient.carbs_per_100g,
      fat_per_100g: ingredient.fat_per_100g,
      unit_type: ingredient.unit
    };
    const db = ingredientDatabase[name];
    const nutritionData = {
      calories_per_100g: embed.calories_per_100g ?? db?.calories_per_100g ?? 0,
      protein_per_100g: embed.protein_per_100g ?? db?.protein_per_100g ?? 0,
      carbs_per_100g: embed.carbs_per_100g ?? db?.carbs_per_100g ?? 0,
      fat_per_100g: embed.fat_per_100g ?? db?.fat_per_100g ?? 0,
      unit_type: embed.unit_type ?? db?.unit_type ?? 'per_100g'
    } as any;

    const unit = ingredient.unit || nutritionData.unit_type || 'per_100g';

    // Use originalAmount if available, otherwise calculate from scaled amount
    const originalAmount = ingredient.originalAmount || (scaleFactor !== 1 ? amount / scaleFactor : amount);

    // Convert based on unit type
    let multiplier = 1;
    switch (unit) {
      case 'per_100g':
        multiplier = originalAmount / 100;
        break;
      case 'per_piece':
      case 'stuk':
        multiplier = originalAmount; // For pieces, use amount directly
        break;
      case 'per_plakje':
        multiplier = originalAmount; // For slices, use amount directly
        break;
      case 'per_ml':
        multiplier = originalAmount / 100; // Assuming 1ml = 1g for liquids
        break;
      case 'per_tbsp':
        multiplier = (originalAmount * 15) / 100; // 1 tbsp = 15ml
        break;
      case 'per_tsp':
        multiplier = (originalAmount * 5) / 100; // 1 tsp = 5ml
        break;
      case 'per_cup':
        multiplier = (originalAmount * 240) / 100; // 1 cup = 240ml
        break;
      default:
        multiplier = originalAmount / 100;
    }

    return {
      calories: Math.round(nutritionData.calories_per_100g * multiplier * 10) / 10,
      protein: Math.round(nutritionData.protein_per_100g * multiplier * 10) / 10,
      carbs: Math.round(nutritionData.carbs_per_100g * multiplier * 10) / 10,
      fat: Math.round(nutritionData.fat_per_100g * multiplier * 10) / 10
    };
  };

  // Handle ingredient changes
  const handleIngredientChange = (day: string, mealType: string, ingredientIndex: number, field: string, value: any) => {
    if (!planData) return;

    const updatedPlanData = { ...planData };
    const meal = updatedPlanData.weekPlan?.[day]?.[mealType];
    
    if (meal && meal.ingredients && meal.ingredients[ingredientIndex]) {
      meal.ingredients[ingredientIndex][field] = value;
      
      // Recalculate meal nutrition
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      meal.ingredients.forEach((ingredient: any) => {
        const nutrition = calculateIngredientNutrition(ingredient);
        totalCalories += nutrition.calories;
        totalProtein += nutrition.protein;
        totalCarbs += nutrition.carbs;
        totalFat += nutrition.fat;
      });

      meal.nutrition = {
        calories: Math.round(totalCalories * 10) / 10,
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10
      };

      // Recalculate daily totals
      let dailyCalories = 0;
      let dailyProtein = 0;
      let dailyCarbs = 0;
      let dailyFat = 0;

      if (updatedPlanData.weekPlan?.[day]) {
        Object.values(updatedPlanData.weekPlan[day]).forEach((mealData: any) => {
        if (mealData && typeof mealData === 'object' && 'nutrition' in mealData && mealData.nutrition) {
          dailyCalories += mealData.nutrition.calories;
          dailyProtein += mealData.nutrition.protein;
          dailyCarbs += mealData.nutrition.carbs;
          dailyFat += mealData.nutrition.fat;
        }
      });
      }

      if (updatedPlanData.weekPlan?.[day]) {
        updatedPlanData.weekPlan[day].dailyTotals = {
        calories: Math.round(dailyCalories),
        protein: Math.round(dailyProtein * 10) / 10,
        carbs: Math.round(dailyCarbs * 10) / 10,
        fat: Math.round(dailyFat * 10) / 10
      };
      }

      setPlanData(updatedPlanData);
      
      // Check if this meal is back to original state after state update
      const mealKey = `${day}-${mealType}`;
      const isBackToOriginal = checkIfMealIsBackToOriginal(day, mealType, updatedPlanData);
      
      if (isBackToOriginal) {
        // Remove from modified meals if back to original
        setModifiedMeals(prev => {
          const newSet = new Set(prev);
          newSet.delete(mealKey);
          return newSet;
        });
    } else {
        // Mark this meal as modified
        setModifiedMeals(prev => new Set([...prev, mealKey]));
      }
    }
  };

  const getDayTotal = (day: string) => {
    // Use custom data if available, otherwise use original plan data
    const dataSource = customPlanData || planData;
    if (!dataSource?.weekPlan?.[day]) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    // If dailyTotals exist (from scaling), use them
    if (dataSource.weekPlan[day].dailyTotals) {
      return dataSource.weekPlan[day].dailyTotals;
    }
    
    // For original backend data, calculate totals from meals
    const dayData = dataSource.weekPlan[day];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    Object.keys(dayData).forEach(mealType => {
      if (dayData[mealType] && dayData[mealType].nutrition) {
        totalCalories += dayData[mealType].nutrition.calories || 0;
        totalProtein += dayData[mealType].nutrition.protein || 0;
        totalCarbs += dayData[mealType].nutrition.carbs || 0;
        totalFat += dayData[mealType].nutrition.fat || 0;
      }
    });
    
    return { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat };
  };

  const getMealData = (day: string, mealType: string) => {
    // Use custom data if available, otherwise use original plan data
    const dataSource = customPlanData || planData;
    
    if (!dataSource?.weekPlan?.[day]) {
      return null;
    }
    
    const mealData = dataSource.weekPlan?.[day]?.[mealType as keyof DayPlan];
    
    // Return null if it's dailyTotals (MealNutrition) instead of a Meal
    if (mealType === 'dailyTotals' || !mealData) {
      return null;
    }
    
    // Check if mealData has ingredients array
    if (!('ingredients' in mealData) || !Array.isArray(mealData.ingredients)) {
      return null;
    }
    
    return mealData as Meal;
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-white">Laden van voedingsplan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Fout bij laden</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchDynamicPlan}
            className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-white mb-2">Geen data gevonden</h2>
          <p className="text-gray-300">Er zijn geen voedingsgegevens beschikbaar.</p>
        </div>
      </div>
    );
  }

  const currentDayData = planData.weekPlan?.[selectedDay];

  // If no data for selected day, show error
  if (!currentDayData) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Geen data voor deze dag</h2>
          <p className="text-gray-300 mb-4">Er zijn geen voedingsgegevens beschikbaar voor {DAYS_NL[selectedDay as keyof typeof DAYS_NL]}.</p>
          <button
            onClick={() => setSelectedDay('maandag')}
            className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
          >
            Ga naar Maandag
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      {/* Header */}
      <div className="bg-[#181F17] border-b border-[#3A4D23] p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors text-sm md:text-base"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Terug naar overzicht</span>
                <span className="sm:hidden">Terug</span>
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  {planData.planName}
                  {customPlanData && (
                    <span className="ml-2 md:ml-3 px-2 py-1 bg-[#8BAE5A] text-[#232D1A] text-xs md:text-sm rounded-full font-medium">
                      Aangepast
                    </span>
                  )}
                </h1>
                {customPlanData && (
                  <div className="mt-2">
                    <button
                      onClick={resetToOriginalPlan}
                      className="inline-flex items-center px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 text-xs md:text-sm rounded-lg hover:bg-red-600/30 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="hidden sm:inline">Reset naar origineel</span>
                      <span className="sm:hidden">Reset</span>
                    </button>
                  </div>
                )}
                {planData.userProfile ? (
                  <p className="text-gray-300 text-sm md:text-base">
                    <span className="hidden md:inline">Gepersonaliseerd voor {planData.userProfile.weight}kg, {planData.userProfile.age} jaar, {planData.userProfile.height}cm, {getActivityLevelDisplay(planData.userProfile.activityLevel || 'moderate')} - {planData.userProfile.goal}</span>
                    <span className="md:hidden">{planData.userProfile.weight}kg • {planData.userProfile.age}j • {planData.userProfile.goal}</span>
                  </p>
                ) : (
                  <p className="text-gray-300 text-sm md:text-base">
                    <span className="hidden md:inline">Origineel plan (100kg basis) - Geen personalisatie toegepast</span>
                    <span className="md:hidden">Origineel plan (100kg basis)</span>
                  </p>
                )}
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8BAE5A] font-semibold">Status:</span>
                    <span className="text-white font-bold">{planData.scalingInfo ? `Factor: ${planData.scalingInfo.scaleFactor?.toFixed(2) || '1.00'}` : 'Geen scaling'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Origineel:</span>
                    <span className="text-white">{Math.round(getDayTotal(selectedDay).calories)} kcal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">100kg basis plan</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Debug Toggle for Admin */}
              {isAdmin && (
                <button
                  onClick={() => setShowDebugPanel(!showDebugPanel)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-[#3A4D23] hover:bg-[#4A5D33] text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <BugAntIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Debug</span>
                </button>
              )}
            <button 
              onClick={selectThisPlan}
              className="px-4 md:px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold text-sm md:text-base"
            >
              Selecteer dit plan
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel for Admin */}
      {isAdmin && showDebugPanel && (
        <div className="bg-[#1A1A1A] border-b border-[#3A4D23] p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#8BAE5A]">🔍 Debug Informatie</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={smartScalingEnabled}
                    onChange={(e) => setSmartScalingEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#8BAE5A] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#8BAE5A] focus:ring-2"
                  />
                  🧠 Slimme Schaling
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Plan Status */}
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">📋 Plan Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Plan Type:</span>
                    <span className={`font-mono ${customPlanData ? 'text-orange-400' : 'text-green-400'}`}>
                      {customPlanData ? 'CUSTOM' : 'ORIGINEEL'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Aangepaste Maaltijden:</span>
                    <span className={`font-mono ${modifiedMeals.size > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                      {modifiedMeals.size}
                    </span>
                  </div>
                  {modifiedMeals.size > 0 && (
                    <div className="mt-2">
                      <span className="text-gray-300 text-xs">Aangepast:</span>
                      <div className="text-xs text-orange-400 mt-1">
                        {Array.from(modifiedMeals).map(meal => (
                          <div key={meal} className="truncate">{meal}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Scaling Info */}
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">⚖️ Personalisatie Informatie</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Scale Factor:</span>
                    <span className="text-white font-mono">
                      {planData?.scalingInfo?.scaleFactor?.toFixed(2) || '1.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">User Gewicht:</span>
                    <span className="text-white font-mono">
                      {planData?.userProfile?.weight || 'N/A'} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">User Target:</span>
                    <span className="text-white font-mono">
                      {planData?.scalingInfo?.targetCalories || 'N/A'} kcal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Plan Target (100kg):</span>
                    <span className="text-white font-mono">
                      {planData?.scalingInfo?.planTargetCalories || 'N/A'} kcal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Scaling Actief:</span>
                    <span className={`font-mono ${(planData?.scalingInfo?.scaleFactor || 1) !== 1 ? 'text-orange-400' : 'text-green-400'}`}>
                      {(planData?.scalingInfo?.scaleFactor || 1) !== 1 ? 'JA' : 'NEE'}
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#3A4D23]">
                    <div className="text-xs text-gray-400">
                      <div>TTM Formule: {planData?.userProfile?.weight || 'N/A'}kg × 22 × 1.3 = {planData?.scalingInfo?.targetCalories || 'N/A'} kcal</div>
                      <div>Factor: {planData?.scalingInfo?.targetCalories || 'N/A'} ÷ {planData?.scalingInfo?.planTargetCalories || 'N/A'} = {planData?.scalingInfo?.scaleFactor?.toFixed(2) || '1.00'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Profile */}
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">👤 User Profiel</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Gewicht:</span>
                    <span className="text-white font-mono">
                      {planData?.userProfile?.weight || 'N/A'} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Leeftijd:</span>
                    <span className="text-white font-mono">
                      {planData?.userProfile?.age || 'N/A'} jaar
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Lengte:</span>
                    <span className="text-white font-mono">
                      {planData?.userProfile?.height || 'N/A'} cm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Doel:</span>
                    <span className="text-white font-mono">
                      {planData?.userProfile?.goal || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Plan Percentages */}
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">📊 Origineel Plan Macro's</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Eiwit:</span>
                    <span className="text-white font-mono">Berekend uit originele data</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Koolhydraten:</span>
                    <span className="text-white font-mono">Berekend uit originele data</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Vet:</span>
                    <span className="text-white font-mono">Berekend uit originele data</span>
                  </div>
                </div>
              </div>
            </div>

                  {/* Ingredient Database Status */}
                  <div className="mt-6 bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">🗄️ Ingrediënten Database Status</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {['Appel', 'Banaan', 'Havermout', 'Whey Shake'].map(ingredient => {
                        const hasData = ingredientDatabase[ingredient];
                        return (
                          <div key={ingredient} className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${hasData ? 'bg-green-400' : 'bg-red-400'}`}></span>
                            <span className="text-gray-300">{ingredient}:</span>
                            <span className={`font-mono ${hasData ? 'text-green-400' : 'text-red-400'}`}>
                              {hasData ? 'OK' : 'MISSING'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 text-sm text-gray-400">
                      Totaal geladen: {Object.keys(ingredientDatabase).length} ingrediënten
                    </div>
                  </div>

            {/* Smart Scaling Debug Info */}
            {smartScalingEnabled && planData?.scalingInfo?.debugInfo && (
              <div className="mt-6 bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">🧠 Slimme Schaling Debug</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Macro Adjustments */}
                  <div>
                    <h5 className="text-[#8BAE5A] font-medium mb-2">⚖️ Macro Aanpassingen</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Eiwit Factor:</span>
                        <span className="text-white font-mono">
                          {planData.scalingInfo.debugInfo.macroAdjustments?.protein?.toFixed(3) || '1.000'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Koolhydraten Factor:</span>
                        <span className="text-white font-mono">
                          {planData.scalingInfo.debugInfo.macroAdjustments?.carbs?.toFixed(3) || '1.000'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Vet Factor:</span>
                        <span className="text-white font-mono">
                          {planData.scalingInfo.debugInfo.macroAdjustments?.fat?.toFixed(3) || '1.000'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Totals Comparison */}
                  <div>
                    <h5 className="text-[#8BAE5A] font-medium mb-2">📊 Totaal Vergelijking</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Origineel vs Doel:</span>
                        <span className="text-white font-mono">
                          {planData.scalingInfo.debugInfo.originalTotals?.calories || 0} → {planData.scalingInfo.debugInfo.targetTotals?.calories || 0} kcal
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Eiwit:</span>
                        <span className="text-white font-mono">
                          {planData.scalingInfo.debugInfo.originalTotals?.protein || 0} → {planData.scalingInfo.debugInfo.targetTotals?.protein || 0}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Koolhydraten:</span>
                        <span className="text-white font-mono">
                          {planData.scalingInfo.debugInfo.originalTotals?.carbs || 0} → {planData.scalingInfo.debugInfo.targetTotals?.carbs || 0}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Vet:</span>
                        <span className="text-white font-mono">
                          {planData.scalingInfo.debugInfo.originalTotals?.fat || 0} → {planData.scalingInfo.debugInfo.targetTotals?.fat || 0}g
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ingredient Adjustments */}
                {planData.scalingInfo.debugInfo.ingredientAdjustments && planData.scalingInfo.debugInfo.ingredientAdjustments.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-[#8BAE5A] font-medium mb-2">🔧 Ingrediënt Aanpassingen</h5>
                    <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                      {planData.scalingInfo.debugInfo.ingredientAdjustments.map((adj: any, index: number) => (
                        <div key={index} className="flex justify-between items-center bg-[#232D1A] p-2 rounded">
                          <span className="text-gray-300">{adj.name}</span>
                          <span className="text-white">
                            {adj.originalAmount} → {adj.newAmount} ({adj.adjustmentFactor.toFixed(2)}x)
                          </span>
                          <span className="text-[#8BAE5A] text-xs">{adj.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Current Day Ingredients */}
            <div className="mt-6 bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">🍽️ Huidige Dag Ingrediënten ({selectedDay})</h4>
              <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                {currentDayData && Object.entries(currentDayData).map(([mealType, meal]: [string, any]) => {
                  if (!meal || !meal.ingredients) return null;
                  return (
                    <div key={mealType} className="border-l-2 border-[#8BAE5A] pl-3">
                      <div className="font-medium text-[#8BAE5A]">{MEAL_NAMES[mealType] || mealType}</div>
                      {meal.ingredients.map((ingredient: any, index: number) => (
                        <div key={index} className="ml-4 text-gray-300">
                          {ingredient.name}: {ingredient.amount} {ingredient.unit}
                                <span className="ml-2 text-xs text-gray-500">
                                  (DB: {ingredientDatabase[ingredient.name] ? '✓' : '✗'})
                                </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Plan-Specific Macro Breakdown */}
        {(planData.planPercentages || planData.planTargets) && (
          <div className="bg-gradient-to-r from-[#1a1f17] to-[#2d3a23] border border-[#3a4d23] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
              <h3 className="text-xl font-bold text-white">Plan Macro Verdeling</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Macro Percentages */}
              {planData.planPercentages && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-[#8BAE5A] mb-3">Macro Percentages</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#232D1A] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-white font-medium">Eiwit</span>
              </div>
                      <span className="text-white font-bold text-lg">{planData.planPercentages.protein}%</span>
              </div>
                    <div className="flex items-center justify-between p-3 bg-[#232D1A] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-white font-medium">Koolhydraten</span>
              </div>
                      <span className="text-white font-bold text-lg">{planData.planPercentages.carbs}%</span>
              </div>
                    <div className="flex items-center justify-between p-3 bg-[#232D1A] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-white font-medium">Vet</span>
            </div>
                      <span className="text-white font-bold text-lg">{planData.planPercentages.fat}%</span>
            </div>
              </div>
              </div>
            )}
              
              {/* Target Values */}
              {planData.planTargets && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-[#8BAE5A] mb-3">Doelwaarden</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-[#232D1A] rounded-lg">
                      <div className="text-2xl font-bold text-white">{planData.planTargets?.target_calories || 0}</div>
                      <div className="text-sm text-gray-400">Calorieën</div>
          </div>
                    <div className="text-center p-3 bg-[#232D1A] rounded-lg">
                      <div className="text-2xl font-bold text-white">{planData.planTargets?.target_protein || 0}g</div>
                      <div className="text-sm text-gray-400">Eiwit</div>
                    </div>
                    <div className="text-center p-3 bg-[#232D1A] rounded-lg">
                      <div className="text-2xl font-bold text-white">{planData.planTargets?.target_carbs || 0}g</div>
                      <div className="text-sm text-gray-400">Koolhydraten</div>
                    </div>
                    <div className="text-center p-3 bg-[#232D1A] rounded-lg">
                      <div className="text-2xl font-bold text-white">{planData.planTargets?.target_fat || 0}g</div>
                      <div className="text-sm text-gray-400">Vet</div>
                    </div>
            </div>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Daily Requirements */}
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
            <h3 className="text-xl font-bold text-white">Origineel Plan (100kg Basis)</h3>
          </div>
          
          {/* Plan Information */}
          <div className="mb-6 p-4 bg-[#232D1A] border border-[#3A4D23] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#8BAE5A] font-semibold">📋 Plan Status:</span>
              <span className="text-white font-bold text-lg">
                Origineel (Geen Scaling)
              </span>
            </div>
            <div className="text-sm text-gray-300">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="text-gray-400">Origineel plan (100kg basis):</span>
                  <span className="text-white ml-2">{Math.round(getDayTotal(selectedDay).calories)} kcal</span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className="text-white ml-2">Geen scaling toegepast - 1:1 backend data</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Dit is de originele backend data zonder enige aanpassingen
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{planData.scalingInfo?.targetCalories || planData.userProfile?.targetCalories || 0}</div>
              <div className="text-sm text-gray-400">Calorieën per dag</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{planData.scalingInfo?.targetProtein || planData.userProfile?.targetProtein || 0}g</div>
              <div className="text-sm text-gray-400">Eiwitten per dag</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{planData.scalingInfo?.targetCarbs || planData.userProfile?.targetCarbs || 0}g</div>
              <div className="text-sm text-gray-400">Koolhydraten per dag</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{planData.scalingInfo?.targetFat || planData.userProfile?.targetFat || 0}g</div>
              <div className="text-sm text-gray-400">Vetten per dag</div>
            </div>
          </div>
        </div>

        {/* Huidige Plan Data */}
        <div id="current-plan-data-original" className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#4A7C59] to-[#5A8C69] rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Huidige Plan Data</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{Math.round(getDayTotal(selectedDay).calories)}</div>
              <div className="text-sm text-gray-400">Calorieën per dag</div>
                <div className="text-xs mt-1 text-gray-400">
                  Origineel plan (100kg basis)
                </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{getDayTotal(selectedDay).protein.toFixed(1)}g</div>
              <div className="text-sm text-gray-400">Eiwitten per dag</div>
              <div className="text-xs mt-1 text-gray-400">
                Origineel plan (100kg basis)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{getDayTotal(selectedDay).carbs.toFixed(1)}g</div>
              <div className="text-sm text-gray-400">Koolhydraten per dag</div>
              <div className="text-xs mt-1 text-gray-400">
                Origineel plan (100kg basis)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{getDayTotal(selectedDay).fat.toFixed(1)}g</div>
              <div className="text-sm text-gray-400">Vetten per dag</div>
              <div className="text-xs mt-1 text-gray-400">
                Origineel plan (100kg basis)
              </div>
            </div>
          </div>
        </div>

        {/* Debug indicator */}
        {/* Debug indicator removed - sticky functionality preserved */}

        {/* Sticky Huidige Plan Data - Only shows when scrolled past original */}
        {isStickyActive && (
          <div className="fixed top-4 left-0 right-0 z-50 bg-[#4A7C59] border border-[#5A8C69] rounded-xl p-6 mx-4 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#5A8C69] to-[#6A9C79] rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Huidige Plan Data</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{Math.round(getDayTotal(selectedDay).calories)}</div>
                <div className="text-sm text-gray-200">Calorieën per dag</div>
                <div className="text-xs mt-1 text-gray-300">
                  Origineel plan (100kg basis)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{getDayTotal(selectedDay).protein.toFixed(1)}g</div>
                <div className="text-sm text-gray-200">Eiwitten per dag</div>
                <div className="text-xs mt-1 text-gray-300">
                  Origineel plan (100kg basis)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{getDayTotal(selectedDay).carbs.toFixed(1)}g</div>
                <div className="text-sm text-gray-200">Koolhydraten per dag</div>
                <div className="text-xs mt-1 text-gray-300">
                  Origineel plan (100kg basis)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{getDayTotal(selectedDay).fat.toFixed(1)}g</div>
                <div className="text-sm text-gray-200">Vetten per dag</div>
                <div className="text-xs mt-1 text-gray-300">
                  Origineel plan (100kg basis)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Day Selection */}
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4">Kies een dag</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
            {Object.entries(DAYS_NL).map(([dayKey, dayName]) => (
              <button
                key={dayKey}
                onClick={() => setSelectedDay(dayKey)}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base ${
                  selectedDay === dayKey
                    ? 'bg-[#8BAE5A] text-[#232D1A]'
                    : 'bg-[#3A4D23] text-white hover:bg-[#4A5D33]'
                }`}
              >
                <span className="hidden sm:inline">{dayName}</span>
                <span className="sm:hidden">{dayName.substring(0, 3)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Totals & Warning */}
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {DAYS_NL[selectedDay as keyof typeof DAYS_NL]} - Dagtotalen
          </h3>
          

          {/* Daily Totals Progress Bars */}
          <div className="space-y-4">
            {/* Calories Progress Bar */}
            {(() => {
              const current = Math.round(getDayTotal(selectedDay).calories);
              const target = planData.scalingInfo?.targetCalories || planData.userProfile?.targetCalories || 0;
              const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
              const difference = current - target;
              const isOver = difference > 0;
              const isUnder = difference < 0;
              const isPerfect = difference === 0;
              
              let statusText = '';
              let statusColor = '';
              let progressColor = '';
              
              if (isPerfect) {
                statusText = 'Doel bereikt! (100%)';
                statusColor = 'text-green-400';
                progressColor = 'bg-green-500';
              } else if (isOver) {
                statusText = `${Math.abs(difference)} kcal te veel (${percentage}%)`;
                // Over target - use percentage-based colors
                if (percentage <= 105) {
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage <= 110) {
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              } else {
                // Under target - use percentage-based colors
                if (percentage >= 95) {
                  statusText = `${Math.abs(difference)} kcal te weinig (${percentage}%)`;
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage >= 90) {
                  statusText = `${Math.abs(difference)} kcal te weinig (${percentage}%)`;
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusText = `${Math.abs(difference)} kcal te weinig (${percentage}%)`;
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              }
              
              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Kcal (Calorieën)</span>
                    <span className={`text-sm ${statusColor}`}>{statusText}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Huidig: {current} kcal</span>
                    <span>Doel: {target} kcal</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })()}

            {/* Protein Progress Bar */}
            {(() => {
              const current = Math.round(getDayTotal(selectedDay).protein * 10) / 10;
              const target = planData.scalingInfo?.targetProtein || planData.userProfile?.targetProtein || 0;
              const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
              const difference = current - target;
              const isOver = difference > 0;
              const isUnder = difference < 0;
              const isPerfect = difference === 0;
              
              let statusText = '';
              let statusColor = '';
              let progressColor = '';
              
              if (isPerfect) {
                statusText = 'Doel bereikt! (100%)';
                statusColor = 'text-green-400';
                progressColor = 'bg-green-500';
              } else if (isOver) {
                statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te veel (${percentage}%)`;
                // Over target - use percentage-based colors
                if (percentage <= 105) {
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage <= 110) {
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              } else {
                // Under target - use percentage-based colors
                if (percentage >= 95) {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage >= 90) {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              }
              
              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Eiwit (Protein)</span>
                    <span className={`text-sm ${statusColor}`}>{statusText}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Huidig: {current}g</span>
                    <span>Doel: {target}g</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })()}

            {/* Carbs Progress Bar */}
            {(() => {
              const current = Math.round(getDayTotal(selectedDay).carbs * 10) / 10;
              const target = planData.scalingInfo?.targetCarbs || planData.userProfile?.targetCarbs || 0;
              const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
              const difference = current - target;
              const isOver = difference > 0;
              const isUnder = difference < 0;
              const isPerfect = difference === 0;
              
              let statusText = '';
              let statusColor = '';
              let progressColor = '';
              
              if (isPerfect) {
                statusText = 'Doel bereikt! (100%)';
                statusColor = 'text-green-400';
                progressColor = 'bg-green-500';
              } else if (isOver) {
                statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te veel (${percentage}%)`;
                // Over target - use percentage-based colors
                if (percentage <= 105) {
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage <= 110) {
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              } else {
                // Under target - use percentage-based colors
                if (percentage >= 95) {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage >= 90) {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              }
              
              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Koolhydraten (Carbohydrates)</span>
                    <span className={`text-sm ${statusColor}`}>{statusText}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Huidig: {current}g</span>
                    <span>Doel: {target}g</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })()}

            {/* Fat Progress Bar */}
            {(() => {
              const current = Math.round(getDayTotal(selectedDay).fat * 10) / 10;
              const target = planData.scalingInfo?.targetFat || planData.userProfile?.targetFat || 0;
              const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
              const difference = current - target;
              const isOver = difference > 0;
              const isUnder = difference < 0;
              const isPerfect = difference === 0;
              
              let statusText = '';
              let statusColor = '';
              let progressColor = '';
              
              if (isPerfect) {
                statusText = 'Doel bereikt! (100%)';
                statusColor = 'text-green-400';
                progressColor = 'bg-green-500';
              } else if (isOver) {
                statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te veel (${percentage}%)`;
                // Over target - use percentage-based colors
                if (percentage <= 105) {
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage <= 110) {
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              } else {
                // Under target - use percentage-based colors
                if (percentage >= 95) {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-green-400';
                  progressColor = 'bg-green-500';
                } else if (percentage >= 90) {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-orange-400';
                  progressColor = 'bg-orange-500';
                } else {
                  statusText = `${Math.abs(Math.round(difference * 10) / 10)}g te weinig (${percentage}%)`;
                  statusColor = 'text-red-400';
                  progressColor = 'bg-red-500';
                }
              }
              
              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Vet (Fat)</span>
                    <span className={`text-sm ${statusColor}`}>{statusText}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Huidig: {current}g</span>
                    <span>Doel: {target}g</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Personalization explanation removed */}

          {/* Safety Margin Notice */}
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-blue-300 font-semibold mb-1">Veilige Marge</h4>
                <p className="text-blue-200 text-sm">
                  Het is begrijpelijk dat je niet altijd precies uitkomt op je dagelijkse calorieën. 
                  Een marge van <span className="font-semibold">±200 kcal</span> is veilig en realistisch. 
                  Focus op consistentie over perfectie!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-4">
          {MEAL_ORDER.map((mealType) => {
            const meal = getMealData(selectedDay, mealType);
            // Only show meal types that have data
            if (!meal) {
              return null; // Don't render empty meals
            }

            const mealKey = `${selectedDay}-${mealType}`;
            const isModified = modifiedMeals.has(mealKey);

            return (
              <div key={mealType} className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-4 md:p-6 relative">
                {/* Modified Label */}
                {isModified && (
                  <div className="absolute -top-2 -left-2 transform -rotate-12">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-lg shadow-lg text-xs font-bold">
                      ✏️ Aangepast
                    </div>
                  </div>
                )}
                
                {/* Meal Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                  <h4 className="text-base md:text-lg font-bold text-white flex items-center">
                    <ClockIcon className="w-4 h-4 md:w-5 md:h-5 text-[#8BAE5A] mr-2" />
                    {MEAL_TYPES_NL[mealType as keyof typeof MEAL_TYPES_NL]}
                    {isAdmin && showDebugPanel && isMealModified(selectedDay, mealType) && (
                      <span className="ml-2 px-2 py-1 text-xs bg-orange-500 text-white rounded-full">
                        AANGEPAST
                      </span>
                    )}
                    <span className="ml-2 md:ml-4 text-sm text-gray-400">
                      {meal.nutrition?.calories || 0} kcal
                    </span>
                  </h4>
                  <button
                    onClick={() => handleEditMeal(selectedDay, mealType)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors text-sm font-semibold"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Bewerken</span>
                    <span className="sm:hidden">Edit</span>
                  </button>
                </div>

                {/* Meal Nutrition */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                  <div className="text-center p-2 bg-[#232D1A] rounded-lg">
                    <div className="text-sm md:text-lg font-semibold text-white">Kcal</div>
                    <div className="text-xs md:text-sm text-[#8BAE5A]">{Math.round((meal.nutrition?.calories || 0) * 10) / 10}</div>
                  </div>
                  <div className="text-center p-2 bg-[#232D1A] rounded-lg">
                    <div className="text-sm md:text-lg font-semibold text-white">Eiwit</div>
                    <div className="text-xs md:text-sm text-[#8BAE5A]">{Math.round((meal.nutrition?.protein || 0) * 10) / 10}g</div>
                  </div>
                  <div className="text-center p-2 bg-[#232D1A] rounded-lg">
                    <div className="text-sm md:text-lg font-semibold text-white">Koolhydraten</div>
                    <div className="text-xs md:text-sm text-[#8BAE5A]">{Math.round((meal.nutrition?.carbs || 0) * 10) / 10}g</div>
                  </div>
                  <div className="text-center p-2 bg-[#232D1A] rounded-lg">
                    <div className="text-sm md:text-lg font-semibold text-white">Vet</div>
                    <div className="text-xs md:text-sm text-[#8BAE5A]">{Math.round((meal.nutrition?.fat || 0) * 10) / 10}g</div>
                  </div>
                </div>

                {/* Ingredients Table */}
                {'ingredients' in meal && meal.ingredients && meal.ingredients.length > 0 && (
                  <div className="mb-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs md:text-sm">
                        <thead>
                          <tr className="border-b border-[#3A4D23]">
                            <th className="text-left py-2 text-gray-300">Ingrediënt</th>
                            <th className="text-center py-2 text-gray-300">Aantal</th>
                            <th className="text-center py-2 text-gray-300">Eenheid</th>
                            <th className="text-center py-2 text-gray-300">Kcal</th>
                            <th className="text-center py-2 text-gray-300">Eiwit</th>
                            <th className="text-center py-2 text-gray-300">Koolhydraten</th>
                            <th className="text-center py-2 text-gray-300">Vet</th>
                          </tr>
                        </thead>
                        <tbody>
                      {meal.ingredients.map((ingredient, index) => (
                            <tr key={index} className="border-b border-[#3A4D23]/50 hover:bg-[#1F2D17]">
                              <td className="py-3 text-white font-medium">{ingredient.name}</td>
                              <td className="py-3 text-center">
                                <input
                                  type="number"
                                  value={parseFloat(ingredient.amount.toString()) || 0}
                                  onChange={(e) => handleIngredientChange(selectedDay, mealType, index, 'amount', parseFloat(e.target.value) || 0)}
                                  className="w-16 md:w-20 px-2 py-1 bg-[#181F17] border border-[#3A4D23] rounded text-white text-center focus:outline-none focus:border-[#8BAE5A] text-xs md:text-sm"
                                  min="0"
                                  step="1"
                                />
                                {isAdmin && showDebugPanel && null}
                              </td>
                              <td className="py-3 text-center text-gray-300">
                                {unitLabel(ingredient.unit) || '-'}
                              </td>
                              <td className="py-3 text-center text-white">
                                {calculateIngredientNutrition(ingredient).calories.toFixed(1)}
                              </td>
                              <td className="py-3 text-center text-white">
                                {calculateIngredientNutrition(ingredient).protein.toFixed(1)}g
                              </td>
                              <td className="py-3 text-center text-white">
                                {calculateIngredientNutrition(ingredient).carbs.toFixed(1)}g
                              </td>
                              <td className="py-3 text-center text-white">
                                {calculateIngredientNutrition(ingredient).fat.toFixed(1)}g
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* Meal Edit Modal */}
      {editingMeal && (
        <MealEditModal
          isOpen={!!editingMeal}
          onClose={() => setEditingMeal(null)}
          day={editingMeal.day}
          mealType={editingMeal.meal}
          currentIngredients={getMealData(editingMeal.day, editingMeal.meal)?.ingredients || []}
          onSave={handleSaveMeal}
        />
      )}
    </div>
  );
}
