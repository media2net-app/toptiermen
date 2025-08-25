const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createDietWeekplans() {
  console.log('📅 Creating weekplans for each diet approach...');
  
  // Define diet approaches with their characteristics
  const dietApproaches = [
    {
      name: 'Gebalanceerd',
      description: 'Een mix van alle macronutriënten voor duurzame energie',
      macro_ratios: { protein: 30, carbs: 40, fat: 30 },
      daily_calories: 2200,
      meal_distribution: {
        ontbijt: 25, // 550 cal
        snack1: 10,  // 220 cal
        lunch: 30,   // 660 cal
        snack2: 10,  // 220 cal
        diner: 25    // 550 cal
      }
    },
    {
      name: 'Koolhydraatarm / Keto',
      description: 'Minimale koolhydraten, hoog in gezonde vetten',
      macro_ratios: { protein: 25, carbs: 10, fat: 65 },
      daily_calories: 1800,
      meal_distribution: {
        ontbijt: 25, // 450 cal
        snack1: 10,  // 180 cal
        lunch: 30,   // 540 cal
        snack2: 10,  // 180 cal
        diner: 25    // 450 cal
      }
    },
    {
      name: 'Carnivoor (Rick\'s Aanpak)',
      description: 'Alleen dierlijke producten voor maximale eenvoud',
      macro_ratios: { protein: 70, carbs: 0, fat: 30 },
      daily_calories: 2000,
      meal_distribution: {
        ontbijt: 25, // 500 cal
        snack1: 10,  // 200 cal
        lunch: 30,   // 600 cal
        snack2: 10,  // 200 cal
        diner: 25    // 500 cal
      }
    },
    {
      name: 'High Protein',
      description: 'Maximale eiwitinname voor spieropbouw en herstel',
      macro_ratios: { protein: 50, carbs: 20, fat: 30 },
      daily_calories: 2400,
      meal_distribution: {
        ontbijt: 25, // 600 cal
        snack1: 10,  // 240 cal
        lunch: 30,   // 720 cal
        snack2: 10,  // 240 cal
        diner: 25    // 600 cal
      }
    }
  ];

  // Define weekly meal variations
  const weeklyVariations = {
    monday: {
      theme: 'Energie Boost',
      description: 'Koolhydraat-rijk voor training dag',
      focus: 'carbs'
    },
    tuesday: {
      theme: 'Herstel',
      description: 'Eiwit-rijk voor spierherstel',
      focus: 'protein'
    },
    wednesday: {
      theme: 'Rust Dag',
      description: 'Gebalanceerd voor rust',
      focus: 'balanced'
    },
    thursday: {
      theme: 'Training Dag',
      description: 'Koolhydraat-rijk voor training',
      focus: 'carbs'
    },
    friday: {
      theme: 'Herstel',
      description: 'Eiwit-rijk voor weekend voorbereiding',
      focus: 'protein'
    },
    saturday: {
      theme: 'Weekend',
      description: 'Gebalanceerd weekend menu',
      focus: 'balanced'
    },
    sunday: {
      theme: 'Rust',
      description: 'Lichter menu voor rust dag',
      focus: 'light'
    }
  };

  try {
    // Create diet_weekplans table if it doesn't exist
    console.log('📊 Creating diet weekplans...');
    
    for (const diet of dietApproaches) {
      console.log(`\n🍽️ Creating weekplan for: ${diet.name}`);
      
      // Create weekplan for this diet
      const weekplanData = {
        diet_name: diet.name,
        description: diet.description,
        macro_ratios: diet.macro_ratios,
        daily_calories: diet.daily_calories,
        meal_distribution: diet.meal_distribution,
        weekly_variations: weeklyVariations,
        is_active: true
      };

      // Insert into diet_weekplans table
      const { data: weekplan, error: weekplanError } = await supabase
        .from('diet_weekplans')
        .insert(weekplanData)
        .select();

      if (weekplanError) {
        console.log(`⚠️ Could not create weekplan for ${diet.name}: ${weekplanError.message}`);
        continue;
      }

      console.log(`✅ Created weekplan for ${diet.name}`);
      
      // Create daily meal plans for each day of the week
      for (const [day, variation] of Object.entries(weeklyVariations)) {
        const dailyPlan = {
          weekplan_id: weekplan[0].id,
          day_of_week: day,
          theme: variation.theme,
          description: variation.description,
          focus: variation.focus,
          meals: generateDailyMeals(diet, day, variation)
        };

        const { error: dailyError } = await supabase
          .from('diet_daily_plans')
          .insert(dailyPlan);

        if (dailyError) {
          console.log(`⚠️ Could not create daily plan for ${day}: ${dailyError.message}`);
        } else {
          console.log(`  ✅ Created daily plan for ${day}`);
        }
      }
    }

    // Check total count
    const { data: totalWeekplans, error: countError } = await supabase
      .from('diet_weekplans')
      .select('*');

    if (!countError) {
      console.log(`\n🎉 Total diet weekplans created: ${totalWeekplans.length}`);
    }

  } catch (error) {
    console.error('❌ Error creating diet weekplans:', error);
  }
}

