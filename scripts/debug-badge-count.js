const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugBadgeCount() {
  console.log('🔍 Debugging Badge Count Issue...\n');

  try {
    // 1. Find Chiel's user ID
    console.log('1️⃣ Finding Chiel...');
    const { data: chiel, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'chiel@media2net.nl')
      .single();

    if (userError) {
      console.error('❌ Error finding Chiel:', userError);
      return;
    }

    console.log(`✅ Found Chiel: ${chiel.full_name} (${chiel.id})`);

    // 2. Check all user badges for Chiel
    console.log('\n2️⃣ Checking all user badges for Chiel...');
    const { data: userBadges, error: badgesError } = await supabase
      .from('user_badges')
      .select(`
        id,
        badge_id,
        unlocked_at,
        status,
        badges (
          id,
          title,
          description,
          icon_name,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', chiel.id)
      .order('unlocked_at', { ascending: false });

    if (badgesError) {
      console.error('❌ Error fetching user badges:', badgesError);
      return;
    }

    console.log(`✅ Found ${userBadges?.length || 0} badges for Chiel:`);
    userBadges?.forEach((userBadge, index) => {
      const badge = userBadge.badges;
      console.log(`   ${index + 1}. ${badge?.title || 'Unknown'} (ID: ${userBadge.badge_id})`);
      console.log(`      Status: ${userBadge.status}, Unlocked: ${userBadge.unlocked_at}`);
    });

    // 3. Check the API endpoint directly
    console.log('\n3️⃣ Testing API endpoint...');
    const apiResponse = await fetch(`http://localhost:3000/api/dashboard-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: chiel.id
      })
    });

    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log(`✅ API Response - Badge count: ${apiData.stats?.badges?.length || 0}`);
      console.log('   Badges from API:');
      apiData.stats?.badges?.forEach((badge, index) => {
        console.log(`   ${index + 1}. ${badge.title} (${badge.rarity_level})`);
      });
    } else {
      console.error('❌ API Error:', apiResponse.status, apiResponse.statusText);
    }

    // 4. Check if there's a mismatch in column names
    console.log('\n4️⃣ Checking badge table structure...');
    const { data: sampleBadge, error: sampleError } = await supabase
      .from('badges')
      .select('*')
      .limit(1)
      .single();

    if (sampleError) {
      console.error('❌ Error fetching sample badge:', sampleError);
    } else {
      console.log('✅ Badge table columns:', Object.keys(sampleBadge));
      console.log('   Sample badge:', {
        id: sampleBadge.id,
        title: sampleBadge.title,
        description: sampleBadge.description,
        icon_name: sampleBadge.icon_name
      });
    }

    // 5. Check if the First 100 badge exists
    console.log('\n5️⃣ Checking First 100 badge...');
    const { data: first100Badge, error: first100Error } = await supabase
      .from('badges')
      .select('*')
      .eq('title', 'First 100 - Leden van het Eerste Uur')
      .single();

    if (first100Error) {
      console.error('❌ Error finding First 100 badge:', first100Error);
    } else {
      console.log('✅ First 100 badge found:', {
        id: first100Badge.id,
        title: first100Badge.title,
        icon_name: first100Badge.icon_name
      });
    }

    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('================================');
    console.log(`   - Chiel has ${userBadges?.length || 0} badges in database`);
    console.log(`   - API returns ${apiData?.stats?.badges?.length || 0} badges`);
    console.log('   - Check for column name mismatches (name vs title)');
    console.log('   - Verify API endpoint is using correct column names');

  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugBadgeCount();
