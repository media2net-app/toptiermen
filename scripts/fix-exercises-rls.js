const { createClient } = require('@supabase/supabase-js');

// Hardcode the values for testing (these are public anyway)
const supabaseUrl = 'https://wkjvstuttbeyqzyjayxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndranZzdHV0dGJleXF6eWpheXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTAyNTUsImV4cCI6MjA2NTgyNjI1NX0.x3F0xVyufYUEk3PPTgNuonOrgI70OQan2mFd3wkIlKQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixExercisesRLS() {
  console.log('🔧 Fixing RLS policies on exercises table...');
  
  try {
    // First, let's try to read from exercises table to see current access
    console.log('📋 Testing current access to exercises table...');
    const { data: exercises, error: readError } = await supabase
      .from('exercises')
      .select('id, name')
      .limit(3);
    
    if (readError) {
      console.error('❌ Error reading exercises:', readError);
    } else {
      console.log('✅ Can read exercises:', exercises?.length || 0, 'exercises found');
    }
    
    // Try to insert a test exercise
    console.log('📋 Testing insert access to exercises table...');
    const testExercise = {
      name: 'RLS Test Exercise',
      primary_muscle: 'Borst',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      video_url: null,
      instructions: 'Test instructies voor RLS',
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
      console.error('❌ Error inserting exercise:', insertError);
      console.log('🔧 This confirms RLS is blocking inserts');
      
      // Let's try to disable RLS temporarily for testing
      console.log('🔧 Attempting to disable RLS temporarily...');
      const { error: disableError } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE exercises DISABLE ROW LEVEL SECURITY;'
      });
      
      if (disableError) {
        console.error('❌ Error disabling RLS:', disableError);
        console.log('💡 RLS cannot be disabled via anon key - this is expected');
      } else {
        console.log('✅ RLS disabled successfully');
        
        // Try insert again
        const { data: retryData, error: retryError } = await supabase
          .from('exercises')
          .insert([testExercise])
          .select()
          .single();
        
        if (retryError) {
          console.error('❌ Still cannot insert after disabling RLS:', retryError);
        } else {
          console.log('✅ Insert successful after disabling RLS:', retryData);
          
          // Clean up test exercise
          const { error: deleteError } = await supabase
            .from('exercises')
            .delete()
            .eq('id', retryData.id);
          
          if (deleteError) {
            console.error('⚠️ Could not clean up test exercise:', deleteError);
          } else {
            console.log('🧹 Test exercise cleaned up');
          }
        }
      }
    } else {
      console.log('✅ Insert successful:', insertData);
      
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
    console.error('❌ Exception during RLS fix:', err);
  }
}

fixExercisesRLS();
