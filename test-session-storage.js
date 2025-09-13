const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mock localStorage for Node.js
global.localStorage = {
  getItem: (key) => {
    console.log(`📦 localStorage.getItem("${key}")`);
    return null;
  },
  setItem: (key, value) => {
    console.log(`📦 localStorage.setItem("${key}", "${value?.substring(0, 50)}...")`);
  },
  removeItem: (key) => {
    console.log(`📦 localStorage.removeItem("${key}")`);
  }
};

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: global.localStorage, // Use our mock localStorage
  }
});

async function testSessionStorage() {
  console.log('🔍 Testing session storage behavior...');
  
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
    
    // Step 2: Check what was stored
    console.log('\n📝 Step 2: Check stored session');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError.message);
    } else if (sessionData.session) {
      console.log('✅ Session found:', sessionData.session.user?.email);
    } else {
      console.log('⚠️ No session found');
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testSessionStorage();