function generateDailyMeals(diet, day, variation) {
  // Generate meal suggestions based on diet and day focus
  const meals = {
    ontbijt: {
      name: `${variation.theme} Ontbijt`,
      calories: Math.round(diet.daily_calories * diet.meal_distribution.ontbijt / 100),
      protein: Math.round(diet.daily_calories * diet.meal_distribution.ontbijt / 100 * diet.macro_ratios.protein / 100 / 4),
      carbs: Math.round(diet.daily_calories * diet.meal_distribution.ontbijt / 100 * diet.macro_ratios.carbs / 100 / 4),
      fat: Math.round(diet.daily_calories * diet.meal_distribution.ontbijt / 100 * diet.macro_ratios.fat / 100 / 9),
      suggestions: getMealSuggestions(diet.name, 'ontbijt', variation.focus)
    },
    snack1: {
      name: `${variation.theme} Snack`,
      calories: Math.round(diet.daily_calories * diet.meal_distribution.snack1 / 100),
      protein: Math.round(diet.daily_calories * diet.meal_distribution.snack1 / 100 * diet.macro_ratios.protein / 100 / 4),
      carbs: Math.round(diet.daily_calories * diet.meal_distribution.snack1 / 100 * diet.macro_ratios.carbs / 100 / 4),
      fat: Math.round(diet.daily_calories * diet.meal_distribution.snack1 / 100 * diet.macro_ratios.fat / 100 / 9),
      suggestions: getMealSuggestions(diet.name, 'snack', variation.focus)
    },
    lunch: {
      name: `${variation.theme} Lunch`,
      calories: Math.round(diet.daily_calories * diet.meal_distribution.lunch / 100),
      protein: Math.round(diet.daily_calories * diet.meal_distribution.lunch / 100 * diet.macro_ratios.protein / 100 / 4),
      carbs: Math.round(diet.daily_calories * diet.meal_distribution.lunch / 100 * diet.macro_ratios.carbs / 100 / 4),
      fat: Math.round(diet.daily_calories * diet.meal_distribution.lunch / 100 * diet.macro_ratios.fat / 100 / 9),
      suggestions: getMealSuggestions(diet.name, 'lunch', variation.focus)
    },
    snack2: {
      name: `${variation.theme} Snack`,
      calories: Math.round(diet.daily_calories * diet.meal_distribution.snack2 / 100),
      protein: Math.round(diet.daily_calories * diet.meal_distribution.snack2 / 100 * diet.macro_ratios.protein / 100 / 4),
      carbs: Math.round(diet.daily_calories * diet.meal_distribution.snack2 / 100 * diet.macro_ratios.carbs / 100 / 4),
      fat: Math.round(diet.daily_calories * diet.meal_distribution.snack2 / 100 * diet.macro_ratios.fat / 100 / 9),
      suggestions: getMealSuggestions(diet.name, 'snack', variation.focus)
    },
    diner: {
      name: `${variation.theme} Diner`,
      calories: Math.round(diet.daily_calories * diet.meal_distribution.diner / 100),
      protein: Math.round(diet.daily_calories * diet.meal_distribution.diner / 100 * diet.macro_ratios.protein / 100 / 4),
      carbs: Math.round(diet.daily_calories * diet.meal_distribution.diner / 100 * diet.macro_ratios.carbs / 100 / 4),
      fat: Math.round(diet.daily_calories * diet.meal_distribution.diner / 100 * diet.macro_ratios.fat / 100 / 9),
      suggestions: getMealSuggestions(diet.name, 'diner', variation.focus)
    }
  };

  return meals;
}

function getMealSuggestions(dietName, mealType, focus) {
  // Return meal suggestions based on diet and meal type
  const suggestions = {
    'Gebalanceerd': {
      ontbijt: ['Havermout met Banaan en Noten', 'Whey Protein Shake', 'Eieren met Volkoren Brood'],
      lunch: ['Gegrilde Kipfilet met Groenten', 'Zalm met Basmati Rijst', 'Magere Kwark met Noten'],
      diner: ['Kalkoenfilet met Volkoren Pasta', 'Tonijn met Groenten', 'Biefstuk met Aardappelen'],
      snack: ['Noten Mix', 'Eiwitrijke Yoghurt', 'Fruit met Kwark']
    },
    'Koolhydraatarm / Keto': {
      ontbijt: ['Eieren met Spek', 'Gegrilde Ribeye Steak', 'Avocado met Eieren'],
      lunch: ['Salade met Tartaar en Noten', 'Gegrilde Kipfilet met Groenten', 'Zalm met Groenten'],
      diner: ['Gegrilde Ribeye met Boter', 'Kipfilet met Groenten', 'Tartaar met Noten'],
      snack: ['Noten Mix', 'Kaas', 'Eigeel']
    },
    'Carnivoor (Rick\'s Aanpak)': {
      ontbijt: ['Orgaanvlees Mix', 'Gegrilde T-Bone Steak', 'Eieren met Spek'],
      lunch: ['Gegrilde T-Bone Steak', 'Gans met Eendenborst', 'Ribeye Steak'],
      diner: ['Gans met Eendenborst', 'T-Bone Steak', 'Orgaanvlees Mix'],
      snack: ['Spek', 'Kaas', 'Eieren']
    },
    'High Protein': {
      ontbijt: ['Whey Protein Shake', 'Eieren met Kipfilet', 'Magere Kwark met Whey'],
      lunch: ['Magere Kwark met Noten', 'Gegrilde Kipfilet met Groenten', 'Tonijn met Eiwit'],
      diner: ['Kalkoenfilet met Volkoren Pasta', 'Kipfilet met Groenten', 'Witvis met Eiwit'],
      snack: ['Whey Protein Shake', 'Magere Kwark', 'Eiwitrijke Yoghurt']
    }
  };

  return suggestions[dietName]?.[mealType] || ['Standaard maaltijd'];
}

createDietWeekplans();




