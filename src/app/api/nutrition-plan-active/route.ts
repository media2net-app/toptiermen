import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Fetching active nutrition plan for user:', userId);

    // Get the active plan for this user
    const { data, error } = await supabase
      .from('user_nutrition_plans')
      .select('plan_type')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error fetching active plan:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch active plan' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({
        success: true,
        hasActivePlan: false,
        message: 'No active nutrition plan found'
      });
    }

    console.log('✅ Active plan found:', data.plan_type);

    return NextResponse.json({
      success: true,
      hasActivePlan: true,
      activePlanId: data.plan_type
    });

  } catch (error) {
    console.error('❌ Error in nutrition-plan-active:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
