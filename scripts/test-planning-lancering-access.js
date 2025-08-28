const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPlanningLanceringAccess() {
  try {
    console.log('🔍 Testing Planning Lancering page access...\n');

    // Test 1: Check if the page exists
    console.log('📄 Test 1: Checking if page exists...');
    const pageResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/dashboard-admin/planning-lancering`);
    
    console.log('   Status:', pageResponse.status);
    console.log('   URL:', pageResponse.url);
    
    if (pageResponse.status === 200) {
      console.log('   ✅ Page exists and is accessible');
    } else if (pageResponse.status === 302 || pageResponse.status === 301) {
      console.log('   ⚠️  Page redirects (likely authentication required)');
      console.log('   Redirect location:', pageResponse.headers.get('location'));
    } else {
      console.log('   ❌ Page not accessible');
    }

    // Test 2: Check admin user authentication
    console.log('\n🔐 Test 2: Checking admin authentication...');
    
    // Try to get user info for chiel@media2net.nl
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('email', 'chiel@media2net.nl');

    if (userError) {
      console.error('   ❌ Error fetching user:', userError);
    } else if (users && users.length > 0) {
      const user = users[0];
      console.log('   👤 User found:', {
        email: user.email,
        role: user.role,
        name: user.full_name
      });
      
      if (user.role === 'admin') {
        console.log('   ✅ User has admin role');
      } else {
        console.log('   ❌ User does not have admin role');
        console.log('   🔧 Fix: Update user role to admin');
      }
    } else {
      console.log('   ❌ User not found');
    }

    // Test 3: Check authentication context
    console.log('\n🔑 Test 3: Checking authentication context...');
    
    // This would require a logged-in session, but we can check the auth setup
    console.log('   📋 Auth setup check:');
    console.log('   - Supabase URL configured:', !!supabaseUrl);
    console.log('   - Service key available:', !!supabaseServiceKey);
    console.log('   - Site URL:', process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu');

    console.log('\n📋 Possible Issues:');
    console.log('   1. User not logged in');
    console.log('   2. User does not have admin role');
    console.log('   3. Authentication context not loading properly');
    console.log('   4. Session expired');
    
    console.log('\n🔧 Solutions:');
    console.log('   1. Log in with admin account');
    console.log('   2. Update user role to admin in database');
    console.log('   3. Clear browser cache and cookies');
    console.log('   4. Check authentication state');

  } catch (error) {
    console.error('❌ Error testing planning lancering access:', error);
  }
}

// Run the test
testPlanningLanceringAccess();
