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
        calories_per_100g: ingredient.calories_per_100g,
        protein_per_100g: ingredient.protein_per_100g,
        carbs_per_100g: ingredient.carbs_per_100g,
        fat_per_100g: ingredient.fat_per_100g,
        unit_type: ingredient.unit_type
      };
    });

    console.log('✅ Successfully fetched nutrition ingredients:', Object.keys(ingredientLookup).length);
    
    // Add cache-busting timestamp
    const lastUpdated = ingredients?.length > 0 ? 
      Math.max(...ingredients.map(ing => new Date(ing.updated_at).getTime())) : 
      Date.now();
    
    return NextResponse.json({ 
      success: true, 
      ingredients: ingredientLookup,
      lastUpdated: lastUpdated
    });
    
  } catch (error) {
    console.error('❌ Unexpected error in GET /api/nutrition-ingredients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
