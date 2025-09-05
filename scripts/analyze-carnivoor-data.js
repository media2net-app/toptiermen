#!/usr/bin/env node

/**
 * Script om carnivoor-droogtrainen data te analyseren tussen admin en frontend
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

async function analyzeCarnivoorData() {
  console.log('🔍 Analyzing Carnivoor-Droogtrainen Data...');
  console.log('=============================================');

  const planId = 'carnivoor-droogtrainen';

  try {
    // 1. Direct database query
    console.log('\n📊 1. Direct Database Query:');
    const { data: dbPlan, error: dbError } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('plan_id', planId)
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return;
    }

    console.log('✅ Database plan found:');
    console.log(`   Name: ${dbPlan.name}`);
    console.log(`   Plan ID: ${dbPlan.plan_id}`);
    console.log(`   Has meals data: ${!!dbPlan.meals}`);
    
    if (dbPlan.meals) {
      console.log(`   Target calories: ${dbPlan.meals.target_calories}`);
      console.log(`   Has weekly_plan: ${!!dbPlan.meals.weekly_plan}`);
      
      if (dbPlan.meals.weekly_plan) {
        const days = Object.keys(dbPlan.meals.weekly_plan);
        console.log(`   Weekly plan days: ${days.length} [${days.join(', ')}]`);
        
        // Analyze Monday structure
        const monday = dbPlan.meals.weekly_plan.monday;
        if (monday) {
          const mealTypes = Object.keys(monday).filter(key => key !== 'dailyTotals');
          console.log(`   Monday meal types: [${mealTypes.join(', ')}]`);
          
          // Show monday breakfast details
          if (monday.ontbijt && Array.isArray(monday.ontbijt)) {
            console.log(`   Monday ontbijt ingredients: ${monday.ontbijt.length}`);
            monday.ontbijt.forEach((ingredient, index) => {
              console.log(`     ${index + 1}. ${ingredient.name} - ${ingredient.amount}${ingredient.unit}`);
            });
          }
          
          // Show daily totals
          if (monday.dailyTotals) {
            console.log(`   Monday totals: ${monday.dailyTotals.calories} kcal, ${monday.dailyTotals.protein}g protein`);
          }
        }
      }
    }

    // 2. Admin API call
    console.log('\n📊 2. Admin API Response:');
    const adminResponse = await fetch('http://localhost:3000/api/admin/nutrition-plans');
    const adminData = await adminResponse.json();
    
    if (adminData.success) {
      const adminPlan = adminData.plans.find(p => p.plan_id === planId);
      if (adminPlan) {
        console.log('✅ Admin API plan found:');
        console.log(`   Name: ${adminPlan.name}`);
        console.log(`   Plan ID: ${adminPlan.plan_id}`);
        console.log(`   Has meals data: ${!!adminPlan.meals}`);
        
        if (adminPlan.meals && adminPlan.meals.weekly_plan) {
          const days = Object.keys(adminPlan.meals.weekly_plan);
          console.log(`   Weekly plan days: ${days.length}`);
          
          const monday = adminPlan.meals.weekly_plan.monday;
          if (monday && monday.ontbijt) {
            console.log(`   Monday ontbijt ingredients: ${monday.ontbijt.length}`);
          }
        }
      } else {
        console.log('❌ Plan not found in admin API');
      }
    }

    // 3. Frontend API call
    console.log('\n📊 3. Frontend API Response:');
    const frontendResponse = await fetch('http://localhost:3000/api/nutrition-plans');
    const frontendData = await frontendResponse.json();
    
    if (frontendData.success) {
      const frontendPlan = frontendData.plans.find(p => p.plan_id === planId);
      if (frontendPlan) {
        console.log('✅ Frontend API plan found:');
        console.log(`   Name: ${frontendPlan.name}`);
        console.log(`   Plan ID: ${frontendPlan.plan_id}`);
        console.log(`   Target calories: ${frontendPlan.target_calories}`);
        console.log(`   Goal: ${frontendPlan.goal}`);
        console.log(`   Has meals data: ${!!frontendPlan.meals}`);
      } else {
        console.log('❌ Plan not found in frontend API');
      }
    }

    // 4. Simple plan API call (what frontend uses for details)
    console.log('\n📊 4. Simple Plan API Response (Frontend Detail View):');
    const simpleResponse = await fetch(`http://localhost:3000/api/nutrition-plan-simple?planId=${planId}`);
    const simpleData = await simpleResponse.json();
    
    if (simpleData.success) {
      console.log('✅ Simple plan API found:');
      console.log(`   Plan name: ${simpleData.data.planName}`);
      console.log(`   Plan ID: ${simpleData.data.planId}`);
      console.log(`   Target calories: ${simpleData.data.userProfile.targetCalories}`);
      console.log(`   Weekly plan days: ${Object.keys(simpleData.data.weekPlan).length}`);
      
      // Analyze Monday structure from simple API
      const monday = simpleData.data.weekPlan.monday;
      if (monday) {
        const mealTypes = Object.keys(monday).filter(key => key !== 'dailyTotals');
        console.log(`   Monday meal types: [${mealTypes.join(', ')}]`);
        
        if (monday.ontbijt && Array.isArray(monday.ontbijt)) {
          console.log(`   Monday ontbijt ingredients: ${monday.ontbijt.length}`);
          monday.ontbijt.forEach((ingredient, index) => {
            console.log(`     ${index + 1}. ${ingredient.name} - ${ingredient.amount}${ingredient.unit} (${ingredient.calories || 0} kcal)`);
          });
        }
        
        if (monday.dailyTotals) {
          console.log(`   Monday totals: ${monday.dailyTotals.calories} kcal, ${monday.dailyTotals.protein}g protein`);
        }
      }
    } else {
      console.log('❌ Simple plan API failed:', simpleData.error);
    }

    // 5. Compare data structures
    console.log('\n🔍 5. Data Structure Comparison:');
    
    if (dbPlan.meals && dbPlan.meals.weekly_plan && simpleData.success) {
      const dbMonday = dbPlan.meals.weekly_plan.monday;
      const simpleMonday = simpleData.data.weekPlan.monday;
      
      console.log('Database vs Simple API Monday:');
      if (dbMonday && simpleMonday) {
        console.log(`   DB ontbijt count: ${dbMonday.ontbijt ? dbMonday.ontbijt.length : 0}`);
        console.log(`   Simple ontbijt count: ${simpleMonday.ontbijt ? simpleMonday.ontbijt.length : 0}`);
        
        // Compare first ingredient if exists
        if (dbMonday.ontbijt && dbMonday.ontbijt[0] && simpleMonday.ontbijt && simpleMonday.ontbijt[0]) {
          console.log(`   DB first ingredient: ${dbMonday.ontbijt[0].name}`);
          console.log(`   Simple first ingredient: ${simpleMonday.ontbijt[0].name}`);
          
          if (dbMonday.ontbijt[0].name !== simpleMonday.ontbijt[0].name) {
            console.log('⚠️ INCONSISTENCY: First ingredients do not match!');
          } else {
            console.log('✅ First ingredients match');
          }
        }
        
        // Compare daily totals
        const dbTotals = dbMonday.dailyTotals;
        const simpleTotals = simpleMonday.dailyTotals;
        
        if (dbTotals && simpleTotals) {
          console.log(`   DB daily calories: ${dbTotals.calories}`);
          console.log(`   Simple daily calories: ${simpleTotals.calories}`);
          
          if (Math.abs(dbTotals.calories - simpleTotals.calories) > 10) {
            console.log('⚠️ INCONSISTENCY: Daily calories differ significantly!');
          } else {
            console.log('✅ Daily calories are consistent');
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the development server is running on localhost:3000');
      console.log('   Run: npm run dev');
    }
  }

  console.log('\n=============================================');
  console.log('🏁 Carnivoor Data Analysis Complete');
}

// Voer analyse uit
analyzeCarnivoorData().catch(console.error);
