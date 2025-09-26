import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, exerciseId, setNumber, weight } = body;

    if (!userId || !sessionId || !exerciseId || setNumber === undefined || weight === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('💪 Saving weight data:', { userId, sessionId, exerciseId, setNumber, weight });

    // Save weight data to user_workout_set_progress table
    const { data, error } = await supabaseAdmin
      .from('user_workout_set_progress')
      .upsert({
        user_id: userId,
        session_id: sessionId,
        exercise_id: exerciseId,
        set_number: setNumber,
        weight_used: weight,
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,session_id,exercise_id,set_number'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving weight data:', error);
      return NextResponse.json({ error: 'Failed to save weight data' }, { status: 500 });
    }

    console.log('✅ Weight data saved successfully:', data);

    return NextResponse.json({ 
      success: true, 
      message: 'Weight data saved successfully',
      data 
    });

  } catch (error) {
    console.error('❌ Error in save-weight API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
