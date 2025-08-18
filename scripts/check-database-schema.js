const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...');

    // Check training_schemas table
    console.log('\n📋 Checking training_schemas table...');
    const { data: schemas, error: schemasError } = await supabase
      .from('training_schemas')
      .select('*')
      .limit(1);

    if (schemasError) {
      console.log('❌ Error with training_schemas:', schemasError.message);
    } else {
      console.log('✅ training_schemas table exists');
      if (schemas && schemas.length > 0) {
        console.log('📊 Sample schema:', schemas[0]);
      }
    }

    // Check training_schema_days table
    console.log('\n📋 Checking training_schema_days table...');
    const { data: days, error: daysError } = await supabase
      .from('training_schema_days')
      .select('*')
      .limit(1);

    if (daysError) {
      console.log('❌ Error with training_schema_days:', daysError.message);
    } else {
      console.log('✅ training_schema_days table exists');
      if (days && days.length > 0) {
        console.log('📊 Sample day:', days[0]);
      }
    }

    // Check training_schema_exercises table
    console.log('\n📋 Checking training_schema_exercises table...');
    const { data: exercises, error: exercisesError } = await supabase
      .from('training_schema_exercises')
      .select('*')
      .limit(1);

    if (exercisesError) {
      console.log('❌ Error with training_schema_exercises:', exercisesError.message);
    } else {
      console.log('✅ training_schema_exercises table exists');
      if (exercises && exercises.length > 0) {
        console.log('📊 Sample exercise:', exercises[0]);
      }
    }

    // Check if user_training_schemas table exists
    console.log('\n📋 Checking user_training_schemas table...');
    const { data: userSchemas, error: userSchemasError } = await supabase
      .from('user_training_schemas')
      .select('*')
      .limit(1);

    if (userSchemasError) {
      console.log('❌ Error with user_training_schemas:', userSchemasError.message);
    } else {
      console.log('✅ user_training_schemas table exists');
      if (userSchemas && userSchemas.length > 0) {
        console.log('📊 Sample user schema:', userSchemas[0]);
      }
    }

  } catch (error) {
    console.error('❌ Error checking database schema:', error);
  }
}

checkDatabaseSchema();
