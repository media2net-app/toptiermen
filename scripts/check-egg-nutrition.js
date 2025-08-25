require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEggNutrition() {
  try {
    console.log('🥚 Checking current egg nutrition values...\n');

    // Check what egg-related items exist in the database
    const { data: eggs, error } = await supabase
      .from('nutrition_ingredients')
      .select('name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, description')
      .or('name.ilike.%ei%,name.ilike.%egg%')
      .order('name');

    if (error) {
      console.error('❌ Error fetching eggs:', error);
      return;
    }

    if (eggs.length === 0) {
      console.log('📝 No egg items found in database');
      return;
    }

    console.log(`📊 Found ${eggs.length} egg items:\n`);
    
    eggs.forEach((egg, index) => {
      // Calculate expected calories from macros
      const calculatedCalories = Math.round((egg.protein_per_100g * 4) + (egg.carbs_per_100g * 4) + (egg.fat_per_100g * 9));
      const isAccurate = Math.abs(egg.calories_per_100g - calculatedCalories) <= 2;
      
      console.log(`${index + 1}. ${egg.name}`);
      console.log(`   Calories: ${egg.calories_per_100g} kcal (calculated: ${calculatedCalories} kcal) ${isAccurate ? '✅' : '❌'}`);
      console.log(`   Protein: ${egg.protein_per_100g}g`);
      console.log(`   Carbs: ${egg.carbs_per_100g}g`);
      console.log(`   Fat: ${egg.fat_per_100g}g`);
      console.log(`   Description: ${egg.description || 'N/A'}`);
      console.log('');
    });

    // Compare with correct values from Voedingscentrum
    console.log('📋 Correct values from Voedingscentrum (per 50g egg):');
    console.log('   Rauw ei: 66 kcal, 6.2g protein, 0.1g carbs, 4.6g fat');
    console.log('   Gekookt ei: 64 kcal, 6.2g protein, 0g carbs, 4.4g fat');
    console.log('   Gebakken ei: 110 kcal, 6.2g protein, 0.1g carbs, 9.2g fat');
    console.log('');
    console.log('💡 Per 100g zou dit zijn:');
    console.log('   Rauw ei: 132 kcal, 12.4g protein, 0.2g carbs, 9.2g fat');
    console.log('   Gekookt ei: 128 kcal, 12.4g protein, 0g carbs, 8.8g fat');
    console.log('   Gebakken ei: 220 kcal, 12.4g protein, 0.2g carbs, 18.4g fat');

  } catch (error) {
    console.error('❌ Error checking egg nutrition:', error);
  }
}

checkEggNutrition();
