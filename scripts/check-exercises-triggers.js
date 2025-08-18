const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabaseUrl = 'https://wkjvstuttbeyqzyjayxj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndranZzdHV0dGJleXF6eWpheXhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI1MDI1NSwiZXhwIjoyMDY1ODI2MjU1fQ.LOo6OJaQunCtZvY8oODK3DcrvYte45h2DC7Qf6ERJFo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkExercisesTriggers() {
  console.log('🔍 Checking triggers and constraints on exercises table...');
  
  try {
    // Check for triggers
    console.log('📋 Checking triggers...');
    const { data: triggers, error: triggersError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          trigger_name,
          event_manipulation,
          action_timing,
          action_statement
        FROM information_schema.triggers 
        WHERE event_object_table = 'exercises'
        ORDER BY trigger_name;
      `
    });
    
    if (triggersError) {
      console.error('❌ Error checking triggers:', triggersError);
    } else {
      console.log('📋 Triggers on exercises table:');
      console.log(JSON.stringify(triggers, null, 2));
    }
    
    // Check for constraints
    console.log('📋 Checking constraints...');
    const { data: constraints, error: constraintsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          constraint_name,
          constraint_type,
          table_name,
          column_name
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.constraint_column_usage ccu 
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'exercises'
        ORDER BY constraint_name;
      `
    });
    
    if (constraintsError) {
      console.error('❌ Error checking constraints:', constraintsError);
    } else {
      console.log('📋 Constraints on exercises table:');
      console.log(JSON.stringify(constraints, null, 2));
    }
    
    // Check table structure
    console.log('📋 Checking table structure...');
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'exercises'
        ORDER BY ordinal_position;
      `
    });
    
    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
    } else {
      console.log('📋 Columns in exercises table:');
      console.log(JSON.stringify(columns, null, 2));
    }
    
    // Try direct insert with service role
    console.log('🧪 Testing direct insert with service role...');
    const testExercise = {
      name: 'Service Role Test Exercise',
      primary_muscle: 'Borst',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      video_url: null,
      instructions: 'Test instructies met service role',
      worksheet_url: null,
      secondary_muscles: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('exercises')
      .insert([testExercise])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Service role cannot insert:', insertError);
    } else {
      console.log('✅ Service role insert successful:', insertData);
      
      // Clean up test exercise
      const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .eq('id', insertData.id);
      
      if (deleteError) {
        console.error('⚠️ Could not clean up test exercise:', deleteError);
      } else {
        console.log('🧹 Test exercise cleaned up');
      }
    }
    
  } catch (err) {
    console.error('❌ Exception during trigger check:', err);
  }
}

checkExercisesTriggers();
