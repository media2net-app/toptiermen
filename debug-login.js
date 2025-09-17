require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugLogin() {
  try {
    console.log('🔍 Debugging login for premium.test@toptiermen.eu...');
    
    // Check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    const user = authUsers.users.find(u => u.email === 'premium.test@toptiermen.eu');
    
    if (!user) {
      console.log('❌ User not found in auth.users');
      console.log('📋 Available users:');
      authUsers.users.forEach(u => {
        console.log(`  - ${u.email} (${u.id})`);
      });
      return;
    }
    
    console.log('✅ User found in auth.users:');
    console.log('  - Email:', user.email);
    console.log('  - ID:', user.id);
    console.log('  - Created:', user.created_at);
    console.log('  - Last Sign In:', user.last_sign_in_at);
    console.log('  - Email Confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
    
    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
    } else {
      console.log('✅ Profile found:');
      console.log('  - Full Name:', profile.full_name);
      console.log('  - Package Type:', profile.package_type);
      console.log('  - Subscription Tier:', profile.subscription_tier);
    }
    
    // Test login with the password
    console.log('\n🔐 Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'premium.test@toptiermen.eu',
      password: 'TestPassword123!'
    });
    
    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      console.error('❌ Login error code:', loginError.status);
    } else {
      console.log('✅ Login successful!');
      console.log('  - User ID:', loginData.user.id);
      console.log('  - Session:', !!loginData.session);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugLogin();
