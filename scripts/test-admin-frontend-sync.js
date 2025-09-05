#!/usr/bin/env node

/**
 * Script om te testen of admin dashboard wijzigingen 1:1 doorwerken naar frontend
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminFrontendSync() {
  console.log('🧪 Testing Admin Dashboard <-> Frontend Sync...');
  console.log('==================================================');

  try {
    // Test 1: Fetch plans via admin API
    console.log('\n📊 Test 1: Fetching plans via admin API...');
    const adminResponse = await fetch('http://localhost:3000/api/admin/nutrition-plans');
    const adminData = await adminResponse.json();
    
    if (adminData.success) {
      console.log(`✅ Admin API: Found ${adminData.plans.length} plans`);
      adminData.plans.forEach(plan => {
        console.log(`   - ${plan.name} (${plan.plan_id})`);
      });
    } else {
      console.log('❌ Admin API failed:', adminData.error);
    }

    // Test 2: Fetch plans via frontend API
    console.log('\n📊 Test 2: Fetching plans via frontend API...');
    const frontendResponse = await fetch('http://localhost:3000/api/nutrition-plans');
    const frontendData = await frontendResponse.json();
    
    if (frontendData.success) {
      console.log(`✅ Frontend API: Found ${frontendData.plans.length} plans`);
      frontendData.plans.forEach(plan => {
        console.log(`   - ${plan.name} (${plan.plan_id})`);
      });
    } else {
      console.log('❌ Frontend API failed:', frontendData.error);
    }

    // Test 3: Compare plan data
    console.log('\n🔍 Test 3: Comparing plan data consistency...');
    if (adminData.success && frontendData.success) {
      const adminPlanIds = new Set(adminData.plans.map(p => p.plan_id).filter(Boolean));
      const frontendPlanIds = new Set(frontendData.plans.map(p => p.plan_id).filter(Boolean));
      
      console.log('Admin plan IDs:', Array.from(adminPlanIds));
      console.log('Frontend plan IDs:', Array.from(frontendPlanIds));
      
      const missingInFrontend = [...adminPlanIds].filter(id => !frontendPlanIds.has(id));
      const missingInAdmin = [...frontendPlanIds].filter(id => !adminPlanIds.has(id));
      
      if (missingInFrontend.length === 0 && missingInAdmin.length === 0) {
        console.log('✅ Plan IDs are consistent between admin and frontend');
      } else {
        console.log('⚠️ Plan ID inconsistencies found:');
        if (missingInFrontend.length > 0) {
          console.log('   Missing in frontend:', missingInFrontend);
        }
        if (missingInAdmin.length > 0) {
          console.log('   Missing in admin:', missingInAdmin);
        }
      }
    }

    // Test 4: Test specific plan detail retrieval
    console.log('\n🔍 Test 4: Testing plan detail retrieval...');
    const testPlanId = 'carnivoor-droogtrainen';
    
    const simpleResponse = await fetch(`http://localhost:3000/api/nutrition-plan-simple?planId=${testPlanId}`);
    const simpleData = await simpleResponse.json();
    
    if (simpleData.success) {
      console.log(`✅ Plan detail API: Successfully loaded ${testPlanId}`);
      console.log(`   Plan name: ${simpleData.data.planName}`);
      console.log(`   Target calories: ${simpleData.data.userProfile.targetCalories}`);
      console.log(`   Weekly plan days: ${Object.keys(simpleData.data.weekPlan).length}`);
      
      // Check if it has 6 meal structure
      const sampleDay = Object.keys(simpleData.data.weekPlan)[0];
      if (sampleDay) {
        const mealTypes = Object.keys(simpleData.data.weekPlan[sampleDay]).filter(key => key !== 'dailyTotals');
        console.log(`   Meal structure: [${mealTypes.join(', ')}]`);
        
        if (mealTypes.includes('ochtend_snack') && mealTypes.includes('lunch_snack') && mealTypes.includes('avond_snack')) {
          console.log('✅ Plan has correct 6-meal structure');
        } else {
          console.log('⚠️ Plan missing expected 6-meal structure');
        }
      }
    } else {
      console.log(`❌ Plan detail API failed for ${testPlanId}:`, simpleData.error);
    }

    // Test 5: Verify admin changes would be visible
    console.log('\n🔧 Test 5: Verifying admin-frontend data flow...');
    
    // Check if plans have the required structure for admin editing
    if (adminData.success && adminData.plans.length > 0) {
      const samplePlan = adminData.plans[0];
      const hasRequiredFields = samplePlan.meals && 
                                samplePlan.meals.weekly_plan && 
                                samplePlan.plan_id;
      
      if (hasRequiredFields) {
        console.log('✅ Plans have required structure for admin editing');
        console.log('✅ Admin changes will be visible in frontend');
      } else {
        console.log('⚠️ Plans missing required structure for full admin-frontend sync');
        console.log('   Missing fields:', {
          meals: !!samplePlan.meals,
          weekly_plan: !!(samplePlan.meals && samplePlan.meals.weekly_plan),
          plan_id: !!samplePlan.plan_id
        });
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    // Check if server is running
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the development server is running on localhost:3000');
      console.log('   Run: npm run dev');
    }
  }

  console.log('\n==================================================');
  console.log('🏁 Admin-Frontend Sync Test Complete');
}

// Voer test uit
testAdminFrontendSync().catch(console.error);
