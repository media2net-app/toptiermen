import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    console.log('📊 Fetching unit types from database...');
    
    // First try to get from dedicated unit_types table
    const { data: dedicatedData, error: dedicatedError } = await supabase
      .from('unit_types')
      .select('*')
      .order('name', { ascending: true });

    if (!dedicatedError && dedicatedData) {
      console.log('✅ Unit types fetched from dedicated table:', dedicatedData.length);
      return NextResponse.json({ unitTypes: dedicatedData });
    }

    // Fallback: get unique unit types from nutrition_ingredients
    console.log('📋 No dedicated table, fetching from nutrition_ingredients...');
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('nutrition_ingredients')
      .select('unit_type')
      .not('unit_type', 'is', null);

    if (ingredientsError) {
      console.error('❌ Error fetching unit types from ingredients:', ingredientsError);
      return NextResponse.json({ error: ingredientsError.message }, { status: 500 });
    }

    // Convert to unit types format
    const uniqueUnitTypes = [...new Set(ingredients.map(item => item.unit_type))]
      .map(unitType => ({
        name: getUnitTypeDisplayName(unitType),
        value: unitType,
        description: `Bestaande unit type uit ingrediënten`
      }));

    console.log('✅ Unit types fetched from ingredients:', uniqueUnitTypes.length);
    return NextResponse.json({ unitTypes: uniqueUnitTypes });
  } catch (error) {
    console.error('❌ Exception fetching unit types:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getUnitTypeDisplayName(unitType: string): string {
  const displayNames: { [key: string]: string } = {
    'per_100g': 'Per 100 gram',
    'per_30g': 'Per 30 gram',
    'per_piece': 'Per stuk',
    'per_handful': 'Per handje'
  };
  return displayNames[unitType] || unitType;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('➕ Creating new unit type:', body);

    // First try to insert into dedicated unit_types table
    const { data: dedicatedData, error: dedicatedError } = await supabase
      .from('unit_types')
      .insert([{
        name: body.name,
        value: body.value,
        description: body.description || null,
        created_at: body.created_at,
        updated_at: body.updated_at
      }])
      .select()
      .single();

    if (!dedicatedError && dedicatedData) {
      console.log('✅ Unit type created in dedicated table:', dedicatedData);
      return NextResponse.json({ unitType: dedicatedData });
    }

    // If dedicated table doesn't exist, we can't persist new unit types
    // Return error to inform user that they need to create the table first
    if (dedicatedError && dedicatedError.code === '42P01') {
      console.log('⚠️  No dedicated unit_types table exists');
      return NextResponse.json({ 
        error: 'Geen dedicated unit_types tabel gevonden. Nieuwe unit types kunnen niet worden opgeslagen. Maak eerst de tabel aan in de database.',
        suggestion: 'Maak de unit_types tabel aan om nieuwe unit types te kunnen toevoegen.'
      }, { status: 400 });
    }

    console.error('❌ Error creating unit type:', dedicatedError);
    return NextResponse.json({ error: dedicatedError?.message || 'Unknown error' }, { status: 500 });
  } catch (error) {
    console.error('❌ Exception creating unit type:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('✏️ Updating unit type:', body);

    const { data, error } = await supabase
      .from('unit_types')
      .update({
        name: body.name,
        value: body.value,
        description: body.description || null,
        updated_at: body.updated_at
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating unit type:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Unit type updated successfully:', data);
    return NextResponse.json({ unitType: data });
  } catch (error) {
    console.error('❌ Exception updating unit type:', error);
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

    console.log('🗑️ Deleting unit type:', id);

    const { error } = await supabase
      .from('unit_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting unit type:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Unit type deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Exception deleting unit type:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
