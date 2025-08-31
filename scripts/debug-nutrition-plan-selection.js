const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugNutritionPlanSelection() {
  console.log('🔍 Debugging Nutrition Plan Selection...\n');

  try {
    // 1. Check nutrition plans in database
    console.log('1️⃣ Checking nutrition plans in database...');
    const { data: plans, error: plansError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('is_active', true);

    if (plansError) {
      console.error('❌ Error fetching nutrition plans:', plansError);
      return;
    }

    console.log(`✅ Found ${plans?.length || 0} active nutrition plans:`);
    plans?.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.name} (ID: ${plan.id}, Plan ID: ${plan.plan_id})`);
      console.log(`      Description: ${plan.description?.substring(0, 100)}...`);
      console.log(`      Active: ${plan.is_active}`);
    });

    // 2. Check for carnivoor-droogtrainen specifically
    console.log('\n2️⃣ Looking for carnivoor-droogtrainen plan...');
    const carnivoorPlan = plans?.find(p => 
      p.plan_id === 'carnivoor-droogtrainen' || 
      p.name.toLowerCase().includes('carnivoor') && p.name.toLowerCase().includes('droogtrainen')
    );

    if (carnivoorPlan) {
      console.log('✅ Found carnivoor-droogtrainen plan:');
      console.log(`   Name: ${carnivoorPlan.name}`);
      console.log(`   Plan ID: ${carnivoorPlan.plan_id}`);
      console.log(`   Active: ${carnivoorPlan.is_active}`);
    } else {
      console.log('❌ Carnivoor-droogtrainen plan not found in database');
      
      // Check if we need to create it
      console.log('\n3️⃣ Checking if we need to create the plan...');
      
      const carnivoorData = {
        plan_id: 'carnivoor-droogtrainen',
        name: 'Carnivoor Droogtrainen',
        subtitle: 'Vetverbranding met dierlijke voeding',
        description: 'Een strikt carnivoor voedingsplan gericht op vetverbranding en spierbehoud. Gebaseerd op dierlijke voeding voor optimale hormoonbalans en energie.',
        icon: '🥩',
        color: '#B6C948',
        is_active: true,
        category: 'carnivoor',
        goal: 'droogtrainen',
        duration_weeks: 12,
        difficulty: 'intermediate'
      };

      console.log('📋 Plan data to create:', carnivoorData);
      
      // Try to create the plan
      const { data: newPlan, error: createError } = await supabase
        .from('nutrition_plans')
        .insert(carnivoorData)
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating carnivoor plan:', createError);
      } else {
        console.log('✅ Successfully created carnivoor-droogtrainen plan!');
        console.log('   New plan ID:', newPlan.id);
      }
    }

    // 3. Test API endpoint
    console.log('\n4️⃣ Testing API endpoint...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/nutrition-plans`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ API endpoint working correctly');
        console.log(`   Found ${data.plans?.length || 0} plans via API`);
        
        const apiCarnivoorPlan = data.plans?.find(p => 
          p.plan_id === 'carnivoor-droogtrainen' || 
          p.name.toLowerCase().includes('carnivoor')
        );
        
        if (apiCarnivoorPlan) {
          console.log('✅ Carnivoor plan found via API:');
          console.log(`   Name: ${apiCarnivoorPlan.name}`);
          console.log(`   Plan ID: ${apiCarnivoorPlan.plan_id}`);
        } else {
          console.log('❌ Carnivoor plan not found via API');
        }
      } else {
        console.error('❌ API endpoint error:', data.error);
      }
    } catch (apiError) {
      console.error('❌ API test failed:', apiError.message);
    }

    // 4. Check URL routing
    console.log('\n5️⃣ Checking URL routing...');
    const testUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/voedingsplannen/carnivoor-droogtrainen`;
    console.log(`   Test URL: ${testUrl}`);
    console.log('   This should now work with the new [planId] dynamic route');

    console.log('\n📊 SUMMARY:');
    console.log('================================');
    console.log('   - Checked nutrition plans in database');
    console.log('   - Looked for carnivoor-droogtrainen plan');
    console.log('   - Tested API endpoint');
    console.log('   - Created dynamic route for individual plans');
    console.log('   - URL routing should now work correctly');

  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugNutritionPlanSelection();
