const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkRLSPolicies() {
  try {
    console.log('🔍 Checking RLS policies on user_badges table...');

    // Try to query the table to see what happens
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error querying user_badges table:', error.message);
      
      if (error.message.includes('row-level security')) {
        console.log('\n💡 RLS is enabled and blocking access');
        console.log('🔧 To fix this, you need to:');
        console.log('1. Go to Supabase Dashboard');
        console.log('2. Navigate to Authentication > Policies');
        console.log('3. Find the user_badges table');
        console.log('4. Add a policy that allows INSERT for authenticated users');
        console.log('   OR temporarily disable RLS for testing');
      }
    } else {
      console.log('✅ Successfully queried user_badges table');
      console.log('Data:', data);
    }

    // Try to insert a test record
    console.log('\n🔍 Testing INSERT operation...');
    const { data: insertData, error: insertError } = await supabase
      .from('user_badges')
      .insert({
        user_id: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e', // Chiel's ID
        badge_id: 'test-badge-id',
        status: 'unlocked',
        unlocked_at: new Date().toISOString()
      })
      .select();

    if (insertError) {
      console.log('❌ Error inserting into user_badges table:', insertError.message);
      
      if (insertError.message.includes('row-level security')) {
        console.log('\n💡 RLS is blocking INSERT operations');
        console.log('🔧 Solution: Add an INSERT policy or disable RLS temporarily');
      }
    } else {
      console.log('✅ Successfully inserted into user_badges table');
      console.log('Inserted data:', insertData);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkRLSPolicies(); 