const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUserAuth() {
  try {
    console.log('🔍 Testing user authentication for Rob...');
    
    // Check if Rob exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Auth users error:', authError.message);
      return;
    }
    
    const robAuth = authUsers.users.find(u => u.email === 'rob@media2net.nl');
    
    if (robAuth) {
      console.log('✅ Rob found in auth.users:', {
        id: robAuth.id,
        email: robAuth.email,
        created_at: robAuth.created_at
      });
    } else {
      console.log('❌ Rob not found in auth.users');
      return;
    }
    
    // Check if Rob exists in profiles table
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', robAuth.id);
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
      return;
    }
    
    if (usersData && usersData.length > 0) {
      console.log('✅ Rob found in users table:', {
        id: usersData[0].id,
        email: usersData[0].email,
        display_name: usersData[0].display_name,
        role: usersData[0].role
      });
    } else {
      console.log('❌ Rob not found in users table');
      return;
    }
    
    // Check onboarding status
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', robAuth.id);
    
    if (onboardingError) {
      console.log('❌ Onboarding status error:', onboardingError.message);
      return;
    }
    
    if (onboardingData && onboardingData.length > 0) {
      console.log('✅ Rob\'s onboarding status:', {
        user_id: onboardingData[0].user_id,
        welcome_video_watched: onboardingData[0].welcome_video_watched,
        current_step: onboardingData[0].current_step,
        onboarding_completed: onboardingData[0].onboarding_completed
      });
    } else {
      console.log('❌ No onboarding status found for Rob');
    }
    
    // Test API call simulation
    console.log('\n🧪 Testing API call simulation...');
    
    const testRequestBody = {
      userId: robAuth.id,
      step: 0,
      action: 'watch_welcome_video'
    };
    
    console.log('📤 Test request body:', testRequestBody);
    
    // Simulate the database update
    const { data: updateData, error: updateError } = await supabase
      .from('onboarding_status')
      .update({
        welcome_video_watched: true,
        current_step: 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', robAuth.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Update test failed:', updateError.message);
    } else {
      console.log('✅ Update test successful:', {
        welcome_video_watched: updateData.welcome_video_watched,
        current_step: updateData.current_step
      });
      
      // Reset for testing
      await supabase
        .from('onboarding_status')
        .update({
          welcome_video_watched: false,
          current_step: 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', robAuth.id);
      
      console.log('🔄 Reset Rob\'s status for testing');
    }
    
  } catch (error) {
    console.error('❌ Error testing user auth:', error);
  }
}

testUserAuth(); 