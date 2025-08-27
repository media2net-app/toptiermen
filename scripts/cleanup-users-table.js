require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🧹 Cleaning Up Users Table...');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanupUsersTable() {
  console.log('📋 STEP 1: Identifying Test Users');
  console.log('----------------------------------------');
  
  try {
    // Get all users from users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    const profileIds = new Set(profiles.map(p => p.id));

    // Categorize users
    const usersToKeep = [];
    const usersToDelete = [];

    users.forEach(user => {
      if (profileIds.has(user.id)) {
        usersToKeep.push(user);
      } else {
        usersToDelete.push(user);
      }
    });

    console.log('📊 User Categorization:');
    console.log(`   - Users to KEEP (have profiles): ${usersToKeep.length}`);
    console.log(`   - Users to DELETE (test data): ${usersToDelete.length}`);

    if (usersToKeep.length > 0) {
      console.log('\n📋 Users to KEEP:');
      usersToKeep.forEach(user => {
        console.log(`   ✅ ${user.email} (${user.id}) - ${user.role}`);
      });
    }

    if (usersToDelete.length > 0) {
      console.log('\n📋 Users to DELETE (test data):');
      usersToDelete.forEach(user => {
        console.log(`   🗑️ ${user.email} (${user.id}) - ${user.role}`);
      });
    }

    return { usersToKeep, usersToDelete };

  } catch (error) {
    console.error('❌ Cleanup analysis failed:', error.message);
    return null;
  }
}

async function deleteTestUsers(usersToDelete) {
  console.log('\n📋 STEP 2: Deleting Test Users');
  console.log('----------------------------------------');
  
  if (usersToDelete.length === 0) {
    console.log('✅ No test users to delete');
    return true;
  }

  try {
    console.log(`🗑️ Deleting ${usersToDelete.length} test users...`);
    
    let deletedCount = 0;
    let errorCount = 0;

    for (const user of usersToDelete) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id);

        if (error) {
          console.error(`❌ Failed to delete ${user.email}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Deleted: ${user.email}`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`❌ Error deleting ${user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Deletion Summary:');
    console.log(`   - Successfully deleted: ${deletedCount}`);
    console.log(`   - Errors: ${errorCount}`);

    return errorCount === 0;

  } catch (error) {
    console.error('❌ Deletion process failed:', error.message);
    return false;
  }
}

async function verifyCleanup() {
  console.log('\n📋 STEP 3: Verifying Cleanup');
  console.log('----------------------------------------');
  
  try {
    // Check remaining users
    const { data: remainingUsers, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ Error checking remaining users:', usersError.message);
      return false;
    }

    // Check profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Error checking profiles:', profilesError.message);
      return false;
    }

    console.log('📊 Final Status:');
    console.log(`   - Users table: ${remainingUsers.length} records`);
    console.log(`   - Profiles table: ${profiles.length} records`);

    if (remainingUsers.length > 0) {
      console.log('\n📋 Remaining Users:');
      remainingUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.id}) - ${user.role}`);
      });
    }

    // Verify all remaining users have profiles
    const profileIds = new Set(profiles.map(p => p.id));
    const usersWithoutProfiles = remainingUsers.filter(u => !profileIds.has(u.id));

    if (usersWithoutProfiles.length > 0) {
      console.log('\n⚠️ WARNING: Some users don\'t have profiles!');
      usersWithoutProfiles.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
      return false;
    } else {
      console.log('\n✅ SUCCESS: All remaining users have profiles!');
      return true;
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

async function createFinalReport() {
  console.log('\n📋 STEP 4: Final Report');
  console.log('----------------------------------------');
  
  console.log('🎉 CLEANUP COMPLETED!');
  console.log('============================================================');
  console.log('✅ Test users removed from users table');
  console.log('✅ All remaining users have profiles');
  console.log('✅ Users table is now clean');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Test the application thoroughly');
  console.log('   2. Remove the users table from database');
  console.log('   3. Update documentation');
  console.log('');
  console.log('💡 The platform now uses only the profiles table!');
}

async function main() {
  try {
    console.log('🚀 Starting cleanup process...');
    
    // Step 1: Analyze users
    const analysis = await cleanupUsersTable();
    if (!analysis) {
      console.error('❌ Analysis failed - stopping');
      return;
    }

    const { usersToDelete } = analysis;

    // Step 2: Delete test users
    const deletionOk = await deleteTestUsers(usersToDelete);
    if (!deletionOk) {
      console.error('❌ Deletion failed - stopping');
      return;
    }

    // Step 3: Verify cleanup
    const verificationOk = await verifyCleanup();
    if (!verificationOk) {
      console.error('❌ Verification failed');
      return;
    }

    // Step 4: Create report
    await createFinalReport();

  } catch (error) {
    console.error('❌ Cleanup process failed:', error.message);
  }
}

main();
