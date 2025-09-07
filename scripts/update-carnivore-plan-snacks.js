const fs = require('fs');
const path = require('path');

// Read the current file
const filePath = path.join(__dirname, '../src/app/api/nutrition-plan-dynamic/route.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Define snack patterns for each day
const snackPatterns = {
  monday: {
    ontbijt_snack: [{ name: '1 Handje Macadamia Noten', baseAmount: 1, unit: 'handje' }],
    lunch_snack: [{ name: '1 Handje Pistachenoten', baseAmount: 1, unit: 'handje' }],
    diner_snack: [{ name: '1 Handje Macadamia Noten', baseAmount: 1, unit: 'handje' }]
  },
  tuesday: {
    ontbijt_snack: [{ name: '1 Handje Walnoten', baseAmount: 1, unit: 'handje' }],
    lunch_snack: [{ name: '1 Handje Macadamia Noten', baseAmount: 1, unit: 'handje' }],
    diner_snack: [{ name: '1 Handje Pistachenoten', baseAmount: 1, unit: 'handje' }]
  },
  wednesday: {
    ontbijt_snack: [{ name: '1 Handje Amandelen', baseAmount: 1, unit: 'handje' }],
    lunch_snack: [{ name: '1 Handje Walnoten', baseAmount: 1, unit: 'handje' }],
    diner_snack: [{ name: '1 Handje Macadamia Noten', baseAmount: 1, unit: 'handje' }]
  },
  thursday: {
    ontbijt_snack: [{ name: '1 Handje Pistachenoten', baseAmount: 1, unit: 'handje' }],
    lunch_snack: [{ name: '1 Handje Amandelen', baseAmount: 1, unit: 'handje' }],
    diner_snack: [{ name: '1 Handje Walnoten', baseAmount: 1, unit: 'handje' }]
  },
  friday: {
    ontbijt_snack: [{ name: '1 Handje Macadamia Noten', baseAmount: 1, unit: 'handje' }],
    lunch_snack: [{ name: '1 Handje Pistachenoten', baseAmount: 1, unit: 'handje' }],
    diner_snack: [{ name: '1 Handje Amandelen', baseAmount: 1, unit: 'handje' }]
  },
  saturday: {
    ontbijt_snack: [{ name: '1 Handje Walnoten', baseAmount: 1, unit: 'handje' }],
    lunch_snack: [{ name: '1 Handje Macadamia Noten', baseAmount: 1, unit: 'handje' }],
    diner_snack: [{ name: '1 Handje Pistachenoten', baseAmount: 1, unit: 'handje' }]
  },
  sunday: {
    ontbijt_snack: [{ name: '1 Handje Amandelen', baseAmount: 1, unit: 'handje' }],
    lunch_snack: [{ name: '1 Handje Walnoten', baseAmount: 1, unit: 'handje' }],
    diner_snack: [{ name: '1 Handje Macadamia Noten', baseAmount: 1, unit: 'handje' }]
  }
};

// Function to convert array to string format
function arrayToString(arr) {
  return JSON.stringify(arr, null, 6).replace(/"/g, "'");
}

// Update each day
Object.keys(snackPatterns).forEach(day => {
  const snacks = snackPatterns[day];
  
  // Find the day section and add snacks after diner
  const dayPattern = new RegExp(`(${day}:\\s*{[^}]*diner:\\s*\\[[^\\]]*\\][^}]*})`, 's');
  const match = content.match(dayPattern);
  
  if (match) {
    const dayContent = match[1];
    
    // Add snacks after diner
    let updatedDayContent = dayContent.replace(
      /(diner:\s*\[[^\]]*\][^}]*)/,
      `$1,\n    ontbijt_snack: ${arrayToString(snacks.ontbijt_snack)},\n    lunch_snack: ${arrayToString(snacks.lunch_snack)},\n    diner_snack: ${arrayToString(snacks.diner_snack)}`
    );
    
    // Replace in content
    content = content.replace(dayPattern, updatedDayContent);
    console.log(`✅ Updated ${day} with snacks`);
  } else {
    console.log(`❌ Could not find ${day} section`);
  }
});

// Also update the calculateBasePlanCalories function to include snacks
content = content.replace(
  /(\['ontbijt', 'lunch', 'diner'\]\.forEach\(mealType => {)/,
  "['ontbijt', 'lunch', 'diner', 'ontbijt_snack', 'lunch_snack', 'diner_snack'].forEach(mealType => {"
);

// Write the updated content back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Successfully updated carnivore plan with snacks!');
