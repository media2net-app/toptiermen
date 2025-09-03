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
      
      // Fetch nutrition plans from database
      console.log('📋 Fetching nutrition plans from database...');
      
      const plansResponse = await fetch('/api/admin/nutrition-plans');
      const plansResult = await plansResponse.json();
      
      if (!plansResponse.ok) {
        console.error('❌ Error fetching nutrition plans:', plansResult.error);
      } else {
        setPlans(plansResult.plans || []);
        console.log('✅ Nutrition plans loaded:', plansResult.plans?.length || 0);
      }

      // Fetch nutrition weekplans from database
      console.log('📅 Fetching nutrition weekplans from database...');
      
      const weekplansResponse = await fetch('/api/admin/nutrition-weekplans');
      const weekplansResult = await weekplansResponse.json();
      
      if (!weekplansResponse.ok) {
        console.error('❌ Error fetching nutrition weekplans:', weekplansResult.error);
      } else {
        setWeekplans(weekplansResult.weekplans || []);
        console.log('✅ Nutrition weekplans loaded:', weekplansResult.weekplans?.length || 0);
      }

      // Fetch meals from database
      console.log('🍽️ Fetching meals from database...');
      
      const mealsResponse = await fetch('/api/admin/meals');
      const mealsResult = await mealsResponse.json();
      
      if (!mealsResponse.ok) {
        console.error('❌ Error fetching meals:', mealsResult.error);
        // Force empty meals array - no fallback data
        console.log('⚠️ No meals found in database');
        setMeals([]);
        console.log('✅ Empty meals array set - database only mode');
      } else {
        setMeals(mealsResult.meals || []);
        console.log('✅ Meals loaded:', mealsResult.meals?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error fetching meals:', error);
      setMeals([]);
    }
  };

  const fetchWeekplans = async () => {
    try {
      const response = await fetch('/api/admin/weekplans');
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error fetching weekplans:', result.error);
        // Force empty weekplans array - no fallback data
        setWeekplans([]);
        console.log('✅ Empty weekplans array set - database only mode');
      } else {
        setWeekplans(result.weekplans || []);
        console.log('✅ Weekplans loaded:', result.weekplans?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error fetching weekplans:', error);
      setWeekplans([]);
    }
  };


  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSaveMeal = async (mealData: any) => {
    try {
      const method = selectedMeal ? 'PUT' : 'POST';
      const url = '/api/admin/meals';
      
      const payload = selectedMeal 
        ? { ...mealData, id: selectedMeal.id }
        : mealData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error saving meal:', result.error);
        alert('Fout bij opslaan van maaltijd: ' + (result.error || 'Onbekende fout'));
        return;
      }

      console.log('✅ Meal saved successfully:', result);
      await fetchAllData();
      setIsMealModalOpen(false);
      setSelectedMeal(null);
      
    } catch (error) {
      console.error('❌ Error saving meal:', error);
      alert('Fout bij opslaan van maaltijd');
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Weet je zeker dat je deze maaltijd wilt verwijderen?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/meals', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: mealId })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error deleting meal:', result.error);
        alert('Fout bij verwijderen van maaltijd: ' + (result.error || 'Onbekende fout'));
        return;
      }

      console.log('✅ Meal deleted successfully:', result);
      await fetchAllData();
      
    } catch (error) {
      console.error('❌ Error deleting meal:', error);
      alert('Fout bij verwijderen van maaltijd');
    }
  };

  const handleSavePlan = async (planData: any) => {
    try {
      const method = selectedPlan ? 'PUT' : 'POST';
      const url = '/api/admin/nutrition-plans';
      
      const payload = selectedPlan 
        ? { ...planData, id: selectedPlan.id }
        : planData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error saving plan:', result.error);
        alert('Fout bij opslaan van plan: ' + (result.error || 'Onbekende fout'));
        return;
      }

      console.log('✅ Plan saved successfully:', result);
      await fetchAllData();
      setIsPlanBuilderOpen(false);
      setSelectedPlan(null);
      
    } catch (error) {
      console.error('❌ Error saving plan:', error);
      alert('Fout bij opslaan van plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Weet je zeker dat je dit plan wilt verwijderen?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/nutrition-plans', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: planId })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error deleting plan:', result.error);
        alert('Fout bij verwijderen van plan: ' + (result.error || 'Onbekende fout'));
        return;
      }

      console.log('✅ Plan deleted successfully:', result);
      await fetchAllData();
      
    } catch (error) {
      console.error('❌ Error deleting plan:', error);
      alert('Fout bij verwijderen van plan');
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/nutrition-plans');
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error fetching plans:', result.error);
        setPlans([]);
      } else {
        setPlans(result.plans || []);
      }
    } catch (error) {
      console.error('❌ Error fetching plans:', error);
      setPlans([]);
    }
  };

  const fetchMeals = async () => {
    try {
      const response = await fetch('/api/admin/meals');
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error fetching meals:', result.error);
        setMeals([]);
      } else {
        setMeals(result.meals || []);
      }
    } catch (error) {
      console.error('❌ Error fetching meals:', error);
      setMeals([]);
    }
  };

  const fetchAllDataClean = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchFoodItems(),
      fetchPlans(),
      fetchMeals(),
      fetchWeekplans()
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllDataClean();
  }, []);

  const handleAddFoodItemClean = () => {
    setSelectedFoodItem(null);
    setShowFoodItemModal(true);
  };

  const handleEditFoodItemClean = (item: any) => {
    setSelectedFoodItem(item);
    setShowFoodItemModal(true);
  };

  const handleAddPlanClean = () => {
    setSelectedPlan(null);
    setShowPlanBuilder(true);
  };

  const handleEditPlanClean = (plan: any) => {
    setSelectedPlan(plan);
    setShowPlanBuilder(true);
  };

  const handleAddMealClean = () => {
    setSelectedMeal(null);
    setShowMealModal(true);
  };

  const handleEditMealClean = (meal: any) => {
    setSelectedMeal(meal);
    setShowMealModal(true);
  };

  const handleEditMeal = (meal: any) => {
    setSelectedMeal(meal);
    setShowMealModal(true);
  };

  // Load all data on component mount
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

  // Filter data based on search term and category
  const filteredFoodItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === 'alle' || activeTab === 'voeding' || item.category.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlanType = mealsFilter === 'alle' || 
                           (mealsFilter === 'Cheat Day' ? meal.is_cheat_day : meal.plan_type === mealsFilter);
    return matchesSearch && matchesPlanType;
  });

  const tabs = [
    { id: 'voeding', label: 'Voeding', count: foodItems.length, icon: '🥗' },
    { id: 'plans', label: 'Plannen', count: plans.length, icon: '📋' },
    { id: 'maaltijden', label: 'Maaltijden', count: meals.length, icon: '🍽️' },
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
          <p className="text-[#B6C948] mt-2">Beheer voedingsitems en voedingsplan templates</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatsCard
          icon={<UserGroupIcon className="w-6 h-6" />}
          value={foodItems.length}
          title="Voedingsitems"
          color="purple"
        />
        <AdminStatsCard
          icon={<BoltIcon className="w-6 h-6" />}
          value={plans.length}
          title="Voedingsplannen"
          color="green"
        />
        <AdminStatsCard
          icon={<ChartBarIcon className="w-6 h-6" />}
          value={meals.length}
          title="Maaltijden"
          color="blue"
        />
      </div>

      {/* Tabs */}
      <div className="bg-[#232D1A] rounded-2xl p-2 border border-[#3A4D23]">
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'maaltijden') {
                  setMealsFilter('alle');
                }
              }}
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

        <AdminButton
          onClick={
            activeTab === 'voeding' ? handleAddFoodItem :
            activeTab === 'plans' ? handleAddPlan : 
            activeTab === 'maaltijden' ? handleAddMeal :
            handleAddFoodItem
          }
          variant="primary"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          {activeTab === 'voeding' && 'Nieuw Voedingsitem'}
          {activeTab === 'plans' && 'Nieuw Plan'}
          {activeTab === 'maaltijden' && 'Nieuwe Maaltijd'}
        </AdminButton>
      </div>

      {/* Content */}
      <AdminCard>
        {activeTab === 'voeding' && (
          <>
            {/* Nutrition Info Header */}
            <div className="mb-6 p-4 bg-[#181F17] rounded-xl border border-[#3A4D23]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                  <span className="text-[#181F17] text-sm font-bold">ℹ️</span>
                </div>
                <div>
                  <h3 className="text-[#8BAE5A] font-semibold text-lg">Voedingswaarden Informatie</h3>
                  <p className="text-[#B6C948] text-sm mt-1">
                    Alle voedingswaarden zijn gebaseerd op <strong>per 100 gram</strong> van het voedingsitem.
                    <br />
                    <span className="text-[#8BAE5A] font-semibold">Specifieke items:</span> 1 Ei, 1 Appel, 1 Banaan, en alle noten per handje zijn nu beschikbaar!
                  </p>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {['alle', 'fruit', 'eieren', 'noten', 'vlees', 'vis', 'groenten', 'zuivel', 'granen'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveTab(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeTab === category
                        ? 'bg-[#8BAE5A] text-[#181F17]'
                        : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#3A4D23] border border-[#3A4D23]'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)} ({foodItems.filter(item => {
                      if (category === 'alle') return true;
                      // Handle case-insensitive matching for categories
                      return item.category.toLowerCase() === category.toLowerCase();
                    }).length})
                  </button>
                ))}
              </div>
            </div>
            
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
                    <td className="py-3 px-4 text-white">{item.calories_per_100g}</td>
                    <td className="py-3 px-4 text-white">{item.protein_per_100g}</td>
                    <td className="py-3 px-4 text-white">{item.carbs_per_100g}</td>
                    <td className="py-3 px-4 text-white">{item.fat_per_100g}</td>
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
                          onClick={() => handleDeleteFoodItem(item.id)}
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
          </>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-6">
            {filteredPlans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#B6C948]">Geen voedingsplannen gevonden</p>
              </div>
            ) : (
              filteredPlans.map((plan) => (
                <div key={plan.id} className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]/40 hover:border-[#8BAE5A]/40 transition-colors">
                  {/* Plan Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-xl mb-2">{plan.name}</h3>
                      <p className="text-[#8BAE5A] text-sm leading-relaxed">{plan.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <AdminButton
                        onClick={() => handleEditPlan(plan)}
                        variant="secondary"
                        size="sm"
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Bewerk
                      </AdminButton>
                      <AdminButton
                        onClick={() => handleDeletePlan(plan.id)}
                        variant="danger"
                        size="sm"
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Verwijder
                      </AdminButton>
                    </div>
                  </div>

                  {/* Macro Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#3A4D23] p-4 rounded-lg">
                      <div className="text-[#8BAE5A] font-semibold text-lg">{plan.target_calories}</div>
                      <div className="text-[#B6C948] text-xs">Calorieën</div>
                    </div>
                    <div className="bg-[#3A4D23] p-4 rounded-lg">
                      <div className="text-[#8BAE5A] font-semibold text-lg">{plan.target_protein}g</div>
                      <div className="text-[#B6C948] text-xs">Eiwitten</div>
                    </div>
                    <div className="bg-[#3A4D23] p-4 rounded-lg">
                      <div className="text-[#8BAE5A] font-semibold text-lg">{plan.target_carbs}g</div>
                      <div className="text-[#B6C948] text-xs">Koolhydraten</div>
                    </div>
                    <div className="bg-[#3A4D23] p-4 rounded-lg">
                      <div className="text-[#8BAE5A] font-semibold text-lg">{plan.target_fat}g</div>
                      <div className="text-[#B6C948] text-xs">Vetten</div>
                    </div>
                  </div>

                  {/* Plan Details */}
                  <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 bg-[#8BAE5A] text-[#181F17] rounded-full text-xs font-semibold">
                      {plan.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded-full text-xs">
                      {plan.duration_weeks} weken
                    </span>
                    <span className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded-full text-xs">
                      {plan.goal}
                    </span>
                  </div>

                  {/* Weekplan Overview */}
                  <div className="border-t border-[#3A4D23] pt-4">
                    <h4 className="text-[#8BAE5A] font-semibold text-lg mb-4">📅 Weekplan Overzicht</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                      {Object.entries({
                        monday: { day: 'Maandag' },
                        tuesday: { day: 'Dinsdag' },
                        wednesday: { day: 'Woensdag' },
                        thursday: { day: 'Donderdag' },
                        friday: { day: 'Vrijdag' },
                        saturday: { day: 'Zaterdag' },
                        sunday: { day: 'Zondag' }
                      }).map(([key, dayInfo]) => {
                        const weekplan = weekplans.find(wp => wp.id === plan.id);
                        const variation = weekplan?.weekly_variations?.[key] || { theme: 'Standaard', focus: 'balanced' };
                        
                        // Get color based on focus and diet
                        const getColor = (focus: string, dietName: string) => {
                          if (dietName === 'Carnivoor (Rick\'s Aanpak)') {
                            return 'bg-red-500'; // All protein focus for carnivore
                          }
                          
                          switch (focus) {
                            case 'carbs': return 'bg-blue-500';
                            case 'protein': return 'bg-green-500';
                            case 'balanced': return 'bg-purple-500';
                            case 'light': return 'bg-gray-500';
                            default: return 'bg-yellow-500';
                          }
                        };
                        
                        return (
                          <div key={key} className="bg-[#232D1A] rounded-lg p-3 border border-[#3A4D23]">
                            <div className="text-[#8BAE5A] font-semibold text-sm mb-1">{dayInfo.day}</div>
                            <div className="text-[#B6C948] text-xs mb-2">{variation.theme}</div>
                            <div className="flex gap-1">
                              <span className={`w-2 h-2 rounded-full ${getColor(variation.focus, plan.name)}`}></span>
                              <span className="text-[#B6C948] text-xs capitalize">{variation.focus}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Meal Distribution */}
                  <div className="border-t border-[#3A4D23] pt-4 mt-4">
                    <h4 className="text-[#8BAE5A] font-semibold text-lg mb-3">🍽️ Dagelijkse Maaltijd Verdeling</h4>
                    <div className="grid grid-cols-5 gap-3">
                      {(() => {
                        const weekplan = weekplans.find(wp => wp.id === plan.id);
                        const mealDistribution = weekplan?.meal_distribution || {
                          ontbijt: { percentage: 25, time: '08:00', calories: Math.round((plan.target_calories || 2200) * 0.25) },
                          snack1: { percentage: 10, time: '10:30', calories: Math.round((plan.target_calories || 2200) * 0.10) },
                          lunch: { percentage: 30, time: '13:00', calories: Math.round((plan.target_calories || 2200) * 0.30) },
                          snack2: { percentage: 10, time: '15:30', calories: Math.round((plan.target_calories || 2200) * 0.10) },
                          diner: { percentage: 25, time: '19:00', calories: Math.round((plan.target_calories || 2200) * 0.25) }
                        };

                        return Object.entries({
                          ontbijt: 'Ontbijt',
                          snack1: 'Snack 1',
                          lunch: 'Lunch',
                          snack2: 'Snack 2',
                          diner: 'Diner'
                        }).map(([key, mealName]) => {
                          const meal = mealDistribution[key as keyof typeof mealDistribution];
                          return (
                            <div key={key} className="bg-[#232D1A] rounded-lg p-3 text-center border border-[#3A4D23]">
                              <div className="text-[#8BAE5A] font-semibold text-sm">{mealName}</div>
                              <div className="text-[#B6C948] text-xs">{meal.percentage}%</div>
                              <div className="text-[#B6C948] text-xs">{meal.time}</div>
                              <div className="text-[#8BAE5A] text-xs font-semibold">{meal.calories} cal</div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'maaltijden' && (
          <div className="space-y-6">
            {/* Meal Plan Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {['alle', 'Carnivoor / Animal Based', 'Voedingsplan op Maat', 'Cheat Day'].map((planType) => (
                  <button
                    key={planType}
                    onClick={() => setMealsFilter(planType)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      mealsFilter === planType
                        ? planType === 'Cheat Day' 
                          ? 'bg-[#FF6B6B] text-white'
                          : 'bg-[#8BAE5A] text-[#181F17]'
                        : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#3A4D23] border border-[#3A4D23]'
                    }`}
                  >
                    {planType === 'alle' ? 'Alle Plannen' : planType} ({meals.filter(meal => {
                      if (planType === 'alle') return true;
                      if (planType === 'Cheat Day') return meal.is_cheat_day;
                      return meal.plan_type === planType;
                    }).length})
                  </button>
                ))}
              </div>
            </div>

            {filteredMeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#B6C948]">Geen maaltijden gevonden</p>
                <p className="text-[#8BAE5A] text-sm mt-2">Voeg maaltijden toe om te gebruiken in voedingsplannen</p>
              </div>
            ) : (
              filteredMeals.map((meal) => (
                <div key={meal.id} className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]/40 hover:border-[#8BAE5A]/40 transition-colors">
                  {/* Meal Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-xl mb-2">{meal.name}</h3>
                      <p className="text-[#8BAE5A] text-sm leading-relaxed">{meal.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <AdminButton
                        onClick={() => handleEditMeal(meal)}
                        variant="secondary"
                        size="sm"
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Bewerk
                      </AdminButton>
                      <AdminButton
                        onClick={() => handleDeleteMeal(meal.id)}
                        variant="danger"
                        size="sm"
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Verwijder
                      </AdminButton>
                    </div>
                  </div>

                  {/* Meal Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#3A4D23] p-4 rounded-lg">
                      <div className="text-[#8BAE5A] font-semibold text-lg">{meal.nutrition_info?.calories || 0}</div>
                      <div className="text-[#B6C948] text-xs">Calorieën</div>
                    </div>
                    <div className="bg-[#3A4D23] p-4 rounded-lg">
                      <div className="text-[#8BAE5A] font-semibold text-lg">{meal.nutrition_info?.protein || 0}g</div>
                      <div className="text-[#B6C948] text-xs">Eiwitten</div>
                    </div>
                    <div className="bg-[#3A4D23] p-4 rounded-lg">
                      <div className="text-[#8BAE5A] font-semibold text-lg">{meal.nutrition_info?.carbs || 0}g</div>
                      <div className="text-[#B6C948] text-xs">Koolhydraten</div>
                    </div>
                    <div className="bg-[#3A4D23] p-4 rounded-lg">
                      <div className="text-[#8BAE5A] font-semibold text-lg">{meal.nutrition_info?.fat || 0}g</div>
                      <div className="text-[#B6C948] text-xs">Vetten</div>
                    </div>
                  </div>

                  {/* Meal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ingredients */}
                    <div>
                      <h4 className="text-[#8BAE5A] font-semibold text-lg mb-3">🥗 Ingrediënten</h4>
                      <div className="space-y-2">
                        {meal.ingredients?.map((ingredient: any, index: number) => (
                          <div key={index} className="flex justify-between items-center bg-[#232D1A] p-3 rounded-lg">
                            <span className="text-white">{ingredient.name}</span>
                            <span className="text-[#8BAE5A] font-semibold">{ingredient.quantity} {ingredient.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h4 className="text-[#8BAE5A] font-semibold text-lg mb-3">📝 Bereiding</h4>
                      <div className="space-y-2">
                        {meal.instructions?.map((instruction: string, index: number) => (
                          <div key={index} className="flex items-start bg-[#232D1A] p-3 rounded-lg">
                            <span className="text-[#8BAE5A] font-bold mr-2">{index + 1}.</span>
                            <span className="text-white text-sm">{instruction}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Meal Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {/* Cheat Day */}
                    {meal.is_cheat_day && (
                      <span className="px-3 py-1 bg-[#FF6B6B] text-white rounded-full text-xs font-semibold">
                        🎉 Cheat Day
                      </span>
                    )}
                    {/* Voedingsplan Type */}
                    {meal.plan_type && (
                      <span className="px-3 py-1 bg-[#8BAE5A] text-[#181F17] rounded-full text-xs font-semibold">
                        📋 {meal.plan_type}
                      </span>
                    )}
                    {/* Doel */}
                    {meal.goal && (
                      <span className="px-3 py-1 bg-[#B6C948] text-[#181F17] rounded-full text-xs font-semibold">
                        🎯 {meal.goal}
                      </span>
                    )}
                    {/* Dag */}
                    {meal.day && (
                      <span className="px-3 py-1 bg-[#4A90E2] text-white rounded-full text-xs font-semibold">
                        📅 {meal.day.charAt(0).toUpperCase() + meal.day.slice(1)}
                      </span>
                    )}
                    {/* Meal Type */}
                    <span className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded-full text-xs capitalize">
                      {meal.meal_type}
                    </span>
                    {/* Category */}
                    <span className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded-full text-xs capitalize">
                      {meal.category}
                    </span>
                    {/* Difficulty */}
                    <span className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded-full text-xs capitalize">
                      {meal.difficulty}
                    </span>
                    {/* Prep Time */}
                    <span className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded-full text-xs">
                      {meal.prep_time} min
                    </span>
                    {/* Featured */}
                    {meal.is_featured && (
                      <span className="px-3 py-1 bg-[#8BAE5A] text-[#181F17] rounded-full text-xs font-semibold">
                        ⭐ Aanbevolen
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </AdminCard>

      {/* Modals */}
      <PlanBuilder
        isOpen={showPlanBuilder}
        onClose={() => setShowPlanBuilder(false)}
        plan={selectedPlan}
        onSave={handleSavePlan}
      />

      <FoodItemModal
        isOpen={showFoodItemModal}
        onClose={() => setShowFoodItemModal(false)}
        foodItem={selectedFoodItem}
        onSave={handleSaveFoodItem}
      />

      <MealModal
        isOpen={showMealModal}
        onClose={() => {
          setShowMealModal(false);
          setSelectedMeal(null);
        }}
        meal={selectedMeal}
        onSave={handleSaveMeal}
      />
    </div>
  );
}