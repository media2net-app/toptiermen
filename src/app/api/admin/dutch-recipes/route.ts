import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  dutchRecipes, 
  dutchIngredients, 
  calculateRecipeNutrition,
  searchRecipes,
  getIngredientsByCategory 
} from '@/lib/dutch-recipes';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const action = searchParams.get('action');
    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const mealType = searchParams.get('mealType');
    const cuisine = searchParams.get('cuisine');
    const dietTags = searchParams.get('dietTags');

    if (!action) {
      return NextResponse.json({ 
        error: 'Action parameter is required' 
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'recipes':
        // Gebruik altijd lokale recepten voor nu
        result = dutchRecipes;
        console.log('📊 Local recipes loaded:', result.length);
        break;

      case 'search':
        if (!query) {
          return NextResponse.json({ 
            error: 'Query parameter is required for search' 
          }, { status: 400 });
        }
        
        const filters: any = {};
        if (mealType) filters.mealType = mealType;
        if (cuisine) filters.cuisine = cuisine;
        if (dietTags) filters.dietTags = dietTags.split(',');

        result = searchRecipes(query, filters);
        break;

      case 'recipe':
        const recipeId = searchParams.get('id');
        if (!recipeId) {
          return NextResponse.json({ 
            error: 'ID parameter is required for recipe' 
          }, { status: 400 });
        }

        // Probeer eerst uit database
        const { data: recipe, error: recipeError } = await supabaseAdmin
          .from('nutrition_recipes')
          .select('*')
          .eq('id', recipeId)
          .single();

        if (recipeError || !recipe) {
          // Fallback naar lokale recepten
          result = dutchRecipes.find(r => r.id === recipeId);
        } else {
          result = recipe;
        }
        break;

      case 'ingredients':
        if (category) {
          result = getIngredientsByCategory(category);
        } else {
          result = dutchIngredients;
        }
        break;

      case 'categories':
        const categories = [...new Set(dutchIngredients.map(i => i.category))];
        result = categories;
        break;

      case 'meal-types':
        const mealTypes = ['ontbijt', 'lunch', 'diner', 'snack'];
        result = mealTypes;
        break;

      case 'diet-tags':
        const allDietTags = new Set<string>();
        dutchIngredients.forEach(ingredient => {
          ingredient.dietTags?.forEach(tag => allDietTags.add(tag));
        });
        dutchRecipes.forEach(recipe => {
          recipe.dietTags.forEach(tag => allDietTags.add(tag));
        });
        result = Array.from(allDietTags);
        break;

      case 'popular':
        // Top 10 populaire recepten
        result = dutchRecipes
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 10);
        break;

      case 'calculate-nutrition':
        const ingredients = searchParams.get('ingredients');
        if (!ingredients) {
          return NextResponse.json({ 
            error: 'Ingredients parameter is required' 
          }, { status: 400 });
        }

        try {
          const ingredientsArray = JSON.parse(ingredients);
          result = calculateRecipeNutrition(ingredientsArray);
        } catch (parseError) {
          return NextResponse.json({ 
            error: 'Invalid ingredients format' 
          }, { status: 400 });
        }
        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Available actions: recipes, search, recipe, ingredients, categories, meal-types, diet-tags, popular, calculate-nutrition' 
        }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error: any) {
    console.error('Dutch recipes API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch data',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, recipe, ingredient } = body;

    if (!action) {
      return NextResponse.json({ 
        error: 'Action parameter is required' 
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'add-recipe':
        if (!recipe) {
          return NextResponse.json({ 
            error: 'Recipe data is required' 
          }, { status: 400 });
        }

        // Bereken voeding op basis van ingrediënten
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          const nutrition = calculateRecipeNutrition(
            recipe.ingredients.map((i: any) => ({
              ingredientId: i.ingredientId,
              amount: i.amount
            }))
          );
          recipe.nutrition = nutrition;
        }

        const { data: newRecipe, error: addError } = await supabaseAdmin
          .from('nutrition_recipes')
          .insert([{
            ...recipe,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (addError) {
          console.error('❌ Failed to add recipe:', addError);
          return NextResponse.json({ 
            error: 'Failed to add recipe to database',
            details: addError.message 
          }, { status: 500 });
        }

        result = newRecipe;
        break;

      case 'update-recipe':
        const { id, ...updateData } = body;
        if (!id) {
          return NextResponse.json({ 
            error: 'Recipe ID is required' 
          }, { status: 400 });
        }

        // Bereken voeding opnieuw als ingrediënten zijn gewijzigd
        if (updateData.ingredients && updateData.ingredients.length > 0) {
          const nutrition = calculateRecipeNutrition(
            updateData.ingredients.map((i: any) => ({
              ingredientId: i.ingredientId,
              amount: i.amount
            }))
          );
          updateData.nutrition = nutrition;
        }

        const { data: updatedRecipe, error: updateError } = await supabaseAdmin
          .from('nutrition_recipes')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Failed to update recipe:', updateError);
          return NextResponse.json({ 
            error: 'Failed to update recipe',
            details: updateError.message 
          }, { status: 500 });
        }

        result = updatedRecipe;
        break;

      case 'add-ingredient':
        if (!ingredient) {
          return NextResponse.json({ 
            error: 'Ingredient data is required' 
          }, { status: 400 });
        }

        const { data: newIngredient, error: ingredientError } = await supabaseAdmin
          .from('nutrition_ingredients')
          .insert([{
            ...ingredient,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (ingredientError) {
          console.error('❌ Failed to add ingredient:', ingredientError);
          return NextResponse.json({ 
            error: 'Failed to add ingredient to database',
            details: ingredientError.message 
          }, { status: 500 });
        }

        result = newIngredient;
        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Available POST actions: add-recipe, update-recipe, add-ingredient' 
        }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error: any) {
    console.error('Dutch recipes POST error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // 'recipe' or 'ingredient'

    if (!id || !type) {
      return NextResponse.json({ 
        error: 'ID and type parameters are required' 
      }, { status: 400 });
    }

    let result;

    if (type === 'recipe') {
      const { error: deleteError } = await supabaseAdmin
        .from('nutrition_recipes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('❌ Failed to delete recipe:', deleteError);
        return NextResponse.json({ 
          error: 'Failed to delete recipe',
          details: deleteError.message 
        }, { status: 500 });
      }
    } else if (type === 'ingredient') {
      const { error: deleteError } = await supabaseAdmin
        .from('nutrition_ingredients')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('❌ Failed to delete ingredient:', deleteError);
        return NextResponse.json({ 
          error: 'Failed to delete ingredient',
          details: deleteError.message 
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ 
        error: 'Invalid type. Use "recipe" or "ingredient"' 
      }, { status: 400 });
    }

    result = { message: `${type} deleted successfully` };

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error: any) {
    console.error('Dutch recipes DELETE error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete item',
      details: error.message 
    }, { status: 500 });
  }
}
