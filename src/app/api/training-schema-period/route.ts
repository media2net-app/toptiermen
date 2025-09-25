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

    // First, update profiles table with schema selection
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        selected_schema_id: schemaId
      })
      .eq('id', actualUserId);

    if (profileError) {
      console.error('❌ Error updating profile:', profileError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Create or update schema period in user_schema_periods table
    const { data: periodData, error: periodError } = await supabase
      .from('user_schema_periods')
      .upsert({
        user_id: actualUserId,
        training_schema_id: schemaId,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        status: 'active'
      }, { 
        onConflict: 'user_id,training_schema_id,status',
        ignoreDuplicates: false 
      })
      .select(`
        id,
        training_schema_id,
        start_date,
        end_date,
        status,
        training_schemas (
          id,
          name,
          description,
          difficulty,
          schema_nummer
        )
      `)
      .single();

    if (periodError) {
      console.error('❌ Error creating schema period:', periodError);
      return NextResponse.json({ error: 'Failed to create schema period' }, { status: 500 });
    }

    console.log('✅ Training schema period created:', periodData);

    return NextResponse.json({ 
      success: true,
      data: {
        selected_schema_id: periodData.training_schema_id,
        schema_start_date: periodData.start_date,
        schema_end_date: periodData.end_date,
        training_schema: periodData.training_schemas
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

    // Get current schema period from user_schema_periods table
    const { data: schemaPeriod, error: periodError } = await supabase
      .from('user_schema_periods')
      .select(`
        id,
        training_schema_id,
        start_date,
        end_date,
        status,
        training_schemas (
          id,
          name,
          description,
          difficulty,
          schema_nummer
        )
      `)
      .eq('user_id', actualUserId)
      .eq('status', 'active')
      .single();

    if (periodError) {
      console.log('⚠️ No active schema period found for user:', periodError.message);
      return NextResponse.json({ data: null });
    }

    console.log('✅ Current schema period found:', schemaPeriod);

    return NextResponse.json({ 
      data: {
        selected_schema_id: schemaPeriod.training_schema_id,
        schema_start_date: schemaPeriod.start_date,
        schema_end_date: schemaPeriod.end_date,
        training_schema: schemaPeriod.training_schemas
      }
    });

  } catch (error) {
    console.error('❌ Error in GET /api/training-schema-period:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
