require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBrotherhoodData() {
  console.log('🧪 Testing brotherhood data after profile creation...\n');

  try {
    // Test the members-data API endpoint
    console.log('1️⃣ Testing the members-data API endpoint...');
    try {
      const response = await fetch('http://localhost:6001/api/members-data');
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 API returned ${data.members?.length || 0} members`);
        
        if (data.members) {
          console.log('👥 Members from API:');
          data.members.forEach((member, index) => {
            const name = member.display_name || member.full_name || 'Unknown';
            const badgeCount = member.badges_count || 0;
            console.log(`   ${index + 1}. ${name} (${member.email}) - Badges: ${badgeCount}`);
          });
        }
      } else {
        console.log('❌ API request failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Error calling API:', error.message);
    }

    // Get all profiles with badge counts
    console.log('\n2️⃣ Getting all profiles with badge counts...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`📊 Found ${profiles?.length || 0} profiles`);

    // Get badge counts for each profile
    const profilesWithBadges = await Promise.all(
      profiles.map(async (profile) => {
        const { data: badges, error } = await supabase
          .from('user_badges')
          .select('id')
          .eq('user_id', profile.id);

        if (error) {
          console.error(`Error fetching badges for ${profile.display_name}:`, error);
          return { ...profile, badgeCount: 0 };
        }

        return { ...profile, badgeCount: badges?.length || 0 };
      })
    );

    console.log('\n👥 All profiles with badge counts:');
    profilesWithBadges.forEach((profile, index) => {
      const name = profile.display_name || profile.full_name || 'Unknown';
      console.log(`   ${index + 1}. ${name} (${profile.email}) - Badges: ${profile.badgeCount}`);
    });

    // Check which profiles have badges
    const profilesWithBadgesOnly = profilesWithBadges.filter(p => p.badgeCount > 0);
    const profilesWithoutBadges = profilesWithBadges.filter(p => p.badgeCount === 0);

    console.log(`\n📊 Summary:`);
    console.log(`- Total profiles: ${profilesWithBadges.length}`);
    console.log(`- Profiles with badges: ${profilesWithBadgesOnly.length}`);
    console.log(`- Profiles without badges: ${profilesWithoutBadges.length}`);

    console.log(`\n🏆 Profiles with badges:`);
    profilesWithBadgesOnly.forEach((profile, index) => {
      const name = profile.display_name || profile.full_name || 'Unknown';
      console.log(`   ${index + 1}. ${name} - ${profile.badgeCount} badges`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testBrotherhoodData();
