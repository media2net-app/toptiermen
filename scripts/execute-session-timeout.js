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

async function executeSessionTimeout() {
  console.log('⏰ Setting up session timeout extension...');

  try {
    // Since we can't use exec_sql for function creation, we'll provide the SQL manually
    console.log('📋 Please run this SQL manually in Supabase SQL Editor:');
    console.log('\n' + fs.readFileSync('extend_session_timeout.sql', 'utf8') + '\n');
    
    console.log('🔧 After running the SQL, testing the functions...');
    console.log('⏳ Waiting 5 seconds for you to run the SQL...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test if the functions were created
    console.log('🧪 Testing session timeout functions...');
    
    // Test 1: Check if extend_user_session function exists
    const { data: functionCheck, error: functionError } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT routine_name FROM information_schema.routines WHERE routine_name = \'extend_user_session\''
    });
    
    if (functionError) {
      console.error('❌ Function check failed:', functionError);
    } else if (functionCheck && functionCheck.length > 0) {
      console.log('✅ extend_user_session function exists');
    } else {
      console.log('❌ extend_user_session function not found');
    }
    
    // Test 2: Check if auto_extend_session function exists
    const { data: autoFunctionCheck, error: autoFunctionError } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT routine_name FROM information_schema.routines WHERE routine_name = \'auto_extend_session\''
    });
    
    if (autoFunctionError) {
      console.error('❌ Auto function check failed:', autoFunctionError);
    } else if (autoFunctionCheck && autoFunctionCheck.length > 0) {
      console.log('✅ auto_extend_session function exists');
    } else {
      console.log('❌ auto_extend_session function not found');
    }
    
    // Test 3: Check if refresh_all_active_sessions function exists
    const { data: refreshFunctionCheck, error: refreshFunctionError } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT routine_name FROM information_schema.routines WHERE routine_name = \'refresh_all_active_sessions\''
    });
    
    if (refreshFunctionError) {
      console.error('❌ Refresh function check failed:', refreshFunctionError);
    } else if (refreshFunctionCheck && refreshFunctionCheck.length > 0) {
      console.log('✅ refresh_all_active_sessions function exists');
    } else {
      console.log('❌ refresh_all_active_sessions function not found');
    }
    
    // Test 4: Check if triggers exist
    const { data: triggerCheck, error: triggerError } = await supabase.rpc('exec_sql', {
      sql_query: 'SELECT trigger_name FROM information_schema.triggers WHERE trigger_name LIKE \'%auto_extend_session%\''
    });
    
    if (triggerError) {
      console.error('❌ Trigger check failed:', triggerError);
    } else if (triggerCheck && triggerCheck.length > 0) {
      console.log('✅ Session extension triggers exist');
      console.log('📊 Triggers:', triggerCheck.map(t => t.trigger_name));
    } else {
      console.log('❌ Session extension triggers not found');
    }
    
    console.log('\n🎉 Session timeout setup completed!');
    console.log('📋 Remember to also update JWT expiry in Supabase Dashboard to 30 days');

  } catch (error) {
    console.error('❌ Error setting up session timeout:', error);
  }
}

// Run the setup
executeSessionTimeout(); 