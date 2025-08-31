const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugSchemaSaveIssue() {
  console.log('🔍 Debugging Schema Save Issue...\n');

  try {
    // Find Chiel's user ID
    const { data: chielProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .or('full_name.ilike.%chiel%,email.ilike.%chiel%')
      .limit(1);

    if (profileError || !chielProfile || chielProfile.length === 0) {
      console.error('❌ Chiel not found');
      return;
    }

    const chielId = chielProfile[0].id;
    console.log(`👤 Found Chiel: ${chielProfile[0].full_name} (${chielProfile[0].email})`);
    console.log(`   User ID: ${chielId}\n`);

    // 1. Check profiles table structure
    console.log('1️⃣ Checking profiles table structure...');
    
    // Try to get a sample profile to see the structure
    const { data: sampleProfile, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ Error fetching sample profile:', sampleError);
      return;
    }

    console.log('✅ Current profile structure:');
    console.log('   Columns:', Object.keys(sampleProfile[0]));
    
    const hasSelectedSchemaId = 'selected_schema_id' in sampleProfile[0];
    console.log(`   Has selected_schema_id: ${hasSelectedSchemaId ? '✅' : '❌'}`);

    // 2. Check current selected_schema_id value
    console.log('\n2️⃣ Checking current selected_schema_id value...');
    const { data: currentProfile, error: currentError } = await supabase
      .from('profiles')
      .select('selected_schema_id')
      .eq('id', chielId)
      .single();

    if (currentError) {
      console.error('❌ Error fetching current profile:', currentError);
    } else {
      console.log(`✅ Current selected_schema_id: ${currentProfile.selected_schema_id || 'null'}`);
    }

    // 3. Check available training schemas
    console.log('\n3️⃣ Checking available training schemas...');
    const { data: schemas, error: schemasError } = await supabase
      .from('training_schemas')
      .select('id, name')
      .limit(5);

    if (schemasError) {
      console.error('❌ Error fetching schemas:', schemasError);
      return;
    }

    console.log(`✅ Found ${schemas?.length || 0} training schemas:`);
    schemas?.forEach((schema, index) => {
      console.log(`   ${index + 1}. ${schema.name} (ID: ${schema.id})`);
    });

    // 4. Test schema save functionality
    console.log('\n4️⃣ Testing schema save functionality...');
    if (schemas && schemas.length > 0) {
      const testSchemaId = schemas[0].id;
      console.log(`   Testing with schema: ${schemas[0].name} (ID: ${testSchemaId})`);

      // Try to update the selected_schema_id
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ selected_schema_id: testSchemaId })
        .eq('id', chielId)
        .select();

      if (updateError) {
        console.error('❌ Error updating selected_schema_id:', updateError);
        
        // Check if it's a column issue
        if (updateError.message.includes('column') || updateError.message.includes('does not exist')) {
          console.log('\n🔧 SOLUTION: The selected_schema_id column does not exist!');
          console.log('   Need to add this column to the profiles table.');
        }
      } else {
        console.log('✅ Successfully updated selected_schema_id!');
        console.log('   Updated profile:', updateData);
        
        // Reset it back to null for testing
        const { error: resetError } = await supabase
          .from('profiles')
          .update({ selected_schema_id: null })
          .eq('id', chielId);

        if (resetError) {
          console.error('❌ Error resetting selected_schema_id:', resetError);
        } else {
          console.log('✅ Reset selected_schema_id back to null');
        }
      }
    }

    console.log('\n📊 SUMMARY:');
    console.log('================================');
    console.log('   - Checked profiles table structure');
    console.log('   - Verified current selected_schema_id value');
    console.log('   - Listed available training schemas');
    console.log('   - Tested schema save functionality');

  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugSchemaSaveIssue();
