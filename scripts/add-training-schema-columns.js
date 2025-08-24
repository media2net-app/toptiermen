require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addTrainingSchemaColumns() {
  try {
    console.log('🔧 Adding new columns to training schema tables...\n');

    // 1. Add columns to training_schemas table
    console.log('📝 Adding columns to training_schemas table...');
    
    const schemaColumns = [
      'ALTER TABLE training_schemas ADD COLUMN IF NOT EXISTS training_goal VARCHAR(50) DEFAULT \'spiermassa\'',
      'ALTER TABLE training_schemas ADD COLUMN IF NOT EXISTS rep_range VARCHAR(20) DEFAULT \'8-12\'',
      'ALTER TABLE training_schemas ADD COLUMN IF NOT EXISTS rest_time_seconds INTEGER DEFAULT 90',
      'ALTER TABLE training_schemas ADD COLUMN IF NOT EXISTS equipment_type VARCHAR(20) DEFAULT \'gym\''
    ];

    for (const columnSql of schemaColumns) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: columnSql });
        if (error) {
          console.log(`⚠️ Could not add column: ${error.message}`);
        } else {
          console.log(`✅ Added column: ${columnSql.split(' ')[5]}`);
        }
      } catch (e) {
        console.log(`❌ Error adding column: ${e.message}`);
      }
    }

    // 2. Add columns to training_schema_exercises table
    console.log('\n📝 Adding columns to training_schema_exercises table...');
    
    const exerciseColumns = [
      'ALTER TABLE training_schema_exercises ADD COLUMN IF NOT EXISTS target_reps VARCHAR(20)',
      'ALTER TABLE training_schema_exercises ADD COLUMN IF NOT EXISTS target_sets INTEGER DEFAULT 4',
      'ALTER TABLE training_schema_exercises ADD COLUMN IF NOT EXISTS rest_time_seconds INTEGER DEFAULT 90'
    ];

    for (const columnSql of exerciseColumns) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: columnSql });
        if (error) {
          console.log(`⚠️ Could not add column: ${error.message}`);
        } else {
          console.log(`✅ Added column: ${columnSql.split(' ')[5]}`);
        }
      } catch (e) {
        console.log(`❌ Error adding column: ${e.message}`);
      }
    }

    // 3. Update existing schemas
    console.log('\n🔄 Updating existing schemas...');
    
    try {
      const { error } = await supabase
        .from('training_schemas')
        .update({ 
          training_goal: 'spiermassa',
          rep_range: '8-12',
          rest_time_seconds: 90,
          equipment_type: 'gym'
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.log(`⚠️ Could not update existing schemas: ${error.message}`);
      } else {
        console.log('✅ Existing schemas updated');
      }
    } catch (e) {
      console.log(`❌ Error updating schemas: ${e.message}`);
    }

    // 4. Update existing exercises
    console.log('\n🔄 Updating existing exercises...');
    
    try {
      const { error } = await supabase
        .from('training_schema_exercises')
        .update({ 
          target_reps: '8-12',
          target_sets: 4,
          rest_time_seconds: 90
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        console.log(`⚠️ Could not update existing exercises: ${error.message}`);
      } else {
        console.log('✅ Existing exercises updated');
      }
    } catch (e) {
      console.log(`❌ Error updating exercises: ${e.message}`);
    }

    console.log('\n🎉 Database column updates completed!');

  } catch (error) {
    console.error('❌ Error adding columns:', error);
  }
}

addTrainingSchemaColumns();
