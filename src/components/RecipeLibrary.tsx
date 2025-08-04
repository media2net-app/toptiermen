'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  ClockIcon, 
  UsersIcon, 
  HeartIcon, 
  StarIcon,
  XMarkIcon,
  PlusIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

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

interface RecipeLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  nutritionGoals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
}

export default function RecipeLibrary({ 
  isOpen, 
  onClose, 
  onSelectRecipe, 
  mealType = 'lunch',
  nutritionGoals 
}: RecipeLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high-protein' | 'low-carb' | 'quick' | 'healthy'>('all');

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

  const handleSelectRecipe = (recipe: Recipe) => {
    // Add nutrition info if not present
    const nutritionInfo = getNutritionInfo(recipe);
    const enhancedRecipe = {
      ...recipe,
      calories: recipe.calories || nutritionInfo?.calories || 0,
      protein: recipe.protein || nutritionInfo?.protein || 0,
      fat: recipe.fat || nutritionInfo?.fat || 0,
      carbs: recipe.carbs || nutritionInfo?.carbs || 0,
    };
    
    onSelectRecipe(enhancedRecipe);
    onClose();
  };

  const getMealTypeSuggestions = () => {
    switch (mealType) {
      case 'breakfast':
        return ['ontbijt', 'pancakes', 'yoghurt', 'granola', 'eieren', 'smoothie'];
      case 'lunch':
        return ['salade', 'soep', 'sandwich', 'pasta', 'rijst', 'kip'];
      case 'dinner':
        return ['vis', 'vlees', 'vegetarisch', 'curry', 'stamppot', 'pasta'];
      case 'snack':
        return ['fruit', 'noten', 'smoothie', 'yoghurt', 'crackers'];
      default:
        return ['gezond', 'snel', 'lekker'];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181F17] border border-[#3A4D23] rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#8BAE5A]">
              Recepten Bibliotheek
            </h2>
            <p className="text-[#B6C948] text-sm">
              Zoek en selecteer recepten voor je {mealType === 'breakfast' ? 'ontbijt' : mealType === 'lunch' ? 'lunch' : mealType === 'dinner' ? 'diner' : 'snack'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchRecipes()}
              placeholder={`Zoek recepten voor ${mealType === 'breakfast' ? 'ontbijt' : mealType === 'lunch' ? 'lunch' : mealType === 'dinner' ? 'diner' : 'snack'}...`}
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
        <div className="mb-6">
          <p className="text-[#B6C948] text-sm mb-2">Snelle suggesties:</p>
          <div className="flex flex-wrap gap-2">
            {getMealTypeSuggestions().map((suggestion, index) => (
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
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
            <FireIcon className="w-4 h-4" />
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
            Snel (&lt; 30 min)
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
              className="bg-[#232D1A] rounded-lg overflow-hidden border border-[#3A4D23] cursor-pointer hover:border-[#8BAE5A] transition-all duration-200 hover:shadow-lg"
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
                    className="flex-1 px-3 py-2 bg-[#3A4D23] hover:bg-[#4A5D33] text-[#B6C948] text-sm rounded transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleSelectRecipe(recipe)}
                    className="flex-1 px-3 py-2 bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0A0F0A] text-sm rounded font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Selecteren
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
                      onClick={() => handleSelectRecipe(selectedRecipe)}
                      className="flex-1 px-4 py-2 bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0A0F0A] rounded font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Toevoegen aan Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 