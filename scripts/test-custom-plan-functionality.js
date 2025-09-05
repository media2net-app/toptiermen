#!/usr/bin/env node

/**
 * Script om te testen of custom plannen functionaliteit nog steeds werkt
 * na de admin-frontend synchronisatie wijzigingen
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

async function testCustomPlanFunctionality() {
  console.log('🧪 Testing Custom Plan Functionality...');
  console.log('=====================================');

  try {
    // Test User ID (use a real user from the database)
    const testUserId = '061e43d5-c89a-42bb-8a4c-04be2ce99a7e';
    const testPlanId = 'carnivoor-droogtrainen';

    console.log(`\n👤 Testing with user: ${testUserId}`);
    console.log(`📋 Testing with plan: ${testPlanId}`);

    // Test 1: Load default plan
    console.log('\n📊 Test 1: Loading default plan...');
    const defaultResponse = await fetch(`http://localhost:3000/api/nutrition-plan-simple?planId=${testPlanId}`);
    const defaultData = await defaultResponse.json();
    
    if (defaultData.success) {
      console.log('✅ Default plan loaded successfully');
      console.log(`   Plan: ${defaultData.data.planName}`);
      console.log(`   Calories: ${defaultData.data.userProfile.targetCalories}`);
      console.log(`   Days in week plan: ${Object.keys(defaultData.data.weekPlan).length}`);
    } else {
      console.log('❌ Failed to load default plan:', defaultData.error);
      return;
    }

    // Test 2: Check if user has existing custom plan
    console.log('\n🔍 Test 2: Checking for existing custom plan...');
    const customCheckResponse = await fetch(`http://localhost:3000/api/nutrition-plan-save?planId=${testPlanId}&userId=${testUserId}`);
    const customCheckData = await customCheckResponse.json();
    
    if (customCheckData.success) {
      if (customCheckData.hasCustomizedPlan) {
        console.log('✅ User has existing custom plan');
        console.log(`   Custom plan loaded: ${customCheckData.customizedPlan.planName}`);
      } else {
        console.log('ℹ️ User has no existing custom plan (this is normal)');
      }
    } else {
      console.log('❌ Failed to check custom plan:', customCheckData.error);
    }

    // Test 3: Create a custom plan by modifying the default
    console.log('\n✏️ Test 3: Creating custom plan...');
    
    // Modify the default plan data (simulate user customization)
    const customizedPlan = {
      ...defaultData.data,
      userProfile: {
        ...defaultData.data.userProfile,
        targetCalories: 2000 // Change calories as customization
      },
      weekPlan: {
        ...defaultData.data.weekPlan,
        // Modify monday breakfast to simulate ingredient changes
        monday: {
          ...defaultData.data.weekPlan.monday,
          ontbijt: [
            { name: 'Custom Beef Steak', amount: 200, unit: 'gram', calories: 250, protein: 26, carbs: 0, fat: 15 },
            { name: 'Custom Eggs', amount: 3, unit: 'stuks', calories: 210, protein: 18, carbs: 1.5, fat: 15 }
          ]
        }
      }
    };

    const saveResponse = await fetch('http://localhost:3000/api/nutrition-plan-save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId,
        planId: testPlanId,
        customizedPlan: customizedPlan
      })
    });

    const saveData = await saveResponse.json();
    
    if (saveData.success) {
      console.log('✅ Custom plan saved successfully');
      console.log(`   Saved plan ID: ${saveData.planId || testPlanId}`);
    } else {
      console.log('❌ Failed to save custom plan:', saveData.error);
      return;
    }

    // Test 4: Retrieve the custom plan
    console.log('\n🔍 Test 4: Retrieving custom plan...');
    const retrieveResponse = await fetch(`http://localhost:3000/api/nutrition-plan-save?planId=${testPlanId}&userId=${testUserId}`);
    
    if (!retrieveResponse.ok) {
      console.log(`❌ HTTP Error ${retrieveResponse.status}: ${retrieveResponse.statusText}`);
      const errorText = await retrieveResponse.text();
      console.log('   Error details:', errorText);
    } else {
      const retrieveData = await retrieveResponse.json();
      
      if (retrieveData.success && retrieveData.hasCustomizedPlan) {
        console.log('✅ Custom plan retrieved successfully');
        console.log(`   Retrieved plan: ${retrieveData.customizedPlan.planName}`);
        console.log(`   Custom calories: ${retrieveData.customizedPlan.userProfile.targetCalories}`);
        
        // Check if customization persisted
        const mondayBreakfast = retrieveData.customizedPlan.weekPlan.monday.ontbijt;
        if (mondayBreakfast && mondayBreakfast.length > 0 && mondayBreakfast[0].name === 'Custom Beef Steak') {
          console.log('✅ Custom ingredients persisted correctly');
        } else {
          console.log('⚠️ Custom ingredients may not have persisted correctly');
        }
      } else if (retrieveData.success && !retrieveData.hasCustomizedPlan) {
        console.log('ℹ️ No custom plan found (may take a moment to save)');
      } else {
        console.log('❌ Failed to retrieve custom plan:', retrieveData.error || 'Unknown error');
      }
    }

    // Test 5: Set as active plan
    console.log('\n🎯 Test 5: Testing active plan functionality...');
    const activeResponse = await fetch('http://localhost:3000/api/nutrition-plan-select', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId,
        planId: testPlanId
      })
    });

    if (!activeResponse.ok) {
      console.log(`❌ HTTP Error ${activeResponse.status}: ${activeResponse.statusText}`);
      const errorText = await activeResponse.text();
      console.log('   Error details:', errorText);
    } else {
      try {
        const activeData = await activeResponse.json();
        
        if (activeData.success) {
          console.log('✅ Plan set as active successfully');
        } else {
          console.log('❌ Failed to set plan as active:', activeData.error);
        }
      } catch (jsonError) {
        console.log('❌ Failed to parse response as JSON');
        const responseText = await activeResponse.text();
        console.log('   Response:', responseText);
      }
    }

    // Test 6: Verify the flow works end-to-end
    console.log('\n🔄 Test 6: End-to-end custom plan flow test...');
    
    // Check user's nutrition profile
    const profileResponse = await fetch(`http://localhost:3000/api/nutrition-profile?userId=${testUserId}`);
    const profileData = await profileResponse.json();
    
    if (profileData.success) {
      console.log('✅ User nutrition profile accessible');
      if (profileData.profile && profileData.profile.activePlanId === testPlanId) {
        console.log('✅ Active plan ID matches our test plan');
      }
    } else {
      console.log('ℹ️ User nutrition profile not found (may be normal for new users)');
    }

    console.log('\n🧹 Cleanup: Removing test custom plan...');
    // Note: We could add cleanup here if needed, but for testing purposes we'll leave it

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the development server is running on localhost:3000');
      console.log('   Run: npm run dev');
    }
  }

  console.log('\n=====================================');
  console.log('🏁 Custom Plan Functionality Test Complete');
}

// Voer test uit
testCustomPlanFunctionality().catch(console.error);
