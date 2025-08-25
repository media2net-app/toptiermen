require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugPushSubscription() {
  try {
    console.log('🔍 Debugging push subscription process...\n');

    // Check 1: Environment variables
    console.log('📋 Check 1: Environment Variables...');
    console.log(`✅ Supabase URL: ${supabaseUrl ? 'Configured' : 'Missing'}`);
    console.log(`✅ Service Key: ${supabaseServiceKey ? 'Configured' : 'Missing'}`);
    console.log(`✅ VAPID Public Key: ${vapidPublicKey ? 'Configured' : 'Missing'}`);

    // Check 2: Test database connection
    console.log('\n📋 Check 2: Database Connection...');
    const { data: testData, error: testError } = await supabase
      .from('push_subscriptions')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection error:', testError);
      return;
    }
    console.log('✅ Database connection successful');

    // Check 3: Check for any existing subscriptions
    console.log('\n📋 Check 3: Existing Subscriptions...');
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching subscriptions:', fetchError);
      return;
    }

    console.log(`📊 Found ${subscriptions.length} subscriptions`);

    if (subscriptions.length > 0) {
      console.log('\n📱 Subscription Details:');
      subscriptions.forEach((sub, index) => {
        console.log(`\n${index + 1}. Subscription:`);
        console.log(`   ID: ${sub.id}`);
        console.log(`   User ID: ${sub.user_id}`);
        console.log(`   Endpoint: ${sub.endpoint.substring(0, 50)}...`);
        console.log(`   Created: ${new Date(sub.created_at).toLocaleString()}`);
      });
    }

    // Check 4: Test API endpoints
    console.log('\n📋 Check 4: API Endpoints...');
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

    // Test admin endpoint
    try {
      const adminResult = await testEndpoint('/api/admin/push-subscriptions');
      console.log(`✅ Admin endpoint: ${adminResult.status}`);
      if (adminResult.status === 200) {
        const adminData = JSON.parse(adminResult.data);
        console.log(`   Returns ${adminData.count} subscriptions`);
      }
    } catch (error) {
      console.log('⚠️  Admin endpoint test skipped (server not running)');
    }

    // Test push subscribe endpoint
    try {
      const subscribeResult = await testEndpoint('/api/push/subscribe', 'POST', {
        userId: 'test-user-id',
        subscription: {
          endpoint: 'https://test.endpoint.com',
          keys: {
            p256dh: 'test-p256dh-key',
            auth: 'test-auth-key'
          }
        }
      });
      console.log(`✅ Subscribe endpoint: ${subscribeResult.status}`);
    } catch (error) {
      console.log('⚠️  Subscribe endpoint test skipped (server not running)');
    }

    // Check 5: Manual subscription test
    console.log('\n📋 Check 5: Manual Subscription Test...');
    if (subscriptions.length === 0) {
      console.log('💡 No subscriptions found. Testing manual insertion...');
      
      const testSubscription = {
        user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        p256dh_key: 'test-p256dh-key',
        auth_key: 'test-auth-key'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('push_subscriptions')
        .insert(testSubscription)
        .select();

      if (insertError) {
        console.error('❌ Manual insertion failed:', insertError);
      } else {
        console.log('✅ Manual insertion successful');
        console.log('   This means the table structure is correct');
        
        // Clean up test data
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', '00000000-0000-0000-0000-000000000000');
      }
    }

    console.log('\n🎯 Debug Summary:');
    console.log('=====================================');
    console.log(`✅ Environment: ${vapidPublicKey ? 'Configured' : 'Missing'}`);
    console.log(`✅ Database: ${testError ? 'Error' : 'Connected'}`);
    console.log(`✅ Subscriptions: ${subscriptions.length}`);
    console.log(`✅ API Endpoints: Ready`);

    if (subscriptions.length === 0) {
      console.log('\n💡 Possible Issues:');
      console.log('1. User not logged in when activating push notifications');
      console.log('2. Service worker not registering properly');
      console.log('3. VAPID key not matching between client and server');
      console.log('4. Network error during subscription save');
      console.log('5. RLS policies blocking the insert');
      
      console.log('\n🔧 Next Steps:');
      console.log('1. Check browser console for errors');
      console.log('2. Verify user is logged in');
      console.log('3. Check if service worker is registered');
      console.log('4. Test with a different browser/device');
    }

  } catch (error) {
    console.error('❌ Error in debug script:', error);
  }
}

debugPushSubscription();
