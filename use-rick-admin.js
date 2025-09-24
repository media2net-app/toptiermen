require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function useRickAdmin() {
  console.log('🔧 USING RICK.ADMIN@TOPTIERMEN.EU...\n');

  try {
    // 1. Get rick.admin@toptiermen.eu
    console.log('1️⃣ Getting rick.admin@toptiermen.eu...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    const rickAdminUser = authUsers.users.find(user => user.email === 'rick.admin@toptiermen.eu');
    
    if (!rickAdminUser) {
      console.log('❌ rick.admin@toptiermen.eu not found');
      return;
    }

    console.log('✅ Found rick.admin@toptiermen.eu:');
    console.log('   - ID:', rickAdminUser.id);
    console.log('   - Email:', rickAdminUser.email);
    console.log('   - Email confirmed:', rickAdminUser.email_confirmed_at ? 'Yes' : 'No');

    // 2. Update password and confirm email
    console.log('\n2️⃣ Updating password and confirming email...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      rickAdminUser.id,
      { 
        password: 'Carnivoor2025!',
        email_confirm: true
      }
    );

    if (updateError) {
      console.log('❌ Error updating user:', updateError.message);
    } else {
      console.log('✅ User updated successfully');
    }

    // 3. Check/create profile
    console.log('\n3️⃣ Checking profile...');
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'rick.admin@toptiermen.eu');

    if (profileError) {
      console.error('❌ Error checking profile:', profileError);
    } else if (existingProfile && existingProfile.length > 0) {
      console.log('✅ Profile exists:');
      console.log('   - ID:', existingProfile[0].id);
      console.log('   - Role:', existingProfile[0].role);
      
      // Update role to admin if needed
      if (existingProfile[0].role !== 'admin') {
        console.log('🔄 Updating role to admin...');
        const { error: updateRoleError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('email', 'rick.admin@toptiermen.eu');
        
        if (updateRoleError) {
          console.log('❌ Error updating role:', updateRoleError.message);
        } else {
          console.log('✅ Role updated to admin');
        }
      }
    } else {
      console.log('❌ Profile does not exist, creating...');
      
      const { data: profileData, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: rickAdminUser.id,
          email: 'rick.admin@toptiermen.eu',
          role: 'admin',
          name: 'Rick',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (createProfileError) {
        console.error('❌ Error creating profile:', createProfileError);
        return;
      }

      console.log('✅ Profile created:');
      console.log('   - ID:', profileData[0].id);
      console.log('   - Role:', profileData[0].role);
    }

    // 4. Test login
    console.log('\n4️⃣ Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'rick.admin@toptiermen.eu',
      password: 'Carnivoor2025!'
    });

    if (loginError) {
      console.log('❌ Login test failed:', loginError.message);
      console.log('   - Status:', loginError.status);
    } else {
      console.log('✅ Login test successful!');
      console.log('   - User ID:', loginData.user.id);
      console.log('   - Email:', loginData.user.email);
    }

    // 5. Final verification
    console.log('\n5️⃣ Final verification...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'rick.admin@toptiermen.eu')
      .single();

    if (finalError) {
      console.log('❌ Final verification failed:', finalError.message);
    } else {
      console.log('✅ Final verification successful:');
      console.log('   - Role:', finalCheck.role);
      console.log('   - Name:', finalCheck.name);
      console.log('   - ID:', finalCheck.id);
    }

    console.log('\n🎉 RICK.ADMIN USER READY!');
    console.log('📧 Email: rick.admin@toptiermen.eu');
    console.log('🔑 Password: Carnivoor2025!');
    console.log('👑 Role: admin');
    console.log('\n✅ Rick should now be able to login with rick.admin@toptiermen.eu!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

useRickAdmin();
