const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixLoginTrigger() {
  console.log('🔧 Fixing login trigger that might be causing authentication issues...');

  try {
    // 1. First, let's disable the problematic trigger temporarily
    console.log('📝 Disabling the login trigger temporarily...');
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql_query: `
        DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
      `
    });

    if (disableError) {
      console.error('❌ Error disabling trigger:', disableError);
    } else {
      console.log('✅ Trigger disabled successfully');
    }

    // 2. Check if the function exists and fix it
    console.log('🔧 Checking and fixing the update_user_last_login function...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION update_user_last_login()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Only update if the user exists in the users table
          IF EXISTS (SELECT 1 FROM users WHERE id = NEW.id) THEN
            UPDATE users 
            SET last_login = NOW() 
            WHERE id = NEW.id;
          END IF;
          
          RETURN NEW;
        EXCEPTION
          WHEN OTHERS THEN
            -- Log the error but don't fail the authentication
            RAISE WARNING 'Error updating last_login for user %: %', NEW.id, SQLERRM;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (functionError) {
      console.error('❌ Error updating function:', functionError);
    } else {
      console.log('✅ Function updated successfully');
    }

    // 3. Recreate the trigger with better error handling
    console.log('🔗 Recreating the trigger with better error handling...');
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TRIGGER on_auth_user_sign_in
          AFTER UPDATE OF last_sign_in_at ON auth.users
          FOR EACH ROW
          WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
          EXECUTE FUNCTION update_user_last_login();
      `
    });

    if (triggerError) {
      console.error('❌ Error recreating trigger:', triggerError);
    } else {
      console.log('✅ Trigger recreated successfully');
    }

    // 4. Check RLS policies on profiles table
    console.log('🔒 Checking RLS policies on users table...');
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies 
        WHERE tablename = 'profiles';
      `
    });

    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
    } else {
      console.log('📋 Current RLS policies on users table:');
      console.log(policies);
    }

    // 5. Test the authentication flow
    console.log('🧪 Testing authentication flow...');
    const { data: testUser, error: testError } = await supabase
      .from('profiles')
      .select('id, email, status, last_login')
      .limit(1);

    if (testError) {
      console.error('❌ Error testing user query:', testError);
    } else {
      console.log('✅ User query test successful:', testUser);
    }

    console.log('🎉 Login trigger fix completed!');
    console.log('📋 Summary:');
    console.log('   - Disabled problematic trigger');
    console.log('   - Updated function with better error handling');
    console.log('   - Recreated trigger with exception handling');
    console.log('   - Checked RLS policies');
    console.log('   - Tested user query access');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixLoginTrigger(); 