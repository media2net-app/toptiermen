const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addBadgesViaAPI() {
  try {
    console.log('🔍 Adding badges to Chiel via API...');

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

    // Call the admin API to add badges
    const response = await fetch('http://localhost:3000/api/admin/add-test-badges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userData.id
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ API Error:', result.error);
      return;
    }

    console.log('✅ API Response:', result);

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

addBadgesViaAPI();
