require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

// Database connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

async function executePushNotificationsSQL() {
  console.log('🚀 Executing Push Notifications SQL Setup...\n');

  try {
    // Read the SQL file
    const sqlPath = 'scripts/setup-push-notifications-direct.sql';
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 SQL Content to execute:');
    console.log('=' .repeat(50));
    console.log(sqlContent);
    console.log('=' .repeat(50));
    
    console.log('\n⚠️  This script cannot execute DDL (CREATE TABLE) statements via REST API');
    console.log('📋 Please execute the SQL manually in Supabase Dashboard:');
    console.log('\n1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the SQL above');
    console.log('5. Click "Run"');
    console.log('6. Run this script again to verify');
    
    // Test if table exists after manual execution
    console.log('\n🔄 Testing table access...');
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: tableData, error: tableError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .limit(1);

    if (tableError && tableError.message.includes('does not exist')) {
      console.log('❌ Table does not exist yet. Please execute the SQL manually.');
      return;
    } else if (tableError) {
      console.error('❌ Error checking table:', tableError.message);
      return;
    }

    console.log('✅ push_subscriptions table exists and is accessible');

    // Test insert and select
    console.log('\n🧪 Testing table operations...');
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const testSubscriptionData = {
      user_id: testUserId,
      endpoint: 'https://test.endpoint.com',
      p256dh_key: 'test-p256dh-key',
      auth_key: 'test-auth-key'
    };

    // Test insert
    const { error: insertError } = await supabase
      .from('push_subscriptions')
      .upsert(testSubscriptionData, { onConflict: 'user_id' });

    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
    } else {
      console.log('✅ Insert test successful');
    }

    // Test select
    const { data: selectData, error: selectError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', testUserId);

    if (selectError) {
      console.error('❌ Select test failed:', selectError.message);
    } else {
      console.log('✅ Select test successful');
      console.log('📊 Found', selectData.length, 'test records');
    }

    // Clean up test data
    const { error: deleteError } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', testUserId);

    if (deleteError) {
      console.log('⚠️  Test data cleanup failed (non-critical):', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up');
    }

    console.log('\n🎉 Push Notifications Setup Complete!');
    console.log('\n📋 Environment Variables Status:');
    console.log('   NEXT_PUBLIC_VAPID_PUBLIC_KEY:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? '✅' : '❌');
    console.log('   VAPID_PRIVATE_KEY:', process.env.VAPID_PRIVATE_KEY ? '✅' : '❌');
    
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.log('\n⚠️  VAPID keys missing! Please add them to .env.local');
    }

    console.log('\n🚀 Ready to test push notifications in the app!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
executePushNotificationsSQL(); 