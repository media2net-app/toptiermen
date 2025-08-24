require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilesVsBadges() {
  console.log('🔍 Checking profiles vs badges data...\n');

  try {
    // Get all profiles
    console.log('1️⃣ Getting all profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`📊 Found ${profiles?.length || 0} profiles`);

    // Get all users with badges
    console.log('\n2️⃣ Getting all users with badges...');
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('user_id')
      .order('unlocked_at', { ascending: false });

    if (userBadgesError) {
      console.error('❌ Error fetching user badges:', userBadgesError);
      return;
    }

    // Get unique user IDs with badges
    const userIdsWithBadges = [...new Set(userBadges?.map(record => record.user_id) || [])];
    console.log(`📊 Found ${userIdsWithBadges.length} unique users with badges`);

    // Check which users with badges have profiles
    console.log('\n3️⃣ Checking which users with badges have profiles...');
    const usersWithBadgesAndProfiles = [];
    const usersWithBadgesNoProfiles = [];

    userIdsWithBadges.forEach(userId => {
      const profile = profiles?.find(p => p.id === userId);
      if (profile) {
        usersWithBadgesAndProfiles.push({
          id: userId,
          name: profile.display_name || profile.full_name || 'Unknown',
          email: profile.email,
          profile: profile
        });
      } else {
        usersWithBadgesNoProfiles.push(userId);
      }
    });

    console.log(`✅ Users with badges AND profiles: ${usersWithBadgesAndProfiles.length}`);
    usersWithBadgesAndProfiles.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    console.log(`❌ Users with badges but NO profiles: ${usersWithBadgesNoProfiles.length}`);
    usersWithBadgesNoProfiles.forEach(userId => {
      console.log(`   - ${userId}`);
    });

    // Check which profiles have badges
    console.log('\n4️⃣ Checking which profiles have badges...');
    const profilesWithBadges = [];
    const profilesWithoutBadges = [];

    profiles?.forEach(profile => {
      const hasBadges = userIdsWithBadges.includes(profile.id);
      if (hasBadges) {
        profilesWithBadges.push(profile);
      } else {
        profilesWithoutBadges.push(profile);
      }
    });

    console.log(`✅ Profiles WITH badges: ${profilesWithBadges.length}`);
    profilesWithBadges.forEach(profile => {
      const name = profile.display_name || profile.full_name || 'Unknown';
      console.log(`   - ${name} (${profile.email})`);
    });

    console.log(`❌ Profiles WITHOUT badges: ${profilesWithoutBadges.length}`);
    profilesWithoutBadges.forEach(profile => {
      const name = profile.display_name || profile.full_name || 'Unknown';
      console.log(`   - ${name} (${profile.email})`);
    });

    // Check the members-data API endpoint
    console.log('\n5️⃣ Testing the members-data API endpoint...');
    try {
      const response = await fetch('http://localhost:6001/api/members-data');
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 API returned ${data.members?.length || 0} members`);
        
        if (data.members) {
          console.log('👥 Members from API:');
          data.members.forEach((member, index) => {
            const name = member.display_name || member.full_name || 'Unknown';
            const hasBadges = userIdsWithBadges.includes(member.id);
            console.log(`   ${index + 1}. ${name} (${member.email}) - Badges: ${hasBadges ? 'YES' : 'NO'}`);
          });
        }
      } else {
        console.log('❌ API request failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Error calling API:', error.message);
    }

    // Summary
    console.log('\n📋 SUMMARY:');
    console.log(`- Total profiles: ${profiles?.length || 0}`);
    console.log(`- Users with badges: ${userIdsWithBadges.length}`);
    console.log(`- Profiles with badges: ${profilesWithBadges.length}`);
    console.log(`- Users with badges but no profiles: ${usersWithBadgesNoProfiles.length}`);
    console.log(`- Profiles without badges: ${profilesWithoutBadges.length}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkProfilesVsBadges();
