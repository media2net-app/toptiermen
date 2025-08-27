require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

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

async function setupPushNotifications() {
  console.log('🚀 Setting up Push Notifications...\n');

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

    // Check if table already exists
    console.log('2️⃣ Checking if push_subscriptions table exists...');
    const { data: existingTable, error: tableCheckError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .limit(1);

    if (tableCheckError && tableCheckError.message.includes('does not exist')) {
      console.log('📋 Table does not exist');
      console.log('\n📋 Manual Setup Required:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the following SQL:');
      console.log('\n' + '='.repeat(60));
      console.log(`
-- Create push_subscriptions table
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Create policy to allow service role to manage all subscriptions
CREATE POLICY "Service role can manage all push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
      `);
      console.log('='.repeat(60));
      
      console.log('\n4️⃣ After running the SQL, test the setup...');
      console.log('   Run this script again to verify the setup');
      return;
    } else {
      console.log('✅ push_subscriptions table exists');
    }

    // Test table operations
    console.log('\n3️⃣ Testing table operations...');
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
      console.log('📊 Retrieved data:', selectData.length, 'records');
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
    console.log('\n📋 Next Steps:');
    console.log('1. Generate VAPID keys: npx web-push generate-vapid-keys');
    console.log('2. Add VAPID keys to .env.local');
    console.log('3. Test push notifications in the app');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupPushNotifications(); 