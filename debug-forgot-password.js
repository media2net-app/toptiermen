const { createClient } = require('@supabase/supabase-js');

async function debugForgotPassword() {
  try {
    console.log('🔍 Debugging forgot password issue...\n');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const email = 'chielvanderzee@gmail.com';

    // 1. Check if user exists in profiles
    console.log('1️⃣ Checking profiles table...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, display_name, package_type')
      .eq('email', email)
      .single();

    if (profileError) {
      console.log('❌ Profile error:', profileError);
    } else {
      console.log('✅ Profile found:', profile);
    }

    // 2. Check if user exists in auth
    console.log('\n2️⃣ Checking auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Auth error:', authError);
    } else {
      console.log(`📊 Total auth users: ${authUsers.users.length}`);
      
      const user = authUsers.users.find(u => u.email === email);
      if (user) {
        console.log('✅ Auth user found:', {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at
        });
        
        // 3. Try to update password directly
        console.log('\n3️⃣ Trying direct password update...');
        const newPassword = 'TestPassword123!';
        
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: newPassword }
        );
        
        if (updateError) {
          console.log('❌ Password update error:', updateError);
        } else {
          console.log('✅ Password updated successfully:', newPassword);
        }
        
      } else {
        console.log('❌ Auth user not found');
        
        // 4. Try to create auth user
        console.log('\n4️⃣ Trying to create auth user...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: email,
          password: 'TestPassword123!',
          email_confirm: true,
          user_metadata: {
            full_name: profile?.full_name || 'Test User',
            admin_created: true
          }
        });
        
        if (createError) {
          console.log('❌ Create user error:', createError);
        } else {
          console.log('✅ Auth user created:', newUser.user?.id);
        }
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugForgotPassword();
