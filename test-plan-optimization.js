// Test script for nutrition plan optimization
const testOptimization = async () => {
  try {
    console.log('🧪 Testing nutrition plan optimization...');
    
    const response = await fetch('http://localhost:3000/api/nutrition-plan-optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: 'voedingsplan-droogtrainen',
        userId: '061e43d5-c89a-42bb-8a4c-04be2ce99a7e'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Optimization successful!');
      console.log('\n📊 RESULTS:');
      console.log('Original totals:', data.data.originalTotals);
      console.log('Optimized totals:', data.data.optimizedTotals);
      console.log('Target totals:', data.data.targetTotals);
      console.log('\n🎯 ACCURACY:');
      console.log(`Calories: ${data.data.accuracy.calories}%`);
      console.log(`Protein: ${data.data.accuracy.protein}%`);
      console.log(`Carbs: ${data.data.accuracy.carbs}%`);
      console.log(`Fat: ${data.data.accuracy.fat}%`);
      
      console.log('\n✂️ OPTIMIZATIONS:');
      data.data.optimizations.forEach(opt => {
        console.log(`${opt.day} ${opt.mealType}: ${opt.ingredient} ${opt.originalAmount} → ${opt.optimizedAmount} (${opt.reduction} less)`);
      });
      
      console.log('\n📈 OVERAGES REDUCED:');
      console.log(`Calories: ${data.data.overages.calories} kcal`);
      console.log(`Protein: ${data.data.overages.protein}g`);
      console.log(`Carbs: ${data.data.overages.carbs}g`);
      console.log(`Fat: ${data.data.overages.fat}g`);
      
    } else {
      console.error('❌ Optimization failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing optimization:', error);
  }
};

// Run the test
testOptimization();
