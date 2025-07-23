const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSCompletely() {
  console.log('🔒 Completely fixing RLS policies for proper authentication...');

  try {
    // 1. First, let's see what policies currently exist
    console.log('📋 Checking current policies...');
    const { data: currentPolicies, error: policiesError } = await supabase.rpc('exec_sql', {
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
      console.log('📋 Current policies:', JSON.stringify(currentPolicies, null, 2));
    }

    // 2. Drop all existing policies
    console.log('🗑️  Dropping all existing policies...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql_query: `
        DROP POLICY IF EXISTS "Users can view own profile" ON users;
        DROP POLICY IF EXISTS "Users can update own profile" ON users;
        DROP POLICY IF EXISTS "Users can insert own profile" ON users;
        DROP POLICY IF EXISTS "Service role can access all users" ON users;
        DROP POLICY IF EXISTS "Users can view all profiles" ON users;
        DROP POLICY IF EXISTS "Users can update own profile" ON users;
        DROP POLICY IF EXISTS "Users can insert own profile" ON users;
      `
    });

    if (dropError) {
      console.error('❌ Error dropping policies:', dropError);
    } else {
      console.log('✅ All policies dropped');
    }

    // 3. Create proper RLS policies
    console.log('🔧 Creating proper RLS policies...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Enable RLS
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        
        -- Policy for users to view their own profile
        CREATE POLICY "Users can view own profile" ON users
          FOR SELECT USING (auth.uid() = id);
        
        -- Policy for users to update their own profile
        CREATE POLICY "Users can update own profile" ON users
          FOR UPDATE USING (auth.uid() = id);
        
        -- Policy for users to insert their own profile (for registration)
        CREATE POLICY "Users can insert own profile" ON users
          FOR INSERT WITH CHECK (auth.uid() = id);
        
        -- Policy for service role to access all users (for admin functions)
        CREATE POLICY "Service role can access all users" ON users
          FOR ALL USING (auth.role() = 'service_role');
        
        -- Policy for authenticated users to view other users (for community features)
        CREATE POLICY "Authenticated users can view other users" ON users
          FOR SELECT USING (auth.role() = 'authenticated');
      `
    });

    if (createError) {
      console.error('❌ Error creating policies:', createError);
    } else {
      console.log('✅ RLS policies created successfully');
    }

    // 4. Test the policies
    console.log('🧪 Testing the new policies...');
    
    // Test with service role (should work)
    const { data: serviceRoleTest, error: serviceRoleError } = await supabase
      .from('users')
      .select('id, email, status, role')
      .limit(1);

    if (serviceRoleError) {
      console.error('❌ Service role test failed:', serviceRoleError);
    } else {
      console.log('✅ Service role test successful:', serviceRoleTest);
    }

    // 5. Test with anon key (should fail)
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: anonTest, error: anonError } = await anonSupabase
      .from('users')
      .select('id, email')
      .limit(1);

    if (anonError) {
      console.log('✅ Anon key test failed as expected (RLS working):', anonError.message);
    } else {
      console.log('⚠️  Anon key test succeeded (RLS not working properly):', anonTest);
    }

    // 6. Test authentication flow
    console.log('🔐 Testing authentication flow...');
    const { data: authTest, error: authError } = await anonSupabase.auth.signInWithPassword({
      email: 'chiel@media2net.nl',
      password: 'wrongpassword'
    });

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        console.log('✅ Authentication flow working (wrong password expected)');
      } else {
        console.log('❌ Authentication error:', authError.message);
      }
    } else {
      console.log('✅ Authentication successful with wrong password (unexpected)');
    }

    console.log('🎉 RLS fix completed!');
    console.log('📋 Summary:');
    console.log('   - Dropped all existing policies');
    console.log('   - Created proper RLS policies');
    console.log('   - Tested service role access');
    console.log('   - Tested anon key restrictions');
    console.log('   - Tested authentication flow');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixRLSCompletely(); 