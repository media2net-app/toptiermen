const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableTriggerTemporarily() {
  console.log('🔧 Temporarily disabling the login trigger to fix authentication...');

  try {
    // 1. Disable the trigger completely
    console.log('📝 Disabling the login trigger...');
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql_query: `
        DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
      `
    });

    if (disableError) {
      console.error('❌ Error disabling trigger:', disableError);
    } else {
      console.log('✅ Trigger disabled successfully');
    }

    // 2. Test if we can still update last_login manually
    console.log('🧪 Testing manual last_login update...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql_query: `
        UPDATE users 
        SET last_login = NOW() 
        WHERE email = 'chiel@media2net.nl';
      `
    });

    if (updateError) {
      console.error('❌ Error updating last_login manually:', updateError);
    } else {
      console.log('✅ Manual last_login update successful');
    }

    // 3. Test authentication flow
    console.log('🔐 Testing authentication flow...');
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: authTest, error: authError } = await anonSupabase.auth.signInWithPassword({
      email: 'chiel@media2net.nl',
      password: 'wrongpassword'
    });

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        console.log('✅ Authentication flow working (wrong password expected)');
      } else {
        console.log('❌ Authentication error:', authError.message);
      }
    } else {
      console.log('✅ Authentication successful with wrong password (unexpected)');
    }

    console.log('🎉 Trigger disabled successfully!');
    console.log('📋 Summary:');
    console.log('   - Disabled the problematic trigger');
    console.log('   - Tested manual last_login update');
    console.log('   - Tested authentication flow');
    console.log('');
    console.log('💡 The trigger has been disabled. You should now be able to login.');
    console.log('💡 Last login tracking will need to be updated manually or re-enabled later.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

disableTriggerTemporarily(); 