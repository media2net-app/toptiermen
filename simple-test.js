// Simple test to debug the optimization
const testSimple = async () => {
  try {
    console.log('🧪 Testing simple optimization...');
    
    const response = await fetch('http://localhost:3000/api/nutrition-plan-optimize-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: 'voedingsplan-droogtrainen',
        userId: 'chiel@media2net.nl'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Optimization successful!');
      console.log('📊 Base plan calories:', data.data.scaleFactor);
      console.log('📊 Original totals:', data.data.originalTotals);
      console.log('📊 Optimized totals:', data.data.optimizedTotals);
      console.log('📊 Target totals:', data.data.targetTotals);
      console.log('📊 Overages:', data.data.overages);
      console.log('📊 Optimizations count:', data.data.optimizations.length);
      console.log('\n✂️ OPTIMIZATIONS:');
      data.data.optimizations.forEach(opt => {
        console.log(`${opt.day} ${opt.mealType}: ${opt.ingredient} ${opt.originalAmount} → ${opt.optimizedAmount} (${opt.reduction} ${opt.unit} less)`);
      });
      
      console.log('\n🎯 ACCURACY:');
      console.log(`Calories: ${data.data.accuracy.calories}%`);
      console.log(`Protein: ${data.data.accuracy.protein}%`);
      console.log(`Carbs: ${data.data.accuracy.carbs}%`);
      console.log(`Fat: ${data.data.accuracy.fat}%`);
      
      console.log('\n🔍 DEBUG INFORMATION:');
      console.log('📊 Base Plan Calories:', data.data.debug.basePlanCalories);
      console.log('👤 Profile:', data.data.debug.profile);
      
      console.log('\n📋 REDUCIBLE INGREDIENTS:');
      data.data.debug.reducibleIngredients.forEach((ingredient, index) => {
        console.log(`${index + 1}. ${ingredient.day} ${ingredient.mealType}: ${ingredient.ingredient}`);
        console.log(`   Unit: ${ingredient.unit}, Current: ${ingredient.currentAmount}, Min: ${ingredient.minAmount}, Reduction Potential: ${ingredient.reductionPotential}`);
        console.log(`   Nutrition: ${ingredient.nutrition.calories} kcal, ${ingredient.nutrition.protein}g protein, ${ingredient.nutrition.carbs}g carbs, ${ingredient.nutrition.fat}g fat`);
        console.log(`   Calories per unit: ${ingredient.caloriesPerUnit}`);
        console.log('');
      });
      
      console.log('\n⚙️ OPTIMIZATION STEPS:');
      data.data.debug.optimizationSteps.forEach(step => {
        console.log(`Step ${step.step}: ${step.day} ${step.mealType} - ${step.ingredient}`);
        console.log(`   Amount: ${step.originalAmount} → ${step.optimizedAmount} (${step.reduction} ${step.unit} less)`);
        console.log(`   Original: ${step.originalNutrition.calories} kcal, ${step.originalNutrition.protein}g protein, ${step.originalNutrition.carbs}g carbs, ${step.originalNutrition.fat}g fat`);
        console.log(`   Optimized: ${step.optimizedNutrition.calories} kcal, ${step.optimizedNutrition.protein}g protein, ${step.optimizedNutrition.carbs}g carbs, ${step.optimizedNutrition.fat}g fat`);
        console.log(`   Impact: ${step.impact}`);
        console.log('');
      });
      
      console.log('\n📊 INGREDIENT STATISTICS:');
      console.log(`Total ingredients: ${data.data.debug.ingredientDetails.totalIngredients}`);
      console.log(`Reducible ingredients: ${data.data.debug.ingredientDetails.reducibleIngredients}`);
      console.log(`Optimized ingredients: ${data.data.debug.ingredientDetails.optimizedIngredients}`);
      
      console.log('\n📊 BY UNIT TYPE:');
      Object.entries(data.data.debug.ingredientDetails.byUnitType).forEach(([unit, stats]) => {
        console.log(`${unit}: ${stats.total} total, ${stats.reducible} reducible, ${stats.optimized} optimized`);
      });
      
      console.log('\n📊 BY MEAL TYPE:');
      Object.entries(data.data.debug.ingredientDetails.byMealType).forEach(([meal, stats]) => {
        console.log(`${meal}: ${stats.total} total, ${stats.reducible} reducible, ${stats.optimized} optimized`);
      });
    } else {
      console.error('❌ Optimization failed:', data.error);
      if (data.debug) {
        console.log('🔍 Debug info:', data.debug);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing optimization:', error);
  }
};

// Run the test
testSimple();
