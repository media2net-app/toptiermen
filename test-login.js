const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔍 Testing login with chiel@media2net.nl...');
  
  try {
    // Test login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'chiel@media2net.nl',
      password: 'W4t3rk0k3r^'
    });
    
    if (error) {
      console.error('❌ Login failed:', error.message);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('👤 User:', data.user?.email);
    console.log('🔑 Session expires at:', new Date(data.session?.expires_at * 1000));
    
    // Test session retrieval
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session retrieval failed:', sessionError.message);
    } else if (sessionData.session) {
      console.log('✅ Session retrieved successfully');
      console.log('👤 Session user:', sessionData.session.user?.email);
    } else {
      console.log('⚠️ No session found');
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testLogin();
