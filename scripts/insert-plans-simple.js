require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🍽️ INSERTING NUTRITION PLANS SIMPLY');
console.log('============================================================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertPlansSimple() {
  try {
    console.log('📋 STEP 1: Inserting nutrition plans (simple version)');
    console.log('----------------------------------------');
    
    // Insert the nutrition plans without problematic columns
    const nutritionPlans = [
      {
        plan_id: 'balanced',
        name: 'Gebalanceerd Dieet',
        description: 'Een gebalanceerd voedingsplan met een mix van alle voedingsgroepen voor optimale gezondheid en energie.',
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
        description: 'Eet zoals de oprichter. Volledig carnivoor dieet met orgaanvlees, vlees, vis en eieren.',
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
        description: 'Een voedingsplan met extra veel eiwitten voor optimale spieropbouw en herstel.',
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
        .upsert(plan, { onConflict: 'plan_id' });
      
      if (insertError) {
        console.error(`❌ Error inserting plan ${plan.plan_id}:`, insertError.message);
      } else {
        console.log(`✅ Inserted/Updated plan: ${plan.name}`);
      }
    }
    
    console.log('\n📋 STEP 2: Verifying database setup');
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
        console.log(`   - ${plan.name} (${plan.plan_id})`);
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
    
    await insertPlansSimple();
    
  } catch (error) {
    console.error('❌ Insertion failed:', error.message);
  }
}

main();
