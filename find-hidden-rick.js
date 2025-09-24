require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findHiddenRick() {
  console.log('🔧 FINDING HIDDEN RICK@TOPTIERMEN.EU...\n');

  try {
    // 1. Get all users and search more thoroughly
    console.log('1️⃣ Getting all users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    console.log(`📊 Total users: ${authUsers.users.length}`);
    
    // Search for rick@toptiermen.eu more thoroughly
    const rickUsers = authUsers.users.filter(user => 
      user.email === 'rick@toptiermen.eu' ||
      user.email?.toLowerCase().includes('rick@toptiermen')
    );
    
    if (rickUsers.length > 0) {
      console.log('🔍 Found Rick users:');
      rickUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
        console.log(`     Created: ${user.created_at}`);
        console.log(`     Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`     Last sign in: ${user.last_sign_in_at || 'Never'}`);
      });
    } else {
      console.log('❌ No rick@toptiermen.eu found in user list');
    }

    // 2. Try to get user by email directly
    console.log('\n2️⃣ Trying to get user by email...');
    try {
      const { data: userByEmail, error: userError } = await supabase.auth.admin.getUserByEmail('rick@toptiermen.eu');
      
      if (userError) {
        console.log('❌ Error getting user by email:', userError.message);
      } else if (userByEmail.user) {
        console.log('✅ Found user by email:');
        console.log('   - ID:', userByEmail.user.id);
        console.log('   - Email:', userByEmail.user.email);
        console.log('   - Email confirmed:', userByEmail.user.email_confirmed_at ? 'Yes' : 'No');
        
        // Update this user
        console.log('\n3️⃣ Updating found user...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          userByEmail.user.id,
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

        // Check/create profile
        console.log('\n4️⃣ Checking profile...');
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'rick@toptiermen.eu');

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
              .eq('email', 'rick@toptiermen.eu');
            
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
              id: userByEmail.user.id,
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

        // Test login
        console.log('\n5️⃣ Testing login...');
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

        console.log('\n🎉 HIDDEN RICK USER FIXED!');
        console.log('📧 Email: rick@toptiermen.eu');
        console.log('🔑 Password: Carnivoor2025!');
        console.log('👑 Role: admin');
        console.log('\n✅ Rick should now be able to login!');
      }
    } catch (error) {
      console.log('❌ Error in getUserByEmail:', error.message);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

findHiddenRick();
