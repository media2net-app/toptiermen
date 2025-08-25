require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCarnivoreMondayToDatabase() {
  try {
    console.log('🥩 Adding carnivore Monday meal plan to database...\n');

    // First, check if nutrition_weekplans table exists
    console.log('🔍 Checking nutrition_weekplans table...');
    const { data: existingPlans, error: checkError } = await supabase
      .from('nutrition_weekplans')
      .select('*')
      .limit(1);

    if (checkError) {
      console.log('⚠️ nutrition_weekplans table may not exist, creating it...');
      
      // Create the table if it doesn't exist
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS nutrition_weekplans (
          id SERIAL PRIMARY KEY,
          plan_id VARCHAR(50) NOT NULL,
          day_of_week VARCHAR(20) NOT NULL,
          meal_plan JSONB NOT NULL,
          total_calories INTEGER,
          total_protein DECIMAL(5,2),
          total_carbs DECIMAL(5,2),
          total_fat DECIMAL(5,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(plan_id, day_of_week)
        );
        
        CREATE INDEX IF NOT EXISTS idx_nutrition_weekplans_plan_day ON nutrition_weekplans(plan_id, day_of_week);
        
        ALTER TABLE nutrition_weekplans ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow authenticated users to read nutrition weekplans" ON nutrition_weekplans
          FOR SELECT USING (auth.role() = 'authenticated');
          
        CREATE POLICY "Allow admins to manage nutrition weekplans" ON nutrition_weekplans
          FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      if (createError) {
        console.log('⚠️ Could not create table via RPC, table may already exist');
      }
    }

    // Monday Carnivore Meal Plan Data
    const mondayCarnivorePlan = {
      plan_id: 'carnivore',
      day_of_week: 'monday',
      total_calories: 2200,
      total_protein: 180,
      total_carbs: 15,
      total_fat: 160,
      meal_plan: {
        day: 'monday',
        diet_type: 'carnivore',
        nutrition_summary: {
          total_calories: 2200,
          total_protein: 180,
          total_carbs: 15,
          total_fat: 160,
          protein_percentage: 33,
          carbs_percentage: 3,
          fat_percentage: 64
        },
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
      }
    };

    // Check if plan already exists
    console.log('🔍 Checking if carnivore Monday plan already exists...');
    const { data: existingPlan, error: existingError } = await supabase
      .from('nutrition_weekplans')
      .select('*')
      .eq('plan_id', 'carnivore')
      .eq('day_of_week', 'monday')
      .single();

    if (existingPlan) {
      console.log('⚠️ Plan already exists, updating...');
      
      const { data: updatedPlan, error: updateError } = await supabase
        .from('nutrition_weekplans')
        .update({
          meal_plan: mondayCarnivorePlan.meal_plan,
          total_calories: mondayCarnivorePlan.total_calories,
          total_protein: mondayCarnivorePlan.total_protein,
          total_carbs: mondayCarnivorePlan.total_carbs,
          total_fat: mondayCarnivorePlan.total_fat,
          updated_at: new Date().toISOString()
        })
        .eq('plan_id', 'carnivore')
        .eq('day_of_week', 'monday')
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating plan:', updateError);
        return;
      }

      console.log('✅ Carnivore Monday plan updated successfully!');
      console.log(`   Plan ID: ${updatedPlan.plan_id}`);
      console.log(`   Day: ${updatedPlan.day_of_week}`);
      console.log(`   Total Calories: ${updatedPlan.total_calories}`);
      console.log(`   Meals: ${updatedPlan.meal_plan.meals.length}`);

    } else {
      console.log('➕ Creating new carnivore Monday plan...');
      
      const { data: newPlan, error: insertError } = await supabase
        .from('nutrition_weekplans')
        .insert(mondayCarnivorePlan)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating plan:', insertError);
        return;
      }

      console.log('✅ Carnivore Monday plan created successfully!');
      console.log(`   Plan ID: ${newPlan.plan_id}`);
      console.log(`   Day: ${newPlan.day_of_week}`);
      console.log(`   Total Calories: ${newPlan.total_calories}`);
      console.log(`   Meals: ${newPlan.meal_plan.meals.length}`);
    }

    // Verify the plan was saved correctly
    console.log('\n🔍 Verifying saved plan...');
    const { data: verifiedPlan, error: verifyError } = await supabase
      .from('nutrition_weekplans')
      .select('*')
      .eq('plan_id', 'carnivore')
      .eq('day_of_week', 'monday')
      .single();

    if (verifyError) {
      console.error('❌ Error verifying plan:', verifyError);
      return;
    }

    console.log('✅ Plan verification successful!');
    console.log(`   Meals in plan: ${verifiedPlan.meal_plan.meals.length}`);
    console.log(`   Breakfast: ${verifiedPlan.meal_plan.meals[0].name}`);
    console.log(`   Lunch: ${verifiedPlan.meal_plan.meals[1].name}`);
    console.log(`   Snack: ${verifiedPlan.meal_plan.meals[2].name}`);
    console.log(`   Dinner: ${verifiedPlan.meal_plan.meals[3].name}`);

    console.log('\n🎉 Carnivore Monday meal plan successfully added to database!');
    console.log('\n📋 Plan Summary:');
    console.log('   • 4 meals (breakfast, lunch, snack, dinner)');
    console.log('   • 2200 total calories');
    console.log('   • 180g protein (33%)');
    console.log('   • 15g carbs (3%)');
    console.log('   • 160g fat (64%)');
    console.log('   • Traditional carnivore foods only');
    console.log('   • Complete with instructions and tips');

  } catch (error) {
    console.error('❌ Error adding carnivore plan to database:', error);
  }
}

addCarnivoreMondayToDatabase();
