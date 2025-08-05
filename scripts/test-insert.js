require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testInsert() {
  console.log('🧪 Testing direct insert into test_notes...');

  try {
    // Test insert
    const { data, error } = await supabase
      .from('test_notes')
      .insert({
        test_user_id: 'test-script-insert',
        type: 'bug',
        page_url: '/test',
        description: 'Test record from script',
        priority: 'medium'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Insert failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return;
    }

    console.log('✅ Insert successful:', data);

    // Clean up
    await supabase
      .from('test_notes')
      .delete()
      .eq('test_user_id', 'test-script-insert');

    console.log('✅ Test record cleaned up');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testInsert()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }); 