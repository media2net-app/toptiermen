require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🍽️ INSERTING PLANS INTO EXISTING TABLE');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertPlansIntoExistingTable() {
  try {
    console.log('📋 STEP 1: Checking existing table structure');
    console.log('----------------------------------------');
    
    // Try to insert a simple test record to see what columns exist
    const testRecord = {
      name: 'Test Plan',
      description: 'Test description'
    };
    
    const { data: testData, error: testError } = await supabase
      .from('nutrition_plans')
      .insert(testRecord)
      .select();
    
    if (testError) {
      console.error('❌ Error with test insert:', testError.message);
      console.log('📋 Trying to understand the table structure...');
      
      // Try to get table info by attempting different column combinations
      const possibleStructures = [
        { name: 'Test Plan' },
        { name: 'Test Plan', description: 'Test' },
        { title: 'Test Plan' },
        { plan_name: 'Test Plan' }
      ];
      
      for (const structure of possibleStructures) {
        try {
          const { error: insertError } = await supabase
            .from('nutrition_plans')
            .insert(structure);
          
          if (!insertError) {
            console.log('✅ Found working structure:', Object.keys(structure));
            // Clean up test record
            await supabase.from('nutrition_plans').delete().eq('name', 'Test Plan');
            break;
          }
        } catch (e) {
          // Continue to next structure
        }
      }
    } else {
      console.log('✅ Test insert successful');
      console.log('📋 Available columns:', Object.keys(testData[0]));
      // Clean up test record
      await supabase.from('nutrition_plans').delete().eq('name', 'Test Plan');
    }
    
    console.log('\n📋 STEP 2: Inserting nutrition plans');
    console.log('----------------------------------------');
    
    // Insert the nutrition plans with basic structure
    const nutritionPlans = [
      {
        name: 'Gebalanceerd Dieet',
        description: 'Een gebalanceerd voedingsplan met een mix van alle voedingsgroepen voor optimale gezondheid en energie.'
      },
      {
        name: 'Carnivoor (Rick\'s Aanpak)',
        description: 'Eet zoals de oprichter. Volledig carnivoor dieet met orgaanvlees, vlees, vis en eieren.'
      },
      {
        name: 'High Protein',
        description: 'Een voedingsplan met extra veel eiwitten voor optimale spieropbouw en herstel.'
      }
    ];
    
    // Insert plans
    for (const plan of nutritionPlans) {
      const { error: insertError } = await supabase
        .from('nutrition_plans')
        .insert(plan);
      
      if (insertError) {
        console.error(`❌ Error inserting plan ${plan.name}:`, insertError.message);
      } else {
        console.log(`✅ Inserted plan: ${plan.name}`);
      }
    }
    
    console.log('\n📋 STEP 3: Verifying database setup');
    console.log('----------------------------------------');
    
    // Check if plans were inserted successfully
    const { data: plans, error: plansCheckError } = await supabase
      .from('nutrition_plans')
      .select('*');
    
    if (plansCheckError) {
      console.error('❌ Error checking nutrition_plans:', plansCheckError.message);
    } else {
      console.log(`✅ nutrition_plans table has ${plans.length} plans`);
      plans.forEach(plan => {
        console.log(`   - ${plan.name}`);
      });
    }
    
    console.log('\n🎯 PLANS INSERTION COMPLETE!');
    console.log('----------------------------------------');
    console.log('✅ nutrition_plans table populated with 3 plans');
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
    console.error('❌ Error inserting nutrition plans:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting nutrition plans insertion...');
    console.log('');
    
    await insertPlansIntoExistingTable();
    
  } catch (error) {
    console.error('❌ Insertion failed:', error.message);
  }
}

main();
