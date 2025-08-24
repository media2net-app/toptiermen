const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkChielBadges() {
  try {
    console.log('🔍 Checking badges for user "Chiel"...');

    // First, find Chiel's user ID
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .ilike('full_name', '%Chiel%')
      .single();

    if (userError) {
      console.error('❌ Error finding user Chiel:', userError);
      return;
    }

    if (!userData) {
      console.error('❌ User "Chiel" not found');
      return;
    }

    console.log('✅ Found user:', userData);

    // Get Chiel's badges
    const { data: badgesData, error: badgesError } = await supabase
      .from('user_badges')
      .select(`
        id,
        unlocked_at,
        status,
        badges (
          id,
          title,
          description,
          icon_name,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', userData.id);

    if (badgesError) {
      console.error('❌ Error fetching badges:', badgesError);
      return;
    }

    console.log('\n📊 Badge Summary for Chiel:');
    console.log('=============================');
    console.log(`Total badges: ${badgesData?.length || 0}`);

    if (badgesData && badgesData.length > 0) {
      console.log('\n🏆 Badges:');
      badgesData.forEach((badge, index) => {
        console.log(`\n${index + 1}. ${badge.badges.title}`);
        console.log(`   Icon: ${badge.badges.icon_name}`);
        console.log(`   Rarity: ${badge.badges.rarity_level}`);
        console.log(`   XP Reward: ${badge.badges.xp_reward}`);
        console.log(`   Unlocked: ${badge.unlocked_at}`);
        console.log(`   Status: ${badge.status}`);
        console.log(`   Description: ${badge.badges.description}`);
      });

      // Count by rarity
      const rarityCount = {};
      badgesData.forEach(badge => {
        const rarity = badge.badges.rarity_level;
        rarityCount[rarity] = (rarityCount[rarity] || 0) + 1;
      });

      console.log('\n📈 Rarity Breakdown:');
      Object.entries(rarityCount).forEach(([rarity, count]) => {
        console.log(`   ${rarity}: ${count}`);
      });
    } else {
      console.log('❌ No badges found for Chiel');
    }

    // Also check if Chiel has the Academy Master badge specifically
    const academyBadge = badgesData?.find(badge => 
      badge.badges.title.toLowerCase().includes('academy') || 
      badge.badges.title.toLowerCase().includes('master')
    );

    if (academyBadge) {
      console.log('\n🎓 Academy Master Badge Found:');
      console.log(`   Title: ${academyBadge.badges.title}`);
      console.log(`   Unlocked: ${academyBadge.unlocked_at}`);
      console.log(`   Status: ${academyBadge.status}`);
    } else {
      console.log('\n❌ Academy Master Badge NOT found');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkChielBadges();
