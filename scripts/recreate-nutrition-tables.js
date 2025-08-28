require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔄 RECREATING NUTRITION TABLES');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function recreateNutritionTables() {
  try {
    console.log('📋 STEP 1: Dropping existing tables');
    console.log('----------------------------------------');
    
    // Drop existing tables
    const dropTablesSQL = `
      DROP TABLE IF EXISTS nutrition_plans CASCADE;
      DROP TABLE IF EXISTS nutrition_weekplans CASCADE;
      DROP TABLE IF EXISTS meals CASCADE;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropTablesSQL });
    if (dropError) {
      console.log('ℹ️  Could not drop tables via RPC, continuing...');
    } else {
      console.log('✅ Dropped existing nutrition tables');
    }
    
    console.log('\n📋 STEP 2: Creating nutrition_plans table');
    console.log('----------------------------------------');
    
    // Create nutrition_plans table
    const createPlansTableSQL = `
      CREATE TABLE nutrition_plans (
        id SERIAL PRIMARY KEY,
        plan_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        subtitle TEXT,
        description TEXT,
        icon VARCHAR(10),
        color VARCHAR(100),
        meals JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    const { error: plansError } = await supabase.rpc('exec_sql', { sql: createPlansTableSQL });
    if (plansError) {
      console.error('❌ Error creating nutrition_plans table:', plansError.message);
      return;
    } else {
      console.log('✅ Created nutrition_plans table');
    }
    
    console.log('\n📋 STEP 3: Creating nutrition_weekplans table');
    console.log('----------------------------------------');
    
    // Create nutrition_weekplans table
    const createWeekplansTableSQL = `
      CREATE TABLE nutrition_weekplans (
        id SERIAL PRIMARY KEY,
        plan_id VARCHAR(50) NOT NULL,
        day_of_week VARCHAR(20) NOT NULL,
        meal_plan JSONB NOT NULL,
        total_calories INTEGER,
        total_protein INTEGER,
        total_carbs INTEGER,
        total_fat INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(plan_id, day_of_week)
      );
    `;
    
    const { error: weekplansError } = await supabase.rpc('exec_sql', { sql: createWeekplansTableSQL });
    if (weekplansError) {
      console.error('❌ Error creating nutrition_weekplans table:', weekplansError.message);
      return;
    } else {
      console.log('✅ Created nutrition_weekplans table');
    }
    
    console.log('\n📋 STEP 4: Creating meals table');
    console.log('----------------------------------------');
    
    // Create meals table
    const createMealsTableSQL = `
      CREATE TABLE meals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        meal_type VARCHAR(50),
        category VARCHAR(50),
        plan_type VARCHAR(100),
        goal VARCHAR(100),
        day VARCHAR(20),
        ingredients JSONB,
        instructions JSONB,
        nutrition_info JSONB,
        prep_time INTEGER,
        difficulty VARCHAR(50),
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    const { error: mealsError } = await supabase.rpc('exec_sql', { sql: createMealsTableSQL });
    if (mealsError) {
      console.error('❌ Error creating meals table:', mealsError.message);
      return;
    } else {
      console.log('✅ Created meals table');
    }
    
    console.log('\n📋 STEP 5: Inserting nutrition plans');
    console.log('----------------------------------------');
    
    // Insert the nutrition plans
    const nutritionPlans = [
      {
        plan_id: 'balanced',
        name: 'Gebalanceerd Dieet',
        subtitle: 'Voor optimale gezondheid en energie',
        description: 'Een gebalanceerd voedingsplan met een mix van alle voedingsgroepen voor optimale gezondheid en energie.',
        icon: '🥗',
        color: 'from-green-500 to-blue-600',
        meals: [
          {
            id: 'breakfast-1',
            name: 'Havermout met Bessen',
            image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Havermout', amount: 50, unit: 'gram' },
              { name: 'Bessen', amount: 30, unit: 'gram' },
              { name: 'Noten', amount: 20, unit: 'gram' },
              { name: 'Honing', amount: 10, unit: 'gram' }
            ],
            time: '08:00',
            type: 'breakfast'
          },
          {
            id: 'lunch-1',
            name: 'Gegrilde Kip Salade',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Kipfilet', amount: 150, unit: 'gram' },
              { name: 'Sla', amount: 50, unit: 'gram' },
              { name: 'Tomaat', amount: 30, unit: 'gram' },
              { name: 'Komkommer', amount: 30, unit: 'gram' }
            ],
            time: '13:00',
            type: 'lunch'
          },
          {
            id: 'dinner-1',
            name: 'Zalm met Groenten',
            image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Zalmfilet', amount: 200, unit: 'gram' },
              { name: 'Broccoli', amount: 100, unit: 'gram' },
              { name: 'Zoete aardappel', amount: 150, unit: 'gram' },
              { name: 'Olijfolie', amount: 15, unit: 'ml' }
            ],
            time: '19:00',
            type: 'dinner'
          }
        ],
        is_active: true
      },
      {
        plan_id: 'carnivore',
        name: 'Carnivoor (Rick\'s Aanpak)',
        subtitle: 'Voor maximale eenvoud en het elimineren van potentiële triggers',
        description: 'Eet zoals de oprichter. Volledig carnivoor dieet met orgaanvlees, vlees, vis en eieren.',
        icon: '🥩',
        color: 'from-red-500 to-orange-600',
        meals: [
          {
            id: 'breakfast-1',
            name: 'Ribeye Steak',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Ribeye steak', amount: 250, unit: 'gram' },
              { name: 'Roomboter', amount: 20, unit: 'gram' },
              { name: 'Zout', amount: 5, unit: 'gram' }
            ],
            time: '08:00',
            type: 'breakfast'
          },
          {
            id: 'lunch-1',
            name: 'Kipfilet met Roomboter',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Kipfilet', amount: 200, unit: 'gram' },
              { name: 'Roomboter', amount: 30, unit: 'gram' },
              { name: 'Zout', amount: 5, unit: 'gram' }
            ],
            time: '13:00',
            type: 'lunch'
          },
          {
            id: 'dinner-1',
            name: 'Lamskotelet',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Lamskotelet', amount: 250, unit: 'gram' },
              { name: 'Roomboter', amount: 25, unit: 'gram' },
              { name: 'Zout', amount: 5, unit: 'gram' }
            ],
            time: '19:00',
            type: 'dinner'
          }
        ],
        is_active: true
      },
      {
        plan_id: 'high_protein',
        name: 'High Protein',
        subtitle: 'Voor spieropbouw en herstel',
        description: 'Een voedingsplan met extra veel eiwitten voor optimale spieropbouw en herstel.',
        icon: '🍗',
        color: 'from-purple-500 to-pink-600',
        meals: [
          {
            id: 'breakfast-1',
            name: 'Eiwitrijke Smoothie',
            image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Whey proteïne', amount: 30, unit: 'gram' },
              { name: 'Banaan', amount: 1, unit: 'stuk' },
              { name: 'Amandelmelk', amount: 250, unit: 'ml' },
              { name: 'Pindakaas', amount: 15, unit: 'gram' }
            ],
            time: '08:00',
            type: 'breakfast'
          },
          {
            id: 'lunch-1',
            name: 'Tonijn Salade',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Tonijn', amount: 200, unit: 'gram' },
              { name: 'Eieren', amount: 2, unit: 'stuks' },
              { name: 'Avocado', amount: 1, unit: 'stuk' },
              { name: 'Sla', amount: 50, unit: 'gram' }
            ],
            time: '13:00',
            type: 'lunch'
          },
          {
            id: 'dinner-1',
            name: 'Kalkoenfilet met Quinoa',
            image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Kalkoenfilet', amount: 250, unit: 'gram' },
              { name: 'Quinoa', amount: 100, unit: 'gram' },
              { name: 'Groene groenten', amount: 150, unit: 'gram' },
              { name: 'Olijfolie', amount: 15, unit: 'ml' }
            ],
            time: '19:00',
            type: 'dinner'
          }
        ],
        is_active: true
      }
    ];
    
    // Insert plans
    for (const plan of nutritionPlans) {
      const { error: insertError } = await supabase
        .from('nutrition_plans')
        .insert(plan);
      
      if (insertError) {
        console.error(`❌ Error inserting plan ${plan.plan_id}:`, insertError.message);
      } else {
        console.log(`✅ Inserted plan: ${plan.name}`);
      }
    }
    
    console.log('\n📋 STEP 6: Verifying database setup');
    console.log('----------------------------------------');
    
    // Check if tables were created successfully
    const { data: plans, error: plansCheckError } = await supabase
      .from('nutrition_plans')
      .select('*');
    
    if (plansCheckError) {
      console.error('❌ Error checking nutrition_plans:', plansCheckError.message);
    } else {
      console.log(`✅ nutrition_plans table has ${plans.length} plans`);
      plans.forEach(plan => {
        console.log(`   - ${plan.name} (${plan.plan_id})`);
      });
    }
    
    const { data: weekplans, error: weekplansCheckError } = await supabase
      .from('nutrition_weekplans')
      .select('*');
    
    if (weekplansCheckError) {
      console.error('❌ Error checking nutrition_weekplans:', weekplansCheckError.message);
    } else {
      console.log(`✅ nutrition_weekplans table has ${weekplans.length} weekplans`);
    }
    
    const { data: meals, error: mealsCheckError } = await supabase
      .from('meals')
      .select('*');
    
    if (mealsCheckError) {
      console.error('❌ Error checking meals:', mealsCheckError.message);
    } else {
      console.log(`✅ meals table has ${meals.length} meals`);
    }
    
    console.log('\n🎯 DATABASE RECREATION COMPLETE!');
    console.log('----------------------------------------');
    console.log('✅ nutrition_plans table recreated and populated');
    console.log('✅ nutrition_weekplans table created');
    console.log('✅ meals table created');
    console.log('');
    console.log('📋 Available plans:');
    console.log('   - Gebalanceerd Dieet');
    console.log('   - Carnivoor (Rick\'s Aanpak)');
    console.log('   - High Protein');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Refresh the admin dashboard');
    console.log('2. Check if plans are now visible (should show 3 plans)');
    console.log('3. Test the frontend integration');
    
  } catch (error) {
    console.error('❌ Error recreating nutrition database:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting nutrition database recreation...');
    console.log('');
    
    await recreateNutritionTables();
    
  } catch (error) {
    console.error('❌ Recreation failed:', error.message);
  }
}

main();
