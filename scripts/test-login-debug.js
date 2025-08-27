require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Login Debug...');
console.log('============================================================');

// Check environment variables
console.log('📋 STEP 1: Environment Variables Check');
console.log('----------------------------------------');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('✅ Supabase URL:', supabaseUrl ? 'Configured' : '❌ MISSING');
console.log('✅ Supabase Anon Key:', supabaseAnonKey ? 'Configured' : '❌ MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'toptiermen-v2-auth'
  }
});

async function testLogin() {
  console.log('\n📋 STEP 2: Testing Login with Chiel Credentials');
  console.log('----------------------------------------');
  
  const email = 'chiel@media2net.nl';
  const password = 'TopTierMen2025!'; // Updated password
  
  try {
    console.log('🔄 Attempting login...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      console.log('🔍 Error details:', error);
      return false;
    }

    console.log('✅ Login successful!');
    console.log('👤 User ID:', data.user?.id);
    console.log('📧 Email:', data.user?.email);
    console.log('🔑 Session expires:', data.session?.expires_at);
    
    return true;
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
}

async function testSession() {
  console.log('\n📋 STEP 3: Testing Session Management');
  console.log('----------------------------------------');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session check failed:', error.message);
      return false;
    }

    if (session) {
      console.log('✅ Active session found');
      console.log('👤 User ID:', session.user?.id);
      console.log('📧 Email:', session.user?.email);
      console.log('🔑 Expires:', new Date(session.expires_at * 1000).toLocaleString());
    } else {
      console.log('ℹ️ No active session found');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Session check error:', error.message);
    return false;
  }
}

async function testUserProfile() {
  console.log('\n📋 STEP 4: Testing User Profile Fetch');
  console.log('----------------------------------------');
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ User fetch failed:', userError.message);
      return false;
    }

    if (!user) {
      console.log('ℹ️ No authenticated user found');
      return false;
    }

    console.log('✅ User authenticated');
    console.log('👤 User ID:', user.id);
    console.log('📧 Email:', user.email);

    // Try to fetch profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError.message);
    } else if (profile) {
      console.log('✅ Profile found');
      console.log('👤 Full Name:', profile.full_name);
      console.log('🎭 Role:', profile.role);
    } else {
      console.log('ℹ️ No profile found in profiles table');
    }
    
    return true;
  } catch (error) {
    console.error('❌ User profile error:', error.message);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n📋 STEP 5: Testing Database Connection');
  console.log('----------------------------------------');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Test database connection first
    const dbOk = await testDatabaseConnection();
    if (!dbOk) {
      console.error('❌ Database connection failed - stopping tests');
      return;
    }

    // Test session
    await testSession();

    // Test login
    const loginOk = await testLogin();
    
    if (loginOk) {
      // Test user profile after successful login
      await testUserProfile();
    }

    console.log('\n📋 STEP 6: Summary');
    console.log('----------------------------------------');
    console.log('✅ Environment variables: OK');
    console.log('✅ Database connection: OK');
    console.log('✅ Supabase client: OK');
    
    if (loginOk) {
      console.log('✅ Login functionality: OK');
      console.log('✅ User profile: OK');
    } else {
      console.log('❌ Login functionality: FAILED');
      console.log('💡 Possible issues:');
      console.log('   - Wrong password');
      console.log('   - User account disabled');
      console.log('   - Network connectivity issues');
      console.log('   - Supabase service issues');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

main();
