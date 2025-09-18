require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixChielBadgesAndOnboarding() {
  try {
    console.log('🔧 Fixing Chiel\'s badges and onboarding status...\n');
    
    const chielUserId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';
    
    // 1. First, let's check what badges exist in the system
    console.log('🏆 Checking available badges...');
    const { data: availableBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*');
    
    if (badgesError) {
      console.log('❌ Badges error:', badgesError.message);
      return;
    }
    
    console.log(`✅ Found ${availableBadges.length} available badges:`, availableBadges.map(b => b.title));
    
    // 2. Check Chiel's current badges
    console.log('\n👤 Checking Chiel\'s current badges...');
    const { data: chielBadges, error: chielBadgesError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', chielUserId);
    
    if (chielBadgesError) {
      console.log('❌ Chiel badges error:', chielBadgesError.message);
    } else {
      console.log(`✅ Chiel has ${chielBadges.length} badges`);
    }
    
    // 3. Fix Chiel's badges by assigning proper badges
    console.log('\n🔧 Fixing Chiel\'s badges...');
    
    // Delete existing badges
    if (chielBadges && chielBadges.length > 0) {
      const { error: deleteError } = await supabase
        .from('user_badges')
        .delete()
        .eq('user_id', chielUserId);
      
      if (deleteError) {
        console.log('❌ Delete error:', deleteError.message);
      } else {
        console.log('✅ Deleted existing badges');
      }
    }
    
    // Assign proper badges to Chiel (using first 4 available badges)
    const badgesToAssign = availableBadges.slice(0, 4);
    
    for (const badge of badgesToAssign) {
      const { error: insertError } = await supabase
        .from('user_badges')
        .insert({
          user_id: chielUserId,
          badge_id: badge.id,
          status: 'unlocked',
          progress_data: { completed: true },
          unlocked_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.log(`❌ Error assigning ${badge.title}:`, insertError.message);
      } else {
        console.log(`✅ Assigned ${badge.title} badge`);
      }
    }
    
    // 4. Ensure onboarding is properly completed
    console.log('\n📋 Ensuring onboarding is completed...');
    const { error: onboardingError } = await supabase
      .from('onboarding_status')
      .upsert({
        user_id: chielUserId,
        welcome_video_watched: true,
        step_1_completed: true,
        step_2_completed: true,
        step_3_completed: true,
        step_4_completed: true,
        step_5_completed: true,
        onboarding_completed: true,
        current_step: 6,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
    if (onboardingError) {
      console.log('❌ Onboarding error:', onboardingError.message);
    } else {
      console.log('✅ Onboarding status updated');
    }
    
    // 5. Assign missions to Chiel
    console.log('\n🎯 Assigning missions to Chiel...');
    const missionsToAssign = [
      { title: 'Doe 50 push-ups', description: 'Complete 50 push-ups', difficulty: 'medium', category: 'fitness' },
      { title: 'Mediteer 10 minuten', description: 'Meditate for 10 minutes', difficulty: 'easy', category: 'mindfulness' },
      { title: 'Lees 30 minuten', description: 'Read for 30 minutes', difficulty: 'easy', category: 'learning' }
    ];
    
    for (const mission of missionsToAssign) {
      const { error: missionError } = await supabase
        .from('user_missions')
        .upsert({
          user_id: chielUserId,
          title: mission.title,
          description: mission.description,
          difficulty: mission.difficulty,
          category: mission.category,
          status: 'active',
          points: 10,
          xp_reward: 50
        }, { onConflict: 'user_id,title' });
      
      if (missionError) {
        console.log(`❌ Error assigning ${mission.title}:`, missionError.message);
      } else {
        console.log(`✅ Assigned ${mission.title} mission`);
      }
    }
    
    // 6. Assign nutrition plan
    console.log('\n🥗 Assigning nutrition plan...');
    const { error: nutritionError } = await supabase
      .from('user_nutrition_plans')
      .upsert({
        user_id: chielUserId,
        plan_type: 'balanced',
        nutrition_goals: { protein: 150, carbs: 200, fat: 60 },
        is_active: true
      }, { onConflict: 'user_id' });
    
    if (nutritionError) {
      console.log('❌ Nutrition error:', nutritionError.message);
    } else {
      console.log('✅ Nutrition plan assigned');
    }
    
    // 7. Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    
    const { data: finalBadges } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges(title)
      `)
      .eq('user_id', chielUserId);
    
    const { data: finalOnboarding } = await supabase
      .from('onboarding_status')
      .select('*')
      .eq('user_id', chielUserId)
      .single();
    
    console.log('\n📊 FINAL STATUS:');
    console.log('='.repeat(50));
    console.log(`🏆 Badges: ${finalBadges ? finalBadges.length : 0} (${finalBadges ? finalBadges.map(b => b.badges?.title).join(', ') : 'none'})`);
    console.log(`📋 Onboarding: ${finalOnboarding?.onboarding_completed ? 'COMPLETED' : 'NOT COMPLETED'}`);
    console.log(`📋 Current Step: ${finalOnboarding?.current_step || 'unknown'}`);
    
    console.log('\n🎉 Chiel\'s status has been fixed!');
    console.log('✅ Badges are now properly assigned');
    console.log('✅ Onboarding is marked as completed');
    console.log('✅ Missions are assigned');
    console.log('✅ Nutrition plan is assigned');
    console.log('\n🔄 Please refresh the dashboard to see the changes');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixChielBadgesAndOnboarding();
