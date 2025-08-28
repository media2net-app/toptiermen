const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addNutritionRecipes() {
  console.log('🍳 Adding nutrition recipes to database...');
  
  const recipes = [
    {
      name: 'Havermout met Banaan en Noten',
      description: 'Gezond ontbijt met complexe koolhydraten en eiwitten',
      meal_type: 'Ontbijt',
      suitable_plans: ['Gebalanceerd', 'High Protein'],
      calories_per_serving: 350,
      protein_per_serving: 15,
      carbs_per_serving: 45,
      fat_per_serving: 12,
      servings: 1,
      prep_time_minutes: 10,
      difficulty: 'beginner',
      instructions: '1. Kook 50g havermout met 200ml water\n2. Snijd banaan in plakjes\n3. Hak noten fijn\n4. Meng alles door elkaar\n5. Bestrooi met kaneel'
    },
    {
      name: 'Gegrilde Kipfilet met Groenten',
      description: 'Mager eiwit met verse groenten',
      meal_type: 'Lunch',
      suitable_plans: ['Gebalanceerd', 'High Protein', 'Koolhydraatarm / Keto'],
      calories_per_serving: 280,
      protein_per_serving: 35,
      carbs_per_serving: 8,
      fat_per_serving: 12,
      servings: 1,
      prep_time_minutes: 20,
      difficulty: 'beginner',
      instructions: '1. Grill kipfilet 6-8 minuten per kant\n2. Roerbak groenten in olijfolie\n3. Kruid met peper en zout\n4. Serveer samen'
    },
    {
      name: 'Eieren met Spek',
      description: 'Keto-vriendelijk ontbijt rijk aan vetten',
      meal_type: 'Ontbijt',
      suitable_plans: ['Koolhydraatarm / Keto', 'Carnivoor (Rick\'s Aanpak)'],
      calories_per_serving: 450,
      protein_per_serving: 25,
      carbs_per_serving: 3,
      fat_per_serving: 35,
      servings: 1,
      prep_time_minutes: 15,
      difficulty: 'beginner',
      instructions: '1. Bak spek knapperig\n2. Bak eieren in spekvet\n3. Serveer samen'
    },
    {
      name: 'Gegrilde Ribeye Steak',
      description: 'Vetrijke steak perfect voor keto',
      meal_type: 'Diner',
      suitable_plans: ['Koolhydraatarm / Keto', 'Carnivoor (Rick\'s Aanpak)'],
      calories_per_serving: 520,
      protein_per_serving: 35,
      carbs_per_serving: 0,
      fat_per_serving: 40,
      servings: 1,
      prep_time_minutes: 20,
      difficulty: 'intermediate',
      instructions: '1. Grill ribeye 4-5 minuten per kant\n2. Laat 5 minuten rusten\n3. Serveer met boter\n4. Kruid met peper en zout'
    },
    {
      name: 'Whey Protein Shake',
      description: 'Eiwitrijk ontbijt voor spieropbouw',
      meal_type: 'Ontbijt',
      suitable_plans: ['High Protein', 'Gebalanceerd'],
      calories_per_serving: 380,
      protein_per_serving: 45,
      carbs_per_serving: 35,
      fat_per_serving: 8,
      servings: 1,
      prep_time_minutes: 5,
      difficulty: 'beginner',
      instructions: '1. Meng whey protein met melk\n2. Blend tot smoothie\n3. Serveer direct'
    },
    {
      name: 'Magere Kwark met Noten',
      description: 'Eiwitrijke lunch voor herstel',
      meal_type: 'Lunch',
      suitable_plans: ['High Protein', 'Gebalanceerd'],
      calories_per_serving: 320,
      protein_per_serving: 35,
      carbs_per_serving: 15,
      fat_per_serving: 12,
      servings: 1,
      prep_time_minutes: 5,
      difficulty: 'beginner',
      instructions: '1. Meng kwark met noten\n2. Voeg kaneel toe\n3. Roer goed door\n4. Serveer koud'
    },
    {
      name: 'Orgaanvlees Mix',
      description: 'Traditioneel carnivoor ontbijt',
      meal_type: 'Ontbijt',
      suitable_plans: ['Carnivoor (Rick\'s Aanpak)'],
      calories_per_serving: 280,
      protein_per_serving: 35,
      carbs_per_serving: 2,
      fat_per_serving: 15,
      servings: 1,
      prep_time_minutes: 20,
      difficulty: 'advanced',
      instructions: '1. Bak lever 2-3 minuten per kant\n2. Bak hart en nieren\n3. Kruid met zout\n4. Serveer warm'
    },
    {
      name: 'Gegrilde T-Bone Steak',
      description: 'Klassieke carnivoor lunch',
      meal_type: 'Lunch',
      suitable_plans: ['Carnivoor (Rick\'s Aanpak)'],
      calories_per_serving: 450,
      protein_per_serving: 40,
      carbs_per_serving: 0,
      fat_per_serving: 30,
      servings: 1,
      prep_time_minutes: 25,
      difficulty: 'intermediate',
      instructions: '1. Grill T-bone 5-6 minuten per kant\n2. Laat 10 minuten rusten\n3. Snijd tegen de draad\n4. Serveer met reuzel'
    },
    {
      name: 'Noten Mix',
      description: 'Gezonde snack rijk aan gezonde vetten',
      meal_type: 'Snack',
      suitable_plans: ['Gebalanceerd', 'Koolhydraatarm / Keto', 'High Protein'],
      calories_per_serving: 180,
      protein_per_serving: 8,
      carbs_per_serving: 12,
      fat_per_serving: 15,
      servings: 1,
      prep_time_minutes: 2,
      difficulty: 'beginner',
      instructions: '1. Meng verschillende noten\n2. Portioneer in kleine zakjes\n3. Bewaar in koelkast\n4. Eet als snack'
    },
    {
      name: 'Zalm met Basmati Rijst',
      description: 'Omega-3 rijke vis met complexe koolhydraten',
      meal_type: 'Diner',
      suitable_plans: ['Gebalanceerd', 'High Protein'],
      calories_per_serving: 420,
      protein_per_serving: 30,
      carbs_per_serving: 35,
      fat_per_serving: 18,
      servings: 1,
      prep_time_minutes: 25,
      difficulty: 'intermediate',
      instructions: '1. Bak zalm 4-5 minuten per kant\n2. Kook rijst volgens instructies\n3. Roerbak groenten\n4. Serveer samen'
    }
  ];
  
  try {
    console.log(`📝 Adding ${recipes.length} recipes...`);
    
    for (const recipe of recipes) {
      const { data, error } = await supabase
        .from('nutrition_recipes')
        .insert(recipe)
        .select();
      
      if (error) {
        console.log(`⚠️ Could not add recipe ${recipe.name}: ${error.message}`);
      } else {
        console.log(`✅ Added recipe: ${recipe.name} (${recipe.meal_type})`);
      }
    }
    
    // Check total count
    const { data: totalRecipes, error: countError } = await supabase
      .from('nutrition_recipes')
      .select('*');
    
    if (!countError) {
      console.log(`\n🎉 Total nutrition recipes: ${totalRecipes.length}`);
      
      // Group by meal type
      const mealTypes = {};
      totalRecipes.forEach(recipe => {
        if (!mealTypes[recipe.meal_type]) mealTypes[recipe.meal_type] = 0;
        mealTypes[recipe.meal_type]++;
      });
      
      console.log('\n📊 Recipes by meal type:');
      Object.entries(mealTypes).forEach(([mealType, count]) => {
        console.log(`  - ${mealType}: ${count} recipes`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error adding recipes:', error);
  }
}

addNutritionRecipes();






