const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixExecSql() {
  console.log('🔧 Fixing exec_sql function...');

  try {
    // First, try to drop the existing function
    console.log('🗑️ Dropping existing function...');
    try {
      await supabase.rpc('exec_sql', { sql_query: 'DROP FUNCTION IF EXISTS exec_sql(text);' });
      console.log('✅ Existing function dropped');
    } catch (error) {
      console.log('⚠️ Could not drop function (might not exist)');
    }

    // Create the function using direct SQL (not through RPC)
    console.log('🔧 Creating new exec_sql function...');
    
    // Since we can't create the function through RPC, we'll use a different approach
    // We'll create a simple version that works with the current setup
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
      RETURNS json AS $$
      DECLARE
          result json;
          error_msg text;
      BEGIN
          -- Execute the SQL query and return results as JSON
          EXECUTE 'SELECT json_agg(t) FROM (' || sql_query || ') t' INTO result;
          
          -- If no results, return empty array
          IF result IS NULL THEN
              result := '[]'::json;
          END IF;
          
          RETURN json_build_object(
              'success', true,
              'data', result,
              'type', 'select'
          );
          
      EXCEPTION WHEN OTHERS THEN
          -- Return error information
          error_msg := SQLERRM;
          RETURN json_build_object(
              'success', false,
              'error', error_msg,
              'type', 'error'
          );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    console.log('📋 Please run this SQL manually in Supabase SQL Editor:');
    console.log('\n' + createFunctionSQL + '\n');
    
    console.log('🔧 After running the SQL, test the function...');
    
    // Wait a moment for the user to run the SQL
    console.log('⏳ Waiting 5 seconds for you to run the SQL...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test the function
    console.log('🧪 Testing the function...');
    const testResult = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT 1 as test, NOW() as current_time'
    });
    
    if (testResult.error) {
      console.error('❌ Function test failed:', testResult.error);
      console.log('📋 Please make sure you ran the SQL in Supabase SQL Editor');
    } else {
      console.log('✅ Function test successful!');
      console.log('📊 Test result:', testResult.data);
    }

  } catch (error) {
    console.error('❌ Error fixing exec_sql function:', error);
  }
}

// Run the fix
fixExecSql(); 