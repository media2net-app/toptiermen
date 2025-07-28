const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testExecSqlDirect() {
  console.log('🧪 Testing exec_sql function directly...');

  try {
    // Test 1: Simple SELECT
    console.log('\n📋 Test 1: Simple SELECT...');
    const selectResult = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT 1 as test'
    });
    console.log('SELECT result:', selectResult);

    // Test 2: Simple CREATE
    console.log('\n📋 Test 2: Simple CREATE...');
    const createResult = await supabase.rpc('exec_sql', {
      sql_query: 'CREATE TABLE IF NOT EXISTS test_direct (id serial PRIMARY KEY)'
    });
    console.log('CREATE result:', createResult);

    // Test 3: Simple INSERT
    console.log('\n📋 Test 3: Simple INSERT...');
    const insertResult = await supabase.rpc('exec_sql', {
      sql_query: 'INSERT INTO test_direct DEFAULT VALUES'
    });
    console.log('INSERT result:', insertResult);

    // Test 4: Simple DROP
    console.log('\n📋 Test 4: Simple DROP...');
    const dropResult = await supabase.rpc('exec_sql', {
      sql_query: 'DROP TABLE IF EXISTS test_direct'
    });
    console.log('DROP result:', dropResult);

    // Test 5: Check what the actual response looks like
    console.log('\n📋 Test 5: Analyzing response format...');
    if (createResult && createResult.data) {
      console.log('Response type:', typeof createResult.data);
      console.log('Response keys:', Object.keys(createResult.data));
      console.log('Response success:', createResult.data.success);
      console.log('Response type:', createResult.data.type);
      console.log('Response data:', createResult.data.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testExecSqlDirect(); 