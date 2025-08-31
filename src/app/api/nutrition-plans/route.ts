import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const goal = searchParams.get('goal');
    const featured = searchParams.get('featured');

    // Build query
    let query = supabaseAdmin
      .from('nutrition_plans')
      .select('*')
      .eq('is_active', true);

    // Add filters if provided
    if (category) {
      query = query.eq('category', category);
    }
    if (goal) {
      query = query.eq('goal', goal);
    }
    if (featured === 'true') {
      query = query.eq('is_active', true);
    }

    // Execute query
    const { data: plans, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching nutrition plans:', error);
      return NextResponse.json({ error: 'Failed to fetch nutrition plans' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      plans: plans || [] 
    });

  } catch (error) {
    console.error('Error in nutrition plans API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!plan) {
      return NextResponse.json({ error: 'Plan data is required' }, { status: 400 });
    }

    const { data: newPlan, error } = await supabaseAdmin
      .from('nutrition_plans')
      .insert(plan)
      .select()
      .single();

    if (error) {
      console.error('Error creating nutrition plan:', error);
      return NextResponse.json({ error: 'Failed to create nutrition plan' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      plan: newPlan 
    });

  } catch (error) {
    console.error('Error in nutrition plans POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
