import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, schemaId } = await request.json();
    
    if (!userId || !schemaId) {
      return NextResponse.json({ error: 'Missing userId or schemaId' }, { status: 400 });
    }

    console.log('🔄 Resetting training week for user:', userId, 'schema:', schemaId);

    const supabase = createClient();

    // Reset all training days for the user's active schema
    const { error } = await supabase
      .from('user_training_progress')
      .update({ 
        is_completed: false,
        completed_at: null
      })
      .eq('user_id', userId)
      .eq('schema_id', schemaId);

    if (error) {
      console.error('❌ Error resetting training week:', error);
      return NextResponse.json({ error: 'Failed to reset training week' }, { status: 500 });
    }

    console.log('✅ Training week reset successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Training week reset successfully'
    });

  } catch (error) {
    console.error('❌ Error in POST /api/reset-training-week:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}