require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBadgeDataSimple() {
  console.log('🔍 Checking badge data in database (simple approach)...\n');

  try {
    // Try to fetch from user_badges table
    console.log('1️⃣ Trying to fetch from user_badges table...');
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('*')
      .limit(5);

    if (userBadgesError) {
      console.log('❌ user_badges table error:', userBadgesError.message);
    } else {
      console.log(`✅ user_badges table exists with ${userBadges?.length || 0} records`);
      if (userBadges && userBadges.length > 0) {
        console.log('📝 Sample records:');
        userBadges.forEach((record, index) => {
          console.log(`   ${index + 1}. User: ${record.user_id}, Badge: ${record.badge_id}, Unlocked: ${record.unlocked_at}`);
        });
      }
    }

    // Try to fetch from badges table
    console.log('\n2️⃣ Trying to fetch from badges table...');
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .limit(5);

    if (badgesError) {
      console.log('❌ badges table error:', badgesError.message);
    } else {
      console.log(`✅ badges table exists with ${badges?.length || 0} records`);
      if (badges && badges.length > 0) {
        console.log('📝 Sample records:');
        badges.forEach((badge, index) => {
          console.log(`   ${index + 1}. ID: ${badge.id}, Name: ${badge.name}, Icon: ${badge.icon_url || 'No icon'}`);
        });
      }
    }

    // Check specific user badges (Rick and Chiel)
    console.log('\n3️⃣ Checking specific user badges...');
    const rickId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';
    const chielId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';

    // Check Rick's badges
    console.log('\n📊 Checking Rick\'s badges...');
    const { data: rickBadges, error: rickError } = await supabase
      .from('user_badges')
      .select(`
        id,
        badge_id,
        unlocked_at,
        badges (
          id,
          name,
          description,
          icon_url
        )
      `)
      .eq('user_id', rickId)
      .order('unlocked_at', { ascending: false });

    if (rickError) {
      console.log('❌ Error fetching Rick badges:', rickError.message);
    } else {
      console.log(`📊 Rick has ${rickBadges?.length || 0} badges`);
      if (rickBadges && rickBadges.length > 0) {
        rickBadges.forEach((badge, index) => {
          console.log(`   ${index + 1}. ${badge.badges?.name || 'Unknown'} (${badge.unlocked_at})`);
        });
      } else {
        console.log('   No badges found for Rick');
      }
    }

    // Check Chiel's badges
    console.log('\n📊 Checking Chiel\'s badges...');
    const { data: chielBadges, error: chielError } = await supabase
      .from('user_badges')
      .select(`
        id,
        badge_id,
        unlocked_at,
        badges (
          id,
          name,
          description,
          icon_url
        )
      `)
      .eq('user_id', chielId)
      .order('unlocked_at', { ascending: false });

    if (chielError) {
      console.log('❌ Error fetching Chiel badges:', chielError.message);
    } else {
      console.log(`📊 Chiel has ${chielBadges?.length || 0} badges`);
      if (chielBadges && chielBadges.length > 0) {
        chielBadges.forEach((badge, index) => {
          console.log(`   ${index + 1}. ${badge.badges?.name || 'Unknown'} (${badge.unlocked_at})`);
        });
      } else {
        console.log('   No badges found for Chiel');
      }
    }

    // Check what tables exist by trying common names
    console.log('\n4️⃣ Checking what badge-related tables exist...');
    const possibleTables = ['user_badges', 'badges', 'user_badge', 'badge', 'achievements', 'user_achievements'];
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`   ✅ ${tableName}: exists`);
        }
      } catch (err) {
        console.log(`   ❌ ${tableName}: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkBadgeDataSimple();
