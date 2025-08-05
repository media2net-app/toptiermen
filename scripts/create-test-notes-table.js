require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestNotesTable() {
  console.log('🔧 Creating test_notes table...');

  try {
    // Drop table if exists
    console.log('🗑️ Dropping existing table if exists...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql_query: 'DROP TABLE IF EXISTS test_notes CASCADE;'
    });

    if (dropError) {
      console.error('❌ Error dropping table:', dropError);
    } else {
      console.log('✅ Table dropped successfully');
    }

    // Create table
    console.log('🔧 Creating new table...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE test_notes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          test_user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          page_url TEXT NOT NULL,
          element_selector TEXT,
          area_selection JSONB,
          description TEXT NOT NULL,
          priority TEXT DEFAULT 'medium',
          status TEXT DEFAULT 'open',
          screenshot_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createError) {
      console.error('❌ Error creating table:', createError);
      return;
    }

    console.log('✅ Table created successfully');

    // Create indexes
    console.log('📊 Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX idx_test_notes_test_user_id ON test_notes(test_user_id);
        CREATE INDEX idx_test_notes_type ON test_notes(type);
        CREATE INDEX idx_test_notes_status ON test_notes(status);
        CREATE INDEX idx_test_notes_priority ON test_notes(priority);
        CREATE INDEX idx_test_notes_created_at ON test_notes(created_at);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Test insert
    console.log('🧪 Testing insert...');
    const { data: testData, error: testError } = await supabase
      .from('test_notes')
      .insert({
        test_user_id: 'test-script',
        type: 'bug',
        page_url: '/test',
        description: 'Test record from script',
        priority: 'medium'
      })
      .select()
      .single();

    if (testError) {
      console.error('❌ Test insert failed:', testError);
      return;
    }

    console.log('✅ Test insert successful:', testData);

    // Clean up test record
    await supabase
      .from('test_notes')
      .delete()
      .eq('test_user_id', 'test-script');

    console.log('✅ Test record cleaned up');

    // Verify table structure
    console.log('🔍 Verifying table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'test_notes');

    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError);
    } else {
      console.log('📊 Table structure:', columns);
    }

    console.log('🎉 test_notes table created and tested successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createTestNotesTable()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 