require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableSQL() {
  console.log('🔍 Checking test_notes table with SQL...');

  try {
    // Check if table exists using SQL
    const { data: tableExists, error: tableError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'test_notes'
        );
      `
    });

    if (tableError) {
      console.error('❌ Error checking if table exists:', tableError);
      return;
    }

    console.log('📊 Table exists:', tableExists);

    if (!tableExists) {
      console.log('❌ test_notes table does not exist');
      return;
    }

    // Get table structure using SQL
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'test_notes'
        ORDER BY ordinal_position;
      `
    });

    if (columnsError) {
      console.error('❌ Error getting columns:', columnsError);
      return;
    }

    console.log('📊 Table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    // Try to select from table
    const { data: selectData, error: selectError } = await supabase
      .from('test_notes')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ Error selecting from table:', selectError);
    } else {
      console.log('✅ Select from table works');
      console.log('📊 Sample data:', selectData);
    }

    // Try a simple insert
    const { data: insertData, error: insertError } = await supabase
      .from('test_notes')
      .insert({
        test_user_id: 'test-sql-check',
        type: 'bug',
        page_url: '/test',
        description: 'Test from SQL check',
        priority: 'medium'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting:', insertError);
      console.error('❌ Error details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
    } else {
      console.log('✅ Insert works:', insertData);
      
      // Clean up
      await supabase
        .from('test_notes')
        .delete()
        .eq('test_user_id', 'test-sql-check');
      
      console.log('✅ Test record cleaned up');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkTableSQL()
  .then(() => {
    console.log('✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }); 