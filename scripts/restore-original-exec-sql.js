const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function restoreOriginalExecSql() {
  console.log('🔧 Restoring original working exec_sql function...');

  try {
    const originalFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
      RETURNS json AS $$
      DECLARE
          result json;
          error_msg text;
          query_type text;
      BEGIN
          -- Determine if this is a SELECT query or other type
          query_type := upper(trim(split_part(sql_query, ' ', 1)));
          
          IF query_type = 'SELECT' THEN
              -- For SELECT queries, return results as JSON
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
          ELSE
              -- For non-SELECT queries (INSERT, UPDATE, DELETE, CREATE, etc.)
              EXECUTE sql_query;
              
              RETURN json_build_object(
                  'success', true,
                  'data', 'Query executed successfully',
                  'type', 'other'
              );
          END IF;
          
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

      -- Grant execute permission to service_role
      GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
    `;

    console.log('📋 Please run this original SQL in Supabase SQL Editor:');
    console.log('\n' + originalFunctionSQL + '\n');
    
    console.log('🔧 After running the SQL, testing the function...');
    console.log('⏳ Waiting 5 seconds for you to run the SQL...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test SELECT query
    console.log('🧪 Testing SELECT query...');
    const selectTest = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' LIMIT 3'
    });
    
    if (selectTest.error) {
      console.error('❌ SELECT test failed:', selectTest.error);
    } else {
      console.log('✅ SELECT test successful!');
      console.log('📊 SELECT result:', selectTest.data);
    }
    
    // Test CREATE query
    console.log('🧪 Testing CREATE query...');
    const createTest = await supabase.rpc('exec_sql', {
      sql_query: 'CREATE TABLE IF NOT EXISTS test_restore (id serial PRIMARY KEY, name text)'
    });
    
    if (createTest.error) {
      console.error('❌ CREATE test failed:', createTest.error);
    } else {
      console.log('✅ CREATE test successful!');
      console.log('📊 CREATE result:', createTest.data);
    }
    
    // Test INSERT query
    console.log('🧪 Testing INSERT query...');
    const insertTest = await supabase.rpc('exec_sql', {
      sql_query: 'INSERT INTO test_restore (name) VALUES (\'test\') ON CONFLICT DO NOTHING'
    });
    
    if (insertTest.error) {
      console.error('❌ INSERT test failed:', insertTest.error);
    } else {
      console.log('✅ INSERT test successful!');
      console.log('📊 INSERT result:', insertTest.data);
    }
    
    // Test DROP query
    console.log('🧪 Testing DROP query...');
    const dropTest = await supabase.rpc('exec_sql', {
      sql_query: 'DROP TABLE IF EXISTS test_restore'
    });
    
    if (dropTest.error) {
      console.error('❌ DROP test failed:', dropTest.error);
    } else {
      console.log('✅ DROP test successful!');
      console.log('📊 DROP result:', dropTest.data);
    }

    console.log('\n🎉 Original exec_sql function restored!');
    console.log('📋 You can now execute all types of SQL queries');

  } catch (error) {
    console.error('❌ Error restoring exec_sql function:', error);
  }
}

// Run the restore
restoreOriginalExecSql(); 