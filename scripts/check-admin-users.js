const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAdminUsers() {
  console.log('🔍 Checking all admin users in database...\n');

  try {
    // Get all users with admin role
    const { data: adminProfiles, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at, updated_at')
      .eq('role', 'admin');

    if (adminError) {
      console.error('❌ Error fetching admin profiles:', adminError);
      return;
    }

    console.log('👑 ADMIN USERS:');
    if (adminProfiles && adminProfiles.length > 0) {
      adminProfiles.forEach(profile => {
        console.log(`  - Email: ${profile.email}`);
        console.log(`  - Role: ${profile.role}`);
        console.log(`  - Created: ${profile.created_at}`);
        console.log(`  - Updated: ${profile.updated_at}`);
        console.log('');
      });
    } else {
      console.log('  ❌ No admin users found!');
    }

    // Get all users to see distribution
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('role');

    if (allError) {
      console.error('❌ Error fetching all profiles:', allError);
      return;
    }

    // Count roles
    const roleCounts = {};
    allProfiles.forEach(profile => {
      const role = profile.role || 'null';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    console.log('📊 ROLE DISTRIBUTION:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  - ${role}: ${count} users`);
    });

    // Check if admin dashboard should be accessible
    console.log('\n🔐 ADMIN DASHBOARD ACCESS:');
    if (adminProfiles && adminProfiles.length > 0) {
      console.log('✅ Admin dashboard should be accessible for:');
      adminProfiles.forEach(profile => {
        console.log(`  - ${profile.email}`);
      });
    } else {
      console.log('❌ No admin users - admin dashboard not accessible!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAdminUsers();
