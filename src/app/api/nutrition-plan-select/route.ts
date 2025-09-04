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

    // First, set all plans for this user to inactive
    const { error: deactivateError } = await supabase
      .from('user_nutrition_plans')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (deactivateError) {
      console.error('Error deactivating plans:', deactivateError);
      return NextResponse.json(
        { success: false, error: 'Failed to deactivate existing plans' },
        { status: 500 }
      );
    }

    // Then, activate the selected plan
    const { error: activateError } = await supabase
      .from('user_nutrition_plans')
      .update({ is_active: true })
      .eq('user_id', userId)
      .eq('plan_type', planId);

    if (activateError) {
      console.error('Error activating plan:', activateError);
      return NextResponse.json(
        { success: false, error: 'Failed to activate selected plan' },
        { status: 500 }
      );
    }

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
