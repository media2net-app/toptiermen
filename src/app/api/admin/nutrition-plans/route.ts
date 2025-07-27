import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const goal = searchParams.get('goal');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('nutrition_plans')
      .select(`
        *,
        author:users(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (goal) {
      query = query.eq('goal', goal);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data: plans, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching nutrition plans:', error);
      return NextResponse.json({ error: 'Failed to fetch nutrition plans' }, { status: 500 });
    }

    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error('Error in nutrition plans API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      target_calories, 
      target_protein, 
      target_carbs, 
      target_fat, 
      duration_weeks, 
      difficulty, 
      goal, 
      is_featured, 
      is_public, 
      author_id 
    } = body;

    const { data: plan, error } = await supabaseAdmin
      .from('nutrition_plans')
      .insert({
        name,
        description,
        target_calories,
        target_protein,
        target_carbs,
        target_fat,
        duration_weeks,
        difficulty,
        goal,
        is_featured,
        is_public,
        author_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating nutrition plan:', error);
      return NextResponse.json({ error: 'Failed to create nutrition plan' }, { status: 500 });
    }

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('Error in nutrition plans API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 