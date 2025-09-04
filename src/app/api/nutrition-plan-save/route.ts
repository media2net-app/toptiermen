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

    // Save or update the customized plan in user_nutrition_plans table
    const { data, error } = await supabase
      .from('user_nutrition_plans')
      .upsert({
        user_id: userId,
        plan_id: planId,
        customized_data: customizedPlan,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id,plan_id' 
      })
      .select();

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
      .eq('plan_id', planId)
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
      customizedPlan: data.customized_data,
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
