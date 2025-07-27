const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugOnboarding() {
  try {
    console.log('🔍 Debugging onboarding system...');
    
    // Check if onboarding_status table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('onboarding_status')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Table check error:', tableError.message);
      return;
    }
    
    console.log('✅ Onboarding_status table exists');
    
    // Get all onboarding statuses
    const { data: allStatuses, error: statusError } = await supabase
      .from('onboarding_status')
      .select('*');
    
    if (statusError) {
      console.log('❌ Status fetch error:', statusError.message);
      return;
    }
    
    console.log(`\n📊 Found ${allStatuses.length} onboarding statuses:`);
    
    allStatuses.forEach((status, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   User ID: ${status.user_id}`);
      console.log(`   Welcome Video: ${status.welcome_video_watched ? '✅' : '❌'}`);
      console.log(`   Step 1: ${status.step_1_completed ? '✅' : '❌'}`);
      console.log(`   Step 2: ${status.step_2_completed ? '✅' : '❌'}`);
      console.log(`   Step 3: ${status.step_3_completed ? '✅' : '❌'}`);
      console.log(`   Step 4: ${status.step_4_completed ? '✅' : '❌'}`);
      console.log(`   Step 5: ${status.step_5_completed ? '✅' : '❌'}`);
      console.log(`   Current Step: ${status.current_step}`);
      console.log(`   Completed: ${status.onboarding_completed ? '✅' : '❌'}`);
      console.log(`   Updated At: ${status.updated_at}`);
    });
    
    // Test API functionality for Rob
    const robUserId = '14d7c55b-4ccd-453f-b79f-403f306f1efb';
    const robStatus = allStatuses.find(s => s.user_id === robUserId);
    
    if (robStatus) {
      console.log('\n🎯 Rob\'s current status:');
      console.log(`   Welcome Video: ${robStatus.welcome_video_watched ? '✅' : '❌'}`);
      console.log(`   Current Step: ${robStatus.current_step}`);
      console.log(`   Completed: ${robStatus.onboarding_completed ? '✅' : '❌'}`);
      
      // Test updating welcome video status
      console.log('\n🧪 Testing welcome video update...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('onboarding_status')
        .update({
          welcome_video_watched: true,
          current_step: 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', robUserId)
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
          .eq('user_id', robUserId);
        
        console.log('🔄 Reset Rob\'s status for testing');
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging onboarding:', error);
  }
}

debugOnboarding(); 