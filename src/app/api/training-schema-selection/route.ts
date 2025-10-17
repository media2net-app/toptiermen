import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const getSupabaseAdminClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, schemaId } = body;

    if (!userId || !schemaId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and Schema ID are required' 
      }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🎯 Selecting training schema:', { userId, schemaId });
    
    // Check if userId is an email and convert to UUID if needed
    let actualUserId = userId;
    if (userId.includes('@')) {
      try {
        // Use the existing get-user-uuid API endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/get-user-uuid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userId })
        });
        
        if (response.ok) {
          const { uuid } = await response.json();
          actualUserId = uuid;
          console.log('✅ Converted email to UUID for schema selection:', actualUserId);
        } else {
          console.log('❌ Failed to convert email to UUID');
          return NextResponse.json({ 
            success: false, 
            error: 'User not found' 
          }, { status: 404 });
        }
      } catch (error) {
        console.log('❌ Error converting email to UUID for schema selection:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid user ID' 
        }, { status: 400 });
      }
    }
    
    // Store schema selection in profiles table
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ selected_schema_id: schemaId })
      .eq('id', actualUserId)
      .select();

    if (updateError) {
      console.error('❌ Error updating profile with schema selection:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save schema selection' 
      }, { status: 500 });
    }

    console.log('✅ Training schema selected and saved:', { userId: actualUserId, schemaId });

    // Ensure a progress row exists for the selected schema (active)
    const nowIso = new Date().toISOString();
    const { data: existingProgress, error: progressCheckErr } = await supabase
      .from('user_training_schema_progress')
      .select('schema_id, completed_at')
      .eq('user_id', actualUserId)
      .eq('schema_id', schemaId)
      .maybeSingle();

    if (progressCheckErr) {
      console.warn('⚠️ Could not check existing progress row:', progressCheckErr.message);
    }

    if (!existingProgress) {
      const { error: insertProgressErr } = await supabase
        .from('user_training_schema_progress')
        .insert({
          user_id: actualUserId,
          schema_id: schemaId,
          current_day: 1,
          total_days_completed: 0,
          total_workouts_completed: 0,
          started_at: nowIso,
          completed_at: null
        });
      if (insertProgressErr) {
        console.error('❌ Failed creating active progress row for selected schema:', insertProgressErr.message);
      } else {
        console.log('✅ Created active progress row for selected schema');
      }
    } else if (existingProgress.completed_at) {
      // If a completed row exists for this schema, re-activate it by clearing completed_at and resetting day
      const { error: reactivateErr } = await supabase
        .from('user_training_schema_progress')
        .update({ completed_at: null, current_day: 1 })
        .eq('user_id', actualUserId)
        .eq('schema_id', schemaId);
      if (reactivateErr) {
        console.warn('⚠️ Could not reactivate existing progress row:', reactivateErr.message);
      } else {
        console.log('🔄 Reactivated existing progress row for selected schema');
      }
    }

    // Mark all other progress rows as completed to ensure only one active schema
    const { error: completeOthersErr } = await supabase
      .from('user_training_schema_progress')
      .update({ completed_at: nowIso })
      .eq('user_id', actualUserId)
      .neq('schema_id', schemaId)
      .is('completed_at', null);
    if (completeOthersErr) {
      console.warn('⚠️ Could not mark other schemas as completed:', completeOthersErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Training schema selection saved, set active, and other schemas closed',
      data: updateData
    });
  
  } catch (error) {
    console.error('❌ Error in training-schema-selection:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
