const fs = require('fs');
const path = require('path');

// Read the training schema file
const filePath = path.join(__dirname, 'src/data/training-schema-workouts.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('🔍 Fixing ALL training schemas to match database standards...');

let totalFixed = 0;
const schemaTypes = {
  'Kracht & Uithouding': { reps: '15-20', rest: '45-60 sec' },
  'Power & Kracht': { reps: '3-6', rest: '150-180 sec' },
  'Foundation & Muscle Building': { reps: '8-12', rest: '60-90 sec' },
  'Spiermassa': { reps: '8-12', rest: '60-90 sec' },
  'Bodyweight Kracht': { reps: '15-20', rest: '45-60 sec' }
};

// Function to determine schema type based on name and description
function getSchemaType(schema) {
  const name = schema.name.toLowerCase();
  const description = schema.description.toLowerCase();
  
  if (name.includes('kracht & uithouding') || description.includes('uithoudingsvermogen')) {
    return 'Kracht & Uithouding';
  }
  if (name.includes('power & kracht') || description.includes('pure kracht en power')) {
    return 'Power & Kracht';
  }
  if (name.includes('foundation & muscle building') || description.includes('spiergroei')) {
    return 'Foundation & Muscle Building';
  }
  if (name.includes('spiermassa') || description.includes('spiermassa')) {
    return 'Spiermassa';
  }
  if (name.includes('bodyweight kracht')) {
    return 'Bodyweight Kracht';
  }
  
  // Default fallback based on description content
  if (description.includes('15-20') && description.includes('40-60')) {
    return 'Kracht & Uithouding';
  }
  if (description.includes('3-6') && description.includes('150-180')) {
    return 'Power & Kracht';
  }
  if (description.includes('8-12') && description.includes('90')) {
    return 'Foundation & Muscle Building';
  }
  
  return null;
}

// Process all schemas
Object.keys(data).forEach(schemaId => {
  const schema = data[schemaId];
  const schemaType = getSchemaType(schema);
  
  if (!schemaType) {
    console.log(`⚠️  Could not determine type for: ${schema.name}`);
    return;
  }
  
  const expectedValues = schemaTypes[schemaType];
  console.log(`\n🏋️ ${schema.name} (${schemaType})`);
  console.log(`   Expected: ${expectedValues.reps} reps, ${expectedValues.rest} rest`);
  
  let exerciseCount = 0;
  
  // Update all exercises in this schema
  schema.days.forEach(day => {
    day.exercises.forEach(exercise => {
      let updated = false;
      
      // Update reps
      if (exercise.reps !== expectedValues.reps) {
        const oldReps = exercise.reps;
        exercise.reps = expectedValues.reps;
        updated = true;
        console.log(`     📝 ${exercise.name}: ${oldReps} → ${expectedValues.reps}`);
      }
      
      // Update rest time
      if (exercise.rest !== expectedValues.rest) {
        const oldRest = exercise.rest;
        exercise.rest = expectedValues.rest;
        updated = true;
        console.log(`     ⏱️  ${exercise.name}: ${oldRest} → ${expectedValues.rest}`);
      }
      
      if (updated) {
        exerciseCount++;
      }
    });
  });
  
  if (exerciseCount > 0) {
    console.log(`   ✅ Updated ${exerciseCount} exercises`);
    totalFixed += exerciseCount;
  } else {
    console.log(`   ✅ Already correct`);
  }
});

// Write the updated data back to the file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

console.log(`\n🎉 Fixed ${totalFixed} exercises across all training schemas!`);
console.log('📁 Updated training-schema-workouts.json');
console.log('\n📊 Summary by type:');
Object.keys(schemaTypes).forEach(type => {
  console.log(`   - ${type}: ${schemaTypes[type].reps} reps, ${schemaTypes[type].rest} rest`);
});
