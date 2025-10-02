import { NextRequest, NextResponse } from 'next/server';

// Disable any caching for this route. Always serve the latest DB values.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
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
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
      );
    }

    console.log('📋 Fetching ORIGINAL plan (no scaling):', planId);

    // Fetch the original plan from database, support both id and plan_id
    // Try by id first, then by plan_id
    let planData: any = null;
    let error: any = null;

    // 1) Try match by id
    let resp = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('id', planId)
      .single();
    planData = resp.data; error = resp.error;

    // 2) If not found by id, try by plan_id
    if (error || !planData) {
      const resp2 = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('plan_id', planId)
        .single();
      planData = resp2.data; error = resp2.error;
    }

    if (error) {
      console.error('Error fetching plan:', error);
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
      );
    }

    console.log('✅ Original plan fetched:', planData.plan_id);

    // Return the plan data exactly as it is in the database (1:1 mapping)
    return NextResponse.json(
      {
        success: true,
        plan: planData,
        message: 'Original plan data (no scaling applied)'
      },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    );

  } catch (error) {
    console.error('Error in original plan API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    );
  }
}
