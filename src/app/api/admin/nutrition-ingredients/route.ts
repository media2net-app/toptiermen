import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching nutrition ingredients...');
    
    const { data: ingredients, error } = await supabaseAdmin
      .from('nutrition_ingredients')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching nutrition ingredients:', error);
      return NextResponse.json({ error: `Failed to fetch ingredients: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Successfully fetched nutrition ingredients:', ingredients?.length || 0);
    return NextResponse.json({ success: true, ingredients: ingredients || [] });
    
  } catch (error) {
    console.error('❌ Unexpected error in GET /api/admin/nutrition-ingredients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
      description,
      is_carnivore,
      unit_type
    } = body;

    // Validate required fields
    if (!name || !category || calories_per_100g === undefined || protein_per_100g === undefined || carbs_per_100g === undefined || fat_per_100g === undefined) {
      return NextResponse.json({ error: 'Name, category, and all nutrition values are required' }, { status: 400 });
    }

    const { data: ingredient, error } = await supabaseAdmin
      .from('nutrition_ingredients')
      .insert({
        name,
        category,
        calories_per_100g: parseFloat(calories_per_100g),
        protein_per_100g: parseFloat(protein_per_100g),
        carbs_per_100g: parseFloat(carbs_per_100g),
        fat_per_100g: parseFloat(fat_per_100g),
        description: description || null,
        is_carnivore: is_carnivore || false,
        unit_type: unit_type || 'per_100g',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating nutrition ingredient:', error);
      return NextResponse.json({ error: `Failed to create ingredient: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Nutrition ingredient created successfully:', ingredient.name);
    return NextResponse.json({ success: true, ingredient });
  } catch (error) {
    console.error('❌ Unexpected error in POST /api/admin/nutrition-ingredients:', error);
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

    // Convert numeric fields to floats if they exist
    if (updateData.calories_per_100g !== undefined) {
      updateData.calories_per_100g = parseFloat(updateData.calories_per_100g);
    }
    if (updateData.protein_per_100g !== undefined) {
      updateData.protein_per_100g = parseFloat(updateData.protein_per_100g);
    }
    if (updateData.carbs_per_100g !== undefined) {
      updateData.carbs_per_100g = parseFloat(updateData.carbs_per_100g);
    }
    if (updateData.fat_per_100g !== undefined) {
      updateData.fat_per_100g = parseFloat(updateData.fat_per_100g);
    }

    const { data: ingredient, error } = await supabaseAdmin
      .from('nutrition_ingredients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating nutrition ingredient:', error);
      return NextResponse.json({ error: `Failed to update ingredient: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Nutrition ingredient updated successfully:', ingredient.name);
    return NextResponse.json({ success: true, ingredient });
  } catch (error) {
    console.error('❌ Unexpected error in PUT /api/admin/nutrition-ingredients:', error);
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

    // Soft delete by setting is_active to false
    const { error } = await supabaseAdmin
      .from('nutrition_ingredients')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting nutrition ingredient:', error);
      return NextResponse.json({ error: `Failed to delete ingredient: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Nutrition ingredient deleted successfully:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Unexpected error in DELETE /api/admin/nutrition-ingredients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}