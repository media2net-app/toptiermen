require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMeals() {
  try {
    console.log('🍽️ Adding meals to database...');

    // Check existing meals
    console.log('📋 Checking existing meals...');
    const { data: existingMeals, error: fetchError } = await supabase
      .from('meals')
      .select('id, name');

    if (fetchError) {
      console.error('❌ Error fetching existing meals:', fetchError);
      return;
    }

    console.log(`📋 Found ${existingMeals?.length || 0} existing meals`);

    // Sample meals data
    const meals = [
      {
        name: 'Carnivoor Ontbijt - Eieren & Bacon',
        description: 'Een eiwitrijk ontbijt perfect voor carnivoor dieet. Rijk aan eiwitten en gezonde vetten.',
        meal_type: 'ontbijt',
        category: 'carnivoor',
        ingredients: [
          { name: '1 Ei (gekookt)', quantity: 2, unit: 'stuks' },
          { name: 'Bacon', quantity: 50, unit: 'gram' },
          { name: 'Boter', quantity: 10, unit: 'gram' }
        ],
        instructions: [
          'Kook de eieren 6-7 minuten voor een zachtgekookt ei',
          'Bak de bacon knapperig in een pan',
          'Serveer met een klontje boter'
        ],
        nutrition_info: {
          calories: 450,
          protein: 28,
          carbs: 2,
          fat: 35
        },
        prep_time: 15,
        difficulty: 'makkelijk',
        is_featured: true,
        is_active: true
      },
      {
        name: 'Flexibel Lunch - Kip Salade',
        description: 'Een gezonde lunch met mager vlees en verse groenten. Perfect voor onderhoud en spiermassa.',
        meal_type: 'lunch',
        category: 'flexibel',
        ingredients: [
          { name: 'Kipfilet', quantity: 150, unit: 'gram' },
          { name: 'Sla', quantity: 50, unit: 'gram' },
          { name: 'Tomaat', quantity: 1, unit: 'stuk' },
          { name: 'Komkommer', quantity: 0.5, unit: 'stuk' },
          { name: 'Olijfolie', quantity: 15, unit: 'ml' }
        ],
        instructions: [
          'Gril de kipfilet 6-8 minuten per kant',
          'Snijd de groenten in stukjes',
          'Meng alles in een kom',
          'Besprenkel met olijfolie en kruiden'
        ],
        nutrition_info: {
          calories: 320,
          protein: 35,
          carbs: 8,
          fat: 18
        },
        prep_time: 20,
        difficulty: 'makkelijk',
        is_featured: true,
        is_active: true
      },
      {
        name: 'Carnivoor Diner - Biefstuk',
        description: 'Een premium biefstuk met boter en kruiden. Perfect voor carnivoor dieet en spiermassa.',
        meal_type: 'diner',
        category: 'carnivoor',
        ingredients: [
          { name: 'Biefstuk', quantity: 200, unit: 'gram' },
          { name: 'Boter', quantity: 20, unit: 'gram' },
          { name: 'Rozemarijn', quantity: 1, unit: 'takje' },
          { name: 'Knoflook', quantity: 2, unit: 'teentjes' }
        ],
        instructions: [
          'Laat de biefstuk op kamertemperatuur komen',
          'Verhit een pan op hoog vuur',
          'Bak de biefstuk 3-4 minuten per kant voor medium-rare',
          'Voeg boter, rozemarijn en knoflook toe in de laatste minuut'
        ],
        nutrition_info: {
          calories: 480,
          protein: 42,
          carbs: 0,
          fat: 32
        },
        prep_time: 25,
        difficulty: 'gemiddeld',
        is_featured: true,
        is_active: true
      },
      {
        name: 'Flexibel Snack - Noten Mix',
        description: 'Een gezonde snack met noten en zaden. Rijk aan gezonde vetten en eiwitten.',
        meal_type: 'snack',
        category: 'flexibel',
        ingredients: [
          { name: 'Amandelen', quantity: 30, unit: 'gram' },
          { name: 'Walnoten', quantity: 20, unit: 'gram' },
          { name: 'Pompoenpitten', quantity: 15, unit: 'gram' }
        ],
        instructions: [
          'Meng alle noten en zaden in een kom',
          'Portioneer in kleine bakjes',
          'Bewaar in een luchtdichte container'
        ],
        nutrition_info: {
          calories: 280,
          protein: 8,
          carbs: 6,
          fat: 26
        },
        prep_time: 5,
        difficulty: 'makkelijk',
        is_featured: false,
        is_active: true
      },
      {
        name: 'Vegetarisch Ontbijt - Havermout',
        description: 'Een vezelrijk ontbijt met havermout en fruit. Perfect voor onderhoud en energie.',
        meal_type: 'ontbijt',
        category: 'vegetarisch',
        ingredients: [
          { name: 'Havermout', quantity: 60, unit: 'gram' },
          { name: '1 Appel', quantity: 1, unit: 'stuk' },
          { name: '1 Banaan', quantity: 1, unit: 'stuk' },
          { name: 'Amandelmelk', quantity: 200, unit: 'ml' },
          { name: 'Kaneel', quantity: 1, unit: 'theelepel' }
        ],
        instructions: [
          'Kook de havermout met amandelmelk',
          'Snijd het fruit in stukjes',
          'Meng alles samen',
          'Bestrooi met kaneel'
        ],
        nutrition_info: {
          calories: 320,
          protein: 8,
          carbs: 58,
          fat: 6
        },
        prep_time: 10,
        difficulty: 'makkelijk',
        is_featured: false,
        is_active: true
      }
    ];

    // Add meals
    for (const meal of meals) {
      // Check if meal already exists
      const existingMeal = existingMeals?.find(m => m.name === meal.name);
      
      if (existingMeal) {
        console.log(`⚠️ Meal "${meal.name}" already exists, skipping...`);
        continue;
      }

      console.log(`🍽️ Adding meal: ${meal.name}`);
      
      const { data, error } = await supabase
        .from('meals')
        .insert([meal])
        .select();

      if (error) {
        console.error(`❌ Error adding meal "${meal.name}":`, error);
      } else {
        console.log(`✅ Added meal: ${meal.name}`);
      }
    }

    // Verify meals
    console.log('📋 Verifying meals...');
    const { data: finalMeals, error: verifyError } = await supabase
      .from('meals')
      .select('id, name, meal_type, category, is_featured')
      .order('created_at', { ascending: false });

    if (verifyError) {
      console.error('❌ Error verifying meals:', verifyError);
    } else {
      console.log(`✅ Total meals in database: ${finalMeals?.length || 0}`);
      
      if (finalMeals && finalMeals.length > 0) {
        console.log('📋 Recent meals:');
        finalMeals.slice(0, 5).forEach(meal => {
          console.log(`  - ${meal.name} (${meal.meal_type}, ${meal.category})${meal.is_featured ? ' ⭐' : ''}`);
        });
      }
    }

    console.log('✅ Meals setup completed successfully!');

  } catch (error) {
    console.error('❌ Error adding meals:', error);
  }
}

addMeals();
