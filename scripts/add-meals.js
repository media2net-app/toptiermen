require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const meals = [
  {
    name: "Carnivoor Ontbijt",
    description: "Een eiwitrijk ontbijt perfect voor een carnivoor dieet. Rijk aan eiwitten en gezonde vetten.",
    meal_type: "ontbijt",
    category: "carnivoor",
    ingredients: [
      { name: "1 Ei", quantity: 2, unit: "stuks" },
      { name: "1 Handje Amandelen", quantity: 1, unit: "handje" }
    ],
    instructions: [
      "Kook de eieren 6-7 minuten voor een zachtgekookt ei",
      "Serveer met een handje amandelen",
      "Optioneel: voeg zout en peper toe naar smaak"
    ],
    nutrition_info: {
      calories: 320,
      protein: 18,
      carbs: 6,
      fat: 26
    },
    prep_time: 10,
    difficulty: "makkelijk",
    is_featured: true
  },
  {
    name: "Carnivoor Lunch",
    description: "Een stevige lunch met vlees en eieren voor optimale energie en verzadiging.",
    meal_type: "lunch",
    category: "carnivoor",
    ingredients: [
      { name: "1 Ei", quantity: 3, unit: "stuks" },
      { name: "1 Handje Walnoten", quantity: 1, unit: "handje" }
    ],
    instructions: [
      "Kook de eieren hard (8-9 minuten)",
      "Pel en snijd de eieren in stukken",
      "Serveer met een handje walnoten",
      "Voeg eventueel zout en peper toe"
    ],
    nutrition_info: {
      calories: 450,
      protein: 24,
      carbs: 4,
      fat: 38
    },
    prep_time: 15,
    difficulty: "makkelijk",
    is_featured: false
  },
  {
    name: "Carnivoor Diner",
    description: "Een complete carnivoor maaltijd met eieren en noten voor het avondeten.",
    meal_type: "diner",
    category: "carnivoor",
    ingredients: [
      { name: "1 Ei", quantity: 4, unit: "stuks" },
      { name: "1 Handje Cashewnoten", quantity: 1, unit: "handje" }
    ],
    instructions: [
      "Bak de eieren in een pan met wat boter",
      "Kook tot het eiwit gestold is maar de dooier nog zacht",
      "Serveer met een handje cashewnoten",
      "Kruid naar smaak"
    ],
    nutrition_info: {
      calories: 520,
      protein: 30,
      carbs: 9,
      fat: 42
    },
    prep_time: 12,
    difficulty: "makkelijk",
    is_featured: true
  },
  {
    name: "Flexibel Ontbijt",
    description: "Een gebalanceerd ontbijt met fruit en noten voor een flexibel dieet.",
    meal_type: "ontbijt",
    category: "flexibel",
    ingredients: [
      { name: "1 Appel", quantity: 1, unit: "stuk" },
      { name: "1 Handje Amandelen", quantity: 1, unit: "handje" },
      { name: "1 Ei", quantity: 1, unit: "stuk" }
    ],
    instructions: [
      "Was en snijd de appel in stukken",
      "Kook het ei 6-7 minuten",
      "Serveer de appel met amandelen en het ei",
      "Perfect voor een gebalanceerd ontbijt"
    ],
    nutrition_info: {
      calories: 280,
      protein: 12,
      carbs: 25,
      fat: 18
    },
    prep_time: 8,
    difficulty: "makkelijk",
    is_featured: true
  },
  {
    name: "Flexibel Lunch",
    description: "Een lichte maar voedzame lunch met fruit en noten.",
    meal_type: "lunch",
    category: "flexibel",
    ingredients: [
      { name: "1 Banaan", quantity: 1, unit: "stuk" },
      { name: "1 Handje Pistachenoten", quantity: 1, unit: "handje" },
      { name: "1 Ei", quantity: 1, unit: "stuk" }
    ],
    instructions: [
      "Pel en snijd de banaan in stukken",
      "Kook het ei hard (8-9 minuten)",
      "Serveer de banaan met pistachenoten en het ei",
      "Een perfecte combinatie van zoet en hartig"
    ],
    nutrition_info: {
      calories: 320,
      protein: 13,
      carbs: 30,
      fat: 18
    },
    prep_time: 10,
    difficulty: "makkelijk",
    is_featured: false
  },
  {
    name: "Flexibel Diner",
    description: "Een gebalanceerd diner met fruit, noten en eieren.",
    meal_type: "diner",
    category: "flexibel",
    ingredients: [
      { name: "1 Appel", quantity: 1, unit: "stuk" },
      { name: "1 Handje Hazelnoten", quantity: 1, unit: "handje" },
      { name: "1 Ei", quantity: 2, unit: "stuks" }
    ],
    instructions: [
      "Was en snijd de appel in stukken",
      "Bak de eieren in een pan",
      "Serveer de appel met hazelnoten en eieren",
      "Een voedzame en gebalanceerde maaltijd"
    ],
    nutrition_info: {
      calories: 380,
      protein: 18,
      carbs: 25,
      fat: 24
    },
    prep_time: 12,
    difficulty: "makkelijk",
    is_featured: true
  },
  {
    name: "Snack - Noten Mix",
    description: "Een gezonde snack met verschillende noten voor tussendoor.",
    meal_type: "snack",
    category: "flexibel",
    ingredients: [
      { name: "1 Handje Amandelen", quantity: 0.5, unit: "handje" },
      { name: "1 Handje Walnoten", quantity: 0.5, unit: "handje" },
      { name: "1 Handje Cashewnoten", quantity: 0.5, unit: "handje" }
    ],
    instructions: [
      "Meng alle noten in een kom",
      "Perfect voor een gezonde snack tussendoor",
      "Kan ook worden toegevoegd aan andere maaltijden"
    ],
    nutrition_info: {
      calories: 240,
      protein: 8,
      carbs: 8,
      fat: 22
    },
    prep_time: 2,
    difficulty: "makkelijk",
    is_featured: false
  },
  {
    name: "Snack - Fruit & Noten",
    description: "Een zoete snack met fruit en noten voor een energieboost.",
    meal_type: "snack",
    category: "flexibel",
    ingredients: [
      { name: "1 Appel", quantity: 0.5, unit: "stuk" },
      { name: "1 Banaan", quantity: 0.5, unit: "stuk" },
      { name: "1 Handje Pecannoten", quantity: 0.5, unit: "handje" }
    ],
    instructions: [
      "Snijd de appel en banaan in stukken",
      "Meng met de pecannoten",
      "Een perfecte zoete snack"
    ],
    nutrition_info: {
      calories: 180,
      protein: 3,
      carbs: 25,
      fat: 10
    },
    prep_time: 5,
    difficulty: "makkelijk",
    is_featured: false
  }
];

