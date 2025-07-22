const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addSchemaDays() {
  try {
    console.log('🔧 Adding missing schema days...');
    
    // Get all published schemas
    const { data: schemas, error: schemasError } = await supabase
      .from('training_schemas')
      .select('id, name')
      .eq('status', 'published');
    
    if (schemasError) throw schemasError;
    
    for (const schema of schemas) {
      console.log(`📋 Processing: ${schema.name}`);
      
      // Get current days for this schema
      const { data: existingDays, error: daysError } = await supabase
        .from('training_schema_days')
        .select('day_number')
        .eq('schema_id', schema.id);
      
      if (daysError) throw daysError;
      
      const existingDayNumbers = existingDays.map(d => d.day_number);
      console.log(`   Current days: ${existingDayNumbers.length}`);
      
      // Determine how many days this schema should have based on its name
      let targetDays = 0;
      if (schema.name.includes('2-Daags')) targetDays = 2;
      else if (schema.name.includes('3-Daags')) targetDays = 3;
      else if (schema.name.includes('4-Daags')) targetDays = 4;
      else if (schema.name.includes('5-Daags')) targetDays = 5;
      else if (schema.name.includes('6-Daags')) targetDays = 6;
      
      if (targetDays === 0) {
        console.log(`   ⚠️  Could not determine target days for: ${schema.name}`);
        continue;
      }
      
      // Add missing days
      for (let dayNumber = 1; dayNumber <= targetDays; dayNumber++) {
        if (!existingDayNumbers.includes(dayNumber)) {
          console.log(`   ➕ Adding day ${dayNumber}`);
          
          const dayData = {
            schema_id: schema.id,
            day_number: dayNumber,
            name: `Dag ${dayNumber}`,
            description: `Training dag ${dayNumber}`,
            focus_area: 'Full Body',
            order_index: dayNumber
          };
          
          const { error: insertError } = await supabase
            .from('training_schema_days')
            .insert(dayData);
          
          if (insertError) {
            console.error(`   ❌ Error adding day ${dayNumber}:`, insertError);
          } else {
            console.log(`   ✅ Added day ${dayNumber}`);
          }
        }
      }
    }
    
    console.log('🎉 Schema days update completed!');
    
    // Verify results
    console.log('🔍 Verifying results...');
    const { data: finalSchemas, error: finalError } = await supabase
      .from('training_schemas')
      .select(`
        name,
        training_schema_days (
          id
        )
      `)
      .eq('status', 'published')
      .order('name');
    
    if (finalError) throw finalError;
    
    console.log('📊 Final schema verification results:');
    finalSchemas.forEach(schema => {
      const dayCount = schema.training_schema_days ? schema.training_schema_days.length : 0;
      console.log(`${schema.name}: ${dayCount} days`);
    });
    
  } catch (error) {
    console.error('❌ Error adding schema days:', error);
  }
}

addSchemaDays(); 