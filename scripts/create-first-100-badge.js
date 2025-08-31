const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createFirst100Badge() {
  console.log('🏆 Creating First 100 Badge for Early Platform Members...\n');

  try {
    // 1. Check if the badge already exists
    console.log('1️⃣ Checking if First 100 badge already exists...');
    const { data: existingBadge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('title', 'First 100 - Leden van het Eerste Uur')
      .single();

    if (badgeError && badgeError.code !== 'PGRST116') {
      console.error('❌ Error checking existing badge:', badgeError);
      return;
    }

    if (existingBadge) {
      console.log('✅ First 100 badge already exists!');
      console.log(`   Badge ID: ${existingBadge.id}`);
      console.log(`   Title: ${existingBadge.title}`);
      return existingBadge;
    }

    // 2. Create the First 100 badge
    console.log('\n2️⃣ Creating First 100 badge...');
    const { data: newBadge, error: createError } = await supabase
      .from('badges')
      .insert({
        title: 'First 100 - Leden van het Eerste Uur',
        description: 'Je bent een van de eerste 100 leden van het Top Tier Men platform! Als lid van het eerste uur heb je een speciale plek in onze community en bent je onderdeel van de fundamenten waarop we bouwen.',
        icon_name: '🌟',
        rarity_level: 'legendary',
        xp_reward: 1000,
        category_id: 1, // Using existing category
        requirements: {
          condition: 'Eerste 100 platform leden die de onboarding hebben voltooid',
          type: 'special'
        },
        is_active: true,
        image_url: null
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating badge:', createError);
      return;
    }

    console.log('✅ First 100 badge created successfully!');
    console.log(`   Badge ID: ${newBadge.id}`);
    console.log(`   Title: ${newBadge.title}`);
    console.log(`   Icon: ${newBadge.icon_name}`);
    console.log(`   Rarity: ${newBadge.rarity_level}`);
    console.log(`   XP Reward: ${newBadge.xp_reward}`);

    return newBadge;

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function getFirst100Members() {
  console.log('\n3️⃣ Getting first 100 platform members...');
  
  try {
    // Get all users ordered by creation date
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: true })
      .limit(100);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return [];
    }

    console.log(`✅ Found ${allUsers?.length || 0} users (first 100 by registration date)`);
    
    // Show the first 10 users as example
    console.log('\n📋 First 10 users:');
    allUsers?.slice(0, 10).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.full_name} (${user.email}) - ${user.created_at}`);
    });

    return allUsers || [];

  } catch (error) {
    console.error('❌ Error:', error);
    return [];
  }
}

async function awardBadgeToFirst100Members(badgeId) {
  console.log('\n4️⃣ Awarding First 100 badge to eligible members...');
  
  try {
    const first100Members = await getFirst100Members();
    
    if (first100Members.length === 0) {
      console.log('❌ No users found to award badge to');
      return;
    }

    // Check which users already have the badge
    const { data: existingUserBadges, error: existingError } = await supabase
      .from('user_badges')
      .select('user_id, badge_id')
      .eq('badge_id', badgeId);

    if (existingError) {
      console.error('❌ Error checking existing user badges:', existingError);
      return;
    }

    const existingUserIds = new Set(existingUserBadges?.map(ub => ub.user_id) || []);
    const eligibleUsers = first100Members.filter(user => !existingUserIds.has(user.id));

    console.log(`📊 Badge Award Summary:`);
    console.log(`   - Total first 100 members: ${first100Members.length}`);
    console.log(`   - Already have badge: ${existingUserIds.size}`);
    console.log(`   - Eligible for badge: ${eligibleUsers.length}`);

    if (eligibleUsers.length === 0) {
      console.log('✅ All eligible users already have the First 100 badge!');
      return;
    }

    // Award badge to eligible users
    const badgeAwards = eligibleUsers.map(user => ({
      user_id: user.id,
      badge_id: badgeId,
      unlocked_at: new Date().toISOString(),
      status: 'unlocked'
    }));

    const { data: newUserBadges, error: awardError } = await supabase
      .from('user_badges')
      .insert(badgeAwards)
      .select(`
        id,
        user_id,
        unlocked_at,
        status,
        badges!inner(
          id,
          title,
          icon_name
        )
      `);

    if (awardError) {
      console.error('❌ Error awarding badges:', awardError);
      return;
    }

    console.log(`🎉 SUCCESS! Awarded First 100 badge to ${newUserBadges?.length || 0} members!`);
    
    // Show some examples
    console.log('\n📋 Examples of awarded badges:');
    newUserBadges?.slice(0, 5).forEach((userBadge, index) => {
      console.log(`   ${index + 1}. User ID: ${userBadge.user_id}`);
      console.log(`      Badge: ${userBadge.badges.title} ${userBadge.badges.icon_name}`);
      console.log(`      Unlocked: ${userBadge.unlocked_at}`);
    });

    if (newUserBadges && newUserBadges.length > 5) {
      console.log(`   ... and ${newUserBadges.length - 5} more members`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function main() {
  console.log('🚀 Starting First 100 Badge Creation and Award Process...\n');

  try {
    // 1. Create the badge
    const badge = await createFirst100Badge();
    
    if (!badge) {
      console.log('❌ Failed to create or find badge');
      return;
    }

    // 2. Award badge to first 100 members
    await awardBadgeToFirst100Members(badge.id);

    console.log('\n📋 FINAL SUMMARY:');
    console.log('================================');
    console.log('   ✅ First 100 badge created/verified');
    console.log('   ✅ Badge awarded to eligible early members');
    console.log('   ✅ Special recognition for platform pioneers');
    console.log('   🎉 First 100 members now have exclusive badge!');

  } catch (error) {
    console.error('❌ Error in main process:', error);
  }
}

main();
