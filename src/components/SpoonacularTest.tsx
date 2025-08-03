'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { XMarkIcon, ClockIcon, UsersIcon, HeartIcon, ThumbUpIcon } from '@heroicons/react/24/outline';

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  healthScore: number;
  aggregateLikes: number;
  instructions?: string;
  extendedIngredients?: Array<{
    original: string;
    name: string;
    amount: number;
    unit: string;
  }>;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  summary?: string;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
}

interface MealPlan {
  meals: Array<{
    id: number;
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

export default function SpoonacularTest() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'mealplan' | 'quick'>('search');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  const searchRecipes = async () => {
    if (!searchQuery.trim()) {
      toast.error('Voer een zoekterm in');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/spoonacular?action=search&query=${encodeURIComponent(searchQuery)}&number=10`);
      const result = await response.json();

      if (result.success) {
        setRecipes(result.data.results || []);
        toast.success(`${result.data.results?.length || 0} recepten gevonden`);
      } else {
        toast.error(result.error || 'Fout bij zoeken');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Fout bij zoeken van recepten');
    } finally {
      setLoading(false);
    }
  };

  const getHighProteinRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/spoonacular?action=high-protein&calories=2000');
      const result = await response.json();

      if (result.success) {
        setRecipes(result.data.results || []);
        toast.success(`${result.data.results?.length || 0} eiwitrijke recepten gevonden`);
      } else {
        toast.error(result.error || 'Fout bij ophalen');
      }
    } catch (error) {
      console.error('High protein error:', error);
      toast.error('Fout bij ophalen van eiwitrijke recepten');
    } finally {
      setLoading(false);
    }
  };

  const getLowCarbRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/spoonacular?action=low-carb&calories=2000');
      const result = await response.json();

      if (result.success) {
        setRecipes(result.data.results || []);
        toast.success(`${result.data.results?.length || 0} koolhydraatarme recepten gevonden`);
      } else {
        toast.error(result.error || 'Fout bij ophalen');
      }
    } catch (error) {
      console.error('Low carb error:', error);
      toast.error('Fout bij ophalen van koolhydraatarme recepten');
    } finally {
      setLoading(false);
    }
  };

  const getQuickRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/spoonacular?action=quick&maxTime=30');
      const result = await response.json();

      if (result.success) {
        setRecipes(result.data.results || []);
        toast.success(`${result.data.results?.length || 0} snelle recepten gevonden`);
      } else {
        toast.error(result.error || 'Fout bij ophalen');
      }
    } catch (error) {
      console.error('Quick recipes error:', error);
      toast.error('Fout bij ophalen van snelle recepten');
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/spoonacular?action=mealplan&calories=2000');
      const result = await response.json();

      if (result.success) {
        setMealPlan(result.data);
        toast.success('Voedingsplan gegenereerd');
      } else {
        toast.error(result.error || 'Fout bij genereren');
      }
    } catch (error) {
      console.error('Meal plan error:', error);
      toast.error('Fout bij genereren van voedingsplan');
    } finally {
      setLoading(false);
    }
  };

  const getWeightLossPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/spoonacular?action=weight-loss-plan&calories=1500');
      const result = await response.json();

      if (result.success) {
        setMealPlan(result.data);
        toast.success('Afvalplan gegenereerd');
      } else {
        toast.error(result.error || 'Fout bij genereren');
      }
    } catch (error) {
      console.error('Weight loss plan error:', error);
      toast.error('Fout bij genereren van afvalplan');
    } finally {
      setLoading(false);
    }
  };

  const getMuscleGainPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/spoonacular?action=muscle-gain-plan&calories=2500');
      const result = await response.json();

      if (result.success) {
        setMealPlan(result.data);
        toast.success('Spieropbouwplan gegenereerd');
      } else {
        toast.error(result.error || 'Fout bij genereren');
      }
    } catch (error) {
      console.error('Muscle gain plan error:', error);
      toast.error('Fout bij genereren van spieropbouwplan');
    } finally {
      setLoading(false);
    }
  };

  const getRecipeDetails = async (recipeId: number) => {
    setLoadingRecipe(true);
    try {
      const response = await fetch(`/api/spoonacular?action=recipe&id=${recipeId}`);
      const result = await response.json();

      if (result.success) {
        setSelectedRecipe(result.data);
      } else {
        toast.error(result.error || 'Fout bij ophalen van recept details');
      }
    } catch (error) {
      console.error('Recipe details error:', error);
      toast.error('Fout bij ophalen van recept details');
    } finally {
      setLoadingRecipe(false);
    }
  };

  const getNutritionInfo = (recipe: Recipe) => {
    if (!recipe.nutrition?.nutrients) return null;
    
    const nutrients = recipe.nutrition.nutrients;
    return {
      calories: nutrients.find(n => n.name === 'Calories')?.amount || 0,
      protein: nutrients.find(n => n.name === 'Protein')?.amount || 0,
      fat: nutrients.find(n => n.name === 'Fat')?.amount || 0,
      carbs: nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0,
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">
          Spoonacular API Test
        </h1>
        <p className="text-[#B6C948]">
          Test de integratie met Spoonacular voor recepten en voedingsplannen
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'search' 
              ? 'bg-[#8BAE5A] text-[#0A0F0A]' 
              : 'text-[#B6C948] hover:text-white'
          }`}
        >
          Recepten Zoeken
        </button>
        <button
          onClick={() => setActiveTab('mealplan')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'mealplan' 
              ? 'bg-[#8BAE5A] text-[#0A0F0A]' 
              : 'text-[#B6C948] hover:text-white'
          }`}
        >
          Voedingsplannen
        </button>
        <button
          onClick={() => setActiveTab('quick')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            activeTab === 'quick' 
              ? 'bg-[#8BAE5A] text-[#0A0F0A]' 
              : 'text-[#B6C948] hover:text-white'
          }`}
        >
          Snelle Recepten
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek recepten (bijv. pasta, kip, vegetarisch)..."
              className="flex-1 px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:border-[#8BAE5A] focus:outline-none"
            />
            <button
              onClick={searchRecipes}
              disabled={loading}
              className="px-6 py-2 bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0A0F0A] font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Zoeken...' : 'Zoeken'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="bg-[#181F17] rounded-lg overflow-hidden border border-[#3A4D23] cursor-pointer hover:border-[#8BAE5A] transition-all duration-200 hover:shadow-lg"
                onClick={() => getRecipeDetails(recipe.id)}
              >
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-[#8BAE5A] font-semibold mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <div className="flex justify-between text-sm text-[#B6C948] mb-2">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {recipe.readyInMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      {recipe.servings} personen
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-[#B6C948]">
                    <span className="flex items-center gap-1">
                      <HeartIcon className="w-4 h-4" />
                      {recipe.healthScore}/100
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbUpIcon className="w-4 h-4" />
                      {recipe.aggregateLikes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meal Plan Tab */}
      {activeTab === 'mealplan' && (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={generateMealPlan}
              disabled={loading}
              className="px-6 py-2 bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0A0F0A] font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Genereren...' : 'Dagelijks Plan'}
            </button>
            <button
              onClick={getWeightLossPlan}
              disabled={loading}
              className="px-6 py-2 bg-[#FFD700] hover:bg-[#FFA500] text-[#0A0F0A] font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Genereren...' : 'Afvalplan'}
            </button>
            <button
              onClick={getMuscleGainPlan}
              disabled={loading}
              className="px-6 py-2 bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Genereren...' : 'Spieropbouwplan'}
            </button>
          </div>

          {mealPlan && (
            <div className="bg-[#181F17] rounded-lg p-6 border border-[#3A4D23]">
              <h2 className="text-xl font-semibold text-[#8BAE5A] mb-4">
                Voedingsplan
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-[#B6C948] font-semibold mb-3">Maaltijden</h3>
                  <div className="space-y-3">
                    {mealPlan.meals.map((meal, index) => (
                      <div 
                        key={meal.id} 
                        className="flex items-center gap-3 p-3 bg-[#232D1A] rounded-lg cursor-pointer hover:bg-[#2A3620] transition-colors"
                        onClick={() => getRecipeDetails(meal.id)}
                      >
                        <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center text-[#0A0F0A] font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{meal.title}</h4>
                          <div className="text-sm text-[#B6C948]">
                            ⏱️ {meal.readyInMinutes} min • 👥 {meal.servings} personen
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[#B6C948] font-semibold mb-3">Voedingswaarden</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-[#232D1A] rounded-lg">
                      <span className="text-white">Calorieën</span>
                      <span className="text-[#8BAE5A] font-semibold">{mealPlan.nutrients.calories}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#232D1A] rounded-lg">
                      <span className="text-white">Eiwitten</span>
                      <span className="text-[#8BAE5A] font-semibold">{mealPlan.nutrients.protein}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#232D1A] rounded-lg">
                      <span className="text-white">Vetten</span>
                      <span className="text-[#8BAE5A] font-semibold">{mealPlan.nutrients.fat}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#232D1A] rounded-lg">
                      <span className="text-white">Koolhydraten</span>
                      <span className="text-[#8BAE5A] font-semibold">{mealPlan.nutrients.carbohydrates}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Recipes Tab */}
      {activeTab === 'quick' && (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={getHighProteinRecipes}
              disabled={loading}
              className="px-6 py-2 bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0A0F0A] font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Laden...' : 'Eiwitrijk'}
            </button>
            <button
              onClick={getLowCarbRecipes}
              disabled={loading}
              className="px-6 py-2 bg-[#FFD700] hover:bg-[#FFA500] text-[#0A0F0A] font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Laden...' : 'Koolhydraatarm'}
            </button>
            <button
              onClick={getQuickRecipes}
              disabled={loading}
              className="px-6 py-2 bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Laden...' : 'Snel (< 30 min)'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="bg-[#181F17] rounded-lg overflow-hidden border border-[#3A4D23] cursor-pointer hover:border-[#8BAE5A] transition-all duration-200 hover:shadow-lg"
                onClick={() => getRecipeDetails(recipe.id)}
              >
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-[#8BAE5A] font-semibold mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <div className="flex justify-between text-sm text-[#B6C948] mb-2">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {recipe.readyInMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      {recipe.servings} personen
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-[#B6C948]">
                    <span className="flex items-center gap-1">
                      <HeartIcon className="w-4 h-4" />
                      {recipe.healthScore}/100
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbUpIcon className="w-4 h-4" />
                      {recipe.aggregateLikes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A]">
                {selectedRecipe.title}
              </h2>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recipe Image */}
              <div>
                <img 
                  src={selectedRecipe.image} 
                  alt={selectedRecipe.title}
                  className="w-full rounded-lg"
                />
              </div>

              {/* Recipe Info */}
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="flex gap-4 text-sm text-[#B6C948]">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {selectedRecipe.readyInMinutes} minuten
                  </span>
                  <span className="flex items-center gap-1">
                    <UsersIcon className="w-4 h-4" />
                    {selectedRecipe.servings} personen
                  </span>
                  <span className="flex items-center gap-1">
                    <HeartIcon className="w-4 h-4" />
                    {selectedRecipe.healthScore}/100
                  </span>
                </div>

                {/* Nutrition Info */}
                {getNutritionInfo(selectedRecipe) && (
                  <div>
                    <h3 className="text-[#B6C948] font-semibold mb-2">Voedingswaarden</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-[#232D1A] p-2 rounded">
                        <span className="text-white">Calorieën:</span>
                        <span className="text-[#8BAE5A] ml-2">{getNutritionInfo(selectedRecipe)?.calories}</span>
                      </div>
                      <div className="bg-[#232D1A] p-2 rounded">
                        <span className="text-white">Eiwitten:</span>
                        <span className="text-[#8BAE5A] ml-2">{getNutritionInfo(selectedRecipe)?.protein}g</span>
                      </div>
                      <div className="bg-[#232D1A] p-2 rounded">
                        <span className="text-white">Vetten:</span>
                        <span className="text-[#8BAE5A] ml-2">{getNutritionInfo(selectedRecipe)?.fat}g</span>
                      </div>
                      <div className="bg-[#232D1A] p-2 rounded">
                        <span className="text-white">Koolhydraten:</span>
                        <span className="text-[#8BAE5A] ml-2">{getNutritionInfo(selectedRecipe)?.carbs}g</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                {selectedRecipe.extendedIngredients && (
                  <div>
                    <h3 className="text-[#B6C948] font-semibold mb-2">Ingrediënten</h3>
                    <div className="space-y-1">
                      {selectedRecipe.extendedIngredients.map((ingredient, index) => (
                        <div key={index} className="text-white text-sm">
                          • {ingredient.original}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {selectedRecipe.instructions && (
                  <div>
                    <h3 className="text-[#B6C948] font-semibold mb-2">Bereidingswijze</h3>
                    <div 
                      className="text-white text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }}
                    />
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedRecipe.cuisines?.map((cuisine, index) => (
                    <span key={index} className="px-2 py-1 bg-[#8BAE5A] text-[#0A0F0A] text-xs rounded">
                      {cuisine}
                    </span>
                  ))}
                  {selectedRecipe.diets?.map((diet, index) => (
                    <span key={index} className="px-2 py-1 bg-[#FFD700] text-[#0A0F0A] text-xs rounded">
                      {diet}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Key Info */}
      <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
        <h3 className="text-[#8BAE5A] font-semibold mb-2">API Configuratie</h3>
        <p className="text-[#B6C948] text-sm mb-2">
          Voor volledige functionaliteit, voeg je Spoonacular API key toe aan je environment variables:
        </p>
        <code className="text-[#8BAE5A] text-xs bg-[#232D1A] p-2 rounded block">
          NEXT_PUBLIC_SPOONACULAR_API_KEY=your_api_key_here
        </code>
        <p className="text-[#B6C948] text-xs mt-2">
          Gratis tier: 150 requests per dag • 
          <a href="https://spoonacular.com/food-api" target="_blank" rel="noopener noreferrer" className="text-[#8BAE5A] hover:underline ml-1">
            API key aanvragen
          </a>
        </p>
      </div>
    </div>
  );
} 