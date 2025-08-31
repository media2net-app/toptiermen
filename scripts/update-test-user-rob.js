const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateTestUserRob() {
  console.log('🔧 Updating test user for rob@media2net.nl...\n');

  try {
    const testEmail = 'rob@media2net.nl';
    const newPassword = 'RobTest2024!';
    
    console.log('📧 Updating user with new credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   New Password: ${newPassword}`);
    console.log('');

    // First, find the existing user
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    const existingUser = users.users.find(user => user.email === testEmail);
    
    if (!existingUser) {
      console.error('❌ User not found:', testEmail);
      return;
    }

    console.log('✅ Found existing user:', existingUser.id);

    // Update the user's password
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password: newPassword,
        email_confirm: true
      }
    );

    if (updateError) {
      console.error('❌ Error updating user password:', updateError.message);
      return;
    }

    console.log('✅ User password updated successfully!');

    // Update profile if needed
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: existingUser.id,
        email: testEmail,
        full_name: 'Rob Test User',
        role: 'user',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('❌ Error updating profile:', profileError.message);
    } else {
      console.log('✅ Profile updated successfully!');
    }

    // Ensure onboarding status exists and is not completed
    const { error: onboardingError } = await supabase
      .from('onboarding_status')
      .upsert({
        user_id: existingUser.id,
        welcome_video_watched: false,
        step_1_completed: false,
        step_2_completed: false,
        step_3_completed: false,
        step_4_completed: false,
        step_5_completed: false,
        onboarding_completed: false,
        current_step: 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (onboardingError) {
      console.error('❌ Error updating onboarding status:', onboardingError.message);
    } else {
      console.log('✅ Onboarding status updated (NOT completed)');
    }

    console.log('\n🎉 Test user for rob@media2net.nl updated successfully!');
    console.log('=====================================');
    console.log('📧 Login Credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${newPassword}`);
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
    console.error('❌ Error updating test user:', error);
  }
}

updateTestUserRob();
