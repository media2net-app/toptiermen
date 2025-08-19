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
  InformationCircleIcon,
  ArrowPathIcon,
  FireIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { createClient } from '@supabase/supabase-js';
import IngredientModal from './components/IngredientModal';
import RecipeBuilder from './components/RecipeBuilder';
import PlanBuilder from './components/PlanBuilder';
import FoodItemModal from './components/FoodItemModal';
import AdminCard from '@/components/admin/AdminCard';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminButton from '@/components/admin/AdminButton';
import { dutchRecipes, dutchIngredients, calculateRecipeNutrition } from '@/lib/dutch-recipes';

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
// Food items will be fetched from database

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
  const [filterDiet, setFilterDiet] = useState('all');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFoodItems, setIsLoadingFoodItems] = useState(true);
  const [migratedPlans, setMigratedPlans] = useState<any[]>([]);
  const [isLoadingMigratedPlans, setIsLoadingMigratedPlans] = useState(true);
  const [dutchRecipesData, setDutchRecipesData] = useState(dutchRecipes);
  const [educationalHubs, setEducationalHubs] = useState<EducationalHub[]>([]);
  const [weeklyMenus, setWeeklyMenus] = useState<WeeklyMenu[]>([]);
  const [autoGeneratedTags, setAutoGeneratedTags] = useState<string[]>([]);
  const [autoGeneratedAllergens, setAutoGeneratedAllergens] = useState<string[]>([]);
  const [selectedIngredientAlternatives, setSelectedIngredientAlternatives] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [selectedDietTags, setSelectedDietTags] = useState<string[]>([]);
  const [selectedFitnessGoal, setSelectedFitnessGoal] = useState<string>('');
  const [hubModalOpen, setHubModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<EducationalHub | null>(null);

  // Helper functie voor afbeelding fallback
  const getRecipeImage = (recipe: any) => {
    if (recipe.image && recipe.image.startsWith('/images/')) {
      return recipe.image;
    }
    return '/images/recipes/default-recipe.jpg';
  };

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

  // Laad gemigreerde frontend plannen
  useEffect(() => {
    const fetchMigratedPlans = async () => {
      try {
        const response = await fetch('/api/admin/migrate-nutrition-plans');
        const data = await response.json();
        
        if (data.success && data.plans) {
          setMigratedPlans(data.plans);
        }
      } catch (error) {
        console.error('Fout bij laden gemigreerde plannen:', error);
      } finally {
        setIsLoadingMigratedPlans(false);
      }
    };

    fetchMigratedPlans();
  }, []);

  // Migreer frontend plannen naar database
  const migrateFrontendPlans = async () => {
    try {
      const response = await fetch('/api/admin/migrate-nutrition-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Herlaad de plannen
        const refreshResponse = await fetch('/api/admin/migrate-nutrition-plans');
        const refreshData = await refreshResponse.json();
        
        if (refreshData.success && refreshData.plans) {
          setMigratedPlans(refreshData.plans);
        }
        
        alert('Frontend plannen succesvol gemigreerd naar database!');
      } else {
        alert('Fout bij migreren van plannen');
      }
    } catch (error) {
      console.error('Fout bij migreren plannen:', error);
      alert('Fout bij migreren van plannen');
    }
  };

  // Food item handlers
  const handleAddFoodItem = () => {
    setSelectedFoodItem(null);
    setShowFoodItemModal(true);
  };

  const handleEditFoodItem = (foodItem: FoodItem) => {
    setSelectedFoodItem(foodItem);
    setShowFoodItemModal(true);
  };

  const handleSaveFoodItem = () => {
    fetchFoodItems(); // Refresh the list
    setShowFoodItemModal(false);
    setSelectedFoodItem(null);
  };

  const handleDeleteFoodItem = async (foodItem: FoodItem) => {
    if (!confirm(`Weet je zeker dat je "${foodItem.name}" wilt verwijderen?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('food_items')
        .delete()
        .eq('id', foodItem.id);

      if (error) {
        console.error('❌ Error deleting food item:', error);
        alert('Fout bij verwijderen van voedingsitem');
        return;
      }

      fetchFoodItems(); // Refresh the list
      alert('Voedingsitem succesvol verwijderd');
    } catch (err) {
      console.error('❌ Exception deleting food item:', err);
      alert('Fout bij verwijderen van voedingsitem');
    }
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

  // Fetch nutrition data from database
  const fetchNutritionData = async () => {
    try {
      setIsLoading(true);

      console.log('📊 Fetching nutrition data from database...');

      // Fetch ingredients
      const ingredientsResponse = await fetch('/api/admin/nutrition-ingredients');
      const ingredientsData = await ingredientsResponse.json();

      if (ingredientsResponse.ok && ingredientsData.success) {
        // Convert database format to component format
        const convertedIngredients: Ingredient[] = ingredientsData.ingredients?.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          calories: item.calories_per_100g,
          protein: item.protein_per_100g,
          carbs: item.carbs_per_100g,
          fat: item.fat_per_100g,
          allergens: [],
          dietTags: [],
          alternatives: []
        })) || [];
        setIngredients(convertedIngredients);
        console.log('✅ Ingredients loaded:', convertedIngredients.length);
      }

      // Fetch recipes
      const recipesResponse = await fetch('/api/admin/nutrition-recipes');
      const recipesData = await recipesResponse.json();

      if (recipesResponse.ok && recipesData.success) {
        // Convert database format to component format
        const convertedRecipes: Recipe[] = recipesData.recipes?.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          mealType: item.meal_type,
          image: item.image_url || 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
          ingredients: [],
          totalCalories: item.calories_per_serving || 0,
          totalProtein: item.protein_per_serving || 0,
          totalCarbs: item.carbs_per_serving || 0,
          totalFat: item.fat_per_serving || 0,
          prepTime: item.prep_time_minutes || 0,
          servings: item.servings,
          dietTags: [],
          allergens: [],
          popularity: 0,
          viewCount: 0
        })) || [];
        setRecipes(convertedRecipes);
        console.log('✅ Recipes loaded:', convertedRecipes.length);
      }

      // Fetch plans
      const plansResponse = await fetch('/api/admin/nutrition-plans');
      const plansData = await plansResponse.json();

      if (plansResponse.ok && plansData.success) {
        // Convert database format to component format
        const convertedPlans: NutritionPlan[] = plansData.plans?.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          meals: [],
          totalCalories: item.target_calories || 0,
          popularity: 0
        })) || [];
        setPlans(convertedPlans);
        console.log('✅ Plans loaded:', convertedPlans.length);
      }

    } catch (error) {
      console.error('❌ Error loading nutrition data:', error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionData();
  }, []);

  // Load Dutch recipes from API
  useEffect(() => {
    const fetchDutchRecipes = async () => {
      try {
        console.log('📊 Fetching Dutch recipes from API...');
        const response = await fetch('/api/admin/dutch-recipes?action=recipes');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setDutchRecipesData(data.data);
          console.log('✅ Dutch recipes loaded:', data.data.length);
        } else {
          console.log('⚠️ Using fallback Dutch recipes:', dutchRecipes.length);
          setDutchRecipesData(dutchRecipes);
        }
      } catch (error) {
        console.error('❌ Error loading Dutch recipes:', error);
        console.log('⚠️ Using fallback Dutch recipes:', dutchRecipes.length);
        setDutchRecipesData(dutchRecipes);
      }
    };

    fetchDutchRecipes();
  }, []);

  const handleAddIngredient = () => {
    setSelectedIngredient(null);
    setShowIngredientModal(true);
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setShowIngredientModal(true);
  };

  const handleSaveIngredient = (ingredient: Ingredient) => {
    if (selectedIngredient) {
      setIngredients(ingredients.map(i => i.id === ingredient.id ? ingredient : i));
    } else {
      setIngredients([...ingredients, { ...ingredient, id: Date.now().toString() }]);
    }
    setShowIngredientModal(false);
    setSelectedIngredient(null);
  };

  const handleAddRecipe = () => {
    setSelectedRecipe(null);
    setShowRecipeBuilder(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeBuilder(true);
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    if (selectedRecipe) {
      setRecipes(recipes.map(r => r.id === recipe.id ? recipe : r));
    } else {
      setRecipes([...recipes, { ...recipe, id: Date.now().toString() }]);
    }
    setShowRecipeBuilder(false);
    setSelectedRecipe(null);
  };

  const handleAddPlan = () => {
    setSelectedPlan(null);
    setShowPlanBuilder(true);
  };

  const handleEditPlan = (plan: NutritionPlan) => {
    setSelectedPlan(plan);
    setShowPlanBuilder(true);
  };

  const handleSavePlan = (plan: NutritionPlan) => {
    if (selectedPlan) {
      setPlans(plans.map(p => p.id === plan.id ? plan : p));
    } else {
      setPlans([...plans, { ...plan, id: Date.now().toString() }]);
    }
    setShowPlanBuilder(false);
    setSelectedPlan(null);
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
    const matchesCategory = !filterCategory || ingredient.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHubs = educationalHubs.filter(hub => 
    hub.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'voeding', label: 'Voeding', count: foodItems.length, icon: '🥗' },
    { id: 'migrated-plans', label: 'Voedingsplannen', count: migratedPlans.length, icon: '📋' },
  ];

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
          value={educationalHubs.length}
          title="Educatieve Hubs"
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="bg-[#232D1A] rounded-2xl p-2 border border-[#3A4D23]">
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
            activeTab === 'dutch-recipes' ? handleAddRecipe : 
            activeTab === 'plans' ? handleAddPlan : 
            activeTab === 'educational-hubs' ? handleAddHub : undefined
          }
          variant="primary"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          {activeTab === 'voeding' && 'Nieuw Voedingsitem'}
          {activeTab === 'dutch-recipes' && 'Nieuw Recept'}
          {activeTab === 'plans' && 'Nieuw Plan'}
          {activeTab === 'ingredients' && 'Nieuw Ingrediënt'}
          {activeTab === 'educational-hubs' && 'Nieuwe Educatieve Hub'}
        </AdminButton>
      </div>

      {/* Content */}
      <AdminCard>
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

        {activeTab === 'dutch-recipes' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]/40">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Zoeken</label>
                  <input
                    type="text"
                    placeholder="Zoek recepten..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white placeholder-[#8BAE5A]/50 focus:outline-none focus:border-[#8BAE5A]"
                  />
                </div>
                <div>
                  <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Maaltijd Type</label>
                  <select
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  >
                    <option value="">Alle maaltijden</option>
                    <option value="ontbijt">Ontbijt</option>
                    <option value="lunch">Lunch</option>
                    <option value="diner">Diner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Keuken</label>
                  <select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  >
                    <option value="">Alle keukens</option>
                    <option value="nederlands">Nederlands</option>
                    <option value="internationaal">Internationaal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Dieet Tags</label>
                  <select
                    multiple
                    value={selectedDietTags}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedDietTags(values);
                    }}
                    className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  >
                    <option value="vegetarisch">Vegetarisch</option>
                    <option value="vegan">Vegan</option>
                    <option value="hoog-eiwit">Hoog Eiwit</option>
                    <option value="keto">Keto</option>
                    <option value="vezelrijk">Vezelrijk</option>
                    <option value="glutenvrij">Glutenvrij</option>
                    <option value="spiermassa">Spiermassa</option>
                    <option value="mager">Mager</option>
                    <option value="laag-calorie">Laag Calorie</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Fitness Doel</label>
                  <select
                    value={selectedFitnessGoal}
                    onChange={(e) => setSelectedFitnessGoal(e.target.value)}
                    className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  >
                    <option value="">Alle doelen</option>
                    <option value="weight-loss">Afvallen</option>
                    <option value="muscle-gain">Spiermassa</option>
                    <option value="maintenance">Onderhoud</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Recipes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dutchRecipesData
                .filter(recipe => {
                  const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                       recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesMealType = !selectedMealType || recipe.mealType === selectedMealType;
                  const matchesCuisine = !selectedCuisine || recipe.cuisine === selectedCuisine;
                  const matchesDietTags = selectedDietTags.length === 0 || 
                    selectedDietTags.some(tag => recipe.dietTags.includes(tag));
                  const matchesFitnessGoal = !selectedFitnessGoal || recipe.fitnessGoal === selectedFitnessGoal;
                  
                  return matchesSearch && matchesMealType && matchesCuisine && matchesDietTags && matchesFitnessGoal;
                })
                .map((recipe) => (
                <div key={recipe.id} className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]/40 hover:border-[#8BAE5A]/40 transition-colors">
                  <div className="aspect-video bg-[#3A4D23]/40 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={getRecipeImage(recipe)}
                      alt={recipe.name}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="text-center hidden">
                      <span className="text-[#8BAE5A]/60 text-4xl">🍽️</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold text-lg">{recipe.name}</h3>
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-white text-sm">{recipe.popularity}</span>
                    </div>
                  </div>
                  
                  <p className="text-[#8BAE5A] text-sm mb-3">{recipe.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-white/80 mb-4">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {recipe.prepTime + recipe.cookTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      {recipe.servings} portie(s)
                    </span>
                    <span className="flex items-center gap-1">
                      <FireIcon className="w-4 h-4" />
                      {recipe.nutrition.calories} kcal
                    </span>
                  </div>
                  
                  {/* Macro's */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-[#232D1A] rounded-lg p-2 text-center">
                      <div className="text-[#8BAE5A] text-xs font-medium">Eiwit</div>
                      <div className="text-white text-sm font-semibold">{recipe.nutrition.protein}g</div>
                    </div>
                    <div className="bg-[#232D1A] rounded-lg p-2 text-center">
                      <div className="text-[#8BAE5A] text-xs font-medium">Koolhydraten</div>
                      <div className="text-white text-sm font-semibold">{recipe.nutrition.carbs}g</div>
                    </div>
                    <div className="bg-[#232D1A] rounded-lg p-2 text-center">
                      <div className="text-[#8BAE5A] text-xs font-medium">Vetten</div>
                      <div className="text-white text-sm font-semibold">{recipe.nutrition.fat}g</div>
                    </div>
                  </div>
                  
                  {/* Diet Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {recipe.dietTags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {recipe.fitnessGoal && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        recipe.fitnessGoal === 'weight-loss' 
                          ? 'bg-red-600 text-white' 
                          : recipe.fitnessGoal === 'muscle-gain'
                          ? 'bg-blue-600 text-white'
                          : 'bg-green-600 text-white'
                      }`}>
                        {recipe.fitnessGoal === 'weight-loss' ? '🏃‍♂️ Afvallen' : 
                         recipe.fitnessGoal === 'muscle-gain' ? '💪 Spiermassa' : 
                         '⚖️ Onderhoud'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <AdminButton
                      onClick={() => {
                        // TODO: Implement edit functionality
                        console.log('Edit recipe:', recipe.id);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Bewerk
                    </AdminButton>
                    <AdminButton
                      onClick={() => {
                        // TODO: Implement view details functionality
                        console.log('View recipe:', recipe.id);
                      }}
                      variant="primary"
                      size="sm"
                    >
                      <InformationCircleIcon className="w-4 h-4 mr-2" />
                      Details
                    </AdminButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const displayImage = getImageFromLocalStorage(recipe.image);
              return (
                <div key={recipe.id} className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]/40 hover:border-[#8BAE5A]/40 transition-colors">
                  <div className="aspect-video bg-[#3A4D23]/40 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
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
              );
            })}
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

        {activeTab === 'migrated-plans' && (
          <div className="space-y-6">
            {/* Migratie Sectie */}
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]/40">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">Voedingsplannen</h3>
                  <p className="text-[#8BAE5A] text-sm">
                    Beheer voedingsplannen en templates voor gebruikers.
                  </p>
                </div>
                <AdminButton
                  onClick={migrateFrontendPlans}
                  variant="primary"
                  size="sm"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Herlaad Plannen
                </AdminButton>
              </div>
              
              {isLoadingMigratedPlans ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto"></div>
                  <p className="text-[#8BAE5A] mt-2">Laden van gemigreerde plannen...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {migratedPlans.map((plan) => (
                    <div key={plan.id} className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23] hover:border-[#8BAE5A]/40 transition-colors">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">{plan.icon}</span>
                        <div>
                          <h4 className="text-white font-semibold">{plan.name}</h4>
                          <p className="text-[#8BAE5A] text-xs">{plan.subtitle}</p>
                        </div>
                      </div>
                      <p className="text-[#8BAE5A]/80 text-sm mb-3">{plan.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {plan.meals?.map((meal: any, index: number) => (
                          <span key={index} className="px-2 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded text-xs">
                            {meal.type}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8BAE5A] text-xs">
                          {plan.meals?.length || 0} maaltijden
                        </span>
                        <div className="flex gap-1">
                          <AdminButton
                            variant="secondary"
                            size="sm"
                          >
                            <PencilIcon className="w-3 h-3 mr-1" />
                            Bewerk
                          </AdminButton>
                          <AdminButton
                            variant="danger"
                            size="sm"
                          >
                            <TrashIcon className="w-3 h-3 mr-1" />
                            Verwijder
                          </AdminButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'voeding' && (
          <div className="space-y-6">
            {/* Voeding Sectie */}
            <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]/40">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-white font-semibold text-xl">Voeding Database</h3>
                  <p className="text-[#8BAE5A] text-sm">
                    Overzicht van alle voedingsmiddelen met voedingswaarden per 100g
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  >
                    <option value="all">Alle categorieën</option>
                    {Array.from(new Set(foodItems.map(item => item.category))).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {isLoadingFoodItems ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto"></div>
                  <p className="text-[#8BAE5A] mt-2">Voedingsitems laden...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {foodItems
                    .filter(item => filterCategory === 'all' || item.category === filterCategory)
                    .filter(item => 
                      searchTerm === '' || 
                      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.category.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item) => (
                      <div key={item.id} className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23] hover:border-[#8BAE5A]/40 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-semibold text-sm">{item.name}</h4>
                          <span className="px-2 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded text-xs">
                            {item.category}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#8BAE5A]">Calorieën:</span>
                            <span className="text-white">{item.calories} kcal</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8BAE5A]">Eiwit:</span>
                            <span className="text-white">{item.protein}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8BAE5A]">Koolhydraten:</span>
                            <span className="text-white">{item.carbs}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8BAE5A]">Vet:</span>
                            <span className="text-white">{item.fat}g</span>
                          </div>
                          {item.fiber > 0 && (
                            <div className="flex justify-between">
                              <span className="text-[#8BAE5A]">Vezels:</span>
                              <span className="text-white">{item.fiber}g</span>
                            </div>
                          )}
                          {item.sugar > 0 && (
                            <div className="flex justify-between">
                              <span className="text-[#8BAE5A]">Suiker:</span>
                              <span className="text-white">{item.sugar}g</span>
                            </div>
                          )}
                          {item.sodium > 0 && (
                            <div className="flex justify-between">
                              <span className="text-[#8BAE5A]">Natrium:</span>
                              <span className="text-white">{item.sodium}mg</span>
                            </div>
                          )}
                        </div>
                        
                        {item.description && (
                          <div className="mt-2 text-xs text-[#B6C948]">
                            {item.description}
                          </div>
                        )}
                        
                        <div className="mt-3 pt-3 border-t border-[#3A4D23]">
                          <div className="flex gap-1">
                            <AdminButton
                              onClick={() => handleEditFoodItem(item)}
                              variant="secondary"
                              size="sm"
                            >
                              <PencilIcon className="w-3 h-3 mr-1" />
                              Bewerk
                            </AdminButton>
                            <AdminButton
                              onClick={() => handleDeleteFoodItem(item)}
                              variant="danger"
                              size="sm"
                            >
                              <TrashIcon className="w-3 h-3 mr-1" />
                              Verwijder
                            </AdminButton>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'educational-hubs' && (
          <div className="space-y-4">
            {filteredHubs.map((hub) => (
              <div key={hub.id} className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]/40 hover:border-[#8BAE5A]/40 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{hub.title}</h3>
                    <p className="text-[#8BAE5A] text-sm">{hub.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <AdminButton
                      onClick={() => handleEditHub(hub)}
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
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <IngredientModal
        isOpen={showIngredientModal}
        onClose={() => setShowIngredientModal(false)}
        onSave={handleSaveIngredient}
        ingredient={selectedIngredient}
        categories={categories}
      />
      <RecipeBuilder
        isOpen={showRecipeBuilder}
        onClose={() => setShowRecipeBuilder(false)}
        onSave={(recipe: BaseRecipe) => {
          // Convert BaseRecipe to Recipe with default values
          const fullRecipe: Recipe = {
            ...recipe,
            dietTags: selectedRecipe?.dietTags || [],
            allergens: selectedRecipe?.allergens || [],
            popularity: selectedRecipe?.popularity || 0.5,
            viewCount: selectedRecipe?.viewCount || 0,
          };
          handleSaveRecipe(fullRecipe);
        }}
        recipe={selectedRecipe}
        ingredients={ingredients}
      />
      <PlanBuilder
        isOpen={showPlanBuilder}
        onClose={() => setShowPlanBuilder(false)}
        onSave={(plan: any) => {
          // Convert to NutritionPlan with default values
          const fullPlan: NutritionPlan = {
            ...plan,
            totalCalories: selectedPlan?.totalCalories || 0,
            popularity: selectedPlan?.popularity || 0.5,
          };
          handleSavePlan(fullPlan);
        }}
        plan={selectedPlan}
        recipes={recipes}
      />
      
      <EducationalHubModal
        isOpen={hubModalOpen}
        onClose={() => setHubModalOpen(false)}
        onSave={handleSaveHub}
        hub={editingHub}
        nutritionPlans={mockNutritionPlans}
      />

      {/* Food Item Modal */}
      <FoodItemModal
        isOpen={showFoodItemModal}
        onClose={() => setShowFoodItemModal(false)}
        foodItem={selectedFoodItem}
        onSave={handleSaveFoodItem}
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

      {/* Food Item Modal */}
      <FoodItemModal
        isOpen={showFoodItemModal}
        onClose={() => setShowFoodItemModal(false)}
        foodItem={selectedFoodItem}
        onSave={handleSaveFoodItem}
      />
    </div>
  );
}