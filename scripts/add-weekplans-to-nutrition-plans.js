const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addWeekplansToNutritionPlans() {
  console.log('📅 Adding weekplan data to nutrition plans...');
  
  // Define weekly meal variations
  const weeklyVariations = {
    monday: {
      theme: 'Energie Boost',
      description: 'Koolhydraat-rijk voor training dag',
      focus: 'carbs',
      meals: {
        ontbijt: { name: 'Energie Boost Ontbijt', calories: 550, protein: 41, carbs: 55, fat: 18 },
        snack1: { name: 'Energie Boost Snack', calories: 220, protein: 16, carbs: 22, fat: 7 },
        lunch: { name: 'Energie Boost Lunch', calories: 660, protein: 50, carbs: 66, fat: 22 },
        snack2: { name: 'Energie Boost Snack', calories: 220, protein: 16, carbs: 22, fat: 7 },
        diner: { name: 'Energie Boost Diner', calories: 550, protein: 41, carbs: 55, fat: 18 }
      }
    },
    tuesday: {
      theme: 'Herstel',
      description: 'Eiwit-rijk voor spierherstel',
      focus: 'protein',
      meals: {
        ontbijt: { name: 'Herstel Ontbijt', calories: 550, protein: 55, carbs: 33, fat: 18 },
        snack1: { name: 'Herstel Snack', calories: 220, protein: 22, carbs: 13, fat: 7 },
        lunch: { name: 'Herstel Lunch', calories: 660, protein: 66, carbs: 40, fat: 22 },
        snack2: { name: 'Herstel Snack', calories: 220, protein: 22, carbs: 13, fat: 7 },
        diner: { name: 'Herstel Diner', calories: 550, protein: 55, carbs: 33, fat: 18 }
      }
    },
    wednesday: {
      theme: 'Rust Dag',
      description: 'Gebalanceerd voor rust',
      focus: 'balanced',
      meals: {
        ontbijt: { name: 'Rust Dag Ontbijt', calories: 550, protein: 41, carbs: 55, fat: 18 },
        snack1: { name: 'Rust Dag Snack', calories: 220, protein: 16, carbs: 22, fat: 7 },
        lunch: { name: 'Rust Dag Lunch', calories: 660, protein: 50, carbs: 66, fat: 22 },
        snack2: { name: 'Rust Dag Snack', calories: 220, protein: 16, carbs: 22, fat: 7 },
        diner: { name: 'Rust Dag Diner', calories: 550, protein: 41, carbs: 55, fat: 18 }
      }
    },
    thursday: {
      theme: 'Training Dag',
      description: 'Koolhydraat-rijk voor training',
      focus: 'carbs',
      meals: {
        ontbijt: { name: 'Training Dag Ontbijt', calories: 550, protein: 41, carbs: 55, fat: 18 },
        snack1: { name: 'Training Dag Snack', calories: 220, protein: 16, carbs: 22, fat: 7 },
        lunch: { name: 'Training Dag Lunch', calories: 660, protein: 50, carbs: 66, fat: 22 },
        snack2: { name: 'Training Dag Snack', calories: 220, protein: 16, carbs: 22, fat: 7 },
        diner: { name: 'Training Dag Diner', calories: 550, protein: 41, carbs: 55, fat: 18 }
      }
    },
    friday: {
      theme: 'Herstel',
      description: 'Eiwit-rijk voor weekend voorbereiding',
      focus: 'protein',
      meals: {
        ontbijt: { name: 'Herstel Ontbijt', calories: 550, protein: 55, carbs: 33, fat: 18 },
        snack1: { name: 'Herstel Snack', calories: 220, protein: 22, carbs: 13, fat: 7 },
        lunch: { name: 'Herstel Lunch', calories: 660, protein: 66, carbs: 40, fat: 22 },
        snack2: { name: 'Herstel Snack', calories: 220, protein: 22, carbs: 13, fat: 7 },
        diner: { name: 'Herstel Diner', calories: 550, protein: 55, carbs: 33, fat: 18 }
      }
    },
    saturday: {
      theme: 'Weekend',
      description: 'Gebalanceerd weekend menu',
      focus: 'balanced',
      meals: {
        ontbijt: { name: 'Weekend Ontbijt', calories: 550, protein: 41, carbs: 55, fat: 18 },
        snack1: { name: 'Weekend Snack', calories: 220, protein: 16, carbs: 22, fat: 7 },
        lunch: { name: 'Weekend Lunch', calories: 660, protein: 50, carbs: 66, fat: 22 },
        snack2: { name: 'Weekend Snack', calories: 220, protein: 16, carbs: 22, fat: 7 },
        diner: { name: 'Weekend Diner', calories: 550, protein: 41, carbs: 55, fat: 18 }
      }
    },
    sunday: {
      theme: 'Rust',
      description: 'Lichter menu voor rust dag',
      focus: 'light',
      meals: {
        ontbijt: { name: 'Rust Ontbijt', calories: 440, protein: 33, carbs: 44, fat: 15 },
        snack1: { name: 'Rust Snack', calories: 176, protein: 13, carbs: 18, fat: 6 },
        lunch: { name: 'Rust Lunch', calories: 528, protein: 40, carbs: 53, fat: 18 },
        snack2: { name: 'Rust Snack', calories: 176, protein: 13, carbs: 18, fat: 6 },
        diner: { name: 'Rust Diner', calories: 440, protein: 33, carbs: 44, fat: 15 }
      }
    }
  };

  // Diet-specific meal suggestions
  const dietMealSuggestions = {
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

  try {
    // Get existing nutrition plans
    const { data: plans, error: plansError } = await supabase
      .from('nutrition_plans')
      .select('*');

    if (plansError) throw plansError;

    console.log(`📋 Found ${plans.length} nutrition plans to update`);

    for (const plan of plans) {
      console.log(`\n🍽️ Updating weekplan for: ${plan.name}`);

      // Create weekplan data for this diet
      const weekplanData = {
        weekly_variations: weeklyVariations,
        meal_suggestions: dietMealSuggestions[plan.name] || dietMealSuggestions['Gebalanceerd'],
        meal_distribution: {
          ontbijt: 25,
          snack1: 10,
          lunch: 30,
          snack2: 10,
          diner: 25
        },
        has_weekplan: true
      };

      // Update the nutrition plan with weekplan data
      const { error: updateError } = await supabase
        .from('nutrition_plans')
        .update(weekplanData)
        .eq('id', plan.id);

      if (updateError) {
        console.log(`⚠️ Could not update ${plan.name}: ${updateError.message}`);
      } else {
        console.log(`✅ Updated ${plan.name} with weekplan data`);
      }
    }

    // Check final status
    const { data: updatedPlans, error: finalError } = await supabase
      .from('nutrition_plans')
      .select('name, has_weekplan, weekly_variations');

    if (!finalError) {
      console.log('\n🎉 Final nutrition plans status:');
      updatedPlans.forEach(plan => {
        console.log(`  - ${plan.name}: ${plan.has_weekplan ? '✅ Weekplan' : '❌ No weekplan'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error updating nutrition plans:', error);
  }
}

addWeekplansToNutritionPlans();




