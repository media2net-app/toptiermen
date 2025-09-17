require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPremiumOnboarding() {
  try {
    console.log('🔄 Resetting onboarding for premium.test@toptiermen.eu...');
    
    // Get user ID
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    const user = authUsers.users.find(u => u.email === 'premium.test@toptiermen.eu');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 Found user:', user.email, '(ID:', user.id, ')');
    
    // Delete existing onboarding records
    const { error: deleteError } = await supabase
      .from('user_onboarding_status')
      .delete()
      .eq('user_id', user.id);
    
    if (deleteError) {
      console.error('❌ Error deleting onboarding records:', deleteError);
      return;
    }
    
    console.log('✅ Deleted existing onboarding records');
    
    // Create fresh onboarding record
    const { data: newRecord, error: createError } = await supabase
      .from('user_onboarding_status')
      .insert({
        user_id: user.id,
        welcome_video_shown: false,
        goal_set: false,
        missions_selected: false,
        training_schema_selected: false,
        nutrition_plan_selected: false,
        challenge_started: false,
        onboarding_completed: false
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating onboarding record:', createError);
      return;
    }
    
    console.log('✅ Created fresh onboarding record:');
    console.log('  - ID:', newRecord.id);
    console.log('  - User ID:', newRecord.user_id);
    console.log('  - Welcome Video Shown:', newRecord.welcome_video_shown);
    console.log('  - Goal Set:', newRecord.goal_set);
    console.log('  - Missions Selected:', newRecord.missions_selected);
    console.log('  - Training Schema Selected:', newRecord.training_schema_selected);
    console.log('  - Nutrition Plan Selected:', newRecord.nutrition_plan_selected);
    console.log('  - Challenge Started:', newRecord.challenge_started);
    console.log('  - Onboarding Completed:', newRecord.onboarding_completed);
    
    console.log('\n🎯 Premium user onboarding reset complete!');
    console.log('📧 Email: premium.test@toptiermen.eu');
    console.log('🔑 Password: TestPassword123!');
    console.log('🚀 User should now start with step 0 (welcome video)');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

resetPremiumOnboarding();
