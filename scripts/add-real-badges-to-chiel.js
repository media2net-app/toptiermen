const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addRealBadgesToChiel() {
  try {
    console.log('🔍 Adding real badges to user "Chiel"...');

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

    console.log('✅ Found user:', userData);

    // Get some real badges to assign
    const { data: badgesData, error: badgesError } = await supabase
      .from('badges')
      .select('id, title, icon_name, rarity_level')
      .limit(5);

    if (badgesError) {
      console.error('❌ Error fetching badges:', badgesError);
      return;
    }

    if (!badgesData || badgesData.length === 0) {
      console.error('❌ No badges found in database');
      return;
    }

    console.log(`✅ Found ${badgesData.length} badges to assign`);

    // Add badges to Chiel one by one
    console.log('\n🏆 Adding badges to Chiel:');
    
    for (let i = 0; i < badgesData.length; i++) {
      const badge = badgesData[i];
      console.log(`${i + 1}. ${badge.title} (${badge.rarity_level}) - ID: ${badge.id}`);

      const { data: insertedData, error: insertError } = await supabase
        .from('user_badges')
        .insert({
          user_id: userData.id,
          badge_id: badge.id,
          status: 'unlocked',
          unlocked_at: new Date().toISOString()
        })
        .select();

      if (insertError) {
        console.error(`❌ Error inserting badge ${badge.title}:`, insertError.message);
      } else {
        console.log(`✅ Successfully added ${badge.title}`);
      }
    }

    // Verify the badges were added
    console.log('\n📊 Verifying badges...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_badges')
      .select(`
        id,
        unlocked_at,
        status,
        badges (
          title,
          icon_name,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', userData.id);

    if (verifyError) {
      console.error('❌ Error verifying badges:', verifyError);
      return;
    }

    console.log('\n📊 Verification - Chiel now has:');
    console.log(`Total badges: ${verifyData?.length || 0}`);

    if (verifyData && verifyData.length > 0) {
      verifyData.forEach((userBadge, index) => {
        console.log(`\n${index + 1}. ${userBadge.badges.title}`);
        console.log(`   Icon: ${userBadge.badges.icon_name}`);
        console.log(`   Rarity: ${userBadge.badges.rarity_level}`);
        console.log(`   XP: ${userBadge.badges.xp_reward}`);
        console.log(`   Unlocked: ${userBadge.unlocked_at}`);
      });
    } else {
      console.log('❌ No badges found for Chiel');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addRealBadgesToChiel();
