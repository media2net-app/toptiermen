import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST - Create or update training schema period
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, schemaId, startDate, action } = body;

    if (!userId) {
      return NextResponse.json({ 
        error: 'userId is required' 
      }, { status: 400 });
    }

    // Handle deactivate action
    if (action === 'deactivate') {
      console.log('📅 Deactivating training schema period for user:', userId);
      
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
            console.log('✅ Converted email to UUID for deactivation:', actualUserId);
          }
        } catch (error) {
          console.log('❌ Error converting email to UUID for deactivation:', error);
        }
      }

      // First, check if there are any active periods to deactivate
      const { data: activePeriods, error: checkError } = await supabase
        .from('user_schema_periods')
        .select('id, training_schema_id')
        .eq('user_id', actualUserId)
        .eq('status', 'active');

      if (checkError) {
        console.error('❌ Error checking active periods:', checkError);
        return NextResponse.json({ error: 'Failed to check active periods' }, { status: 500 });
      }

      // If there are active periods, deactivate them
      if (activePeriods && activePeriods.length > 0) {
        console.log('📅 Found active periods to deactivate:', activePeriods.length);
        
        // Delete active periods instead of updating to avoid constraint issues
        const { error: deleteError } = await supabase
          .from('user_schema_periods')
          .delete()
          .eq('user_id', actualUserId)
          .eq('status', 'active');

        if (deleteError) {
          console.error('❌ Error deleting active periods:', deleteError);
          return NextResponse.json({ error: 'Failed to deactivate schema period' }, { status: 500 });
        }
        
        console.log('✅ Active periods deleted successfully');
      } else {
        console.log('ℹ️ No active periods found to deactivate');
      }

      console.log('✅ Training schema period deactivated successfully');
      return NextResponse.json({ 
        success: true,
        message: 'Schema period deactivated successfully'
      });
    }

    // Original logic for creating/updating schema periods
    if (!schemaId) {
      return NextResponse.json({ 
        error: 'schemaId is required for creating schema periods' 
      }, { status: 400 });
    }

    console.log('📅 Creating training schema period:', { userId, schemaId, startDate });
    console.log('📅 Request body:', body);

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
          console.log('✅ Converted email to UUID for schema period:', actualUserId);
        } else {
          console.log('❌ Failed to convert email to UUID, response status:', response.status);
          return NextResponse.json({ 
            error: 'User not found' 
          }, { status: 404 });
        }
      } catch (error) {
        console.log('❌ Error converting email to UUID for schema period:', error);
        return NextResponse.json({ 
          error: 'Invalid user ID' 
        }, { status: 400 });
      }
    }

    // Calculate end date (8 weeks from start date)
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + (8 * 7)); // 8 weeks

    // First, check if user has an existing active schema
    const { data: existingPeriods, error: checkError } = await supabase
      .from('user_schema_periods')
      .select('training_schema_id')
      .eq('user_id', actualUserId)
      .eq('status', 'active')
      .single();

    // If switching to a different schema, decide whether to reset based on completion
    if (existingPeriods && existingPeriods.training_schema_id !== schemaId) {
      let shouldReset = true;
      try {
        // 1) Check if existing schema progress is completed
        const { data: progress } = await supabase
          .from('user_training_schema_progress')
          .select('completed_days, completed_at')
          .eq('user_id', actualUserId)
          .eq('schema_id', existingPeriods.training_schema_id)
          .maybeSingle();

        // 2) Determine frequency for completion threshold
        let freq = 7;
        const { data: tp } = await supabase
          .from('user_training_profiles')
          .select('training_frequency')
          .eq('user_id', actualUserId)
          .maybeSingle();
        if (tp && typeof tp.training_frequency === 'number') freq = Math.max(1, tp.training_frequency);

        // 3) If completed_at set or days >= freq*8, we consider the previous schema completed
        const days = progress?.completed_days ?? 0;
        const completed = !!progress?.completed_at || days >= freq * 8;
        if (completed) {
          shouldReset = false; // keep historical data when progressing to next schema
          console.log('ℹ️ Previous schema completed; skipping reset and preserving progress.');
        }
      } catch (e) {
        console.log('⚠️ Could not evaluate completion state, defaulting to reset');
      }

      if (shouldReset) {
        console.log('🔄 Switching mid-period (not completed), resetting training data...');
        try {
          const resetResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/reset-training-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: actualUserId, newSchemaId: schemaId })
          });
          if (resetResponse.ok) {
            console.log('✅ Training data reset successfully');
          } else {
            console.log('⚠️ Warning: Failed to reset training data, continuing with schema switch');
          }
        } catch (error) {
          console.log('⚠️ Warning: Error calling reset API, continuing with schema switch:', error);
        }
      }
    }

    // Deactivate all existing active periods for this user
    const { error: deactivateError } = await supabase
      .from('user_schema_periods')
      .update({ status: 'completed' })
      .eq('user_id', actualUserId)
      .eq('status', 'active');

    if (deactivateError) {
      console.log('⚠️ Warning deactivating existing periods:', deactivateError.message);
      // Don't fail here, just log the warning
    } else {
      console.log('✅ All existing active periods deactivated');
    }

    // Then, update profiles table with schema selection
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        selected_schema_id: schemaId
      })
      .eq('id', actualUserId);

    if (profileError) {
      console.error('❌ Error updating profile:', profileError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Create or update schema period in user_schema_periods table
    const { data: periodData, error: periodError } = await supabase
      .from('user_schema_periods')
      .upsert({
        user_id: actualUserId,
        training_schema_id: schemaId,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        status: 'active'
      }, { 
        onConflict: 'user_id,training_schema_id,status',
        ignoreDuplicates: false 
      })
      .select(`
        id,
        training_schema_id,
        start_date,
        end_date,
        status,
        training_schemas (
          id,
          name,
          description,
          difficulty,
          schema_nummer
        )
      `)
      .single();

    if (periodError) {
      console.error('❌ Error creating schema period:', periodError);
      return NextResponse.json({ error: 'Failed to create schema period' }, { status: 500 });
    }

    console.log('✅ Training schema period created:', periodData);

    // Ensure a progress row exists for the newly selected schema (initialize at 0/freq*8)
    try {
      // Determine frequency for target total days
      let freq = 7;
      const { data: tp2 } = await supabase
        .from('user_training_profiles')
        .select('training_frequency')
        .eq('user_id', actualUserId)
        .maybeSingle();
      if (tp2 && typeof tp2.training_frequency === 'number') freq = Math.max(1, tp2.training_frequency);

      const { data: existingProgress } = await supabase
        .from('user_training_schema_progress')
        .select('id')
        .eq('user_id', actualUserId)
        .eq('schema_id', schemaId)
        .maybeSingle();
      if (!existingProgress) {
        const nowIso = new Date().toISOString();
        await supabase
          .from('user_training_schema_progress')
          .insert({
            user_id: actualUserId,
            schema_id: schemaId,
            completed_days: 0,
            total_days: freq * 8,
            current_day: 0,
            started_at: nowIso,
          });
      }
    } catch (initErr) {
      console.log('⚠️ Could not initialize progress for new schema:', initErr);
    }

    return NextResponse.json({ 
      success: true,
      data: {
        selected_schema_id: periodData.training_schema_id,
        schema_start_date: periodData.start_date,
        schema_end_date: periodData.end_date,
        training_schema: periodData.training_schemas
      }
    });

  } catch (error) {
    console.error('❌ Error in POST /api/training-schema-period:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Fetch current training schema period
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📅 Fetching training schema period for user:', userId);

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
        }
      } catch (error) {
        console.log('❌ Error converting email to UUID:', error);
      }
    }

    // Get current schema period from user_schema_periods table
    const { data: schemaPeriod, error: periodError } = await supabase
      .from('user_schema_periods')
      .select(`
        id,
        training_schema_id,
        start_date,
        end_date,
        status,
        training_schemas (
          id,
          name,
          description,
          difficulty,
          schema_nummer
        )
      `)
      .eq('user_id', actualUserId)
      .eq('status', 'active')
      .single();

    if (periodError) {
      console.log('⚠️ No active schema period found for user:', periodError.message);
      return NextResponse.json({ data: null });
    }

    console.log('✅ Current schema period found:', schemaPeriod);

    return NextResponse.json({ 
      data: {
        selected_schema_id: schemaPeriod.training_schema_id,
        schema_start_date: schemaPeriod.start_date,
        schema_end_date: schemaPeriod.end_date,
        training_schema: schemaPeriod.training_schemas
      }
    });

  } catch (error) {
    console.error('❌ Error in GET /api/training-schema-period:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
