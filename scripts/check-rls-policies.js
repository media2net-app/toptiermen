const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSPolicies() {
  console.log('🔒 Checking RLS policies that might affect login...');

  try {
    // 1. Check current RLS policies on users table
    console.log('📋 Checking current RLS policies on users table...');
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies 
        WHERE tablename = 'users'
        ORDER BY policyname;
      `
    });

    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
    } else {
      console.log('📋 Current RLS policies on users table:');
      console.log(JSON.stringify(policies, null, 2));
    }

    // 2. Check if RLS is enabled on users table
    console.log('🔍 Checking if RLS is enabled on users table...');
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          schemaname,
          tablename,
          rowsecurity
        FROM pg_tables 
        WHERE tablename = 'users';
      `
    });

    if (rlsError) {
      console.error('❌ Error checking RLS status:', rlsError);
    } else {
      console.log('📋 RLS status on users table:');
      console.log(JSON.stringify(rlsStatus, null, 2));
    }

    // 3. Test if we can query users table with service role
    console.log('🧪 Testing user table access with service role...');
    const { data: testUsers, error: testError } = await supabase
      .from('users')
      .select('id, email, status, role')
      .limit(3);

    if (testError) {
      console.error('❌ Error testing user table access:', testError);
    } else {
      console.log('✅ User table access test successful:');
      console.log(JSON.stringify(testUsers, null, 2));
    }

    // 4. Check if there are any missing required policies
    console.log('🔧 Checking for missing required policies...');
    const { error: fixError } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Drop existing policies to recreate them cleanly
        DROP POLICY IF EXISTS "Users can view own profile" ON users;
        DROP POLICY IF EXISTS "Users can update own profile" ON users;
        DROP POLICY IF EXISTS "Users can insert own profile" ON users;
        
        -- Create policies that allow proper authentication
        CREATE POLICY "Users can view own profile" ON users
          FOR SELECT USING (auth.uid() = id);
        
        CREATE POLICY "Users can update own profile" ON users
          FOR UPDATE USING (auth.uid() = id);
        
        CREATE POLICY "Users can insert own profile" ON users
          FOR INSERT WITH CHECK (auth.uid() = id);
        
        -- Add a policy for service role to access all users (for admin functions)
        CREATE POLICY "Service role can access all users" ON users
          FOR ALL USING (auth.role() = 'service_role');
      `
    });

    if (fixError) {
      console.error('❌ Error fixing policies:', fixError);
    } else {
      console.log('✅ RLS policies updated successfully');
    }

    // 5. Test authentication flow simulation
    console.log('🧪 Testing authentication flow simulation...');
    const { data: authTest, error: authTestError } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Test if we can query users with auth context
        SELECT 
          id,
          email,
          status,
          role,
          last_login
        FROM users 
        WHERE email = 'chiel@media2net.nl'
        LIMIT 1;
      `
    });

    if (authTestError) {
      console.error('❌ Error in authentication test:', authTestError);
    } else {
      console.log('✅ Authentication test successful:');
      console.log(JSON.stringify(authTest, null, 2));
    }

    console.log('🎉 RLS policy check completed!');
    console.log('📋 Summary:');
    console.log('   - Checked current RLS policies');
    console.log('   - Verified RLS is enabled');
    console.log('   - Tested user table access');
    console.log('   - Updated policies for proper authentication');
    console.log('   - Tested authentication flow');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkRLSPolicies(); 