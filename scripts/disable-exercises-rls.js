const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabaseUrl = 'https://wkjvstuttbeyqzyjayxj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndranZzdHV0dGJleXF6eWpheXhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI1MDI1NSwiZXhwIjoyMDY1ODI2MjU1fQ.LOo6OJaQunCtZvY8oODK3DcrvYte45h2DC7Qf6ERJFo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableExercisesRLS() {
  console.log('🔧 Disabling RLS on exercises table...');
  
  try {
    // Disable RLS on exercises table
    console.log('🔧 Disabling RLS...');
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;'
    });
    
    if (disableError) {
      console.error('❌ Error disabling RLS:', disableError);
    } else {
      console.log('✅ RLS disabled successfully');
    }
    
    // Test the fix with anon key
    console.log('🧪 Testing fix with anon key...');
    const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndranZzdHV0dGJleXF6eWpheXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTAyNTUsImV4cCI6MjA2NTgyNjI1NX0.x3F0xVyufYUEk3PPTgNuonOrgI70OQan2mFd3wkIlKQ');
    
    const testExercise = {
      name: 'RLS Disabled Test Exercise',
      primary_muscle: 'Borst',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      video_url: null,
      instructions: 'Test instructies na RLS disable',
      worksheet_url: null,
      secondary_muscles: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await anonSupabase
      .from('exercises')
      .insert([testExercise])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Still cannot insert with anon key:', insertError);
    } else {
      console.log('✅ Insert successful with anon key:', insertData);
      
      // Clean up test exercise
      const { error: deleteError } = await anonSupabase
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
    console.error('❌ Exception during RLS disable:', err);
  }
}

disableExercisesRLS();
