'use client';
import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import IngredientModal from './components/IngredientModal';
import RecipeBuilder from './components/RecipeBuilder';
import PlanBuilder from './components/PlanBuilder';

// Types
interface Ingredient {
  id: string;
  name: string;
  category: string;
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

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  meals: MealStructure[];
}

interface MealStructure {
  mealType: string;
  recipes: string[]; // Recipe IDs
}

// Mock data
const mockIngredients: Ingredient[] = [
  { id: '1', name: 'Kipfilet (rauw)', category: 'Vlees', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: '2', name: 'Zalm (rauw)', category: 'Vis', calories: 208, protein: 25, carbs: 0, fat: 12 },
  { id: '3', name: 'Broccoli', category: 'Groente', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { id: '4', name: 'Bruine Rijst', category: 'Granen', calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  { id: '5', name: 'Olijfolie', category: 'Vetten', calories: 884, protein: 0, carbs: 0, fat: 100 },
];

const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Gegrilde Kipfilet met Broccoli',
    description: 'Een gezonde maaltijd met mager eiwit en groenten',
    mealType: 'Hoofdgerecht',
    image: '/images/recipes/kip-broccoli.jpg',
    ingredients: [
      { ingredientId: '1', ingredientName: 'Kipfilet (rauw)', amount: 200, unit: 'g', calories: 330, protein: 62, carbs: 0, fat: 7.2 },
      { ingredientId: '3', ingredientName: 'Broccoli', amount: 150, unit: 'g', calories: 51, protein: 4.2, carbs: 10.5, fat: 0.6 },
      { ingredientId: '5', ingredientName: 'Olijfolie', amount: 10, unit: 'ml', calories: 88, protein: 0, carbs: 0, fat: 10 },
    ],
    totalCalories: 469,
    totalProtein: 66.2,
    totalCarbs: 10.5,
    totalFat: 17.8,
    prepTime: 25,
    servings: 1,
  },
];

const mockNutritionPlans: NutritionPlan[] = [
  {
    id: '1',
    name: 'Gebalanceerd Dieet',
    description: 'Een uitgebalanceerd voedingsplan voor algemene gezondheid en welzijn',
    meals: [
      { mealType: 'Ontbijt', recipes: ['1'] },
      { mealType: 'Lunch', recipes: ['1'] },
      { mealType: 'Diner', recipes: ['1'] },
    ],
  },
];

const categories = ['Vlees', 'Vis', 'Groente', 'Granen', 'Vetten', 'Fruit', 'Zuivel', 'Noten & Zaden'];

