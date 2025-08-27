require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPushNotificationsDirect() {
  console.log('🚀 Setting up Push Notifications (Direct Method)...\n');

  try {
    // Test database connection
    console.log('1️⃣ Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    console.log('✅ Database connection successful\n');

    // Create table using direct SQL
    console.log('2️⃣ Creating push_subscriptions table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL,
        p256dh_key TEXT NOT NULL,
        auth_key TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;

    // Try to execute via raw SQL (this might not work with Supabase client)
    console.log('⚠️  Note: Table creation requires manual execution in Supabase Dashboard');
    console.log('📋 Please execute the following SQL in Supabase Dashboard > SQL Editor:\n');
    console.log(createTableSQL);

    // Check if table exists
    console.log('\n3️⃣ Checking if table exists...');
    const { data: tableData, error: tableError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .limit(1);

    if (tableError && tableError.message.includes('does not exist')) {
      console.log('❌ Table does not exist yet. Please execute the SQL manually in Supabase Dashboard.');
      console.log('\n📋 Instructions:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to SQL Editor');
      console.log('4. Copy and paste the SQL from scripts/setup-push-notifications-direct.sql');
      console.log('5. Click "Run"');
      console.log('6. Run this script again to verify');
      return;
    } else if (tableError) {
      console.error('❌ Error checking table:', tableError.message);
      return;
    }

    console.log('✅ push_subscriptions table exists and is accessible');

    // Test insert and select
    console.log('\n4️⃣ Testing table operations...');
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
setupPushNotificationsDirect(); 