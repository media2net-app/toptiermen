require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🌐 Testing Live Login...');
console.log('============================================================');

// Use the same Supabase URL as the live site
const supabaseUrl = 'https://wkjvstuttbeyqzyjayxj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📋 STEP 1: Environment Check');
console.log('----------------------------------------');
console.log('✅ Supabase URL:', supabaseUrl);
console.log('✅ Supabase Anon Key:', supabaseAnonKey ? 'Configured' : '❌ MISSING');

if (!supabaseAnonKey) {
  console.error('❌ Missing Supabase Anon Key!');
  process.exit(1);
}

// Create Supabase client with live configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'toptiermen-v2-auth'
  }
});

async function testLiveLogin() {
  console.log('\n📋 STEP 2: Testing Live Login');
  console.log('----------------------------------------');
  
  const email = 'chiel@media2net.nl';
  const password = 'W4t3rk0k3r^';
  
  try {
    console.log('🔄 Attempting login on live environment...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('❌ Live login failed:', error.message);
      console.log('🔍 Error details:', error);
      return false;
    }

    console.log('✅ Live login successful!');
    console.log('👤 User ID:', data.user?.id);
    console.log('📧 Email:', data.user?.email);
    console.log('🔑 Session expires:', new Date(data.session?.expires_at * 1000).toLocaleString());
    
    return true;
  } catch (error) {
    console.error('❌ Live login error:', error.message);
    return false;
  }
}

async function testLiveSession() {
  console.log('\n📋 STEP 3: Testing Live Session');
  console.log('----------------------------------------');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Live session check failed:', error.message);
      return false;
    }

    if (session) {
      console.log('✅ Live session found');
      console.log('👤 User ID:', session.user?.id);
      console.log('📧 Email:', session.user?.email);
      console.log('🔑 Expires:', new Date(session.expires_at * 1000).toLocaleString());
    } else {
      console.log('ℹ️ No live session found');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Live session check error:', error.message);
    return false;
  }
}

async function testLiveUserProfile() {
  console.log('\n📋 STEP 4: Testing Live User Profile');
  console.log('----------------------------------------');
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Live user fetch failed:', userError.message);
      return false;
    }

    if (!user) {
      console.log('ℹ️ No authenticated user found on live');
      return false;
    }

    console.log('✅ Live user authenticated');
    console.log('👤 User ID:', user.id);
    console.log('📧 Email:', user.email);

    // Try to fetch profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Live profile fetch failed:', profileError.message);
    } else if (profile) {
      console.log('✅ Live profile found');
      console.log('👤 Full Name:', profile.full_name);
      console.log('🎭 Role:', profile.role);
    } else {
      console.log('ℹ️ No profile found in live profiles table');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Live user profile error:', error.message);
    return false;
  }
}

async function testLiveDatabaseConnection() {
  console.log('\n📋 STEP 5: Testing Live Database Connection');
  console.log('----------------------------------------');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Live database connection failed:', error.message);
      return false;
    }

    console.log('✅ Live database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Live database connection error:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Test live database connection first
    const dbOk = await testLiveDatabaseConnection();
    if (!dbOk) {
      console.error('❌ Live database connection failed - stopping tests');
      return;
    }

    // Test live session
    await testLiveSession();

    // Test live login
    const loginOk = await testLiveLogin();
    
    if (loginOk) {
      // Test live user profile after successful login
      await testLiveUserProfile();
    }

    console.log('\n📋 STEP 6: Live Environment Summary');
    console.log('----------------------------------------');
    console.log('✅ Live Supabase URL: OK');
    console.log('✅ Live database connection: OK');
    console.log('✅ Live Supabase client: OK');
    
    if (loginOk) {
      console.log('✅ Live login functionality: OK');
      console.log('✅ Live user profile: OK');
      console.log('🎉 Live environment is working correctly!');
    } else {
      console.log('❌ Live login functionality: FAILED');
      console.log('💡 Possible issues:');
      console.log('   - Different environment variables on live');
      console.log('   - Different user credentials on live');
      console.log('   - Network connectivity issues');
      console.log('   - Supabase service issues on live');
    }

  } catch (error) {
    console.error('❌ Live test failed:', error.message);
  }
}

main();
