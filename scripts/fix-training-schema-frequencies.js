const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixTrainingSchemaFrequencies() {
  console.log('🔧 Fixing Training Schema Frequency Mismatches...\n');

  try {
    // 1. Load current workout data
    console.log('1️⃣ Loading current workout data...');
    const workoutData = require('../src/data/training-schema-workouts.json');
    
    // 2. Define the fixes needed
    const frequencyFixes = {
      // 4x Split schemas should have 4 days
      'b6b668bc-78e1-42ec-8494-a2f188660e71': 4, // 4x Split - Kracht & Uithouding
      '469a1512-8252-4dc2-9849-7510d7fe637b': 4, // 4x Split - Power & Kracht
      '69a7cad0-786d-4855-bddb-7206c356f415': 4, // 4x Split Training - Spiermassa
      
      // 5x Split schemas should have 5 days
      '2c6d09bf-e602-4369-9c80-e80085e4cf42': 5, // 5x Split - Kracht & Uithouding
      '7048080c-87b9-424f-a502-af2ea09d5f6b': 5, // 5x Split - Power & Kracht
      '4b9952ad-a0f1-498a-9521-01c5901c0f08': 5, // 5x Split Training - Spiermassa
      
      // 6x Split schemas should have 6 days
      'd5739133-ff3c-4740-bc69-dc779b4ac336': 6, // 6x Split - Kracht & Uithouding
      'a2fe31d9-781f-4241-84aa-60e6055bc069': 6, // 6x Split - Power & Kracht
      'cd2fcb31-8c56-4296-abda-83ed4d1eac21': 6, // 6x Split Training - Spiermassa
    };

    // 3. Update workout data
    console.log('2️⃣ Updating workout data frequencies...');
    let updatedCount = 0;
    
    Object.keys(frequencyFixes).forEach(schemaId => {
      const newFrequency = frequencyFixes[schemaId];
      const currentWorkout = workoutData[schemaId];
      
      if (currentWorkout) {
        console.log(`   Updating ${currentWorkout.name}: ${currentWorkout.frequency} → ${newFrequency} days`);
        
        // Update frequency
        currentWorkout.frequency = newFrequency;
        
        // Generate additional days if needed
        const currentDays = currentWorkout.days.length;
        if (currentDays < newFrequency) {
          console.log(`     Adding ${newFrequency - currentDays} more workout days...`);
          
          // Generate additional days based on the pattern
          for (let i = currentDays + 1; i <= newFrequency; i++) {
            const newDay = {
              day: i,
              name: `Workout Day ${i}`,
              focus: `Dag ${i} Focus`,
              exercises: currentWorkout.days[0].exercises.map(exercise => ({
                ...exercise,
                name: `${exercise.name} (Dag ${i})`
              }))
            };
            currentWorkout.days.push(newDay);
          }
        } else if (currentDays > newFrequency) {
          console.log(`     Removing ${currentDays - newFrequency} workout days...`);
          currentWorkout.days = currentWorkout.days.slice(0, newFrequency);
        }
        
        updatedCount++;
      } else {
        console.log(`   ❌ Schema ${schemaId} not found in workout data`);
      }
    });

    // 4. Save updated workout data
    console.log('\n3️⃣ Saving updated workout data...');
    const fs = require('fs');
    const path = require('path');
    
    const outputPath = path.join(__dirname, '../src/data/training-schema-workouts.json');
    fs.writeFileSync(outputPath, JSON.stringify(workoutData, null, 2));
    
    console.log(`✅ Updated workout data saved to: ${outputPath}`);

    // 5. Verify the fixes
    console.log('\n4️⃣ Verifying fixes...');
    Object.keys(frequencyFixes).forEach(schemaId => {
      const workout = workoutData[schemaId];
      const expectedFrequency = frequencyFixes[schemaId];
      
      if (workout && workout.frequency === expectedFrequency) {
        console.log(`   ✅ ${workout.name}: ${workout.frequency} days (${workout.days.length} workout days)`);
      } else {
        console.log(`   ❌ ${workout?.name || schemaId}: Expected ${expectedFrequency}, got ${workout?.frequency}`);
      }
    });

    console.log('\n🎉 Training schema frequency fixes completed!');
    console.log(`   Updated ${updatedCount} schemas`);
    console.log('   All mismatches should now be resolved');

  } catch (error) {
    console.error('❌ Error in fix:', error);
  }
}

fixTrainingSchemaFrequencies();
