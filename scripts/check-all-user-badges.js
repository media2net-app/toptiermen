require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllUserBadges() {
  console.log('🔍 Checking all users with badges...\n');

  try {
    // Get all users with badges
    console.log('1️⃣ Getting all users with badges...');
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select(`
        user_id,
        badge_id,
        unlocked_at,
        badges (
          id,
          title,
          description,
          image_url
        )
      `)
      .order('unlocked_at', { ascending: false });

    if (userBadgesError) {
      console.error('❌ Error fetching user badges:', userBadgesError);
      return;
    }

    console.log(`📊 Found ${userBadges?.length || 0} total badge records`);

    // Group badges by user
    const userBadgeCounts = {};
    const userBadgeDetails = {};

    userBadges?.forEach(record => {
      const userId = record.user_id;
      if (!userBadgeCounts[userId]) {
        userBadgeCounts[userId] = 0;
        userBadgeDetails[userId] = [];
      }
      userBadgeCounts[userId]++;
      userBadgeDetails[userId].push({
        id: record.id,
        badgeTitle: record.badges?.title || 'Unknown',
        unlockedAt: record.unlocked_at
      });
    });

    console.log(`\n2️⃣ Users with badges (${Object.keys(userBadgeCounts).length} users):`);
    
    const userIds = Object.keys(userBadgeCounts);
    for (const userId of userIds) {
      const badgeCount = userBadgeCounts[userId];
      const badges = userBadgeDetails[userId];
      
      console.log(`\n👤 User: ${userId}`);
      console.log(`   📊 Badge count: ${badgeCount}`);
      console.log(`   🏆 Badges:`);
      badges.forEach((badge, index) => {
        console.log(`      ${index + 1}. ${badge.badgeTitle} (${badge.unlockedAt})`);
      });
    }

    // Get user profiles for better identification
    console.log('\n3️⃣ Getting user profiles for better identification...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, display_name, email')
      .in('id', userIds);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`📊 Found ${profiles?.length || 0} profiles`);
      
      console.log('\n4️⃣ Users with badges (with names):');
      for (const userId of userIds) {
        const profile = profiles?.find(p => p.id === userId);
        const badgeCount = userBadgeCounts[userId];
        const badges = userBadgeDetails[userId];
        
        const userName = profile?.display_name || profile?.full_name || 'Unknown User';
        const userEmail = profile?.email || 'No email';
        
        console.log(`\n👤 ${userName} (${userEmail})`);
        console.log(`   📊 Badge count: ${badgeCount}`);
        console.log(`   🏆 Badges:`);
        badges.forEach((badge, index) => {
          console.log(`      ${index + 1}. ${badge.badgeTitle} (${badge.unlockedAt})`);
        });
      }
    }

    // Check specific users
    console.log('\n5️⃣ Checking specific users...');
    const rickId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c';
    const chielId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';
    
    console.log(`\n👤 Rick (${rickId}):`);
    if (userBadgeCounts[rickId]) {
      console.log(`   📊 Badge count: ${userBadgeCounts[rickId]}`);
      userBadgeDetails[rickId].forEach((badge, index) => {
        console.log(`      ${index + 1}. ${badge.badgeTitle} (${badge.unlockedAt})`);
      });
    } else {
      console.log('   ❌ No badges found');
    }
    
    console.log(`\n👤 Chiel (${chielId}):`);
    if (userBadgeCounts[chielId]) {
      console.log(`   📊 Badge count: ${userBadgeCounts[chielId]}`);
      userBadgeDetails[chielId].forEach((badge, index) => {
        console.log(`      ${index + 1}. ${badge.badgeTitle} (${badge.unlockedAt})`);
      });
    } else {
      console.log('   ❌ No badges found');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAllUserBadges();
