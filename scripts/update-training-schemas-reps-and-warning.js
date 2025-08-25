require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTrainingSchemasRepsAndWarning() {
  try {
    console.log('🔧 Updating training schemas reps and adding muscle failure warnings...\n');

    // 1. Update all training_schema_exercises to use 8-12 reps for muscle mass schemas
    console.log('📝 Updating exercise reps to 8-12 range for muscle mass...');
    
    const { error: updateRepsError } = await supabase
      .from('training_schema_exercises')
      .update({ 
        reps: 10, // Set to middle of 8-12 range
        target_reps: '8-12'
      })
      .eq('reps', 10) // Only update exercises that currently have 10 reps
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (updateRepsError) {
      console.log('⚠️ Could not update exercise reps:', updateRepsError.message);
    } else {
      console.log('✅ Exercise reps updated to 8-12 range');
    }

    // 2. Update training_schemas table to add muscle failure warning
    console.log('\n📝 Adding muscle failure warning to schema descriptions...');
    
    const { data: schemas, error: fetchSchemasError } = await supabase
      .from('training_schemas')
      .select('id, name, description, training_goal')
      .eq('status', 'published');

    if (fetchSchemasError) {
      console.log('❌ Error fetching schemas:', fetchSchemasError.message);
      return;
    }

    console.log(`📋 Found ${schemas?.length || 0} published schemas`);

    // 3. Update each schema with muscle failure warning
    for (const schema of schemas || []) {
      const muscleFailureWarning = '\n\n⚠️ **BELANGRIJK:** We adviseren ten alle tijden om het aantal herhalingen te doen tot spierfalen moment voor optimale resultaten.';
      
      let updatedDescription = schema.description;
      
      // Add warning if not already present
      if (!updatedDescription.includes('spierfalen') && !updatedDescription.includes('Spierfalen')) {
        updatedDescription += muscleFailureWarning;
      }

      // Update schema description
      const { error: updateSchemaError } = await supabase
        .from('training_schemas')
        .update({ 
          description: updatedDescription,
          rep_range: '8-12' // Ensure rep range is set correctly
        })
        .eq('id', schema.id);

      if (updateSchemaError) {
        console.log(`⚠️ Could not update schema ${schema.name}:`, updateSchemaError.message);
      } else {
        console.log(`✅ Updated schema: ${schema.name}`);
      }
    }

    // 4. Update training_schema_exercises to ensure all have correct target_reps
    console.log('\n🔄 Ensuring all exercises have correct target_reps...');
    
    const { error: updateTargetRepsError } = await supabase
      .from('training_schema_exercises')
      .update({ 
        target_reps: '8-12'
      })
      .is('target_reps', null) // Only update exercises without target_reps
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (updateTargetRepsError) {
      console.log('⚠️ Could not update target_reps:', updateTargetRepsError.message);
    } else {
      console.log('✅ Target reps updated for exercises without target_reps');
    }

    // 5. Add muscle failure warning to schema days descriptions
    console.log('\n📝 Adding muscle failure warning to schema days...');
    
    const { data: schemaDays, error: fetchDaysError } = await supabase
      .from('training_schema_days')
      .select('id, name, description');

    if (fetchDaysError) {
      console.log('❌ Error fetching schema days:', fetchDaysError.message);
    } else {
      console.log(`📋 Found ${schemaDays?.length || 0} schema days`);

      for (const day of schemaDays || []) {
        const muscleFailureWarning = '\n\n⚠️ **BELANGRIJK:** Doe alle oefeningen tot spierfalen voor optimale resultaten.';
        
        let updatedDescription = day.description || '';
        
        // Add warning if not already present
        if (!updatedDescription.includes('spierfalen') && !updatedDescription.includes('Spierfalen')) {
          updatedDescription += muscleFailureWarning;
        }

        // Update day description
        const { error: updateDayError } = await supabase
          .from('training_schema_days')
          .update({ description: updatedDescription })
          .eq('id', day.id);

        if (updateDayError) {
          console.log(`⚠️ Could not update day ${day.name}:`, updateDayError.message);
        } else {
          console.log(`✅ Updated day: ${day.name}`);
        }
      }
    }

    console.log('\n🎉 Training schemas updated successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('✅ All muscle mass exercises now use 8-12 reps range');
    console.log('✅ Muscle failure warnings added to all schema descriptions');
    console.log('✅ Muscle failure warnings added to all day descriptions');
    console.log('✅ Target reps set to 8-12 for all exercises');

  } catch (error) {
    console.error('❌ Error updating training schemas:', error);
  }
}

updateTrainingSchemasRepsAndWarning();
