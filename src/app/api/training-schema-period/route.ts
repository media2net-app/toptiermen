import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST - Create or update training schema period
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, schemaId, startDate } = body;

    if (!userId || !schemaId) {
      return NextResponse.json({ 
        error: 'userId and schemaId are required' 
      }, { status: 400 });
    }

    console.log('📅 Creating training schema period:', { userId, schemaId, startDate });
    console.log('📅 Request body:', body);

    // Check if userId is an email and convert to UUID if needed
    let actualUserId = userId;
    if (userId.includes('@')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/get-user-uuid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userId })
        });
        
        if (response.ok) {
          const { uuid } = await response.json();
          actualUserId = uuid;
          console.log('✅ Converted email to UUID for schema period:', actualUserId);
        } else {
          console.log('❌ Failed to convert email to UUID, response status:', response.status);
          return NextResponse.json({ 
            error: 'User not found' 
          }, { status: 404 });
        }
      } catch (error) {
        console.log('❌ Error converting email to UUID for schema period:', error);
        return NextResponse.json({ 
          error: 'Invalid user ID' 
        }, { status: 400 });
      }
    }

    // Calculate end date (8 weeks from start date)
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + (8 * 7)); // 8 weeks

    // Update profiles table with schema selection (dates will be handled separately)
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        selected_schema_id: schemaId
      })
      .eq('id', actualUserId)
      .select(`
        selected_schema_id,
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
      console.error('❌ Error creating schema period:', error);
      return NextResponse.json({ error: 'Failed to create schema period' }, { status: 500 });
    }

    console.log('✅ Training schema period created:', data);

    return NextResponse.json({ 
      success: true,
      data: {
        selected_schema_id: data.selected_schema_id,
        schema_start_date: start.toISOString(),
        schema_end_date: end.toISOString(),
        training_schema: data.training_schemas
      }
    });

  } catch (error) {
    console.error('❌ Error in POST /api/training-schema-period:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Fetch current training schema period
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📅 Fetching training schema period for user:', userId);

    // Check if userId is an email and convert to UUID if needed
    let actualUserId = userId;
    if (userId.includes('@')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/get-user-uuid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userId })
        });
        
        if (response.ok) {
          const { uuid } = await response.json();
          actualUserId = uuid;
        }
      } catch (error) {
        console.log('❌ Error converting email to UUID:', error);
      }
    }

    // Get current schema period from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        selected_schema_id,
        training_schemas (
          id,
          name,
          description,
          difficulty,
          schema_nummer
        )
      `)
      .eq('id', actualUserId)
      .single();

    if (error) {
      console.log('⚠️ No schema period found for user:', error.message);
      return NextResponse.json({ data: null });
    }

    // For now, we'll assume the schema period is active if a schema is selected
    // In the future, we can add proper date tracking

    console.log('✅ Current schema period found:', data);

    // Simulate start and end dates (8 weeks from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (8 * 7)); // 8 weeks

    return NextResponse.json({ 
      data: {
        selected_schema_id: data.selected_schema_id,
        schema_start_date: startDate.toISOString(),
        schema_end_date: endDate.toISOString(),
        training_schema: data.training_schemas
      }
    });

  } catch (error) {
    console.error('❌ Error in GET /api/training-schema-period:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
