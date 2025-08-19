import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('🥗 Fetching food items from database...');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('food_items')
      .select('*')
      .order('name');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: foodItems, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching food items:', error);
      return NextResponse.json({ error: `Failed to fetch food items: ${error.message}` }, { status: 500 });
    }

    console.log('✅ Food items fetched successfully:', foodItems?.length || 0, 'items');
    return NextResponse.json({ success: true, foodItems: foodItems || [] });
  } catch (error) {
    console.error('❌ Error in food items API:', error);
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      category, 
      calories, 
      protein, 
      carbs, 
      fat, 
      fiber, 
      sugar, 
      sodium, 
      description, 
      serving_size,
      allergens,
      diet_tags
    } = body;

    const { data: foodItem, error } = await supabaseAdmin
      .from('food_items')
      .insert({
        name,
        category,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
        description,
        serving_size,
        allergens: allergens || [],
        diet_tags: diet_tags || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating food item:', error);
      return NextResponse.json({ error: 'Failed to create food item' }, { status: 500 });
    }

    return NextResponse.json({ success: true, foodItem });
  } catch (error) {
    console.error('Error in food items API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
      name, 
      category, 
      calories, 
      protein, 
      carbs, 
      fat, 
      fiber, 
      sugar, 
      sodium, 
      description, 
      serving_size,
      allergens,
      diet_tags
    } = body;

    const { data: foodItem, error } = await supabaseAdmin
      .from('food_items')
      .update({
        name,
        category,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
        description,
        serving_size,
        allergens: allergens || [],
        diet_tags: diet_tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating food item:', error);
      return NextResponse.json({ error: 'Failed to update food item' }, { status: 500 });
    }

    return NextResponse.json({ success: true, foodItem });
  } catch (error) {
    console.error('Error in food items API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Food item ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('food_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting food item:', error);
      return NextResponse.json({ error: 'Failed to delete food item' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Error in food items API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
