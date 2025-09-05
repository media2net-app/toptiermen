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

    // First, deactivate all existing plans for this user to avoid unique constraint violation
    const { error: deactivateError } = await supabase
      .from('user_nutrition_plans')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (deactivateError) {
      console.log('⚠️ Warning deactivating existing plans:', deactivateError.message);
      // Don't fail here, just log the warning
    } else {
      console.log('✅ All existing plans deactivated');
    }

    // Then, check if a record already exists for this user and plan
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
          is_active: true, // Set as active plan
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
          is_active: true, // Set as active plan
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

    // Reconstruct the full plan data structure that the frontend expects
    const customizedPlan = data.week_plan;
    
    // If the stored data is already in the correct format, return it directly
    if (customizedPlan && customizedPlan.planId && customizedPlan.userProfile && customizedPlan.weekPlan) {
      console.log('✅ Returning stored customized plan with full structure');
      
      // But first update the userProfile with latest data if available
      const updatedPlan = {
        ...customizedPlan,
        userProfile: data.user_data ? {
          age: data.user_data.age,
          weight: data.user_data.weight,
          height: data.user_data.height,
          goal: data.user_data.goal,
          targetCalories: data.nutrition_goals?.calories || customizedPlan.userProfile.targetCalories,
          targetProtein: data.nutrition_goals?.protein || customizedPlan.userProfile.targetProtein,
          targetCarbs: data.nutrition_goals?.carbs || customizedPlan.userProfile.targetCarbs,
          targetFat: data.nutrition_goals?.fat || customizedPlan.userProfile.targetFat
        } : customizedPlan.userProfile
      };
      
      return NextResponse.json({
        success: true,
        hasCustomizedPlan: true,
        customizedPlan: updatedPlan,
        lastUpdated: data.updated_at
      });
    }
    
    // If the stored data is incomplete, reconstruct it
    console.log('🔄 Reconstructing plan data structure');
    const reconstructedPlan = {
      planId: planId,
      planName: `Custom ${planId}`,
      userProfile: data.user_data || {
        age: 30,
        weight: 70,
        height: 175,
        goal: 'maintenance',
        targetCalories: data.nutrition_goals?.calories || 2000,
        targetProtein: data.nutrition_goals?.protein || 150,
        targetCarbs: data.nutrition_goals?.carbs || 200,
        targetFat: data.nutrition_goals?.fat || 70
      },
      scalingInfo: {
        basePlanCalories: 1800,
        scaleFactor: 1.0,
        targetCalories: data.nutrition_goals?.calories || 2000
      },
      weekPlan: customizedPlan && customizedPlan.weekPlan ? customizedPlan.weekPlan : customizedPlan,
      weeklyAverages: customizedPlan?.weeklyAverages || {
        calories: data.nutrition_goals?.calories || 2000,
        protein: data.nutrition_goals?.protein || 150,
        carbs: data.nutrition_goals?.carbs || 200,
        fat: data.nutrition_goals?.fat || 70
      },
      generatedAt: data.updated_at
    };

    return NextResponse.json({
      success: true,
      hasCustomizedPlan: true,
      customizedPlan: reconstructedPlan,
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
