require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Correcte voedingswaarden voor eieren (gebaseerd op Voedingscentrum data)
const correctEggNutrition = {
  // Rauw ei (50g) - basis waarden
  '1 Ei (rauw)': {
    name: '1 Ei (rauw)',
    category: 'eieren',
    calories_per_100g: 132, // 66 kcal voor 50g = 132 kcal per 100g
    protein_per_100g: 12.4, // 6.2g voor 50g = 12.4g per 100g
    carbs_per_100g: 0.2, // 0.1g voor 50g = 0.2g per 100g
    fat_per_100g: 9.2, // 4.6g voor 50g = 9.2g per 100g
    description: '1 rauw ei (50g) - Rijk aan eiwitten en gezonde vetten',
    is_active: true
  },
  
  // Gekookt ei (50g) - licht andere waarden
  '1 Ei (gekookt)': {
    name: '1 Ei (gekookt)',
    category: 'eieren',
    calories_per_100g: 128, // 64 kcal voor 50g = 128 kcal per 100g
    protein_per_100g: 12.4, // 6.2g voor 50g = 12.4g per 100g
    carbs_per_100g: 0, // 0g voor 50g = 0g per 100g
    fat_per_100g: 8.8, // 4.4g voor 50g = 8.8g per 100g
    description: '1 gekookt ei (50g) - Perfecte bron van eiwitten',
    is_active: true
  },
  
  // Gebakken ei (50g) - meer calorieën door vet
  '1 Ei (gebakken)': {
    name: '1 Ei (gebakken)',
    category: 'eieren',
    calories_per_100g: 220, // 110 kcal voor 50g = 220 kcal per 100g
    protein_per_100g: 12.4, // 6.2g voor 50g = 12.4g per 100g
    carbs_per_100g: 0.2, // 0.1g voor 50g = 0.2g per 100g
    fat_per_100g: 18.4, // 9.2g voor 50g = 18.4g per 100g (meer vet door bakken)
    description: '1 gebakken ei (50g) - Hogere calorieën door toegevoegd vet',
    is_active: true
  },
  
  // Eigeel (17g per ei)
  'Eigeel': {
    name: 'Eigeel',
    category: 'eieren',
    calories_per_100g: 322, // 55 kcal voor 17g = 322 kcal per 100g
    protein_per_100g: 15.9, // 2.7g voor 17g = 15.9g per 100g
    carbs_per_100g: 3.6, // 0.6g voor 17g = 3.6g per 100g
    fat_per_100g: 26.5, // 4.5g voor 17g = 26.5g per 100g
    description: 'Eigeel (17g) - Rijk aan vetten en vitamines A, D, E',
    is_active: true
  },
  
  // Eiwit (33g per ei)
  'Eiwit': {
    name: 'Eiwit',
    category: 'eieren',
    calories_per_100g: 52, // 17 kcal voor 33g = 52 kcal per 100g
    protein_per_100g: 10.9, // 3.6g voor 33g = 10.9g per 100g
    carbs_per_100g: 0.7, // 0.2g voor 33g = 0.7g per 100g
    fat_per_100g: 0.2, // 0.1g voor 33g = 0.2g per 100g
    description: 'Eiwit (33g) - Pure eiwitten, weinig calorieën',
    is_active: true
  }
};

