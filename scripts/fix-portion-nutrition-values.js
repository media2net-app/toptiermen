const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Correct nutrition values for portion-based items
const portionCorrections = {
  // Per piece items - convert from per 100g to actual piece values
  '1 Appel': {
    // Average apple is ~180g, current values are per 100g
    calories_per_100g: Math.round(52 * 1.8), // 94 calories per apple
    protein_per_100g: Math.round(0.3 * 1.8 * 10) / 10, // 0.5g protein
    carbs_per_100g: Math.round(14 * 1.8 * 10) / 10, // 25.2g carbs
    fat_per_100g: Math.round(0.2 * 1.8 * 10) / 10, // 0.4g fat
  },
  
  '1 Banaan': {
    // Average banana is ~120g, current values are per 100g
    calories_per_100g: Math.round(105 * 1.2), // 126 calories per banana
    protein_per_100g: Math.round(1.1 * 1.2 * 10) / 10, // 1.3g protein
    carbs_per_100g: Math.round(23 * 1.2 * 10) / 10, // 27.6g carbs
    fat_per_100g: Math.round(0.3 * 1.2 * 10) / 10, // 0.4g fat
  },
  
  '1 Ei': {
    // Average egg is ~50g, current values are per 100g
    calories_per_100g: Math.round(155 * 0.5), // 78 calories per egg
    protein_per_100g: Math.round(12.5 * 0.5 * 10) / 10, // 6.3g protein
    carbs_per_100g: Math.round(1.1 * 0.5 * 10) / 10, // 0.6g carbs
    fat_per_100g: Math.round(11.2 * 0.5 * 10) / 10, // 5.6g fat
  },
  
  '1 Ei (gebakken)': {
    // Average fried egg is ~50g, current values are per 100g
    calories_per_100g: Math.round(220 * 0.5), // 110 calories per fried egg
    protein_per_100g: Math.round(12.4 * 0.5 * 10) / 10, // 6.2g protein
    carbs_per_100g: Math.round(0.2 * 0.5 * 10) / 10, // 0.1g carbs
    fat_per_100g: Math.round(18.4 * 0.5 * 10) / 10, // 9.2g fat
  },
  
  '1 Ei (gekookt)': {
    // Average boiled egg is ~50g, current values are per 100g
    calories_per_100g: Math.round(128 * 0.5), // 64 calories per boiled egg
    protein_per_100g: Math.round(12.4 * 0.5 * 10) / 10, // 6.2g protein
    carbs_per_100g: Math.round(0 * 0.5 * 10) / 10, // 0g carbs
    fat_per_100g: Math.round(8.8 * 0.5 * 10) / 10, // 4.4g fat
  },
  
  '1 Ei (rauw)': {
    // Average raw egg is ~50g, current values are per 100g
    calories_per_100g: Math.round(132 * 0.5), // 66 calories per raw egg
    protein_per_100g: Math.round(12.4 * 0.5 * 10) / 10, // 6.2g protein
    carbs_per_100g: Math.round(0.2 * 0.5 * 10) / 10, // 0.1g carbs
    fat_per_100g: Math.round(9.2 * 0.5 * 10) / 10, // 4.6g fat
  },
  
  // Per handful items - convert from per 100g to ~30g handful
  '1 Handje Amandelen': {
    // Handful is ~30g, current values are per 100g
    calories_per_100g: Math.round(579 * 0.3), // 174 calories per handful
    protein_per_100g: Math.round(21.2 * 0.3 * 10) / 10, // 6.4g protein
    carbs_per_100g: Math.round(21.7 * 0.3 * 10) / 10, // 6.5g carbs
    fat_per_100g: Math.round(49.9 * 0.3 * 10) / 10, // 15.0g fat
  },
  
  '1 Handje Cashewnoten': {
    // Handful is ~30g, current values are per 100g
    calories_per_100g: Math.round(553 * 0.3), // 166 calories per handful
    protein_per_100g: Math.round(18.2 * 0.3 * 10) / 10, // 5.5g protein
    carbs_per_100g: Math.round(30.2 * 0.3 * 10) / 10, // 9.1g carbs
    fat_per_100g: Math.round(43.8 * 0.3 * 10) / 10, // 13.1g fat
  },
  
  '1 Handje Hazelnoten': {
    // Handful is ~30g, current values are per 100g
    calories_per_100g: Math.round(628 * 0.3), // 188 calories per handful
    protein_per_100g: Math.round(15 * 0.3 * 10) / 10, // 4.5g protein
    carbs_per_100g: Math.round(16.7 * 0.3 * 10) / 10, // 5.0g carbs
    fat_per_100g: Math.round(60.8 * 0.3 * 10) / 10, // 18.2g fat
  },
  
  '1 Handje Macadamia Noten': {
    // Handful is ~30g, current values are per 100g
    calories_per_100g: Math.round(718 * 0.3), // 215 calories per handful
    protein_per_100g: Math.round(7.9 * 0.3 * 10) / 10, // 2.4g protein
    carbs_per_100g: Math.round(13.8 * 0.3 * 10) / 10, // 4.1g carbs
    fat_per_100g: Math.round(75.8 * 0.3 * 10) / 10, // 22.7g fat
  },
  
  '1 Handje Pecannoten': {
    // Handful is ~30g, current values are per 100g
    calories_per_100g: Math.round(691 * 0.3), // 207 calories per handful
    protein_per_100g: Math.round(9.2 * 0.3 * 10) / 10, // 2.8g protein
    carbs_per_100g: Math.round(13.9 * 0.3 * 10) / 10, // 4.2g carbs
    fat_per_100g: Math.round(72 * 0.3 * 10) / 10, // 21.6g fat
  }
};

async function updatePortionNutritionValues() {
  console.log('🔄 Starting nutrition portion value corrections...');
  
  let updatedCount = 0;
  let errorCount = 0;
  
  for (const [itemName, corrections] of Object.entries(portionCorrections)) {
    try {
      console.log(`📝 Updating ${itemName}...`);
      
      const { data, error } = await supabase
        .from('nutrition_ingredients')
        .update(corrections)
        .eq('name', itemName)
        .select();
      
      if (error) {
        console.error(`❌ Error updating ${itemName}:`, error);
        errorCount++;
      } else if (data && data.length > 0) {
        console.log(`✅ Updated ${itemName}: ${corrections.calories_per_100g} cal, ${corrections.protein_per_100g}g protein, ${corrections.carbs_per_100g}g carbs, ${corrections.fat_per_100g}g fat`);
        updatedCount++;
      } else {
        console.log(`⚠️ Item not found: ${itemName}`);
      }
    } catch (error) {
      console.error(`❌ Exception updating ${itemName}:`, error);
      errorCount++;
    }
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
