const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugTrainingSchemaMismatch() {
  console.log('🔍 Debugging Training Schema Frequency Mismatch...\n');

  try {
    // 1. Get all training schemas from database
    console.log('1️⃣ Fetching training schemas from database...');
    const { data: schemas, error: schemasError } = await supabase
      .from('training_schemas')
      .select('*')
      .eq('status', 'published')
      .order('name');

    if (schemasError) {
      console.error('❌ Error fetching schemas:', schemasError);
      return;
    }

    console.log(`✅ Found ${schemas.length} training schemas:`);
    schemas.forEach((schema, index) => {
      console.log(`   ${index + 1}. ${schema.name} (ID: ${schema.id})`);
      console.log(`      Category: ${schema.category}`);
      console.log(`      Difficulty: ${schema.difficulty}`);
      console.log(`      Target Audience: ${schema.target_audience || 'N/A'}`);
    });

    // 2. Load workout data
    console.log('\n2️⃣ Loading workout data...');
    const workoutData = require('../src/data/training-schema-workouts.json');
    
    console.log(`✅ Loaded workout data for ${Object.keys(workoutData).length} schemas:`);
    Object.keys(workoutData).forEach((schemaId, index) => {
      const workout = workoutData[schemaId];
      console.log(`   ${index + 1}. ${workout.name} (ID: ${schemaId})`);
      console.log(`      Frequency: ${workout.frequency} days`);
      console.log(`      Style: ${workout.style}`);
      console.log(`      Days: ${workout.days.length} workout days`);
    });

    // 3. Check for mismatches
    console.log('\n3️⃣ Checking for frequency mismatches...');
    let mismatchCount = 0;
    
    schemas.forEach(schema => {
      const workout = workoutData[schema.id];
      if (workout) {
        // Extract frequency from schema name or description
        const nameLower = schema.name.toLowerCase();
        const descriptionLower = schema.description.toLowerCase();
        
        let expectedFrequency = null;
        
        // Check for frequency in name
        if (nameLower.includes('2-daag') || nameLower.includes('2 daag') || nameLower.includes('2 dagen')) {
          expectedFrequency = 2;
        } else if (nameLower.includes('3-daag') || nameLower.includes('3 daag') || nameLower.includes('3 dagen')) {
          expectedFrequency = 3;
        } else if (nameLower.includes('4-daag') || nameLower.includes('4 daag') || nameLower.includes('4 dagen')) {
          expectedFrequency = 4;
        } else if (nameLower.includes('5-daag') || nameLower.includes('5 daag') || nameLower.includes('5 dagen')) {
          expectedFrequency = 5;
        } else if (nameLower.includes('6-daag') || nameLower.includes('6 daag') || nameLower.includes('6 dagen')) {
          expectedFrequency = 6;
        }
        
        // Check for frequency in description if not found in name
        if (!expectedFrequency) {
          if (descriptionLower.includes('2-daag') || descriptionLower.includes('2 daag') || descriptionLower.includes('2 dagen')) {
            expectedFrequency = 2;
          } else if (descriptionLower.includes('3-daag') || descriptionLower.includes('3 daag') || descriptionLower.includes('3 dagen')) {
            expectedFrequency = 3;
          } else if (descriptionLower.includes('4-daag') || descriptionLower.includes('4 daag') || descriptionLower.includes('4 dagen')) {
            expectedFrequency = 4;
          } else if (descriptionLower.includes('5-daag') || descriptionLower.includes('5 daag') || descriptionLower.includes('5 dagen')) {
            expectedFrequency = 5;
          } else if (descriptionLower.includes('6-daag') || descriptionLower.includes('6 daag') || descriptionLower.includes('6 dagen')) {
            expectedFrequency = 6;
          }
        }
        
        if (expectedFrequency && workout.frequency !== expectedFrequency) {
          console.log(`   ❌ MISMATCH: ${schema.name}`);
          console.log(`      Expected: ${expectedFrequency} days (from name/description)`);
          console.log(`      Actual: ${workout.frequency} days (in workout data)`);
          console.log(`      Schema ID: ${schema.id}`);
          mismatchCount++;
        } else if (expectedFrequency) {
          console.log(`   ✅ MATCH: ${schema.name} - ${expectedFrequency} days`);
        } else {
          console.log(`   ⚠️  UNKNOWN: ${schema.name} - Could not determine expected frequency`);
        }
      } else {
        console.log(`   ❌ MISSING: ${schema.name} - No workout data found`);
      }
    });

    console.log('\n📊 MISMATCH SUMMARY:');
    console.log('================================');
    console.log(`   Total schemas: ${schemas.length}`);
    console.log(`   Mismatches found: ${mismatchCount}`);
    console.log(`   Matches: ${schemas.length - mismatchCount}`);

    if (mismatchCount > 0) {
      console.log('\n🔧 RECOMMENDATIONS:');
      console.log('================================');
      console.log('   1. Update workout data frequencies to match schema names');
      console.log('   2. Or update schema names to match workout data frequencies');
      console.log('   3. Ensure consistent frequency naming across the platform');
    }

  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugTrainingSchemaMismatch();
