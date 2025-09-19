import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { userId, schemaId } = await request.json();
    
    console.log('🔍 [RESET API] Request received:', { 
      userId, 
      schemaId,
      userIdType: typeof userId,
      schemaIdType: typeof schemaId,
      timestamp: new Date().toISOString()
    });
    
    if (!userId || !schemaId) {
      console.log('❌ [RESET API] Missing required parameters');
      return NextResponse.json({ error: 'Missing userId or schemaId' }, { status: 400 });
    }

    console.log('🔄 Resetting training week for user:', userId, 'schema:', schemaId);

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
    // Try user_training_day_progress first, fallback to user_training_progress
    let resetError: any = null;
    
    // First try user_training_day_progress (if it exists)
    const { error: dayProgressError } = await supabase
      .from('user_training_day_progress')
      .update({ 
        completed: false,
        completed_at: null
      })
      .eq('user_id', userId)
      .in('schema_day_id', schemaDayIds);
    
    if (dayProgressError) {
      console.log('⚠️ [RESET API] user_training_day_progress table not found, trying user_training_progress:', {
        error: dayProgressError.message,
        code: dayProgressError.code,
        details: dayProgressError.details
      });
      
      // Fallback to user_training_progress table
      const { error: progressError } = await supabase
        .from('user_training_progress')
        .update({ 
          completed: false,
          completed_at: null
        })
        .eq('user_id', userId)
        .in('training_schema_id', schemaId);
      
      resetError = progressError;
    } else {
      resetError = dayProgressError;
    }

    if (resetError) {
      console.error('❌ Error resetting training week:', resetError);
      return NextResponse.json({ error: 'Failed to reset training week' }, { status: 500 });
    }

    console.log('✅ [RESET API] Training week reset successfully for user:', userId, 'schema:', schemaId);

    return NextResponse.json({ 
      success: true,
      message: 'Training week reset successfully'
    });

  } catch (error) {
    console.error('❌ Error in POST /api/reset-training-week:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}