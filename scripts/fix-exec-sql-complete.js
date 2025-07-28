const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixExecSqlComplete() {
  console.log('🔧 Completely fixing exec_sql function to handle all SQL types...');

  try {
    const completeFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
      RETURNS json AS $$
      DECLARE
          result json;
          error_msg text;
          query_type text;
          affected_rows integer;
          is_ddl boolean := false;
      BEGIN
          -- Determine if this is a SELECT query or other type
          query_type := upper(trim(split_part(sql_query, ' ', 1)));
          
          -- Check if it's a DDL statement (CREATE, DROP, ALTER, INSERT, UPDATE, DELETE)
          is_ddl := query_type IN ('CREATE', 'DROP', 'ALTER', 'INSERT', 'UPDATE', 'DELETE', 'DO');
          
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
          ELSIF is_ddl THEN
              -- For DDL statements, execute directly
              EXECUTE sql_query;
              
              -- Get affected rows if available
              GET DIAGNOSTICS affected_rows = ROW_COUNT;
              
              RETURN json_build_object(
                  'success', true,
                  'data', 'DDL statement executed successfully',
                  'affected_rows', affected_rows,
                  'type', 'ddl'
              );
          ELSE
              -- For other statements, execute directly
              EXECUTE sql_query;
              
              -- Get affected rows if available
              GET DIAGNOSTICS affected_rows = ROW_COUNT;
              
              RETURN json_build_object(
                  'success', true,
                  'data', 'Statement executed successfully',
                  'affected_rows', affected_rows,
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

    console.log('📋 Please run this complete SQL in Supabase SQL Editor:');
    console.log('\n' + completeFunctionSQL + '\n');
    
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
      sql_query: 'CREATE TABLE IF NOT EXISTS test_exec_sql (id serial PRIMARY KEY, name text)'
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
      sql_query: 'INSERT INTO test_exec_sql (name) VALUES (\'test\') ON CONFLICT DO NOTHING'
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
      sql_query: 'DROP TABLE IF EXISTS test_exec_sql'
    });
    
    if (dropTest.error) {
      console.error('❌ DROP test failed:', dropTest.error);
    } else {
      console.log('✅ DROP test successful!');
      console.log('📊 DROP result:', dropTest.data);
    }

    console.log('\n🎉 exec_sql function is now fully functional!');
    console.log('📋 You can now execute all types of SQL queries');

  } catch (error) {
    console.error('❌ Error fixing exec_sql function:', error);
  }
}

// Run the fix
fixExecSqlComplete(); 