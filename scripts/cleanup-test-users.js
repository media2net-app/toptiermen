const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupTestUsers() {
  console.log('🧹 Cleaning up test users...\n');

  try {
    // Find all test users (users with @toptiermen.test email)
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    const testUsers = users.users.filter(user => 
      user.email && user.email.includes('@toptiermen.test')
    );

    console.log(`📊 Found ${testUsers.length} test users to clean up`);

    if (testUsers.length === 0) {
      console.log('✅ No test users found to clean up');
      return;
    }

    // Delete each test user
    for (const user of testUsers) {
      console.log(`🗑️  Deleting test user: ${user.email}`);
      
      try {
        // Delete from onboarding_status
        await supabase
          .from('onboarding_status')
          .delete()
          .eq('user_id', user.id);

        // Delete from user_preferences
        await supabase
          .from('user_preferences')
          .delete()
          .eq('user_id', user.id);

        // Delete from profiles
        await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);

        // Delete from auth
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`❌ Error deleting user ${user.email}:`, deleteError.message);
        } else {
          console.log(`✅ Successfully deleted test user: ${user.email}`);
        }
      } catch (error) {
        console.error(`❌ Error cleaning up user ${user.email}:`, error.message);
      }
    }

    console.log('\n🎉 Test user cleanup completed!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupTestUsers();
