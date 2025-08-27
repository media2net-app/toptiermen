require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

    // Read SQL script
    console.log('2️⃣ Reading SQL script...');
    const sqlPath = path.join(__dirname, 'create-push-subscriptions-table.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ SQL script loaded\n');

    // Execute SQL statements
    console.log('3️⃣ Creating push_subscriptions table...');
    
    // Split SQL into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️  Statement ${i + 1} (non-critical):`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} (non-critical):`, err.message);
        }
      }
    }

    // Verify table creation
    console.log('\n4️⃣ Verifying table creation...');
    const { data: tableData, error: tableError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Table verification failed:', tableError.message);
      
      // Try to create table manually
      console.log('🔄 Attempting manual table creation...');
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS push_subscriptions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          endpoint TEXT NOT NULL,
          p256dh_key TEXT NOT NULL,
          auth_key TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      if (createError) {
        console.error('❌ Manual table creation failed:', createError.message);
        return;
      }
      console.log('✅ Table created manually');
    } else {
      console.log('✅ push_subscriptions table exists and is accessible');
    }

    // Test insert and select
    console.log('\n5️⃣ Testing table operations...');
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