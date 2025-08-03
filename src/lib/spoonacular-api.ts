// Spoonacular API Integration for Recipes and Meal Planning
// Free tier: 150 requests per day
// Documentation: https://spoonacular.com/food-api

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  license: string;
  sourceName: string;
  sourceUrl: string;
  spoonacularSourceUrl: string;
  aggregateLikes: number;
  healthScore: number;
  spoonacularScore: number;
  pricePerServing: number;
  analyzedInstructions: any[];
  cheap: boolean;
  creditsText: string;
  cuisines: string[];
  dairyFree: boolean;
  diets: string[];
  gaps: string;
  glutenFree: boolean;
  instructions: string;
  ketogenic: boolean;
  lowFodmap: boolean;
  occasions: string[];
  sustainable: boolean;
  vegan: boolean;
  vegetarian: boolean;
  veryHealthy: boolean;
  veryPopular: boolean;
  whole30: boolean;
  weightWatcherSmartPoints: number;
  dishTypes: string[];
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

export interface MealPlanDay {
  meals: Array<{
    id: number;
    imageType: string;
    title: string;
    readyInMinutes: number;
    servings: number;
  }>;
  nutrients: {
    calories: number;
    protein: string;
    fat: string;
    carbohydrates: string;
  };
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

class SpoonacularAPI {
  private apiKey: string;
  private baseUrl = 'https://api.spoonacular.com';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || '';
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add API key
    url.searchParams.append('apiKey', this.apiKey);
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Spoonacular API error:', error);
      throw error;
    }
  }

  // Search recipes
  async searchRecipes(query: string, options: {
    cuisine?: string;
    diet?: string;
    intolerances?: string;
    maxReadyTime?: number;
    minProtein?: number;
    maxCalories?: number;
    number?: number;
  } = {}) {
    const params = {
      query,
      number: options.number || 10,
      addRecipeInformation: true,
      fillIngredients: true,
      ...options
    };

    return this.makeRequest('/recipes/complexSearch', params);
  }

  // Get recipe by ID
  async getRecipeById(id: number) {
    return this.makeRequest(`/recipes/${id}/information`, {
      includeNutrition: true
    });
  }

  // Get random recipes
  async getRandomRecipes(options: {
    tags?: string;
    number?: number;
  } = {}) {
    return this.makeRequest('/recipes/random', {
      number: options.number || 10,
      ...options
    });
  }

  // Generate meal plan
  async generateMealPlan(options: {
    timeFrame?: 'day' | 'week';
    targetCalories?: number;
    diet?: string;
    exclude?: string;
  } = {}) {
    return this.makeRequest('/mealplanner/generate', {
      timeFrame: options.timeFrame || 'day',
      targetCalories: options.targetCalories || 2000,
      ...options
    });
  }

  // Get recipe nutrition by ID
  async getRecipeNutrition(id: number): Promise<NutritionInfo> {
    const data = await this.makeRequest(`/recipes/${id}/nutritionWidget.json`);
    
    return {
      calories: data.calories || 0,
      protein: data.protein || 0,
      fat: data.fat || 0,
      carbohydrates: data.carbs || 0,
      fiber: data.fiber || 0,
      sugar: data.sugar || 0,
      sodium: data.sodium || 0,
    };
  }

  // Analyze recipe ingredients
  async analyzeRecipeIngredients(ingredients: string[]) {
    return this.makeRequest('/recipes/analyze', {
      title: 'Recipe Analysis',
      ingredients: ingredients.join('\n'),
      instructions: 'Mix all ingredients together.',
      servings: 2
    });
  }

  // Get recipe instructions by ID
  async getRecipeInstructions(id: number) {
    return this.makeRequest(`/recipes/${id}/analyzedInstructions`);
  }

  // Search recipes by ingredients
  async searchRecipesByIngredients(ingredients: string[], options: {
    ranking?: number;
    ignorePantry?: boolean;
    number?: number;
  } = {}) {
    return this.makeRequest('/recipes/findByIngredients', {
      ingredients: ingredients.join(','),
      ranking: options.ranking || 2,
      ignorePantry: options.ignorePantry || true,
      number: options.number || 10
    });
  }

  // Get similar recipes
  async getSimilarRecipes(id: number, number: number = 5) {
    return this.makeRequest(`/recipes/${id}/similar`, { number });
  }

  // Get recipe equipment by ID
  async getRecipeEquipment(id: number) {
    return this.makeRequest(`/recipes/${id}/equipmentWidget.json`);
  }

  // Get recipe price breakdown by ID
  async getRecipePriceBreakdown(id: number) {
    return this.makeRequest(`/recipes/${id}/priceBreakdownWidget.json`);
  }

  // Get recipe taste by ID
  async getRecipeTaste(id: number) {
    return this.makeRequest(`/recipes/${id}/tasteWidget.json`);
  }

  // Get wine pairing
  async getWinePairing(food: string) {
    return this.makeRequest('/food/wine/pairing', { food });
  }

  // Get wine description
  async getWineDescription(wine: string) {
    return this.makeRequest('/food/wine/description', { wine });
  }

  // Get wine recommendation
  async getWineRecommendation(wine: string, maxPrice: number = 50) {
    return this.makeRequest('/food/wine/recommendation', { wine, maxPrice });
  }

  // Get food trivia
  async getFoodTrivia() {
    return this.makeRequest('/food/trivia/random');
  }

  // Get food jokes
  async getFoodJokes() {
    return this.makeRequest('/food/jokes/random');
  }

  // Convert amounts
  async convertAmounts(ingredientName: string, sourceAmount: number, sourceUnit: string, targetUnit: string) {
    return this.makeRequest('/recipes/convert', {
      ingredientName,
      sourceAmount,
      sourceUnit,
      targetUnit
    });
  }

  // Get ingredient information
  async getIngredientInformation(id: number, amount?: number, unit?: string) {
    const params: any = {};
    if (amount) params.amount = amount;
    if (unit) params.unit = unit;

    return this.makeRequest(`/food/ingredients/${id}/information`, params);
  }

  // Search ingredients
  async searchIngredients(query: string, number: number = 10) {
    return this.makeRequest('/food/ingredients/search', { query, number });
  }

  // Get ingredient substitutes
  async getIngredientSubstitutes(ingredientName: string) {
    return this.makeRequest('/food/ingredients/substitutes', { ingredientName });
  }

  // Get ingredient substitutes by ID
  async getIngredientSubstitutesById(id: number) {
    return this.makeRequest(`/food/ingredients/${id}/substitutes`);
  }
}

