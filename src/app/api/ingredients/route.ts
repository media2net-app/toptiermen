import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '100');

    console.log('🥗 Fetching ingredients:', { search, limit });

    // Build query
    let query = supabase
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true })
      .limit(limit);

    // Add search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: ingredients, error } = await query;

    if (error) {
      console.error('❌ Error fetching ingredients:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ingredients', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Ingredients fetched successfully:', { count: ingredients?.length });

    return NextResponse.json({
      success: true,
      ingredients: ingredients || []
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      unit, 
      calories_per_100g, 
      protein_per_100g, 
      carbs_per_100g, 
      fat_per_100g 
    } = body;

    console.log('🥗 Creating new ingredient:', { name, unit });

    if (!name || !unit) {
      return NextResponse.json(
        { error: 'Name and unit are required' },
        { status: 400 }
      );
    }

    // Insert new ingredient
    const { data, error } = await supabase
      .from('ingredients')
      .insert([{
        name,
        unit,
        calories_per_100g: calories_per_100g || 0,
        protein_per_100g: protein_per_100g || 0,
        carbs_per_100g: carbs_per_100g || 0,
        fat_per_100g: fat_per_100g || 0
      }])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error creating ingredient:', error);
      return NextResponse.json(
        { error: 'Failed to create ingredient', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Ingredient created successfully:', data);

    return NextResponse.json({
      success: true,
      ingredient: data
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
