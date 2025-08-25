require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPushSubscriptions() {
  try {
    console.log('🔍 Checking push subscriptions setup...\n');

    // Check 1: Verify table exists
    console.log('📋 Check 1: Verifying push_subscriptions table...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('push_subscriptions')
      .select('count')
      .limit(1);

    if (tableError) {
      console.log('❌ Table does not exist or error:', tableError.message);
      console.log('💡 Run the SQL script to create the table:');
      console.log('   scripts/create-push-subscriptions-table.sql');
      return;
    }
    console.log('✅ push_subscriptions table exists');

    // Check 2: Count total subscriptions
    console.log('\n📋 Check 2: Counting total subscriptions...');
    const { count, error: countError } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting subscriptions:', countError);
      return;
    }

    console.log(`📊 Total subscriptions: ${count}`);

    if (count === 0) {
      console.log('⚠️  No push subscriptions found in database');
      console.log('💡 Users need to activate push notifications first');
      return;
    }

    // Check 3: Get all subscriptions with user details
    console.log('\n📋 Check 3: Fetching subscription details...');
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching subscriptions:', fetchError);
      return;
    }

    console.log('\n📱 Push Subscriptions Details:');
    console.log('=====================================');
    
    subscriptions.forEach((sub, index) => {
      console.log(`\n${index + 1}. Subscription ID: ${sub.id}`);
      console.log(`   User ID: ${sub.user_id}`);
      console.log(`   User Name: ${sub.profiles?.full_name || 'Unknown'}`);
      console.log(`   User Email: ${sub.profiles?.email || 'Unknown'}`);
      console.log(`   Endpoint: ${sub.endpoint.substring(0, 50)}...`);
      console.log(`   Created: ${new Date(sub.created_at).toLocaleString()}`);
      console.log(`   Updated: ${new Date(sub.updated_at).toLocaleString()}`);
    });

    // Check 4: Test API endpoint
    console.log('\n📋 Check 4: Testing admin API endpoint...');
    const http = require('http');
    
    const testApiEndpoint = () => {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/admin/push-subscriptions',
          method: 'GET'
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
        
        req.end();
      });
    };

    try {
      const apiResult = await testApiEndpoint();
      console.log(`✅ API endpoint status: ${apiResult.status}`);
      
      if (apiResult.status === 200) {
        const apiData = JSON.parse(apiResult.data);
        console.log(`✅ API returned ${apiData.count} subscriptions`);
      } else {
        console.log('⚠️  API endpoint not responding correctly');
      }
    } catch (error) {
      console.log('⚠️  API endpoint test skipped (server might not be running)');
    }

    // Check 5: Environment variables
    console.log('\n📋 Check 5: Checking environment variables...');
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    
    if (vapidPublicKey && vapidPrivateKey) {
      console.log('✅ VAPID keys are configured');
    } else {
      console.log('❌ VAPID keys are missing');
      console.log('💡 Add VAPID keys to .env.local:');
      console.log('   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key');
      console.log('   VAPID_PRIVATE_KEY=your_private_key');
    }

    console.log('\n🎯 Summary:');
    console.log(`- Total subscriptions: ${count}`);
    console.log('- Table exists: ✅');
    console.log('- VAPID keys: ' + (vapidPublicKey && vapidPrivateKey ? '✅' : '❌'));
    
    if (count > 0) {
      console.log('\n💡 To test push notifications:');
      console.log('1. Go to /dashboard-admin/push-test');
      console.log('2. Click "Test Notificatie" button');
      console.log('3. Check if notifications are received');
    } else {
      console.log('\n💡 To get subscriptions:');
      console.log('1. Users need to install the PWA');
      console.log('2. Users need to enable push notifications');
      console.log('3. Check user profile page for push notification settings');
    }

  } catch (error) {
    console.error('❌ Error checking push subscriptions:', error);
  }
}

checkPushSubscriptions();
