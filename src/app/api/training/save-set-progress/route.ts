import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      sessionId, 
      exerciseId, 
      exerciseName, 
      setNumber, 
      reps, 
      weight, 
      completedAt 
    } = body;

    if (!userId || !sessionId || !exerciseId || !exerciseName || !setNumber) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    console.log('💾 Saving set progress:', {
      userId,
      sessionId,
      exerciseId,
      exerciseName,
      setNumber,
      reps,
      weight
    });

    // Save set progress to database
    const { data, error } = await supabaseAdmin
      .from('user_workout_set_progress')
      .upsert({
        user_id: userId,
        session_id: sessionId,
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        set_number: setNumber,
        reps: reps || null,
        weight: weight || null,
        completed_at: completedAt || new Date().toISOString()
      }, {
        onConflict: 'user_id,session_id,exercise_id,set_number'
      });

    if (error) {
      console.error('❌ Error saving set progress:', error);
      return NextResponse.json({ 
        error: 'Failed to save set progress' 
      }, { status: 500 });
    }

    console.log('✅ Set progress saved successfully');
    return NextResponse.json({ 
      success: true,
      data 
    });

  } catch (error) {
    console.error('❌ Error in save set progress:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId || !sessionId) {
      return NextResponse.json({ 
        error: 'User ID and Session ID are required' 
      }, { status: 400 });
    }

    console.log('📊 Fetching set progress for user:', userId, 'session:', sessionId);

    // Get set progress from database
    const { data, error } = await supabaseAdmin
      .from('user_workout_set_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('exercise_name, set_number');

    if (error) {
      console.error('❌ Error fetching set progress:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch set progress' 
      }, { status: 500 });
    }

    console.log('✅ Set progress fetched successfully:', data?.length || 0, 'sets');
    return NextResponse.json({ 
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('❌ Error in fetch set progress:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
