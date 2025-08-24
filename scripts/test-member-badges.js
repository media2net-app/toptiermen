require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMemberBadges() {
  console.log('🧪 Testing member badge data...\n');

  try {
    const rickId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';
    const chielId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

    // Test Rick's badges
    console.log('1️⃣ Testing Rick\'s badge data...');
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
      .order('unlocked_at', { ascending: false });

    if (rickError) {
      console.log('❌ Error fetching Rick badges:', rickError.message);
    } else {
      console.log(`📊 Rick has ${rickBadges?.length || 0} badges`);
      
      // Simulate the MemberBadgeDisplay logic
      const displayBadges = rickBadges?.slice(-3) || [];
      const additionalCount = (rickBadges?.length || 0) - displayBadges.length;
      
      console.log(`   - Display badges: ${displayBadges.length}`);
      console.log(`   - Additional count: ${additionalCount}`);
      console.log(`   - Should show +${additionalCount}: ${additionalCount > 0 ? 'YES' : 'NO'}`);
      
      if (rickBadges && rickBadges.length > 0) {
        rickBadges.forEach((badge, index) => {
          console.log(`   ${index + 1}. ${badge.badges?.title || 'Unknown'} (${badge.unlocked_at})`);
        });
      }
    }

    // Test Chiel's badges
    console.log('\n2️⃣ Testing Chiel\'s badge data...');
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
      .order('unlocked_at', { ascending: false });

    if (chielError) {
      console.log('❌ Error fetching Chiel badges:', chielError.message);
    } else {
      console.log(`📊 Chiel has ${chielBadges?.length || 0} badges`);
      
      // Simulate the MemberBadgeDisplay logic
      const displayBadges = chielBadges?.slice(-3) || [];
      const additionalCount = (chielBadges?.length || 0) - displayBadges.length;
      
      console.log(`   - Display badges: ${displayBadges.length}`);
      console.log(`   - Additional count: ${additionalCount}`);
      console.log(`   - Should show +${additionalCount}: ${additionalCount > 0 ? 'YES' : 'NO'}`);
      
      if (chielBadges && chielBadges.length > 0) {
        chielBadges.forEach((badge, index) => {
          console.log(`   ${index + 1}. ${badge.badges?.title || 'Unknown'} (${badge.unlocked_at})`);
        });
      }
    }

    // Test the MemberBadgeDisplay component logic
    console.log('\n3️⃣ Testing MemberBadgeDisplay component logic...');
    
    const testMemberBadgeDisplay = (badges, totalCount) => {
      if (!badges || badges.length === 0) {
        return { displayCount: 0, additionalCount: 0, shouldShowPlus: false };
      }
      
      const displayBadges = badges.slice(-3);
      const additionalCount = totalCount - displayBadges.length;
      
      return {
        displayCount: displayBadges.length,
        additionalCount: additionalCount,
        shouldShowPlus: additionalCount > 0
      };
    };

    // Test with Rick's data
    const rickFormattedBadges = rickBadges?.map(badge => ({
      id: badge.id,
      name: badge.badges?.title || 'Unknown Badge',
      description: badge.badges?.description || '',
      icon_url: badge.badges?.image_url || null,
      unlocked_at: badge.unlocked_at
    })) || [];

    const rickResult = testMemberBadgeDisplay(rickFormattedBadges, rickFormattedBadges.length);
    console.log('📊 Rick MemberBadgeDisplay result:', rickResult);

    // Test with Chiel's data
    const chielFormattedBadges = chielBadges?.map(badge => ({
      id: badge.id,
      name: badge.badges?.title || 'Unknown Badge',
      description: badge.badges?.description || '',
      icon_url: badge.badges?.image_url || null,
      unlocked_at: badge.unlocked_at
    })) || [];

    const chielResult = testMemberBadgeDisplay(chielFormattedBadges, chielFormattedBadges.length);
    console.log('📊 Chiel MemberBadgeDisplay result:', chielResult);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testMemberBadges();
