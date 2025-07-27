import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const meal_type = searchParams.get('meal_type');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('nutrition_recipes')
      .select(`
        *,
        author:users(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (meal_type) {
      query = query.eq('meal_type', meal_type);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data: recipes, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching nutrition recipes:', error);
      return NextResponse.json({ error: 'Failed to fetch nutrition recipes' }, { status: 500 });
    }

    return NextResponse.json({ success: true, recipes });
  } catch (error) {
    console.error('Error in nutrition recipes API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      instructions, 
      prep_time_minutes, 
      cook_time_minutes, 
      servings, 
      difficulty, 
      cuisine_type, 
      meal_type, 
      calories_per_serving, 
      protein_per_serving, 
      carbs_per_serving, 
      fat_per_serving, 
      image_url, 
      is_featured, 
      is_public, 
      author_id 
    } = body;

    const { data: recipe, error } = await supabaseAdmin
      .from('nutrition_recipes')
      .insert({
        name,
        description,
        instructions,
        prep_time_minutes,
        cook_time_minutes,
        servings,
        difficulty,
        cuisine_type,
        meal_type,
        calories_per_serving,
        protein_per_serving,
        carbs_per_serving,
        fat_per_serving,
        image_url,
        is_featured,
        is_public,
        author_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating nutrition recipe:', error);
      return NextResponse.json({ error: 'Failed to create nutrition recipe' }, { status: 500 });
    }

    return NextResponse.json({ success: true, recipe });
  } catch (error) {
    console.error('Error in nutrition recipes API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 