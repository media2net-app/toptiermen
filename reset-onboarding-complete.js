const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testAccounts = [
  {
    email: 'basic.test@toptiermen.eu',
    userId: '67c4edae-c401-4e5d-945e-fdc0c55daf8a',
    tier: 'Basic Tier'
  },
  {
    email: 'premium.test@toptiermen.eu', 
    userId: 'fa7f3a34-63c4-4d04-9ac6-3bd66d67d769',
    tier: 'Premium Tier'
  }
];

async function resetOnboardingForUser(userId, email, tier) {
  console.log(`\n🔄 Resetting onboarding for ${tier} account: ${email}`);
  
  try {
    // 1. Check and reset onboarding_status
    console.log('   📝 Checking onboarding_status...');
    const { data: onboardingData, error: onboardingFetchError } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (onboardingFetchError && onboardingFetchError.code !== 'PGRST116') {
      console.error(`   ❌ Error fetching onboarding_status:`, onboardingFetchError);
    } else if (onboardingData) {
      console.log('   📝 Current onboarding status:', {
        current_step: onboardingData.current_step,
        onboarding_completed: onboardingData.onboarding_completed,
        welcome_video_watched: onboardingData.welcome_video_watched,
        step_1_completed: onboardingData.step_1_completed,
        step_2_completed: onboardingData.step_2_completed,
        step_3_completed: onboardingData.step_3_completed,
        step_4_completed: onboardingData.step_4_completed,
        step_5_completed: onboardingData.step_5_completed
      });
      
      console.log('   📝 Resetting onboarding_status...');
      const { error: onboardingError } = await supabase
        .from('onboarding_status')
        .update({
          current_step: 0,
          onboarding_completed: false,
          welcome_video_watched: false,
          step_1_completed: false,
          step_2_completed: false,
          step_3_completed: false,
          step_4_completed: false,
          step_5_completed: false,
          completed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (onboardingError) {
        console.error(`   ❌ Error resetting onboarding_status:`, onboardingError);
      } else {
        console.log('   ✅ Onboarding_status reset to step 0');
      }
    } else {
      console.log('   ℹ️ No onboarding_status record found - creating fresh one...');
      const { error: createError } = await supabase
        .from('onboarding_status')
        .insert({
          user_id: userId,
          current_step: 0,
          onboarding_completed: false,
          welcome_video_watched: false,
          step_1_completed: false,
          step_2_completed: false,
          step_3_completed: false,
          step_4_completed: false,
          step_5_completed: false,
          started_at: new Date().toISOString(),
          completed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (createError) {
        console.error(`   ❌ Error creating onboarding_status:`, createError);
      } else {
        console.log('   ✅ Fresh onboarding_status record created');
      }
    }

    // 2. Reset training profiles
    console.log('   🏋️ Resetting training profiles...');
    const { data: profilesData, error: profilesFetchError } = await supabase
      .from('training_profiles')
      .select('id, training_goal, equipment_type, training_frequency')
      .eq('user_id', userId);
    
    if (profilesFetchError) {
      console.error(`   ❌ Error fetching training profiles:`, profilesFetchError);
    } else if (profilesData && profilesData.length > 0) {
      console.log(`   📊 Found ${profilesData.length} training profile(s):`, profilesData.map(p => ({
        goal: p.training_goal,
        equipment: p.equipment_type,
        frequency: p.training_frequency
      })));
      
      const { error: profileError } = await supabase
        .from('training_profiles')
        .delete()
        .eq('user_id', userId);
      
      if (profileError) {
        console.error(`   ❌ Error deleting training profiles:`, profileError);
      } else {
        console.log(`   ✅ Deleted ${profilesData.length} training profile(s)`);
      }
    } else {
      console.log('   ℹ️ No training profiles found to delete');
    }

    // 3. Check for other onboarding-related data
    console.log('   🔍 Checking for other onboarding-related data...');
    
    // Try to reset custom nutrition plans if table exists
    try {
      const { data: customPlans, error: customError } = await supabase
        .from('custom_nutrition_plans')
        .select('id, plan_name')
        .eq('user_id', userId);
      
      if (!customError && customPlans && customPlans.length > 0) {
        console.log(`   📊 Found ${customPlans.length} custom nutrition plan(s)`);
        const { error: deleteError } = await supabase
          .from('custom_nutrition_plans')
          .delete()
          .eq('user_id', userId);
        
        if (!deleteError) {
          console.log(`   ✅ Deleted ${customPlans.length} custom nutrition plan(s)`);
        } else {
          console.error(`   ❌ Error deleting custom nutrition plans:`, deleteError);
        }
      }
    } catch (error) {
      console.log('   ℹ️ Custom nutrition plans table not accessible');
    }

    // Try to reset user progress if table exists
    try {
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', userId);
      
      if (!progressError && progressData && progressData.length > 0) {
        console.log(`   📊 Found ${progressData.length} user progress record(s)`);
        const { error: deleteError } = await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', userId);
        
        if (!deleteError) {
          console.log(`   ✅ Deleted ${progressData.length} user progress record(s)`);
        } else {
          console.error(`   ❌ Error deleting user progress:`, deleteError);
        }
      }
    } catch (error) {
      console.log('   ℹ️ User progress table not accessible');
    }

    console.log(`   🎉 Onboarding reset completed for ${email}`);
    
  } catch (error) {
    console.error(`   ❌ Unexpected error for ${email}:`, error);
  }
}

async function main() {
  console.log('🚀 Starting onboarding reset for test accounts...');
  console.log('📋 This will reset:');
  console.log('   • Onboarding status to step 0 (welcome video)');
  console.log('   • Training profiles');
  console.log('   • Other onboarding-related data');
  console.log('');
  
  for (const account of testAccounts) {
    await resetOnboardingForUser(account.userId, account.email, account.tier);
  }
  
  console.log('\n✅ All onboarding resets completed!');
  console.log('\n🔑 Test accounts ready for fresh onboarding:');
  testAccounts.forEach(account => {
    console.log(`   • ${account.email} (${account.tier})`);
  });
  console.log('\n💡 You can now test the onboarding flow from the beginning!');
  console.log('   🎬 Start with the welcome video (step 0)');
  console.log('   🎯 Then proceed through each step');
  console.log('   📱 Test both basic and premium tier flows');
}

main().catch(console.error);
