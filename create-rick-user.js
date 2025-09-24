require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createRickUser() {
  console.log('🔧 CREATING RICK USER...\n');

  try {
    // 1. Create user in auth.users
    console.log('1️⃣ Creating user in auth.users...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'rick@toptiermen.eu',
      password: 'Carnivoor2025!',
      email_confirm: true,
      user_metadata: {
        name: 'Rick',
        role: 'admin'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return;
    }

    console.log('✅ Auth user created:');
    console.log('   - ID:', authData.user.id);
    console.log('   - Email:', authData.user.email);

    // 2. Create profile
    console.log('\n2️⃣ Creating profile...');
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

    // 3. Test login
    console.log('\n3️⃣ Testing login...');
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

    // 4. Verify profile access
    console.log('\n4️⃣ Testing profile access...');
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
    }

    console.log('\n🎉 RICK USER CREATION COMPLETE!');
    console.log('📧 Email: rick@toptiermen.eu');
    console.log('🔑 Password: Carnivoor2025!');
    console.log('👑 Role: admin');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createRickUser();
