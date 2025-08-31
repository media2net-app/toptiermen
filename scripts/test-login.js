const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔐 Testing login functionality...\n');

  try {
    const testEmail = 'test@toptiermen.eu';
    const testPassword = 'TestPassword123!';

    console.log('📋 Login Credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('');

    // Test login
    console.log('🔑 Attempting login...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      return;
    }

    if (data.user) {
      console.log('✅ Login successful!');
      console.log('👤 User details:');
      console.log(`   ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Created: ${data.user.created_at}`);
      console.log(`   Last sign in: ${data.user.last_sign_in_at}`);
      
      if (data.session) {
        console.log('🔑 Session details:');
        console.log(`   Access token: ${data.session.access_token.substring(0, 20)}...`);
        console.log(`   Refresh token: ${data.session.refresh_token.substring(0, 20)}...`);
        console.log(`   Expires at: ${new Date(data.session.expires_at * 1000).toLocaleString()}`);
      }

      // Test dashboard API with session
      console.log('\n📊 Testing dashboard API with session...');
      const response = await fetch('http://localhost:3000/api/dashboard-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.session.access_token}`
        },
        body: JSON.stringify({
          userId: data.user.id
        })
      });

      if (response.ok) {
        const dashboardData = await response.json();
        console.log('✅ Dashboard API working!');
        console.log('📈 Dashboard stats received');
      } else {
        const errorText = await response.text();
        console.error('❌ Dashboard API failed:', response.status, response.statusText);
        console.error('Error details:', errorText);
      }

    } else {
      console.log('⚠️ No user data returned');
    }

  } catch (error) {
    console.error('❌ Error during login test:', error);
  }
}

testLogin();
