require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key
);

async function checkBadgesDirectly() {
  console.log('🔍 Direct database check for Chiel\'s badges...');
  
  try {
    // Find Chiel
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .ilike('full_name', '%Chiel%')
      .single();

    if (userError) {
      console.error('❌ Error finding user:', userError);
      return;
    }

    console.log('✅ Found user:', user);

    // Direct check with service role key
    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select(`
        id,
        unlocked_at,
        status,
        badges (
          id,
          title,
          icon_name,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', user.id);

    if (badgesError) {
      console.error('❌ Error fetching badges:', badgesError);
      return;
    }

    console.log('📊 Direct Database Check Results:');
    console.log('=====================================');
    console.log(`Total badges found: ${badges.length}`);
    
    if (badges.length > 0) {
      console.log('\n🏆 Badges:');
      badges.forEach((badge, index) => {
        console.log(`${index + 1}. ${badge.badges.title} (${badge.badges.rarity_level})`);
        console.log(`   Icon: ${badge.badges.icon_name}`);
        console.log(`   XP: ${badge.badges.xp_reward}`);
        console.log(`   Unlocked: ${badge.unlocked_at}`);
        console.log('');
      });
    } else {
      console.log('❌ No badges found in database');
    }

    // Check if Academy Master badge exists
    const academyMaster = badges.find(badge => 
      badge.badges.title.toLowerCase().includes('academy master')
    );
    
    if (academyMaster) {
      console.log('✅ Academy Master Badge found!');
    } else {
      console.log('❌ Academy Master Badge NOT found');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkBadgesDirectly();
