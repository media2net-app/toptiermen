const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function markMultipleOnline() {
  console.log('🟢 Marking multiple users as online...\n');

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (users.users && users.users.length > 0) {
      // Mark first 3 users as online
      const usersToMarkOnline = users.users.slice(0, 3);
      
      for (const user of usersToMarkOnline) {
        console.log(`👤 Marking user ${user.id} as online...`);

        const { data, error } = await supabase
          .from('user_presence')
          .update({
            is_online: true,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select();

        if (error) {
          console.error(`❌ Error marking user ${user.id} online:`, error);
        } else {
          console.log(`✅ User ${user.id} marked as online`);
        }
      }

      // Test the API to see online users
      console.log('\n🌐 Testing API...');
      const response = await fetch('http://localhost:3000/api/members-data');
      if (response.ok) {
        const data = await response.json();
        const onlineMembers = data.members?.filter(m => m.is_online) || [];
        console.log(`🟢 Online members: ${onlineMembers.length}`);
        
        onlineMembers.forEach(member => {
          console.log(`  - ${member.display_name || member.full_name}: ${member.is_online ? '🟢 Online' : '🔴 Offline'}`);
        });

        const offlineMembers = data.members?.filter(m => !m.is_online) || [];
        console.log(`🔴 Offline members: ${offlineMembers.length}`);
        
        offlineMembers.forEach(member => {
          console.log(`  - ${member.display_name || member.full_name}: ${member.is_online ? '🟢 Online' : '🔴 Offline'}`);
        });
      } else {
        console.error('❌ API request failed:', response.status);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

markMultipleOnline(); 