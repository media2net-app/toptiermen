import { NextRequest, NextResponse } from 'next/server';
import { spoonacularAPI, recipeHelpers } from '@/lib/spoonacular-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const query = searchParams.get('query');
    const id = searchParams.get('id');
    const calories = searchParams.get('calories');
    const diet = searchParams.get('diet');
    const cuisine = searchParams.get('cuisine');
    const maxTime = searchParams.get('maxTime');
    const number = searchParams.get('number');

    if (!action) {
      return NextResponse.json({ 
        error: 'Action parameter is required' 
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json({ 
            error: 'Query parameter is required for search' 
          }, { status: 400 });
        }
        
        result = await spoonacularAPI.searchRecipes(query, {
          cuisine: cuisine || undefined,
          diet: diet || undefined,
          maxReadyTime: maxTime ? parseInt(maxTime) : undefined,
          maxCalories: calories ? parseInt(calories) : undefined,
          number: number ? parseInt(number) : 10
        });
        break;

      case 'recipe':
        if (!id) {
          return NextResponse.json({ 
            error: 'ID parameter is required for recipe' 
          }, { status: 400 });
        }
        
        result = await spoonacularAPI.getRecipeById(parseInt(id));
        break;

      case 'random':
        result = await spoonacularAPI.getRandomRecipes({
          number: number ? parseInt(number) : 10
        });
        break;

      case 'mealplan':
        result = await spoonacularAPI.generateMealPlan({
          targetCalories: calories ? parseInt(calories) : 2000,
          diet: diet || undefined
        });
        break;

      case 'nutrition':
        if (!id) {
          return NextResponse.json({ 
            error: 'ID parameter is required for nutrition' 
          }, { status: 400 });
        }
        
        result = await spoonacularAPI.getRecipeNutrition(parseInt(id));
        break;

      case 'high-protein':
        result = await recipeHelpers.getHighProteinRecipes(
          calories ? parseInt(calories) : 2000
        );
        break;

      case 'low-carb':
        result = await recipeHelpers.getLowCarbRecipes(
          calories ? parseInt(calories) : 2000
        );
        break;

      case 'vegetarian':
        result = await recipeHelpers.getVegetarianRecipes(
          calories ? parseInt(calories) : 2000
        );
        break;

      case 'quick':
        result = await recipeHelpers.getQuickRecipes(
          maxTime ? parseInt(maxTime) : 30
        );
        break;

      case 'weight-loss-plan':
        result = await recipeHelpers.getWeightLossMealPlan(
          calories ? parseInt(calories) : 1500
        );
        break;

      case 'muscle-gain-plan':
        result = await recipeHelpers.getMuscleGainMealPlan(
          calories ? parseInt(calories) : 2500
        );
        break;

      case 'similar':
        if (!id) {
          return NextResponse.json({ 
            error: 'ID parameter is required for similar recipes' 
          }, { status: 400 });
        }
        
        result = await spoonacularAPI.getSimilarRecipes(
          parseInt(id), 
          number ? parseInt(number) : 5
        );
        break;

      case 'ingredients':
        if (!query) {
          return NextResponse.json({ 
            error: 'Query parameter is required for ingredients search' 
          }, { status: 400 });
        }
        
        result = await spoonacularAPI.searchIngredients(
          query, 
          number ? parseInt(number) : 10
        );
        break;

      case 'substitutes':
        if (!query) {
          return NextResponse.json({ 
            error: 'Query parameter is required for substitutes' 
          }, { status: 400 });
        }
        
        result = await spoonacularAPI.getIngredientSubstitutes(query);
        break;

      case 'trivia':
        result = await spoonacularAPI.getFoodTrivia();
        break;

      case 'jokes':
        result = await spoonacularAPI.getFoodJokes();
        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Available actions: search, recipe, random, mealplan, nutrition, high-protein, low-carb, vegetarian, quick, weight-loss-plan, muscle-gain-plan, similar, ingredients, substitutes, trivia, jokes' 
        }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error: any) {
    console.error('Spoonacular API error:', error);
    
    // Check if it's an API key error
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      return NextResponse.json({ 
        error: 'Invalid or missing Spoonacular API key. Please add NEXT_PUBLIC_SPOONACULAR_API_KEY to your environment variables.',
        details: 'Get your free API key at https://spoonacular.com/food-api'
      }, { status: 401 });
    }

    // Check if it's a rate limit error
    if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
      return NextResponse.json({ 
        error: 'API rate limit exceeded. Free tier allows 150 requests per day.',
        details: 'Please try again later or upgrade your plan.'
      }, { status: 429 });
    }

    return NextResponse.json({ 
      error: 'Failed to fetch data from Spoonacular API',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ingredients, title, instructions, servings } = body;

    if (!action) {
      return NextResponse.json({ 
        error: 'Action parameter is required' 
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'analyze':
        if (!ingredients || !Array.isArray(ingredients)) {
          return NextResponse.json({ 
            error: 'Ingredients array is required for analysis' 
          }, { status: 400 });
        }
        
        result = await spoonacularAPI.analyzeRecipeIngredients(ingredients);
        break;

      case 'convert':
        const { ingredientName, sourceAmount, sourceUnit, targetUnit } = body;
        
        if (!ingredientName || !sourceAmount || !sourceUnit || !targetUnit) {
          return NextResponse.json({ 
            error: 'ingredientName, sourceAmount, sourceUnit, and targetUnit are required for conversion' 
          }, { status: 400 });
        }
        
        result = await spoonacularAPI.convertAmounts(
          ingredientName, 
          sourceAmount, 
          sourceUnit, 
          targetUnit
        );
        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Available POST actions: analyze, convert' 
        }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error: any) {
    console.error('Spoonacular API POST error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error.message 
    }, { status: 500 });
  }
} 