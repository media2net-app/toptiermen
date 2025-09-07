require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simulate the exact query that the frontend uses
async function debugFrontendData() {
  try {
    console.log('🔍 Simulating frontend data fetch for CHIEL TEST VOLGORDE...');
    
    // This is the exact query from the frontend
    const { data, error } = await supabase
      .from('training_schemas')
      .select(`*,training_schema_days (id,day_number,name,training_schema_exercises (id,exercise_id,exercise_name,sets,reps,rest_time,order_index))`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching schemas:', error);
      return;
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} training schemas`);

    // Find our test schema
    const testSchema = data.find(schema => schema.name === 'CHIEL TEST VOLGORDE');
    if (!testSchema) {
      console.error('❌ CHIEL TEST VOLGORDE schema not found');
      return;
    }

    console.log('\n📋 Test Schema Found:');
    console.log(`  Name: ${testSchema.name}`);
    console.log(`  ID: ${testSchema.id}`);
    console.log(`  Days count: ${testSchema.training_schema_days?.length || 0}`);

    // Show raw data from database (no sorting)
    console.log('\n📅 Raw days data from database (no sorting):');
    if (testSchema.training_schema_days) {
      testSchema.training_schema_days.forEach((day, index) => {
        console.log(`  ${index + 1}. Day ${day.day_number}: "${day.name}" (ID: ${day.id})`);
      });
    }

    // Apply the same sorting as the frontend
    console.log('\n🔄 Applying frontend sorting...');
    const sortedSchema = {
      ...testSchema,
      training_schema_days: (testSchema.training_schema_days || []).sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
    };

    console.log('\n📅 Days after frontend sorting:');
    if (sortedSchema.training_schema_days) {
      sortedSchema.training_schema_days.forEach((day, index) => {
        console.log(`  ${index + 1}. Day ${day.day_number}: "${day.name}" (ID: ${day.id})`);
      });
    }

    // Apply mapDbSchemaToForm transformation
    console.log('\n🔄 Applying mapDbSchemaToForm transformation...');
    const mapDbSchemaToForm = (dbSchema) => ({
      id: dbSchema.id,
      name: dbSchema.name,
      description: dbSchema.description,
      category: dbSchema.category,
      difficulty: dbSchema.difficulty,
      status: dbSchema.status,
      days: (dbSchema.training_schema_days || [])
        .sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0))
        .map((day) => ({
          id: day.id,
          schema_id: dbSchema.id,
          day_number: day.day_number,
          name: day.name,
          description: day.description,
          exercises: (day.training_schema_exercises || [])
            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map((ex) => ({
              id: ex.id,
              exercise_id: ex.exercise_id,
              exercise_name: ex.exercise_name,
              sets: ex.sets,
              reps: ex.reps,
              rest_time: ex.rest_time,
              order_index: ex.order_index ?? 0,
            })),
        })),
    });

    const transformedSchema = mapDbSchemaToForm(sortedSchema);

    console.log('\n📅 Days after mapDbSchemaToForm transformation:');
    if (transformedSchema.days) {
      transformedSchema.days.forEach((day, index) => {
        console.log(`  ${index + 1}. Day ${day.day_number}: "${day.name}" (ID: ${day.id})`);
      });
    }

    // Check if the order is correct
    const dayNumbers = transformedSchema.days.map(day => day.day_number);
    const expectedOrder = [1, 2, 3, 4, 5, 6];
    const isCorrectOrder = JSON.stringify(dayNumbers) === JSON.stringify(expectedOrder);
    
    console.log(`\n🎯 Final result:`);
    console.log(`  Expected: [${expectedOrder.join(', ')}]`);
    console.log(`  Actual:   [${dayNumbers.join(', ')}]`);
    console.log(`  Result:   ${isCorrectOrder ? '✅ CORRECT ORDER!' : '❌ WRONG ORDER!'}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugFrontendData();
