import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching nutrition recipes from database...');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const plan = searchParams.get('plan');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('nutrition_recipes')
      .select('*')
      .order('name');

    if (category) {
      query = query.eq('meal_type', category);
    }

    if (plan) {
      query = query.contains('suitable_plans', [plan]);
    }

    const { data: recipes, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching nutrition recipes:', error);
      return NextResponse.json({ error: `Failed to fetch nutrition recipes: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Nutrition recipes fetched successfully:', recipes?.length || 0, 'recipes');
    return NextResponse.json({ success: true, recipes: recipes || [] });
  } catch (error) {
    console.error('❌ Error in nutrition recipes API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      meal_type, 
      suitable_plans, 
      calories_per_serving, 
      protein_per_serving, 
      carbs_per_serving, 
      fat_per_serving, 
      servings, 
      prep_time_minutes, 
      difficulty, 
      instructions 
    } = body;

    const { data: recipe, error } = await supabaseAdmin
      .from('nutrition_recipes')
      .insert({
        name,
        description,
        meal_type,
        suitable_plans,
        calories_per_serving,
        protein_per_serving,
        carbs_per_serving,
        fat_per_serving,
        servings,
        prep_time_minutes,
        difficulty,
        instructions
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required for update' }, { status: 400 });
    }

    const { data: recipe, error } = await supabaseAdmin
      .from('nutrition_recipes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating nutrition recipe:', error);
      return NextResponse.json({ error: 'Failed to update nutrition recipe' }, { status: 500 });
    }

    return NextResponse.json({ success: true, recipe });
  } catch (error) {
    console.error('Error in nutrition recipes API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required for deletion' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('nutrition_recipes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting nutrition recipe:', error);
      return NextResponse.json({ error: 'Failed to delete nutrition recipe' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Nutrition recipe deleted successfully' });
  } catch (error) {
    console.error('Error in nutrition recipes API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 