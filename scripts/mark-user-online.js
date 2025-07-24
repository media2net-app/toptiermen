const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function markUserOnline() {
  console.log('🟢 Marking user as online...\n');

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (users.users && users.users.length > 0) {
      const testUser = users.users[0];
      console.log(`👤 Marking user ${testUser.id} as online...`);

      // Update user presence directly
      const { data, error } = await supabase
        .from('user_presence')
        .update({
          is_online: true,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', testUser.id)
        .select();

      if (error) {
        console.error('❌ Error marking user online:', error);
      } else {
        console.log('✅ User marked as online:', data);
      }

      // Test the API to see if the user appears online
      console.log('\n🌐 Testing API...');
      const response = await fetch('http://localhost:3000/api/members-data');
      if (response.ok) {
        const data = await response.json();
        const onlineMembers = data.members?.filter(m => m.is_online) || [];
        console.log(`🟢 Online members: ${onlineMembers.length}`);
        
        onlineMembers.forEach(member => {
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

markUserOnline(); 