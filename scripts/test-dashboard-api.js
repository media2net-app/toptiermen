const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDashboardAPI() {
  console.log('🧪 Testing Dashboard API...\n');

  try {
    // 1. Get a test user
    console.log('1️⃣ Getting test user...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(1);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ No users found in database');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Using test user: ${testUser.email} (${testUser.id})`);

    // 2. Test the dashboard API endpoint directly
    console.log('\n2️⃣ Testing dashboard API endpoint...');
    
    const response = await fetch('http://localhost:3000/api/dashboard-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUser.id
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dashboard API response successful');
      console.log('📊 Stats received:', {
        missions: data.stats?.missions,
        challenges: data.stats?.challenges,
        training: data.stats?.training,
        academy: data.stats?.academy,
        xp: data.stats?.xp,
        userBadges: data.userBadges?.length || 0
      });
    } else {
      console.error('❌ Dashboard API failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }

    // 3. Test individual queries that might be slow
    console.log('\n3️⃣ Testing potentially slow queries...');
    
    const startTime = Date.now();
    
    // Test academy stats query (this was the most complex one)
    const { data: modules, error: modulesError } = await supabase
      .from('academy_modules')
      .select('id, title')
      .eq('status', 'published')
      .order('order_index');

    if (modulesError) {
      console.error('❌ Academy modules query failed:', modulesError);
    } else {
      console.log(`✅ Academy modules query: ${modules?.length || 0} modules in ${Date.now() - startTime}ms`);
    }

    // Test user badges query (this has a complex join)
    const badgesStartTime = Date.now();
    const { data: userBadges, error: badgesError } = await supabase
      .from('user_badges')
      .select(`
        id,
        badge_id,
        unlocked_at,
        badges (
          id,
          title,
          description,
          icon_name,
          image_url,
          rarity_level,
          xp_reward
        )
      `)
      .eq('user_id', testUser.id)
      .order('unlocked_at', { ascending: false });

    if (badgesError) {
      console.error('❌ User badges query failed:', badgesError);
    } else {
      console.log(`✅ User badges query: ${userBadges?.length || 0} badges in ${Date.now() - badgesStartTime}ms`);
    }

    // Test brotherhood stats query (this counts all users)
    const brotherhoodStartTime = Date.now();
    const { count: totalUsers, error: usersCountError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersCountError) {
      console.error('❌ Total users query failed:', usersCountError);
    } else {
      console.log(`✅ Total users query: ${totalUsers || 0} users in ${Date.now() - brotherhoodStartTime}ms`);
    }

    console.log('\n🎯 Dashboard API test complete!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDashboardAPI();
