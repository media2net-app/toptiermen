require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Carnivor meals database
const carnivorMeals = [
  // ONTBIJT (Breakfast)
  {
    name: 'Orgaanvlees & Eieren Ontbijt',
    description: 'Traditioneel carnivoor ontbijt met lever, hart en eieren voor maximale voedingsstoffen',
    meal_type: 'ontbijt',
    category: 'carnivoor',
    ingredients: [
      { name: 'Runderlever', amount: 100, unit: 'g' },
      { name: 'Runderhart', amount: 50, unit: 'g' },
      { name: 'Eieren', amount: 3, unit: 'stuks' },
      { name: 'Roomboter', amount: 25, unit: 'g' },
      { name: 'Honing', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Bak de lever en hart in roomboter tot medium-rare',
      'Kook de eieren 6-7 minuten voor een zachte dooier',
      'Serveer met een scheutje honing'
    ],
    nutrition_info: {
      calories: 520,
      protein: 42,
      carbs: 8,
      fat: 35
    },
    prep_time: 15,
    difficulty: 'makkelijk',
    is_featured: true
  },
  {
    name: 'Ribeye & Eieren Ontbijt',
    description: 'Eiwitrijk ontbijt met ribeye steak en eieren voor optimale energie',
    meal_type: 'ontbijt',
    category: 'carnivoor',
    ingredients: [
      { name: 'Ribeye Steak', amount: 200, unit: 'g' },
      { name: 'Eieren', amount: 3, unit: 'stuks' },
      { name: 'Roomboter', amount: 30, unit: 'g' },
      { name: 'Zout', amount: 5, unit: 'g' }
    ],
    instructions: [
      'Bak de ribeye steak in roomboter tot gewenste gaarheid',
      'Kook de eieren 6-7 minuten',
      'Kruid met zout en serveer'
    ],
    nutrition_info: {
      calories: 580,
      protein: 48,
      carbs: 2,
      fat: 42
    },
    prep_time: 20,
    difficulty: 'makkelijk',
    is_featured: true
  },
  {
    name: 'Spek & Eieren Ontbijt',
    description: 'Klassiek carnivoor ontbijt met spek en eieren',
    meal_type: 'ontbijt',
    category: 'carnivoor',
    ingredients: [
      { name: 'Spek', amount: 80, unit: 'g' },
      { name: 'Eieren', amount: 4, unit: 'stuks' },
      { name: 'Roomboter', amount: 20, unit: 'g' },
      { name: 'Honing', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Bak de spek knapperig in een pan',
      'Kook de eieren in het spekvet',
      'Serveer met honing'
    ],
    nutrition_info: {
      calories: 620,
      protein: 38,
      carbs: 4,
      fat: 52
    },
    prep_time: 12,
    difficulty: 'makkelijk',
    is_featured: true
  },

  // LUNCH
  {
    name: 'Ribeye Steak Lunch',
    description: 'Hartige lunch met ribeye steak en dierlijke vetten',
    meal_type: 'lunch',
    category: 'carnivoor',
    ingredients: [
      { name: 'Ribeye Steak', amount: 250, unit: 'g' },
      { name: 'Roomboter', amount: 30, unit: 'g' },
      { name: 'Talow', amount: 10, unit: 'g' },
      { name: 'Zout', amount: 5, unit: 'g' }
    ],
    instructions: [
      'Bak de ribeye steak in roomboter en talow',
      'Kruid met zout',
      'Laat 5 minuten rusten voor het snijden'
    ],
    nutrition_info: {
      calories: 650,
      protein: 45,
      carbs: 0,
      fat: 50
    },
    prep_time: 25,
    difficulty: 'makkelijk',
    is_featured: true
  },
  {
    name: 'Kipfilet met Roomboter',
    description: 'Lichte lunch met kipfilet en roomboter',
    meal_type: 'lunch',
    category: 'carnivoor',
    ingredients: [
      { name: 'Kipfilet', amount: 250, unit: 'g' },
      { name: 'Roomboter', amount: 30, unit: 'g' },
      { name: 'Zout', amount: 5, unit: 'g' }
    ],
    instructions: [
      'Bak de kipfilet in roomboter',
      'Kruid met zout',
      'Serveer warm'
    ],
    nutrition_info: {
      calories: 520,
      protein: 55,
      carbs: 0,
      fat: 30
    },
    prep_time: 20,
    difficulty: 'makkelijk',
    is_featured: true
  },
  {
    name: 'Lamskotelet Lunch',
    description: 'Rijke lunch met lamskotelet en dierlijke vetten',
    meal_type: 'lunch',
    category: 'carnivoor',
    ingredients: [
      { name: 'Lamskotelet', amount: 250, unit: 'g' },
      { name: 'Roomboter', amount: 35, unit: 'g' },
      { name: 'Zout', amount: 5, unit: 'g' }
    ],
    instructions: [
      'Bak de lamskotelet in roomboter',
      'Kruid met zout',
      'Serveer medium-rare'
    ],
    nutrition_info: {
      calories: 680,
      protein: 52,
      carbs: 0,
      fat: 50
    },
    prep_time: 25,
    difficulty: 'makkelijk',
    is_featured: true
  },

  // DINER
  {
    name: 'Zalm & Eieren Diner',
    description: 'Vette vis diner met eieren en kaas',
    meal_type: 'diner',
    category: 'carnivoor',
    ingredients: [
      { name: 'Gerookte Zalm', amount: 120, unit: 'g' },
      { name: 'Eieren', amount: 2, unit: 'stuks' },
      { name: 'Spek', amount: 40, unit: 'g' },
      { name: 'Goudse Kaas', amount: 30, unit: 'g' }
    ],
    instructions: [
      'Bak de spek knapperig',
      'Kook de eieren',
      'Serveer met gerookte zalm en kaas'
    ],
    nutrition_info: {
      calories: 580,
      protein: 58,
      carbs: 15,
      fat: 35
    },
    prep_time: 15,
    difficulty: 'makkelijk',
    is_featured: true
  },
  {
    name: 'T-Bone Steak Diner',
    description: 'Klassiek diner met T-Bone steak',
    meal_type: 'diner',
    category: 'carnivoor',
    ingredients: [
      { name: 'T-Bone Steak', amount: 200, unit: 'g' },
      { name: 'Eieren', amount: 1, unit: 'stuks' },
      { name: 'Goudse Kaas', amount: 30, unit: 'g' },
      { name: 'Roomboter', amount: 25, unit: 'g' }
    ],
    instructions: [
      'Bak de T-Bone steak in roomboter',
      'Kook het ei',
      'Serveer met kaas'
    ],
    nutrition_info: {
      calories: 580,
      protein: 52,
      carbs: 12,
      fat: 38
    },
    prep_time: 30,
    difficulty: 'makkelijk',
    is_featured: true
  },
  {
    name: 'Orgaanvlees Mix Diner',
    description: 'Voedingsrijk diner met verschillende orgaanvlezen',
    meal_type: 'diner',
    category: 'carnivoor',
    ingredients: [
      { name: 'Kippenlever', amount: 100, unit: 'g' },
      { name: 'Runderhart', amount: 75, unit: 'g' },
      { name: 'Roomboter', amount: 25, unit: 'g' },
      { name: 'Honing', amount: 10, unit: 'g' }
    ],
    instructions: [
      'Bak de orgaanvlezen in roomboter',
      'Kruid met zout',
      'Serveer met honing'
    ],
    nutrition_info: {
      calories: 520,
      protein: 48,
      carbs: 10,
      fat: 30
    },
    prep_time: 20,
    difficulty: 'makkelijk',
    is_featured: true
  },

  // SNACKS
  {
    name: 'Griekse Yoghurt Snack',
    description: 'Lichte snack met Griekse yoghurt en honing',
    meal_type: 'snack',
    category: 'carnivoor',
    ingredients: [
      { name: 'Griekse Yoghurt', amount: 150, unit: 'g' },
      { name: 'Honing', amount: 15, unit: 'g' }
    ],
    instructions: [
      'Meng yoghurt met honing',
      'Serveer koud'
    ],
    nutrition_info: {
      calories: 280,
      protein: 22,
      carbs: 0,
      fat: 20
    },
    prep_time: 2,
    difficulty: 'makkelijk',
    is_featured: true
  },
  {
    name: 'Droge Worst Snack',
    description: 'Eiwitrijke snack met droge worst en kaas',
    meal_type: 'snack',
    category: 'carnivoor',
    ingredients: [
      { name: 'Droge Worst', amount: 80, unit: 'g' },
      { name: 'Goudse Kaas', amount: 20, unit: 'g' }
    ],
    instructions: [
      'Snijd de worst en kaas',
      'Serveer op kamertemperatuur'
    ],
    nutrition_info: {
      calories: 320,
      protein: 18,
      carbs: 2,
      fat: 25
    },
    prep_time: 5,
    difficulty: 'makkelijk',
    is_featured: true
  },
  {
    name: 'Spek Snack',
    description: 'Vette snack met spek',
    meal_type: 'snack',
    category: 'carnivoor',
    ingredients: [
      { name: 'Spek', amount: 60, unit: 'g' }
    ],
    instructions: [
      'Bak de spek knapperig',
      'Laat uitlekken op keukenpapier'
    ],
    nutrition_info: {
      calories: 300,
      protein: 22,
      carbs: 0,
      fat: 24
    },
    prep_time: 10,
    difficulty: 'makkelijk',
    is_featured: true
  },
  {
    name: 'Goudse Kaas Snack',
    description: 'Lichte snack met Goudse kaas',
    meal_type: 'snack',
    category: 'carnivoor',
    ingredients: [
      { name: 'Goudse Kaas', amount: 80, unit: 'g' }
    ],
    instructions: [
      'Snijd de kaas in blokjes',
      'Serveer op kamertemperatuur'
    ],
    nutrition_info: {
      calories: 320,
      protein: 20,
      carbs: 0,
      fat: 26
    },
    prep_time: 3,
    difficulty: 'makkelijk',
    is_featured: true
  }
];

async function populateCarnivorMeals() {
  try {
    console.log('🥩 POPULATING CARNIVOR MEALS DATABASE');
    console.log('=====================================\n');

    // Delete existing carnivor meals
    console.log('🗑️ Deleting existing carnivor meals...');
    const { error: deleteError } = await supabase
      .from('meals')
      .delete()
      .eq('category', 'carnivoor');

    if (deleteError) {
      console.error('❌ Error deleting existing meals:', deleteError);
      return;
    }
    console.log('✅ Existing carnivor meals deleted\n');

    // Insert new carnivor meals
    console.log('📝 Inserting carnivor meals...');
    
    for (const meal of carnivorMeals) {
      const { data: insertedMeal, error: insertError } = await supabase
        .from('meals')
        .insert(meal)
        .select()
        .single();

      if (insertError) {
        console.error(`❌ Error inserting ${meal.name}:`, insertError);
        continue;
      }

      console.log(`✅ ${meal.name} - ${meal.meal_type} (${meal.nutrition_info.calories} cal)`);
    }

    console.log('\n🎉 All carnivor meals inserted successfully!');
    console.log('\n📋 Summary:');
    console.log(`   🍳 Ontbijt: ${carnivorMeals.filter(m => m.meal_type === 'ontbijt').length} maaltijden`);
    console.log(`   🍽️ Lunch: ${carnivorMeals.filter(m => m.meal_type === 'lunch').length} maaltijden`);
    console.log(`   🍖 Diner: ${carnivorMeals.filter(m => m.meal_type === 'diner').length} maaltijden`);
    console.log(`   🥨 Snacks: ${carnivorMeals.filter(m => m.meal_type === 'snack').length} maaltijden`);
    console.log(`   📊 Totaal: ${carnivorMeals.length} maaltijden`);

  } catch (error) {
    console.error('❌ Error populating carnivor meals:', error.message);
  }
}

// Run the script
populateCarnivorMeals();
