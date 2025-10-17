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
      
      // Find Schema 2 for the same training goal, equipment type, and frequency (by day count)
      // 1) Get goal/equipment of completed schema
      const { data: schema1Data, error: schema1Error } = await supabaseAdmin
        .from('user_training_schema_progress')
        .select(`
          training_schemas!fk_user_training_schema_progress_schema_id(
            id,
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

      // Handle both array and object response from Supabase
      const schemaInfo = Array.isArray(schema1Data.training_schemas) 
        ? schema1Data.training_schemas[0] 
        : schema1Data.training_schemas;
      const trainingGoal = schemaInfo?.training_goal;
      const equipmentType = schemaInfo?.equipment_type;

      // 2) Count day count (frequency) of the completed schema
      let targetDayCount = 1;
      try {
        const { data: dayRows } = await supabaseAdmin
          .from('training_schema_days')
          .select('id')
          .eq('schema_id', schemaId as any);
        targetDayCount = Math.max(1, dayRows?.length || 1);
      } catch {}

      console.log('🎯 Looking for Schema 2 with:', { trainingGoal, equipmentType });

      // 3) Find Schema 2 candidates and select one matching the day count
      const { data: schema2List, error: schema2ListErr } = await supabaseAdmin
        .from('training_schemas')
        .select('id, name, status')
        .eq('schema_nummer', 2)
        .eq('training_goal', trainingGoal)
        .eq('equipment_type', equipmentType);

      if (schema2ListErr || !schema2List || schema2List.length === 0) {
        console.log('⚠️ Schema 2 not found or not available yet');
        // Even if schema 2 is missing, ensure no other schemas remain active
        try {
          await supabaseAdmin
            .from('user_training_schema_progress')
            .update({ completed_at: completionDate })
            .eq('user_id', userId)
            .neq('schema_id', schemaId)
            .is('completed_at', null);
        } catch (e) {
          console.warn('⚠️ Could not mark other schemas as completed (no schema 2):', e);
        }
        return NextResponse.json({ 
          success: true, 
          message: 'Schema 1 completed, but Schema 2 not available yet',
          schema1Completed: true,
          schema2Unlocked: false
        });
      }

      // Choose schema 2 that matches frequency by day count
      let chosenSchema2: any | null = null;
      for (const cand of schema2List) {
        try {
          const { data: dc } = await supabaseAdmin
            .from('training_schema_days')
            .select('id')
            .eq('schema_id', cand.id);
          const count = dc?.length || 0;
          if (count === targetDayCount) { chosenSchema2 = cand; break; }
        } catch {}
      }
      if (!chosenSchema2) chosenSchema2 = schema2List[0];

      console.log('✅ Schema 2 chosen:', chosenSchema2);

      // Create a new progress entry for Schema 2 (unlocked but not started)
      const { data: newProgressData, error: newProgressError } = await supabaseAdmin
        .from('user_training_schema_progress')
        .insert({
          user_id: userId,
          schema_id: chosenSchema2.id,
          current_day: 1,
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

      // Ensure only one active schema remains: mark all others as completed
      try {
        await supabaseAdmin
          .from('user_training_schema_progress')
          .update({ completed_at: completionDate })
          .eq('user_id', userId)
          .not('schema_id', 'in', [schemaId, chosenSchema2.id] as any)
          .is('completed_at', null);
      } catch (e) {
        console.warn('⚠️ Could not mark other schemas as completed after unlocking schema 2:', e);
      }

      // Set user's selected schema to Schema 2 so frontend loads it by default
      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ selected_schema_id: chosenSchema2.id, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (profileUpdateError) {
        console.warn('⚠️ Failed to update profiles.selected_schema_id to schema 2:', profileUpdateError);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Schema 1 completed and Schema 2 unlocked',
        schema1Completed: true,
        schema2Unlocked: true,
        schema2Id: chosenSchema2.id,
        schema2Name: chosenSchema2.name
      });
    }

    // If this is Schema 2 completion, unlock Schema 3 similarly
    if (schemaData.schema_nummer === 2) {
      console.log('🔓 Unlocking Schema 3...');

      // Find training goal and equipment type for this schema
      const { data: schema2Meta, error: schema2MetaErr } = await supabaseAdmin
        .from('user_training_schema_progress')
        .select(`
          training_schemas!fk_user_training_schema_progress_schema_id(
            training_goal,
            equipment_type
          )
        `)
        .eq('user_id', userId)
        .eq('schema_id', schemaId)
        .single();

      if (schema2MetaErr) {
        console.error('❌ Error fetching schema 2 details:', schema2MetaErr);
        return NextResponse.json({ error: 'Failed to fetch schema details' }, { status: 500 });
      }

      // Handle both array and object response from Supabase
      const schema2Info = Array.isArray((schema2Meta as any).training_schemas) 
        ? (schema2Meta as any).training_schemas[0] 
        : (schema2Meta as any).training_schemas;
      const trainingGoal = schema2Info?.training_goal;
      const equipmentType = schema2Info?.equipment_type;

      console.log('🎯 Looking for Schema 3 with:', { trainingGoal, equipmentType });

      const { data: schema3Data, error: schema3Error } = await supabaseAdmin
        .from('training_schemas')
        .select('id, name')
        .eq('schema_nummer', 3)
        .eq('training_goal', trainingGoal)
        .eq('equipment_type', equipmentType)
        .single();

      if (schema3Error) {
        console.log('⚠️ Schema 3 not found or not available yet');
        return NextResponse.json({ 
          success: true, 
          message: 'Schema 2 completed, but Schema 3 not available yet',
          schema2Completed: true,
          schema3Unlocked: false
        });
      }

      console.log('✅ Schema 3 found:', schema3Data);

      // Ensure a progress row exists for Schema 3
      const { data: existingS3, error: existingS3Err } = await supabaseAdmin
        .from('user_training_schema_progress')
        .select('schema_id')
        .eq('user_id', userId)
        .eq('schema_id', schema3Data.id)
        .maybeSingle();

      if (!existingS3 && !existingS3Err) {
        const { error: newS3Err } = await supabaseAdmin
          .from('user_training_schema_progress')
          .insert({
            user_id: userId,
            schema_id: schema3Data.id,
            current_day: 1,
            total_days_completed: 0,
            total_workouts_completed: 0,
            started_at: new Date().toISOString(),
            completed_at: null
          });
        if (newS3Err) {
          console.warn('⚠️ Failed creating Schema 3 progress (will continue):', newS3Err);
        }
      }

      // Set user's selected schema to Schema 3
      const { error: profileUpdateErr3 } = await supabaseAdmin
        .from('profiles')
        .update({ selected_schema_id: schema3Data.id, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (profileUpdateErr3) {
        console.warn('⚠️ Failed to update profiles.selected_schema_id to schema 3:', profileUpdateErr3);
      }

      return NextResponse.json({
        success: true,
        message: 'Schema 2 completed and Schema 3 unlocked',
        schema2Completed: true,
        schema3Unlocked: true,
        schema3Id: schema3Data.id,
        schema3Name: schema3Data.name
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
        training_schemas!fk_user_training_schema_progress_schema_id(
          id,
          name,
          schema_nummer,
          training_goal,
          equipment_type
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error fetching schema completion status:', error);
      // If it's just a "no rows found" type error or missing foreign key, return empty array instead of 500
      if (error.message?.includes('foreign') || error.code === 'PGRST116') {
        console.log('ℹ️ No schema progress found for user (likely new user)');
        return NextResponse.json({ success: true, schemas: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Schema completion status fetched:', data?.length || 0);
    return NextResponse.json({ success: true, schemas: data || [] });

  } catch (error) {
    console.error('❌ Unexpected error checking schema completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
