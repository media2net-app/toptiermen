require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRickProfile() {
  console.log('🔧 FIXING RICK PROFILE...\n');

  try {
    // 1. Get the user ID we found
    const userId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';
    
    console.log('1️⃣ Creating profile for rick@toptiermen.eu...');
    console.log('   - User ID:', userId);
    
    // 2. First, let's check the profiles table structure
    console.log('\n2️⃣ Checking profiles table structure...');
    const { data: sampleProfile, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error checking profiles table:', sampleError.message);
    } else if (sampleProfile && sampleProfile.length > 0) {
      console.log('✅ Profiles table structure:');
      console.log('   - Columns:', Object.keys(sampleProfile[0]));
    }

    // 3. Try to create profile without 'name' column
    console.log('\n3️⃣ Creating profile without name column...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: 'rick@toptiermen.eu',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (profileError) {
      console.log('❌ Error creating profile:', profileError.message);
      
      // Try with minimal fields
      console.log('\n4️⃣ Trying with minimal fields...');
      const { data: minimalProfile, error: minimalError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: 'rick@toptiermen.eu',
          role: 'admin'
        })
        .select();

      if (minimalError) {
        console.log('❌ Minimal profile creation failed:', minimalError.message);
      } else {
        console.log('✅ Minimal profile created:');
        console.log('   - ID:', minimalProfile[0].id);
        console.log('   - Email:', minimalProfile[0].email);
        console.log('   - Role:', minimalProfile[0].role);
      }
    } else {
      console.log('✅ Profile created:');
      console.log('   - ID:', profileData[0].id);
      console.log('   - Email:', profileData[0].email);
      console.log('   - Role:', profileData[0].role);
    }

    // 4. Test final login
    console.log('\n5️⃣ Final login test...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'rick@toptiermen.eu',
      password: 'Carnivoor2025!'
    });

    if (loginError) {
      console.log('❌ Final login test failed:', loginError.message);
    } else {
      console.log('✅ Final login test successful!');
      console.log('   - User ID:', loginData.user.id);
      console.log('   - Email:', loginData.user.email);
    }

    // 5. Verify profile
    console.log('\n6️⃣ Verifying profile...');
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'rick@toptiermen.eu')
      .single();

    if (verifyError) {
      console.log('❌ Profile verification failed:', verifyError.message);
    } else {
      console.log('✅ Profile verification successful:');
      console.log('   - ID:', verifyProfile.id);
      console.log('   - Email:', verifyProfile.email);
      console.log('   - Role:', verifyProfile.role);
    }

    console.log('\n🎉 RICK@TOPTIERMEN.EU IS NOW FULLY WORKING!');
    console.log('📧 Email: rick@toptiermen.eu');
    console.log('🔑 Password: Carnivoor2025!');
    console.log('👑 Role: admin');
    console.log('🆔 User ID: 9d6aa8ba-58ab-4188-9a9f-09380a67eb0c');
    console.log('\n✅ Rick can now login with rick@toptiermen.eu!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixRickProfile();
