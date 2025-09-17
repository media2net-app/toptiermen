import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { userId, schemaId } = await request.json();

    if (!userId || !schemaId) {
      return NextResponse.json({ error: 'Missing userId or schemaId' }, { status: 400 });
    }

    console.log('🔄 Resetting training week for user:', userId, 'schema:', schemaId);

    // Get all training days for this schema
    const { data: daysData, error: daysError } = await supabase
      .from('training_schema_days')
      .select('id')
      .eq('schema_id', schemaId);

    if (daysError) {
      console.error('❌ Error fetching training days:', daysError);
      return NextResponse.json({ error: 'Failed to fetch training days' }, { status: 500 });
    }

    if (!daysData || daysData.length === 0) {
      console.error('❌ No training days found for schema:', schemaId);
      return NextResponse.json({ error: 'No training days found' }, { status: 404 });
    }

    const dayIds = daysData.map(day => day.id);

    // Reset all day completion records for this user and schema
    const { error: resetError } = await supabase
      .from('user_training_day_progress')
      .delete()
      .eq('user_id', userId)
      .in('schema_day_id', dayIds);

    if (resetError) {
      console.error('❌ Error resetting day progress:', resetError);
      return NextResponse.json({ error: 'Failed to reset day progress' }, { status: 500 });
    }

    // Reset general progress to start from day 1
    const { error: progressError } = await supabase
      .from('user_training_schema_progress')
      .upsert({
        user_id: userId,
        schema_id: schemaId,
        current_day: 1,
        total_days_completed: 0,
        total_workouts_completed: 0,
        last_workout_date: null,
        started_at: new Date().toISOString(),
        completed_at: null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,schema_id'
      });

    if (progressError) {
      console.error('❌ Error resetting schema progress:', progressError);
      return NextResponse.json({ error: 'Failed to reset schema progress' }, { status: 500 });
    }

    console.log('✅ Training week reset successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Training week reset successfully',
      resetDays: dayIds.length
    });

  } catch (error) {
    console.error('❌ Error in reset-training-week:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
