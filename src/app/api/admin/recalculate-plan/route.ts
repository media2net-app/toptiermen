import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Helper copied from admin plan-meals endpoint to ensure identical math
function calculateMealNutrition(ingredients: any[]): any {
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  (ingredients || []).forEach((ingredient: any) => {
    const amount = parseFloat(ingredient?.amount) || 0;
    const unit = String(ingredient?.unit || 'per_100g').toLowerCase();

    let factor = 1;
    if (unit === 'per_100g' || unit === 'gram' || unit === 'g') {
      factor = amount / 100;
    } else if (unit === 'per_piece' || unit === 'stuks' || unit === 'stuk' || unit === 'piece' || unit === 'pieces') {
      factor = amount;
    } else if (unit === 'per_handful' || unit === 'handje' || unit === 'handjes') {
      factor = amount;
    } else if (unit === 'per_plakje' || unit === 'plakje' || unit === 'plakjes' || unit === 'per_sneedje' || unit === 'sneedje') {
      factor = amount;
    } else if (unit === 'per_30g') {
      factor = (amount * 30) / 100;
    } else if (unit === 'per_100ml' || unit === 'ml' || unit === 'per_ml') {
      factor = amount / 100;
    } else if (unit === 'per_eetlepel_15g' || unit === 'per_tbsp' || unit === 'tbsp' || unit === 'eetlepel' || unit === 'el' || unit === 'per_eetlepel') {
      factor = (amount * 15) / 100;
    } else if (unit === 'per_tsp' || unit === 'tsp' || unit === 'theelepel' || unit === 'tl' || unit === 'per_theelepel') {
      factor = (amount * 5) / 100;
    } else if (unit === 'per_cup' || unit === 'cup' || unit === 'kop') {
      factor = (amount * 240) / 100;
    } else if (unit === 'per_blikje') {
      factor = amount;
    } else {
      factor = amount / 100;
    }

    totalProtein += (Number(ingredient?.protein_per_100g) || 0) * factor;
    totalCarbs   += (Number(ingredient?.carbs_per_100g)   || 0) * factor;
    totalFat     += (Number(ingredient?.fat_per_100g)     || 0) * factor;
  });

  const proteinRounded = Math.round(totalProtein * 10) / 10;
  const carbsRounded = Math.round(totalCarbs * 10) / 10;
  const fatRounded = Math.round(totalFat * 10) / 10;
  const caloriesFromMacros = Math.round(proteinRounded * 4 + carbsRounded * 4 + fatRounded * 9);

  return {
    calories: caloriesFromMacros,
    protein: proteinRounded,
    carbs: carbsRounded,
    fat: fatRounded,
  };
}

