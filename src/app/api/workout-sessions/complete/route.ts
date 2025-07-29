import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper error handling
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    const body = await request.json();
    const { sessionId, rating, notes, exercises = [] } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log('🏁 Completing workout session:', sessionId);

    // Calculate duration
    const { data: session } = await supabase
      .from('workout_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single();

    let durationMinutes = null;
    if (session?.started_at) {
      const startTime = new Date(session.started_at);
      const endTime = new Date();
      durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    }

    // Update workout session
    const { data: updatedSession, error: updateError } = await supabase
      .from('workout_sessions')
      .update({
        completed_at: new Date().toISOString(),
        duration_minutes: durationMinutes,
        rating: rating,
        notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Error updating workout session:', updateError.message);
      return NextResponse.json({ error: 'Failed to complete workout session' }, { status: 500 });
    }

    // Insert exercises if provided
    if (exercises.length > 0) {
      const exerciseData = exercises.map((exercise: any) => ({
        session_id: sessionId,
        exercise_name: exercise.name,
        sets_completed: exercise.sets || 0,
        reps_completed: exercise.reps || 0,
        weight_kg: exercise.weight || null,
        rest_time_seconds: exercise.restTime || 0,
        notes: exercise.notes || null
      }));

      const { error: exerciseError } = await supabase
        .from('workout_exercises')
        .insert(exerciseData);

      if (exerciseError) {
        console.log('❌ Error inserting exercises:', exerciseError.message);
        // Don't fail the whole request, just log the error
      }
    }

    // Update user progress for the training day
    const { data: sessionData } = await supabase
      .from('workout_sessions')
      .select('user_id, schema_id, day_number')
      .eq('id', sessionId)
      .single();

    if (sessionData) {
      // Update user training progress
      const { error: progressError } = await supabase
        .from('user_training_progress')
        .upsert({
          user_id: sessionData.user_id,
          schema_id: sessionData.schema_id,
          current_day: sessionData.day_number + 1,
          completed_days: sessionData.day_number,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,schema_id'
        });

      if (progressError) {
        console.log('❌ Error updating user progress:', progressError.message);
      }
    }

    console.log('✅ Workout session completed successfully');
    return NextResponse.json({
      success: true,
      session: updatedSession,
      durationMinutes: durationMinutes
    });

  } catch (error) {
    console.error('❌ Error in workout session complete:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 