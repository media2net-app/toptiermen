const http = require('http');

async function checkCarnivoreIngredients() {
  try {
    console.log('🥩 Checking available ingredients for carnivore diet...\n');

    // Fetch all ingredients
    const response = await makeRequest('/api/admin/nutrition-ingredients', 'GET');
    
    if (response.success && response.ingredients) {
      const ingredients = response.ingredients;
      
      console.log(`📊 Total ingredients available: ${ingredients.length}\n`);
      
      // Filter carnivore-friendly ingredients
      const carnivoreIngredients = ingredients.filter(ingredient => {
        const category = ingredient.category?.toLowerCase();
        const name = ingredient.name?.toLowerCase();
        
        return (
          category === 'vlees' ||
          category === 'eieren' ||
          category === 'vis' ||
          category === 'zuivel' ||
          category === 'vetten' ||
          name.includes('boter') ||
          name.includes('reuzel') ||
          name.includes('talow') ||
          name.includes('spek') ||
          name.includes('worst') ||
          name.includes('lever') ||
          name.includes('hart') ||
          name.includes('nieren')
        );
      });
      
      console.log(`🥩 Carnivore-friendly ingredients found: ${carnivoreIngredients.length}\n`);
      
      // Group by category
      const groupedIngredients = {};
      carnivoreIngredients.forEach(ingredient => {
        const category = ingredient.category || 'Overig';
        if (!groupedIngredients[category]) {
          groupedIngredients[category] = [];
        }
        groupedIngredients[category].push(ingredient);
      });
      
      // Display grouped ingredients
      Object.entries(groupedIngredients).forEach(([category, items]) => {
        console.log(`📂 ${category.toUpperCase()} (${items.length} items):`);
        items.forEach(item => {
          console.log(`   • ${item.name}`);
          console.log(`     Calories: ${item.calories_per_100g} kcal/100g`);
          console.log(`     Protein: ${item.protein_per_100g}g, Carbs: ${item.carbs_per_100g}g, Fat: ${item.fat_per_100g}g`);
          console.log('');
        });
      });
      
      // Show some fruit options (limited for carnivore)
      console.log('🍎 Limited fruit options (for carnivore):');
      const fruitOptions = ingredients.filter(ingredient => 
        ingredient.category?.toLowerCase() === 'fruit'
      ).slice(0, 5);
      
      fruitOptions.forEach(fruit => {
        console.log(`   • ${fruit.name} - ${fruit.carbs_per_100g}g carbs/100g`);
      });
      
      console.log('\n📋 Carnivore Diet Guidelines:');
      console.log('='.repeat(50));
      console.log('✅ Primary foods: Meat, fish, eggs, organ meats');
      console.log('✅ Fats: Butter, tallow, lard, ghee');
      console.log('✅ Limited: Small amounts of low-carb fruits');
      console.log('❌ Avoid: Grains, legumes, most vegetables, processed foods');
      console.log('❌ Avoid: High-carb fruits, dairy (except butter/ghee)');
      
    } else {
      console.log('❌ Failed to fetch ingredients');
    }

  } catch (error) {
    console.error('❌ Error checking ingredients:', error.message);
  }
}

function makeRequest(path, method) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = JSON.parse(responseData);
            resolve(result);
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

checkCarnivoreIngredients();
