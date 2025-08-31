const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUserRob() {
  console.log('🔧 Creating test user for rob@media2net.nl...\n');

  try {
    // Create a new user with rob's email
    const testEmail = 'rob@media2net.nl';
    const testPassword = 'RobTest2024!';
    
    console.log('📧 Creating user with credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('');

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: 'Rob Test User'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }

    const userId = authData.user.id;
    console.log('✅ Auth user created successfully!');
    console.log(`   User ID: ${userId}`);

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: testEmail,
        full_name: 'Rob Test User',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message);
    } else {
      console.log('✅ Profile created successfully!');
    }

    // Create onboarding status (NOT completed - so user sees onboarding)
    const { error: onboardingError } = await supabase
      .from('onboarding_status')
      .insert({
        user_id: userId,
        welcome_video_watched: false,
        step_1_completed: false,
        step_2_completed: false,
        step_3_completed: false,
        step_4_completed: false,
        step_5_completed: false,
        onboarding_completed: false,
        current_step: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (onboardingError) {
      console.error('❌ Error creating onboarding status:', onboardingError.message);
    } else {
      console.log('✅ Onboarding status created (NOT completed)');
    }

    // Try to create user preferences
    try {
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          preference_key: 'theme',
          preference_value: 'dark',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (preferencesError) {
        console.log('ℹ️ User preferences table might not exist or have different structure');
      } else {
        console.log('✅ User preferences created successfully!');
      }
    } catch (error) {
      console.log('ℹ️ Skipping user preferences creation');
    }

    console.log('\n🎉 Test user for rob@media2net.nl created successfully!');
    console.log('=====================================');
    console.log('📧 Login Credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('');
    console.log('🔗 Login URL:');
    console.log('   https://platform.toptiermen.eu/login');
    console.log('');
    console.log('📋 What to expect:');
    console.log('   - User will see test video modal first');
    console.log('   - After watching test video, normal onboarding starts');
    console.log('   - Full platform access after onboarding completion');
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('   - This is a test user for rob@media2net.nl');
    console.log('   - Credentials are ready for email sending');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createTestUserRob();
