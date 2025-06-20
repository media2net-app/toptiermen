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
  { id: '6', name: 'Havermout', category: 'Granen', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
  { id: '7', name: 'Banaan', category: 'Fruit', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { id: '8', name: 'Quinoa', category: 'Granen', calories: 120, protein: 4.4, carbs: 22, fat: 1.9 },
  { id: '9', name: 'Griekse Yoghurt', category: 'Zuivel', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { id: '10', name: 'Tonijn (in water)', category: 'Vis', calories: 116, protein: 26, carbs: 0, fat: 0.8 },
  { id: '11', name: 'Avocado', category: 'Fruit', calories: 160, protein: 2, carbs: 9, fat: 15 },
  { id: '12', name: 'Zoete Aardappel', category: 'Groente', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { id: '13', name: 'Spinazie', category: 'Groente', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { id: '14', name: 'Eieren', category: 'Zuivel', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { id: '15', name: 'Pasta (volkoren)', category: 'Granen', calories: 124, protein: 5, carbs: 25, fat: 1.1 },
  { id: '16', name: 'Tomaat', category: 'Groente', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { id: '17', name: 'Ui', category: 'Groente', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  { id: '18', name: 'Knoflook', category: 'Groente', calories: 149, protein: 6.4, carbs: 33, fat: 0.5 },
  { id: '19', name: 'Gember', category: 'Groente', calories: 80, protein: 1.8, carbs: 18, fat: 0.8 },
  { id: '20', name: 'Kokosmelk', category: 'Vetten', calories: 230, protein: 2.3, carbs: 6, fat: 24 },
];

const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Gegrilde Kipfilet met Broccoli',
    description: 'Een gezonde maaltijd met mager eiwit en groenten. Perfect voor na het trainen.',
    mealType: 'Hoofdgerecht',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
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
  {
    id: '2',
    name: 'Havermout met Banaan en Noten',
    description: 'Energierijk ontbijt met complexe koolhydraten en gezonde vetten.',
    mealType: 'Ontbijt',
    image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '6', ingredientName: 'Havermout', amount: 80, unit: 'g', calories: 311, protein: 13.5, carbs: 53, fat: 5.5 },
      { ingredientId: '7', ingredientName: 'Banaan', amount: 100, unit: 'g', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
    ],
    totalCalories: 320,
    totalProtein: 12,
    totalCarbs: 45,
    totalFat: 8,
    prepTime: 15,
    servings: 1,
  },
  {
    id: '3',
    name: 'Zalm met Quinoa en Groenten',
    description: 'Omega-3 rijke maaltijd met complete eiwitten en vezels.',
    mealType: 'Hoofdgerecht',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '2', ingredientName: 'Zalm (rauw)', amount: 150, unit: 'g', calories: 312, protein: 37.5, carbs: 0, fat: 18 },
      { ingredientId: '8', ingredientName: 'Quinoa', amount: 100, unit: 'g', calories: 120, protein: 4.4, carbs: 22, fat: 1.9 },
    ],
    totalCalories: 450,
    totalProtein: 42,
    totalCarbs: 35,
    totalFat: 22,
    prepTime: 30,
    servings: 1,
  },
  {
    id: '4',
    name: 'Griekse Yoghurt Bowl',
    description: 'Eiwitrijk ontbijt met verse bessen en honing.',
    mealType: 'Ontbijt',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '9', ingredientName: 'Griekse Yoghurt', amount: 200, unit: 'g', calories: 118, protein: 20, carbs: 7.2, fat: 0.8 },
    ],
    totalCalories: 280,
    totalProtein: 25,
    totalCarbs: 20,
    totalFat: 8,
    prepTime: 10,
    servings: 1,
  },
  {
    id: '5',
    name: 'Kip Caesar Salade',
    description: 'Klassieke salade met gegrilde kip en Caesar dressing.',
    mealType: 'Lunch',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '1', ingredientName: 'Kipfilet (rauw)', amount: 120, unit: 'g', calories: 198, protein: 37.2, carbs: 0, fat: 4.3 },
    ],
    totalCalories: 380,
    totalProtein: 35,
    totalCarbs: 15,
    totalFat: 18,
    prepTime: 20,
    servings: 1,
  },
  {
    id: '6',
    name: 'Pasta Bolognese',
    description: 'Italiaanse klassieker met mager rundvlees en verse tomaten.',
    mealType: 'Hoofdgerecht',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '15', ingredientName: 'Pasta (volkoren)', amount: 200, unit: 'g', calories: 248, protein: 10, carbs: 50, fat: 2.2 },
      { ingredientId: '16', ingredientName: 'Tomaat', amount: 100, unit: 'g', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
    ],
    totalCalories: 520,
    totalProtein: 28,
    totalCarbs: 65,
    totalFat: 18,
    prepTime: 45,
    servings: 2,
  },
  {
    id: '7',
    name: 'Smoothie Bowl',
    description: 'Kleurrijke smoothie bowl met vers fruit en granola.',
    mealType: 'Ontbijt',
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '7', ingredientName: 'Banaan', amount: 120, unit: 'g', calories: 107, protein: 1.3, carbs: 27.6, fat: 0.4 },
    ],
    totalCalories: 320,
    totalProtein: 8,
    totalCarbs: 45,
    totalFat: 12,
    prepTime: 15,
    servings: 1,
  },
  {
    id: '8',
    name: 'Tonijn Sandwich',
    description: 'Eiwitrijke lunch met verse tonijn en groenten.',
    mealType: 'Lunch',
    image: 'https://images.unsplash.com/photo-1528735602781-4a98ef4a30c6?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '10', ingredientName: 'Tonijn (in water)', amount: 100, unit: 'g', calories: 116, protein: 26, carbs: 0, fat: 0.8 },
    ],
    totalCalories: 420,
    totalProtein: 32,
    totalCarbs: 35,
    totalFat: 18,
    prepTime: 15,
    servings: 1,
  },
  {
    id: '9',
    name: 'Stir Fry Kip',
    description: 'Aziatische wokschotel met kip en verse groenten.',
    mealType: 'Hoofdgerecht',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '1', ingredientName: 'Kipfilet (rauw)', amount: 180, unit: 'g', calories: 297, protein: 55.8, carbs: 0, fat: 6.5 },
    ],
    totalCalories: 380,
    totalProtein: 42,
    totalCarbs: 25,
    totalFat: 12,
    prepTime: 25,
    servings: 1,
  },
  {
    id: '10',
    name: 'Avocado Toast',
    description: 'Trendy ontbijt met avocado, ei en verse kruiden.',
    mealType: 'Ontbijt',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '11', ingredientName: 'Avocado', amount: 100, unit: 'g', calories: 160, protein: 2, carbs: 9, fat: 15 },
      { ingredientId: '14', ingredientName: 'Eieren', amount: 50, unit: 'g', calories: 78, protein: 6.5, carbs: 0.6, fat: 5.5 },
    ],
    totalCalories: 350,
    totalProtein: 15,
    totalCarbs: 25,
    totalFat: 22,
    prepTime: 10,
    servings: 1,
  },
  {
    id: '11',
    name: 'Gegrilde Kipfilet met Zoete Aardappel',
    description: 'Balans van eiwitten en complexe koolhydraten.',
    mealType: 'Hoofdgerecht',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '1', ingredientName: 'Kipfilet (rauw)', amount: 200, unit: 'g', calories: 330, protein: 62, carbs: 0, fat: 7.2 },
      { ingredientId: '12', ingredientName: 'Zoete Aardappel', amount: 150, unit: 'g', calories: 129, protein: 2.4, carbs: 30, fat: 0.2 },
    ],
    totalCalories: 480,
    totalProtein: 45,
    totalCarbs: 45,
    totalFat: 15,
    prepTime: 35,
    servings: 1,
  },
  {
    id: '12',
    name: 'Quinoa Salade',
    description: 'Vezelrijke salade met quinoa, groenten en feta.',
    mealType: 'Lunch',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '8', ingredientName: 'Quinoa', amount: 100, unit: 'g', calories: 120, protein: 4.4, carbs: 22, fat: 1.9 },
      { ingredientId: '13', ingredientName: 'Spinazie', amount: 50, unit: 'g', calories: 12, protein: 1.5, carbs: 1.8, fat: 0.2 },
    ],
    totalCalories: 320,
    totalProtein: 12,
    totalCarbs: 35,
    totalFat: 15,
    prepTime: 20,
    servings: 1,
  },
  {
    id: '13',
    name: 'Omelet met Groenten',
    description: 'Eiwitrijk ontbijt met verse groenten en kaas.',
    mealType: 'Ontbijt',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '14', ingredientName: 'Eieren', amount: 100, unit: 'g', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
      { ingredientId: '13', ingredientName: 'Spinazie', amount: 30, unit: 'g', calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1 },
    ],
    totalCalories: 280,
    totalProtein: 22,
    totalCarbs: 8,
    totalFat: 18,
    prepTime: 15,
    servings: 1,
  },
  {
    id: '14',
    name: 'Zalm Teriyaki',
    description: 'Japanse zalm met teriyaki saus en gestoomde rijst.',
    mealType: 'Hoofdgerecht',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '2', ingredientName: 'Zalm (rauw)', amount: 180, unit: 'g', calories: 374, protein: 45, carbs: 0, fat: 21.6 },
      { ingredientId: '4', ingredientName: 'Bruine Rijst', amount: 100, unit: 'g', calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
    ],
    totalCalories: 520,
    totalProtein: 48,
    totalCarbs: 45,
    totalFat: 25,
    prepTime: 30,
    servings: 1,
  },
  {
    id: '15',
    name: 'Kip Curry',
    description: 'Kruidige curry met kip, kokosmelk en verse kruiden.',
    mealType: 'Hoofdgerecht',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '1', ingredientName: 'Kipfilet (rauw)', amount: 200, unit: 'g', calories: 330, protein: 62, carbs: 0, fat: 7.2 },
      { ingredientId: '20', ingredientName: 'Kokosmelk', amount: 100, unit: 'ml', calories: 230, protein: 2.3, carbs: 6, fat: 24 },
    ],
    totalCalories: 450,
    totalProtein: 35,
    totalCarbs: 25,
    totalFat: 28,
    prepTime: 40,
    servings: 2,
  },
  {
    id: '16',
    name: 'Protein Pancakes',
    description: 'Eiwitrijke pannenkoeken met banaan en honing.',
    mealType: 'Ontbijt',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '14', ingredientName: 'Eieren', amount: 100, unit: 'g', calories: 155, protein: 13, carbs: 1.1, fat: 11 },
      { ingredientId: '6', ingredientName: 'Havermout', amount: 60, unit: 'g', calories: 233, protein: 10.1, carbs: 39.8, fat: 4.1 },
    ],
    totalCalories: 380,
    totalProtein: 28,
    totalCarbs: 35,
    totalFat: 12,
    prepTime: 20,
    servings: 2,
  },
  {
    id: '17',
    name: 'Tuna Pasta',
    description: 'Snelle pasta met tonijn, knoflook en olijfolie.',
    mealType: 'Lunch',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '15', ingredientName: 'Pasta (volkoren)', amount: 150, unit: 'g', calories: 186, protein: 7.5, carbs: 37.5, fat: 1.7 },
      { ingredientId: '10', ingredientName: 'Tonijn (in water)', amount: 80, unit: 'g', calories: 93, protein: 21, carbs: 0, fat: 0.6 },
    ],
    totalCalories: 420,
    totalProtein: 25,
    totalCarbs: 55,
    totalFat: 15,
    prepTime: 20,
    servings: 1,
  },
  {
    id: '18',
    name: 'Kip Noodle Soup',
    description: 'Verwarmende soep met kip, noedels en groenten.',
    mealType: 'Lunch',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '1', ingredientName: 'Kipfilet (rauw)', amount: 100, unit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    ],
    totalCalories: 280,
    totalProtein: 25,
    totalCarbs: 35,
    totalFat: 8,
    prepTime: 25,
    servings: 1,
  },
  {
    id: '19',
    name: 'Gegrilde Groenten',
    description: 'Kleurrijke mix van gegrilde seizoensgroenten.',
    mealType: 'Snack',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '3', ingredientName: 'Broccoli', amount: 100, unit: 'g', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
      { ingredientId: '16', ingredientName: 'Tomaat', amount: 100, unit: 'g', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
    ],
    totalCalories: 120,
    totalProtein: 8,
    totalCarbs: 15,
    totalFat: 5,
    prepTime: 20,
    servings: 2,
  },
  {
    id: '20',
    name: 'Chocolate Protein Shake',
    description: 'Romige eiwitshake met chocolade en banaan.',
    mealType: 'Snack',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=600&fit=crop',
    ingredients: [
      { ingredientId: '7', ingredientName: 'Banaan', amount: 100, unit: 'g', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      { ingredientId: '9', ingredientName: 'Griekse Yoghurt', amount: 150, unit: 'g', calories: 89, protein: 15, carbs: 5.4, fat: 0.6 },
    ],
    totalCalories: 280,
    totalProtein: 25,
    totalCarbs: 25,
    totalFat: 8,
    prepTime: 5,
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

// Helper function to get image from localStorage
const getImageFromLocalStorage = (imageId: string): string | null => {
  if (!imageId) return null;
  
  try {
    // If it's a localStorage ID, get the actual image
    if (imageId.startsWith('recipe-image-')) {
      return localStorage.getItem(imageId);
    }
    
    // If it's already a base64 string or URL, return it
    return imageId;
  } catch (error) {
    console.error('Error getting image from localStorage:', error);
    return null;
  }
};

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
            {filteredRecipes.map((recipe) => {
              const displayImage = getImageFromLocalStorage(recipe.image);
              return (
                <div key={recipe.id} className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]/40 hover:border-[#8BAE5A]/40 transition-colors">
                  <div className="aspect-video bg-[#3A4D23]/40 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`text-center ${displayImage ? 'hidden' : ''}`}>
                      <span className="text-[#8BAE5A]/60">📷 Foto</span>
                    </div>
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
              );
            })}
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