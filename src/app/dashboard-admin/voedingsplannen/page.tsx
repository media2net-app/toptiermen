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
  CogIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
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
  allergens?: string[];
  dietTags?: string[];
  alternatives?: string[]; // Alternative ingredient IDs
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

// Base Recipe interface for compatibility with existing components
interface BaseRecipe {
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

// Extended Recipe interface with new features
interface Recipe extends BaseRecipe {
  macroGoals?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  dietTags: string[];
  allergens: string[];
  popularity: number;
  viewCount: number;
}

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  meals: MealStructure[];
  totalCalories: number;
  popularity: number;
}

interface MealStructure {
  mealType: string;
  recipes: string[]; // Recipe IDs
}

interface WeeklyMenu {
  id: string;
  name: string;
  description: string;
  days: DayMenu[];
  totalCalories: number;
  targetCalories: number;
  dietTemplate: string;
  exclusions: string[];
  shoppingList: ShoppingItem[];
}

interface DayMenu {
  day: string;
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string[];
  };
}

interface ShoppingItem {
  ingredient: string;
  amount: number;
  unit: string;
  category: string;
}

interface Analytics {
  popularRecipes: PopularRecipe[];
  popularPlans: PopularPlan[];
  unpopularIngredients: UnpopularIngredient[];
  macroTrends: MacroTrend[];
}

interface PopularRecipe {
  id: string;
  name: string;
  viewCount: number;
  popularity: number;
  mealType: string;
}

interface PopularPlan {
  name: string;
  usage: number;
  percentage: number;
}

interface UnpopularIngredient {
  name: string;
  usageCount: number;
  lastUsed: string;
  category: string;
}

