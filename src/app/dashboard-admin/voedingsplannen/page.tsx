'use client';
import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  ChartBarIcon,
  BoltIcon,
  LightBulbIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import IngredientModal from './components/IngredientModal';
import RecipeBuilder from './components/RecipeBuilder';
import PlanBuilder from './components/PlanBuilder';
import FoodItemModal from './components/FoodItemModal';
import AdminCard from '@/components/admin/AdminCard';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminButton from '@/components/admin/AdminButton';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types
interface FoodItem {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  description: string;
  serving_size: string;
  allergens: string[];
  diet_tags: string[];
  created_at: string;
  updated_at: string;
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  allergens?: string[];
  dietTags?: string[];
  alternatives?: string[];
}

interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  mealType: string;
  image: string;
  ingredients: RecipeIngredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  prepTime: number;
  servings: number;
}

interface MealStructure {
  mealType: string;
  recipes: string[]; // Recipe IDs
}

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  meals: MealStructure[];
}

export default function AdminVoedingsplannenPage() {
  const [activeTab, setActiveTab] = useState('voeding');
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [showRecipeBuilder, setShowRecipeBuilder] = useState(false);
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [showFoodItemModal, setShowFoodItemModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFoodItems, setIsLoadingFoodItems] = useState(true);

  // Fetch food items from database
  const fetchFoodItems = async () => {
    try {
      setIsLoadingFoodItems(true);
      console.log('🥗 Fetching food items from database...');
      
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('❌ Error fetching food items:', error);
        return;
      }
      
      setFoodItems(data || []);
      console.log('✅ Food items loaded:', data?.length || 0);
    } catch (err) {
      console.error('❌ Exception fetching food items:', err);
    } finally {
      setIsLoadingFoodItems(false);
    }
  };

  // Load food items on component mount
  useEffect(() => {
    fetchFoodItems();
  }, []);

  // Fetch nutrition data
  const fetchNutritionData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch ingredients, recipes, and plans from your data source
      // This is a placeholder - replace with actual data fetching
      setIngredients([]);
      setRecipes([]);
      setPlans([]);
      
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionData();
  }, []);

  // Handlers
  const handleAddFoodItem = () => {
    setSelectedFoodItem(null);
    setShowFoodItemModal(true);
  };

  const handleEditFoodItem = (foodItem: FoodItem) => {
    setSelectedFoodItem(foodItem);
    setShowFoodItemModal(true);
  };

  const handleSaveFoodItem = async () => {
    // Implement save logic
    await fetchFoodItems();
    setShowFoodItemModal(false);
  };

  const handleAddIngredient = () => {
    setSelectedIngredient(null);
    setShowIngredientModal(true);
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setShowIngredientModal(true);
  };

  const handleSaveIngredient = async (ingredient: Ingredient) => {
    // Implement save logic
    await fetchNutritionData();
    setShowIngredientModal(false);
  };

  const handleAddRecipe = () => {
    setSelectedRecipe(null);
    setShowRecipeBuilder(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeBuilder(true);
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    // Implement save logic
    await fetchNutritionData();
    setShowRecipeBuilder(false);
  };

  const handleAddPlan = () => {
    setSelectedPlan(null);
    setShowPlanBuilder(true);
  };

  const handleEditPlan = (plan: NutritionPlan) => {
    setSelectedPlan(plan);
    setShowPlanBuilder(true);
  };

  const handleSavePlan = async (plan: NutritionPlan) => {
    // Implement save logic
    await fetchNutritionData();
    setShowPlanBuilder(false);
  };

  // Filter data based on search term
  const filteredFoodItems = foodItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredIngredients = ingredients.filter(ingredient => 
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || ingredient.category === filterCategory)
  );

  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(ingredients.map(i => i.category)));

  const tabs = [
    { id: 'voeding', label: 'Voeding', count: foodItems.length, icon: '🥗' },
    { id: 'ingredients', label: 'Ingrediënten', count: ingredients.length, icon: '🥕' },
    { id: 'recipes', label: 'Recepten', count: recipes.length, icon: '🍳' },
    { id: 'plans', label: 'Plannen', count: plans.length, icon: '📋' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#8BAE5A]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Voedingsplannen Beheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer ingrediënten, recepten en voedingsplan templates</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard
          icon={<ChartBarIcon className="w-6 h-6" />}
          value={recipes.length}
          title="Recepten"
          color="blue"
        />
        <AdminStatsCard
          icon={<BoltIcon className="w-6 h-6" />}
          value={plans.length}
          title="Voedingsplannen"
          color="green"
        />
        <AdminStatsCard
          icon={<LightBulbIcon className="w-6 h-6" />}
          value={ingredients.length}
          title="Ingrediënten"
          color="orange"
        />
        <AdminStatsCard
          icon={<UserGroupIcon className="w-6 h-6" />}
          value={foodItems.length}
          title="Voedingsitems"
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="bg-[#232D1A] rounded-2xl p-2 border border-[#3A4D23]">
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#8BAE5A] text-[#181F17]'
                  : 'text-[#8BAE5A] hover:bg-[#181F17]'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              <span className="bg-[#181F17] text-[#8BAE5A] px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B6C948]" />
          <input
            type="text"
            placeholder="Zoeken..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
          />
        </div>

        {activeTab === 'ingredients' && (
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            >
              <option value="all">Alle categorieën</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        )}

        <AdminButton
          onClick={
            activeTab === 'voeding' ? handleAddFoodItem :
            activeTab === 'ingredients' ? handleAddIngredient : 
            activeTab === 'recipes' ? handleAddRecipe : 
            activeTab === 'plans' ? handleAddPlan : 
            handleAddFoodItem
          }
          variant="primary"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          {activeTab === 'voeding' && 'Nieuw Voedingsitem'}
          {activeTab === 'ingredients' && 'Nieuw Ingrediënt'}
          {activeTab === 'recipes' && 'Nieuw Recept'}
          {activeTab === 'plans' && 'Nieuw Plan'}
        </AdminButton>
      </div>

      {/* Content */}
      <AdminCard>
        {activeTab === 'voeding' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#3A4D23]">
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Naam</th>
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Categorie</th>
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Calorieën</th>
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Eiwitten (g)</th>
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Koolhydraten (g)</th>
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Vetten (g)</th>
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Acties</th>
                </tr>
              </thead>
              <tbody>
                {filteredFoodItems.map((item) => (
                  <tr key={item.id} className="border-b border-[#3A4D23]/20 hover:bg-[#181F17]/40">
                    <td className="py-3 px-4 text-white">{item.name}</td>
                    <td className="py-3 px-4 text-[#8BAE5A]">{item.category}</td>
                    <td className="py-3 px-4 text-white">{item.calories}</td>
                    <td className="py-3 px-4 text-white">{item.protein}</td>
                    <td className="py-3 px-4 text-white">{item.carbs}</td>
                    <td className="py-3 px-4 text-white">{item.fat}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <AdminButton
                          onClick={() => handleEditFoodItem(item)}
                          variant="secondary"
                          size="sm"
                        >
                          <PencilIcon className="w-4 h-4 mr-2" />
                          Bewerk
                        </AdminButton>
                        <AdminButton
                          variant="danger"
                          size="sm"
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Verwijder
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'ingredients' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#3A4D23]">
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Naam Ingrediënt</th>
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Categorie</th>
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Calorieën (per 100g)</th>
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Eiwitten (g)</th>
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Koolhydraten (g)</th>
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Vetten (g)</th>
                  <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Acties</th>
                </tr>
              </thead>
              <tbody>
                {filteredIngredients.map((ingredient) => (
                  <tr key={ingredient.id} className="border-b border-[#3A4D23]/20 hover:bg-[#181F17]/40">
                    <td className="py-3 px-4 text-white">{ingredient.name}</td>
                    <td className="py-3 px-4 text-[#8BAE5A]">{ingredient.category}</td>
                    <td className="py-3 px-4 text-white">{ingredient.calories}</td>
                    <td className="py-3 px-4 text-white">{ingredient.protein}</td>
                    <td className="py-3 px-4 text-white">{ingredient.carbs}</td>
                    <td className="py-3 px-4 text-white">{ingredient.fat}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <AdminButton
                          onClick={() => handleEditIngredient(ingredient)}
                          variant="secondary"
                          size="sm"
                        >
                          <PencilIcon className="w-4 h-4 mr-2" />
                          Bewerk
                        </AdminButton>
                        <AdminButton
                          variant="danger"
                          size="sm"
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Verwijder
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]/40 hover:border-[#8BAE5A]/40 transition-colors">
                <div className="aspect-video bg-[#3A4D23]/40 rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-[#8BAE5A]/60">📷 Foto</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{recipe.name}</h3>
                <p className="text-[#8BAE5A] text-sm mb-3">{recipe.mealType}</p>
                <div className="flex justify-between text-xs text-white/80 mb-4">
                  <span>🕒 {recipe.prepTime} min</span>
                  <span>👥 {recipe.servings} portie(s)</span>
                </div>
                <div className="flex gap-2">
                  <AdminButton
                    onClick={() => handleEditRecipe(recipe)}
                    variant="secondary"
                    size="sm"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Bewerk
                  </AdminButton>
                  <AdminButton
                    variant="danger"
                    size="sm"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Verwijder
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-4">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]/40 hover:border-[#8BAE5A]/40 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{plan.name}</h3>
                    <p className="text-[#8BAE5A] text-sm">{plan.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <AdminButton
                      onClick={() => handleEditPlan(plan)}
                      variant="secondary"
                      size="sm"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Bewerk
                    </AdminButton>
                    <AdminButton
                      variant="danger"
                      size="sm"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Verwijder
                    </AdminButton>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {plan.meals.map((meal, index) => (
                    <span key={index} className="px-2 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded text-xs">
                      {meal.mealType} ({meal.recipes.length} recepten)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Modals */}
      <IngredientModal
        isOpen={showIngredientModal}
        onClose={() => setShowIngredientModal(false)}
        ingredient={selectedIngredient}
        onSave={handleSaveIngredient}
        categories={categories}
      />

      <RecipeBuilder
        isOpen={showRecipeBuilder}
        onClose={() => setShowRecipeBuilder(false)}
        recipe={selectedRecipe}
        onSave={handleSaveRecipe}
        ingredients={ingredients}
      />

      <PlanBuilder
        isOpen={showPlanBuilder}
        onClose={() => setShowPlanBuilder(false)}
        plan={selectedPlan}
        onSave={(plan) => handleSavePlan(plan)}
        recipes={recipes}
      />

      <FoodItemModal
        isOpen={showFoodItemModal}
        onClose={() => setShowFoodItemModal(false)}
        foodItem={selectedFoodItem}
        onSave={handleSaveFoodItem}
      />
    </div>
  );
}