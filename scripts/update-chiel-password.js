require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔐 Updating Chiel Password...');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateChielPassword() {
  console.log('📋 STEP 1: Updating Chiel Password');
  console.log('----------------------------------------');
  
  try {
    const newPassword = 'W4t3rk0k3r^';
    const chielEmail = 'chiel@media2net.nl';
    
    console.log(`🔄 Updating password for: ${chielEmail}`);
    console.log(`🔑 New password: ${newPassword}`);

    // Update password using admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      '061e43d5-c89a-42bb-8a4c-04be2ce99a7e', // Chiel's user ID
      { password: newPassword }
    );

    if (error) {
      console.error('❌ Password update failed:', error.message);
      return false;
    }

    console.log('✅ Password updated successfully!');
    console.log('📊 User details:');
    console.log(`   - Email: ${data.user.email}`);
    console.log(`   - ID: ${data.user.id}`);
    console.log(`   - Updated at: ${data.user.updated_at}`);

    return true;

  } catch (error) {
    console.error('❌ Password update failed:', error.message);
    return false;
  }
}

async function verifyPasswordUpdate() {
  console.log('\n📋 STEP 2: Verifying Password Update');
  console.log('----------------------------------------');
  
  try {
    const chielEmail = 'chiel@media2net.nl';
    const newPassword = 'W4t3rk0k3r^';

    console.log('🧪 Testing login with new password...');

    // Test login with new password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: chielEmail,
      password: newPassword
    });

    if (error) {
      console.error('❌ Login test failed:', error.message);
      return false;
    }

    console.log('✅ Login test successful!');
    console.log(`   - User: ${data.user.email}`);
    console.log(`   - Session: ${data.session ? 'Active' : 'None'}`);

    // Sign out after test
    await supabase.auth.signOut();
    console.log('🔒 Signed out after test');

    return true;

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

async function createSummaryReport() {
  console.log('\n📋 STEP 3: Summary Report');
  console.log('----------------------------------------');
  
  console.log('🎉 PASSWORD UPDATE COMPLETED!');
  console.log('============================================================');
  console.log('✅ Chiel password updated successfully');
  console.log('✅ Login test passed');
  console.log('');
  console.log('📋 New Credentials:');
  console.log('   - Email: chiel@media2net.nl');
  console.log('   - Password: W4t3rk0k3r^');
  console.log('');
  console.log('💡 Chiel can now log in with the new password!');
}

async function main() {
  try {
    console.log('🚀 Starting password update process...');
    
    // Step 1: Update password
    const updateOk = await updateChielPassword();
    if (!updateOk) {
      console.error('❌ Password update failed - stopping');
      return;
    }

    // Step 2: Verify update
    const verifyOk = await verifyPasswordUpdate();
    if (!verifyOk) {
      console.error('❌ Verification failed');
      return;
    }

    // Step 3: Create report
    await createSummaryReport();

  } catch (error) {
    console.error('❌ Password update process failed:', error.message);
  }
}

main();
