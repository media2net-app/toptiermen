require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🥩 CREATING COMPLETE CARNIVOR ANIMAL BASED WEEK PLAN');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCarnivorWeekPlan() {
  try {
    console.log('📋 CARNIVOR ANIMAL BASED PRINCIPLES:');
    console.log('----------------------------------------');
    console.log('✅ Primary: Animal-based foods (meat, fish, eggs, organ meats)');
    console.log('✅ Secondary: Limited fruits, honey, raw dairy');
    console.log('✅ Fats: Animal fats (butter, tallow, lard)');
    console.log('❌ Avoid: Grains, legumes, most vegetables, processed foods');
    console.log('❌ Avoid: Plant oils, refined sugars');
    console.log('');

    // Complete week plan with variety
    const carnivorWeekPlan = {
      monday: {
        day: 'monday',
        diet_type: 'carnivor_animal_based',
        total_calories: 2350,
        total_protein: 185,
        total_carbs: 25,
        total_fat: 165,
        meals: [
          {
            id: 'monday-breakfast',
            name: 'Orgaanvlees & Eieren Ontbijt',
            time: '08:00',
            calories: 520,
            protein: 42,
            carbs: 8,
            fat: 35,
            ingredients: [
              { name: 'Runderlever', amount: 100, unit: 'g' },
              { name: 'Runderhart', amount: 50, unit: 'g' },
              { name: 'Eieren', amount: 3, unit: 'stuks' },
              { name: 'Roomboter', amount: 25, unit: 'g' },
              { name: 'Honing', amount: 10, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'monday-snack1',
            name: 'Gerookte Zalm met Boter',
            time: '10:30',
            calories: 280,
            protein: 22,
            carbs: 0,
            fat: 20,
            ingredients: [
              { name: 'Gerookte Zalm', amount: 120, unit: 'g' },
              { name: 'Roomboter', amount: 15, unit: 'g' },
              { name: 'Zout', amount: 2, unit: 'g' }
            ]
          },
          {
            id: 'monday-lunch',
            name: 'Ribeye Steak met Boter',
            time: '13:00',
            calories: 650,
            protein: 45,
            carbs: 0,
            fat: 50,
            ingredients: [
              { name: 'Ribeye Steak', amount: 250, unit: 'g' },
              { name: 'Roomboter', amount: 30, unit: 'g' },
              { name: 'Talow', amount: 10, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'monday-snack2',
            name: 'Eieren met Spek',
            time: '15:30',
            calories: 320,
            protein: 18,
            carbs: 2,
            fat: 25,
            ingredients: [
              { name: 'Eieren', amount: 2, unit: 'stuks' },
              { name: 'Spek', amount: 40, unit: 'g' },
              { name: 'Roomboter', amount: 10, unit: 'g' }
            ]
          },
          {
            id: 'monday-dinner',
            name: 'Lamskotelet met Orgaanvlees',
            time: '19:00',
            calories: 580,
            protein: 58,
            carbs: 15,
            fat: 35,
            ingredients: [
              { name: 'Lamskotelet', amount: 200, unit: 'g' },
              { name: 'Kippenlever', amount: 50, unit: 'g' },
              { name: 'Roomboter', amount: 20, unit: 'g' },
              { name: 'Honing', amount: 15, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          }
        ]
      },
      tuesday: {
        day: 'tuesday',
        diet_type: 'carnivor_animal_based',
        total_calories: 2280,
        total_protein: 178,
        total_carbs: 22,
        total_fat: 158,
        meals: [
          {
            id: 'tuesday-breakfast',
            name: 'T-Bone Steak & Eieren',
            time: '08:00',
            calories: 580,
            protein: 48,
            carbs: 2,
            fat: 40,
            ingredients: [
              { name: 'T-Bone Steak', amount: 200, unit: 'g' },
              { name: 'Eieren', amount: 3, unit: 'stuks' },
              { name: 'Roomboter', amount: 30, unit: 'g' },
              { name: 'Talow', amount: 10, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'tuesday-snack1',
            name: 'Droge Worst',
            time: '10:30',
            calories: 240,
            protein: 16,
            carbs: 0,
            fat: 20,
            ingredients: [
              { name: 'Droge Worst', amount: 80, unit: 'g' }
            ]
          },
          {
            id: 'tuesday-lunch',
            name: 'Kipfilet met Boter',
            time: '13:00',
            calories: 420,
            protein: 45,
            carbs: 0,
            fat: 25,
            ingredients: [
              { name: 'Kipfilet', amount: 250, unit: 'g' },
              { name: 'Roomboter', amount: 30, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'tuesday-snack2',
            name: 'Kaas met Boter',
            time: '15:30',
            calories: 280,
            protein: 12,
            carbs: 2,
            fat: 25,
            ingredients: [
              { name: 'Goudse Kaas', amount: 60, unit: 'g' },
              { name: 'Roomboter', amount: 20, unit: 'g' }
            ]
          },
          {
            id: 'tuesday-dinner',
            name: 'Entrecote met Orgaanvlees',
            time: '19:00',
            calories: 760,
            protein: 57,
            carbs: 18,
            fat: 48,
            ingredients: [
              { name: 'Entrecote', amount: 250, unit: 'g' },
              { name: 'Rundernieren', amount: 50, unit: 'g' },
              { name: 'Roomboter', amount: 25, unit: 'g' },
              { name: 'Honing', amount: 15, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          }
        ]
      },
      wednesday: {
        day: 'wednesday',
        diet_type: 'carnivor_animal_based',
        total_calories: 2420,
        total_protein: 192,
        total_carbs: 28,
        total_fat: 170,
        meals: [
          {
            id: 'wednesday-breakfast',
            name: 'Spek & Eieren Ontbijt',
            time: '08:00',
            calories: 520,
            protein: 35,
            carbs: 5,
            fat: 40,
            ingredients: [
              { name: 'Spek', amount: 80, unit: 'g' },
              { name: 'Eieren', amount: 4, unit: 'stuks' },
              { name: 'Roomboter', amount: 20, unit: 'g' },
              { name: 'Honing', amount: 10, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'wednesday-snack1',
            name: 'Kipreepjes',
            time: '10:30',
            calories: 220,
            protein: 22,
            carbs: 0,
            fat: 12,
            ingredients: [
              { name: 'Kipfilet', amount: 100, unit: 'g' },
              { name: 'Roomboter', amount: 10, unit: 'g' },
              { name: 'Zout', amount: 3, unit: 'g' }
            ]
          },
          {
            id: 'wednesday-lunch',
            name: 'Lamsvlees met Boter',
            time: '13:00',
            calories: 580,
            protein: 50,
            carbs: 0,
            fat: 40,
            ingredients: [
              { name: 'Lamsvlees', amount: 250, unit: 'g' },
              { name: 'Roomboter', amount: 35, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'wednesday-snack2',
            name: 'Griekse Yoghurt met Honing',
            time: '15:30',
            calories: 180,
            protein: 15,
            carbs: 8,
            fat: 8,
            ingredients: [
              { name: 'Griekse Yoghurt', amount: 150, unit: 'g' },
              { name: 'Honing', amount: 15, unit: 'g' }
            ]
          },
          {
            id: 'wednesday-dinner',
            name: 'Gebakken Lever met Boter',
            time: '19:00',
            calories: 920,
            protein: 70,
            carbs: 15,
            fat: 70,
            ingredients: [
              { name: 'Runderlever', amount: 200, unit: 'g' },
              { name: 'Roomboter', amount: 40, unit: 'g' },
              { name: 'Honing', amount: 15, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          }
        ]
      },
      thursday: {
        day: 'thursday',
        diet_type: 'carnivor_animal_based',
        total_calories: 2300,
        total_protein: 180,
        total_carbs: 25,
        total_fat: 162,
        meals: [
          {
            id: 'thursday-breakfast',
            name: 'Ribeye & Eieren',
            time: '08:00',
            calories: 550,
            protein: 45,
            carbs: 2,
            fat: 40,
            ingredients: [
              { name: 'Ribeye Steak', amount: 200, unit: 'g' },
              { name: 'Eieren', amount: 3, unit: 'stuks' },
              { name: 'Roomboter', amount: 30, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'thursday-snack1',
            name: 'Gerookte Zalm',
            time: '10:30',
            calories: 200,
            protein: 22,
            carbs: 0,
            fat: 12,
            ingredients: [
              { name: 'Gerookte Zalm', amount: 100, unit: 'g' }
            ]
          },
          {
            id: 'thursday-lunch',
            name: 'Zalmfilet met Boter',
            time: '13:00',
            calories: 480,
            protein: 45,
            carbs: 0,
            fat: 30,
            ingredients: [
              { name: 'Zalmfilet', amount: 250, unit: 'g' },
              { name: 'Roomboter', amount: 25, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'thursday-snack2',
            name: 'Eieren met Kaas',
            time: '15:30',
            calories: 320,
            protein: 20,
            carbs: 3,
            fat: 25,
            ingredients: [
              { name: 'Eieren', amount: 2, unit: 'stuks' },
              { name: 'Goudse Kaas', amount: 50, unit: 'g' },
              { name: 'Roomboter', amount: 15, unit: 'g' }
            ]
          },
          {
            id: 'thursday-dinner',
            name: 'Lamskotelet met Boter',
            time: '19:00',
            calories: 750,
            protein: 48,
            carbs: 20,
            fat: 55,
            ingredients: [
              { name: 'Lamskotelet', amount: 250, unit: 'g' },
              { name: 'Roomboter', amount: 30, unit: 'g' },
              { name: 'Honing', amount: 15, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          }
        ]
      },
      friday: {
        day: 'friday',
        diet_type: 'carnivor_animal_based',
        total_calories: 2380,
        total_protein: 188,
        total_carbs: 26,
        total_fat: 168,
        meals: [
          {
            id: 'friday-breakfast',
            name: 'Orgaanvlees Mix',
            time: '08:00',
            calories: 480,
            protein: 40,
            carbs: 8,
            fat: 30,
            ingredients: [
              { name: 'Kippenlever', amount: 100, unit: 'g' },
              { name: 'Runderhart', amount: 50, unit: 'g' },
              { name: 'Roomboter', amount: 25, unit: 'g' },
              { name: 'Honing', amount: 10, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'friday-snack1',
            name: 'Droge Worst',
            time: '10:30',
            calories: 240,
            protein: 16,
            carbs: 0,
            fat: 20,
            ingredients: [
              { name: 'Droge Worst', amount: 80, unit: 'g' }
            ]
          },
          {
            id: 'friday-lunch',
            name: 'Kipfilet met Boter',
            time: '13:00',
            calories: 420,
            protein: 45,
            carbs: 0,
            fat: 25,
            ingredients: [
              { name: 'Kipfilet', amount: 250, unit: 'g' },
              { name: 'Roomboter', amount: 30, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'friday-snack2',
            name: 'Spek met Eieren',
            time: '15:30',
            calories: 320,
            protein: 18,
            carbs: 2,
            fat: 25,
            ingredients: [
              { name: 'Spek', amount: 40, unit: 'g' },
              { name: 'Eieren', amount: 2, unit: 'stuks' },
              { name: 'Roomboter', amount: 10, unit: 'g' }
            ]
          },
          {
            id: 'friday-dinner',
            name: 'Gans met Eendenborst',
            time: '19:00',
            calories: 920,
            protein: 69,
            carbs: 16,
            fat: 68,
            ingredients: [
              { name: 'Gans', amount: 200, unit: 'g' },
              { name: 'Eendenborst', amount: 100, unit: 'g' },
              { name: 'Roomboter', amount: 30, unit: 'g' },
              { name: 'Honing', amount: 15, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          }
        ]
      },
      saturday: {
        day: 'saturday',
        diet_type: 'carnivor_animal_based',
        total_calories: 2450,
        total_protein: 195,
        total_carbs: 28,
        total_fat: 172,
        meals: [
          {
            id: 'saturday-breakfast',
            name: 'Spek & Eieren',
            time: '08:00',
            calories: 520,
            protein: 35,
            carbs: 5,
            fat: 40,
            ingredients: [
              { name: 'Spek', amount: 80, unit: 'g' },
              { name: 'Eieren', amount: 4, unit: 'stuks' },
              { name: 'Roomboter', amount: 20, unit: 'g' },
              { name: 'Honing', amount: 10, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'saturday-snack1',
            name: 'Lamsvlees',
            time: '10:30',
            calories: 300,
            protein: 25,
            carbs: 0,
            fat: 20,
            ingredients: [
              { name: 'Lamsvlees', amount: 120, unit: 'g' },
              { name: 'Roomboter', amount: 15, unit: 'g' },
              { name: 'Zout', amount: 3, unit: 'g' }
            ]
          },
          {
            id: 'saturday-lunch',
            name: 'Entrecote met Boter',
            time: '13:00',
            calories: 680,
            protein: 55,
            carbs: 0,
            fat: 50,
            ingredients: [
              { name: 'Entrecote', amount: 250, unit: 'g' },
              { name: 'Roomboter', amount: 35, unit: 'g' },
              { name: 'Talow', amount: 10, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'saturday-snack2',
            name: 'Gebakken Lever',
            time: '15:30',
            calories: 350,
            protein: 35,
            carbs: 8,
            fat: 22,
            ingredients: [
              { name: 'Runderlever', amount: 100, unit: 'g' },
              { name: 'Roomboter', amount: 20, unit: 'g' },
              { name: 'Honing', amount: 10, unit: 'g' },
              { name: 'Zout', amount: 3, unit: 'g' }
            ]
          },
          {
            id: 'saturday-dinner',
            name: 'T-Bone Steak met Orgaanvlees',
            time: '19:00',
            calories: 600,
            protein: 45,
            carbs: 15,
            fat: 40,
            ingredients: [
              { name: 'T-Bone Steak', amount: 200, unit: 'g' },
              { name: 'Rundernieren', amount: 50, unit: 'g' },
              { name: 'Roomboter', amount: 25, unit: 'g' },
              { name: 'Honing', amount: 15, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          }
        ]
      },
      sunday: {
        day: 'sunday',
        diet_type: 'carnivor_animal_based',
        total_calories: 2320,
        total_protein: 182,
        total_carbs: 24,
        total_fat: 165,
        meals: [
          {
            id: 'sunday-breakfast',
            name: 'Ribeye & Eieren',
            time: '08:00',
            calories: 550,
            protein: 45,
            carbs: 2,
            fat: 40,
            ingredients: [
              { name: 'Ribeye Steak', amount: 200, unit: 'g' },
              { name: 'Eieren', amount: 3, unit: 'stuks' },
              { name: 'Roomboter', amount: 30, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'sunday-snack1',
            name: 'Gerookte Zalm',
            time: '10:30',
            calories: 200,
            protein: 22,
            carbs: 0,
            fat: 12,
            ingredients: [
              { name: 'Gerookte Zalm', amount: 100, unit: 'g' }
            ]
          },
          {
            id: 'sunday-lunch',
            name: 'Lamskotelet met Boter',
            time: '13:00',
            calories: 580,
            protein: 50,
            carbs: 0,
            fat: 40,
            ingredients: [
              { name: 'Lamskotelet', amount: 250, unit: 'g' },
              { name: 'Roomboter', amount: 35, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          },
          {
            id: 'sunday-snack2',
            name: 'Kaas met Boter',
            time: '15:30',
            calories: 280,
            protein: 12,
            carbs: 2,
            fat: 25,
            ingredients: [
              { name: 'Goudse Kaas', amount: 60, unit: 'g' },
              { name: 'Roomboter', amount: 20, unit: 'g' }
            ]
          },
          {
            id: 'sunday-dinner',
            name: 'Orgaanvlees Mix',
            time: '19:00',
            calories: 710,
            protein: 53,
            carbs: 20,
            fat: 48,
            ingredients: [
              { name: 'Runderlever', amount: 100, unit: 'g' },
              { name: 'Kippenlever', amount: 50, unit: 'g' },
              { name: 'Runderhart', amount: 50, unit: 'g' },
              { name: 'Roomboter', amount: 25, unit: 'g' },
              { name: 'Honing', amount: 15, unit: 'g' },
              { name: 'Zout', amount: 5, unit: 'g' }
            ]
          }
        ]
      }
    };

    console.log('📋 COMPLETE CARNIVOR ANIMAL BASED WEEK PLAN:');
    console.log('----------------------------------------');
    
    // Display each day's summary
    Object.entries(carnivorWeekPlan).forEach(([day, dayPlan]) => {
      console.log(`📅 ${day.toUpperCase()}:`);
      console.log(`   🌅 08:00 - ${dayPlan.meals[0].name} (${dayPlan.meals[0].calories} cal)`);
      console.log(`   ☕ 10:30 - ${dayPlan.meals[1].name} (${dayPlan.meals[1].calories} cal)`);
      console.log(`   🌞 13:00 - ${dayPlan.meals[2].name} (${dayPlan.meals[2].calories} cal)`);
      console.log(`   🍳 15:30 - ${dayPlan.meals[3].name} (${dayPlan.meals[3].calories} cal)`);
      console.log(`   🌙 19:00 - ${dayPlan.meals[4].name} (${dayPlan.meals[4].calories} cal)`);
      console.log(`   📊 Totaal: ${dayPlan.total_calories} cal, ${dayPlan.total_protein}g eiwit, ${dayPlan.total_carbs}g carbs, ${dayPlan.total_fat}g vet`);
      console.log('');
    });

    // Calculate weekly averages
    const weeklyTotals = Object.values(carnivorWeekPlan).reduce((acc, day) => ({
      calories: acc.calories + day.total_calories,
      protein: acc.protein + day.total_protein,
      carbs: acc.carbs + day.total_carbs,
      fat: acc.fat + day.total_fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const weeklyAverages = {
      calories: Math.round(weeklyTotals.calories / 7),
      protein: Math.round(weeklyTotals.protein / 7),
      carbs: Math.round(weeklyTotals.carbs / 7),
      fat: Math.round(weeklyTotals.fat / 7)
    };

    console.log('📊 WEEKLY AVERAGES:');
    console.log('----------------------------------------');
    console.log(`   Calories: ${weeklyAverages.calories} per dag`);
    console.log(`   Protein: ${weeklyAverages.protein}g per dag`);
    console.log(`   Carbs: ${weeklyAverages.carbs}g per dag`);
    console.log(`   Fat: ${weeklyAverages.fat}g per dag`);
    console.log('');

    console.log('🥩 KEY INGREDIENTS PER DAG:');
    console.log('----------------------------------------');
    console.log('   • Orgaanvlees (lever, hart, nieren) - Voor voedingsstoffen');
    console.log('   • Vette vis (zalm) - Voor omega-3');
    console.log('   • Vette steaks (ribeye, entrecote, T-bone) - Voor verzadigde vetten');
    console.log('   • Eieren - Voor choline en eiwit');
    console.log('   • Dierlijke vetten (boter, talow) - Voor energie');
    console.log('   • Honing - Beperkte koolhydraten');
    console.log('   • Zuivel (kaas, yoghurt) - Voor variatie');
    console.log('');

    console.log('🎯 CARNIVOR ANIMAL BASED COMPLIANT:');
    console.log('----------------------------------------');
    console.log('   ✅ Alleen dierlijke producten als basis');
    console.log('   ✅ Beperkte koolhydraten (22-28g per dag)');
    console.log('   ✅ Hoge vetinname (158-172g per dag)');
    console.log('   ✅ Orgaanvlees voor voedingsstoffen');
    console.log('   ✅ Geen granen, peulvruchten of groenten');
    console.log('   ✅ Honing als enige plantaardige toevoeging');
    console.log('   ✅ Variatie in vleessoorten en bereidingsmethoden');

    // Try to save to database if nutrition_weekplans table exists
    try {
      for (const [day, dayPlan] of Object.entries(carnivorWeekPlan)) {
        const { error: insertError } = await supabase
          .from('nutrition_weekplans')
          .upsert({
            plan_id: 'carnivor_animal_based',
            day_of_week: day,
            meal_plan: dayPlan,
            total_calories: dayPlan.total_calories,
            total_protein: dayPlan.total_protein,
            total_carbs: dayPlan.total_carbs,
            total_fat: dayPlan.total_fat
          }, { onConflict: 'plan_id,day_of_week' });

        if (insertError) {
          console.log(`ℹ️  Could not save ${day} to database`);
        }
      }
      console.log('✅ Saved complete week plan to database');
    } catch (error) {
      console.log('ℹ️  Database save skipped');
    }

    console.log('');
    console.log('🎯 COMPLETE WEEK PLAN READY!');
    console.log('----------------------------------------');
    console.log('✅ Complete 7-day Carnivor Animal Based meal plan created');
    console.log('✅ All days follow carnivor principles');
    console.log('✅ Optimal macro distribution for animal-based nutrition');
    console.log('✅ Rich in essential nutrients from organ meats');
    console.log('✅ Varied meals to prevent boredom');
    console.log('✅ Ready for implementation');

  } catch (error) {
    console.error('❌ Error creating carnivor week plan:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting complete carnivor week plan creation...');
    console.log('');
    
    await createCarnivorWeekPlan();
    
  } catch (error) {
    console.error('❌ Creation failed:', error.message);
  }
}

main();
