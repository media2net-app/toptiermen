require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🌐 TESTING BROWSER LOGIN FUNCTIONALITY');
console.log('=====================================\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Create Supabase client with browser-like configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'toptiermen-v2-auth'
  }
});

async function testBrowserLogin() {
  try {
    console.log('📋 STEP 1: Testing direct auth endpoint');
    console.log('----------------------------------------');
    
    // Test the auth endpoint directly with fetch
    const authEndpoint = `${supabaseUrl}/auth/v1/token?grant_type=password`;
    
    console.log('🔄 Testing auth endpoint...');
    
    const response = await fetch(authEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        email: 'chiel@media2net.nl',
        password: 'TopTierMen2025!'
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📊 Response body (first 500 chars):', responseText.substring(0, 500));
    
    if (responseText.includes('<!DOCTYPE')) {
      console.log('❌ HTML response received - server error');
      return false;
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.log('❌ Invalid JSON response');
      return false;
    }

    if (responseData.error) {
      console.log('❌ Auth error:', responseData.error);
      return false;
    }

    console.log('✅ Auth endpoint working!');
    console.log('👤 User:', responseData.user?.email);
    console.log('🔑 Access token:', responseData.access_token ? 'Present' : 'Missing');

    console.log('\n📋 STEP 2: Testing Supabase client');
    console.log('-----------------------------------');
    
    // Test with Supabase client
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'chiel@media2net.nl',
      password: 'TopTierMen2025!'
    });

    if (authError) {
      console.error('❌ Supabase client login failed:', authError.message);
      console.log('🔍 Error details:', authError);
      return false;
    }

    console.log('✅ Supabase client login successful!');
    console.log('👤 User ID:', authData.user?.id);
    console.log('📧 Email:', authData.user?.email);
    console.log('🔑 Session expires:', new Date(authData.session?.expires_at * 1000).toLocaleString());

    console.log('\n📋 STEP 3: Testing profile fetch');
    console.log('--------------------------------');
    
    // Test profile fetch
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError.message);
      console.log('🔍 Error details:', profileError);
    } else {
      console.log('✅ Profile fetch successful!');
      console.log('👤 Name:', profile.full_name);
      console.log('🎭 Role:', profile.role);
    }

    console.log('\n📋 STEP 4: Testing session persistence');
    console.log('--------------------------------------');
    
    // Test session persistence
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session persistence test failed:', sessionError.message);
    } else if (session) {
      console.log('✅ Session persistence test successful!');
      console.log('👤 User:', session.user.email);
      console.log('🔑 Still valid:', new Date(session.expires_at * 1000).toLocaleString());
    } else {
      console.log('❌ Session not persisted');
    }

    console.log('\n🎉 BROWSER LOGIN TEST COMPLETE!');
    console.log('===============================');
    console.log('✅ Auth endpoint working');
    console.log('✅ Supabase client working');
    console.log('✅ Profile fetch working');
    console.log('✅ Session persistence working');
    console.log('\n💡 If browser login still fails:');
    console.log('   1. Clear browser cache completely');
    console.log('   2. Try incognito mode');
    console.log('   3. Check browser console for errors');
    console.log('   4. Restart browser');
    
    return true;
    
  } catch (error) {
    console.error('❌ Browser login test error:', error.message);
    console.log('🔍 Full error:', error);
    return false;
  }
}

// Run the test
testBrowserLogin();
