import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
        // Haal alle recepten uit database
        const { data: recipes, error: recipesError } = await supabaseAdmin
          .from('nutrition_recipes')
          .select('*')
          .order('created_at', { ascending: false });

        if (recipesError) {
          console.error('❌ Error fetching recipes:', recipesError);
          return NextResponse.json({ 
            error: 'Failed to fetch recipes from database' 
          }, { status: 500 });
        }

        result = recipes || [];
        console.log('📊 Database recipes loaded:', result.length);
        break;

      case 'search':
        if (!query) {
          return NextResponse.json({ 
            error: 'Query parameter is required for search' 
          }, { status: 400 });
        }
        
        // Zoek in database
        let searchQuery = supabaseAdmin
          .from('nutrition_recipes')
          .select('*')
          .ilike('name', `%${query}%`);

        if (mealType) {
          searchQuery = searchQuery.eq('meal_type', mealType);
        }

        const { data: searchResults, error: searchError } = await searchQuery;
        
        if (searchError) {
          console.error('❌ Error searching recipes:', searchError);
          return NextResponse.json({ 
            error: 'Failed to search recipes' 
          }, { status: 500 });
        }

        result = searchResults || [];
        break;

      case 'recipe':
        const recipeId = searchParams.get('id');
        if (!recipeId) {
          return NextResponse.json({ 
            error: 'ID parameter is required for recipe' 
          }, { status: 400 });
        }

        const { data: recipe, error: recipeError } = await supabaseAdmin
          .from('nutrition_recipes')
          .select('*')
          .eq('id', recipeId)
          .single();

        if (recipeError || !recipe) {
          return NextResponse.json({ 
            error: 'Recipe not found' 
          }, { status: 404 });
        }

        result = recipe;
        break;

      case 'ingredients':
        let ingredientsQuery = supabaseAdmin
          .from('nutrition_ingredients')
          .select('*');

        if (category) {
          ingredientsQuery = ingredientsQuery.eq('category', category);
        }

        const { data: ingredients, error: ingredientsError } = await ingredientsQuery;
        
        if (ingredientsError) {
          console.error('❌ Error fetching ingredients:', ingredientsError);
          return NextResponse.json({ 
            error: 'Failed to fetch ingredients' 
          }, { status: 500 });
        }

        result = ingredients || [];
        break;

      case 'categories':
        const { data: categories, error: categoriesError } = await supabaseAdmin
          .from('nutrition_ingredients')
          .select('category')
          .not('category', 'is', null);

        if (categoriesError) {
          console.error('❌ Error fetching categories:', categoriesError);
          return NextResponse.json({ 
            error: 'Failed to fetch categories' 
          }, { status: 500 });
        }

        const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])];
        result = uniqueCategories;
        break;

      case 'meal-types':
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
        result = mealTypes;
        break;

      case 'popular':
        // Top 10 populaire recepten uit database
        const { data: popularRecipes, error: popularError } = await supabaseAdmin
          .from('nutrition_recipes')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (popularError) {
          console.error('❌ Error fetching popular recipes:', popularError);
          return NextResponse.json({ 
            error: 'Failed to fetch popular recipes' 
          }, { status: 500 });
        }

        result = popularRecipes || [];
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

        // Voeding wordt handmatig ingevoerd of via andere methode berekend

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

        // Voeding wordt handmatig bijgewerkt

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
