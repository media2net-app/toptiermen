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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voedingsplannen Beheer</h1>
          <p className="text-gray-600">Beheer voedingsplannen, maaltijden en ingrediënten</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Voedingsplannen</p>
              <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BoltIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Maaltijden</p>
              <p className="text-2xl font-bold text-gray-900">{meals.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <LightBulbIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingrediënten</p>
              <p className="text-2xl font-bold text-gray-900">{foodItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Weekplannen</p>
              <p className="text-2xl font-bold text-gray-900">{weekplans.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Zoek voedingsplannen, maaltijden of ingrediënten..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'voeding' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Ingrediënten</h2>
            <AdminButton onClick={handleAddFoodItem}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nieuw Ingrediënt
            </AdminButton>
          </div>
          
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {['alle', 'fruit', 'eieren', 'noten', 'vlees', 'vis', 'groenten', 'zuivel', 'granen'].map((category) => {
                const categoryCount = category === 'alle' 
                  ? foodItems.length 
                  : foodItems.filter(item => item.category.toLowerCase() === category.toLowerCase()).length;
                
                return (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      categoryFilter === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Ingrediënten laden...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFoodItems.map((item) => (
                <AdminCard
                  key={item.id}
                  title={item.name}
                  description={`${item.calories_per_100g} kcal/100g • ${item.category}`}
                  actions={
                    <div className="flex space-x-2">
                      <AdminButton
                        onClick={() => handleEditFoodItem(item)}
                        variant="secondary"
                        size="sm"
                        icon={PencilIcon}
                      >
                        Bewerk
                      </AdminButton>
                      <AdminButton
                        onClick={() => handleDeleteFoodItem(item.id)}
                        variant="danger"
                        size="sm"
                        icon={TrashIcon}
                      >
                        Verwijder
                      </AdminButton>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'plannen' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Voedingsplannen</h2>
            <AdminButton onClick={handleAddPlan} icon={PlusIcon}>
              Nieuw Plan
            </AdminButton>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Plannen laden...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlans.map((plan) => (
                <AdminCard
                  key={plan.id}
                  title={plan.name}
                  description={plan.description}
                  actions={
                    <div className="flex space-x-2">
                      <AdminButton
                        onClick={() => handleEditPlan(plan)}
                        variant="secondary"
                        size="sm"
                        icon={PencilIcon}
                      >
                        Bewerk
                      </AdminButton>
                      <AdminButton
                        onClick={() => handleDeletePlan(plan.id)}
                        variant="danger"
                        size="sm"
                        icon={TrashIcon}
                      >
                        Verwijder
                      </AdminButton>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'maaltijden' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Maaltijden</h2>
            <div className="flex space-x-2">
              <select
                value={mealsFilter}
                onChange={(e) => setMealsFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="alle">Alle maaltijden</option>
                <option value="ontbijt">Ontbijt</option>
                <option value="lunch">Lunch</option>
                <option value="diner">Diner</option>
                <option value="snack">Snack</option>
              </select>
              <AdminButton onClick={handleAddMeal} icon={PlusIcon}>
                Nieuwe Maaltijd
              </AdminButton>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Maaltijden laden...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMeals.map((meal) => (
                <AdminCard
                  key={meal.id}
                  title={meal.name || 'Naamloze maaltijd'}
                  description={`${meal.meal_type || 'Onbekend type'} • ${meal.nutrition_info?.calories || 0} kcal`}
                  actions={
                    <div className="flex space-x-2">
                      <AdminButton
                        onClick={() => handleEditMeal(meal)}
                        variant="secondary"
                        size="sm"
                        icon={PencilIcon}
                      >
                        Bewerk
                      </AdminButton>
                      <AdminButton
                        onClick={() => handleDeleteMeal(meal.id)}
                        variant="danger"
                        size="sm"
                        icon={TrashIcon}
                      >
                        Verwijder
                      </AdminButton>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'weekplannen' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Weekplannen</h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Weekplannen laden...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWeekplans.map((weekplan) => (
                <AdminCard
                  key={weekplan.id}
                  title={weekplan.name || 'Naamloos weekplan'}
                  description={weekplan.description || 'Geen beschrijving'}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showPlanBuilder && (
        <PlanBuilder
          plan={selectedPlan}
          onSave={handleSavePlan}
          onClose={() => setShowPlanBuilder(false)}
          foodItems={foodItems}
          meals={meals}
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
    </div>
  );
}
