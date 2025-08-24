const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAllBadges() {
  try {
    console.log('🔍 Checking all badges in database...');

    // Check all badges
    const { data: badgesData, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('created_at');

    if (badgesError) {
      console.error('❌ Error fetching badges:', badgesError);
      return;
    }

    console.log('\n📊 All Badges in Database:');
    console.log('=============================');
    console.log(`Total badges: ${badgesData?.length || 0}`);

    if (badgesData && badgesData.length > 0) {
      console.log('\n🏆 Available Badges:');
      badgesData.forEach((badge, index) => {
        console.log(`\n${index + 1}. ${badge.title}`);
        console.log(`   Icon: ${badge.icon_name}`);
        console.log(`   Rarity: ${badge.rarity_level}`);
        console.log(`   XP Reward: ${badge.xp_reward}`);
        console.log(`   Description: ${badge.description}`);
        console.log(`   Created: ${badge.created_at}`);
      });

      // Count by rarity
      const rarityCount = {};
      badgesData.forEach(badge => {
        const rarity = badge.rarity_level;
        rarityCount[rarity] = (rarityCount[rarity] || 0) + 1;
      });

      console.log('\n📈 Rarity Breakdown:');
      Object.entries(rarityCount).forEach(([rarity, count]) => {
        console.log(`   ${rarity}: ${count}`);
      });
    } else {
      console.log('❌ No badges found in database');
    }

    // Check user badges table
    console.log('\n🔍 Checking user_badges table...');
    const { data: userBadgesData, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('*');

    if (userBadgesError) {
      console.error('❌ Error fetching user badges:', userBadgesError);
      return;
    }

    console.log(`Total user badge entries: ${userBadgesData?.length || 0}`);

    if (userBadgesData && userBadgesData.length > 0) {
      console.log('\n👥 User Badge Assignments:');
      userBadgesData.forEach((userBadge, index) => {
        console.log(`\n${index + 1}. User: ${userBadge.user_id}`);
        console.log(`   Badge ID: ${userBadge.badge_id}`);
        console.log(`   Status: ${userBadge.status}`);
        console.log(`   Unlocked: ${userBadge.unlocked_at}`);
      });
    } else {
      console.log('❌ No user badge assignments found');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAllBadges();
