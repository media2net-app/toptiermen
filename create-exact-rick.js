require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createExactRick() {
  console.log('🔧 CREATING EXACT RICK@TOPTIERMEN.EU...\n');

  try {
    // 1. First, let's try to delete any existing rick@toptiermen.eu if it exists
    console.log('1️⃣ Checking for existing rick@toptiermen.eu...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    const existingRick = authUsers.users.find(user => user.email === 'rick@toptiermen.eu');
    
    if (existingRick) {
      console.log('⚠️ rick@toptiermen.eu already exists, deleting...');
      const { error: deleteError } = await supabase.auth.admin.deleteUser(existingRick.id);
      
      if (deleteError) {
        console.log('❌ Error deleting existing user:', deleteError.message);
        return;
      }
      
      console.log('✅ Existing user deleted');
    }

    // 2. Delete any existing profile
    console.log('\n2️⃣ Cleaning up profiles...');
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('email', 'rick@toptiermen.eu');

    if (deleteProfileError) {
      console.log('⚠️ Profile cleanup error (might not exist):', deleteProfileError.message);
    } else {
      console.log('✅ Profile cleanup completed');
    }

    // 3. Create fresh user
    console.log('\n3️⃣ Creating fresh rick@toptiermen.eu...');
    const { data: authData, error: authError2 } = await supabase.auth.admin.createUser({
      email: 'rick@toptiermen.eu',
      password: 'Carnivoor2025!',
      email_confirm: true,
      user_metadata: {
        name: 'Rick',
        role: 'admin'
      }
    });

    if (authError2) {
      console.error('❌ Error creating auth user:', authError2);
      return;
    }

    console.log('✅ Fresh auth user created:');
    console.log('   - ID:', authData.user.id);
    console.log('   - Email:', authData.user.email);

    // 4. Create profile
    console.log('\n4️⃣ Creating profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: 'rick@toptiermen.eu',
        role: 'admin',
        name: 'Rick',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return;
    }

    console.log('✅ Profile created:');
    console.log('   - ID:', profileData[0].id);
    console.log('   - Email:', profileData[0].email);
    console.log('   - Role:', profileData[0].role);

    // 5. Test login
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

    // 6. Final verification
    console.log('\n6️⃣ Final verification...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'rick@toptiermen.eu')
      .single();

    if (finalError) {
      console.log('❌ Final verification failed:', finalError.message);
    } else {
      console.log('✅ Final verification successful:');
      console.log('   - Role:', finalCheck.role);
      console.log('   - Name:', finalCheck.name);
      console.log('   - ID:', finalCheck.id);
    }

    console.log('\n🎉 EXACT RICK@TOPTIERMEN.EU CREATED!');
    console.log('📧 Email: rick@toptiermen.eu');
    console.log('🔑 Password: Carnivoor2025!');
    console.log('👑 Role: admin');
    console.log('\n✅ Rick should now be able to login with rick@toptiermen.eu!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createExactRick();