export default function AdminVoedingsplannenPage() {
  const [activeTab, setActiveTab] = useState<'recipes' | 'plans' | 'ingredients'>('recipes');
  const [ingredients, setIngredients] = useState<Ingredient[]>(mockIngredients);
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>(mockNutritionPlans);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<NutritionPlan | null>(null);

  const handleAddIngredient = () => {
    setEditingIngredient(null);
    setIngredientModalOpen(true);
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIngredientModalOpen(true);
  };

  const handleSaveIngredient = (ingredient: Ingredient) => {
    setIngredients((prev) => {
      const exists = prev.find((i) => i.id === ingredient.id);
      if (exists) {
        return prev.map((i) => (i.id === ingredient.id ? ingredient : i));
      } else {
        return [...prev, ingredient];
      }
    });
  };

  const handleAddRecipe = () => {
    setEditingRecipe(null);
    setRecipeModalOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setRecipeModalOpen(true);
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    setRecipes((prev) => {
      const exists = prev.find((r) => r.id === recipe.id);
      if (exists) {
        return prev.map((r) => (r.id === recipe.id ? recipe : r));
      } else {
        return [...prev, recipe];
      }
    });
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    setPlanModalOpen(true);
  };

  const handleEditPlan = (plan: NutritionPlan) => {
    setEditingPlan(plan);
    setPlanModalOpen(true);
  };

  const handleSavePlan = (plan: NutritionPlan) => {
    setNutritionPlans((prev) => {
      const exists = prev.find((p) => p.id === plan.id);
      if (exists) {
        return prev.map((p) => (p.id === plan.id ? plan : p));
      } else {
        return [...prev, plan];
      }
    });
  };

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlans = nutritionPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Voedingsplannen Beheer</h1>
        <p className="text-[#8BAE5A]">Beheer ingrediënten, recepten en voedingsplan templates</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#3A4D23]">
        <nav className="flex space-x-8">
          {[
            { id: 'recipes', label: 'Recepten Bibliotheek', count: recipes.length },
            { id: 'plans', label: 'Voedingsplan Templates', count: nutritionPlans.length },
            { id: 'ingredients', label: 'Ingrediënten Database', count: ingredients.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-[#8BAE5A] text-[#8BAE5A]'
                  : 'border-transparent text-[#8BAE5A]/60 hover:text-[#8BAE5A] hover:border-[#8BAE5A]/40'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-[#3A4D23] text-[#8BAE5A] px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8BAE5A]" />
          <input
            type="text"
            placeholder="Zoeken..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-[#8BAE5A]/60 focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
          />
        </div>

        {activeTab === 'ingredients' && (
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
            >
              <option value="">Alle categorieën</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        )}

        <button
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-black font-semibold rounded-lg hover:from-[#A6C97B] hover:to-[#8BAE5A] transition-all"
          onClick={activeTab === 'ingredients' ? handleAddIngredient : activeTab === 'recipes' ? handleAddRecipe : activeTab === 'plans' ? handleAddPlan : undefined}
        >
          <PlusIcon className="w-5 h-5" />
          {activeTab === 'recipes' && 'Nieuw Recept'}
          {activeTab === 'plans' && 'Nieuw Plan'}
          {activeTab === 'ingredients' && 'Nieuw Ingrediënt'}
        </button>
      </div>

      {/* Content */}
      <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
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
                        <button className="p-1 text-[#8BAE5A] hover:text-white transition-colors" onClick={() => handleEditIngredient(ingredient)}>
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-400 hover:text-red-300 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
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
              <div key={recipe.id} className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]/40 hover:border-[#8BAE5A]/40 transition-colors">
                <div className="aspect-video bg-[#3A4D23]/40 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-[#8BAE5A]/60">📷 Foto</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{recipe.name}</h3>
                <p className="text-[#8BAE5A] text-sm mb-3">{recipe.mealType}</p>
                <div className="flex justify-between text-xs text-white/80 mb-4">
                  <span>🕒 {recipe.prepTime} min</span>
                  <span>👥 {recipe.servings} portie(s)</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#8BAE5A] text-black rounded-lg text-sm font-medium hover:bg-[#A6C97B] transition-colors" onClick={() => handleEditRecipe(recipe)}>
                    <PencilIcon className="w-4 h-4" />
                    Bewerk
                  </button>
                  <button className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-4">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]/40 hover:border-[#8BAE5A]/40 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{plan.name}</h3>
                    <p className="text-[#8BAE5A] text-sm">{plan.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-2 bg-[#8BAE5A] text-black rounded-lg text-sm font-medium hover:bg-[#A6C97B] transition-colors" onClick={() => handleEditPlan(plan)}>
                      <PencilIcon className="w-4 h-4" />
                      Bewerk
                    </button>
                    <button className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
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
      </div>
      <IngredientModal
        isOpen={ingredientModalOpen}
        onClose={() => setIngredientModalOpen(false)}
        onSave={handleSaveIngredient}
        ingredient={editingIngredient}
        categories={categories}
      />
      <RecipeBuilder
        isOpen={recipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        onSave={handleSaveRecipe}
        recipe={editingRecipe}
        ingredients={ingredients}
      />
      <PlanBuilder
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onSave={handleSavePlan}
        plan={editingPlan}
        recipes={recipes}
      />
    </div>
  );
} 