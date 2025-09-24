require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRickUser() {
  console.log('🔧 FIXING RICK USER...\n');

  try {
    // 1. Find existing auth user
    console.log('1️⃣ Finding existing auth user...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    const rickAuthUser = authUsers.users.find(user => user.email === 'rick@toptiermen.eu');
    
    if (!rickAuthUser) {
      console.log('❌ Rick not found in auth.users');
      return;
    }

    console.log('✅ Rick found in auth.users:');
    console.log('   - ID:', rickAuthUser.id);
    console.log('   - Email:', rickAuthUser.email);
    console.log('   - Email confirmed:', rickAuthUser.email_confirmed_at ? 'Yes' : 'No');

    // 2. Check if profile exists
    console.log('\n2️⃣ Checking profile...');
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'rick@toptiermen.eu');

    if (profileError) {
      console.error('❌ Error checking profile:', profileError);
    } else if (existingProfile && existingProfile.length > 0) {
      console.log('✅ Profile already exists:');
      console.log('   - ID:', existingProfile[0].id);
      console.log('   - Role:', existingProfile[0].role);
    } else {
      console.log('❌ Profile does not exist, creating...');
      
      // Create profile
      const { data: profileData, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: rickAuthUser.id,
          email: 'rick@toptiermen.eu',
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

    // 3. Update password and confirm email
    console.log('\n3️⃣ Updating password and confirming email...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      rickAuthUser.id,
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

    // 4. Test login
    console.log('\n4️⃣ Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'rick@toptiermen.eu',
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

    // 5. Verify profile access
    console.log('\n5️⃣ Verifying profile access...');
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'rick@toptiermen.eu')
      .single();

    if (verifyError) {
      console.log('❌ Profile verification failed:', verifyError.message);
    } else {
      console.log('✅ Profile verification successful:');
      console.log('   - Role:', verifyProfile.role);
      console.log('   - Name:', verifyProfile.name);
      console.log('   - ID:', verifyProfile.id);
    }

    console.log('\n🎉 RICK USER FIXED!');
    console.log('📧 Email: rick@toptiermen.eu');
    console.log('🔑 Password: Carnivoor2025!');
    console.log('👑 Role: admin');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixRickUser();
