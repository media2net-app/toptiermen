const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRoleConstraints() {
  console.log('🔍 Checking role constraints in database...\n');

  try {
    // Check what roles currently exist in the database
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('role')
      .not('role', 'is', null);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    // Get unique roles
    const uniqueRoles = [...new Set(profiles.map(p => p.role))];
    console.log('📊 Current roles in database:');
    uniqueRoles.forEach(role => {
      const count = profiles.filter(p => p.role === role).length;
      console.log(`  - ${role}: ${count} users`);
    });

    // Try to get the constraint information
    console.log('\n🔍 Testing different role values...');
    
    const testRoles = ['admin', 'lid', 'member', 'user', 'basic', 'premium'];
    
    for (const testRole of testRoles) {
      try {
        const { data: testUpdate, error: testError } = await supabase
          .from('profiles')
          .update({ role: testRole })
          .eq('email', 'chiel@media2net.nl')
          .select('role')
          .single();
        
        if (testError) {
          console.log(`  ❌ "${testRole}": ${testError.message}`);
        } else {
          console.log(`  ✅ "${testRole}": Works!`);
        }
      } catch (error) {
        console.log(`  ❌ "${testRole}": ${error.message}`);
      }
    }

    // Check if there's a specific constraint error
    console.log('\n🔍 Checking for role constraint...');
    const { data: constraintInfo, error: constraintError } = await supabase
      .rpc('get_role_constraint_info');

    if (constraintError) {
      console.log('ℹ️  Could not get constraint info directly');
    } else {
      console.log('Constraint info:', constraintInfo);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkRoleConstraints();
