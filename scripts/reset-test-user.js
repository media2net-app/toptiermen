const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetTestUser() {
  console.log('🔄 Resetting test user to original state...\n');

  try {
    const testEmail = 'test.user.1756630044380@toptiermen.test';
    
    console.log(`📧 Resetting user: ${testEmail}\n`);

    // 1. Find the test user
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    const testUser = users.users.find(user => user.email === testEmail);
    
    if (!testUser) {
      console.error('❌ Test user not found');
      return;
    }

    console.log('✅ Test user found:', testUser.id);

    // 2. Reset onboarding status to original state
    const { error: updateError } = await supabase
      .from('onboarding_status')
      .update({
        welcome_video_watched: false,
        step_1_completed: false,
        step_2_completed: false,
        step_3_completed: false,
        step_4_completed: false,
        step_5_completed: false,
        onboarding_completed: false,
        current_step: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', testUser.id);

    if (updateError) {
      console.error('❌ Error resetting onboarding status:', updateError.message);
      return;
    }

    console.log('✅ Test user reset successfully!');
    console.log('');
    console.log('📋 Reset to:');
    console.log('   - welcome_video_watched: false');
    console.log('   - current_step: 0');
    console.log('   - onboarding_completed: false');
    console.log('   - All steps: false');
    console.log('');
    console.log('🎬 Now the test user should see:');
    console.log('   1. Test video modal on first login');
    console.log('   2. After watching video: normal onboarding');
    console.log('   3. Complete onboarding process');

  } catch (error) {
    console.error('❌ Error resetting test user:', error);
  }
}

resetTestUser();
