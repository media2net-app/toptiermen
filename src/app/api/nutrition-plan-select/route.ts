import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { userId, planId } = await request.json();

    if (!userId || !planId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Plan ID are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, try to deactivate all existing plans (ignore errors if no plans exist)
    const { error: deactivateError } = await supabase
      .from('user_nutrition_plans')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (deactivateError) {
      console.log('⚠️ Warning deactivating plans (might be no existing plans):', deactivateError.message);
      // Don't fail here, just log the warning
    } else {
      console.log('✅ All existing plans deactivated');
    }

    // Check if a record exists for this user and plan
    const { data: existingRecord, error: checkError } = await supabase
      .from('user_nutrition_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('plan_type', planId)
      .single();

    if (existingRecord) {
      // Update existing record to active
      const { error: activateError } = await supabase
        .from('user_nutrition_plans')
        .update({ is_active: true })
        .eq('user_id', userId)
        .eq('plan_type', planId);

      if (activateError) {
        console.error('❌ Error activating plan:', activateError);
        return NextResponse.json(
          { success: false, error: `Failed to activate selected plan: ${activateError.message}` },
          { status: 500 }
        );
      }
    } else {
      // Create new record for this user and plan
      const { error: insertError } = await supabase
        .from('user_nutrition_plans')
        .insert({
          user_id: userId,
          plan_type: planId,
          nutrition_goals: {
            calories: 2000,
            protein: 150,
            carbs: 200,
            fat: 70
          },
          user_data: {
            age: 30,
            weight: 70,
            height: 175,
            goal: 'maintenance',
            activityLevel: 'moderate'
          },
          week_plan: {},
          is_active: true
        });

      if (insertError) {
        console.error('❌ Error creating plan record:', insertError);
        return NextResponse.json(
          { success: false, error: `Failed to create plan record: ${insertError.message}` },
          { status: 500 }
        );
      }
    }

    console.log('✅ Plan activated successfully');

    console.log(`✅ Plan ${planId} selected as active for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Plan successfully selected'
    });

  } catch (error) {
    console.error('Error in nutrition-plan-select:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Deactivate all active plans for this user
    const { error: deactivateError } = await supabase
      .from('user_nutrition_plans')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (deactivateError) {
      console.error('❌ Error deactivating plans:', deactivateError);
      return NextResponse.json(
        { success: false, error: `Failed to deselect plans: ${deactivateError.message}` },
        { status: 500 }
      );
    }

    console.log(`✅ All plans deselected for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'All plans successfully deselected'
    });

  } catch (error) {
    console.error('Error in nutrition-plan-deselect:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
