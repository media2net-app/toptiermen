const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function improveExecSql() {
  console.log('🔧 Improving exec_sql function to handle all SQL types...');

  try {
    const improvedFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
      RETURNS json AS $$
      DECLARE
          result json;
          error_msg text;
          query_type text;
          affected_rows integer;
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
              
              -- Get affected rows if available
              GET DIAGNOSTICS affected_rows = ROW_COUNT;
              
              RETURN json_build_object(
                  'success', true,
                  'data', 'Query executed successfully',
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

    console.log('📋 Please run this improved SQL in Supabase SQL Editor:');
    console.log('\n' + improvedFunctionSQL + '\n');
    
    console.log('🔧 After running the SQL, test the function...');
    
    // Wait a moment for the user to run the SQL
    console.log('⏳ Waiting 5 seconds for you to run the SQL...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test SELECT query
    console.log('🧪 Testing SELECT query...');
    const selectTest = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' LIMIT 5'
    });
    
    if (selectTest.error) {
      console.error('❌ SELECT test failed:', selectTest.error);
    } else {
      console.log('✅ SELECT test successful!');
      console.log('📊 SELECT result:', selectTest.data);
    }
    
    // Test INSERT query (create a test table first)
    console.log('🧪 Testing INSERT query...');
    const insertTest = await supabase.rpc('exec_sql', {
      sql_query: 'CREATE TABLE IF NOT EXISTS test_table (id serial PRIMARY KEY, name text)'
    });
    
    if (insertTest.error) {
      console.error('❌ CREATE test failed:', insertTest.error);
    } else {
      console.log('✅ CREATE test successful!');
      console.log('📊 CREATE result:', insertTest.data);
    }

  } catch (error) {
    console.error('❌ Error improving exec_sql function:', error);
  }
}

// Run the improvement
improveExecSql(); 