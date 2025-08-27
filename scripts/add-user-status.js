const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addUserStatus() {
  console.log('🚀 Starting to add status column and last login tracking...');

  try {
    // 1. Add status column to profiles table
    console.log('📝 Adding status column to users table...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
      `
    });

    if (alterError) {
      console.error('❌ Error adding status column:', alterError);
      return;
    }

    // 2. Update existing users to have 'active' status
    console.log('🔄 Updating existing users to active status...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql_query: `
        UPDATE users 
        SET status = 'active' 
        WHERE status IS NULL;
      `
    });

    if (updateError) {
      console.error('❌ Error updating user status:', updateError);
      return;
    }

    // 3. Create function to update last_login when user signs in
    console.log('🔧 Creating update_user_last_login function...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION update_user_last_login()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Update the last_login timestamp in the users table
          UPDATE users 
          SET last_login = NOW() 
          WHERE id = NEW.id;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (functionError) {
      console.error('❌ Error creating function:', functionError);
      return;
    }

    // 4. Create trigger to automatically update last_login on sign in
    console.log('🔗 Creating trigger for last login tracking...');
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql_query: `
        DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
        CREATE TRIGGER on_auth_user_sign_in
          AFTER UPDATE OF last_sign_in_at ON auth.users
          FOR EACH ROW
          WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
          EXECUTE FUNCTION update_user_last_login();
      `
    });

    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError);
      return;
    }

    // 5. Add indexes for better performance
    console.log('📊 Adding performance indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
        CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
      return;
    }

    // 6. Add comments for documentation
    console.log('📚 Adding documentation comments...');
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql_query: `
        COMMENT ON COLUMN users.status IS 'User account status: active, inactive, or suspended';
        COMMENT ON COLUMN users.last_login IS 'Timestamp of the user''s last login to the application';
      `
    });

    if (commentError) {
      console.error('❌ Error adding comments:', commentError);
      return;
    }

    console.log('✅ Successfully added status column and last login tracking!');
    console.log('📋 Summary of changes:');
    console.log('   - Added status column to users table');
    console.log('   - Set all existing users to active status');
    console.log('   - Created update_user_last_login function');
    console.log('   - Created trigger to track last login automatically');
    console.log('   - Added performance indexes');
    console.log('   - Added documentation comments');

    // Test the setup
    console.log('🧪 Testing the setup...');
    const { data: testUsers, error: testError } = await supabase
      .from('profiles')
      .select('id, email, status, last_login')
      .limit(5);

    if (testError) {
      console.error('❌ Error testing setup:', testError);
      return;
    }

    console.log('✅ Test successful! Sample users:');
    testUsers?.forEach(user => {
      console.log(`   - ${user.email}: status=${user.status}, last_login=${user.last_login || 'never'}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addUserStatus(); 