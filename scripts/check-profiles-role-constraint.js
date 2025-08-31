const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfilesRoleConstraint() {
  console.log('🔍 Checking profiles table role constraint...\n');

  try {
    // Check existing profiles to see what roles are used
    console.log('📋 STEP 1: Checking existing profiles');
    console.log('----------------------------------------');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(10);

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} profiles`);
      
      if (profiles && profiles.length > 0) {
        console.log('📊 Existing roles:');
        const roles = [...new Set(profiles.map(p => p.role))];
        roles.forEach(role => {
          const count = profiles.filter(p => p.role === role).length;
          console.log(`   - "${role}": ${count} users`);
        });
      }
    }

    // Try to create a profile with different roles to see which ones work
    console.log('\n📋 STEP 2: Testing different roles');
    console.log('----------------------------------------');
    
    const testRoles = ['user', 'admin', 'test', 'member', 'moderator'];
    
    for (const role of testRoles) {
      try {
        // Generate a proper UUID
        const testId = crypto.randomUUID();
        const testEmail = `test-${role}-${Date.now()}@test.com`;
        
        const { error: testError } = await supabase
          .from('profiles')
          .insert({
            id: testId,
            email: testEmail,
            full_name: `Test ${role}`,
            role: role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (testError) {
          console.log(`❌ Role "${role}" failed:`, testError.message);
        } else {
          console.log(`✅ Role "${role}" works!`);
          
          // Clean up the test record
          await supabase
            .from('profiles')
            .delete()
            .eq('id', testId);
        }
      } catch (error) {
        console.log(`❌ Role "${role}" failed:`, error.message);
      }
    }

    console.log('\n🎯 Role constraint check completed!');

  } catch (error) {
    console.error('❌ Error during check:', error);
  }
}

checkProfilesRoleConstraint();
