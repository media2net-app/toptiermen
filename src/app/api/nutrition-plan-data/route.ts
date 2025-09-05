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
    
    if (!planId) {
      return NextResponse.json({
        success: false,
        error: 'planId is required'
      }, { status: 400 });
    }

    console.log('🥗 Getting nutrition plan data for:', { planId, timestamp: new Date().toISOString() });

    // Get the nutrition plan from database
    const { data: planData, error: planError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('plan_id', planId)
      .single();

    if (planError || !planData) {
      return NextResponse.json({
        success: false,
        error: `Nutrition plan '${planId}' not found`
      }, { status: 404 });
    }

    if (!planData.meals) {
      return NextResponse.json({
        success: false,
        error: 'Plan has no meal data'
      }, { status: 400 });
    }

    // Transform the data to match the expected format
    const transformedData = {
      planId: planData.plan_id,
      planName: planData.name,
      userProfile: {
        targetCalories: planData.meals.target_calories || 2000,
        targetProtein: planData.meals.target_protein || 150,
        targetCarbs: planData.meals.target_carbs || 200,
        targetFat: planData.meals.target_fat || 70,
        age: 30,
        weight: 70,
        height: 175,
        goal: planData.meals.goal || 'maintenance'
      },
      scalingInfo: {
        basePlanCalories: planData.meals.target_calories || 2000,
        scaleFactor: 1.0,
        targetCalories: planData.meals.target_calories || 2000
      },
      weekPlan: planData.meals.weekly_plan || {},
      weeklyAverages: {
        calories: planData.meals.target_calories || 2000,
        protein: planData.meals.target_protein || 150,
        carbs: planData.meals.target_carbs || 200,
        fat: planData.meals.target_fat || 70
      },
      generatedAt: new Date().toISOString()
    };

    console.log('✅ Plan data retrieved and transformed:', transformedData);

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error: any) {
    console.error('❌ Error getting nutrition plan data:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
