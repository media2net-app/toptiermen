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
import PlanBuilder from './components/PlanBuilder';
import FoodItemModal from './components/FoodItemModal';
import MealModal from '@/components/admin/MealModal';
import WeeklyPlanModal from './components/WeeklyPlanModal';
import AdminCard from '@/components/admin/AdminCard';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminButton from '@/components/admin/AdminButton';

// V1.2: Use regular Supabase client instead of service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types
interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MealStructure {
  mealType: string;
  recipes: string[]; // Recipe IDs
}

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  duration_weeks?: number;
  difficulty?: string;
  goal?: string;
  is_featured?: boolean;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
  meals?: MealStructure[];
}

export default function AdminVoedingsplannenPage() {
  const [activeTab, setActiveTab] = useState('voeding');
  const [categoryFilter, setCategoryFilter] = useState('alle');
  const [mealsFilter, setMealsFilter] = useState('alle');
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [showFoodItemModal, setShowFoodItemModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showWeeklyPlanModal, setShowWeeklyPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [weekplans, setWeekplans] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFoodItems, setIsLoadingFoodItems] = useState(true);

  // Fetch all data on component mount
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setIsLoadingFoodItems(true);
      
      console.log('🥗 Fetching nutrition ingredients from database...');
      
      const response = await fetch('/api/admin/nutrition-ingredients');
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error fetching nutrition ingredients:', result.error);
        return;
      }
      
      setFoodItems(result.ingredients || []);
      console.log('✅ Nutrition ingredients loaded:', result.ingredients?.length || 0);
      
      // Fetch plans
      console.log('📋 Fetching nutrition plans from database...');
      const plansResponse = await fetch('/api/admin/nutrition-plans');
      const plansResult = await plansResponse.json();
      
      if (!plansResponse.ok) {
        console.error('❌ Error fetching nutrition plans:', plansResult.error);
        setPlans([]);
      } else {
        setPlans(plansResult.plans || []);
        console.log('✅ Nutrition plans loaded:', plansResult.plans?.length || 0);
      }
      
      // Fetch meals
      console.log('🍽️ Fetching meals from database...');
      const mealsResponse = await fetch('/api/admin/meals');
      const mealsResult = await mealsResponse.json();
      
      if (!mealsResponse.ok) {
        console.error('❌ Error fetching meals:', mealsResult.error);
        setMeals([]);
      } else {
        setMeals(mealsResult.meals || []);
        console.log('✅ Meals loaded:', mealsResult.meals?.length || 0);
      }
      
      // Fetch weekplans
      console.log('📅 Fetching weekplans from database...');
      const weekplansResponse = await fetch('/api/admin/weekplans');
      const weekplansResult = await weekplansResponse.json();
      
      if (!weekplansResponse.ok) {
        console.error('❌ Error fetching weekplans:', weekplansResult.error);
        setWeekplans([]);
      } else {
        setWeekplans(weekplansResult.weekplans || []);
        console.log('✅ Weekplans loaded:', weekplansResult.weekplans?.length || 0);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingFoodItems(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch food items from database (for refresh)
  const fetchFoodItems = async () => {
    try {
      setIsLoadingFoodItems(true);
      console.log('🥗 Fetching nutrition ingredients from database...');
      
      const response = await fetch('/api/admin/nutrition-ingredients');
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error fetching nutrition ingredients:', result.error);
        return;
      }
      
      setFoodItems(result.ingredients || []);
      console.log('✅ Nutrition ingredients loaded:', result.ingredients?.length || 0);
    } catch (err) {
      console.error('❌ Exception fetching nutrition ingredients:', err);
    } finally {
      setIsLoadingFoodItems(false);
    }
  };

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
    try {
      console.log('💾 Food item saved successfully');
      await fetchAllData(); // Refresh all data
      setShowFoodItemModal(false);
      setSelectedFoodItem(null);
    } catch (error) {
      console.error('❌ Error saving food item:', error);
      alert('Fout bij opslaan van voedingsitem');
    }
  };

  const handleDeleteFoodItem = async (foodItemId: string) => {
    if (!confirm('Weet je zeker dat je dit voedingsitem wilt verwijderen?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting food item:', foodItemId);
      
      const response = await fetch(`/api/admin/nutrition-ingredients?id=${foodItemId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error deleting food item:', result.error);
        alert(`Fout bij verwijderen: ${result.error}`);
        return;
      }

      console.log('✅ Food item deleted successfully:', result);
      await fetchAllData();
      
    } catch (error) {
      console.error('❌ Error deleting food item:', error);
      alert('Fout bij verwijderen van voedingsitem');
    }
  };

  const handleAddPlan = () => {
    setSelectedPlan(null);
    setShowPlanBuilder(true);
  };

  const handleEditPlan = (plan: NutritionPlan) => {
    setSelectedPlan(plan);
    setShowPlanBuilder(true);
  };

  const handleViewWeeklyPlan = (plan: NutritionPlan) => {
    console.log('📅 Viewing weekly plan:', plan);
    setSelectedPlan(plan);
    setShowWeeklyPlanModal(true);
  };

  const handleAddMeal = () => {
    setSelectedMeal(null);
    setShowMealModal(true);
  };

  const handleEditMeal = (meal: any) => {
    setSelectedMeal(meal);
    setShowMealModal(true);
  };

  const handleSaveMeal = async (meal: any) => {
    try {
      console.log('💾 Saving meal:', meal);
      
      const url = meal.id ? '/api/admin/meals' : '/api/admin/meals';
      const method = meal.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meal),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error saving meal:', result.error);
        
        // If database is not available, add to local state (fallback)
        if (result.error && result.error.includes('relation "public.meals" does not exist')) {
          console.log('⚠️ Database table not available, adding to local state...');
          
          const newMeal = {
            ...meal,
            id: meal.id || `local-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          if (meal.id) {
            // Update existing meal in local state
            setMeals(prevMeals => prevMeals.map(m => m.id === meal.id ? newMeal : m));
          } else {
            // Add new meal to local state
            setMeals(prevMeals => [...prevMeals, newMeal]);
          }
          
          console.log('✅ Meal saved to local state');
          setShowMealModal(false);
          setSelectedMeal(null);
          return;
        }
        
        alert(`Fout bij opslaan: ${result.error}`);
        return;
      }

      console.log('✅ Meal saved successfully:', result);
      await fetchAllData();
      setShowMealModal(false);
      setSelectedMeal(null);
      
    } catch (error) {
      console.error('❌ Error saving meal:', error);
      
      // If network error, add to local state (fallback)
      console.log('⚠️ Network error, adding to local state...');
      
      const newMeal = {
        ...meal,
        id: meal.id || `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (meal.id) {
        // Update existing meal in local state
        setMeals(prevMeals => prevMeals.map(m => m.id === meal.id ? newMeal : m));
      } else {
        // Add new meal to local state
        setMeals(prevMeals => [...prevMeals, newMeal]);
      }
      
      console.log('✅ Meal saved to local state');
      setShowMealModal(false);
      setSelectedMeal(null);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Weet je zeker dat je deze maaltijd wilt verwijderen?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting meal:', mealId);
      
      // Try to delete from database first
      const response = await fetch(`/api/admin/meals?id=${mealId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Meal deleted successfully from database:', result);
        await fetchAllData();
      } else {
        // If database delete fails, remove from local state (fallback data)
        console.log('⚠️ Database delete failed, removing from local state...');
        setMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealId));
        console.log('✅ Meal removed from local state');
      }
      
    } catch (error) {
      console.error('❌ Error deleting meal:', error);
      // Remove from local state as fallback
      setMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealId));
      console.log('✅ Meal removed from local state (fallback)');
    }
  };

  const handleSavePlan = async (plan: NutritionPlan) => {
    try {
      console.log('💾 Saving nutrition plan:', plan);
      
      const url = plan.id ? '/api/admin/nutrition-plans' : '/api/admin/nutrition-plans';
      const method = plan.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error saving plan:', result.error);
        alert(`Fout bij opslaan: ${result.error}`);
        return;
      }

      console.log('✅ Plan saved successfully:', result);
      await fetchAllData();
      setShowPlanBuilder(false);
      
    } catch (error) {
      console.error('❌ Error saving plan:', error);
      alert('Fout bij opslaan van plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Weet je zeker dat je dit voedingsplan wilt verwijderen?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting nutrition plan:', planId);
      
      const response = await fetch(`/api/admin/nutrition-plans?id=${planId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error deleting plan:', result.error);
        alert(`Fout bij verwijderen: ${result.error}`);
        return;
      }

      console.log('✅ Plan deleted successfully:', result);
      await fetchAllData();
      
    } catch (error) {
      console.error('❌ Error deleting plan:', error);
      alert('Fout bij verwijderen van plan');
    }
  };

  // Filter data based on search term and category
  const filteredFoodItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'alle' || item.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesFilter = mealsFilter === 'alle' || meal.meal_type === mealsFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredWeekplans = weekplans.filter(weekplan => 
    weekplan.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  );

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Voedingsplannen Beheer</h1>
            <p className="text-[#8BAE5A] text-lg">Beheer voedingsplannen, maaltijden en ingrediënten</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#1F2D17] to-[#2A3D1A] p-6 rounded-lg border border-[#8BAE5A]">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-[#8BAE5A]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[#B6C948]">Voedingsplannen</p>
                <p className="text-2xl font-bold text-white">{plans.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#1F2D17] to-[#2A3D1A] p-6 rounded-lg border border-[#8BAE5A]">
            <div className="flex items-center">
              <BoltIcon className="h-8 w-8 text-[#B6C948]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[#B6C948]">Maaltijden</p>
                <p className="text-2xl font-bold text-white">{meals.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#1F2D17] to-[#2A3D1A] p-6 rounded-lg border border-[#8BAE5A]">
            <div className="flex items-center">
              <LightBulbIcon className="h-8 w-8 text-[#8BAE5A]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[#B6C948]">Ingrediënten</p>
                <p className="text-2xl font-bold text-white">{foodItems.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#1F2D17] to-[#2A3D1A] p-6 rounded-lg border border-[#8BAE5A]">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-[#B6C948]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-[#B6C948]">Weekplannen</p>
                <p className="text-2xl font-bold text-white">{weekplans.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8BAE5A] h-5 w-5" />
            <input
              type="text"
              placeholder="Zoek voedingsplannen, maaltijden of ingrediënten..."
              className="w-full pl-10 pr-4 py-3 bg-[#1F2D17] border border-[#8BAE5A] rounded-lg focus:ring-2 focus:ring-[#B6C948] focus:border-[#B6C948] text-white placeholder-[#8BAE5A]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#8BAE5A] mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'voeding', label: 'Ingrediënten', count: foodItems.length },
              { id: 'plannen', label: 'Voedingsplannen', count: plans.length },
              { id: 'maaltijden', label: 'Maaltijden', count: meals.length },
              { id: 'weekplannen', label: 'Weekplannen', count: weekplans.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#8BAE5A] text-[#8BAE5A]'
                    : 'border-transparent text-gray-400 hover:text-[#B6C948] hover:border-[#B6C948]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'voeding' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Ingrediënten</h2>
              <AdminButton onClick={handleAddFoodItem}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nieuw Ingrediënt
              </AdminButton>
            </div>
          
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {['alle', 'eieren', 'fruit', 'granen', 'groenten', 'natuurlijke-suikers', 'noten', 'vetten', 'vis', 'vlees', 'zuivel'].map((category) => {
                  const categoryCount = category === 'alle' 
                    ? foodItems.length 
                    : foodItems.filter(item => item.category.toLowerCase() === category.toLowerCase()).length;
                  
                  return (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        categoryFilter === category
                          ? 'bg-[#8BAE5A] text-[#141A15] border border-[#8BAE5A]'
                          : 'bg-[#1F2D17] text-[#8BAE5A] border border-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-[#141A15]'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)} ({categoryCount})
                    </button>
                  );
                })}
              </div>
            </div>
            
            {isLoadingFoodItems ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto"></div>
                <p className="mt-2 text-[#8BAE5A]">Ingrediënten laden...</p>
              </div>
            ) : (
            <div className="bg-[#1F2D17] border border-[#8BAE5A] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#2A3D1A] border-b border-[#8BAE5A]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Naam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Categorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Calorieën (per 100g)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Eiwitten (g)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Koolhydraten (g)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Vetten (g)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Acties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#8BAE5A]">
                    {filteredFoodItems.map((item) => (
                      <tr 
                        key={item.id} 
                        className="hover:bg-[#2A3D1A] transition-colors cursor-pointer"
                        onClick={() => handleEditFoodItem(item)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-[#8BAE5A]">{item.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8BAE5A] text-[#141A15]">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {item.calories_per_100g} kcal
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {item.protein_per_100g}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {item.carbs_per_100g}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {item.fat_per_100g}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditFoodItem(item);
                              }}
                              className="text-[#8BAE5A] hover:text-[#B6C948] p-1 hover:bg-[#8BAE5A] hover:bg-opacity-20 rounded"
                              title="Bewerk ingrediënt"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFoodItem(item.id);
                              }}
                              className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900 hover:bg-opacity-20 rounded"
                              title="Verwijder ingrediënt"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

        {activeTab === 'plannen' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Voedingsplannen</h2>
              <AdminButton onClick={handleAddPlan}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nieuw Plan
              </AdminButton>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto"></div>
                <p className="mt-2 text-[#8BAE5A]">Plannen laden...</p>
              </div>
            ) : (
            <div className="bg-[#1F2D17] border border-[#8BAE5A] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#2A3D1A] border-b border-[#8BAE5A]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Naam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Beschrijving
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Acties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#8BAE5A]">
                    {filteredPlans.map((plan) => (
                      <tr 
                        key={plan.id} 
                        className="hover:bg-[#2A3D1A] transition-colors cursor-pointer"
                        onClick={() => handleViewWeeklyPlan(plan)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{plan.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white max-w-xs truncate">
                            {plan.description || 'Geen beschrijving'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#B6C948] text-[#141A15]">
                            {'Standaard'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            true ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                          }`}>
                            {'Actief'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPlan(plan);
                              }}
                              className="text-[#8BAE5A] hover:text-[#B6C948] p-1 hover:bg-[#8BAE5A] hover:bg-opacity-20 rounded"
                              title="Bewerk plan"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePlan(plan.id);
                              }}
                              className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900 hover:bg-opacity-20 rounded"
                              title="Verwijder plan"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

        {activeTab === 'maaltijden' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Maaltijden</h2>
              <div className="flex space-x-2">
                <select
                  value={mealsFilter}
                  onChange={(e) => setMealsFilter(e.target.value)}
                  className="px-3 py-2 bg-[#1F2D17] border border-[#8BAE5A] rounded-lg focus:ring-2 focus:ring-[#B6C948] focus:border-[#B6C948] text-white"
                >
                  <option value="alle">Alle maaltijden</option>
                  <option value="ontbijt">Ontbijt</option>
                  <option value="lunch">Lunch</option>
                  <option value="diner">Diner</option>
                  <option value="snack">Snack</option>
                </select>
                <AdminButton onClick={handleAddMeal}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nieuwe Maaltijd
                </AdminButton>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto"></div>
                <p className="mt-2 text-[#8BAE5A]">Maaltijden laden...</p>
              </div>
            ) : (
            <div className="bg-[#1F2D17] border border-[#8BAE5A] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#2A3D1A] border-b border-[#8BAE5A]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Naam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Calorieën
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Eiwitten (g)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Koolhydraten (g)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Vetten (g)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                        Acties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#8BAE5A]">
                    {filteredMeals.map((meal) => (
                      <tr 
                        key={meal.id} 
                        className="hover:bg-[#2A3D1A] transition-colors cursor-pointer"
                        onClick={() => handleEditMeal(meal)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{meal.name || 'Naamloze maaltijd'}</div>
                          {meal.description && (
                            <div className="text-sm text-[#8BAE5A]">{meal.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8BAE5A] text-[#141A15]">
                            {meal.meal_type || 'Onbekend'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {meal.nutrition_info?.calories || 0} kcal
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {meal.nutrition_info?.protein || 0}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {meal.nutrition_info?.carbs || 0}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {meal.nutrition_info?.fat || 0}g
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMeal(meal);
                              }}
                              className="text-[#8BAE5A] hover:text-[#B6C948] p-1 hover:bg-[#8BAE5A] hover:bg-opacity-20 rounded"
                              title="Bewerk maaltijd"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMeal(meal.id);
                              }}
                              className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900 hover:bg-opacity-20 rounded"
                              title="Verwijder maaltijd"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

        {activeTab === 'weekplannen' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Weekplannen</h2>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto"></div>
                <p className="mt-2 text-[#8BAE5A]">Weekplannen laden...</p>
              </div>
            ) : (
              <div className="bg-[#1F2D17] border border-[#8BAE5A] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-[#2A3D1A] border-b border-[#8BAE5A]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                          Naam
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                          Beschrijving
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#B6C948] uppercase tracking-wider">
                          Acties
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8BAE5A]">
                      {filteredWeekplans.map((weekplan) => (
                        <tr key={weekplan.id} className="hover:bg-[#2A3D1A] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{weekplan.name || 'Naamloos weekplan'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white max-w-xs truncate">
                              {weekplan.description || 'Geen beschrijving'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#B6C948] text-[#141A15]">
                              Concept
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                className="text-[#8BAE5A] hover:text-[#B6C948] p-1 hover:bg-[#8BAE5A] hover:bg-opacity-20 rounded"
                                title="Bewerk"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900 hover:bg-opacity-20 rounded"
                                title="Verwijder"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {showPlanBuilder && (
          <PlanBuilder
            isOpen={showPlanBuilder}
            plan={selectedPlan}
            onSave={handleSavePlan}
            onClose={() => setShowPlanBuilder(false)}

          />
        )}

        {showFoodItemModal && (
          <FoodItemModal
            isOpen={showFoodItemModal}
            foodItem={selectedFoodItem}
            onSave={handleSaveFoodItem}
            onClose={() => setShowFoodItemModal(false)}
          />
        )}

        {showMealModal && (
          <MealModal
            isOpen={showMealModal}
            meal={selectedMeal}
            onSave={handleSaveMeal}
            onClose={() => setShowMealModal(false)}
          />
        )}

        {showWeeklyPlanModal && (
          <WeeklyPlanModal
            isOpen={showWeeklyPlanModal}
            plan={selectedPlan}
            onClose={() => {
              setShowWeeklyPlanModal(false);
              setSelectedPlan(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
