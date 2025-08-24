require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMissingProfiles() {
  console.log('🔍 Creating missing profiles for users with badges...\n');

  try {
    // Get users with badges but no profiles
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('user_id')
      .order('unlocked_at', { ascending: false });

    if (userBadgesError) {
      console.error('❌ Error fetching user badges:', userBadgesError);
      return;
    }

    const userIdsWithBadges = [...new Set(userBadges?.map(record => record.user_id) || [])];
    console.log(`📊 Found ${userIdsWithBadges.length} unique users with badges`);

    // Get existing profiles
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    const existingProfileIds = existingProfiles?.map(p => p.id) || [];
    const missingProfileIds = userIdsWithBadges.filter(id => !existingProfileIds.includes(id));

    console.log(`📊 Users with badges but no profiles: ${missingProfileIds.length}`);

    if (missingProfileIds.length === 0) {
      console.log('✅ All users with badges already have profiles!');
      return;
    }

    // Create profiles for missing users
    console.log('\n🏗️ Creating profiles for missing users...');
    
    const profilesToCreate = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        full_name: 'Alex Johnson',
        display_name: 'Alex',
        email: 'alex@toptiermen.com',
        rank: 'Intermediate',
        points: 2500,
        missions_completed: 15,
        avatar_url: '/profielfoto.png',
        bio: 'Fitness enthusiast and mindset coach. Always pushing boundaries and helping others reach their potential.',
        location: 'Amsterdam, Nederland',
        interests: ['Fitness', 'Mindset', 'Coaching'],
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        full_name: 'Mark van der Berg',
        display_name: 'Mark',
        email: 'mark@toptiermen.com',
        rank: 'Veteraan',
        points: 3200,
        missions_completed: 22,
        avatar_url: '/profielfoto.png',
        bio: 'Experienced entrepreneur and fitness trainer. Building businesses and transforming lives.',
        location: 'Rotterdam, Nederland',
        interests: ['Ondernemerschap', 'Fitness', 'Finance'],
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        full_name: 'David Chen',
        display_name: 'David',
        email: 'david@toptiermen.com',
        rank: 'Beginner',
        points: 1800,
        missions_completed: 8,
        avatar_url: '/profielfoto.png',
        bio: 'New to the Top Tier Men community. Excited to grow and learn from the best.',
        location: 'Utrecht, Nederland',
        interests: ['Fitness', 'Mindset'],
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        full_name: 'Thomas Müller',
        display_name: 'Thomas',
        email: 'thomas@toptiermen.com',
        rank: 'Beginner',
        points: 1200,
        missions_completed: 5,
        avatar_url: '/profielfoto.png',
        bio: 'Starting my journey to become a Top Tier Man. Ready to put in the work.',
        location: 'Eindhoven, Nederland',
        interests: ['Fitness', 'Vaderschap'],
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }
    ];

    for (const profile of profilesToCreate) {
      if (missingProfileIds.includes(profile.id)) {
        console.log(`📝 Creating profile for ${profile.display_name}...`);
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(profile)
          .select()
          .single();

        if (createError) {
          console.error(`❌ Error creating profile for ${profile.display_name}:`, createError.message);
        } else {
          console.log(`✅ Created profile for ${profile.display_name} (${profile.email})`);
        }
      }
    }

    console.log('\n📊 Final check...');
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('id, display_name, email');

    if (finalError) {
      console.error('❌ Error fetching final profiles:', finalError);
    } else {
      console.log(`📊 Total profiles now: ${finalProfiles?.length || 0}`);
      console.log('👥 All profiles:');
      finalProfiles?.forEach((profile, index) => {
        const hasBadges = userIdsWithBadges.includes(profile.id);
        console.log(`   ${index + 1}. ${profile.display_name} (${profile.email}) - Badges: ${hasBadges ? 'YES' : 'NO'}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createMissingProfiles();
