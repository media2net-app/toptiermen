import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching nutrition ingredients for frontend...');
    
    const { data: ingredients, error } = await supabase
      .from('nutrition_ingredients')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching nutrition ingredients:', error);
      return NextResponse.json({ error: `Failed to fetch ingredients: ${error.message}` }, { status: 500 });
    }

    // Convert database format to frontend lookup object
    const ingredientLookup = {};
    ingredients?.forEach(ingredient => {
      ingredientLookup[ingredient.name] = {
        calories: ingredient.calories_per_100g,
        protein: ingredient.protein_per_100g,
        carbs: ingredient.carbs_per_100g,
        fat: ingredient.fat_per_100g,
        unit_type: ingredient.unit_type
      };
    });

    console.log('✅ Successfully fetched nutrition ingredients:', Object.keys(ingredientLookup).length);
    return NextResponse.json({ success: true, ingredients: ingredientLookup });
    
  } catch (error) {
    console.error('❌ Unexpected error in GET /api/nutrition-ingredients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
