import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json({ success: false, error: 'planId is required' }, { status: 400 });
    }

    // Try by plan_id first (string identifier), then fallback to numeric id
    let query = supabaseAdmin
      .from('nutrition_plans')
      .select('*')
      .eq('plan_id', planId)
      .limit(1);

    let { data: plans, error } = await query;

    if (error) {
      console.error('❌ Error querying nutrition_plans by plan_id:', error);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    if (!plans || plans.length === 0) {
      // Fallback: try numeric id
      const { data: plansByNumeric, error: err2 } = await supabaseAdmin
        .from('nutrition_plans')
        .select('*')
        .eq('id', planId)
        .limit(1);

      if (err2) {
        console.error('❌ Error querying nutrition_plans by id:', err2);
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
      }

      plans = plansByNumeric || [];
    }

    if (!plans || plans.length === 0) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
    }

    const plan = plans[0];
    const transformed = {
      id: plan.id,
      plan_id: plan.plan_id,
      name: plan.name,
      subtitle: plan.subtitle,
      description: plan.description,
    };

    return NextResponse.json({ success: true, plan: transformed });
  } catch (e) {
    console.error('❌ Error in nutrition-plan-by-id:', e);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
