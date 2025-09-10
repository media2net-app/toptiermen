const fs = require('fs');
const path = require('path');

// Read the training schema file
const filePath = path.join(__dirname, 'src/data/training-schema-workouts.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('🔍 Fixing Kracht & Uithouding schemas...');

let fixedCount = 0;

// Find all schemas with "Kracht & Uithouding" in the name
Object.keys(data).forEach(schemaId => {
  const schema = data[schemaId];
  
  if (schema.name && schema.name.includes('Kracht & Uithouding')) {
    console.log(`\n🏋️ Found schema: ${schema.name}`);
    
    let exerciseCount = 0;
    
    // Update all exercises in this schema
    schema.days.forEach(day => {
      day.exercises.forEach(exercise => {
        // Update reps to 15-20 for kracht & uithouding
        if (exercise.reps === '8-12') {
          exercise.reps = '15-20';
          exerciseCount++;
        }
        
        // Update rest time to 45-60 seconds for kracht & uithouding
        if (exercise.rest === '60-90 sec') {
          exercise.rest = '45-60 sec';
        }
      });
    });
    
    console.log(`   ✅ Updated ${exerciseCount} exercises`);
    console.log(`   📝 Reps: 8-12 → 15-20`);
    console.log(`   ⏱️  Rest: 60-90 sec → 45-60 sec`);
    
    fixedCount++;
  }
});

// Write the updated data back to the file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

console.log(`\n🎉 Fixed ${fixedCount} Kracht & Uithouding schemas!`);
console.log('📁 Updated training-schema-workouts.json');
