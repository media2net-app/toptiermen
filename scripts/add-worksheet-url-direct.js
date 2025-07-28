const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addWorksheetUrlDirect() {
  console.log('🔧 Adding worksheet_url column to exercises table...');

  try {
    // Check if worksheet_url column already exists
    console.log('🔍 Checking if worksheet_url column exists...');
    const { data: exercises, error: testError } = await supabase
      .from('exercises')
      .select('id, name, worksheet_url')
      .limit(1);

    if (testError && testError.message.includes('worksheet_url')) {
      console.log('❌ worksheet_url column does not exist, adding it...');
      
      // Since we can't use exec_sql for DDL, we'll provide the SQL manually
      console.log('📋 Please run this SQL manually in Supabase SQL Editor:');
      console.log(`
        ALTER TABLE exercises 
        ADD COLUMN IF NOT EXISTS worksheet_url text;

        COMMENT ON COLUMN exercises.worksheet_url IS 'URL to PDF workbook file for this exercise';

        UPDATE exercises 
        SET worksheet_url = NULL 
        WHERE worksheet_url IS NULL;
      `);
      
      console.log('⏳ Waiting 15 seconds for you to run the SQL...');
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Test again
      console.log('🧪 Testing worksheet_url column again...');
      const { data: exercises2, error: testError2 } = await supabase
        .from('exercises')
        .select('id, name, worksheet_url')
        .limit(1);

      if (testError2) {
        console.error('❌ worksheet_url column still not accessible:', testError2);
        console.log('📋 Please make sure you ran the SQL in Supabase SQL Editor');
      } else {
        console.log('✅ worksheet_url column is now accessible!');
        console.log('📊 Sample data:', exercises2?.[0]);
      }
    } else {
      console.log('✅ worksheet_url column already exists!');
      console.log('📊 Sample data:', exercises?.[0]);
    }

    // Test updating an exercise with worksheet_url
    console.log('🧪 Testing worksheet_url update...');
    const { data: updateData, error: updateError } = await supabase
      .from('exercises')
      .update({ worksheet_url: 'https://example.com/test-worksheet.pdf' })
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

    console.log('\n🎉 worksheet_url column setup completed!');
    console.log('📋 Video uploads and worksheet uploads should now work');

  } catch (error) {
    console.error('❌ Error adding worksheet_url:', error);
  }
}

// Run the setup
addWorksheetUrlDirect(); 