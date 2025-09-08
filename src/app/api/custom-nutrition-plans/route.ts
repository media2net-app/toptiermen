import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, basePlanId, customPlanData, planName } = await request.json();

    if (!userId || !basePlanId || !customPlanData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('💾 Saving custom nutrition plan:', { userId, basePlanId, planName });

    // Save custom plan to database
    const { data, error } = await supabase
      .from('custom_nutrition_plans')
      .upsert({
        user_id: userId,
        base_plan_id: basePlanId,
        plan_name: planName || 'Custom Plan',
        plan_data: customPlanData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,base_plan_id'
      })
      .select();

    if (error) {
      console.error('❌ Error saving custom plan:', error);
      return NextResponse.json(
        { error: 'Failed to save custom plan' },
        { status: 500 }
      );
    }

    console.log('✅ Custom plan saved successfully:', data);

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Custom plan saved successfully'
    });

  } catch (error) {
    console.error('❌ Error in custom nutrition plans API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const basePlanId = searchParams.get('basePlanId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching custom nutrition plans:', { userId, basePlanId });

    let query = supabase
      .from('custom_nutrition_plans')
      .select('*')
      .eq('user_id', userId);

    if (basePlanId) {
      query = query.eq('base_plan_id', basePlanId);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching custom plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch custom plans' },
        { status: 500 }
      );
    }

    console.log('✅ Custom plans fetched successfully:', data?.length || 0);

    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Custom plans fetched successfully'
    });

  } catch (error) {
    console.error('❌ Error in custom nutrition plans GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, basePlanId } = await request.json();

    if (!userId || !basePlanId) {
      return NextResponse.json(
        { error: 'userId and basePlanId are required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting custom nutrition plan:', { userId, basePlanId });

    const { error } = await supabase
      .from('custom_nutrition_plans')
      .delete()
      .eq('user_id', userId)
      .eq('base_plan_id', basePlanId);

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
    console.error('❌ Error in custom nutrition plans DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
