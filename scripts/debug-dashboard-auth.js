const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDashboardAuth() {
  console.log('🔍 Debugging Dashboard Auth & API...\n');

  try {
    // 1. Check current session
    console.log('1️⃣ Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return;
    }

    if (!session) {
      console.log('⚠️ No active session found');
      console.log('💡 User needs to be logged in to access dashboard');
      return;
    }

    console.log('✅ Session found for user:', session.user.email);
    console.log('   User ID:', session.user.id);
    console.log('   Session expires:', new Date(session.expires_at * 1000).toLocaleString());

    // 2. Test dashboard API
    console.log('\n2️⃣ Testing dashboard API...');
    
    const response = await fetch('http://localhost:3000/api/dashboard-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        userId: session.user.id
      })
    });

    console.log('   API Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dashboard API working');
      console.log('   Stats received:', Object.keys(data.stats || {}));
      console.log('   User badges:', data.userBadges?.length || 0);
    } else {
      const errorText = await response.text();
      console.error('❌ Dashboard API failed:', response.status, response.statusText);
      console.error('   Error details:', errorText);
    }

    // 3. Check user profile
    console.log('\n3️⃣ Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError);
    } else if (profile) {
      console.log('✅ User profile found');
      console.log('   Name:', profile.full_name);
      console.log('   Role:', profile.role);
      console.log('   Email:', profile.email);
    } else {
      console.log('⚠️ No profile found for user');
    }

    // 4. Test frontend dashboard page
    console.log('\n4️⃣ Testing frontend dashboard...');
    console.log('   URL: http://localhost:3000/dashboard');
    console.log('   Make sure you are logged in in the browser');
    console.log('   Check browser console for any errors');

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugDashboardAuth();
