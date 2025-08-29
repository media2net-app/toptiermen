// Script to fix nutrition portion values via API calls
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api/admin/nutrition-ingredients';

// Correct nutrition values for portion-based items
const portionCorrections = [
  {
    name: '1 Appel',
    // Average apple is ~180g, converting from per 100g to actual piece
    calories_per_100g: 94, // was 52 per 100g
    protein_per_100g: 0.5, // was 0.3 per 100g
    carbs_per_100g: 25.2, // was 14 per 100g
    fat_per_100g: 0.4, // was 0.2 per 100g
  },
  {
    name: '1 Banaan',
    // Average banana is ~120g
    calories_per_100g: 126, // was 105 per 100g
    protein_per_100g: 1.3, // was 1.1 per 100g
    carbs_per_100g: 27.6, // was 23 per 100g
    fat_per_100g: 0.4, // was 0.3 per 100g
  },
  {
    name: '1 Ei',
    // Average egg is ~50g
    calories_per_100g: 78, // was 155 per 100g
    protein_per_100g: 6.3, // was 12.5 per 100g
    carbs_per_100g: 0.6, // was 1.1 per 100g
    fat_per_100g: 5.6, // was 11.2 per 100g
  },
  {
    name: '1 Ei (gebakken)',
    // Average fried egg is ~50g
    calories_per_100g: 110, // was 220 per 100g
    protein_per_100g: 6.2, // was 12.4 per 100g
    carbs_per_100g: 0.1, // was 0.2 per 100g
    fat_per_100g: 9.2, // was 18.4 per 100g
  },
  {
    name: '1 Ei (gekookt)',
    // Average boiled egg is ~50g
    calories_per_100g: 64, // was 128 per 100g
    protein_per_100g: 6.2, // was 12.4 per 100g
    carbs_per_100g: 0, // was 0 per 100g
    fat_per_100g: 4.4, // was 8.8 per 100g
  },
  {
    name: '1 Ei (rauw)',
    // Average raw egg is ~50g
    calories_per_100g: 66, // was 132 per 100g
    protein_per_100g: 6.2, // was 12.4 per 100g
    carbs_per_100g: 0.1, // was 0.2 per 100g
    fat_per_100g: 4.6, // was 9.2 per 100g
  },
  {
    name: '1 Handje Amandelen',
    // Handful is ~30g
    calories_per_100g: 174, // was 579 per 100g
    protein_per_100g: 6.4, // was 21.2 per 100g
    carbs_per_100g: 6.5, // was 21.7 per 100g
    fat_per_100g: 15.0, // was 49.9 per 100g
  },
  {
    name: '1 Handje Cashewnoten',
    // Handful is ~30g
    calories_per_100g: 166, // was 553 per 100g
    protein_per_100g: 5.5, // was 18.2 per 100g
    carbs_per_100g: 9.1, // was 30.2 per 100g
    fat_per_100g: 13.1, // was 43.8 per 100g
  },
  {
    name: '1 Handje Hazelnoten',
    // Handful is ~30g
    calories_per_100g: 188, // was 628 per 100g
    protein_per_100g: 4.5, // was 15 per 100g
    carbs_per_100g: 5.0, // was 16.7 per 100g
    fat_per_100g: 18.2, // was 60.8 per 100g
  },
  {
    name: '1 Handje Macadamia Noten',
    // Handful is ~30g
    calories_per_100g: 215, // was 718 per 100g
    protein_per_100g: 2.4, // was 7.9 per 100g
    carbs_per_100g: 4.1, // was 13.8 per 100g
    fat_per_100g: 22.7, // was 75.8 per 100g
  },
  {
    name: '1 Handje Pecannoten',
    // Handful is ~30g
    calories_per_100g: 207, // was 691 per 100g
    protein_per_100g: 2.8, // was 9.2 per 100g
    carbs_per_100g: 4.2, // was 13.9 per 100g
    fat_per_100g: 21.6, // was 72 per 100g
  }
];

async function updatePortionNutritionValues() {
  console.log('🔄 Starting nutrition portion value corrections via API...');
  
  let updatedCount = 0;
  let errorCount = 0;
  
  // First, get all ingredients to find IDs
  try {
    const response = await fetch(API_BASE);
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Failed to fetch ingredients:', data.error);
      return;
    }
    
    const ingredients = data.ingredients;
    console.log(`📋 Found ${ingredients.length} total ingredients`);
    
    for (const correction of portionCorrections) {
      try {
        const ingredient = ingredients.find(ing => ing.name === correction.name);
        
        if (!ingredient) {
          console.log(`⚠️ Item not found: ${correction.name}`);
          continue;
        }
        
        console.log(`📝 Updating ${correction.name}...`);
        
        const updateResponse = await fetch(API_BASE, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: ingredient.id,
            ...correction
          })
        });
        
        const updateData = await updateResponse.json();
        
        if (!updateData.success) {
          console.error(`❌ Error updating ${correction.name}:`, updateData.error);
          errorCount++;
        } else {
          console.log(`✅ Updated ${correction.name}: ${correction.calories_per_100g} cal, ${correction.protein_per_100g}g protein, ${correction.carbs_per_100g}g carbs, ${correction.fat_per_100g}g fat`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Exception updating ${correction.name}:`, error.message);
        errorCount++;
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch ingredients:', error.message);
    return;
  }
  
  console.log('\n📊 Update Summary:');
  console.log(`✅ Successfully updated: ${updatedCount} items`);
  console.log(`❌ Errors: ${errorCount} items`);
  
  if (updatedCount > 0) {
    console.log('\n🎉 Nutrition portion values have been corrected!');
    console.log('Per-piece items (appel, banaan, ei) now show actual values per piece');
    console.log('Per-handful items (noten) now show values per ~30g handful');
  }
}

// Run the update
updatePortionNutritionValues()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
