const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchemaDays() {
  try {
    console.log('🔍 Checking current schema days...');
    
    const { data, error } = await supabase
      .from('training_schemas')
      .select(`
        name,
        training_schema_days (
          id
        )
      `)
      .eq('status', 'published')
      .order('name');
    
    if (error) throw error;
    
    console.log('📊 Current schema days status:');
    data.forEach(schema => {
      const dayCount = schema.training_schema_days ? schema.training_schema_days.length : 0;
      console.log(`${schema.name}: ${dayCount} days`);
    });
    
  } catch (error) {
    console.error('❌ Error checking schema days:', error);
  }
}

checkSchemaDays(); 