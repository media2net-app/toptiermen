const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDirect() {
  console.log('🧪 Testing direct database queries...');

  try {
    // Test 1: Direct table query
    console.log('\n📋 Test 1: Direct table query...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);

    if (tablesError) {
      console.error('❌ Direct table query failed:', tablesError);
    } else {
      console.log('✅ Direct table query successful!');
      console.log('📊 Tables:', tables);
    }

    // Test 2: exec_sql with SELECT
    console.log('\n📋 Test 2: exec_sql with SELECT...');
    const { data: execResult, error: execError } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' LIMIT 5'
    });

    if (execError) {
      console.error('❌ exec_sql SELECT failed:', execError);
    } else {
      console.log('✅ exec_sql SELECT successful!');
      console.log('📊 exec_sql result:', execResult);
      console.log('📊 exec_sql data type:', typeof execResult);
      console.log('📊 exec_sql is array:', Array.isArray(execResult));
    }

    // Test 3: Check if execResult is an object
    if (execResult && typeof execResult === 'object') {
      console.log('\n📋 Test 3: Analyzing exec_sql result object...');
      console.log('📊 Keys:', Object.keys(execResult));
      console.log('📊 success:', execResult.success);
      console.log('📊 type:', execResult.type);
      console.log('📊 data:', execResult.data);
      
      if (execResult.data) {
        console.log('📊 data type:', typeof execResult.data);
        console.log('📊 data is array:', Array.isArray(execResult.data));
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDirect(); 