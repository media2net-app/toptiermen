import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, rating, notes, exercises = [], userId, schemaId, dayNumber } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log('🏁 Completing workout session:', sessionId);

    // If we have userId, schemaId, and dayNumber, save the completion to database
    if (userId && schemaId && dayNumber) {
      try {
        // First, get the schema_day_id for this day
        const { data: schemaDay, error: schemaDayError } = await supabaseAdmin
          .from('training_schema_days')
          .select('id')
          .eq('schema_id', schemaId)
          .eq('day_number', dayNumber)
          .single();

        if (schemaDayError) {
          console.error('❌ Error finding schema day:', schemaDayError);
        } else if (schemaDay) {
          // Save or update the day completion
          const { error: completionError } = await supabaseAdmin
            .from('user_training_day_progress')
            .upsert({
              user_id: userId,
              schema_day_id: schemaDay.id,
              completed: true,
              completed_at: new Date().toISOString(),
              rating: rating || 5,
              notes: notes || 'Workout completed'
            }, { onConflict: 'user_id,schema_day_id' });

          if (completionError) {
            console.error('❌ Error saving day completion:', completionError);
          } else {
            console.log('✅ Day completion saved to database');
          }
        }
      } catch (dbError) {
        console.error('❌ Database error during completion:', dbError);
        // Don't fail the request if database save fails
      }
    }

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