const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testOnlineStatus() {
  console.log('🧪 Testing online status functionality...\n');

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`📊 Found ${users.users?.length || 0} users`);

    if (users.users && users.users.length > 0) {
      const testUser = users.users[0];
      console.log(`🧪 Testing with user: ${testUser.id}`);

      // Test marking user online
      console.log('\n🟢 Testing mark_user_online...');
      const { error: onlineError } = await supabase.rpc('mark_user_online', {}, {
        headers: {
          'Authorization': `Bearer ${testUser.id}`
        }
      });

      if (onlineError) {
        console.error('❌ Error marking user online:', onlineError);
      } else {
        console.log('✅ User marked as online');
      }

      // Check current presence status
      console.log('\n📊 Checking current presence status...');
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('*')
        .eq('user_id', testUser.id);

      if (presenceError) {
        console.error('❌ Error fetching presence:', presenceError);
      } else {
        console.log('📋 Current presence data:', presenceData);
      }

      // Test marking user offline
      console.log('\n🔴 Testing mark_user_offline...');
      const { error: offlineError } = await supabase.rpc('mark_user_offline', {}, {
        headers: {
          'Authorization': `Bearer ${testUser.id}`
        }
      });

      if (offlineError) {
        console.error('❌ Error marking user offline:', offlineError);
      } else {
        console.log('✅ User marked as offline');
      }

      // Check final presence status
      console.log('\n📊 Checking final presence status...');
      const { data: finalPresence, error: finalError } = await supabase
        .from('user_presence')
        .select('*')
        .eq('user_id', testUser.id);

      if (finalError) {
        console.error('❌ Error fetching final presence:', finalError);
      } else {
        console.log('📋 Final presence data:', finalPresence);
      }

      // Test API endpoint
      console.log('\n🌐 Testing API endpoint...');
      const response = await fetch('http://localhost:3000/api/members-data');
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API returned ${data.members?.length || 0} members`);
        
        const onlineMembers = data.members?.filter(m => m.is_online) || [];
        console.log(`🟢 Online members: ${onlineMembers.length}`);
        
        onlineMembers.forEach(member => {
          console.log(`  - ${member.display_name || member.full_name}: ${member.is_online ? '🟢 Online' : '🔴 Offline'}`);
        });
      } else {
        console.error('❌ API request failed:', response.status);
      }
    }

    console.log('\n✅ Online status test complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testOnlineStatus(); 