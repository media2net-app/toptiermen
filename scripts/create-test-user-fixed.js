const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUserFixed() {
  console.log('🔧 Creating test user for new user testing (FIXED VERSION)...\n');

  try {
    // Create a new user with a unique email
    const testEmail = `test.user.${Date.now()}@toptiermen.test`;
    const testPassword = 'TestUser123!';
    
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
        name: 'Test User'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }

    const userId = authData.user.id;
    console.log('✅ Auth user created successfully!');
    console.log(`   User ID: ${userId}`);

    // Create profile record with correct role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: testEmail,
        full_name: 'Test User',
        role: 'user', // Changed from 'member' to 'user'
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

    // Try to create user preferences with correct column name
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

    console.log('\n🎉 Test user created successfully!');
    console.log('=====================================');
    console.log('📧 Login Credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('');
    console.log('🔗 Login URL:');
    console.log('   http://localhost:3000/login');
    console.log('');
    console.log('📋 What to expect:');
    console.log('   - User will see onboarding flow');
    console.log('   - Welcome video will be shown');
    console.log('   - All onboarding steps will be available');
    console.log('   - No existing data or progress');
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('   - This is a test user for development only');
    console.log('   - Delete this user after testing');
    console.log('   - Do not use in production');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createTestUserFixed();
