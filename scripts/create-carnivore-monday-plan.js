require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCarnivoreMondayPlan() {
  try {
    console.log('🥩 Creating comprehensive carnivore meal plan for Monday...\n');

    // Carnivore Diet Principles
    console.log('📋 Carnivore Diet Principles:');
    console.log('• Primary focus: Animal-based foods (meat, fish, eggs, organ meats)');
    console.log('• High fat, moderate protein, very low carb');
    console.log('• Emphasis on fatty cuts of meat');
    console.log('• Limited to small amounts of low-carb fruits');
    console.log('• Avoid: grains, legumes, most vegetables, processed foods\n');

    // Monday Carnivore Meal Plan
    const mondayCarnivorePlan = {
      day: 'monday',
      diet_type: 'carnivore',
      total_calories: 2200,
      total_protein: 180,
      total_carbs: 15,
      total_fat: 160,
      meals: [
        {
          id: 'monday-carnivore-breakfast',
          name: 'Orgaanvlees & Eieren Ontbijt',
          description: 'Traditioneel carnivoor ontbijt met lever, hart en eieren voor maximale voedingsstoffen',
          time: '08:00',
          type: 'breakfast',
          calories: 450,
          protein: 35,
          carbs: 3,
          fat: 30,
          ingredients: [
            {
              name: 'Orgaanvlees (Lever)',
              amount: 100,
              unit: 'g',
              calories_per_100g: 130,
              protein_per_100g: 20,
              carbs_per_100g: 3,
              fat_per_100g: 4
            },
            {
              name: 'Orgaanvlees (Hart)',
              amount: 50,
              unit: 'g',
              calories_per_100g: 110,
              protein_per_100g: 18,
              carbs_per_100g: 0,
              fat_per_100g: 4
            },
            {
              name: 'Eieren',
              amount: 3,
              unit: 'stuks',
              calories_per_100g: 155,
              protein_per_100g: 13,
              carbs_per_100g: 1.1,
              fat_per_100g: 11
            },
            {
              name: 'Talow',
              amount: 15,
              unit: 'g',
              calories_per_100g: 900,
              protein_per_100g: 0,
              carbs_per_100g: 0,
              fat_per_100g: 100
            },
            {
              name: 'Zout',
              amount: 5,
              unit: 'g',
              calories_per_100g: 0,
              protein_per_100g: 0,
              carbs_per_100g: 0,
              fat_per_100g: 0
            }
          ],
          instructions: [
            '1. Verwarm een pan op middelhoog vuur',
            '2. Voeg talow toe en laat smelten',
            '3. Bak lever 2-3 minuten per kant (medium-rare)',
            '4. Bak hart 3-4 minuten per kant',
            '5. Bak eieren in dezelfde pan',
            '6. Kruid met zout en serveer warm'
          ],
          tips: [
            'Lever is rijk aan vitamine A, B12, foliumzuur en ijzer',
            'Hart bevat co-enzym Q10 en creatine',
            'Eieren voorzien in choline en gezonde vetten',
            'Talow is een traditionele carnivoor vetbron'
          ]
        },
        {
          id: 'monday-carnivore-lunch',
          name: 'Gegrilde Ribeye Steak',
          description: 'Premium ribeye steak met boter en zout - de perfecte carnivoor lunch',
          time: '13:00',
          type: 'lunch',
          calories: 600,
          protein: 45,
          carbs: 0,
          fat: 45,
          ingredients: [
            {
              name: 'Ribeye Steak',
              amount: 250,
              unit: 'g',
              calories_per_100g: 280,
              protein_per_100g: 25,
              carbs_per_100g: 0,
              fat_per_100g: 20
            },
            {
              name: 'Boter',
              amount: 30,
              unit: 'g',
              calories_per_100g: 720,
              protein_per_100g: 0.9,
              carbs_per_100g: 0.1,
              fat_per_100g: 81
            },
            {
              name: 'Zout',
              amount: 5,
              unit: 'g',
              calories_per_100g: 0,
              protein_per_100g: 0,
              carbs_per_100g: 0,
              fat_per_100g: 0
            }
          ],
          instructions: [
            '1. Haal steak 30 minuten voor het koken uit de koelkast',
            '2. Verwarm grill of pan op hoog vuur',
            '3. Kruid steak rijkelijk met zout',
            '4. Grill 4-5 minuten per kant voor medium-rare',
            '5. Laat 10 minuten rusten onder folie',
            '6. Serveer met een klontje boter erop'
          ],
          tips: [
            'Ribeye is een van de vetste en smaakvolste steaks',
            'Rusttijd is cruciaal voor sappigheid',
            'Boter voegt extra vet en smaak toe',
            'Medium-rare behoudt voedingsstoffen het beste'
          ]
        },
        {
          id: 'monday-carnivore-snack',
          name: 'Gerookte Zalm & Spek',
          description: 'Vette vis gecombineerd met spek voor een perfecte carnivoor snack',
          time: '16:00',
          type: 'snack',
          calories: 350,
          protein: 25,
          carbs: 0,
          fat: 28,
          ingredients: [
            {
              name: 'Zalm (Wild)',
              amount: 100,
              unit: 'g',
              calories_per_100g: 200,
              protein_per_100g: 25,
              carbs_per_100g: 0,
              fat_per_100g: 12
            },
            {
              name: 'Spek',
              amount: 40,
              unit: 'g',
              calories_per_100g: 400,
              protein_per_100g: 15,
              carbs_per_100g: 0,
              fat_per_100g: 40
            }
          ],
          instructions: [
            '1. Bak spek knapperig in een pan',
            '2. Serveer gerookte zalm op kamertemperatuur',
            '3. Combineer voor een perfecte vet-eiwit balans'
          ],
          tips: [
            'Wilde zalm bevat meer omega-3 dan gekweekte',
            'Spek voegt extra vet en smaak toe',
            'Perfect voor het avondeten'
          ]
        },
        {
          id: 'monday-carnivore-dinner',
          name: 'T-Bone Steak met Eendenborst',
          description: 'Luxe carnivoor diner met premium vlees en traditionele vetten',
          time: '19:00',
          type: 'dinner',
          calories: 800,
          protein: 75,
          carbs: 0,
          fat: 57,
          ingredients: [
            {
              name: 'T-Bone Steak',
              amount: 300,
              unit: 'g',
              calories_per_100g: 250,
              protein_per_100g: 26,
              carbs_per_100g: 0,
              fat_per_100g: 15
            },
            {
              name: 'Eendenborst',
              amount: 100,
              unit: 'g',
              calories_per_100g: 200,
              protein_per_100g: 25,
              carbs_per_100g: 0,
              fat_per_100g: 10
            },
            {
              name: 'Reuzel',
              amount: 20,
              unit: 'g',
              calories_per_100g: 900,
              protein_per_100g: 0,
              carbs_per_100g: 0,
              fat_per_100g: 100
            },
            {
              name: 'Zout',
              amount: 5,
              unit: 'g',
              calories_per_100g: 0,
              protein_per_100g: 0,
              carbs_per_100g: 0,
              fat_per_100g: 0
            }
          ],
          instructions: [
            '1. Verwarm oven op 200°C',
            '2. Kruid T-bone en eendenborst met zout',
            '3. Bak T-bone 6-8 minuten per kant',
            '4. Bak eendenborst 8-10 minuten (skin down)',
            '5. Laat vlees 10 minuten rusten',
            '6. Serveer met reuzel als extra vetbron'
          ],
          tips: [
            'T-bone combineert strip en tenderloin',
            'Eendenborst is rijk aan gezonde vetten',
            'Reuzel is een traditionele carnivoor vetbron',
            'Perfecte combinatie van verschillende vleessoorten'
          ]
        }
      ],
      nutrition_summary: {
        total_calories: 2200,
        total_protein: 180,
        total_carbs: 15,
        total_fat: 160,
        protein_percentage: 33,
        carbs_percentage: 3,
        fat_percentage: 64
      },
      carnivore_benefits: [
        'Hoog in essentiële aminozuren',
        'Rijk aan vitamine B12, D, A en K2',
        'Gezonde vetten voor energie en hormonen',
        'Minimale ontstekingsbevorderende stoffen',
        'Stabiele bloedsuikerspiegel',
        'Verbeterde mentale helderheid'
      ],
      shopping_list: [
        'Orgaanvlees (lever) - 100g',
        'Orgaanvlees (hart) - 50g',
        'Eieren - 3 stuks',
        'Talow - 15g',
        'Ribeye steak - 250g',
        'Boter - 30g',
        'Gerookte zalm - 100g',
        'Spek - 40g',
        'T-bone steak - 300g',
        'Eendenborst - 100g',
        'Reuzel - 20g',
        'Zout'
      ]
    };

    // Display the plan
    console.log('📅 MONDAY CARNIVORE MEAL PLAN');
    console.log('='.repeat(50));
    console.log(`Total Calories: ${mondayCarnivorePlan.total_calories}`);
    console.log(`Protein: ${mondayCarnivorePlan.total_protein}g (${mondayCarnivorePlan.nutrition_summary.protein_percentage}%)`);
    console.log(`Carbs: ${mondayCarnivorePlan.total_carbs}g (${mondayCarnivorePlan.nutrition_summary.carbs_percentage}%)`);
    console.log(`Fat: ${mondayCarnivorePlan.total_fat}g (${mondayCarnivorePlan.nutrition_summary.fat_percentage}%)\n`);

    // Display meals
    mondayCarnivorePlan.meals.forEach((meal, index) => {
      console.log(`${index + 1}. ${meal.name.toUpperCase()} (${meal.time})`);
      console.log(`   ${meal.description}`);
      console.log(`   Calories: ${meal.calories} | Protein: ${meal.protein}g | Carbs: ${meal.carbs}g | Fat: ${meal.fat}g`);
      console.log('   Ingredients:');
      meal.ingredients.forEach(ingredient => {
        console.log(`     • ${ingredient.name}: ${ingredient.amount}${ingredient.unit}`);
      });
      console.log('   Instructions:');
      meal.instructions.forEach(instruction => {
        console.log(`     ${instruction}`);
      });
      console.log('   Tips:');
      meal.tips.forEach(tip => {
        console.log(`     • ${tip}`);
      });
      console.log('');
    });

    // Display benefits
    console.log('🥩 CARNIVORE DIET BENEFITS:');
    mondayCarnivorePlan.carnivore_benefits.forEach(benefit => {
      console.log(`   ✅ ${benefit}`);
    });

    console.log('\n🛒 SHOPPING LIST:');
    mondayCarnivorePlan.shopping_list.forEach(item => {
      console.log(`   • ${item}`);
    });

    console.log('\n📋 CARNIVORE GUIDELINES:');
    console.log('• Eet tot verzadiging - geen calorieën tellen');
    console.log('• Focus op vettere stukken vlees');
    console.log('• Drink water, zwarte koffie, thee');
    console.log('• Vermijd alle plantaardige oliën');
    console.log('• Eet orgaanvlees 1-2x per week');
    console.log('• Zout naar smaak (mineraal zout)');

    console.log('\n🎯 This plan provides:');
    console.log('• Optimal protein for muscle maintenance');
    console.log('• High-quality fats for energy');
    console.log('• Essential nutrients from organ meats');
    console.log('• Minimal inflammation triggers');
    console.log('• Stable energy throughout the day');

  } catch (error) {
    console.error('❌ Error creating carnivore plan:', error);
  }
}

createCarnivoreMondayPlan();
