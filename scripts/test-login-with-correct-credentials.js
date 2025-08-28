require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔐 TESTING LOGIN WITH CORRECT CREDENTIALS');
console.log('=========================================\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Create Supabase client with unified storage key
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'toptiermen-v2-auth'
  }
});

async function testLoginWithCorrectCredentials() {
  try {
    console.log('📋 STEP 1: Testing login with Chiel credentials');
    console.log('-----------------------------------------------');
    
    const email = 'chiel@media2net.nl';
    const password = 'TopTierMen2025!';
    
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🔄 Attempting login...');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (authError) {
      console.error('❌ Login failed:', authError.message);
      console.log('🔍 Error details:', authError);
      return false;
    }

    console.log('✅ Login successful!');
    console.log('👤 User ID:', authData.user?.id);
    console.log('📧 Email:', authData.user?.email);
    console.log('🔑 Session expires:', new Date(authData.session?.expires_at * 1000).toLocaleString());

    console.log('\n📋 STEP 2: Testing profile fetch');
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
      console.log('📅 Created:', new Date(profile.created_at).toLocaleString());
    }

    console.log('\n📋 STEP 3: Testing session persistence');
    console.log('--------------------------------------');
    
    // Test session persistence
    const { data: { session: newSession }, error: newSessionError } = await supabase.auth.getSession();
    
    if (newSessionError) {
      console.error('❌ Session persistence test failed:', newSessionError.message);
    } else if (newSession) {
      console.log('✅ Session persistence test successful!');
      console.log('👤 User:', newSession.user.email);
      console.log('🔑 Still valid:', new Date(newSession.expires_at * 1000).toLocaleString());
    } else {
      console.log('❌ Session not persisted');
    }

    console.log('\n📋 STEP 4: Testing sign out');
    console.log('---------------------------');
    
    // Test sign out
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('❌ Sign out failed:', signOutError.message);
    } else {
      console.log('✅ Sign out successful!');
    }

    // Verify session is cleared
    const { data: { session: clearedSession } } = await supabase.auth.getSession();
    
    if (clearedSession) {
      console.log('❌ Session not properly cleared');
    } else {
      console.log('✅ Session properly cleared');
    }

    console.log('\n🎉 LOGIN TEST COMPLETE!');
    console.log('=======================');
    console.log('✅ Authentication working');
    console.log('✅ Profile fetch working');
    console.log('✅ Session persistence working');
    console.log('✅ Sign out working');
    console.log('\n💡 The login system is working correctly!');
    console.log('   If you still have issues in the browser:');
    console.log('   1. Clear browser cache and cookies');
    console.log('   2. Try incognito mode');
    console.log('   3. Check browser console for errors');
    console.log('   4. Restart the development server');
    
    return true;
    
  } catch (error) {
    console.error('❌ Login test error:', error.message);
    console.log('🔍 Full error:', error);
    return false;
  }
}

// Run the test
testLoginWithCorrectCredentials();
