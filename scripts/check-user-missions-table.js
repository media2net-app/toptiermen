const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserMissionsTable() {
  console.log('🔍 Checking user_missions table structure...\n');

  try {
    // Check if table exists and get its structure
    console.log('📋 STEP 1: Checking table existence and structure');
    console.log('----------------------------------------');
    
    try {
      const { data: tableInfo, error: tableError } = await supabase
        .from('user_missions')
        .select('*')
        .limit(1);

      if (tableError) {
        console.log('❌ user_missions table error:', tableError.message);
        
        // Try to get table schema
        console.log('\n📋 STEP 2: Attempting to get table schema');
        console.log('----------------------------------------');
        
        try {
          const { data: schema, error: schemaError } = await supabase
            .rpc('get_table_schema', { table_name: 'user_missions' });
          
          if (schemaError) {
            console.log('❌ Schema check failed:', schemaError.message);
          } else {
            console.log('✅ Table schema:', schema);
          }
        } catch (error) {
          console.log('❌ Schema check failed:', error.message);
        }
        
        return;
      } else {
        console.log('✅ user_missions table exists');
        console.log('📊 Sample data structure:', Object.keys(tableInfo[0] || {}));
      }
    } catch (error) {
      console.log('❌ Table check failed:', error.message);
      return;
    }

    // Try to create a test mission directly in database
    console.log('\n📋 STEP 3: Testing direct database insert');
    console.log('----------------------------------------');
    
    const testMission = {
      user_id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e', // Chiel's ID
      title: 'Test Mission Direct Insert',
      description: 'Test Mission Direct Insert',
      frequency_type: 'daily',
      difficulty: 'medium',
      points: 50,
      status: 'pending',
      category: 'Fitness & Gezondheid',
      last_completion_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Attempting direct database insert...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_missions')
      .insert(testMission)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Direct insert failed:', insertError.message);
      console.log('📊 Error details:', insertError);
      
      // Check if it's a constraint error
      if (insertError.code === '23505') {
        console.log('🔍 This is a unique constraint violation');
      } else if (insertError.code === '23502') {
        console.log('🔍 This is a not null constraint violation');
      } else if (insertError.code === '42703') {
        console.log('🔍 This is a column does not exist error');
      }
    } else {
      console.log('✅ Direct insert successful!');
      console.log('📊 Inserted mission:', insertData);
      
      // Clean up the test mission
      await supabase
        .from('user_missions')
        .delete()
        .eq('id', insertData.id);
      
      console.log('🧹 Test mission cleaned up');
    }

    // Check table constraints
    console.log('\n📋 STEP 4: Checking table constraints');
    console.log('----------------------------------------');
    
    try {
      const { data: constraints, error: constraintsError } = await supabase
        .rpc('get_table_constraints', { table_name: 'user_missions' });
      
      if (constraintsError) {
        console.log('ℹ️ Could not get constraints info:', constraintsError.message);
      } else {
        console.log('📊 Table constraints:', constraints);
      }
    } catch (error) {
      console.log('ℹ️ Constraints check not available');
    }

    console.log('\n🎯 Analysis completed!');

  } catch (error) {
    console.error('❌ Error during analysis:', error);
  }
}

checkUserMissionsTable();
