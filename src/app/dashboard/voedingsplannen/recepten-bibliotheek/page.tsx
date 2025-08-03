'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  ClockIcon, 
  UsersIcon, 
  HeartIcon, 
  StarIcon,
  XMarkIcon,
  FireIcon,
  BoltIcon,
  LeafIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import PageLayout from '@/components/PageLayout';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  healthScore: number;
  aggregateLikes: number;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
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

interface SavedRecipe {
  id: string;
  name: string;
  description: string;
  instructions: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: string;
  meal_type: string;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  image_url: string;
  is_public: boolean;
  created_at: string;
}

export default function ReceptenBibliotheekPage() {
  const { user } = useSupabaseAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high-protein' | 'low-carb' | 'quick' | 'healthy'>('all');
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');
  const [savingRecipe, setSavingRecipe] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const fetchSavedRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedRecipes(data || []);
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
      toast.error('Fout bij ophalen van opgeslagen recepten');
    }
  };

  const searchRecipes = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      toast.error('Voer een zoekterm in');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/spoonacular?action=search&query=${encodeURIComponent(searchTerm)}&number=12`);
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

  const getFilteredRecipes = async (filter: string) => {
    setActiveFilter(filter as any);
    setLoading(true);
    
    try {
      let endpoint = '';
      switch (filter) {
        case 'high-protein':
          endpoint = '/api/spoonacular?action=high-protein&calories=2000';
          break;
        case 'low-carb':
          endpoint = '/api/spoonacular?action=low-carb&calories=2000';
          break;
        case 'quick':
          endpoint = '/api/spoonacular?action=quick&maxTime=30';
          break;
        case 'healthy':
          endpoint = '/api/spoonacular?action=healthy&maxCalories=500';
          break;
        default:
          return;
      }

      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.success) {
        setRecipes(result.data.results || []);
        toast.success(`${result.data.results?.length || 0} recepten gevonden`);
      } else {
        toast.error(result.error || 'Fout bij ophalen');
      }
    } catch (error) {
      console.error('Filter error:', error);
      toast.error('Fout bij ophalen van recepten');
    } finally {
      setLoading(false);
    }
  };

  const getRecipeDetails = async (recipeId: number) => {
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

  const saveRecipeToDatabase = async (recipe: Recipe) => {
    if (!user) {
      toast.error('Je moet ingelogd zijn om recepten op te slaan');
      return;
    }

    setSavingRecipe(recipe.id.toString());
    
    try {
      const nutritionInfo = getNutritionInfo(recipe);
      const calories = nutritionInfo?.calories || recipe.calories || 0;
      const protein = nutritionInfo?.protein || recipe.protein || 0;
      const fat = nutritionInfo?.fat || recipe.fat || 0;
      const carbs = nutritionInfo?.carbs || recipe.carbs || 0;

      // Determine meal type based on recipe properties
      let mealType = 'dinner';
      if (recipe.title.toLowerCase().includes('ontbijt') || recipe.title.toLowerCase().includes('breakfast') || recipe.title.toLowerCase().includes('pancake') || recipe.title.toLowerCase().includes('yoghurt')) {
        mealType = 'breakfast';
      } else if (recipe.title.toLowerCase().includes('lunch') || recipe.title.toLowerCase().includes('salade') || recipe.title.toLowerCase().includes('soep')) {
        mealType = 'lunch';
      } else if (recipe.title.toLowerCase().includes('snack') || recipe.title.toLowerCase().includes('smoothie') || recipe.title.toLowerCase().includes('fruit')) {
        mealType = 'snack';
      }

      // Determine difficulty based on prep time
      let difficulty = 'easy';
      if (recipe.readyInMinutes > 45) {
        difficulty = 'hard';
      } else if (recipe.readyInMinutes > 30) {
        difficulty = 'medium';
      }

      const recipeData = {
        name: recipe.title,
        description: recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '').substring(0, 500) : `Gezond recept: ${recipe.title}`,
        instructions: recipe.instructions || 'Bereidingsinstructies niet beschikbaar',
        prep_time_minutes: Math.round(recipe.readyInMinutes * 0.3),
        cook_time_minutes: Math.round(recipe.readyInMinutes * 0.7),
        servings: recipe.servings,
        difficulty: difficulty,
        meal_type: mealType,
        calories_per_serving: Math.round(calories / recipe.servings),
        protein_per_serving: Math.round(protein / recipe.servings),
        carbs_per_serving: Math.round(carbs / recipe.servings),
        fat_per_serving: Math.round(fat / recipe.servings),
        image_url: recipe.image,
        is_public: true,
        author_id: user.id
      };

      const { data, error } = await supabase
        .from('nutrition_recipes')
        .insert(recipeData)
        .select()
        .single();

      if (error) throw error;

      toast.success(`${recipe.title} opgeslagen in je bibliotheek!`);
      fetchSavedRecipes(); // Refresh saved recipes
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Fout bij opslaan van recept');
    } finally {
      setSavingRecipe(null);
    }
  };

  const deleteSavedRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from('nutrition_recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;

      toast.success('Recept verwijderd uit je bibliotheek');
      fetchSavedRecipes(); // Refresh saved recipes
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.error('Fout bij verwijderen van recept');
    }
  };

  return (
    <PageLayout
      title="Recepten Bibliotheek"
      subtitle="Zoek en bewaar je favoriete recepten"
    >
      <div className="max-w-6xl mx-auto p-6 space-y-6">
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
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'saved' 
                ? 'bg-[#8BAE5A] text-[#0A0F0A]' 
                : 'text-[#B6C948] hover:text-white'
            }`}
          >
            Mijn Opgeslagen Recepten ({savedRecipes.length})
          </button>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchRecipes()}
                  placeholder="Zoek recepten (bijv. pasta, kip, vegetarisch)..."
                  className="w-full px-4 py-3 pl-12 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:border-[#8BAE5A] focus:outline-none"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <button
                onClick={() => searchRecipes()}
                disabled={loading}
                className="px-6 py-3 bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0A0F0A] font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Zoeken...' : 'Zoeken'}
              </button>
            </div>

            {/* Quick Suggestions */}
            <div>
              <p className="text-[#B6C948] text-sm mb-2">Snelle suggesties:</p>
              <div className="flex flex-wrap gap-2">
                {['ontbijt', 'lunch', 'diner', 'vegetarisch', 'eiwitrijk', 'snel', 'gezond', 'pasta', 'kip', 'vis'].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      searchRecipes(suggestion);
                    }}
                    className="px-3 py-1 bg-[#232D1A] border border-[#3A4D23] rounded-full text-[#B6C948] text-sm hover:border-[#8BAE5A] transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => getFilteredRecipes('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                    : 'bg-[#232D1A] text-[#B6C948] hover:bg-[#2A3620]'
                }`}
              >
                Alle Recepten
              </button>
              <button
                onClick={() => getFilteredRecipes('high-protein')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  activeFilter === 'high-protein'
                    ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                    : 'bg-[#232D1A] text-[#B6C948] hover:bg-[#2A3620]'
                }`}
              >
                <FireIcon className="w-4 h-4" />
                Eiwitrijk
              </button>
              <button
                onClick={() => getFilteredRecipes('low-carb')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  activeFilter === 'low-carb'
                    ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                    : 'bg-[#232D1A] text-[#B6C948] hover:bg-[#2A3620]'
                }`}
              >
                <LeafIcon className="w-4 h-4" />
                Koolhydraatarm
              </button>
              <button
                onClick={() => getFilteredRecipes('quick')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  activeFilter === 'quick'
                    ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                    : 'bg-[#232D1A] text-[#B6C948] hover:bg-[#2A3620]'
                }`}
              >
                <BoltIcon className="w-4 h-4" />
                Snel (< 30 min)
              </button>
              <button
                onClick={() => getFilteredRecipes('healthy')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  activeFilter === 'healthy'
                    ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                    : 'bg-[#232D1A] text-[#B6C948] hover:bg-[#2A3620]'
                }`}
              >
                <HeartIcon className="w-4 h-4" />
                Gezond
              </button>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe) => (
                <div 
                  key={recipe.id} 
                  className="bg-[#232D1A] rounded-lg overflow-hidden border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-200 hover:shadow-lg"
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
                    <div className="flex justify-between text-sm text-[#B6C948] mb-3">
                      <span className="flex items-center gap-1">
                        <HeartIcon className="w-4 h-4" />
                        {recipe.healthScore}/100
                      </span>
                      <span className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4" />
                        {recipe.aggregateLikes}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => getRecipeDetails(recipe.id)}
                        className="flex-1 px-3 py-2 bg-[#3A4D23] hover:bg-[#4A5D33] text-[#B6C948] text-sm rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Details
                      </button>
                      <button
                        onClick={() => saveRecipeToDatabase(recipe)}
                        disabled={savingRecipe === recipe.id.toString()}
                        className="flex-1 px-3 py-2 bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0A0F0A] text-sm rounded font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {savingRecipe === recipe.id.toString() ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0A0F0A]"></div>
                        ) : (
                          <>
                            <BookmarkIcon className="w-4 h-4" />
                            Opslaan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Saved Recipes Tab */}
        {activeTab === 'saved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {savedRecipes.length === 0 ? (
              <div className="text-center py-12">
                <BookmarkSlashIcon className="w-16 h-16 text-[#3A4D23] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Nog geen opgeslagen recepten</h3>
                <p className="text-[#B6C948] mb-4">
                  Zoek recepten en sla ze op om ze hier terug te vinden
                </p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0A0F0A] px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Recepten Zoeken
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedRecipes.map((recipe) => (
                  <div 
                    key={recipe.id} 
                    className="bg-[#232D1A] rounded-lg overflow-hidden border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-200 hover:shadow-lg"
                  >
                    <img 
                      src={recipe.image_url} 
                      alt={recipe.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-[#8BAE5A] font-semibold mb-2 line-clamp-2">
                        {recipe.name}
                      </h3>
                      <div className="flex justify-between text-sm text-[#B6C948] mb-2">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {recipe.prep_time_minutes + recipe.cook_time_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <UsersIcon className="w-4 h-4" />
                          {recipe.servings} personen
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-[#B6C948] mb-3">
                        <span className="capitalize">{recipe.meal_type}</span>
                        <span className="capitalize">{recipe.difficulty}</span>
                      </div>
                      <div className="text-sm text-[#B6C948] mb-3">
                        <div className="flex justify-between">
                          <span>{recipe.calories_per_serving} kcal</span>
                          <span>{recipe.protein_per_serving}g eiwit</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="flex-1 px-3 py-2 bg-[#3A4D23] hover:bg-[#4A5D33] text-[#B6C948] text-sm rounded transition-colors"
                        >
                          Bekijken
                        </button>
                        <button
                          onClick={() => deleteSavedRecipe(recipe.id)}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <BookmarkSlashIcon className="w-4 h-4" />
                          Verwijderen
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
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

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setSelectedRecipe(null)}
                      className="flex-1 px-4 py-2 bg-[#3A4D23] hover:bg-[#4A5D33] text-[#B6C948] rounded transition-colors"
                    >
                      Sluiten
                    </button>
                    <button
                      onClick={() => saveRecipeToDatabase(selectedRecipe)}
                      disabled={savingRecipe === selectedRecipe.id.toString()}
                      className="flex-1 px-4 py-2 bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0A0F0A] rounded font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {savingRecipe === selectedRecipe.id.toString() ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0A0F0A]"></div>
                      ) : (
                        <>
                          <BookmarkIcon className="w-4 h-4" />
                          Opslaan in Bibliotheek
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
} 