async function recalcSinglePlan(planId: string, onlyDay?: string) {
  // Fetch current plan (id + meals)
  const { data: plan, error } = await supabaseAdmin
    .from('nutrition_plans')
    .select('id, meals')
    .eq('id', planId)
    .single();

  if (error || !plan) {
    return { err: error || new Error('Plan not found'), updatedMeals: 0, updatedDays: 0, weekly_averages: null };
  }

  const meals = plan.meals || {};
  const weeklyPlan = meals.weekly_plan || {};
  const days = ['maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag','zondag'];

  let updatedDays = 0;
  let updatedMeals = 0;

  for (const day of days) {
    if (onlyDay && onlyDay !== day) continue;
    const dayObj: any = weeklyPlan[day];
    if (!dayObj || typeof dayObj !== 'object') continue;
    let dayHadChange = false;

    for (const mealKey of Object.keys(dayObj)) {
      const meal = dayObj[mealKey];
      if (!meal || !Array.isArray(meal.ingredients)) continue;
      const newNutri = calculateMealNutrition(meal.ingredients);
      const old = meal.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 };
      const diff = (
        Math.round(old.calories) !== Math.round(newNutri.calories) ||
        Math.round(old.protein * 10) !== Math.round(newNutri.protein * 10) ||
        Math.round(old.carbs * 10) !== Math.round(newNutri.carbs * 10) ||
        Math.round(old.fat * 10) !== Math.round(newNutri.fat * 10)
      );
      if (diff) {
        dayObj[mealKey] = { ...meal, nutrition: newNutri };
        dayHadChange = true;
        updatedMeals += 1;
      }
    }

    if (dayHadChange) updatedDays += 1;
  }

  // Recompute weekly averages
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 } as any;
  let dayCount = 0;
  for (const day of days) {
    const dayObj: any = weeklyPlan[day];
    if (!dayObj) continue;
    dayCount += 1;
    Object.values(dayObj).forEach((meal: any) => {
      if (meal?.nutrition) {
        totals.calories += Number(meal.nutrition.calories) || 0;
        totals.protein  += Number(meal.nutrition.protein) || 0;
        totals.carbs    += Number(meal.nutrition.carbs) || 0;
        totals.fat      += Number(meal.nutrition.fat) || 0;
      }
    });
  }

  const weekly_averages = dayCount > 0 ? {
    calories: Math.round(totals.calories / dayCount),
    protein: Math.round((totals.protein / dayCount) * 10) / 10,
    carbs:   Math.round((totals.carbs / dayCount) * 10) / 10,
    fat:     Math.round((totals.fat / dayCount) * 10) / 10,
  } : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const newMeals = { ...meals, weekly_plan: weeklyPlan, weekly_averages };

  if (updatedMeals > 0) {
    const { error: updateError } = await supabaseAdmin
      .from('nutrition_plans')
      .update({ meals: newMeals })
      .eq('id', planId);
    if (updateError) return { err: updateError, updatedMeals: 0, updatedDays: 0, weekly_averages: null };
  }

  return { err: null, updatedMeals, updatedDays, weekly_averages };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let planId = body?.planId || new URL(request.url).searchParams.get('planId');
    const planName = body?.name || new URL(request.url).searchParams.get('name');
    const onlyDay = body?.day || new URL(request.url).searchParams.get('day'); // optional: limit to a day key
    const allFlag = body?.all === true || new URL(request.url).searchParams.get('all') === 'true';

    // If all=true, process all plans
    if (allFlag) {
      const { data: plans, error: plansErr } = await supabaseAdmin
        .from('nutrition_plans')
        .select('id');
      if (plansErr) {
        console.error('❌ Error listing plans for bulk recalc:', plansErr);
        return NextResponse.json({ success: false, error: 'Failed to list plans' }, { status: 500 });
      }
      const results: any[] = [];
      for (const p of plans || []) {
        const r = await recalcSinglePlan(String(p.id), undefined);
        results.push({ id: p.id, ...r });
      }
      const summary = results.reduce((acc, r) => {
        acc.updatedMeals += r.updatedMeals || 0;
        acc.updatedDays  += r.updatedDays || 0;
        acc.failed       += r.err ? 1 : 0;
        return acc;
      }, { updatedMeals: 0, updatedDays: 0, failed: 0 } as any);
      return NextResponse.json({ success: true, mode: 'all', summary, results });
    }

    // Allow lookup by name if planId not supplied
    if (!planId && planName) {
      const { data: byName, error: errByName } = await supabaseAdmin
        .from('nutrition_plans')
        .select('id, name')
        .ilike('name', planName)
        .limit(1)
        .maybeSingle();
      if (errByName) {
        console.error('❌ Error looking up plan by name:', errByName);
        return NextResponse.json({ success: false, error: 'Failed to lookup plan by name' }, { status: 500 });
      }
      if (!byName) {
        return NextResponse.json({ success: false, error: 'Plan not found by name' }, { status: 404 });
      }
      planId = String(byName.id);
    }

    if (!planId) {
      return NextResponse.json({ success: false, error: 'planId or name is required' }, { status: 400 });
    }
    const result = await recalcSinglePlan(planId, onlyDay || undefined);
    if (result.err) {
      console.error('❌ Error in single-plan recalc:', result.err);
      return NextResponse.json({ success: false, error: 'Failed to recalc plan' }, { status: 500 });
    }
    return NextResponse.json({ success: true, mode: 'single', ...result });
  } catch (e: any) {
    console.error('❌ Unexpected error in POST /api/admin/recalculate-plan:', e);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
