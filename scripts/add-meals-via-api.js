const fetch = require('node-fetch');

async function addMealsViaAPI() {
  try {
    console.log('🍽️ Adding meals via API...');

    const baseUrl = 'http://localhost:3000';
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
        is_featured: true
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
        is_featured: true
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
        is_featured: true
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
        is_featured: false
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
        is_featured: false
      }
    ];

    console.log(`📋 Adding ${meals.length} meals...`);

    for (const meal of meals) {
      try {
        console.log(`🍽️ Adding: ${meal.name}`);
        
        const response = await fetch(`${baseUrl}/api/admin/meals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(meal)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          console.log(`✅ Added: ${meal.name}`);
        } else {
          console.error(`❌ Failed to add ${meal.name}:`, result.error);
        }
      } catch (error) {
        console.error(`❌ Error adding ${meal.name}:`, error.message);
      }
    }

    // Verify meals were added
    console.log('📋 Verifying meals...');
    try {
      const response = await fetch(`${baseUrl}/api/admin/meals`);
      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`✅ Total meals in database: ${result.meals?.length || 0}`);
        
        if (result.meals && result.meals.length > 0) {
          console.log('📋 Recent meals:');
          result.meals.slice(0, 5).forEach(meal => {
            console.log(`  - ${meal.name} (${meal.meal_type}, ${meal.category})${meal.is_featured ? ' ⭐' : ''}`);
          });
        }
      } else {
        console.error('❌ Error verifying meals:', result.error);
      }
    } catch (error) {
      console.error('❌ Error verifying meals:', error.message);
    }

    console.log('✅ Meals setup completed!');

  } catch (error) {
    console.error('❌ Error adding meals:', error);
  }
}

addMealsViaAPI();
