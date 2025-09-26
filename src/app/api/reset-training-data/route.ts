import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST - Reset all training data for a user when switching schemas
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Resetting training data for schema switch...');
    
    const body = await request.json();
    const { userId, newSchemaId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔄 Resetting training data for user:', userId, 'to new schema:', newSchemaId);

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
          console.log('✅ Converted email to UUID for reset:', actualUserId);
        } else {
          console.log('❌ Failed to convert email to UUID');
          return NextResponse.json({ 
            success: false, 
            error: 'User not found' 
          }, { status: 404 });
        }
      } catch (error) {
        console.log('❌ Error converting email to UUID for reset:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid user ID' 
        }, { status: 400 });
      }
    }

    // 1. Delete all existing schema periods for this user
    console.log('🔄 Deleting existing schema periods...');
    const { error: periodsError } = await supabaseAdmin
      .from('user_schema_periods')
      .delete()
      .eq('user_id', actualUserId);

    if (periodsError) {
      console.error('❌ Error deleting schema periods:', periodsError);
      return NextResponse.json({ error: 'Failed to delete schema periods' }, { status: 500 });
    }

    // 2. Delete all week completions for this user
    console.log('🔄 Deleting week completions...');
    const { error: weekCompletionsError } = await supabaseAdmin
      .from('user_week_completions')
      .delete()
      .eq('user_id', actualUserId);

    if (weekCompletionsError) {
      console.error('❌ Error deleting week completions:', weekCompletionsError);
      return NextResponse.json({ error: 'Failed to delete week completions' }, { status: 500 });
    }

    // 3. Delete all workout sessions for this user
    console.log('🔄 Deleting workout sessions...');
    const { error: sessionsError } = await supabaseAdmin
      .from('workout_sessions')
      .delete()
      .eq('user_id', actualUserId);

    if (sessionsError) {
      console.error('❌ Error deleting workout sessions:', sessionsError);
      return NextResponse.json({ error: 'Failed to delete workout sessions' }, { status: 500 });
    }

    // 4. Delete all workout progress for this user
    console.log('🔄 Deleting workout progress...');
    const { error: progressError } = await supabaseAdmin
      .from('user_workout_progress')
      .delete()
      .eq('user_id', actualUserId);

    if (progressError) {
      console.error('❌ Error deleting workout progress:', progressError);
      return NextResponse.json({ error: 'Failed to delete workout progress' }, { status: 500 });
    }

    // 5. Clear localStorage data by setting a flag that the frontend can check
    console.log('🔄 Training data reset completed successfully');
    
    return NextResponse.json({ 
      success: true,
      message: 'All training data has been reset for schema switch',
      resetTimestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Unexpected error resetting training data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
