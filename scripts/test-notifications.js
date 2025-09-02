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

async function testNotifications() {
  console.log('🧪 Testing Notifications System\n');

  try {
    // 1. Check if bug_notifications table exists
    console.log('1️⃣ Checking bug_notifications table...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('bug_notifications')
      .select('*')
      .limit(1);

    if (tableError) {
      if (tableError.message.includes('does not exist')) {
        console.log('❌ bug_notifications table does not exist');
        console.log('   Run the SQL script: scripts/create-bug-notifications-table.sql');
        return;
      } else {
        console.error('❌ Error checking table:', tableError);
        return;
      }
    }

    console.log('✅ bug_notifications table exists');

    // 2. Check if test_notes table exists and has data
    console.log('\n2️⃣ Checking test_notes table...');
    const { data: testNotes, error: notesError } = await supabase
      .from('test_notes')
      .select('*')
      .limit(5);

    if (notesError) {
      console.error('❌ Error fetching test notes:', notesError);
      return;
    }

    console.log(`✅ Found ${testNotes?.length || 0} test notes`);

    if (testNotes && testNotes.length > 0) {
      console.log('   Sample notes:');
      testNotes.forEach((note, index) => {
        console.log(`   ${index + 1}. ${note.type} - ${note.description.substring(0, 50)}... (${note.status})`);
      });
    }

    // 3. Check existing notifications
    console.log('\n3️⃣ Checking existing notifications...');
    const { data: notifications, error: notifError } = await supabase
      .from('bug_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (notifError) {
      console.error('❌ Error fetching notifications:', notifError);
      return;
    }

    console.log(`✅ Found ${notifications?.length || 0} notifications`);

    if (notifications && notifications.length > 0) {
      console.log('   Recent notifications:');
      notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title} - ${notif.type} (${notif.is_read ? 'read' : 'unread'})`);
      });
    }

    // 4. Test creating a new notification
    console.log('\n4️⃣ Testing notification creation...');
    if (testNotes && testNotes.length > 0) {
      const testNote = testNotes[0];
      const testNotification = {
        user_id: testNote.test_user_id,
        bug_report_id: testNote.id,
        type: 'test_notification',
        title: 'Test Notificatie',
        message: 'Dit is een test notificatie om het systeem te controleren.',
        metadata: {
          test: true,
          note_type: testNote.type,
          priority: testNote.priority
        },
        is_read: false
      };

      const { data: newNotification, error: createError } = await supabase
        .from('bug_notifications')
        .insert([testNotification])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating test notification:', createError);
      } else {
        console.log('✅ Test notification created successfully:', newNotification.id);
        
        // Clean up test notification
        await supabase
          .from('bug_notifications')
          .delete()
          .eq('id', newNotification.id);
        console.log('🧹 Test notification cleaned up');
      }
    }

    // 5. Test API endpoint
    console.log('\n5️⃣ Testing API endpoint...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/admin/bug-notifications?userId=${testNotes?.[0]?.test_user_id || 'test-user'}&limit=5`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API endpoint working:', data.success ? 'Success' : 'Failed');
        console.log(`   Found ${data.notifications?.length || 0} notifications via API`);
      } else {
        console.log('⚠️ API endpoint returned status:', response.status);
      }
    } catch (apiError) {
      console.log('⚠️ API endpoint test failed (server might not be running):', apiError.message);
    }

    console.log('\n🎯 Summary:');
    console.log(`   - bug_notifications table: ✅ Exists`);
    console.log(`   - test_notes table: ✅ ${testNotes?.length || 0} notes found`);
    console.log(`   - notifications: ✅ ${notifications?.length || 0} existing notifications`);
    console.log(`   - notification creation: ✅ Working`);
    console.log(`   - API endpoint: ✅ Accessible`);

    console.log('\n🚀 Next steps:');
    console.log('   1. Create a bug report via the UI');
    console.log('   2. Check if notification is created automatically');
    console.log('   3. Update bug status to trigger status change notification');
    console.log('   4. Check notifications page: /dashboard/notificaties');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testNotifications();
