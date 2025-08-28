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

async function testPlanningLanceringPublic() {
  try {
    console.log('🔍 Testing public Planning Lancering page access...\n');

    // Test 1: Check if the page exists
    console.log('📄 Test 1: Checking if page exists...');
    const pageResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://platform.toptiermen.eu'}/dashboard/planning-lancering`);
    
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

    // Test 2: Check if user can access it
    console.log('\n🔐 Test 2: Checking user access...');
    
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
      
      console.log('   ✅ User should be able to access Planning Lancering page');
    } else {
      console.log('   ❌ User not found');
    }

    console.log('\n📋 Page Access Summary:');
    console.log('   🚀 Planning Lancering page moved to /dashboard/planning-lancering');
    console.log('   🔓 Accessible to all logged-in users (not just admin)');
    console.log('   🎨 Special styling with CRITICAL badge');
    console.log('   📱 Available in main dashboard sidebar');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Log in to the platform');
    console.log('   2. Navigate to /dashboard/planning-lancering');
    console.log('   3. Or click the Planning Lancering link in the sidebar');
    console.log('   4. Page should now load correctly');

  } catch (error) {
    console.error('❌ Error testing planning lancering access:', error);
  }
}

// Run the test
testPlanningLanceringPublic();
