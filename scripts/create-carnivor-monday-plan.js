require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🥩 CREATING CARNIVOR ANIMAL BASED MONDAY PLAN');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCarnivorMondayPlan() {
  try {
    console.log('📋 CARNIVOR ANIMAL BASED PRINCIPLES:');
    console.log('----------------------------------------');
    console.log('✅ Primary: Animal-based foods (meat, fish, eggs, organ meats)');
    console.log('✅ Secondary: Limited fruits, honey, raw dairy');
    console.log('✅ Fats: Animal fats (butter, tallow, lard)');
    console.log('❌ Avoid: Grains, legumes, most vegetables, processed foods');
    console.log('❌ Avoid: Plant oils, refined sugars');
    console.log('');

    // Monday Carnivor Animal Based Meal Plan
    const mondayCarnivorPlan = {
      day: 'monday',
      diet_type: 'carnivor_animal_based',
      total_calories: 2350,
      total_protein: 185,
      total_carbs: 25,
      total_fat: 165,
      meals: [
        {
          id: 'monday-carnivor-breakfast',
          name: 'Orgaanvlees & Eieren Ontbijt',
          description: 'Traditioneel carnivor ontbijt met lever, hart en eieren voor maximale voedingsstoffen',
          time: '08:00',
          type: 'breakfast',
          calories: 520,
          protein: 42,
          carbs: 8,
          fat: 35,
          ingredients: [
            {
              name: 'Runderlever',
              amount: 100,
              unit: 'g',
              calories_per_100g: 135,
              protein_per_100g: 20,
              carbs_per_100g: 3.9,
              fat_per_100g: 3.6
            },
            {
              name: 'Runderhart',
              amount: 50,
              unit: 'g',
              calories_per_100g: 110,
              protein_per_100g: 18,
              carbs_per_100g: 0,
              fat_per_100g: 4
            },
            {
              name: 'Eieren (3 stuks)',
              amount: 150,
              unit: 'g',
              calories_per_100g: 155,
              protein_per_100g: 12.5,
              carbs_per_100g: 1.1,
              fat_per_100g: 11
            },
            {
              name: 'Roomboter',
              amount: 25,
              unit: 'g',
              calories_per_100g: 717,
              protein_per_100g: 0.9,
              carbs_per_100g: 0.1,
              fat_per_100g: 81
            },
            {
              name: 'Honing (kleine hoeveelheid)',
              amount: 10,
              unit: 'g',
              calories_per_100g: 304,
              protein_per_100g: 0.3,
              carbs_per_100g: 82,
              fat_per_100g: 0
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
            '2. Smelt 15g boter in de pan',
            '3. Bak lever 2-3 minuten per kant (medium-rare)',
            '4. Bak hart 3-4 minuten per kant',
            '5. Klop eieren los en voeg 10g boter toe',
            '6. Roer eieren zachtjes tot ze net gestold zijn',
            '7. Kruid met zout en voeg honing toe voor smaak',
            '8. Serveer warm met extra boter'
          ],
          nutrition_notes: 'Orgaanvlees bevat vitamine A, B12, foliumzuur en ijzer. Eieren voor choline en eiwit.'
        },
        {
          id: 'monday-carnivor-snack1',
          name: 'Gerookte Zalm met Boter',
          description: 'Vette vis voor omega-3 en dierlijke vetten',
          time: '10:30',
          type: 'snack',
          calories: 280,
          protein: 22,
          carbs: 0,
          fat: 20,
          ingredients: [
            {
              name: 'Gerookte Zalm',
              amount: 120,
              unit: 'g',
              calories_per_100g: 208,
              protein_per_100g: 25,
              carbs_per_100g: 0,
              fat_per_100g: 12
            },
            {
              name: 'Roomboter',
              amount: 15,
              unit: 'g',
              calories_per_100g: 717,
              protein_per_100g: 0.9,
              carbs_per_100g: 0.1,
              fat_per_100g: 81
            },
            {
              name: 'Zout',
              amount: 2,
              unit: 'g',
              calories_per_100g: 0,
              protein_per_100g: 0,
              carbs_per_100g: 0,
              fat_per_100g: 0
            }
          ],
          instructions: [
            '1. Snijd gerookte zalm in hapklare stukken',
            '2. Smelt boter en giet over de zalm',
            '3. Kruid met zout naar smaak',
            '4. Serveer direct'
          ],
          nutrition_notes: 'Zalm bevat omega-3 vetzuren, vitamine D en eiwit. Boter voor verzadigde vetten.'
        },
        {
          id: 'monday-carnivor-lunch',
          name: 'Ribeye Steak met Boter',
          description: 'Vette steak met dierlijke vetten voor optimale energie',
          time: '13:00',
          type: 'lunch',
          calories: 650,
          protein: 45,
          carbs: 0,
          fat: 50,
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
              name: 'Roomboter',
              amount: 30,
              unit: 'g',
              calories_per_100g: 717,
              protein_per_100g: 0.9,
              carbs_per_100g: 0.1,
              fat_per_100g: 81
            },
            {
              name: 'Talow (rundervet)',
              amount: 10,
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
            '1. Verwarm een gietijzeren pan op hoog vuur',
            '2. Voeg talow toe en laat het heet worden',
            '3. Kruid steak royaal met zout',
            '4. Bak steak 3-4 minuten per kant voor medium-rare',
            '5. Laat 5 minuten rusten onder aluminiumfolie',
            '6. Snijd tegen de draad en serveer met gesmolten boter'
          ],
          nutrition_notes: 'Ribeye bevat creatine, carnosine en verzadigde vetten. Boter voor vitamine K2.'
        },
        {
          id: 'monday-carnivor-snack2',
          name: 'Eieren met Spek',
          description: 'Eiwitrijke snack met dierlijke vetten',
          time: '15:30',
          type: 'snack',
          calories: 320,
          protein: 18,
          carbs: 2,
          fat: 25,
          ingredients: [
            {
              name: 'Eieren (2 stuks)',
              amount: 100,
              unit: 'g',
              calories_per_100g: 155,
              protein_per_100g: 12.5,
              carbs_per_100g: 1.1,
              fat_per_100g: 11
            },
            {
              name: 'Spek',
              amount: 40,
              unit: 'g',
              calories_per_100g: 417,
              protein_per_100g: 37,
              carbs_per_100g: 0,
              fat_per_100g: 28
            },
            {
              name: 'Roomboter',
              amount: 10,
              unit: 'g',
              calories_per_100g: 717,
              protein_per_100g: 0.9,
              carbs_per_100g: 0.1,
              fat_per_100g: 81
            }
          ],
          instructions: [
            '1. Bak spek knapperig in een pan',
            '2. Verwijder spek en laat vet in pan',
            '3. Voeg boter toe aan spekvet',
            '4. Breek eieren in de pan',
            '5. Bak eieren in spekvet en boter',
            '6. Serveer met spek'
          ],
          nutrition_notes: 'Eieren bevatten choline en luteïne. Spek voor verzadigde vetten en eiwit.'
        },
        {
          id: 'monday-carnivor-dinner',
          name: 'Lamskotelet met Orgaanvlees',
          description: 'Rijk diner met lamsvlees en extra voedingsstoffen',
          time: '19:00',
          type: 'dinner',
          calories: 580,
          protein: 58,
          carbs: 15,
          fat: 35,
          ingredients: [
            {
              name: 'Lamskotelet',
              amount: 200,
              unit: 'g',
              calories_per_100g: 294,
              protein_per_100g: 25,
              carbs_per_100g: 0,
              fat_per_100g: 21
            },
            {
              name: 'Kippenlever',
              amount: 50,
              unit: 'g',
              calories_per_100g: 167,
              protein_per_100g: 26,
              carbs_per_100g: 0.7,
              fat_per_100g: 6.5
            },
            {
              name: 'Roomboter',
              amount: 20,
              unit: 'g',
              calories_per_100g: 717,
              protein_per_100g: 0.9,
              carbs_per_100g: 0.1,
              fat_per_100g: 81
            },
            {
              name: 'Honing',
              amount: 15,
              unit: 'g',
              calories_per_100g: 304,
              protein_per_100g: 0.3,
              carbs_per_100g: 82,
              fat_per_100g: 0
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
            '2. Kruid lamskotelet met zout',
            '3. Bak lamskotelet 4-5 minuten per kant',
            '4. Bak kippenlever 2-3 minuten per kant',
            '5. Smelt boter en voeg honing toe',
            '6. Giet boter-honing mengsel over vlees',
            '7. Laat vlees 5 minuten rusten'
          ],
          nutrition_notes: 'Lamsvlees bevat CLA en vitamine B12. Lever voor vitamine A en foliumzuur.'
        }
      ],
      nutrition_summary: {
        total_calories: 2350,
        total_protein: 185,
        total_carbs: 25,
        total_fat: 165,
        protein_percentage: 31,
        carbs_percentage: 4,
        fat_percentage: 65,
        key_nutrients: [
          'Vitamine A (lever)',
          'Vitamine B12 (vlees)',
          'Omega-3 (zalm)',
          'Creatine (rundvlees)',
          'Choline (eieren)',
          'CLA (lamsvlees)'
        ]
      },
      shopping_list: [
        { name: 'Runderlever', amount: 100, unit: 'g' },
        { name: 'Runderhart', amount: 50, unit: 'g' },
        { name: 'Eieren', amount: 5, unit: 'stuks' },
        { name: 'Gerookte Zalm', amount: 120, unit: 'g' },
        { name: 'Ribeye Steak', amount: 250, unit: 'g' },
        { name: 'Spek', amount: 40, unit: 'g' },
        { name: 'Lamskotelet', amount: 200, unit: 'g' },
        { name: 'Kippenlever', amount: 50, unit: 'g' },
        { name: 'Roomboter', amount: 100, unit: 'g' },
        { name: 'Talow', amount: 10, unit: 'g' },
        { name: 'Honing', amount: 25, unit: 'g' },
        { name: 'Zout', amount: 17, unit: 'g' }
      ]
    };

    console.log('📋 MONDAY CARNIVOR ANIMAL BASED PLAN:');
    console.log('----------------------------------------');
    console.log(`🌅 08:00 - Orgaanvlees & Eieren Ontbijt (520 cal)`);
    console.log(`☕ 10:30 - Gerookte Zalm met Boter (280 cal)`);
    console.log(`🌞 13:00 - Ribeye Steak met Boter (650 cal)`);
    console.log(`🍳 15:30 - Eieren met Spek (320 cal)`);
    console.log(`🌙 19:00 - Lamskotelet met Orgaanvlees (580 cal)`);
    console.log('');
    console.log('📊 NUTRITION TOTALS:');
    console.log(`   Calories: ${mondayCarnivorPlan.total_calories}`);
    console.log(`   Protein: ${mondayCarnivorPlan.total_protein}g (${mondayCarnivorPlan.nutrition_summary.protein_percentage}%)`);
    console.log(`   Carbs: ${mondayCarnivorPlan.total_carbs}g (${mondayCarnivorPlan.nutrition_summary.carbs_percentage}%)`);
    console.log(`   Fat: ${mondayCarnivorPlan.total_fat}g (${mondayCarnivorPlan.nutrition_summary.fat_percentage}%)`);
    console.log('');
    console.log('🥩 KEY INGREDIENTS:');
    console.log('   • Orgaanvlees (lever, hart) - Voor voedingsstoffen');
    console.log('   • Vette vis (zalm) - Voor omega-3');
    console.log('   • Vette steaks (ribeye) - Voor verzadigde vetten');
    console.log('   • Eieren - Voor choline en eiwit');
    console.log('   • Dierlijke vetten (boter, talow) - Voor energie');
    console.log('   • Honing - Beperkte koolhydraten');
    console.log('');
    console.log('🎯 CARNIVOR ANIMAL BASED COMPLIANT:');
    console.log('   ✅ Alleen dierlijke producten als basis');
    console.log('   ✅ Beperkte koolhydraten (25g)');
    console.log('   ✅ Hoge vetinname (165g)');
    console.log('   ✅ Orgaanvlees voor voedingsstoffen');
    console.log('   ✅ Geen granen, peulvruchten of groenten');
    console.log('   ✅ Honing als enige plantaardige toevoeging');

    // Try to save to database if nutrition_weekplans table exists
    try {
      const { error: insertError } = await supabase
        .from('nutrition_weekplans')
        .upsert({
          plan_id: 'carnivor_animal_based',
          day_of_week: 'monday',
          meal_plan: mondayCarnivorPlan,
          total_calories: mondayCarnivorPlan.total_calories,
          total_protein: mondayCarnivorPlan.total_protein,
          total_carbs: mondayCarnivorPlan.total_carbs,
          total_fat: mondayCarnivorPlan.total_fat
        }, { onConflict: 'plan_id,day_of_week' });

      if (insertError) {
        console.log('ℹ️  Could not save to database (table might not exist)');
      } else {
        console.log('✅ Saved to nutrition_weekplans table');
      }
    } catch (error) {
      console.log('ℹ️  Database save skipped');
    }

    console.log('');
    console.log('🎯 PLAN READY!');
    console.log('----------------------------------------');
    console.log('✅ Complete Monday Carnivor Animal Based meal plan created');
    console.log('✅ All meals follow carnivor principles');
    console.log('✅ Optimal macro distribution for animal-based nutrition');
    console.log('✅ Rich in essential nutrients from organ meats');
    console.log('✅ Ready for implementation');

  } catch (error) {
    console.error('❌ Error creating carnivor Monday plan:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting carnivor Monday plan creation...');
    console.log('');
    
    await createCarnivorMondayPlan();
    
  } catch (error) {
    console.error('❌ Creation failed:', error.message);
  }
}

main();
