require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Database connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPushNotification() {
  console.log('🚀 Testing Push Notification Send...\n');

  try {
    // Get a valid user ID
    console.log('1️⃣ Getting a valid user ID...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(1);

    if (usersError) {
      console.error('❌ Error getting users:', usersError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️  No users found in profiles table');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Found user: ${testUser.full_name} (${testUser.email})`);

    // Test push notification API
    console.log('\n2️⃣ Testing push notification API...');
    
    const testNotification = {
      userId: testUser.id,
      title: "🎉 Test Push Notificatie!",
      body: "Dit is een test push notificatie van Top Tier Men!",
      icon: "/logo.svg",
      badge: "/badge-no-excuses.png",
      data: { 
        url: "/dashboard",
        timestamp: new Date().toISOString()
      }
    };

    console.log('📋 Sending test notification:', testNotification);

    // Send via API
    const response = await fetch('http://localhost:3000/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testNotification)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Push notification sent successfully!');
      console.log('📊 Response:', result);
    } else {
      console.log('❌ Push notification failed:', result.error);
    }

    // Also test direct database insert
    console.log('\n3️⃣ Testing direct database insert...');
    
    const testSubscription = {
      user_id: testUser.id,
      endpoint: 'https://test.endpoint.com',
      p256dh_key: 'test-p256dh-key',
      auth_key: 'test-auth-key'
    };

    const { error: insertError } = await supabase
      .from('push_subscriptions')
      .upsert(testSubscription, { onConflict: 'user_id' });

    if (insertError) {
      console.log('⚠️  Direct insert failed (expected if no real subscription):', insertError.message);
    } else {
      console.log('✅ Test subscription inserted');
    }

    console.log('\n🎉 Push Notification Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open the app in browser');
    console.log('2. Allow push notifications when prompted');
    console.log('3. Test the PWA install prompt');
    console.log('4. Try sending a real notification');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testPushNotification(); 