// Script to fix macro inconsistencies in nutrition database
const http = require('http');

async function fixMacros() {
  try {
    console.log('🔧 Fixing macro inconsistencies...\n');
    
    const data = await fetch('http://localhost:6001/api/admin/nutrition-ingredients');
    const result = await data.json();
    
    let fixedCount = 0;
    let totalItems = result.ingredients.length;
    
    for (const item of result.ingredients) {
      // Calculate correct calories from macros
      const correctCalories = Math.round((item.protein_per_100g * 4) + (item.carbs_per_100g * 4) + (item.fat_per_100g * 9));
      const difference = Math.abs(item.calories_per_100g - correctCalories);
      const percentageDiff = (difference / item.calories_per_100g) * 100;
      
      // Fix if difference is significant (>5%)
      if (percentageDiff > 5) {
        console.log(`🔧 Fixing ${item.name}:`);
        console.log(`   Old: ${item.calories_per_100g} kcal`);
        console.log(`   New: ${correctCalories} kcal`);
        console.log(`   Difference: ${difference} kcal (${percentageDiff.toFixed(1)}%)`);
        
        // Update the item
        const updateData = {
          ...item,
          calories_per_100g: correctCalories,
          updated_at: new Date().toISOString()
        };
        
        // Send update request
        await updateNutritionItem(item.id, updateData);
        fixedCount++;
        console.log(`   ✅ Fixed!\n`);
      }
    }
    
    console.log(`📊 Summary:`);
    console.log(`   Total items checked: ${totalItems}`);
    console.log(`   Items fixed: ${fixedCount}`);
    console.log(`   Items unchanged: ${totalItems - fixedCount}`);
    
    if (fixedCount > 0) {
      console.log(`✅ Successfully fixed ${fixedCount} macro inconsistencies!`);
    } else {
      console.log(`✅ All macros are already consistent!`);
    }
    
  } catch (error) {
    console.error('Error fixing macros:', error);
  }
}

async function updateNutritionItem(id, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 6001,
      path: `/api/admin/nutrition-ingredients`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
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

fixMacros();
