require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const webpush = require('web-push');

// Database connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configure web-push with VAPID keys only if they exist
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:info@toptiermen.com',
    vapidPublicKey,
    vapidPrivateKey
  );
} else {
  console.log('⚠️  VAPID keys not configured - push notifications will not work');
}

async function testCompletePushNotification() {
  console.log('🚀 Testing Complete Push Notification Flow...\n');

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

    // Create a realistic push subscription (simulating browser subscription)
    console.log('\n2️⃣ Creating realistic push subscription...');
    
    const realisticSubscription = {
      user_id: testUser.id,
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-123',
      p256dh_key: 'BGUWcqcl-Mw04NY1pHISbAv4hSLa6oUODKnsEe-IKZzRrIJPal5ynP26WjTqvj_C_VfxlY4jkceBQNs0vxkS4tk',
      auth_key: 'test-auth-key-realistic'
    };

    const { error: insertError } = await supabase
      .from('push_subscriptions')
      .upsert(realisticSubscription, { onConflict: 'user_id' });

    if (insertError) {
      console.log('⚠️  Subscription insert failed:', insertError.message);
    } else {
      console.log('✅ Realistic subscription created');
    }

    // Test push notification API
    console.log('\n3️⃣ Testing push notification API...');
    
    const testNotification = {
      userId: testUser.id,
      title: "🎉 Test Push Notificatie!",
      body: "Dit is een test push notificatie van Top Tier Men!",
              icon: "/logo_white-full.svg",
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
      
      // Try direct web-push test
      console.log('\n4️⃣ Testing direct web-push...');
      try {
        const pushSubscription = {
          endpoint: realisticSubscription.endpoint,
          keys: {
            p256dh: realisticSubscription.p256dh_key,
            auth: realisticSubscription.auth_key
          }
        };

        const payload = {
          title: "🎉 Direct Test!",
          body: "Direct web-push test",
          icon: "/logo_white-full.svg",
          data: { url: "/dashboard" }
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(payload)
        );
        
        console.log('✅ Direct web-push test successful!');
      } catch (webpushError) {
        console.log('❌ Direct web-push test failed:', webpushError.message);
      }
    }

    // Show current subscriptions
    console.log('\n5️⃣ Current push subscriptions:');
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (subsError) {
      console.log('❌ Error getting subscriptions:', subsError.message);
    } else {
      console.log('📊 Found', subscriptions.length, 'subscriptions:');
      subscriptions.forEach(sub => {
        console.log(`   - User: ${sub.user_id}, Endpoint: ${sub.endpoint.substring(0, 50)}...`);
      });
    }

    console.log('\n🎉 Complete Push Notification Test Finished!');
    console.log('\n📋 Next Steps for Real Testing:');
    console.log('1. Open http://localhost:3000 in browser');
    console.log('2. Log in with a real account');
    console.log('3. Look for PWA install prompt at bottom of dashboard');
    console.log('4. Click "Enable Push Notifications"');
    console.log('5. Allow notifications when browser prompts');
    console.log('6. Test sending real notifications');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testCompletePushNotification(); 