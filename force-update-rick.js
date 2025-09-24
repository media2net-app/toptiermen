require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function forceUpdateRick() {
  console.log('🔧 FORCE UPDATING RICK@TOPTIERMEN.EU...\n');

  try {
    // 1. Try to get user by email using a different approach
    console.log('1️⃣ Attempting to get user by email...');
    
    // Try to sign in first to see if the user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'rick@toptiermen.eu',
      password: 'Carnivoor2025!'
    });

    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
      console.log('   - Status:', signInError.status);
      
      // If user doesn't exist, try to create it
      if (signInError.status === 400) {
        console.log('\n2️⃣ User might not exist, trying to create...');
        
        // Try to create the user
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email: 'rick@toptiermen.eu',
          password: 'Carnivoor2025!',
          email_confirm: true,
          user_metadata: {
            name: 'Rick',
            role: 'admin'
          }
        });

        if (createError) {
          console.log('❌ Create failed:', createError.message);
        } else {
          console.log('✅ User created successfully');
          console.log('   - ID:', createData.user.id);
          console.log('   - Email:', createData.user.email);
        }
      }
    } else {
      console.log('✅ Sign in successful!');
      console.log('   - User ID:', signInData.user.id);
      console.log('   - Email:', signInData.user.email);
      
      // User exists, let's update the password
      console.log('\n2️⃣ User exists, updating password...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        signInData.user.id,
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
    }

    // 3. Check/create profile
    console.log('\n3️⃣ Checking profile...');
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
      console.log('   - Name:', existingProfile[0].name);
      
      // Update role to admin if needed
      if (existingProfile[0].role !== 'admin') {
        console.log('🔄 Updating role to admin...');
        const { error: updateRoleError } = await supabase
          .from('profiles')
          .update({ 
            role: 'admin',
            name: 'Rick',
            updated_at: new Date().toISOString()
          })
          .eq('email', 'rick@toptiermen.eu');
        
        if (updateRoleError) {
          console.log('❌ Error updating role:', updateRoleError.message);
        } else {
          console.log('✅ Role updated to admin');
        }
      }
    } else {
      console.log('❌ Profile does not exist, creating...');
      
      // Get the user ID from sign in data or create a new one
      let userId;
      if (signInData && signInData.user) {
        userId = signInData.user.id;
      } else {
        // Try to get user from auth list
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const rickUser = authUsers.users.find(user => user.email === 'rick@toptiermen.eu');
        if (rickUser) {
          userId = rickUser.id;
        } else {
          console.log('❌ Cannot find user ID for profile creation');
          return;
        }
      }
      
      const { data: profileData, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
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

    // 4. Final test
    console.log('\n4️⃣ Final login test...');
    const { data: finalLoginData, error: finalLoginError } = await supabase.auth.signInWithPassword({
      email: 'rick@toptiermen.eu',
      password: 'Carnivoor2025!'
    });

    if (finalLoginError) {
      console.log('❌ Final login test failed:', finalLoginError.message);
    } else {
      console.log('✅ Final login test successful!');
      console.log('   - User ID:', finalLoginData.user.id);
      console.log('   - Email:', finalLoginData.user.email);
    }

    console.log('\n🎉 RICK@TOPTIERMEN.EU SHOULD NOW WORK!');
    console.log('📧 Email: rick@toptiermen.eu');
    console.log('🔑 Password: Carnivoor2025!');
    console.log('👑 Role: admin');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

forceUpdateRick();
