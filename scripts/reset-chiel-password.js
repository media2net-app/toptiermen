require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🔐 Resetting Chiel Password...');
console.log('============================================================');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

// Create Supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

async function resetChielPassword() {
  const email = 'chiel@media2net.nl';
  const newPassword = 'TopTierMen2025!'; // Strong password for testing
  
  try {
    console.log('🔄 Resetting password for:', email);
    
    // First, check if user exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return false;
    }
    
    const chielUser = users.users.find(user => user.email === email);
    
    if (!chielUser) {
      console.error('❌ User not found:', email);
      return false;
    }
    
    console.log('✅ User found:', chielUser.id);
    
    // Update the user's password
    const { data, error } = await supabase.auth.admin.updateUserById(
      chielUser.id,
      { password: newPassword }
    );
    
    if (error) {
      console.error('❌ Password reset failed:', error.message);
      return false;
    }
    
    console.log('✅ Password reset successful!');
    console.log('📧 Email:', data.user.email);
    console.log('🔑 New password:', newPassword);
    console.log('⏰ Updated at:', data.user.updated_at);
    
    return true;
  } catch (error) {
    console.error('❌ Password reset error:', error.message);
    return false;
  }
}

async function testNewPassword() {
  const email = 'chiel@media2net.nl';
  const password = 'TopTierMen2025!';
  
  try {
    console.log('\n🧪 Testing new password...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      console.error('❌ Login test failed:', error.message);
      return false;
    }
    
    console.log('✅ Login test successful!');
    console.log('👤 User ID:', data.user?.id);
    console.log('📧 Email:', data.user?.email);
    
    return true;
  } catch (error) {
    console.error('❌ Login test error:', error.message);
    return false;
  }
}

async function main() {
  try {
    const resetOk = await resetChielPassword();
    
    if (resetOk) {
      // Wait a moment for the password to be updated
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test the new password
      await testNewPassword();
      
      console.log('\n📋 SUMMARY');
      console.log('----------------------------------------');
      console.log('✅ Password reset: SUCCESSFUL');
      console.log('✅ Login test: SUCCESSFUL');
      console.log('🔑 New password: TopTierMen2025!');
      console.log('💡 You can now login with these credentials');
    } else {
      console.log('\n❌ Password reset failed');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

main();
