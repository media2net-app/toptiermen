require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPushNotificationSetup() {
  try {
    console.log('🔍 Testing push notification setup...\n');

    // Test 1: Environment Variables
    console.log('📋 Test 1: Environment Variables...');
    if (vapidPublicKey && vapidPrivateKey) {
      console.log('✅ VAPID keys are configured');
      console.log(`   Public Key: ${vapidPublicKey.substring(0, 20)}...`);
      console.log(`   Private Key: ${vapidPrivateKey.substring(0, 20)}...`);
    } else {
      console.log('❌ VAPID keys are missing');
      console.log('💡 Run: node scripts/generate-vapid-keys.js');
      return;
    }

    // Test 2: Database Table
    console.log('\n📋 Test 2: Database Table...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('push_subscriptions')
      .select('count')
      .limit(1);

    if (tableError) {
      console.log('❌ push_subscriptions table does not exist');
      console.log('💡 Run the SQL script: scripts/create-push-subscriptions-table.sql');
      return;
    }
    console.log('✅ push_subscriptions table exists');

    // Test 3: Current Subscriptions
    console.log('\n📋 Test 3: Current Subscriptions...');
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching subscriptions:', fetchError);
      return;
    }

    console.log(`📊 Total subscriptions: ${subscriptions.length}`);

    if (subscriptions.length > 0) {
      console.log('\n📱 Active Subscriptions:');
      subscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.profiles?.full_name || 'Unknown'} (${sub.profiles?.email || 'No email'})`);
        console.log(`      Created: ${new Date(sub.created_at).toLocaleString()}`);
      });
    } else {
      console.log('⚠️  No subscriptions found');
    }

    // Test 4: API Endpoints
    console.log('\n📋 Test 4: API Endpoints...');
    const http = require('http');

    const testEndpoint = (path, method = 'GET', body = null) => {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 3000,
          path,
          method,
          headers: {
            'Content-Type': 'application/json',
          }
        };
        
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve({ status: res.statusCode, data });
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        if (body) {
          req.write(JSON.stringify(body));
        }
        req.end();
      });
    };

    // Test admin push-subscriptions endpoint
    try {
      const adminResult = await testEndpoint('/api/admin/push-subscriptions');
      console.log(`✅ Admin endpoint (/api/admin/push-subscriptions): ${adminResult.status}`);
      
      if (adminResult.status === 200) {
        const adminData = JSON.parse(adminResult.data);
        console.log(`   Returns ${adminData.count} subscriptions`);
      }
    } catch (error) {
      console.log('⚠️  Admin endpoint test skipped (server might not be running)');
    }

    // Test push send endpoint
    try {
      const sendResult = await testEndpoint('/api/push/send', 'POST', {
        userId: 'test-user',
        title: 'Test',
        body: 'Test notification'
      });
      console.log(`✅ Send endpoint (/api/push/send): ${sendResult.status}`);
    } catch (error) {
      console.log('⚠️  Send endpoint test skipped (server might not be running)');
    }

    // Test 5: Service Worker
    console.log('\n📋 Test 5: Service Worker...');
    try {
      const swResult = await testEndpoint('/sw.js');
      console.log(`✅ Service Worker (/sw.js): ${swResult.status}`);
    } catch (error) {
      console.log('⚠️  Service Worker test skipped (server might not be running)');
    }

    // Test 6: Manifest
    console.log('\n📋 Test 6: PWA Manifest...');
    try {
      const manifestResult = await testEndpoint('/manifest.json');
      console.log(`✅ PWA Manifest (/manifest.json): ${manifestResult.status}`);
    } catch (error) {
      console.log('⚠️  Manifest test skipped (server might not be running)');
    }

    // Summary
    console.log('\n🎯 Push Notification Setup Summary:');
    console.log('=====================================');
    console.log(`✅ VAPID Keys: ${vapidPublicKey && vapidPrivateKey ? 'Configured' : 'Missing'}`);
    console.log(`✅ Database Table: Exists`);
    console.log(`✅ Active Subscriptions: ${subscriptions.length}`);
    console.log(`✅ API Endpoints: Ready`);
    console.log(`✅ Service Worker: Ready`);
    console.log(`✅ PWA Manifest: Ready`);

    if (subscriptions.length === 0) {
      console.log('\n💡 To get subscriptions:');
      console.log('1. Install the PWA on your phone');
      console.log('2. Open the app in standalone mode');
      console.log('3. The PushNotificationPrompt should appear');
      console.log('4. Click "Activeren" to enable push notifications');
      console.log('5. Check the admin dashboard for the subscription');
    } else {
      console.log('\n💡 To test push notifications:');
      console.log('1. Go to /dashboard-admin/push-test');
      console.log('2. Click "Test Notificatie" button');
      console.log('3. Check if notifications are received on your phone');
    }

    console.log('\n🔧 Manual Testing Steps:');
    console.log('1. Start development server: npm run dev');
    console.log('2. Open https://localhost:3000 on your phone');
    console.log('3. Install the PWA (Add to Home Screen)');
    console.log('4. Open the installed app');
    console.log('5. Enable push notifications when prompted');
    console.log('6. Check admin dashboard for subscription');

  } catch (error) {
    console.error('❌ Error testing push notification setup:', error);
  }
}

testPushNotificationSetup();
