const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function awardAcademyBadgeToChiel() {
  console.log('🏆 Awarding Academy Master Badge to Chiel...\n');

  try {
    // 1. Find Chiel's user ID
    console.log('1️⃣ Finding Chiel\'s user ID...');
    const { data: chielUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'chiel@media2net.nl')
      .single();

    if (userError || !chielUser) {
      console.error('❌ Error finding Chiel:', userError);
      return;
    }

    console.log(`✅ Found Chiel: ${chielUser.full_name} (${chielUser.email})`);
    console.log(`   User ID: ${chielUser.id}`);

    // 2. Check if Academy Master badge exists
    console.log('\n2️⃣ Checking Academy Master badge...');
    const { data: academyBadge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('title', 'Academy Master')
      .single();

    if (badgeError) {
      console.error('❌ Error finding Academy Master badge:', badgeError);
      return;
    }

    console.log(`✅ Found Academy Master badge: ${academyBadge.title}`);
    console.log(`   Badge ID: ${academyBadge.id}`);

    // 3. Check if Chiel already has the badge
    console.log('\n3️⃣ Checking if Chiel already has the badge...');
    const { data: existingUserBadge, error: existingError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', chielUser.id)
      .eq('badge_id', academyBadge.id)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('❌ Error checking existing badge:', existingError);
      return;
    }

    if (existingUserBadge) {
      console.log('✅ Chiel already has the Academy Master badge!');
      console.log(`   Unlocked at: ${existingUserBadge.unlocked_at}`);
      return;
    }

    // 4. Award the badge
    console.log('\n4️⃣ Awarding Academy Master badge to Chiel...');
    const { data: newUserBadge, error: awardError } = await supabase
      .from('user_badges')
      .insert({
        user_id: chielUser.id,
        badge_id: academyBadge.id,
        unlocked_at: new Date().toISOString(),
        status: 'unlocked'
      })
      .select(`
        id,
        unlocked_at,
        status,
        badges!inner(
          id,
          title,
          description,
          icon_name,
          rarity_level,
          xp_reward
        )
      `)
      .single();

    if (awardError) {
      console.error('❌ Error awarding badge:', awardError);
      return;
    }

    console.log('🎉 SUCCESS! Academy Master badge awarded to Chiel!');
    console.log(`   Badge: ${newUserBadge.badges.title}`);
    console.log(`   Unlocked at: ${newUserBadge.unlocked_at}`);
    console.log(`   Status: ${newUserBadge.status}`);
    console.log(`   Icon: ${newUserBadge.badges.icon_name}`);
    console.log(`   Description: ${newUserBadge.badges.description}`);

    // 5. Verify the badge was awarded
    console.log('\n5️⃣ Verifying badge was awarded...');
    const { data: verifyBadge, error: verifyError } = await supabase
      .from('user_badges')
      .select(`
        id,
        unlocked_at,
        status,
        badges!inner(
          id,
          title,
          description,
          icon_name,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', chielUser.id)
      .eq('badge_id', academyBadge.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying badge:', verifyError);
    } else {
      console.log('✅ Badge verification successful!');
      console.log(`   Badge: ${verifyBadge.badges.title}`);
      console.log(`   Unlocked at: ${verifyBadge.unlocked_at}`);
    }

    console.log('\n📋 SUMMARY:');
    console.log('================================');
    console.log('   - Chiel has 7/7 modules completed (100%)');
    console.log('   - Academy Master badge has been awarded');
    console.log('   - Badge should now appear in the Academy page');
    console.log('   - The "Academy Voltooid!" message should show instead of "Bijna Klaar!"');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

awardAcademyBadgeToChiel();
