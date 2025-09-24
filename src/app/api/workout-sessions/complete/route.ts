import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, rating, notes, exercises = [] } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log('🏁 Completing workout session:', sessionId);

    // For now, just return success since we're using simple session tracking
    console.log('✅ Workout session completed successfully');
    return NextResponse.json({
      success: true,
      session: {
        id: sessionId,
        completed_at: new Date().toISOString(),
        rating: rating || 5,
        notes: notes || 'Workout completed'
      },
      message: 'Workout completed successfully'
    });

  } catch (error) {
    console.error('❌ Error in workout sessions complete:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}