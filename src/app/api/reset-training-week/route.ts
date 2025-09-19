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

    // First get all schema day IDs for this schema
    const { data: schemaDays, error: schemaDaysError } = await supabase
      .from('training_schema_days')
      .select('id')
      .eq('schema_id', schemaId);

    if (schemaDaysError) {
      console.error('❌ Error fetching schema days:', schemaDaysError);
      return NextResponse.json({ error: 'Failed to fetch schema days' }, { status: 500 });
    }

    if (!schemaDays || schemaDays.length === 0) {
      console.log('⚠️ No schema days found for schema:', schemaId);
      return NextResponse.json({ error: 'No schema days found' }, { status: 404 });
    }

    const schemaDayIds = schemaDays.map(day => day.id);
    console.log('📋 Found schema day IDs:', schemaDayIds);

    // Reset all training days for the user's active schema
    const { error } = await supabase
      .from('user_training_day_progress')
      .update({ 
        completed: false,
        completed_at: null
      })
      .eq('user_id', userId)
      .in('schema_day_id', schemaDayIds);

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