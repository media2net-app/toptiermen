require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🍽️ RECREATING NUTRITION TABLES');
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
    
    // Insert nutrition plans
    const nutritionPlans = [
      {
        plan_id: 'balanced',
        name: 'Gebalanceerd Dieet',
        subtitle: 'Voor optimale gezondheid en energie',
        description: 'Een gebalanceerd dieet met alle macronutriënten voor duurzame energie en algehele gezondheid.',
        icon: '🥗',
        color: 'from-green-500 to-emerald-600',
        meals: []
      },
      {
        plan_id: 'carnivore',
        name: 'Carnivoor (Rick\'s Aanpak)',
        subtitle: 'Voor maximale eenvoud en het elimineren van potentiële triggers',
        description: 'Eet zoals de oprichter - eenvoudig en effectief voor maximale resultaten.',
        icon: '🥩',
        color: 'from-red-500 to-orange-600',
        meals: []
      },
      {
        plan_id: 'high_protein',
        name: 'High Protein',
        subtitle: 'Voor spieropbouw en herstel',
        description: 'Hoog in eiwitten voor optimale spieropbouw en herstel na training.',
        icon: '💪',
        color: 'from-blue-500 to-cyan-600',
        meals: []
      }
    ];
    
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
    
    console.log('\n📋 STEP 6: Inserting sample meals');
    console.log('----------------------------------------');
    
    // Insert sample meals
    const sampleMeals = [
      {
        name: 'Carnivoor Ontbijt',
        description: 'Eenvoudig en effectief ontbijt voor carnivoor dieet',
        meal_type: 'ontbijt',
        category: 'carnivoor',
        plan_type: 'carnivore',
        goal: 'vetverbranding',
        ingredients: ['eieren', 'spek', 'boter'],
        instructions: ['Bak de eieren in boter', 'Bak de spek knapperig', 'Serveer samen'],
        nutrition_info: { calories: 450, protein: 35, carbs: 2, fat: 32 },
        prep_time: 15,
        difficulty: 'makkelijk',
        is_featured: true
      },
      {
        name: 'Gebalanceerde Lunch',
        description: 'Gezonde lunch met alle macronutriënten',
        meal_type: 'lunch',
        category: 'flexibel',
        plan_type: 'balanced',
        goal: 'energie',
        ingredients: ['kipfilet', 'rijst', 'groenten'],
        instructions: ['Grill de kipfilet', 'Kook de rijst', 'Bak de groenten'],
        nutrition_info: { calories: 550, protein: 45, carbs: 45, fat: 15 },
        prep_time: 25,
        difficulty: 'gemiddeld',
        is_featured: true
      }
    ];
    
    for (const meal of sampleMeals) {
      const { error: insertError } = await supabase
        .from('meals')
        .insert(meal);
      
      if (insertError) {
        console.error(`❌ Error inserting meal ${meal.name}:`, insertError.message);
      } else {
        console.log(`✅ Inserted meal: ${meal.name}`);
      }
    }
    
    console.log('\n📋 STEP 7: Verifying database setup');
    console.log('----------------------------------------');
    
    // Check nutrition_plans
    const { data: plans, error: plansCheckError } = await supabase
      .from('nutrition_plans')
      .select('*');
    
    if (plansCheckError) {
      console.error('❌ Error checking nutrition_plans:', plansCheckError.message);
    } else {
      console.log(`✅ nutrition_plans table has ${plans.length} plans`);
    }
    
    // Check meals
    const { data: meals, error: mealsCheckError } = await supabase
      .from('meals')
      .select('*');
    
    if (mealsCheckError) {
      console.error('❌ Error checking meals:', mealsCheckError.message);
    } else {
      console.log(`✅ meals table has ${meals.length} meals`);
    }
    
    console.log('\n🎯 DATABASE RECREATION COMPLETE!');
    console.log('============================================================');
    console.log('✅ nutrition_plans table recreated and populated');
    console.log('✅ nutrition_weekplans table recreated');
    console.log('✅ meals table recreated and populated');
    
    console.log('\n📋 Available plans:');
    if (plans) {
      plans.forEach(plan => {
        console.log(`   - ${plan.name} (${plan.plan_id})`);
      });
    }
    
    console.log('\n📋 Available meals:');
    if (meals) {
      meals.forEach(meal => {
        console.log(`   - ${meal.name} (${meal.meal_type})`);
      });
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. Refresh the admin dashboard');
    console.log('2. Check if plans and meals are now visible');
    console.log('3. Test the frontend integration');
    
  } catch (error) {
    console.error('❌ Database recreation failed:', error.message);
  }
}

recreateNutritionTables();
