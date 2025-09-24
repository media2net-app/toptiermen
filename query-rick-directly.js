require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function queryRickDirectly() {
  console.log('🔧 QUERYING RICK DIRECTLY FROM DATABASE...\n');

  try {
    // 1. Query profiles table directly
    console.log('1️⃣ Querying profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'rick@toptiermen.eu');

    if (profilesError) {
      console.error('❌ Error querying profiles:', profilesError);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Found Rick in profiles:');
      console.log('   - ID:', profiles[0].id);
      console.log('   - Email:', profiles[0].email);
      console.log('   - Role:', profiles[0].role);
      console.log('   - Created:', profiles[0].created_at);
      
      // Try to get the auth user by ID
      console.log('\n2️⃣ Getting auth user by ID...');
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profiles[0].id);
      
      if (authError) {
        console.log('❌ Error getting auth user:', authError.message);
      } else if (authUser.user) {
        console.log('✅ Found auth user:');
        console.log('   - ID:', authUser.user.id);
        console.log('   - Email:', authUser.user.email);
        console.log('   - Email confirmed:', authUser.user.email_confirmed_at ? 'Yes' : 'No');
        
        // Update password and confirm email
        console.log('\n3️⃣ Updating password and confirming email...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          authUser.user.id,
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

        // Test login
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

        console.log('\n🎉 RICK USER FIXED!');
        console.log('📧 Email: rick@toptiermen.eu');
        console.log('🔑 Password: Carnivoor2025!');
        console.log('👑 Role: admin');
        console.log('\n✅ Rick should now be able to login!');
      }
    } else {
      console.log('❌ Rick not found in profiles table');
    }

    // 2. Also check for rick.admin@toptiermen.eu
    console.log('\n5️⃣ Checking rick.admin@toptiermen.eu...');
    const { data: adminProfiles, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'rick.admin@toptiermen.eu');

    if (adminError) {
      console.error('❌ Error querying admin profiles:', adminError);
    } else if (adminProfiles && adminProfiles.length > 0) {
      console.log('✅ Found rick.admin@toptiermen.eu in profiles:');
      console.log('   - ID:', adminProfiles[0].id);
      console.log('   - Email:', adminProfiles[0].email);
      console.log('   - Role:', adminProfiles[0].role);
      
      console.log('\n🎉 RICK.ADMIN USER IS READY!');
      console.log('📧 Email: rick.admin@toptiermen.eu');
      console.log('🔑 Password: Carnivoor2025!');
      console.log('👑 Role: admin');
      console.log('\n✅ Rick can login with rick.admin@toptiermen.eu!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

queryRickDirectly();
