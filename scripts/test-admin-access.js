const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAdminAccess() {
  console.log('🧪 Testing Admin Access for Rick...\n');

  try {
    // Get Rick's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'rick@toptiermen.com')
      .single();

    if (profileError) {
      console.error('❌ Error fetching Rick\'s profile:', profileError);
      return;
    }

    console.log('✅ Rick\'s profile found:');
    console.log(`   Email: ${profile.email}`);
    console.log(`   Role: ${profile.role}`);
    console.log(`   ID: ${profile.id}`);

    // Check if Rick is admin
    if (profile.role?.toLowerCase() === 'admin') {
      console.log('\n✅ Rick has admin role - should be able to access dashboard-admin');
    } else {
      console.log('\n❌ Rick does NOT have admin role');
      console.log('   Current role:', profile.role);
      console.log('   Expected: admin');
    }

    // Test authentication status
    console.log('\n🔐 Authentication Status:');
    console.log(`   User authenticated: ${!!profile.id}`);
    console.log(`   Role verified: ${profile.role?.toLowerCase() === 'admin'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminAccess();
