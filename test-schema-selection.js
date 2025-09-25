const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSchemaSelection() {
  try {
    const userId = '9d6aa8ba-58ab-4188-9a9f-09380a67eb0c'; // Rick's user ID
    
    console.log('🔍 Testing schema selection for Rick...');
    
    // Check Rick's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError.message);
      return;
    }
    
    console.log('👤 Rick\'s profile:');
    console.log('  - Email:', profile.email);
    console.log('  - Selected Schema ID:', profile.selected_schema_id);
    console.log('  - Schema Start Date:', profile.schema_start_date);
    console.log('  - Schema End Date:', profile.schema_end_date);
    
    // Check if the selected schema exists
    if (profile.selected_schema_id) {
      const { data: schema, error: schemaError } = await supabase
        .from('training_schemas')
        .select('*')
        .eq('id', profile.selected_schema_id)
        .single();
      
      if (schemaError) {
        console.error('❌ Error fetching selected schema:', schemaError.message);
      } else {
        console.log('📋 Selected Schema:');
        console.log('  - Name:', schema.name);
        console.log('  - Schema Number:', schema.schema_nummer);
        console.log('  - Status:', schema.status);
      }
    }
    
    // Check if there's an active schema period
    const { data: schemaPeriod, error: periodError } = await supabase
      .from('user_training_schema_periods')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (periodError) {
      console.log('ℹ️  No active schema period found (this is expected)');
    } else {
      console.log('📅 Active Schema Period:');
      console.log('  - Schema ID:', schemaPeriod.training_schema_id);
      console.log('  - Start Date:', schemaPeriod.start_date);
      console.log('  - End Date:', schemaPeriod.end_date);
      console.log('  - Status:', schemaPeriod.status);
    }
    
    console.log('\n🎯 Expected behavior:');
    console.log('  - Rick should see "Geselecteerd" on Schema 1');
    console.log('  - Schema 2 and 3 should be locked');
    console.log('  - No active schema period means no "Actief" status');
    
  } catch (error) {
    console.error('❌ Error testing schema selection:', error);
  }
}

testSchemaSelection();
