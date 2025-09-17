require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPassword() {
  try {
    console.log('🔐 Resetting password for premium.test@toptiermen.eu...');
    
    const newPassword = 'TestPassword123!';
    
    // Get user first
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    const user = authUsers.users.find(u => u.email === 'premium.test@toptiermen.eu');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 Found user:', user.email);
    
    // Update password
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });
    
    if (error) {
      console.error('❌ Error updating password:', error);
      return;
    }
    
    console.log('✅ Password updated successfully!');
    console.log('🔑 New password:', newPassword);
    
    // Test login
    console.log('\n🧪 Testing login with new password...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'premium.test@toptiermen.eu',
      password: newPassword
    });
    
    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
    } else {
      console.log('✅ Login test successful!');
      console.log('  - User ID:', loginData.user.id);
      console.log('  - Session created:', !!loginData.session);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

resetPassword();
