const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabaseUrl = 'https://wkjvstuttbeyqzyjayxj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndranZzdHV0dGJleXF6eWpheXhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI1MDI1NSwiZXhwIjoyMDY1ODI2MjU1fQ.LOo6OJaQunCtZvY8oODK3DcrvYte45h2DC7Qf6ERJFo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixExercisesRLSWithServiceRole() {
  console.log('🔧 Fixing RLS policies on exercises table with service role...');
  
  try {
    // First, let's check the current RLS policies
    console.log('📋 Checking current RLS policies...');
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies 
        WHERE tablename = 'exercises'
        ORDER BY policyname;
      `
    });
    
    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
    } else {
      console.log('📋 Current RLS policies on exercises table:');
      console.log(JSON.stringify(policies, null, 2));
    }
    
    // Drop existing policies and create new ones
    console.log('🔧 Dropping existing policies and creating new ones...');
    const { error: fixError } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Enable read access for all users" ON exercises;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON exercises;
        DROP POLICY IF EXISTS "Enable update for users based on email" ON exercises;
        DROP POLICY IF EXISTS "Enable delete for users based on email" ON exercises;
        
        -- Create new policies that allow admin operations
        CREATE POLICY "Enable read access for all users" ON exercises
          FOR SELECT USING (true);
        
        CREATE POLICY "Enable insert for authenticated users" ON exercises
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        
        CREATE POLICY "Enable update for authenticated users" ON exercises
          FOR UPDATE USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Enable delete for authenticated users" ON exercises
          FOR DELETE USING (auth.role() = 'authenticated');
        
        -- Also allow service role to do everything
        CREATE POLICY "Service role full access" ON exercises
          FOR ALL USING (auth.role() = 'service_role');
      `
    });
    
    if (fixError) {
      console.error('❌ Error fixing policies:', fixError);
    } else {
      console.log('✅ RLS policies updated successfully');
    }
    
    // Test the fix with anon key
    console.log('🧪 Testing fix with anon key...');
    const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndranZzdHV0dGJleXF6eWpheXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNTAyNTUsImV4cCI6MjA2NTgyNjI1NX0.x3F0xVyufYUEk3PPTgNuonOrgI70OQan2mFd3wkIlKQ');
    
    const testExercise = {
      name: 'Service Role Test Exercise',
      primary_muscle: 'Borst',
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      video_url: null,
      instructions: 'Test instructies na RLS fix',
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
    console.error('❌ Exception during RLS fix:', err);
  }
}

fixExercisesRLSWithServiceRole();
