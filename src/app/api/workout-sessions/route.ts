import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

    // Create a simple session ID for tracking
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('✅ Workout session started successfully:', sessionId);
    return NextResponse.json({
      success: true,
      session: {
        id: sessionId,
        user_id: userId,
        template_id: schemaId,
        day_number: dayNumber,
        mode: mode,
        started_at: new Date().toISOString()
      }
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

    // Return empty array for now since we're using simple session tracking
    return NextResponse.json({ sessions: [] });

  } catch (error) {
    console.error('❌ Error in workout sessions GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}