const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLSPolicies() {
  try {
    console.log('🔧 Fixing RLS policies for user_onboarding_status...\n');

    // Drop existing policies
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view their own onboarding status" ON user_onboarding_status;
        DROP POLICY IF EXISTS "Users can insert their own onboarding status" ON user_onboarding_status;
        DROP POLICY IF EXISTS "Users can update their own onboarding status" ON user_onboarding_status;
      `
    });

    if (dropError) {
      console.log('Note: Could not drop policies (exec_sql function might not exist)');
    }

    // Create new policies that allow users to access their own data
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can view their own onboarding status" ON user_onboarding_status
          FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own onboarding status" ON user_onboarding_status
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own onboarding status" ON user_onboarding_status
          FOR UPDATE USING (auth.uid() = user_id);
      `
    });

    if (createError) {
      console.log('Note: Could not create policies via exec_sql, will try manual approach');
      
      // Try to create policies manually
      const { error: viewError } = await supabase
        .from('user_onboarding_status')
        .select('*')
        .limit(1);
      
      if (viewError) {
        console.error('❌ RLS policy issue confirmed:', viewError.message);
        console.log('\n💡 Manual fix required:');
        console.log('1. Go to Supabase Dashboard');
        console.log('2. Navigate to Authentication > Policies');
        console.log('3. Find user_onboarding_status table');
        console.log('4. Add policy: "Users can view their own onboarding status"');
        console.log('   - Operation: SELECT');
        console.log('   - Target roles: authenticated');
        console.log('   - Using expression: auth.uid() = user_id');
      }
    } else {
      console.log('✅ RLS policies updated successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixRLSPolicies(); 