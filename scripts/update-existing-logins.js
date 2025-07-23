const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateExistingLogins() {
  console.log('🚀 Updating existing users with sample last login times...');

  try {
    // Get all users
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, created_at, last_login');

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      return;
    }

    console.log(`📋 Found ${users?.length || 0} users`);

    // Update each user with a realistic last login time
    for (const user of users || []) {
      // Generate a random last login time within the last 30 days
      const now = new Date();
      const daysAgo = Math.floor(Math.random() * 30) + 1; // 1-30 days ago
      const hoursAgo = Math.floor(Math.random() * 24); // 0-23 hours ago
      const minutesAgo = Math.floor(Math.random() * 60); // 0-59 minutes ago
      
      const lastLogin = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));

      const { error: updateError } = await supabase
        .from('users')
        .update({ last_login: lastLogin.toISOString() })
        .eq('id', user.id);

      if (updateError) {
        console.error(`❌ Error updating ${user.email}:`, updateError);
      } else {
        console.log(`✅ Updated ${user.email}: last_login = ${lastLogin.toISOString()}`);
      }
    }

    console.log('🎉 Successfully updated all users with sample last login times!');

    // Show the results
    const { data: updatedUsers, error: showError } = await supabase
      .from('users')
      .select('email, status, last_login, created_at')
      .order('last_login', { ascending: false });

    if (showError) {
      console.error('❌ Error fetching updated users:', showError);
      return;
    }

    console.log('\n📊 Updated users:');
    updatedUsers?.forEach(user => {
      const lastLoginDate = user.last_login ? new Date(user.last_login).toLocaleDateString('nl-NL') : 'never';
      console.log(`   - ${user.email}: status=${user.status}, last_login=${lastLoginDate}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateExistingLogins(); 