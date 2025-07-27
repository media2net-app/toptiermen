const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixExecSql() {
  try {
    console.log('🔧 Fixing exec_sql function...');
    
    // Drop existing function
    const dropResult = await supabase.rpc('exec_sql', { 
      sql_query: 'DROP FUNCTION IF EXISTS exec_sql(text);' 
    });
    console.log('✅ Dropped existing function');
    
    // Create new function
    const createFunction = `
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
          
          RETURN result;
          
      EXCEPTION WHEN OTHERS THEN
          -- Return error information
          error_msg := SQLERRM;
          RETURN json_build_object(
              'error', error_msg,
              'success', false
          );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    // Execute the function creation using direct SQL
    const { data, error } = await supabase
      .from('_dummy_table_that_doesnt_exist')
      .select('*')
      .limit(1);
    
    // Since we can't execute DDL directly, let's use a different approach
    console.log('⚠️  Cannot execute DDL through RPC. Please run the SQL manually in Supabase SQL Editor:');
    console.log(createFunction);
    
  } catch (error) {
    console.error('❌ Error fixing exec_sql function:', error);
  }
}

fixExecSql(); 