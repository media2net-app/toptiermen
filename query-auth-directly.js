require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function queryAuthDirectly() {
  console.log('🔧 QUERYING AUTH DATABASE DIRECTLY...\n');

  try {
    // 1. Try to query the auth.users table directly
    console.log('1️⃣ Querying auth.users table directly...');
    const { data: authData, error: authError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', 'rick@toptiermen.eu');

    if (authError) {
      console.log('❌ Error querying auth.users:', authError.message);
    } else if (authData && authData.length > 0) {
      console.log('✅ Found rick@toptiermen.eu in auth.users:');
      console.log('   - ID:', authData[0].id);
      console.log('   - Email:', authData[0].email);
      console.log('   - Email confirmed:', authData[0].email_confirmed_at ? 'Yes' : 'No');
      console.log('   - Created:', authData[0].created_at);
    } else {
      console.log('❌ rick@toptiermen.eu not found in auth.users');
    }

    // 2. Try to query profiles table
    console.log('\n2️⃣ Querying profiles table...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'rick@toptiermen.eu');

    if (profileError) {
      console.log('❌ Error querying profiles:', profileError.message);
    } else if (profileData && profileData.length > 0) {
      console.log('✅ Found rick@toptiermen.eu in profiles:');
      console.log('   - ID:', profileData[0].id);
      console.log('   - Email:', profileData[0].email);
      console.log('   - Role:', profileData[0].role);
      console.log('   - Name:', profileData[0].name);
    } else {
      console.log('❌ rick@toptiermen.eu not found in profiles');
    }

    // 3. Try to get all users with a different approach
    console.log('\n3️⃣ Getting all users with pagination...');
    let allUsers = [];
    let page = 0;
    const perPage = 1000;
    
    while (true) {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
        page: page,
        perPage: perPage
      });
      
      if (usersError) {
        console.log('❌ Error getting users:', usersError.message);
        break;
      }
      
      if (!users.users || users.users.length === 0) {
        break;
      }
      
      allUsers = allUsers.concat(users.users);
      page++;
      
      if (users.users.length < perPage) {
        break;
      }
    }
    
    console.log(`📊 Total users found: ${allUsers.length}`);
    
    // Look for rick@toptiermen.eu
    const rickUser = allUsers.find(user => user.email === 'rick@toptiermen.eu');
    
    if (rickUser) {
      console.log('✅ Found rick@toptiermen.eu in paginated results:');
      console.log('   - ID:', rickUser.id);
      console.log('   - Email:', rickUser.email);
      console.log('   - Email confirmed:', rickUser.email_confirmed_at ? 'Yes' : 'No');
      console.log('   - Created:', rickUser.created_at);
      
      // Try to update this user
      console.log('\n4️⃣ Updating found user...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        rickUser.id,
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
      
      // Create profile if needed
      console.log('\n5️⃣ Creating profile if needed...');
      const { data: existingProfile, error: profileError2 } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'rick@toptiermen.eu');

      if (profileError2) {
        console.log('❌ Error checking profile:', profileError2.message);
      } else if (!existingProfile || existingProfile.length === 0) {
        console.log('🔄 Creating profile...');
        const { data: newProfile, error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: rickUser.id,
            email: 'rick@toptiermen.eu',
            role: 'admin',
            name: 'Rick',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();

        if (createProfileError) {
          console.log('❌ Error creating profile:', createProfileError.message);
        } else {
          console.log('✅ Profile created:');
          console.log('   - ID:', newProfile[0].id);
          console.log('   - Role:', newProfile[0].role);
        }
      } else {
        console.log('✅ Profile already exists:');
        console.log('   - Role:', existingProfile[0].role);
      }
      
      // Test login
      console.log('\n6️⃣ Testing login...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'rick@toptiermen.eu',
        password: 'Carnivoor2025!'
      });

      if (loginError) {
        console.log('❌ Login test failed:', loginError.message);
      } else {
        console.log('✅ Login test successful!');
        console.log('   - User ID:', loginData.user.id);
        console.log('   - Email:', loginData.user.email);
      }
      
    } else {
      console.log('❌ rick@toptiermen.eu not found in paginated results');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

queryAuthDirectly();
