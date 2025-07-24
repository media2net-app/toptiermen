const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateOnlineStatus() {
  console.log('🔄 Updating online status for members...\n');

  try {
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`📊 Found ${profiles.length} profiles to update`);

    // Update last_login for some members to make them appear online
    const now = new Date();
    const updates = [];

    // Make some members recently online (within 10 minutes)
    const onlineMembers = profiles.slice(0, 3); // First 3 members
    for (const member of onlineMembers) {
      const randomMinutesAgo = Math.floor(Math.random() * 8) + 1; // 1-8 minutes ago
      const lastLogin = new Date(now.getTime() - (randomMinutesAgo * 60 * 1000));
      
      updates.push({
        id: member.id,
        last_login: lastLogin.toISOString()
      });
    }

    // Make some members offline (more than 10 minutes ago)
    const offlineMembers = profiles.slice(3); // Rest of the members
    for (const member of offlineMembers) {
      const randomHoursAgo = Math.floor(Math.random() * 24) + 1; // 1-24 hours ago
      const lastLogin = new Date(now.getTime() - (randomHoursAgo * 60 * 60 * 1000));
      
      updates.push({
        id: member.id,
        last_login: lastLogin.toISOString()
      });
    }

    // Update all profiles
    for (const update of updates) {
      const { error } = await supabase
        .from('profiles')
        .update({ last_login: update.last_login })
        .eq('id', update.id);

      if (error) {
        console.error(`❌ Error updating ${update.id}:`, error);
      } else {
        const member = profiles.find(p => p.id === update.id);
        const isOnline = new Date(update.last_login) > new Date(now.getTime() - (10 * 60 * 1000));
        console.log(`✅ Updated ${member?.full_name || update.id}: ${isOnline ? '🟢 Online' : '🔴 Offline'} (${update.last_login})`);
      }
    }

    console.log('\n✅ Online status update complete!');
    console.log('🟢 Online members should now show green dots');
    console.log('🔴 Offline members should not show green dots');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateOnlineStatus(); 