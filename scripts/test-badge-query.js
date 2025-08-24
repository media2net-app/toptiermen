require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBadgeQuery() {
  console.log('🧪 Testing corrected badge query...\n');

  try {
    const rickId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';
    const chielId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

    // Test the corrected query for Rick
    console.log('1️⃣ Testing Rick\'s badges with corrected query...');
    const { data: rickBadges, error: rickError } = await supabase
      .from('user_badges')
      .select(`
        id,
        badge_id,
        unlocked_at,
        badges (
          id,
          title,
          description,
          image_url
        )
      `)
      .eq('user_id', rickId)
      .order('unlocked_at', { ascending: false })
      .limit(5);

    if (rickError) {
      console.log('❌ Error fetching Rick badges:', rickError.message);
    } else {
      console.log(`📊 Rick has ${rickBadges?.length || 0} badges`);
      if (rickBadges && rickBadges.length > 0) {
        rickBadges.forEach((badge, index) => {
          console.log(`   ${index + 1}. ${badge.badges?.title || 'Unknown'} (${badge.unlocked_at})`);
        });
      } else {
        console.log('   No badges found for Rick');
      }
    }

    // Test the corrected query for Chiel
    console.log('\n2️⃣ Testing Chiel\'s badges with corrected query...');
    const { data: chielBadges, error: chielError } = await supabase
      .from('user_badges')
      .select(`
        id,
        badge_id,
        unlocked_at,
        badges (
          id,
          title,
          description,
          image_url
        )
      `)
      .eq('user_id', chielId)
      .order('unlocked_at', { ascending: false })
      .limit(5);

    if (chielError) {
      console.log('❌ Error fetching Chiel badges:', chielError.message);
    } else {
      console.log(`📊 Chiel has ${chielBadges?.length || 0} badges`);
      if (chielBadges && chielBadges.length > 0) {
        chielBadges.forEach((badge, index) => {
          console.log(`   ${index + 1}. ${badge.badges?.title || 'Unknown'} (${badge.unlocked_at})`);
        });
      } else {
        console.log('   No badges found for Chiel');
      }
    }

    // Test the formatted badges
    console.log('\n3️⃣ Testing formatted badges...');
    if (chielBadges && chielBadges.length > 0) {
      const formattedBadges = chielBadges.map(badge => ({
        id: badge.id,
        name: badge.badges?.title || 'Unknown Badge',
        description: badge.badges?.description || '',
        icon_url: badge.badges?.image_url || null,
        unlocked_at: badge.unlocked_at
      }));

      console.log('📝 Formatted badges for Chiel:');
      formattedBadges.forEach((badge, index) => {
        console.log(`   ${index + 1}. ${badge.name} - ${badge.description} - Icon: ${badge.icon_url || 'No icon'}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testBadgeQuery();
