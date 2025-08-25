const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createNutritionRecipes() {
  console.log('🍳 Creating nutrition recipes for all meal plans...');
  
  const recipes = [
    // GEBALANCEERD PLAN RECEPTEN
    {
      name: 'Havermout met Banaan en Noten',
      description: 'Gezond ontbijt met complexe koolhydraten en eiwitten',
      category: 'Ontbijt',
      suitable_plans: ['Gebalanceerd', 'High Protein'],
      calories_per_serving: 350,
      protein_per_serving: 15,
      carbs_per_serving: 45,
      fat_per_serving: 12,
      servings: 1,
      prep_time_minutes: 10,
      difficulty: 'beginner',
      instructions: '1. Kook 50g havermout met 200ml water\n2. Snijd banaan in plakjes\n3. Hak noten fijn\n4. Meng alles door elkaar\n5. Bestrooi met kaneel',
      ingredients: [
        { name: 'Havermout', amount: 50, unit: 'g' },
        { name: 'Bananen', amount: 100, unit: 'g' },
        { name: 'Walnoten', amount: 20, unit: 'g' },
        { name: 'Melk', amount: 100, unit: 'ml' }
      ]
    },
    {
      name: 'Gegrilde Kipfilet met Groenten',
      description: 'Mager eiwit met verse groenten',
      category: 'Lunch',
      suitable_plans: ['Gebalanceerd', 'High Protein', 'Koolhydraatarm / Keto'],
      calories_per_serving: 280,
      protein_per_serving: 35,
      carbs_per_serving: 8,
      fat_per_serving: 12,
      servings: 1,
      prep_time_minutes: 20,
      difficulty: 'beginner',
      instructions: '1. Grill kipfilet 6-8 minuten per kant\n2. Roerbak groenten in olijfolie\n3. Kruid met peper en zout\n4. Serveer samen',
      ingredients: [
        { name: 'Kipfilet Plakjes', amount: 150, unit: 'g' },
        { name: 'Broccoli', amount: 100, unit: 'g' },
        { name: 'Courgette', amount: 100, unit: 'g' },
        { name: 'Olijfolie', amount: 10, unit: 'ml' }
      ]
    },
    {
      name: 'Zalm met Basmati Rijst',
      description: 'Omega-3 rijke vis met complexe koolhydraten',
      category: 'Diner',
      suitable_plans: ['Gebalanceerd', 'High Protein'],
      calories_per_serving: 420,
      protein_per_serving: 30,
      carbs_per_serving: 35,
      fat_per_serving: 18,
      servings: 1,
      prep_time_minutes: 25,
      difficulty: 'intermediate',
      instructions: '1. Bak zalm 4-5 minuten per kant\n2. Kook rijst volgens instructies\n3. Roerbak groenten\n4. Serveer samen',
      ingredients: [
        { name: 'Tonijn in Olijfolie', amount: 150, unit: 'g' },
        { name: 'Basmati Rijst', amount: 75, unit: 'g' },
        { name: 'Bloemkool', amount: 100, unit: 'g' },
        { name: 'Tomaatjes', amount: 50, unit: 'g' }
      ]
    },
    
    // KOOLHYDRAATARM/KETO RECEPTEN
    {
      name: 'Eieren met Spek en Avocado',
      description: 'Keto-vriendelijk ontbijt rijk aan vetten',
      category: 'Ontbijt',
      suitable_plans: ['Koolhydraatarm / Keto', 'Carnivoor (Rick\'s Aanpak)'],
      calories_per_serving: 450,
      protein_per_serving: 25,
      carbs_per_serving: 3,
      fat_per_serving: 35,
      servings: 1,
      prep_time_minutes: 15,
      difficulty: 'beginner',
      instructions: '1. Bak spek knapperig\n2. Bak eieren in spekvet\n3. Snijd avocado\n4. Serveer samen',
      ingredients: [
        { name: 'Eieren', amount: 100, unit: 'g' },
        { name: 'Spek', amount: 50, unit: 'g' },
        { name: 'Pindakaas', amount: 30, unit: 'g' }
      ]
    },
    {
      name: 'Salade met Tartaar en Noten',
      description: 'Eiwitrijke salade zonder koolhydraten',
      category: 'Lunch',
      suitable_plans: ['Koolhydraatarm / Keto', 'Carnivoor (Rick\'s Aanpak)'],
      calories_per_serving: 380,
      protein_per_serving: 30,
      carbs_per_serving: 5,
      fat_per_serving: 25,
      servings: 1,
      prep_time_minutes: 15,
      difficulty: 'beginner',
      instructions: '1. Meng tartaar met kruiden\n2. Hak noten fijn\n3. Meng met groenten\n4. Dressing van olijfolie',
      ingredients: [
        { name: 'Tartaar', amount: 150, unit: 'g' },
        { name: 'Amandelen test', amount: 30, unit: 'g' },
        { name: 'Komkommer', amount: 100, unit: 'g' },
        { name: 'Olijfolie', amount: 15, unit: 'ml' }
      ]
    },
    {
      name: 'Gegrilde Ribeye met Boter',
      description: 'Vetrijke steak perfect voor keto',
      category: 'Diner',
      suitable_plans: ['Koolhydraatarm / Keto', 'Carnivoor (Rick\'s Aanpak)'],
      calories_per_serving: 520,
      protein_per_serving: 35,
      carbs_per_serving: 0,
      fat_per_serving: 40,
      servings: 1,
      prep_time_minutes: 20,
      difficulty: 'intermediate',
      instructions: '1. Grill ribeye 4-5 minuten per kant\n2. Laat 5 minuten rusten\n3. Serveer met boter\n4. Kruid met peper en zout',
      ingredients: [
        { name: 'Ribeye Steak', amount: 200, unit: 'g' },
        { name: 'Boter', amount: 20, unit: 'g' },
        { name: 'Ghee', amount: 10, unit: 'g' }
      ]
    },
    
    // CARNIVOOR RECEPTEN
    {
      name: 'Orgaanvlees Mix',
      description: 'Traditioneel carnivoor ontbijt',
      category: 'Ontbijt',
      suitable_plans: ['Carnivoor (Rick\'s Aanpak)'],
      calories_per_serving: 280,
      protein_per_serving: 35,
      carbs_per_serving: 2,
      fat_per_serving: 15,
      servings: 1,
      prep_time_minutes: 20,
      difficulty: 'advanced',
      instructions: '1. Bak lever 2-3 minuten per kant\n2. Bak hart en nieren\n3. Kruid met zout\n4. Serveer warm',
      ingredients: [
        { name: 'Orgaanvlees (Lever)', amount: 100, unit: 'g' },
        { name: 'Orgaanvlees (Hart)', amount: 50, unit: 'g' },
        { name: 'Orgaanvlees (Nieren)', amount: 50, unit: 'g' },
        { name: 'Talow', amount: 15, unit: 'g' }
      ]
    },
    {
      name: 'Gegrilde T-Bone Steak',
      description: 'Klassieke carnivoor lunch',
      category: 'Lunch',
      suitable_plans: ['Carnivoor (Rick\'s Aanpak)'],
      calories_per_serving: 450,
      protein_per_serving: 40,
      carbs_per_serving: 0,
      fat_per_serving: 30,
      servings: 1,
      prep_time_minutes: 25,
      difficulty: 'intermediate',
      instructions: '1. Grill T-bone 5-6 minuten per kant\n2. Laat 10 minuten rusten\n3. Snijd tegen de draad\n4. Serveer met reuzel',
      ingredients: [
        { name: 'T-Bone Steak', amount: 250, unit: 'g' },
        { name: 'Reuzel', amount: 20, unit: 'g' },
        { name: 'Talow', amount: 10, unit: 'g' }
      ]
    },
    {
      name: 'Gans met Eendenborst',
      description: 'Rijke carnivoor diner',
      category: 'Diner',
      suitable_plans: ['Carnivoor (Rick\'s Aanpak)'],
      calories_per_serving: 520,
      protein_per_serving: 35,
      carbs_per_serving: 0,
      fat_per_serving: 40,
      servings: 1,
      prep_time_minutes: 45,
      difficulty: 'advanced',
      instructions: '1. Rooster gans 30-40 minuten\n2. Bak eendenborst 8-10 minuten\n3. Laat rusten\n4. Serveer samen',
      ingredients: [
        { name: 'Gans', amount: 150, unit: 'g' },
        { name: 'Eendenborst', amount: 100, unit: 'g' },
        { name: 'Reuzel', amount: 25, unit: 'g' }
      ]
    },
    
    // HIGH PROTEIN RECEPTEN
    {
      name: 'Whey Protein Shake met Havermout',
      description: 'Eiwitrijk ontbijt voor spieropbouw',
      category: 'Ontbijt',
      suitable_plans: ['High Protein', 'Gebalanceerd'],
      calories_per_serving: 380,
      protein_per_serving: 45,
      carbs_per_serving: 35,
      fat_per_serving: 8,
      servings: 1,
      prep_time_minutes: 5,
      difficulty: 'beginner',
      instructions: '1. Meng whey protein met melk\n2. Voeg havermout toe\n3. Blend tot smoothie\n4. Serveer direct',
      ingredients: [
        { name: 'Whey Eiwit Shakes', amount: 50, unit: 'g' },
        { name: 'Havermout', amount: 40, unit: 'g' },
        { name: 'Melk', amount: 200, unit: 'ml' },
        { name: 'Bananen', amount: 50, unit: 'g' }
      ]
    },
    {
      name: 'Magere Kwark met Noten',
      description: 'Eiwitrijke lunch voor herstel',
      category: 'Lunch',
      suitable_plans: ['High Protein', 'Gebalanceerd'],
      calories_per_serving: 320,
      protein_per_serving: 35,
      carbs_per_serving: 15,
      fat_per_serving: 12,
      servings: 1,
      prep_time_minutes: 5,
      difficulty: 'beginner',
      instructions: '1. Meng kwark met noten\n2. Voeg kaneel toe\n3. Roer goed door\n4. Serveer koud',
      ingredients: [
        { name: 'Magere Kwark', amount: 200, unit: 'g' },
        { name: 'Amandelen test', amount: 25, unit: 'g' },
        { name: 'Walnoten', amount: 15, unit: 'g' }
      ]
    },
    {
      name: 'Kalkoenfilet met Volkoren Pasta',
      description: 'Eiwitrijk diner met complexe koolhydraten',
      category: 'Diner',
      suitable_plans: ['High Protein', 'Gebalanceerd'],
      calories_per_serving: 480,
      protein_per_serving: 45,
      carbs_per_serving: 40,
      fat_per_serving: 15,
      servings: 1,
      prep_time_minutes: 25,
      difficulty: 'intermediate',
      instructions: '1. Grill kalkoenfilet\n2. Kook volkoren pasta\n3. Meng met groenten\n4. Serveer samen',
      ingredients: [
        { name: 'Kalkoenfilet', amount: 200, unit: 'g' },
        { name: 'Volkoren Pasta', amount: 80, unit: 'g' },
        { name: 'Broccoli', amount: 100, unit: 'g' },
        { name: 'Olijfolie', amount: 15, unit: 'ml' }
      ]
    },
    
    // SNACKS VOOR ALLE PLANNEN
    {
      name: 'Noten Mix',
      description: 'Gezonde snack rijk aan gezonde vetten',
      category: 'Snack',
      suitable_plans: ['Gebalanceerd', 'Koolhydraatarm / Keto', 'High Protein'],
      calories_per_serving: 180,
      protein_per_serving: 8,
      carbs_per_serving: 12,
      fat_per_serving: 15,
      servings: 1,
      prep_time_minutes: 2,
      difficulty: 'beginner',
      instructions: '1. Meng verschillende noten\n2. Portioneer in kleine zakjes\n3. Bewaar in koelkast\n4. Eet als snack',
      ingredients: [
        { name: 'Amandelen test', amount: 15, unit: 'g' },
        { name: 'Walnoten', amount: 10, unit: 'g' },
        { name: 'Pecannoten', amount: 10, unit: 'g' },
        { name: 'Macadamia Noten', amount: 5, unit: 'g' }
      ]
    },
    {
      name: 'Eiwitrijke Yoghurt',
      description: 'Snelle eiwitboost',
      category: 'Snack',
      suitable_plans: ['High Protein', 'Gebalanceerd'],
      calories_per_serving: 120,
      protein_per_serving: 15,
      carbs_per_serving: 8,
      fat_per_serving: 3,
      servings: 1,
      prep_time_minutes: 2,
      difficulty: 'beginner',
      instructions: '1. Meng yoghurt met whey protein\n2. Voeg fruit toe\n3. Roer goed door\n4. Serveer koud',
      ingredients: [
        { name: 'Magere Kwark', amount: 150, unit: 'g' },
        { name: 'Whey Eiwit Shakes', amount: 20, unit: 'g' },
        { name: 'Blauwe Bessen', amount: 30, unit: 'g' }
      ]
    }
  ];
  
  try {
    console.log(`📝 Adding ${recipes.length} recipes...`);
    
    for (const recipe of recipes) {
      const { data, error } = await supabase
        .from('nutrition_recipes')
        .insert({
          name: recipe.name,
          description: recipe.description,
          category: recipe.category,
          suitable_plans: recipe.suitable_plans,
          calories_per_serving: recipe.calories_per_serving,
          protein_per_serving: recipe.protein_per_serving,
          carbs_per_serving: recipe.carbs_per_serving,
          fat_per_serving: recipe.fat_per_serving,
          servings: recipe.servings,
          prep_time_minutes: recipe.prep_time_minutes,
          difficulty: recipe.difficulty,
          instructions: recipe.instructions
        })
        .select();
      
      if (error) {
        console.log(`⚠️ Could not add recipe ${recipe.name}: ${error.message}`);
      } else {
        console.log(`✅ Added recipe: ${recipe.name} (${recipe.category})`);
      }
    }
    
    // Check total count
    const { data: totalRecipes, error: countError } = await supabase
      .from('nutrition_recipes')
      .select('*');
    
    if (!countError) {
      console.log(`\n🎉 Total nutrition recipes: ${totalRecipes.length}`);
      
      // Group by category
      const categories = {};
      totalRecipes.forEach(recipe => {
        if (!categories[recipe.category]) categories[recipe.category] = 0;
        categories[recipe.category]++;
      });
      
      console.log('\n📊 Recipes by category:');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`  - ${category}: ${count} recipes`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error adding recipes:', error);
  }
}

createNutritionRecipes();



