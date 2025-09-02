const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkNotificationDetails() {
  console.log('🔍 Checking Notification Details\n');

  try {
    // 1. Check all notifications
    console.log('1️⃣ All notifications in database:');
    const { data: notifications, error: notifError } = await supabase
      .from('bug_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (notifError) {
      console.error('❌ Error fetching notifications:', notifError);
      return;
    }

    notifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ID: ${notif.id}`);
      console.log(`      Type: ${notif.type}`);
      console.log(`      Title: ${notif.title}`);
      console.log(`      Message: ${notif.message}`);
      console.log(`      User ID: ${notif.user_id}`);
      console.log(`      Bug Report ID: ${notif.bug_report_id}`);
      console.log(`      Metadata:`, JSON.stringify(notif.metadata, null, 2));
      console.log(`      Created: ${notif.created_at}`);
      console.log(`      Read: ${notif.is_read}`);
      console.log('');
    });

    // 2. Check the specific bug report that was closed
    console.log('2️⃣ Checking the closed bug report:');
    const { data: closedBug, error: bugError } = await supabase
      .from('test_notes')
      .select('*')
      .eq('status', 'closed')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (bugError) {
      console.error('❌ Error fetching closed bug:', bugError);
      return;
    }

    if (closedBug && closedBug.length > 0) {
      const bug = closedBug[0];
      console.log(`   Bug ID: ${bug.id}`);
      console.log(`   Description: ${bug.description}`);
      console.log(`   Status: ${bug.status}`);
      console.log(`   User ID: ${bug.test_user_id}`);
      console.log(`   Created: ${bug.created_at}`);
      console.log(`   Updated: ${bug.updated_at}`);
      console.log('');
    }

    // 3. Check if there's a notification for this specific bug
    if (closedBug && closedBug.length > 0) {
      const bugId = closedBug[0].id;
      console.log('3️⃣ Checking if notification exists for this bug:');
      
      const { data: bugNotification, error: bugNotifError } = await supabase
        .from('bug_notifications')
        .select('*')
        .eq('bug_report_id', bugId);

      if (bugNotifError) {
        console.error('❌ Error fetching bug notification:', bugNotifError);
        return;
      }

      if (bugNotification && bugNotification.length > 0) {
        console.log(`   ✅ Found ${bugNotification.length} notification(s) for this bug:`);
        bugNotification.forEach((notif, index) => {
          console.log(`      ${index + 1}. ${notif.title} - ${notif.type}`);
          console.log(`         Message: ${notif.message}`);
          console.log(`         Metadata:`, JSON.stringify(notif.metadata, null, 2));
        });
      } else {
        console.log('   ❌ No notifications found for this bug report');
      }
    }

    // 4. Check the user ID for Chiel
    console.log('\n4️⃣ Checking user ID for Chiel:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .ilike('email', '%chiel%')
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (users && users.length > 0) {
      console.log('   Found users:');
      users.forEach((user, index) => {
        console.log(`      ${index + 1}. ${user.full_name} (${user.email}) - ID: ${user.id}`);
      });
    } else {
      console.log('   No users found with email containing "chiel"');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkNotificationDetails();
