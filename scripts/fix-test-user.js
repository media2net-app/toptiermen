const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixTestUser() {
  console.log('🔧 Fixing test user profile...\n');

  try {
    const testEmail = 'test@toptiermen.eu';
    const userId = 'd2fae82e-bef3-4658-b770-b235b364532b';

    // Check current profile
    console.log('1️⃣ Checking current profile...');
    const { data: currentProfile, error: getError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (getError) {
      console.log('⚠️ No profile found, creating one...');
      
      // Create profile with correct role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: testEmail,
          full_name: 'Test User',
          role: 'user', // Use valid role: 'user' or 'admin'
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError);
      } else {
        console.log('✅ Profile created with correct role');
      }
    } else {
      console.log('✅ Profile exists, updating role...');
      
      // Update role to valid value
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Profile update failed:', updateError);
      } else {
        console.log('✅ Profile updated with correct role');
      }
    }

    console.log('\n🎯 Test user should now work!');
    console.log('📧 Email: test@toptiermen.eu');
    console.log('🔑 Password: TestPassword123!');
    console.log('💡 Try logging in at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error fixing test user:', error);
  }
}

fixTestUser();
