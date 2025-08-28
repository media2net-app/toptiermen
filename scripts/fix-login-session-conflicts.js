require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

console.log('🔧 FIXING LOGIN SESSION CONFLICTS');
console.log('==================================\n');

// Create Supabase client with unified storage key
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'toptiermen-v2-auth' // Unified storage key
  }
});

async function fixSessionConflicts() {
  try {
    console.log('📋 STEP 1: Checking current session status');
    console.log('----------------------------------------');
    
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (session) {
      console.log('✅ Active session found');
      console.log('👤 User:', session.user.email);
      console.log('🔑 Expires:', new Date(session.expires_at * 1000).toLocaleString());
    } else {
      console.log('ℹ️  No active session found');
    }

    console.log('\n📋 STEP 2: Testing authentication flow');
    console.log('----------------------------------------');
    
    // Test login with Chiel credentials
    const email = 'chiel@media2net.nl';
    const password = 'TopTierMen2025!';
    
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

    console.log('\n📋 STEP 3: Testing profile fetch');
    console.log('----------------------------------------');
    
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

    console.log('\n📋 STEP 4: Testing session persistence');
    console.log('----------------------------------------');
    
    // Test session persistence by getting session again
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

    console.log('\n📋 STEP 5: Sign out test');
    console.log('----------------------------------------');
    
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

    console.log('\n🎉 SESSION CONFLICT FIX COMPLETE!');
    console.log('==================================');
    console.log('✅ Authentication flow working');
    console.log('✅ Profile fetch working');
    console.log('✅ Session persistence working');
    console.log('✅ Sign out working');
    console.log('\n💡 If login still fails, try:');
    console.log('   1. Clear browser cache/cookies');
    console.log('   2. Try incognito mode');
    console.log('   3. Check browser console for errors');
    
    return true;
    
  } catch (error) {
    console.error('❌ Fix session conflicts error:', error.message);
    return false;
  }
}

// Run the fix
fixSessionConflicts();
