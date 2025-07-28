const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixWorksheetUrl() {
  console.log('🔧 Fixing worksheet_url column in exercises table...');

  try {
    // Check if worksheet_url column exists
    console.log('🔍 Checking if worksheet_url column exists...');
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'exercises' 
        AND column_name = 'worksheet_url'
      `
    });

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('✅ worksheet_url column already exists');
    } else {
      console.log('❌ worksheet_url column does not exist');
      console.log('📋 Please run this SQL manually in Supabase SQL Editor:');
      console.log(`
        ALTER TABLE exercises 
        ADD COLUMN IF NOT EXISTS worksheet_url text;

        COMMENT ON COLUMN exercises.worksheet_url IS 'URL to PDF workbook file for this exercise';

        UPDATE exercises 
        SET worksheet_url = NULL 
        WHERE worksheet_url IS NULL;
      `);
      
      console.log('⏳ Waiting 10 seconds for you to run the SQL...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    // Test if the column now exists
    console.log('🧪 Testing if worksheet_url column is accessible...');
    const { data: testData, error: testError } = await supabase
      .from('exercises')
      .select('id, name, worksheet_url')
      .limit(1);

    if (testError) {
      console.error('❌ Error accessing exercises table:', testError);
      console.log('📋 The worksheet_url column might still be missing');
    } else {
      console.log('✅ worksheet_url column is now accessible!');
      console.log('📊 Sample data:', testData);
    }

    // Test updating an exercise with worksheet_url
    console.log('🧪 Testing worksheet_url update...');
    const { data: updateData, error: updateError } = await supabase
      .from('exercises')
      .update({ worksheet_url: 'https://example.com/test.pdf' })
      .eq('id', 1)
      .select('id, name, worksheet_url')
      .single();

    if (updateError) {
      console.error('❌ Error updating worksheet_url:', updateError);
    } else {
      console.log('✅ worksheet_url update successful!');
      console.log('📊 Updated data:', updateData);
      
      // Reset the test data
      await supabase
        .from('exercises')
        .update({ worksheet_url: null })
        .eq('id', 1);
      
      console.log('✅ Test data reset');
    }

    console.log('\n🎉 worksheet_url column fix completed!');
    console.log('📋 The error should now be resolved');

  } catch (error) {
    console.error('❌ Error fixing worksheet_url:', error);
  }
}

// Run the fix
fixWorksheetUrl(); 