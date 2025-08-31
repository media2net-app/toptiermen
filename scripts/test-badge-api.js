const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBadgeAPI() {
  console.log('🧪 Testing Badge API Endpoint...\n');

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

    // 2. Test the API endpoint
    console.log('\n2️⃣ Testing API endpoint...');
    
    // Wait a bit for the server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
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
      
      // 3. Compare with database
      console.log('\n3️⃣ Comparing with database...');
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

      console.log(`✅ Database - Badge count: ${userBadges?.length || 0}`);
      console.log('   Badges from database:');
      userBadges?.forEach((userBadge, index) => {
        const badge = userBadge.badges;
        console.log(`   ${index + 1}. ${badge?.title || 'Unknown'} (${badge?.rarity_level || 'unknown'})`);
      });

      // 4. Check if counts match
      const apiCount = apiData.stats?.badges?.length || 0;
      const dbCount = userBadges?.length || 0;
      
      console.log('\n📊 COMPARISON RESULTS:');
      console.log('================================');
      console.log(`   API Badge Count: ${apiCount}`);
      console.log(`   Database Badge Count: ${dbCount}`);
      
      if (apiCount === dbCount) {
        console.log('✅ SUCCESS: Badge counts match!');
        console.log('   The "First 100" badge should now be visible on the dashboard.');
      } else {
        console.log('❌ MISMATCH: Badge counts do not match!');
        console.log('   API is missing some badges or has duplicates.');
      }

    } else {
      console.error('❌ API Error:', apiResponse.status, apiResponse.statusText);
      const errorText = await apiResponse.text();
      console.error('   Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testBadgeAPI();
