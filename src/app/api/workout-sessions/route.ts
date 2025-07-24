import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, schemaId, dayNumber, mode = 'interactive' } = body;

    console.log('🏋️ Starting workout session:', { userId, schemaId, dayNumber, mode });

    if (!userId || !schemaId || !dayNumber) {
      console.log('❌ Missing required fields:', { userId, schemaId, dayNumber });
      return NextResponse.json({ 
        error: 'User ID, schema ID, and day number are required' 
      }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId) || !uuidRegex.test(schemaId)) {
      console.log('❌ Invalid UUID format:', { userId, schemaId });
      return NextResponse.json({ 
        error: 'Invalid UUID format for user ID or schema ID' 
      }, { status: 400 });
    }

    console.log('✅ Validating data and creating session...');

    // Create new workout session
    const { data: session, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        schema_id: schemaId,
        day_number: dayNumber,
        mode: mode,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.log('❌ Error creating workout session:', error.message);
      console.log('❌ Error details:', error);
      return NextResponse.json({ error: 'Failed to start workout session' }, { status: 500 });
    }

    console.log('✅ Workout session started successfully:', session.id);
    return NextResponse.json({
      success: true,
      session: session
    });

  } catch (error) {
    console.error('❌ Error in workout sessions POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 Fetching workout sessions for user:', userId);

    let query = supabase
      .from('workout_sessions')
      .select(`
        *,
        training_schemas(name, description),
        workout_exercises(*)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (sessionId) {
      query = query.eq('id', sessionId);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.log('❌ Error fetching workout sessions:', error.message);
      return NextResponse.json({ error: 'Failed to fetch workout sessions' }, { status: 500 });
    }

    console.log('✅ Workout sessions fetched successfully');
    return NextResponse.json({
      success: true,
      sessions: sessions
    });

  } catch (error) {
    console.error('❌ Error in workout sessions GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 