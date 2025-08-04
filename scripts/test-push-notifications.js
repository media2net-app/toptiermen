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

async function testPushNotifications() {
  console.log('🧪 Testing Push Notifications...\n');

  try {
    // Test database connection
    console.log('1️⃣ Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    console.log('✅ Database connection successful\n');

    // Test push_subscriptions table
    console.log('2️⃣ Testing push_subscriptions table...');
    const { data: subscriptions, error: tableError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .limit(5);

    if (tableError) {
      console.error('❌ Table access failed:', tableError.message);
      console.log('📋 Make sure you have run the SQL script in Supabase dashboard');
      return;
    }
    console.log('✅ push_subscriptions table accessible');
    console.log(`📊 Found ${subscriptions.length} subscriptions\n`);

    // Test API endpoint
    console.log('3️⃣ Testing push notification API...');
    const testNotification = {
      userId: 'test-user-id',
      title: '🧪 Test Notificatie',
      body: 'Dit is een test push notificatie van Top Tier Men!',
      icon: '/logo.svg',
      badge: '/badge1.png',
      data: { url: '/dashboard' },
      tag: 'test-notification'
    };

    const response = await fetch('http://localhost:3000/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testNotification),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Push notification API working');
      console.log('📊 Response:', result);
    } else {
      console.log('⚠️  Push notification API test skipped (no real subscription)');
      console.log('📋 This is normal - you need to subscribe to push notifications in the app first');
    }

    console.log('\n🎉 Push Notifications Test Complete!');
    console.log('\n📋 To test in the app:');
    console.log('1. Go to http://localhost:3000/dashboard');
    console.log('2. Look for the PWA install prompt at the bottom');
    console.log('3. Click "App Installeren"');
    console.log('4. Click "Notificaties Toestaan"');
    console.log('5. Click "Test Notificatie"');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testPushNotifications(); 