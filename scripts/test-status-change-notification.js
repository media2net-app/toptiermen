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

async function testStatusChangeNotification() {
  console.log('🧪 Testing Status Change Notification\n');

  try {
    // 1. Find the closed bug that doesn't have a notification
    console.log('1️⃣ Finding bug without notification...');
    const { data: closedBug, error: bugError } = await supabase
      .from('test_notes')
      .select('*')
      .eq('status', 'closed')
      .eq('test_user_id', '061e43d5-c89a-42bb-8a4c-04be2ce99a7e')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (bugError) {
      console.error('❌ Error fetching closed bug:', bugError);
      return;
    }

    if (!closedBug || closedBug.length === 0) {
      console.log('❌ No closed bugs found for this user');
      return;
    }

    const bug = closedBug[0];
    console.log(`   Found bug: ${bug.description} (ID: ${bug.id})`);
    console.log(`   Status: ${bug.status}, User: ${bug.test_user_id}`);

    // 2. Check if notification already exists
    console.log('\n2️⃣ Checking existing notifications...');
    const { data: existingNotifications, error: notifError } = await supabase
      .from('bug_notifications')
      .select('*')
      .eq('bug_report_id', bug.id);

    if (notifError) {
      console.error('❌ Error checking notifications:', notifError);
      return;
    }

    if (existingNotifications && existingNotifications.length > 0) {
      console.log(`   ✅ Bug already has ${existingNotifications.length} notification(s):`);
      existingNotifications.forEach((notif, index) => {
        console.log(`      ${index + 1}. ${notif.title} - ${notif.type}`);
      });
      return;
    }

    console.log('   ❌ No notifications found for this bug');

    // 3. Create a notification manually to test
    console.log('\n3️⃣ Creating test notification manually...');
    const testNotification = {
      user_id: bug.test_user_id,
      bug_report_id: bug.id,
      type: 'status_update',
      title: 'Bug Melding Afgesloten',
      message: `Je bug melding "${bug.description.substring(0, 100)}${bug.description.length > 100 ? '...' : ''}" is afgesloten. Als je nog vragen hebt, neem dan contact met ons op.`,
      metadata: {
        old_status: 'open',
        new_status: 'closed',
        page_url: bug.page_url || '/dashboard',
        element_selector: bug.element_selector,
        priority: bug.priority || 'medium',
        sent_at: new Date().toISOString()
      },
      is_read: false
    };

    const { data: newNotification, error: createError } = await supabase
      .from('bug_notifications')
      .insert([testNotification])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating notification:', createError);
      return;
    }

    console.log('   ✅ Test notification created successfully!');
    console.log(`      ID: ${newNotification.id}`);
    console.log(`      Title: ${newNotification.title}`);
    console.log(`      Type: ${newNotification.type}`);

    // 4. Verify the notification was created
    console.log('\n4️⃣ Verifying notification...');
    const { data: verifyNotification, error: verifyError } = await supabase
      .from('bug_notifications')
      .select('*')
      .eq('id', newNotification.id);

    if (verifyError) {
      console.error('❌ Error verifying notification:', verifyError);
      return;
    }

    if (verifyNotification && verifyNotification.length > 0) {
      console.log('   ✅ Notification verified in database');
      console.log(`      User ID: ${verifyNotification[0].user_id}`);
      console.log(`      Bug Report ID: ${verifyNotification[0].bug_report_id}`);
      console.log(`      Metadata:`, JSON.stringify(verifyNotification[0].metadata, null, 2));
    }

    console.log('\n🎯 Summary:');
    console.log('   - Bug found: ✅');
    console.log('   - Notification created: ✅');
    console.log('   - Database verification: ✅');
    console.log('\n🚀 Next steps:');
    console.log('   1. Check the notifications page as Chiel');
    console.log('   2. Verify the notification appears in the UI');
    console.log('   3. Test marking it as read');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testStatusChangeNotification();
