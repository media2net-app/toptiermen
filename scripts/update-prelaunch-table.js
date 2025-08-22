require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updatePrelaunchTable() {
  try {
    console.log('🔧 Updating prelaunch_emails table with UTM fields...');

    // Add UTM columns if they don't exist
    const alterTableSQL = `
      ALTER TABLE public.prelaunch_emails 
      ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255),
      ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255),
      ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255),
      ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255),
      ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255);
    `;

    // Try to execute the SQL
    const { error: alterError } = await supabase.rpc('execute_sql', {
      sql: alterTableSQL
    });

    if (alterError) {
      console.log('⚠️ Could not execute SQL directly, checking if columns already exist...');
      
      // Check if columns exist by trying to select them
      const { data: testData, error: testError } = await supabase
        .from('prelaunch_emails')
        .select('utm_source, utm_medium, utm_campaign, utm_content, utm_term')
        .limit(1);

      if (testError && testError.code === '42703') {
        console.log('❌ UTM columns do not exist and cannot be added via client');
        console.log('📋 Please run this SQL manually in your Supabase dashboard:');
        console.log(alterTableSQL);
        return;
      } else {
        console.log('✅ UTM columns already exist or were added successfully');
      }
    } else {
      console.log('✅ UTM columns added successfully');
    }

    // Test inserting a record with UTM data
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: testInsert, error: insertError } = await supabase
      .from('prelaunch_emails')
      .insert({
        email: testEmail,
        source: 'Test UTM Update',
        status: 'active',
        package: 'BASIC',
        notes: 'Test record for UTM fields',
        utm_source: 'test_source',
        utm_medium: 'test_medium',
        utm_campaign: 'test_campaign',
        utm_content: 'test_content',
        utm_term: 'test_term'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error testing UTM insert:', insertError);
      return;
    }

    console.log('✅ Test insert with UTM data successful:', testInsert);

    // Clean up test record
    const { error: deleteError } = await supabase
      .from('prelaunch_emails')
      .delete()
      .eq('email', testEmail);

    if (deleteError) {
      console.log('⚠️ Could not clean up test record:', deleteError);
    } else {
      console.log('✅ Test record cleaned up');
    }

    console.log('🎉 Prelaunch table update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating prelaunch table:', error);
  }
}

updatePrelaunchTable();
