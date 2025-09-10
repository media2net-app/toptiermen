const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllTrainingSchemas() {
  console.log('🔍 Checking all training schemas in database...');
  
  const { data: schemas, error } = await supabase
    .from('training_schemas')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`📊 Found ${schemas.length} training schemas in database:`);
  
  // Group schemas by type
  const schemaTypes = {};
  
  schemas.forEach(schema => {
    const name = schema.name || 'Unknown';
    const type = name.includes('Kracht') ? 'Kracht' : 
                 name.includes('Spiermassa') ? 'Spiermassa' : 
                 name.includes('Power') ? 'Power' : 'Other';
    
    if (!schemaTypes[type]) {
      schemaTypes[type] = [];
    }
    schemaTypes[type].push(schema);
  });
  
  // Display schemas by type
  Object.keys(schemaTypes).forEach(type => {
    console.log(`\n🏋️ ${type} Schemas (${schemaTypes[type].length}):`);
    schemaTypes[type].forEach(schema => {
      console.log(`   - ${schema.name} (${schema.equipment_type})`);
    });
  });
  
  // Check a few specific schemas for their expected values
  const sampleSchemas = [
    { name: 'Kracht/Conditie 6 dagen per week', expectedReps: '15-20', expectedRest: '45-60' },
    { name: 'Spiermassa 6 dagen per week', expectedReps: '8-12', expectedRest: '60-90' },
    { name: 'Kracht/Power 6 dagen per week', expectedReps: '3-6', expectedRest: '150-180' }
  ];
  
  console.log('\n🔍 Checking sample schemas for expected values...');
  
  for (const sample of sampleSchemas) {
    const schema = schemas.find(s => s.name && s.name.includes(sample.name.split(' ')[0]));
    if (schema) {
      console.log(`\n📋 ${schema.name}:`);
      console.log(`   Expected: ${sample.expectedReps} reps, ${sample.expectedRest}s rest`);
      console.log(`   Database: ${schema.id}`);
    }
  }
}

checkAllTrainingSchemas().catch(console.error);
