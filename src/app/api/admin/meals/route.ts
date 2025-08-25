import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🍽️ Fetching meals from database...');
    
    const { data: meals, error } = await supabaseAdmin
      .from('meals')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ Error fetching meals:', error);
      return NextResponse.json({ error: `Failed to fetch meals: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Meals fetched successfully:', meals?.length || 0, 'meals');
    return NextResponse.json({ success: true, meals: meals || [] });
  } catch (error) {
    console.error('❌ Error in meals API:', error);
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
      category, 
      ingredients, 
      instructions, 
      nutrition_info, 
      prep_time, 
      difficulty, 
      is_featured 
    } = body;

    const { data: meal, error } = await supabaseAdmin
      .from('meals')
      .insert({
        name,
        description,
        meal_type,
        category,
        ingredients,
        instructions,
        nutrition_info,
        prep_time,
        difficulty,
        is_featured
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meal:', error);
      return NextResponse.json({ error: 'Failed to create meal' }, { status: 500 });
    }

    return NextResponse.json({ success: true, meal });
  } catch (error) {
    console.error('Error in meals API:', error);
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

    const { data: meal, error } = await supabaseAdmin
      .from('meals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating meal:', error);
      return NextResponse.json({ error: 'Failed to update meal' }, { status: 500 });
    }

    return NextResponse.json({ success: true, meal });
  } catch (error) {
    console.error('Error in meals API:', error);
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
      .from('meals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting meal:', error);
      return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Error in meals API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
