import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Fetch user's current schema period
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_schema_periods')
      .select(`
        *,
        training_schemas (
          id,
          name,
          description,
          difficulty,
          schema_nummer
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching schema period:', error);
      return NextResponse.json({ error: 'Failed to fetch schema period' }, { status: 500 });
    }

    return NextResponse.json({ data: data || null });
  } catch (error) {
    console.error('Error in GET /api/user/schema-periods:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new schema period
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, trainingSchemaId, startDate } = body;

    if (!userId || !trainingSchemaId || !startDate) {
      return NextResponse.json({ 
        error: 'userId, trainingSchemaId, and startDate are required' 
      }, { status: 400 });
    }

    // First, deactivate any existing active periods for this user
    await supabase
      .from('user_schema_periods')
      .update({ status: 'completed' })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Create new schema period
    const { data, error } = await supabase
      .from('user_schema_periods')
      .insert({
        user_id: userId,
        training_schema_id: trainingSchemaId,
        start_date: startDate,
        status: 'active'
      })
      .select(`
        *,
        training_schemas (
          id,
          name,
          description,
          difficulty,
          schema_nummer
        )
      `)
      .single();

    if (error) {
      console.error('Error creating schema period:', error);
      return NextResponse.json({ error: 'Failed to create schema period' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in POST /api/user/schema-periods:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update schema period status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { periodId, status } = body;

    if (!periodId || !status) {
      return NextResponse.json({ 
        error: 'periodId and status are required' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_schema_periods')
      .update({ status })
      .eq('id', periodId)
      .select(`
        *,
        training_schemas (
          id,
          name,
          description,
          difficulty,
          schema_nummer
        )
      `)
      .single();

    if (error) {
      console.error('Error updating schema period:', error);
      return NextResponse.json({ error: 'Failed to update schema period' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/user/schema-periods:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