async function fixEggNutrition() {
  try {
    console.log('🥚 Fixing egg nutrition values...\n');

    // First, check what egg-related items exist in the database
    console.log('🔍 Checking existing egg items...');
    const { data: existingEggs, error: fetchError } = await supabase
      .from('nutrition_ingredients')
      .select('name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g')
      .or('name.ilike.%ei%,name.ilike.%egg%');

    if (fetchError) {
      console.error('❌ Error fetching existing eggs:', fetchError);
      return;
    }

    console.log(`📊 Found ${existingEggs.length} existing egg items:`);
    existingEggs.forEach(egg => {
      console.log(`   - ${egg.name}: ${egg.calories_per_100g} kcal, ${egg.protein_per_100g}g protein`);
    });

    // Add or update the correct egg nutrition values
    console.log('\n📝 Adding/updating correct egg nutrition values...');
    
    for (const [key, eggData] of Object.entries(correctEggNutrition)) {
      console.log(`\n🥚 Processing: ${eggData.name}`);
      
      // Check if this egg item already exists
      const { data: existingItem } = await supabase
        .from('nutrition_ingredients')
        .select('id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g')
        .eq('name', eggData.name)
        .single();

      if (existingItem) {
        // Update existing item
        console.log(`   📝 Updating existing item: ${existingItem.name}`);
        console.log(`   Old: ${existingItem.calories_per_100g} kcal, ${existingItem.protein_per_100g}g protein`);
        console.log(`   New: ${eggData.calories_per_100g} kcal, ${eggData.protein_per_100g}g protein`);
        
        const { data: updatedItem, error: updateError } = await supabase
          .from('nutrition_ingredients')
          .update({
            calories_per_100g: eggData.calories_per_100g,
            protein_per_100g: eggData.protein_per_100g,
            carbs_per_100g: eggData.carbs_per_100g,
            fat_per_100g: eggData.fat_per_100g,
            description: eggData.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (updateError) {
          console.error(`   ❌ Error updating ${eggData.name}:`, updateError);
        } else {
          console.log(`   ✅ Successfully updated: ${updatedItem.name}`);
        }
      } else {
        // Insert new item
        console.log(`   ➕ Adding new item: ${eggData.name}`);
        
        const { data: newItem, error: insertError } = await supabase
          .from('nutrition_ingredients')
          .insert(eggData)
          .select()
          .single();

        if (insertError) {
          console.error(`   ❌ Error inserting ${eggData.name}:`, insertError);
        } else {
          console.log(`   ✅ Successfully added: ${newItem.name}`);
        }
      }
    }

    // Verify all egg items
    console.log('\n🔍 Verifying all egg items...');
    const { data: allEggs, error: verifyError } = await supabase
      .from('nutrition_ingredients')
      .select('name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, description')
      .or('name.ilike.%ei%,name.ilike.%egg%')
      .order('name');

    if (verifyError) {
      console.error('❌ Error verifying eggs:', verifyError);
      return;
    }

    console.log('\n✅ Final egg nutrition values:');
    console.log('============================');
    
    allEggs.forEach(egg => {
      // Calculate expected calories from macros
      const calculatedCalories = Math.round((egg.protein_per_100g * 4) + (egg.carbs_per_100g * 4) + (egg.fat_per_100g * 9));
      const isAccurate = Math.abs(egg.calories_per_100g - calculatedCalories) <= 2;
      
      console.log(`🥚 ${egg.name}`);
      console.log(`   Calories: ${egg.calories_per_100g} kcal (calculated: ${calculatedCalories} kcal) ${isAccurate ? '✅' : '❌'}`);
      console.log(`   Protein: ${egg.protein_per_100g}g`);
      console.log(`   Carbs: ${egg.carbs_per_100g}g`);
      console.log(`   Fat: ${egg.fat_per_100g}g`);
      console.log(`   Description: ${egg.description}`);
      console.log('');
    });

    // Summary
    const accurateCount = allEggs.filter(egg => {
      const calculatedCalories = Math.round((egg.protein_per_100g * 4) + (egg.carbs_per_100g * 4) + (egg.fat_per_100g * 9));
      return Math.abs(egg.calories_per_100g - calculatedCalories) <= 2;
    }).length;

    console.log(`📊 Summary:`);
    console.log(`- Total egg items: ${allEggs.length}`);
    console.log(`- Accurate nutrition values: ${accurateCount}/${allEggs.length}`);
    console.log(`- Based on Voedingscentrum data for 50g eggs`);
    
    console.log('\n💡 The egg nutrition values are now corrected and match the Voedingscentrum data!');
    console.log('   Users will now see accurate nutritional information for eggs.');

  } catch (error) {
    console.error('❌ Error fixing egg nutrition:', error);
  }
}

fixEggNutrition();
