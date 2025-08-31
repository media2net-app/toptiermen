const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugBadgeFetching() {
  console.log('🔍 Debugging Badge Fetching Function...\n');

  try {
    // 1. Find Chiel's user ID
    console.log('1️⃣ Finding Chiel...');
    const { data: chiel, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'chiel@media2net.nl')
      .single();

    if (userError) {
      console.error('❌ Error finding Chiel:', userError);
      return;
    }

    console.log(`✅ Found Chiel: ${chiel.full_name} (${chiel.id})`);

    // 2. Test the exact query from the API
    console.log('\n2️⃣ Testing exact API query...');
    const { data: badges, error } = await supabase
      .from('user_badges')
      .select(`
        id,
        badge_id,
        unlocked_at,
        badges (
          id,
          title,
          description,
          icon_name,
          image_url,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', chiel.id)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('❌ Error in API query:', error);
      return;
    }

    console.log(`✅ Query returned ${badges?.length || 0} badges`);
    console.log('   Raw data:');
    badges?.forEach((userBadge, index) => {
      console.log(`   ${index + 1}. UserBadge ID: ${userBadge.id}, Badge ID: ${userBadge.badge_id}`);
      console.log(`      Badge data:`, userBadge.badges);
    });

    // 3. Test the mapping function
    console.log('\n3️⃣ Testing mapping function...');
    const mappedBadges = badges?.map(userBadge => {
      const badge = userBadge.badges; // badges is already a single object, not an array
      return {
        id: userBadge.id,
        title: badge?.title || 'Unknown Badge',
        description: badge?.description || '',
        icon_name: badge?.icon_name || 'star',
        image_url: badge?.image_url,
        rarity_level: badge?.rarity_level || 'common',
        xp_reward: badge?.xp_reward || 0,
        unlocked_at: userBadge.unlocked_at
      };
    }) || [];

    console.log(`✅ Mapped ${mappedBadges.length} badges:`);
    mappedBadges.forEach((badge, index) => {
      console.log(`   ${index + 1}. ${badge.title} (${badge.rarity_level})`);
    });

    // 4. Check if there are any null badges
    console.log('\n4️⃣ Checking for null badges...');
    const nullBadges = badges?.filter(userBadge => !userBadge.badges);
    if (nullBadges.length > 0) {
      console.log(`⚠️ Found ${nullBadges.length} badges with null badge data:`);
      nullBadges.forEach((userBadge, index) => {
        console.log(`   ${index + 1}. UserBadge ID: ${userBadge.id}, Badge ID: ${userBadge.badge_id}`);
      });
    } else {
      console.log('✅ No null badges found');
    }

    // 5. Check if badge IDs exist in badges table
    console.log('\n5️⃣ Verifying badge IDs exist...');
    const badgeIds = badges?.map(ub => ub.badge_id) || [];
    console.log(`   Badge IDs to check: ${badgeIds.join(', ')}`);
    
    for (const badgeId of badgeIds) {
      const { data: badge, error: badgeError } = await supabase
        .from('badges')
        .select('id, title')
        .eq('id', badgeId)
        .single();
      
      if (badgeError) {
        console.log(`   ❌ Badge ID ${badgeId} not found:`, badgeError.message);
      } else {
        console.log(`   ✅ Badge ID ${badgeId} found: ${badge.title}`);
      }
    }

    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('================================');
    console.log(`   - Raw query returned: ${badges?.length || 0} badges`);
    console.log(`   - Mapped badges: ${mappedBadges.length}`);
    console.log(`   - Null badges: ${nullBadges?.length || 0}`);
    console.log('   - Check for missing badge references');

  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugBadgeFetching();
