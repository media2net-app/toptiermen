import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching nutrition ingredients from database...');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('nutrition_ingredients')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }

    const { data: ingredients, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching nutrition ingredients:', error);
      return NextResponse.json({ error: `Failed to fetch nutrition ingredients: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Nutrition ingredients fetched successfully:', ingredients?.length || 0, 'ingredients');
    return NextResponse.json({ success: true, ingredients: ingredients || [] });
  } catch (error) {
    console.error('❌ Error in nutrition ingredients API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      category, 
      calories_per_100g, 
      protein_per_100g, 
      carbs_per_100g, 
      fat_per_100g, 
      fiber_per_100g, 
      sugar_per_100g, 
      sodium_per_100g, 
      description, 
      image_url,
      is_carnivore 
    } = body;

    const { data: ingredient, error } = await supabaseAdmin
      .from('nutrition_ingredients')
      .insert({
        name,
        category,
        calories_per_100g,
        protein_per_100g,
        carbs_per_100g,
        fat_per_100g,
        fiber_per_100g,
        sugar_per_100g,
        sodium_per_100g,
        description,
        image_url,
        is_carnivore: is_carnivore || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating nutrition ingredient:', error);
      return NextResponse.json({ error: 'Failed to create nutrition ingredient' }, { status: 500 });
    }

    return NextResponse.json({ success: true, ingredient });
  } catch (error) {
    console.error('Error in nutrition ingredients API:', error);
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

    const { data: ingredient, error } = await supabaseAdmin
      .from('nutrition_ingredients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating nutrition ingredient:', error);
      return NextResponse.json({ error: 'Failed to update nutrition ingredient' }, { status: 500 });
    }

    return NextResponse.json({ success: true, ingredient });
  } catch (error) {
    console.error('Error in nutrition ingredients API:', error);
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
      .from('nutrition_ingredients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting nutrition ingredient:', error);
      return NextResponse.json({ error: 'Failed to delete nutrition ingredient' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Nutrition ingredient deleted successfully' });
  } catch (error) {
    console.error('Error in nutrition ingredients API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 