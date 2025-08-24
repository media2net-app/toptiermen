require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBadgesStructure() {
  console.log('🔍 Checking badges table structure...\n');

  try {
    // Get all columns from badges table
    console.log('1️⃣ Getting badges table structure...');
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .limit(1);

    if (badgesError) {
      console.error('❌ Error fetching badges:', badgesError);
      return;
    }

    if (badges && badges.length > 0) {
      console.log('📋 Badges table columns:');
      const firstBadge = badges[0];
      Object.keys(firstBadge).forEach(key => {
        console.log(`   - ${key}: ${typeof firstBadge[key]} = ${firstBadge[key]}`);
      });
    }

    // Get all badges
    console.log('\n2️⃣ Getting all badges...');
    const { data: allBadges, error: allBadgesError } = await supabase
      .from('badges')
      .select('*');

    if (allBadgesError) {
      console.error('❌ Error fetching all badges:', allBadgesError);
      return;
    }

    console.log(`📊 Found ${allBadges?.length || 0} badges:`);
    allBadges?.forEach((badge, index) => {
      console.log(`   ${index + 1}. ID: ${badge.id}, Data:`, badge);
    });

    // Check user_badges structure
    console.log('\n3️⃣ Getting user_badges structure...');
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('*')
      .limit(1);

    if (userBadgesError) {
      console.error('❌ Error fetching user_badges:', userBadgesError);
      return;
    }

    if (userBadges && userBadges.length > 0) {
      console.log('📋 User_badges table columns:');
      const firstUserBadge = userBadges[0];
      Object.keys(firstUserBadge).forEach(key => {
        console.log(`   - ${key}: ${typeof firstUserBadge[key]} = ${firstUserBadge[key]}`);
      });
    }

    // Check user_achievements table
    console.log('\n4️⃣ Checking user_achievements table...');
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('*')
      .limit(5);

    if (userAchievementsError) {
      console.log('❌ Error fetching user_achievements:', userAchievementsError.message);
    } else {
      console.log(`📊 Found ${userAchievements?.length || 0} user achievements:`);
      userAchievements?.forEach((achievement, index) => {
        console.log(`   ${index + 1}. User: ${achievement.user_id}, Achievement: ${achievement.achievement_id}, Unlocked: ${achievement.unlocked_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkBadgesStructure();
