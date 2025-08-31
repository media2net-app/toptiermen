const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function integrateFirst100BadgeInOnboarding() {
  console.log('🔧 Integrating First 100 Badge in Onboarding Flow...\n');

  try {
    // 1. Get the First 100 badge
    console.log('1️⃣ Getting First 100 badge...');
    const { data: first100Badge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('title', 'First 100 - Leden van het Eerste Uur')
      .single();

    if (badgeError) {
      console.error('❌ Error finding First 100 badge:', badgeError);
      return;
    }

    console.log(`✅ Found First 100 badge: ${first100Badge.title} ${first100Badge.icon_name}`);

    // 2. Check current user count
    console.log('\n2️⃣ Checking current user count...');
    const { count: userCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting users:', countError);
      return;
    }

    console.log(`📊 Current platform users: ${userCount}`);

    // 3. Check how many users already have the First 100 badge
    console.log('\n3️⃣ Checking First 100 badge distribution...');
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('user_id')
      .eq('badge_id', first100Badge.id);

    if (userBadgesError) {
      console.error('❌ Error checking user badges:', userBadgesError);
      return;
    }

    const badgeCount = userBadges?.length || 0;
    console.log(`📊 Users with First 100 badge: ${badgeCount}`);

    // 4. Create onboarding completion check function
    console.log('\n4️⃣ Creating onboarding completion check logic...');
    
    const onboardingCheckLogic = `
    // Function to check if user should get First 100 badge
    async function checkFirst100BadgeEligibility(userId) {
      try {
        // Check if user is in first 100 members
        const { count: userRank, error: rankError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', (await supabase
            .from('profiles')
            .select('created_at')
            .eq('id', userId)
            .single()).data.created_at);

        if (rankError) {
          console.error('Error checking user rank:', rankError);
          return false;
        }

        const isInFirst100 = (userRank || 0) < 100;
        
        if (isInFirst100) {
          // Check if user already has the badge
          const { data: existingBadge, error: existingError } = await supabase
            .from('user_badges')
            .select('id')
            .eq('user_id', userId)
            .eq('badge_id', ${first100Badge.id})
            .single();

          if (existingError && existingError.code !== 'PGRST116') {
            console.error('Error checking existing badge:', existingError);
            return false;
          }

          if (!existingBadge) {
            // Award the badge
            const { data: newBadge, error: awardError } = await supabase
              .from('user_badges')
              .insert({
                user_id: userId,
                badge_id: ${first100Badge.id},
                unlocked_at: new Date().toISOString(),
                status: 'unlocked'
              })
              .select()
              .single();

            if (awardError) {
              console.error('Error awarding First 100 badge:', awardError);
              return false;
            }

            console.log('🎉 First 100 badge awarded to user:', userId);
            return true;
          }
        }

        return false;
      } catch (error) {
        console.error('Error in checkFirst100BadgeEligibility:', error);
        return false;
      }
    }
    `;

    console.log('✅ Onboarding check logic created');
    console.log('📝 This function should be called when onboarding is completed');

    // 5. Show integration instructions
    console.log('\n5️⃣ Integration Instructions:');
    console.log('================================');
    console.log('📋 To integrate First 100 badge in onboarding:');
    console.log('');
    console.log('1. Add the checkFirst100BadgeEligibility function to your onboarding completion logic');
    console.log('2. Call this function when a user completes the onboarding');
    console.log('3. The function will automatically check if the user is in the first 100 members');
    console.log('4. If eligible and doesn\'t have the badge yet, it will be awarded automatically');
    console.log('');
    console.log('📝 Example integration in onboarding completion:');
    console.log('```typescript');
    console.log('// In your onboarding completion handler');
    console.log('const handleOnboardingComplete = async (userId) => {');
    console.log('  // Complete onboarding steps...');
    console.log('  await completeOnboarding(userId);');
    console.log('  ');
    console.log('  // Check for First 100 badge');
    console.log('  const badgeAwarded = await checkFirst100BadgeEligibility(userId);');
    console.log('  ');
    console.log('  if (badgeAwarded) {');
    console.log('    // Show badge unlock modal or notification');
    console.log('    showBadgeUnlockModal("First 100 - Leden van het Eerste Uur");');
    console.log('  }');
    console.log('};');
    console.log('```');

    // 6. Current status summary
    console.log('\n📊 CURRENT STATUS:');
    console.log('================================');
    console.log(`   - Total platform users: ${userCount}`);
    console.log(`   - Users with First 100 badge: ${badgeCount}`);
    console.log(`   - Badge ID: ${first100Badge.id}`);
    console.log(`   - Badge title: ${first100Badge.title}`);
    console.log(`   - Badge icon: ${first100Badge.icon_name}`);
    console.log(`   - Badge rarity: ${first100Badge.rarity_level}`);
    console.log(`   - XP reward: ${first100Badge.xp_reward}`);

    if (userCount <= 100) {
      console.log(`   - Status: Still accepting First 100 members (${100 - userCount} spots left)`);
    } else {
      console.log(`   - Status: First 100 spots filled, badge is now exclusive`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

integrateFirst100BadgeInOnboarding();
