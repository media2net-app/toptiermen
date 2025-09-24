require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRickLogin() {
  console.log('🔍 CHECKING RICK LOGIN STATUS...\n');

  try {
    // 1. Check if user exists in auth.users
    console.log('1️⃣ Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    const rickAuthUser = authUsers.users.find(user => user.email === 'rick@toptiermen.eu');
    
    if (rickAuthUser) {
      console.log('✅ Rick found in auth.users:');
      console.log('   - ID:', rickAuthUser.id);
      console.log('   - Email:', rickAuthUser.email);
      console.log('   - Email confirmed:', rickAuthUser.email_confirmed_at ? 'Yes' : 'No');
      console.log('   - Created:', rickAuthUser.created_at);
      console.log('   - Last sign in:', rickAuthUser.last_sign_in_at);
    } else {
      console.log('❌ Rick NOT found in auth.users');
    }

    // 2. Check if user exists in profiles table
    console.log('\n2️⃣ Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'rick@toptiermen.eu');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Rick found in profiles:');
      console.log('   - ID:', profiles[0].id);
      console.log('   - Email:', profiles[0].email);
      console.log('   - Role:', profiles[0].role);
      console.log('   - Created:', profiles[0].created_at);
    } else {
      console.log('❌ Rick NOT found in profiles');
    }

    // 3. Test login attempt
    console.log('\n3️⃣ Testing login attempt...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'rick@toptiermen.eu',
      password: 'Carnivoor2025!'
    });

    if (loginError) {
      console.log('❌ Login failed:');
      console.log('   - Error:', loginError.message);
      console.log('   - Status:', loginError.status);
    } else {
      console.log('✅ Login successful:');
      console.log('   - User ID:', loginData.user?.id);
      console.log('   - Email:', loginData.user?.email);
    }

    // 4. Check if password needs to be reset
    if (rickAuthUser && !rickAuthUser.email_confirmed_at) {
      console.log('\n4️⃣ User email not confirmed - attempting to confirm...');
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        rickAuthUser.id,
        { email_confirm: true }
      );
      
      if (confirmError) {
        console.log('❌ Failed to confirm email:', confirmError.message);
      } else {
        console.log('✅ Email confirmed successfully');
      }
    }

    // 5. Try to reset password if needed
    if (rickAuthUser) {
      console.log('\n5️⃣ Attempting password reset...');
      const { error: resetError } = await supabase.auth.admin.updateUserById(
        rickAuthUser.id,
        { password: 'Carnivoor2025!' }
      );
      
      if (resetError) {
        console.log('❌ Password reset failed:', resetError.message);
      } else {
        console.log('✅ Password reset successful');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkRickLogin();
