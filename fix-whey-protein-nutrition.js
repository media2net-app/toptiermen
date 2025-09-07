const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixWheyProteinNutrition() {
  try {
    console.log('🔧 Fixing Whey Protein nutrition values...');

    // Correct nutrition values for Whey Protein (per scoop/30g)
    const correctWheyNutrition = {
      name: 'Whey Eiwit Shakes',
      calories_per_100g: 400, // 120 cal per 30g = 400 cal per 100g
      protein_per_100g: 83.3, // 25g per 30g = 83.3g per 100g
      carbs_per_100g: 10, // 3g per 30g = 10g per 100g
      fat_per_100g: 3.3, // 1g per 30g = 3.3g per 100g
      unit_type: 'per_30g' // Per scoop (30g)
    };

    // Update the whey protein nutrition values
    const { data, error } = await supabase
      .from('nutrition_ingredients')
      .update({
        calories_per_100g: correctWheyNutrition.calories_per_100g,
        protein_per_100g: correctWheyNutrition.protein_per_100g,
        carbs_per_100g: correctWheyNutrition.carbs_per_100g,
        fat_per_100g: correctWheyNutrition.fat_per_100g,
        unit_type: correctWheyNutrition.unit_type
      })
      .eq('name', 'Whey Eiwit Shakes')
      .select();

    if (error) {
      console.error('❌ Error updating whey protein nutrition:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Successfully updated Whey Eiwit Shakes nutrition values:');
      console.log('  - Calories per 100g:', correctWheyNutrition.calories_per_100g);
      console.log('  - Protein per 100g:', correctWheyNutrition.protein_per_100g);
      console.log('  - Carbs per 100g:', correctWheyNutrition.carbs_per_100g);
      console.log('  - Fat per 100g:', correctWheyNutrition.fat_per_100g);
      console.log('  - Unit type:', correctWheyNutrition.unit_type);
      console.log('  - Per scoop (30g): 120 cal, 25g protein, 3g carbs, 1g fat');
    } else {
      console.log('⚠️ No whey protein ingredient found to update');
    }

    // Also check if there are other whey protein variations
    const { data: wheyVariations, error: wheyError } = await supabase
      .from('nutrition_ingredients')
      .select('*')
      .or('name.ilike.%whey%,name.ilike.%wei%,name.ilike.%protein%');

    if (wheyError) {
      console.error('❌ Error checking whey variations:', wheyError);
    } else if (wheyVariations && wheyVariations.length > 0) {
      console.log('📋 Found whey protein variations:');
      wheyVariations.forEach(ingredient => {
        console.log(`  - ${ingredient.name}: ${ingredient.calories_per_100g} cal, ${ingredient.protein_per_100g}g protein, unit: ${ingredient.unit_type}`);
      });
    }

  } catch (error) {
    console.error('❌ Error fixing whey protein nutrition:', error);
  }
}

fixWheyProteinNutrition();
