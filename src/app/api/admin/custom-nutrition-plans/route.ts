import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching custom nutrition plans for admin...');

    // Get all custom plans with user information
    const { data: customPlans, error } = await supabase
      .from('custom_nutrition_plans')
      .select(`
        *,
        user:user_id (
          id,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching custom plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch custom plans' },
        { status: 500 }
      );
    }

    // Transform the data to include user email
    const transformedPlans = customPlans?.map(plan => ({
      ...plan,
      user_email: plan.user?.email || 'Onbekend'
    })) || [];

    console.log('✅ Custom plans fetched successfully:', transformedPlans.length);

    return NextResponse.json({
      success: true,
      customPlans: transformedPlans,
      message: 'Custom plans fetched successfully'
    });

  } catch (error) {
    console.error('❌ Error in admin custom nutrition plans API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { customPlanId } = await request.json();

    if (!customPlanId) {
      return NextResponse.json(
        { error: 'customPlanId is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting custom plan:', customPlanId);

    const { error } = await supabase
      .from('custom_nutrition_plans')
      .delete()
      .eq('id', customPlanId);

    if (error) {
      console.error('❌ Error deleting custom plan:', error);
      return NextResponse.json(
        { error: 'Failed to delete custom plan' },
        { status: 500 }
      );
    }

    console.log('✅ Custom plan deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Custom plan deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in admin custom nutrition plans DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
