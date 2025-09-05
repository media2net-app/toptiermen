import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');
    const userId = searchParams.get('userId');
    
    if (!planId) {
      return NextResponse.json({
        success: false,
        error: 'planId is required'
      }, { status: 400 });
    }

    console.log('🥗 Getting simple nutrition plan data for:', { planId, userId });

    // First check if user has a custom plan if userId is provided
    let customPlanData = null;
    if (userId) {
      console.log('🔍 Checking for custom plan for user:', userId);
      const { data: customData, error: customError } = await supabase
        .from('user_nutrition_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('plan_type', planId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (!customError && customData && customData.length > 0) {
        customPlanData = customData[0];
        console.log('✅ Custom plan found for user, will use custom data');
      } else {
        console.log('ℹ️ No custom plan found, will use base plan');
      }
    }

    // Get the base nutrition plan from database (same table as admin interface)
    const { data: planData, error: planError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('plan_id', planId)
      .single();

    if (planError || !planData) {
      console.log(`❌ Plan '${planId}' not found in database:`, planError?.message);
      return NextResponse.json({
        success: false,
        error: `Nutrition plan '${planId}' not found`
      }, { status: 404 });
    }

    if (!planData.meals || !planData.meals.weekly_plan) {
      console.log(`⚠️ Plan '${planId}' has no weekly meal data`);
      return NextResponse.json({
        success: false,
        error: 'Plan has no weekly meal data'
      }, { status: 400 });
    }

    // Get user's actual profile data if userId is provided
    let userProfile = {
      age: 30,
      weight: 70,
      height: 175,
      goal: 'maintenance'
    };

    if (userId) {
      console.log('👤 Fetching user profile for userId:', userId);
      const { data: profileData, error: profileError } = await supabase
        .from('nutrition_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profileError && profileData) {
        console.log('✅ User profile found, using real data');
        userProfile = {
          age: profileData.age,
          weight: profileData.weight,
          height: profileData.height,
          goal: profileData.goal === 'cut' ? 'droogtrainen' : 
                profileData.goal === 'bulk' ? 'spiermassa' : 
                profileData.goal === 'maintenance' ? 'onderhoud' : profileData.goal,
          target_calories: profileData.target_calories,
          target_protein: profileData.target_protein,
          target_carbs: profileData.target_carbs,
          target_fat: profileData.target_fat
        };
      } else {
        console.log('⚠️ User profile not found, using default values');
      }
    } else {
      console.log('ℹ️ No userId provided, using default profile');
    }

    // Determine data source (custom plan if available, otherwise base plan)
    let weekPlanData, weeklyAveragesData;
    
    if (customPlanData && customPlanData.week_plan) {
      console.log('📋 Using custom plan data for user');
      const customPlan = customPlanData.week_plan;
      weekPlanData = customPlan.weekPlan || customPlan.meals?.weekly_plan || {};
      weeklyAveragesData = customPlan.weeklyAverages || customPlan.meals?.weekly_averages || {
        calories: userProfile.target_calories || 2000,
        protein: userProfile.target_protein || 150,
        carbs: userProfile.target_carbs || 200,
        fat: userProfile.target_fat || 70
      };
    } else {
      console.log('📋 Using base plan data');
      weekPlanData = planData.meals.weekly_plan || {};
      weeklyAveragesData = planData.meals.weekly_averages || {
        calories: planData.meals.target_calories || 2000,
        protein: planData.meals.target_protein || 150,
        carbs: planData.meals.target_carbs || 200,
        fat: planData.meals.target_fat || 70
      };
    }

    // Transform the data to match the expected format
    const transformedData = {
      planId: planData.plan_id,
      planName: planData.name,
      userProfile: {
        targetCalories: userProfile.target_calories || 2000,
        targetProtein: userProfile.target_protein || 150,
        targetCarbs: userProfile.target_carbs || 200,
        targetFat: userProfile.target_fat || 70,
        age: userProfile.age,
        weight: userProfile.weight,
        height: userProfile.height,
        goal: userProfile.goal
      },
      scalingInfo: {
        basePlanCalories: planData.meals.target_calories || 2000,
        scaleFactor: (userProfile.target_calories || 2000) / (planData.meals.target_calories || 2000),
        targetCalories: userProfile.target_calories || 2000
      },
      weekPlan: weekPlanData,
      weeklyAverages: weeklyAveragesData,
      generatedAt: new Date().toISOString(),
      isCustomPlan: !!customPlanData // Add flag to indicate if this is a custom plan
    };

    console.log('✅ Simple plan data retrieved and transformed:', transformedData);

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error: any) {
    console.error('❌ Error getting simple nutrition plan data:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
