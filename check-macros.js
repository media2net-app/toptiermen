// Script to check macro consistency in nutrition database
const http = require('http');

async function checkMacros() {
  try {
    const data = await fetch('http://localhost:6001/api/admin/nutrition-ingredients');
    const result = await data.json();
    
    console.log('🔍 Checking macro consistency for', result.ingredients.length, 'items...\n');
    
    let issues = 0;
    let totalItems = 0;
    
    result.ingredients.forEach(item => {
      totalItems++;
      
      // Calculate expected calories from macros
      const expectedCalories = (item.protein_per_100g * 4) + (item.carbs_per_100g * 4) + (item.fat_per_100g * 9);
      const difference = Math.abs(item.calories_per_100g - expectedCalories);
      const percentageDiff = (difference / item.calories_per_100g) * 100;
      
      // Check if difference is significant (>5%)
      if (percentageDiff > 5) {
        issues++;
        console.log(`❌ ${item.name}:`);
        console.log(`   Stated: ${item.calories_per_100g} kcal`);
        console.log(`   Calculated: ${expectedCalories.toFixed(1)} kcal`);
        console.log(`   Difference: ${difference.toFixed(1)} kcal (${percentageDiff.toFixed(1)}%)`);
        console.log(`   Macros: ${item.protein_per_100g}g protein, ${item.carbs_per_100g}g carbs, ${item.fat_per_100g}g fat`);
        console.log('');
      }
    });
    
    console.log(`📊 Summary:`);
    console.log(`   Total items checked: ${totalItems}`);
    console.log(`   Items with macro issues: ${issues}`);
    console.log(`   Accuracy rate: ${((totalItems - issues) / totalItems * 100).toFixed(1)}%`);
    
    if (issues === 0) {
      console.log('✅ All macros are consistent!');
    } else {
      console.log(`⚠️  ${issues} items need macro correction`);
    }
    
  } catch (error) {
    console.error('Error checking macros:', error);
  }
}

// Simple fetch implementation for Node.js
function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ json: () => JSON.parse(data) });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

checkMacros();