async function addMeals() {
  try {
    console.log('🍽️ Adding meals to database...\n');

    // Check existing meals first
    console.log('📋 Checking existing meals...');
    const { data: existingMeals, error: fetchError } = await supabase
      .from('meals')
      .select('name')
      .in('name', meals.map(meal => meal.name));

    if (fetchError) {
      console.error('❌ Error fetching existing meals:', fetchError);
      return;
    }

    const existingNames = existingMeals.map(meal => meal.name);
    console.log(`📊 Found ${existingNames.length} existing meals:`, existingNames);

    // Filter out meals that already exist
    const mealsToAdd = meals.filter(meal => !existingNames.includes(meal.name));
    
    if (mealsToAdd.length === 0) {
      console.log('✅ All meals already exist in database');
      return;
    }

    console.log(`📝 Adding ${mealsToAdd.length} new meals...`);

    // Add meals in batches
    const batchSize = 3;
    for (let i = 0; i < mealsToAdd.length; i += batchSize) {
      const batch = mealsToAdd.slice(i, i + batchSize);
      
      console.log(`\n📦 Adding batch ${Math.floor(i / batchSize) + 1}:`);
      batch.forEach(meal => console.log(`   - ${meal.name} (${meal.meal_type})`));

      const { data: insertedMeals, error: insertError } = await supabase
        .from('meals')
        .insert(batch)
        .select();

      if (insertError) {
        console.error('❌ Error inserting batch:', insertError);
        continue;
      }

      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} added successfully`);
    }

    // Verify all meals were added
    console.log('\n🔍 Verifying all meals...');
    const { data: allMeals, error: verifyError } = await supabase
      .from('meals')
      .select('name, meal_type, category, nutrition_info')
      .in('name', meals.map(meal => meal.name))
      .order('name');

    if (verifyError) {
      console.error('❌ Error verifying meals:', verifyError);
      return;
    }

    console.log('\n✅ Successfully added meals:');
    console.log('============================');
    
    allMeals.forEach(meal => {
      console.log(`🍽️ ${meal.name}`);
      console.log(`   Type: ${meal.meal_type}, Category: ${meal.category}`);
      console.log(`   Calories: ${meal.nutrition_info.calories}, Protein: ${meal.nutrition_info.protein}g`);
    });

    console.log(`\n🎯 Summary:`);
    console.log(`- Total meals: ${allMeals.length}`);
    console.log(`- Categories: ${[...new Set(allMeals.map(m => m.category))].join(', ')}`);
    console.log(`- Meal types: ${[...new Set(allMeals.map(m => m.meal_type))].join(', ')}`);

    // Category breakdown
    const categoryCount = {};
    allMeals.forEach(meal => {
      categoryCount[meal.category] = (categoryCount[meal.category] || 0) + 1;
    });
    
    console.log(`\n📂 Meals per category:`);
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`  • ${category}: ${count} meals`);
    });

    // Meal type breakdown
    const mealTypeCount = {};
    allMeals.forEach(meal => {
      mealTypeCount[meal.meal_type] = (mealTypeCount[meal.meal_type] || 0) + 1;
    });
    
    console.log(`\n🍽️ Meals per type:`);
    Object.entries(mealTypeCount).forEach(([type, count]) => {
      console.log(`  • ${type}: ${count} meals`);
    });

    console.log('\n💡 These meals are now available in the nutrition plans admin!');
    console.log('   Users can now create meal plans with these pre-made meals.');

  } catch (error) {
    console.error('❌ Error adding meals:', error);
  }
}

addMeals();
