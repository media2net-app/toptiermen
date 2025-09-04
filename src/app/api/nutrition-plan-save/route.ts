import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, planId, customizedPlan } = await request.json();

    if (!userId || !planId || !customizedPlan) {
      return NextResponse.json({
        success: false,
        error: 'userId, planId, and customizedPlan are required'
      }, { status: 400 });
    }

    console.log('💾 Saving customized nutrition plan:', { userId, planId });

    // First, check if a record already exists for this user and plan
    const { data: existingRecord, error: checkError } = await supabase
      .from('user_nutrition_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('plan_type', planId)
      .single();

    let data, error;

    // Extract nutrition goals from the customized plan
    const nutritionGoals = customizedPlan?.userProfile ? {
      calories: customizedPlan.userProfile.targetCalories || 2000,
      protein: customizedPlan.userProfile.targetProtein || 150,
      carbs: customizedPlan.userProfile.targetCarbs || 200,
      fat: customizedPlan.userProfile.targetFat || 70
    } : {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 70
    };

    // Extract user data from the customized plan
    const userData = customizedPlan?.userProfile ? {
      age: customizedPlan.userProfile.age || 30,
      weight: customizedPlan.userProfile.weight || 70,
      height: customizedPlan.userProfile.height || 175,
      goal: customizedPlan.userProfile.goal || 'maintenance',
      activityLevel: 'moderate'
    } : {
      age: 30,
      weight: 70,
      height: 175,
      goal: 'maintenance',
      activityLevel: 'moderate'
    };

    if (existingRecord) {
      // Update existing record
      console.log('📝 Updating existing record for user:', userId, 'plan:', planId);
      const result = await supabase
        .from('user_nutrition_plans')
        .update({
          week_plan: customizedPlan, // Store customized plan in week_plan column
          nutrition_goals: nutritionGoals, // Add required nutrition_goals
          user_data: userData, // Add required user_data
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('plan_type', planId)
        .select();
      
      data = result.data;
      error = result.error;
    } else {
      // Insert new record
      console.log('➕ Creating new record for user:', userId, 'plan:', planId);
      const result = await supabase
        .from('user_nutrition_plans')
        .insert({
          user_id: userId,
          plan_type: planId, // Use plan_type instead of plan_id
          week_plan: customizedPlan, // Store customized plan in week_plan column
          nutrition_goals: nutritionGoals, // Add required nutrition_goals
          user_data: userData, // Add required user_data
          updated_at: new Date().toISOString()
        })
        .select();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('❌ Error saving customized plan:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ Customized plan saved successfully');

    return NextResponse.json({
      success: true,
      message: 'Customized nutrition plan saved successfully',
      data: data?.[0]
    });

  } catch (error) {
    console.error('❌ Error in nutrition-plan-save API:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const planId = searchParams.get('planId');

    if (!userId || !planId) {
      return NextResponse.json({
        success: false,
        error: 'userId and planId are required'
      }, { status: 400 });
    }

    console.log('📖 Loading customized nutrition plan:', { userId, planId });

    // Get the customized plan for this user and plan
    const { data, error } = await supabase
      .from('user_nutrition_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_type', planId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error loading customized plan:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        success: true,
        hasCustomizedPlan: false,
        message: 'No customized plan found for this user and plan'
      });
    }

    console.log('✅ Customized plan loaded successfully');

    return NextResponse.json({
      success: true,
      hasCustomizedPlan: true,
      customizedPlan: data.week_plan, // Use week_plan instead of customized_data
      lastUpdated: data.updated_at
    });

  } catch (error) {
    console.error('❌ Error in nutrition-plan-save GET API:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, planId } = await request.json();

    if (!userId || !planId) {
      return NextResponse.json({
        success: false,
        error: 'userId and planId are required'
      }, { status: 400 });
    }

    console.log('🗑️ Deleting customized nutrition plan:', { userId, planId });

    // Delete the customized plan from user_nutrition_plans table
    const { error } = await supabase
      .from('user_nutrition_plans')
      .delete()
      .eq('user_id', userId)
      .eq('plan_type', planId);

    if (error) {
      console.error('❌ Error deleting customized plan:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ Customized plan deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Customized nutrition plan deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in nutrition-plan-save DELETE API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