interface MacroTrend {
  macro: string;
  averageValue: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

// New Educational Hub interfaces
interface EducationalHub {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  author: string;
  authorImage: string;
  authorBio: string;
  philosophy: string;
  videoUrl?: string;
  imageUrl: string;
  doItems: string[];
  dontItems: string[];
  linkedPlanId: string;
  forumLink: string;
  faqs: FAQ[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  popularity: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
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
    dietTags: ['High Protein', 'Low Carb', 'Gluten Free'],
    allergens: [],
    popularity: 0.9,
    viewCount: 1247,
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
    dietTags: ['Vegetarian', 'High Fiber'],
    allergens: ['Gluten'],
    popularity: 0.85,
    viewCount: 892,
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
    dietTags: ['High Protein', 'Gluten Free', 'Pescatarian'],
    allergens: ['Fish'],
    popularity: 0.78,
    viewCount: 567,
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
    dietTags: ['High Protein', 'Low Fat', 'Vegetarian'],
    allergens: ['Dairy'],
    popularity: 0.92,
    viewCount: 1456,
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
    dietTags: ['High Protein', 'Low Carb'],
    allergens: ['Gluten', 'Dairy'],
    popularity: 0.75,
    viewCount: 423,
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
    dietTags: ['High Carb', 'Vegetarian'],
    allergens: ['Gluten'],
    popularity: 0.68,
    viewCount: 298,
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
    dietTags: ['Vegan', 'High Fiber'],
    allergens: ['Nuts'],
    popularity: 0.88,
    viewCount: 1123,
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
    dietTags: ['High Protein', 'Pescatarian'],
    allergens: ['Fish', 'Gluten'],
    popularity: 0.72,
    viewCount: 456,
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
    dietTags: ['High Protein', 'Low Carb', 'Gluten Free'],
    allergens: ['Soy'],
    popularity: 0.81,
    viewCount: 634,
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
    dietTags: ['Vegetarian', 'High Fat'],
    allergens: ['Eggs', 'Gluten'],
    popularity: 0.95,
    viewCount: 1892,
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
    dietTags: ['High Protein', 'Gluten Free'],
    allergens: [],
    popularity: 0.87,
    viewCount: 756,
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
    totalCalories: 280,
    totalProtein: 12,
    totalCarbs: 35,
    totalFat: 8,
    prepTime: 20,
    servings: 1,
    dietTags: ['Vegetarian', 'Vegan', 'Gluten Free'],
    allergens: [],
    popularity: 0.73,
    viewCount: 389,
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
    dietTags: ['High Protein', 'Low Carb', 'Vegetarian'],
    allergens: ['Eggs', 'Dairy'],
    popularity: 0.82,
    viewCount: 678,
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
    dietTags: ['High Protein', 'Pescatarian'],
    allergens: ['Fish', 'Soy'],
    popularity: 0.76,
    viewCount: 445,
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
    dietTags: ['High Protein', 'Gluten Free'],
    allergens: [],
    popularity: 0.84,
    viewCount: 723,
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
    dietTags: ['High Protein', 'Vegetarian'],
    allergens: ['Eggs', 'Gluten'],
    popularity: 0.91,
    viewCount: 1567,
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
    dietTags: ['High Protein', 'Pescatarian'],
    allergens: ['Fish', 'Gluten'],
    popularity: 0.69,
    viewCount: 334,
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
    dietTags: ['High Protein', 'Low Fat'],
    allergens: ['Gluten'],
    popularity: 0.71,
    viewCount: 412,
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
    dietTags: ['Vegan', 'Vegetarian', 'Gluten Free', 'Low Calorie'],
    allergens: [],
    popularity: 0.65,
    viewCount: 267,
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
    dietTags: ['High Protein', 'Vegetarian'],
    allergens: ['Dairy'],
    popularity: 0.89,
    viewCount: 1345,
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
    totalCalories: 1500,
    popularity: 0.8,
  },
];

// Mock Weekly Menus
const mockWeeklyMenus: WeeklyMenu[] = [
  {
    id: '1',
    name: 'Gebalanceerd Weekmenu - 2500 kcal',
    description: 'Een uitgebalanceerd weekmenu voor actieve mannen',
    days: [
      {
        day: 'Maandag',
        meals: {
          breakfast: '1',
          lunch: '5',
          dinner: '3',
          snacks: ['20']
        }
      },
      {
        day: 'Dinsdag',
        meals: {
          breakfast: '2',
          lunch: '8',
          dinner: '11',
          snacks: ['19']
        }
      },
      {
        day: 'Woensdag',
        meals: {
          breakfast: '4',
          lunch: '12',
          dinner: '15',
          snacks: ['20']
        }
      },
      {
        day: 'Donderdag',
        meals: {
          breakfast: '7',
          lunch: '17',
          dinner: '9',
          snacks: ['19']
        }
      },
      {
        day: 'Vrijdag',
        meals: {
          breakfast: '10',
          lunch: '6',
          dinner: '14',
          snacks: ['20']
        }
      },
      {
        day: 'Zaterdag',
        meals: {
          breakfast: '16',
          lunch: '18',
          dinner: '1',
          snacks: ['19']
        }
      },
      {
        day: 'Zondag',
        meals: {
          breakfast: '13',
          lunch: '5',
          dinner: '3',
          snacks: ['20']
        }
      }
    ],
    totalCalories: 17500,
    targetCalories: 17500,
    dietTemplate: 'Gebalanceerd Dieet',
    exclusions: ['Vis'],
    shoppingList: [
      { ingredient: 'Kipfilet', amount: 1400, unit: 'g', category: 'Vlees' },
      { ingredient: 'Broccoli', amount: 800, unit: 'g', category: 'Groente' },
      { ingredient: 'Havermout', amount: 400, unit: 'g', category: 'Granen' },
      { ingredient: 'Banaan', amount: 700, unit: 'g', category: 'Fruit' },
      { ingredient: 'Griekse Yoghurt', amount: 1000, unit: 'g', category: 'Zuivel' },
      { ingredient: 'Eieren', amount: 12, unit: 'stuks', category: 'Zuivel' },
      { ingredient: 'Avocado', amount: 4, unit: 'stuks', category: 'Fruit' },
      { ingredient: 'Quinoa', amount: 300, unit: 'g', category: 'Granen' },
      { ingredient: 'Spinazie', amount: 200, unit: 'g', category: 'Groente' },
      { ingredient: 'Olijfolie', amount: 100, unit: 'ml', category: 'Vetten' },
    ]
  }
];

// Mock Analytics Data
const mockAnalytics: Analytics = {
  popularRecipes: [
    { id: '10', name: 'Avocado Toast', viewCount: 1892, popularity: 0.95, mealType: 'Ontbijt' },
    { id: '4', name: 'Griekse Yoghurt Bowl', viewCount: 1456, popularity: 0.92, mealType: 'Ontbijt' },
    { id: '1', name: 'Gegrilde Kipfilet met Broccoli', viewCount: 1247, popularity: 0.9, mealType: 'Hoofdgerecht' },
    { id: '16', name: 'Protein Pancakes', viewCount: 1567, popularity: 0.91, mealType: 'Ontbijt' },
    { id: '20', name: 'Chocolate Protein Shake', viewCount: 1345, popularity: 0.89, mealType: 'Snack' },
    { id: '7', name: 'Smoothie Bowl', viewCount: 1123, popularity: 0.88, mealType: 'Ontbijt' },
    { id: '11', name: 'Gegrilde Kipfilet met Zoete Aardappel', viewCount: 756, popularity: 0.87, mealType: 'Hoofdgerecht' },
    { id: '2', name: 'Havermout met Banaan en Noten', viewCount: 892, popularity: 0.85, mealType: 'Ontbijt' },
    { id: '15', name: 'Kip Curry', viewCount: 723, popularity: 0.84, mealType: 'Hoofdgerecht' },
    { id: '13', name: 'Omelet met Groenten', viewCount: 678, popularity: 0.82, mealType: 'Ontbijt' },
  ],
  popularPlans: [
    { name: 'Gebalanceerd Dieet', usage: 45, percentage: 35 },
    { name: 'High Protein', usage: 32, percentage: 25 },
    { name: 'Low Carb', usage: 18, percentage: 14 },
    { name: 'Vegetarisch', usage: 15, percentage: 12 },
    { name: 'Vegan', usage: 8, percentage: 6 },
    { name: 'Keto', usage: 6, percentage: 5 },
    { name: 'Paleo', usage: 4, percentage: 3 },
  ],
  unpopularIngredients: [
    { name: 'Spruitjes', usageCount: 2, lastUsed: '2024-01-05', category: 'Groente' },
    { name: 'Rode Biet', usageCount: 3, lastUsed: '2024-01-08', category: 'Groente' },
    { name: 'Rabarber', usageCount: 1, lastUsed: '2024-01-02', category: 'Fruit' },
    { name: 'Koolraap', usageCount: 2, lastUsed: '2024-01-10', category: 'Groente' },
    { name: 'Pastinaak', usageCount: 4, lastUsed: '2024-01-12', category: 'Groente' },
  ],
  macroTrends: [
    { macro: 'Protein', averageValue: 28.5, trend: 'up', change: 5.2 },
    { macro: 'Carbs', averageValue: 45.2, trend: 'down', change: -3.1 },
    { macro: 'Fat', averageValue: 18.8, trend: 'stable', change: 0.5 },
    { macro: 'Calories', averageValue: 1850, trend: 'up', change: 2.3 },
  ],
};

const categories = ['Vlees', 'Vis', 'Groente', 'Granen', 'Vetten', 'Fruit', 'Zuivel', 'Noten & Zaden'];

// Mock Educational Hubs Data
const mockEducationalHubs: EducationalHub[] = [
  {
    id: '1',
    title: 'Ontdek de Carnivoor Lifestyle',
    subtitle: 'Rick\'s Persoonlijke Aanpak voor Optimale Gezondheid',
    description: 'Een complete gids voor het carnivoor dieet, gebaseerd op Rick\'s persoonlijke ervaringen en wetenschappelijke inzichten.',
    author: 'Rick Cuijpers',
    authorImage: '/profielfoto.png',
    authorBio: 'Rick is de oprichter van Top Tier Men en heeft het carnivoor dieet geïntegreerd in zijn dagelijkse routine voor optimale prestaties en gezondheid.',
    philosophy: 'Het carnivoor dieet is meer dan alleen een voedingspatroon - het is een lifestyle die teruggaat naar onze evolutionaire wortels. Door alleen dierlijke producten te consumeren, elimineren we ontstekingsbevorderende stoffen en geven we ons lichaam de pure, hoogwaardige voedingsstoffen die het nodig heeft om te gedijen.',
    videoUrl: '/welkom-v2.MP4',
    imageUrl: '/images/mind/1.png',
    doItems: [
      'Rood vlees (rund, lam, wild)',
      'Gevogelte (kip, kalkoen, eend)',
      'Vis en zeevruchten',
      'Eieren (vooral dooiers)',
      'Dierlijke vetten (boter, reuzel, talg)',
      'Orgaanvlees (lever, hart, nieren)',
      'Bottenbouillon',
      'Zout en mineralen'
    ],
    dontItems: [
      'Alle groenten en fruit',
      'Granen en zaden',
      'Plantaardige oliën',
      'Suiker en zoetstoffen',
      'Peulvruchten',
      'Noten en pitten',
      'Zuivel (behalve boter)',
      'Verwerkte voedingsmiddelen'
    ],
    linkedPlanId: 'carnivore-weekmenu',
    forumLink: '/dashboard/brotherhood/forum/carnivoor-lifestyle',
    faqs: [
      {
        id: '1',
        question: 'Hoe zit het met vitamines en mineralen?',
        answer: 'Dierlijke producten bevatten alle essentiële vitamines en mineralen in hun meest bio-beschikbare vorm. Orgaanvlees is bijzonder rijk aan vitamine A, B-vitamines, ijzer en andere micronutriënten. Zout en mineralen supplementen kunnen helpen bij de overgang.',
        category: 'Voeding'
      },
      {
        id: '2',
        question: 'Kan ik nog koffie drinken?',
        answer: 'Ja, koffie is toegestaan in het carnivoor dieet. Het bevat geen koolhydraten en kan helpen bij de overgang. Sommige mensen ervaren echter dat hun koffie-intolerantie verdwijnt na verloop van tijd.',
        category: 'Dranken'
      },
      {
        id: '3',
        question: 'Wat zijn de meest voorkomende beginnersfouten?',
        answer: '1) Niet genoeg vet eten - vet is je primaire energiebron. 2) Te weinig zout - je verliest meer zout zonder koolhydraten. 3) Te snel overgaan - bouw geleidelijk af. 4) Niet genoeg water drinken.',
        category: 'Tips'
      },
      {
        id: '4',
        question: 'Hoe ga ik om met sociale situaties?',
        answer: 'Wees voorbereid en communiceer duidelijk. Neem je eigen eten mee naar feestjes, eet vooraf, of kies restaurants waar je vlees kunt bestellen. Focus op je doelen en herinner jezelf waarom je dit doet.',
        category: 'Lifestyle'
      },
      {
        id: '5',
        question: 'Hoe lang duurt de overgang?',
        answer: 'De meeste mensen ervaren de "keto flu" in de eerste 1-2 weken. Na 3-4 weken voelen de meeste mensen zich energiek en stabiel. Het kan 6-8 weken duren voordat je volledig aangepast bent.',
        category: 'Overgang'
      },
      {
        id: '6',
        question: 'Is dit veilig op lange termijn?',
        answer: 'Het carnivoor dieet is veilig en wordt al duizenden jaren door verschillende culturen gevolgd. Moderne wetenschap ondersteunt de voordelen van een dierlijk-gebaseerd dieet voor veel mensen.',
        category: 'Gezondheid'
      }
    ],
    status: 'published',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    viewCount: 2347,
    popularity: 0.94
  },
  {
    id: '2',
    title: 'Keto voor Kracht',
    subtitle: 'Maximaliseer je Prestaties met Ketose',
    description: 'Een uitgebreide gids voor het ketogeen dieet, specifiek gericht op atleten en actieve mannen.',
    author: 'Rick Cuijpers',
    authorImage: '/profielfoto.png',
    authorBio: 'Rick heeft jarenlange ervaring met ketogene voeding en heeft dit geïntegreerd in zijn trainingsprogramma\'s.',
    philosophy: 'Ketose is een natuurlijke metabole staat die je lichaam in staat stelt om vet als primaire brandstof te gebruiken, wat leidt tot verbeterde mentale helderheid, stabiele energie en optimale prestaties.',
    imageUrl: '/images/mind/2.png',
    doItems: [
      'Vette vis en vlees',
      'Eieren en zuivel',
      'Noten en zaden',
      'Lage-koolhydraat groenten',
      'Gezonde vetten',
      'Avocado en olijven'
    ],
    dontItems: [
      'Suiker en zoetstoffen',
      'Granen en zetmeel',
      'Fruit (behalve bessen)',
      'Peulvruchten',
      'Verwerkte voedingsmiddelen'
    ],
    linkedPlanId: 'keto-weekmenu',
    forumLink: '/dashboard/brotherhood/forum/keto-lifestyle',
    faqs: [
      {
        id: '1',
        question: 'Hoe meet ik of ik in ketose ben?',
        answer: 'Je kunt ketose meten met bloedmeters, ademanalysers of urinestrips. Bloedmeters zijn het meest accuraat maar duurder.',
        category: 'Monitoring'
      }
    ],
    status: 'draft',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
    viewCount: 0,
    popularity: 0
  }
];

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
  const [activeTab, setActiveTab] = useState<'recipes' | 'plans' | 'ingredients' | 'intelligent-builder' | 'meal-planner' | 'analytics' | 'educational-hubs'>('recipes');
  const [ingredients, setIngredients] = useState<Ingredient[]>(mockIngredients);
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>(mockNutritionPlans);
  const [weeklyMenus, setWeeklyMenus] = useState<WeeklyMenu[]>(mockWeeklyMenus);
  const [educationalHubs, setEducationalHubs] = useState<EducationalHub[]>(mockEducationalHubs);
  const [analytics] = useState<Analytics>(mockAnalytics);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<NutritionPlan | null>(null);
  const [hubModalOpen, setHubModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<EducationalHub | null>(null);
  
  // New states for intelligent features
  const [showMacroGoals, setShowMacroGoals] = useState(false);
  const [macroGoals, setMacroGoals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [selectedIngredientAlternatives, setSelectedIngredientAlternatives] = useState<string | null>(null);
  const [autoGeneratedTags, setAutoGeneratedTags] = useState<string[]>([]);
  const [autoGeneratedAllergens, setAutoGeneratedAllergens] = useState<string[]>([]);

  const handleAddIngredient = () => {
    setEditingIngredient(null);
    setIngredientModalOpen(true);
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setIngredientModalOpen(true);
  };

  const handleSaveIngredient = (ingredient: Ingredient) => {
    if (editingIngredient) {
      setIngredients(ingredients.map(i => i.id === ingredient.id ? ingredient : i));
    } else {
      setIngredients([...ingredients, { ...ingredient, id: Date.now().toString() }]);
    }
    setIngredientModalOpen(false);
    setEditingIngredient(null);
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
    if (editingRecipe) {
      setRecipes(recipes.map(r => r.id === recipe.id ? recipe : r));
    } else {
      setRecipes([...recipes, { ...recipe, id: Date.now().toString() }]);
    }
    setRecipeModalOpen(false);
    setEditingRecipe(null);
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
    if (editingPlan) {
      setNutritionPlans(nutritionPlans.map(p => p.id === plan.id ? plan : p));
    } else {
      setNutritionPlans([...nutritionPlans, { ...plan, id: Date.now().toString() }]);
    }
    setPlanModalOpen(false);
    setEditingPlan(null);
  };

  // New handlers for Educational Hubs
  const handleAddHub = () => {
    setEditingHub(null);
    setHubModalOpen(true);
  };

  const handleEditHub = (hub: EducationalHub) => {
    setEditingHub(hub);
    setHubModalOpen(true);
  };

  const handleSaveHub = (hub: EducationalHub) => {
    if (editingHub) {
      setEducationalHubs(educationalHubs.map(h => h.id === hub.id ? hub : h));
    } else {
      setEducationalHubs([...educationalHubs, { ...hub, id: Date.now().toString() }]);
    }
    setHubModalOpen(false);
    setEditingHub(null);
  };

  // New handlers for intelligent features
  const handleGenerateWeeklyMenu = () => {
    // This would integrate with the meal planner logic
    console.log('Generating weekly menu...');
  };

  const handleAutoTagRecipe = (recipeIngredients: RecipeIngredient[]) => {
    const allTags = new Set<string>();
    const allAllergens = new Set<string>();
    
    recipeIngredients.forEach(recipeIngredient => {
      const ingredientData = ingredients.find(i => i.id === recipeIngredient.ingredientId);
      if (ingredientData) {
        ingredientData.dietTags?.forEach((tag: string) => allTags.add(tag));
        ingredientData.allergens?.forEach((allergen: string) => allAllergens.add(allergen));
      }
    });
    
    setAutoGeneratedTags(Array.from(allTags));
    setAutoGeneratedAllergens(Array.from(allAllergens));
  };

  const handleShowAlternatives = (ingredientId: string) => {
    setSelectedIngredientAlternatives(ingredientId);
  };

  // Filter functions
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

  const filteredHubs = educationalHubs.filter(hub => 
    hub.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'recipes', label: 'Recepten Bibliotheek', count: recipes.length, icon: '🍳' },
    { id: 'plans', label: 'Voedingsplan Templates', count: nutritionPlans.length, icon: '📋' },
    { id: 'ingredients', label: 'Ingrediënten Database', count: ingredients.length, icon: '🥕' },
    { id: 'intelligent-builder', label: 'Intelligente Recept Bouwer', count: 0, icon: '🧠' },
    { id: 'meal-planner', label: 'Automatische Maaltijdplanner', count: weeklyMenus.length, icon: '⚡' },
    { id: 'analytics', label: 'Analytics', count: 0, icon: '📊' },
    { id: 'educational-hubs', label: 'Educatieve Hubs', count: educationalHubs.length, icon: '🎓' },
  ];

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
          {tabs.map((tab) => (
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
          onClick={activeTab === 'ingredients' ? handleAddIngredient : activeTab === 'recipes' ? handleAddRecipe : activeTab === 'plans' ? handleAddPlan : activeTab === 'educational-hubs' ? handleAddHub : undefined}
        >
          <PlusIcon className="w-5 h-5" />
          {activeTab === 'recipes' && 'Nieuw Recept'}
          {activeTab === 'plans' && 'Nieuw Plan'}
          {activeTab === 'ingredients' && 'Nieuw Ingrediënt'}
          {activeTab === 'educational-hubs' && 'Nieuwe Educatieve Hub'}
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

        {activeTab === 'educational-hubs' && (
          <div className="space-y-4">
            {filteredHubs.map((hub) => (
              <div key={hub.id} className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]/40 hover:border-[#8BAE5A]/40 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{hub.title}</h3>
                    <p className="text-[#8BAE5A] text-sm">{hub.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-3 py-2 bg-[#8BAE5A] text-black rounded-lg text-sm font-medium hover:bg-[#A6C97B] transition-colors" onClick={() => handleEditHub(hub)}>
                      <PencilIcon className="w-4 h-4" />
                      Bewerk
                    </button>
                    <button className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
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
        onSave={(recipe: BaseRecipe) => {
          // Convert BaseRecipe to Recipe with default values
          const fullRecipe: Recipe = {
            ...recipe,
            dietTags: editingRecipe?.dietTags || [],
            allergens: editingRecipe?.allergens || [],
            popularity: editingRecipe?.popularity || 0.5,
            viewCount: editingRecipe?.viewCount || 0,
          };
          handleSaveRecipe(fullRecipe);
        }}
        recipe={editingRecipe}
        ingredients={ingredients}
      />
      <PlanBuilder
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onSave={(plan: any) => {
          // Convert to NutritionPlan with default values
          const fullPlan: NutritionPlan = {
            ...plan,
            totalCalories: editingPlan?.totalCalories || 0,
            popularity: editingPlan?.popularity || 0.5,
          };
          handleSavePlan(fullPlan);
        }}
        plan={editingPlan}
        recipes={recipes}
      />
      
      <EducationalHubModal
        isOpen={hubModalOpen}
        onClose={() => setHubModalOpen(false)}
        onSave={handleSaveHub}
        hub={editingHub}
        nutritionPlans={nutritionPlans}
      />
    </div>
  );
}

// Educational Hub Modal Component
interface EducationalHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hub: EducationalHub) => void;
  hub: EducationalHub | null;
  nutritionPlans: NutritionPlan[];
}

function EducationalHubModal({ isOpen, onClose, onSave, hub, nutritionPlans }: EducationalHubModalProps) {
  const [formData, setFormData] = useState<Partial<EducationalHub>>({
    title: '',
    subtitle: '',
    description: '',
    author: 'Rick Cuijpers',
    authorImage: '/profielfoto.png',
    authorBio: '',
    philosophy: '',
    videoUrl: '',
    imageUrl: '',
    doItems: [],
    dontItems: [],
    linkedPlanId: '',
    forumLink: '',
    faqs: [],
    status: 'draft'
  });
  const [newDoItem, setNewDoItem] = useState('');
  const [newDontItem, setNewDontItem] = useState('');
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', category: '' });

  useEffect(() => {
    if (hub) {
      setFormData(hub);
    } else {
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        author: 'Rick Cuijpers',
        authorImage: '/profielfoto.png',
        authorBio: '',
        philosophy: '',
        videoUrl: '',
        imageUrl: '',
        doItems: [],
        dontItems: [],
        linkedPlanId: '',
        forumLink: '',
        faqs: [],
        status: 'draft'
      });
    }
  }, [hub]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hubData: EducationalHub = {
      id: hub?.id || Date.now().toString(),
      title: formData.title || '',
      subtitle: formData.subtitle || '',
      description: formData.description || '',
      author: formData.author || 'Rick Cuijpers',
      authorImage: formData.authorImage || '/profielfoto.png',
      authorBio: formData.authorBio || '',
      philosophy: formData.philosophy || '',
      videoUrl: formData.videoUrl,
      imageUrl: formData.imageUrl || '',
      doItems: formData.doItems || [],
      dontItems: formData.dontItems || [],
      linkedPlanId: formData.linkedPlanId || '',
      forumLink: formData.forumLink || '',
      faqs: formData.faqs || [],
      status: formData.status || 'draft',
      createdAt: hub?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: hub?.viewCount || 0,
      popularity: hub?.popularity || 0
    };
    onSave(hubData);
  };

  const addDoItem = () => {
    if (newDoItem.trim()) {
      setFormData(prev => ({
        ...prev,
        doItems: [...(prev.doItems || []), newDoItem.trim()]
      }));
      setNewDoItem('');
    }
  };

  const removeDoItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      doItems: prev.doItems?.filter((_, i) => i !== index) || []
    }));
  };

  const addDontItem = () => {
    if (newDontItem.trim()) {
      setFormData(prev => ({
        ...prev,
        dontItems: [...(prev.dontItems || []), newDontItem.trim()]
      }));
      setNewDontItem('');
    }
  };

  const removeDontItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dontItems: prev.dontItems?.filter((_, i) => i !== index) || []
    }));
  };

  const addFAQ = () => {
    if (newFAQ.question.trim() && newFAQ.answer.trim()) {
      setFormData(prev => ({
        ...prev,
        faqs: [...(prev.faqs || []), { ...newFAQ, id: Date.now().toString() }]
      }));
      setNewFAQ({ question: '', answer: '', category: '' });
    }
  };

  const removeFAQ = (id: string) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs?.filter(faq => faq.id !== id) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181F17] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#3A4D23]">
          <h2 className="text-white text-xl font-semibold">
            {hub ? 'Bewerk Educatieve Hub' : 'Nieuwe Educatieve Hub'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Titel</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Subtitel</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Beschrijving</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
              required
            />
          </div>

          {/* Author Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Auteur</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Auteur Afbeelding URL</label>
              <input
                type="text"
                value={formData.authorImage}
                onChange={(e) => setFormData(prev => ({ ...prev, authorImage: e.target.value }))}
                className="w-full px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Auteur Bio</label>
            <textarea
              value={formData.authorBio}
              onChange={(e) => setFormData(prev => ({ ...prev, authorBio: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
            />
          </div>

          {/* Philosophy */}
          <div>
            <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Filosofie</label>
            <textarea
              value={formData.philosophy}
              onChange={(e) => setFormData(prev => ({ ...prev, philosophy: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
              placeholder="Uitleg van de kernfilosofie achter deze lifestyle..."
            />
          </div>

          {/* Media URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Video URL (optioneel)</label>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                className="w-full px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                placeholder="/videos/intro.mp4"
              />
            </div>
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Hoofdafbeelding URL</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                placeholder="/images/hub-header.jpg"
              />
            </div>
          </div>

          {/* Do's and Don'ts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">✅ Wat je eet (Do's)</label>
              <div className="space-y-2">
                {formData.doItems?.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-white text-sm flex-1">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeDoItem(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDoItem}
                    onChange={(e) => setNewDoItem(e.target.value)}
                    placeholder="Voeg een do-item toe..."
                    className="flex-1 px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={addDoItem}
                    className="px-3 py-2 bg-[#8BAE5A] text-black rounded-lg text-sm font-medium hover:bg-[#A6C97B] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">❌ Wat je vermijdt (Don'ts)</label>
              <div className="space-y-2">
                {formData.dontItems?.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-white text-sm flex-1">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeDontItem(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDontItem}
                    onChange={(e) => setNewDontItem(e.target.value)}
                    placeholder="Voeg een don't-item toe..."
                    className="flex-1 px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={addDontItem}
                    className="px-3 py-2 bg-[#8BAE5A] text-black rounded-lg text-sm font-medium hover:bg-[#A6C97B] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Gekoppeld Voedingsplan</label>
              <select
                value={formData.linkedPlanId}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedPlanId: e.target.value }))}
                className="w-full px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
              >
                <option value="">Selecteer een voedingsplan</option>
                {nutritionPlans.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Forum Link</label>
              <input
                type="text"
                value={formData.forumLink}
                onChange={(e) => setFormData(prev => ({ ...prev, forumLink: e.target.value }))}
                className="w-full px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                placeholder="/dashboard/brotherhood/forum/lifestyle"
              />
            </div>
          </div>

          {/* FAQs */}
          <div>
            <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Veelgestelde Vragen</label>
            <div className="space-y-4">
              {formData.faqs?.map((faq) => (
                <div key={faq.id} className="bg-[#2A2F2A] p-4 rounded-lg border border-[#3A4D23]">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white font-medium text-sm">{faq.question}</span>
                    <button
                      type="button"
                      onClick={() => removeFAQ(faq.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm">{faq.answer}</p>
                  <span className="text-[#8BAE5A] text-xs">{faq.category}</span>
                </div>
              ))}
              
              <div className="bg-[#2A2F2A] p-4 rounded-lg border border-[#3A4D23]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    value={newFAQ.question}
                    onChange={(e) => setNewFAQ(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Vraag..."
                    className="px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    value={newFAQ.category}
                    onChange={(e) => setNewFAQ(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Categorie..."
                    className="px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={addFAQ}
                    className="px-3 py-2 bg-[#8BAE5A] text-black rounded-lg text-sm font-medium hover:bg-[#A6C97B] transition-colors"
                  >
                    FAQ Toevoegen
                  </button>
                </div>
                <textarea
                  value={newFAQ.answer}
                  onChange={(e) => setNewFAQ(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Antwoord..."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
              className="w-full px-3 py-2 bg-[#2A2F2A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
            >
              <option value="draft">Concept</option>
              <option value="published">Gepubliceerd</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[#3A4D23]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#8BAE5A] hover:text-[#A6C97B] transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] text-black font-semibold rounded-lg hover:from-[#A6C97B] hover:to-[#8BAE5A] transition-all"
            >
              {hub ? 'Bijwerken' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 