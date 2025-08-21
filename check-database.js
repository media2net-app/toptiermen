// Script to directly check the database for nutrition ingredients
const http = require('http');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database directly...\n');
    
    const data = await fetch('http://localhost:6001/api/admin/nutrition-ingredients');
    const result = await data.json();
    
    console.log(`📊 Database contains ${result.ingredients.length} items:\n`);
    
    result.ingredients.forEach((item, index) => {
      const calculated = Math.round((item.protein_per_100g * 4) + (item.carbs_per_100g * 4) + (item.fat_per_100g * 9));
      const isCorrect = Math.abs(item.calories_per_100g - calculated) <= 1;
      
      console.log(`${index + 1}. ${item.name} (ID: ${item.id})`);
      console.log(`   Calories: ${item.calories_per_100g} kcal`);
      console.log(`   Calculated: ${calculated} kcal`);
      console.log(`   Status: ${isCorrect ? '✅ Correct' : '❌ Incorrect'}`);
      console.log(`   Macros: ${item.protein_per_100g}g protein, ${item.carbs_per_100g}g carbs, ${item.fat_per_100g}g fat`);
      console.log('');
    });
    
    const correctCount = result.ingredients.filter(item => {
      const calculated = Math.round((item.protein_per_100g * 4) + (item.carbs_per_100g * 4) + (item.fat_per_100g * 9));
      return Math.abs(item.calories_per_100g - calculated) <= 1;
    }).length;
    
    console.log(`📈 Summary: ${correctCount}/${result.ingredients.length} items have correct macros`);
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

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

checkDatabase();
