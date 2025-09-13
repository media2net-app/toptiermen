const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

async function testHardRefresh() {
  console.log('🔍 Testing hard refresh behavior...');
  
  try {
    // Step 1: Login
    console.log('\n📝 Step 1: Login');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'chiel@media2net.nl',
      password: 'W4t3rk0k3r^'
    });
    
    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      return;
    }
    
    console.log('✅ Login successful');
    console.log('👤 User:', loginData.user?.email);
    console.log('🔑 Session expires at:', new Date(loginData.session?.expires_at * 1000));
    
    // Step 2: Check session immediately after login
    console.log('\n📝 Step 2: Check session after login');
    const { data: sessionData1, error: sessionError1 } = await supabase.auth.getSession();
    
    if (sessionError1) {
      console.error('❌ Session check failed:', sessionError1.message);
    } else if (sessionData1.session) {
      console.log('✅ Session found:', sessionData1.session.user?.email);
    } else {
      console.log('⚠️ No session found');
    }
    
    // Step 3: Simulate hard refresh (create new client instance)
    console.log('\n📝 Step 3: Simulate hard refresh (new client instance)');
    const newSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      }
    });
    
    // Check session with new client
    const { data: sessionData2, error: sessionError2 } = await newSupabase.auth.getSession();
    
    if (sessionError2) {
      console.error('❌ Session check after refresh failed:', sessionError2.message);
    } else if (sessionData2.session) {
      console.log('✅ Session restored after refresh:', sessionData2.session.user?.email);
      console.log('🔑 Session expires at:', new Date(sessionData2.session.expires_at * 1000));
    } else {
      console.log('⚠️ No session found after refresh - this would cause redirect to login');
    }
    
    // Step 4: Listen for auth state changes
    console.log('\n📝 Step 4: Testing auth state change listener');
    const { data: { subscription } } = newSupabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`🔔 Auth state change: ${event}`, session?.user?.email || 'no user');
        
        if (event === 'INITIAL_SESSION') {
          console.log('🔄 INITIAL_SESSION event received');
        }
      }
    );
    
    // Wait a bit for the listener
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    subscription.unsubscribe();
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testHardRefresh();
