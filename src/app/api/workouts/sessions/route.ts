import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('💪 Fetching workout sessions...');

    if (sessionId) {
      // Get specific session with all data
      const { data: session, error: sessionError } = await supabase
        .from('user_workout_sessions')
        .select(`
          *,
          workout_templates (
            id,
            name,
            description,
            difficulty_level,
            estimated_duration_minutes
          ),
          user_exercise_performances (
            id,
            set_number,
            weight_kg,
            reps_completed,
            reps_target,
            rest_seconds,
            rpe,
            notes,
            exercises (
              id,
              name,
              description,
              instructions,
              video_url,
              image_url,
              muscle_groups
            )
          )
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('❌ Error fetching workout session:', sessionError);
        return NextResponse.json({ error: 'Failed to fetch workout session' }, { status: 500 });
      }

      return NextResponse.json({ session });
    } else {
      // Get user's workout sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_workout_sessions')
        .select(`
          *,
          workout_templates (
            id,
            name,
            description,
            difficulty_level,
            estimated_duration_minutes
          )
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (sessionsError) {
        console.error('❌ Error fetching workout sessions:', sessionsError);
        return NextResponse.json({ error: 'Failed to fetch workout sessions' }, { status: 500 });
      }

      return NextResponse.json({ sessions: sessions || [] });
    }
  } catch (error) {
    console.error('❌ Workout sessions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      template_id,
      session_name,
      notes
    } = body;

    console.log('💪 Creating workout session:', session_name);

    const { data: session, error: sessionError } = await supabase
      .from('user_workout_sessions')
      .insert({
        user_id,
        template_id,
        session_name,
        notes,
        status: 'in_progress'
      })
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Error creating workout session:', sessionError);
      return NextResponse.json({ error: 'Failed to create workout session' }, { status: 500 });
    }

    console.log('✅ Workout session created successfully:', session.id);
    return NextResponse.json({ session });
  } catch (error) {
    console.error('❌ Workout sessions POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      status,
      duration_minutes,
      notes,
      exercise_performances
    } = body;

    console.log('💪 Updating workout session:', session_id);

    // Update session
    const { data: session, error: sessionError } = await supabase
      .from('user_workout_sessions')
      .update({
        status,
        duration_minutes,
        notes,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', session_id)
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Error updating workout session:', sessionError);
      return NextResponse.json({ error: 'Failed to update workout session' }, { status: 500 });
    }

    // Update exercise performances
    if (exercise_performances && exercise_performances.length > 0) {
      for (const performance of exercise_performances) {
        const { error: performanceError } = await supabase
          .from('user_exercise_performances')
          .upsert({
            session_id,
            exercise_id: performance.exercise_id,
            set_number: performance.set_number,
            weight_kg: performance.weight_kg,
            reps_completed: performance.reps_completed,
            reps_target: performance.reps_target,
            rest_seconds: performance.rest_seconds,
            rpe: performance.rpe,
            notes: performance.notes
          });

        if (performanceError) {
          console.error('❌ Error updating exercise performance:', performanceError);
        }
      }
    }

    console.log('✅ Workout session updated successfully:', session.id);
    return NextResponse.json({ session });
  } catch (error) {
    console.error('❌ Workout sessions PUT API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
