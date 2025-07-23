const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

// Use the anon key for this test to simulate the actual login flow
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLoginFlow() {
  console.log('🧪 Testing login flow with anon key...');

  try {
    // 1. Test if we can query users table (should fail with anon key due to RLS)
    console.log('📋 Testing user table access with anon key...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, status, role')
      .limit(1);

    if (usersError) {
      console.log('✅ Expected error (RLS working):', usersError.message);
    } else {
      console.log('⚠️  Unexpected success - RLS might not be working properly');
      console.log(users);
    }

    // 2. Test authentication with a known user
    console.log('🔐 Testing authentication with chiel@media2net.nl...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'chiel@media2net.nl',
      password: 'test123' // This might not be the correct password
    });

    if (authError) {
      console.log('❌ Authentication error:', authError.message);
      
      // If it's a password error, that's expected
      if (authError.message.includes('Invalid login credentials')) {
        console.log('✅ Authentication flow is working (wrong password expected)');
      } else {
        console.log('❌ Unexpected authentication error');
      }
    } else {
      console.log('✅ Authentication successful!');
      console.log('User:', authData.user?.email);
      
      // Test if we can now query the user's own profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user?.id)
        .single();

      if (profileError) {
        console.log('❌ Error fetching user profile:', profileError.message);
      } else {
        console.log('✅ User profile fetched successfully:');
        console.log('Email:', profile.email);
        console.log('Role:', profile.role);
        console.log('Status:', profile.status);
      }
    }

    // 3. Test the trigger function directly
    console.log('🔧 Testing trigger function directly...');
    const { data: triggerTest, error: triggerError } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Test the trigger function directly
        SELECT update_user_last_login();
      `
    });

    if (triggerError) {
      console.log('❌ Trigger function test error:', triggerError.message);
    } else {
      console.log('✅ Trigger function test successful');
    }

    console.log('🎉 Login flow test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testLoginFlow(); 