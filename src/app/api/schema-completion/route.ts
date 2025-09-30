import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST - Mark schema as completed and unlock next schema
export async function POST(request: NextRequest) {
  try {
    console.log('🏆 Processing schema completion...');
    
    const body = await request.json();
    const { userId, schemaId, completedWeeks, completionDate } = body;

    console.log('🏆 Schema completion data:', { 
      userId, 
      schemaId, 
      completedWeeks, 
      completionDate 
    });

    if (!userId || !schemaId || !completedWeeks || !completionDate) {
      console.error('❌ Missing required fields:', { 
        userId: !!userId, 
        schemaId: !!schemaId, 
        completedWeeks: !!completedWeeks, 
        completionDate: !!completionDate 
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the schema details to check schema number
    const { data: schemaData, error: schemaError } = await supabaseAdmin
      .from('training_schemas')
      .select('schema_nummer, name')
      .eq('id', schemaId)
      .single();

    if (schemaError) {
      console.error('❌ Error fetching schema details:', schemaError);
      return NextResponse.json({ error: 'Schema not found' }, { status: 404 });
    }

    console.log('📊 Schema details:', schemaData);

    // Update user's training schema progress to mark as completed
    const { data: progressData, error: progressError } = await supabaseAdmin
      .from('user_training_schema_progress')
      .update({
        completed_at: completionDate,
        total_days_completed: completedWeeks * 7, // Convert weeks to days
        current_day: completedWeeks * 7, // Set to final day
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('schema_id', schemaId)
      .select()
      .single();

    if (progressError) {
      console.error('❌ Error updating schema progress:', progressError);
      return NextResponse.json({ error: 'Failed to update schema progress' }, { status: 500 });
    }

    console.log('✅ Schema progress updated:', progressData);

    // If this is Schema 1 completion, we need to unlock Schema 2
    if (schemaData.schema_nummer === 1) {
      console.log('🔓 Unlocking Schema 2...');
      
      // Find Schema 2 for the same training goal and equipment type
      const { data: schema1Data, error: schema1Error } = await supabaseAdmin
        .from('user_training_schema_progress')
        .select(`
          training_schemas!inner(
            training_goal,
            equipment_type
          )
        `)
        .eq('user_id', userId)
        .eq('schema_id', schemaId)
        .single();

      if (schema1Error) {
        console.error('❌ Error fetching schema 1 details:', schema1Error);
        return NextResponse.json({ error: 'Failed to fetch schema details' }, { status: 500 });
      }

      const trainingGoal = schema1Data.training_schemas[0]?.training_goal;
      const equipmentType = schema1Data.training_schemas[0]?.equipment_type;

      console.log('🎯 Looking for Schema 2 with:', { trainingGoal, equipmentType });

      // Find Schema 2
      const { data: schema2Data, error: schema2Error } = await supabaseAdmin
        .from('training_schemas')
        .select('id, name')
        .eq('schema_nummer', 2)
        .eq('training_goal', trainingGoal)
        .eq('equipment_type', equipmentType)
        .single();

      if (schema2Error) {
        console.log('⚠️ Schema 2 not found or not available yet');
        return NextResponse.json({ 
          success: true, 
          message: 'Schema 1 completed, but Schema 2 not available yet',
          schema1Completed: true,
          schema2Unlocked: false
        });
      }

      console.log('✅ Schema 2 found:', schema2Data);

      // Create a new progress entry for Schema 2 (unlocked but not started)
      const { data: newProgressData, error: newProgressError } = await supabaseAdmin
        .from('user_training_schema_progress')
        .insert({
          user_id: userId,
          schema_id: schema2Data.id,
          current_day: 1,
          total_days_completed: 0,
          total_workouts_completed: 0,
          started_at: new Date().toISOString(),
          completed_at: null
        })
        .select()
        .single();

      if (newProgressError) {
        console.error('❌ Error creating Schema 2 progress:', newProgressError);
        return NextResponse.json({ error: 'Failed to unlock Schema 2' }, { status: 500 });
      }

      console.log('🎉 Schema 2 unlocked successfully:', newProgressData);

      // Set user's selected schema to Schema 2 so frontend loads it by default
      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ selected_schema_id: schema2Data.id, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (profileUpdateError) {
        console.warn('⚠️ Failed to update profiles.selected_schema_id to schema 2:', profileUpdateError);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Schema 1 completed and Schema 2 unlocked',
        schema1Completed: true,
        schema2Unlocked: true,
        schema2Id: schema2Data.id,
        schema2Name: schema2Data.name
      });
    }

    // For other schemas, just mark as completed
    return NextResponse.json({ 
      success: true, 
      message: `Schema ${schemaData.schema_nummer} completed`,
      schemaCompleted: true
    });

  } catch (error) {
    console.error('❌ Unexpected error processing schema completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Check schema completion status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    console.log('🔍 Checking schema completion status for user:', userId);

    // Get all user's schema progress
    const { data, error } = await supabaseAdmin
      .from('user_training_schema_progress')
      .select(`
        *,
        training_schemas!inner(
          id,
          name,
          schema_nummer,
          training_goal,
          equipment_type
        )
      `)
      .eq('user_id', userId)
      .order('training_schemas.schema_nummer');

    if (error) {
      console.error('❌ Error fetching schema completion status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Schema completion status fetched:', data?.length || 0);
    return NextResponse.json({ success: true, schemas: data || [] });

  } catch (error) {
    console.error('❌ Unexpected error checking schema completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