// Create singleton instance
export const spoonacularAPI = new SpoonacularAPI();

// Helper functions for common use cases
export const recipeHelpers = {
  // Get high protein recipes
  async getHighProteinRecipes(calories: number = 2000) {
    return spoonacularAPI.searchRecipes('high protein', {
      minProtein: 20,
      maxCalories: calories,
      number: 20
    });
  },

  // Get low carb recipes
  async getLowCarbRecipes(calories: number = 2000) {
    return spoonacularAPI.searchRecipes('low carb', {
      maxCalories: calories,
      diet: 'low-carb',
      number: 20
    });
  },

  // Get vegetarian recipes
  async getVegetarianRecipes(calories: number = 2000) {
    return spoonacularAPI.searchRecipes('vegetarian', {
      diet: 'vegetarian',
      maxCalories: calories,
      number: 20
    });
  },

  // Get quick recipes
  async getQuickRecipes(maxTime: number = 30) {
    return spoonacularAPI.searchRecipes('quick', {
      maxReadyTime: maxTime,
      number: 20
    });
  },

  // Get meal plan for weight loss
  async getWeightLossMealPlan(targetCalories: number = 1500) {
    return spoonacularAPI.generateMealPlan({
      targetCalories,
      diet: 'low-carb'
    });
  },

  // Get meal plan for muscle gain
  async getMuscleGainMealPlan(targetCalories: number = 2500) {
    return spoonacularAPI.generateMealPlan({
      targetCalories,
      diet: 'high-protein'
    });
  }
}; 