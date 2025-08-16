require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createExercisesTable() {
  console.log('🔧 CREATING EXERCISES TABLE');
  console.log('===========================');
  
  try {
    // Drop table if exists and recreate
    console.log('\n🗑️  Dropping existing exercises table...');
    const { error: dropError } = await supabase
      .from('exercises')
      .delete()
      .gte('created_at', '1900-01-01');

    if (dropError) {
      console.log('⚠️  Could not drop table (might not exist):', dropError.message);
    } else {
      console.log('✅ Existing data cleared');
    }

    // Create table using direct SQL
    console.log('\n🏗️  Creating exercises table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.exercises (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        muscle_group VARCHAR(100),
        equipment VARCHAR(100),
        difficulty VARCHAR(50) DEFAULT 'Beginner',
        instructions TEXT,
        video_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Try to create table using RPC if available
    try {
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: createTableSQL
      });

      if (createError) {
        console.log('⚠️  RPC method not available, trying alternative approach...');
        throw createError;
      }
      
      console.log('✅ Exercises table created successfully via RPC');
    } catch (rpcError) {
      console.log('⚠️  RPC failed, trying direct SQL...');
      
      // Alternative: try to insert a test record to see if table exists
      const testData = {
        name: 'Test Exercise',
        description: 'Test description',
        muscle_group: 'Test',
        equipment: 'Test',
        difficulty: 'Beginner',
        instructions: 'Test instructions',
        video_url: 'test.mp4'
      };

      const { data: testInsert, error: insertError } = await supabase
        .from('exercises')
        .insert(testData)
        .select()
        .single();

      if (insertError) {
        console.log('❌ Table does not exist or has wrong structure:');
        console.log(insertError.message);
        
        console.log('\n💡 MANUAL SETUP REQUIRED:');
        console.log('========================');
        console.log('Please run this SQL in your Supabase SQL editor:');
        console.log('\n' + createTableSQL);
        
        return;
      } else {
        console.log('✅ Table exists and is working!');
        
        // Clean up test data
        await supabase
          .from('exercises')
          .delete()
          .eq('name', 'Test Exercise');
        
        console.log('✅ Test data cleaned up');
      }
    }

    // Test the table structure
    console.log('\n🧪 Testing table structure...');
    const testData = {
      name: 'Structure Test',
      description: 'Testing table structure',
      muscle_group: 'Test',
      equipment: 'Test',
      difficulty: 'Beginner',
      instructions: 'Test instructions',
      video_url: 'test.mp4'
    };

    const { data: testResult, error: testError } = await supabase
      .from('exercises')
      .insert(testData)
      .select()
      .single();

    if (testError) {
      console.log('❌ Table structure test failed:');
      console.log(testError.message);
    } else {
      console.log('✅ Table structure test successful!');
      console.log('📋 Available columns:');
      Object.keys(testResult).forEach(key => {
        console.log(`  - ${key}: ${typeof testResult[key]}`);
      });
      
      // Clean up test data
      await supabase
        .from('exercises')
        .delete()
        .eq('name', 'Structure Test');
    }

  } catch (error) {
    console.error('❌ Fout bij aanmaken exercises table:', error);
  }
}

createExercisesTable().catch(console.error);
