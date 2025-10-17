import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/database/voedingsplannen
// Returns a list of users (profiles) with their selected nutrition plan and progress summary
export async function GET(_req: NextRequest) {
  try {
    // 1) Fetch profiles with basic data
    const { data: profiles, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, main_goal')
      .order('email', { ascending: true });

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    const users = profiles || [];
    const userIds = users.map(u => u.id);

    // 2) Fetch all nutrition plans for reference
    const { data: plans, error: planErr } = await supabaseAdmin
      .from('nutrition_plans')
      .select('plan_id, name, description, target_calories, target_protein, target_carbs, target_fat, goal, fitness_goal');
    if (planErr) return NextResponse.json({ error: planErr.message }, { status: 500 });
    const planMap = (plans || []).reduce((acc: any, p: any) => { acc[p.plan_id] = p; return acc; }, {});

    // 3) Fetch user nutrition plans (active selections)
    let nutritionPlansByUser: Record<string, any[]> = {};
    if (userIds.length > 0) {
      const { data: nutritionPlans, error: nutritionErr } = await supabaseAdmin
        .from('user_nutrition_plans')
        .select('user_id, plan_type, is_active, nutrition_goals, user_data, created_at, updated_at');
      if (nutritionErr) {
        console.log('User nutrition plans table not found, continuing without it');
      } else {
        for (const np of (nutritionPlans || [])) {
          if (!nutritionPlansByUser[np.user_id]) nutritionPlansByUser[np.user_id] = [];
          nutritionPlansByUser[np.user_id].push(np);
        }
      }
    }

    // 4) Fetch custom nutrition plans
    let customPlansByUser: Record<string, any[]> = {};
    if (userIds.length > 0) {
      const { data: customPlans, error: customErr } = await supabaseAdmin
        .from('custom_nutrition_plans')
        .select('user_id, base_plan_id, plan_name, plan_data, created_at, updated_at');
      if (customErr) {
        // Custom plans table might not exist, continue without it
        console.log('Custom nutrition plans table not found, continuing without it');
      } else {
        for (const cp of (customPlans || [])) {
          if (!customPlansByUser[cp.user_id]) customPlansByUser[cp.user_id] = [];
          customPlansByUser[cp.user_id].push(cp);
        }
      }
    }

    const rows = users.map(u => {
      const userNutritionPlans = nutritionPlansByUser[u.id] || [];
      const userCustomPlans = customPlansByUser[u.id] || [];
      
      // Find active nutrition plan
      const activeNutritionPlan = userNutritionPlans.find(np => np.is_active) || null;
      const selectedPlanId = activeNutritionPlan?.plan_type || null;
      const selectedPlan = selectedPlanId ? planMap[selectedPlanId] : null;
      
      // Get nutrition goals from active plan
      const nutritionGoals = activeNutritionPlan?.nutrition_goals || {};
      const targetCalories = nutritionGoals.calories || selectedPlan?.target_calories || 0;
      const targetProtein = nutritionGoals.protein || selectedPlan?.target_protein || 0;
      const targetCarbs = nutritionGoals.carbs || selectedPlan?.target_carbs || 0;
      const targetFat = nutritionGoals.fat || selectedPlan?.target_fat || 0;
      
      // Calculate days since plan selection
      const daysSinceStart = activeNutritionPlan ? 
        Math.floor((Date.now() - new Date(activeNutritionPlan.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      // Check if user has custom plans
      const hasCustomPlans = userCustomPlans.length > 0;
      const customPlanCount = userCustomPlans.length;

      return {
        userId: u.id,
        email: u.email,
        fullName: u.full_name,
        selectedPlanId,
        selectedPlanName: selectedPlan?.name || null,
        planGoal: selectedPlan?.goal || u.main_goal || null,
        fitnessGoal: selectedPlan?.fitness_goal || null,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
        daysSinceStart,
        hasCustomPlans,
        customPlanCount,
        isActive: activeNutritionPlan?.is_active || false,
        lastUpdated: activeNutritionPlan?.updated_at || null,
      };
    });

    return NextResponse.json({ success: true, count: rows.length, rows });
  } catch (e: any) {
    console.error('voedingsplannen list error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
