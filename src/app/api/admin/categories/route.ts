import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('📊 Fetching categories from database...');
    
    // First try to get from dedicated categories table
    const { data: dedicatedData, error: dedicatedError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (!dedicatedError && dedicatedData) {
      console.log('✅ Categories fetched from dedicated table:', dedicatedData.length);
      return NextResponse.json({ categories: dedicatedData });
    }

    // Fallback: get unique categories from nutrition_ingredients
    console.log('📋 No dedicated table, fetching from nutrition_ingredients...');
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('nutrition_ingredients')
      .select('category')
      .not('category', 'is', null);

    if (ingredientsError) {
      console.error('❌ Error fetching categories from ingredients:', ingredientsError);
      return NextResponse.json({ error: ingredientsError.message }, { status: 500 });
    }

    // Convert to categories format and clean up duplicates
    const uniqueCategories = [...new Set(ingredients.map(item => item.category))]
      .filter(category => category && category.trim() !== '')
      .map(category => ({
        name: category,
        value: category,
        description: `Bestaande categorie uit ingrediënten`,
        color: getCategoryColor(category)
      }));

    console.log('✅ Categories fetched from ingredients:', uniqueCategories.length);
    return NextResponse.json({ categories: uniqueCategories });
  } catch (error) {
    console.error('❌ Exception fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getCategoryColor(category: string): string {
  const colorMap: { [key: string]: string } = {
    'Fruit': '#EC4899',
    'Vlees': '#EF4444',
    'Vis': '#3B82F6',
    'Groenten': '#8BAE5A',
    'Zuivel': '#06B6D4',
    'Noten': '#F97316',
    'Granen': '#F59E0B',
    'Eieren': '#F59E0B',
    'Eiwitten': '#EF4444',
    'Vetten': '#8B5CF6',
    'Peulvruchten': '#8BAE5A',
    'Orgaanvlees': '#EF4444'
  };
  return colorMap[category] || '#8BAE5A';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('➕ Creating new category:', body);

    // First try to insert into dedicated categories table
    const { data: dedicatedData, error: dedicatedError } = await supabase
      .from('categories')
      .insert([{
        name: body.name,
        description: body.description || null,
        color: body.color || '#8BAE5A',
        created_at: body.created_at,
        updated_at: body.updated_at
      }])
      .select()
      .single();

    if (!dedicatedError && dedicatedData) {
      console.log('✅ Category created in dedicated table:', dedicatedData);
      return NextResponse.json({ category: dedicatedData });
    }

    // If dedicated table doesn't exist, we can't persist new categories
    // Return error to inform user that they need to create the table first
    if (dedicatedError && dedicatedError.code === '42P01') {
      console.log('⚠️  No dedicated categories table exists');
      return NextResponse.json({ 
        error: 'Geen dedicated categories tabel gevonden. Nieuwe categorieën kunnen niet worden opgeslagen. Maak eerst de tabel aan in de database.',
        suggestion: 'Maak de categories tabel aan om nieuwe categorieën te kunnen toevoegen.'
      }, { status: 400 });
    }

    console.error('❌ Error creating category:', dedicatedError);
    return NextResponse.json({ error: dedicatedError?.message || 'Unknown error' }, { status: 500 });
  } catch (error) {
    console.error('❌ Exception creating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('✏️ Updating category:', body);

    const { data, error } = await supabase
      .from('categories')
      .update({
        name: body.name,
        description: body.description || null,
        color: body.color || '#8BAE5A',
        updated_at: body.updated_at
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Category updated successfully:', data);
    return NextResponse.json({ category: data });
  } catch (error) {
    console.error('❌ Exception updating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    console.log('🗑️ Deleting category:', id);

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Category deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Exception deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
