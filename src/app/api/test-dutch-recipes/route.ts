import { NextResponse } from 'next/server';
import { dutchRecipes } from '@/lib/dutch-recipes';

export async function GET() {
  try {
    console.log('🔍 Loading dutchRecipes...');
    console.log('📊 Total recipes:', dutchRecipes.length);
    
    // Count recipes by meal type
    const mealTypeCounts = dutchRecipes.reduce((acc, recipe) => {
      acc[recipe.mealType] = (acc[recipe.mealType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count recipes by fitness goal
    const fitnessGoalCounts = dutchRecipes.reduce((acc, recipe) => {
      const goal = recipe.fitnessGoal || 'unknown';
      acc[goal] = (acc[goal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get unique IDs
    const uniqueIds = [...new Set(dutchRecipes.map(r => r.id))];
    
    // Check for duplicates
    const allIds = dutchRecipes.map(r => r.id);
    const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);

    return NextResponse.json({
      success: true,
      totalCount: dutchRecipes.length,
      uniqueIdsCount: uniqueIds.length,
      duplicates: duplicates,
      mealTypeCounts,
      fitnessGoalCounts,
      sampleRecipes: dutchRecipes.slice(0, 3).map(r => ({
        id: r.id,
        name: r.name,
        mealType: r.mealType,
        fitnessGoal: r.fitnessGoal
      }))
    });
  } catch (error) {
    console.error('❌ Error in test API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load recipes',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
