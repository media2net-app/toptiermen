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
  UserGroupIcon,
  XMarkIcon
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
  is_carnivore?: boolean;
  unit_type?: 'per_100g' | 'per_piece' | 'per_handful' | 'per_30g';
  created_at: string;
  updated_at: string;
}

const getUnitTypeLabel = (unitType?: 'per_100g' | 'per_piece' | 'per_handful' | 'per_30g') => {
  switch (unitType) {
    case 'per_piece': return 'Per stuk';
    case 'per_handful': return 'Per handje';
    case 'per_30g': return 'Per 30 gram';
    case 'per_100g':
    default: return 'Per 100 gram';
  }
};

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
  const [carnivoreFilter, setCarnivoreFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [weekplans, setWeekplans] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFoodItems, setIsLoadingFoodItems] = useState(true);

  // Fetch all data functions
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

  const fetchMeals = async () => {
    try {
      console.log('🍽️ Fetching meals from database...');
      
      const response = await fetch('/api/admin/meals');
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error fetching meals:', result.error);
        return;
      }
      
      setMeals(result.meals || []);
      console.log('✅ Meals loaded:', result.meals?.length || 0);
    } catch (err) {
      console.error('❌ Exception fetching meals:', err);
    }
  };

  const fetchWeekplans = async () => {
    try {
      console.log('📊 Fetching nutrition weekplans from database...');
      
      const response = await fetch('/api/admin/nutrition-weekplans');
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error fetching weekplans:', result.error);
        return;
      }
      
      setWeekplans(result.weekplans || []);
      console.log('✅ Weekplans loaded:', result.weekplans?.length || 0);
    } catch (err) {
      console.error('❌ Exception fetching weekplans:', err);
    }
  };

  const fetchPlans = async () => {
    try {
      console.log('📊 Fetching nutrition plans from database...');
      
      const response = await fetch('/api/admin/nutrition-plans');
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error fetching plans:', result.error);
        return;
      }
      
      console.log('✅ Raw plans response:', result);
      console.log('📋 Plans array:', result.plans);
      
      // Debug specific plan
      const carnivoorPlan = result.plans?.find((p: any) => p.plan_id === 'carnivoor-droogtrainen');
      if (carnivoorPlan) {
        console.log('🥩 Carnivoor-droogtrainen plan found:');
        console.log('📊 Plan details:', carnivoorPlan);
        console.log('🍽️ Meals data:', carnivoorPlan.meals);
        
        if (carnivoorPlan.meals && carnivoorPlan.meals.weekly_plan) {
          console.log('📅 Weekly plan data:', carnivoorPlan.meals.weekly_plan);
          console.log('🗓️ Monday data:', carnivoorPlan.meals.weekly_plan.monday);
        } else {
          console.log('⚠️ No weekly_plan found in carnivoor plan meals data');
        }
      } else {
        console.log('❌ Carnivoor-droogtrainen plan not found in response');
      }
      
      setPlans(result.plans || []);
      console.log('✅ Plans loaded:', result.plans?.length || 0);
    } catch (err) {
      console.error('❌ Exception fetching plans:', err);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchPlans(),
      fetchWeekplans(),
      fetchMeals(),
      fetchFoodItems()
    ]);
    setIsLoading(false);
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
      setShowMealModal(false);
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
      console.log('🔍 DEBUG: Starting handleSavePlan...');
      console.log('🔍 DEBUG: planData received:', planData);
      console.log('🔍 DEBUG: selectedPlan:', selectedPlan);
      
      const method = selectedPlan ? 'PUT' : 'POST';
      const url = '/api/admin/nutrition-plans';
      
      const payload = selectedPlan 
        ? { ...planData, id: selectedPlan.id }
        : planData;
        
      console.log('🔍 DEBUG: Method determined:', method);
      console.log('🔍 DEBUG: URL:', url);

      console.log('🔍 DEBUG: Saving plan with method:', method);
      console.log('🔍 DEBUG: Payload:', JSON.stringify(payload, null, 2));
      console.log('🔍 DEBUG: Selected plan ID:', selectedPlan?.id);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('🔍 DEBUG: Response status:', response.status);
      console.log('🔍 DEBUG: Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('🔍 DEBUG: Response body:', result);
      
      if (!response.ok) {
        console.error('❌ Error saving plan:', result.error);
        console.error('❌ Full error response:', result);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response statusText:', response.statusText);
        alert('Fout bij opslaan van plan: ' + (result.error || result.message || `HTTP ${response.status}: ${response.statusText}`));
        return;
      }

      console.log('✅ Plan saved successfully:', result);
      await fetchAllData();
      
      // Use a small delay to ensure state has updated, then find the updated plan
      setTimeout(() => {
        const updatedPlan = plans.find((p: any) => p.id === selectedPlan?.id);
        if (updatedPlan) {
          console.log('🔄 Keeping updated plan selected:', updatedPlan.name);
          setSelectedPlan(updatedPlan);
        } else {
          console.log('⚠️ Could not find updated plan, resetting selection');
          setSelectedPlan(null);
        }
      }, 100);
      
      setShowPlanBuilder(false);
      
    } catch (error) {
      console.error('❌ Error saving plan:', error);
      console.error('❌ Error details:', error);
      alert('Fout bij opslaan van plan: ' + (error instanceof Error ? error.message : 'Onbekende fout'));
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Weet je zeker dat je dit voedingsplan wilt verwijderen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/nutrition-plans?id=${planId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
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

  const handleEditPlan = (plan: NutritionPlan) => {
    setSelectedPlan(plan);
    setShowPlanBuilder(true);
  };

  const handleEditMeal = (meal: any) => {
    setSelectedMeal(meal);
    setShowMealModal(true);
  };

  const handleEditFoodItem = (foodItem: FoodItem) => {
    setSelectedFoodItem(foodItem);
    setShowFoodItemModal(true);
  };

  const handleSaveFoodItem = async (foodItemData: any) => {
    try {
      const method = selectedFoodItem ? 'PUT' : 'POST';
      const url = '/api/admin/nutrition-ingredients';
      
      const payload = selectedFoodItem 
        ? { ...foodItemData, id: selectedFoodItem.id }
        : foodItemData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error saving food item:', result.error);
        alert('Fout bij opslaan van ingrediënt: ' + (result.error || 'Onbekende fout'));
        return;
      }

      console.log('✅ Food item saved successfully:', result);
      await fetchFoodItems();
      setShowFoodItemModal(false);
      setSelectedFoodItem(null);
      
    } catch (error) {
      console.error('❌ Error saving food item:', error);
      alert('Fout bij opslaan van ingrediënt');
    }
  };

  const handleDeleteFoodItem = async (foodItemId: string) => {
    if (!confirm('Weet je zeker dat je dit ingrediënt wilt verwijderen?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting ingredient with ID:', foodItemId);
      
      const response = await fetch(`/api/admin/nutrition-ingredients?id=${foodItemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error deleting food item:', result.error);
        alert('Fout bij verwijderen van ingrediënt: ' + (result.error || 'Onbekende fout'));
        return;
      }

      console.log('✅ Food item deleted successfully:', result);
      await fetchFoodItems();
      
    } catch (error) {
      console.error('❌ Error deleting food item:', error);
      alert('Fout bij verwijderen van ingrediënt');
    }
  };

  const filteredPlans = plans
    .filter(plan =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // First sort by type: Carnivoor plans first, then normal meal plans
      const aIsCarnivore = a.name.toLowerCase().includes('carnivoor');
      const bIsCarnivore = b.name.toLowerCase().includes('carnivoor');
      
      if (aIsCarnivore && !bIsCarnivore) return -1;
      if (!aIsCarnivore && bIsCarnivore) return 1;
      
      // Within each type, sort by calories (low to high)
      return (a.target_calories || 0) - (b.target_calories || 0);
    });

  const filteredFoodItems = foodItems.filter(item => {
    // Text search filter
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Carnivore filter
    const matchesCarnivore = carnivoreFilter === 'all' || 
      (carnivoreFilter === 'yes' && (item as any).is_carnivore === true) ||
      (carnivoreFilter === 'no' && (item as any).is_carnivore !== true);
    
    return matchesSearch && matchesCarnivore;
  });

  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meal.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWeekplans = weekplans.filter(weekplan =>
    weekplan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    weekplan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Admin Voedingsplannen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">
            Admin Voedingsplannen Beheer
          </h1>
          <p className="text-gray-300">
            Beheer voedingsplannen, ingrediënten en maaltijden voor het platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AdminStatsCard
            title="Voedingsplannen"
            value={plans.length.toString()}
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="blue"
          />
          <AdminStatsCard
            title="Ingrediënten"
            value={foodItems.length.toString()}
            icon={<BoltIcon className="w-6 h-6" />}
            color="green"
          />
          <AdminStatsCard
            title="Maaltijden"
            value={meals.length.toString()}
            icon={<LightBulbIcon className="w-6 h-6" />}
            color="orange"
          />
          <AdminStatsCard
            title="Weekplannen"
            value={weekplans.length.toString()}
            icon={<UserGroupIcon className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'voeding', label: 'Voedingsplannen' },
            { id: 'ingredienten', label: 'Ingrediënten' },
            { id: 'maaltijden', label: 'Maaltijden' },
            { id: 'weekplannen', label: 'Weekplannen' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                // Reset carnivore filter when switching tabs
                if (tab.id !== 'ingredienten') {
                  setCarnivoreFilter('all');
                }
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#8BAE5A] text-[#181F17] font-semibold'
                  : 'bg-[#232D1A] text-gray-300 hover:bg-[#2A3420]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Zoeken naar ingrediënten, voedingsplannen, maaltijden..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-12 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:border-[#8BAE5A] focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 w-5 h-5 text-gray-400 hover:text-[#8BAE5A] transition-colors"
                  title="Wis zoekterm"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Carnivore Filter - Only show on ingredients tab */}
            {activeTab === 'ingredienten' && (
              <div className="min-w-[200px]">
                <select
                  value={carnivoreFilter}
                  onChange={(e) => setCarnivoreFilter(e.target.value as 'all' | 'yes' | 'no')}
                  className="w-full py-2 px-3 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                >
                  <option value="all">Alle ingrediënten</option>
                  <option value="yes">Alleen carnivoor</option>
                  <option value="no">Alleen standaard</option>
                </select>
              </div>
            )}
          </div>
          {(searchTerm || (activeTab === 'ingredienten' && carnivoreFilter !== 'all')) && (
            <div className="mt-2 text-sm text-gray-400">
              {searchTerm && (
                <span>
                  Zoekresultaten voor: <span className="text-[#8BAE5A] font-medium">"{searchTerm}"</span>
                </span>
              )}
              {activeTab === 'ingredienten' && carnivoreFilter !== 'all' && (
                <span className={searchTerm ? 'ml-3' : ''}>
                  Filter: <span className="text-[#8BAE5A] font-medium">
                    {carnivoreFilter === 'yes' ? 'Alleen carnivoor' : 'Alleen standaard'}
                  </span>
                </span>
              )}
              {activeTab === 'ingredienten' && filteredFoodItems.length === 0 && (
                <span className="text-red-400 ml-2 block mt-1">
                  • Geen ingrediënten gevonden. 
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')} 
                      className="text-[#8BAE5A] underline hover:text-[#B6C948] ml-1"
                    >
                      Wis zoekopdracht
                    </button>
                  )}
                  {carnivoreFilter !== 'all' && (
                    <button 
                      onClick={() => setCarnivoreFilter('all')} 
                      className="text-[#8BAE5A] underline hover:text-[#B6C948] ml-1"
                    >
                      Wis filter
                    </button>
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'voeding' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Voedingsplannen</h2>
              <AdminButton
                onClick={() => {
                  setSelectedPlan(null);
                  setShowPlanBuilder(true);
                }}
                icon={<PlusIcon className="w-4 h-4" />}
                variant="primary"
              >
                + Nieuw Plan
              </AdminButton>
            </div>

            {filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">Geen voedingsplannen</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Maak je eerste voedingsplan aan om te beginnen.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {filteredPlans.map((plan) => (
                   <AdminCard key={plan.id} className="p-6">
                     <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">{plan.name}</h3>
                     <p className="text-gray-300 text-sm mb-4">{plan.description}</p>
                     
                     {plan.target_calories && (
                       <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                         <div>
                           <span className="text-gray-400">Calorieën:</span>
                           <span className="ml-2 font-medium text-white">{plan.target_calories} kcal</span>
                         </div>
                         {plan.target_protein && (
                           <div>
                             <span className="text-gray-400">Eiwit:</span>
                             <span className="ml-2 font-medium text-white">{plan.target_protein}g</span>
                           </div>
                         )}
                         {plan.target_carbs && (
                           <div>
                             <span className="text-gray-400">Koolhydraten:</span>
                             <span className="ml-2 font-medium text-white">{plan.target_carbs}g</span>
                           </div>
                         )}
                         {plan.target_fat && (
                           <div>
                             <span className="text-gray-400">Vet:</span>
                             <span className="ml-2 font-medium text-white">{plan.target_fat}g</span>
                           </div>
                         )}
                       </div>
                     )}
                     
                     <div className="flex justify-between items-center">
                       <div className="flex space-x-2">
                         <AdminButton
                           onClick={() => handleEditPlan(plan)}
                           variant="secondary"
                           size="sm"
                           icon={<PencilIcon className="w-4 h-4" />}
                         >
                           Bewerken
                         </AdminButton>
                         <AdminButton
                           onClick={() => handleDeletePlan(plan.id)}
                           variant="danger"
                           size="sm"
                           icon={<TrashIcon className="w-4 h-4" />}
                         >
                           Verwijderen
                         </AdminButton>
                       </div>
                     </div>
                   </AdminCard>
                 ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ingredienten' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Ingrediënten</h2>
              <AdminButton
                onClick={() => {
                  setSelectedFoodItem(null);
                  setShowFoodItemModal(true);
                }}
                icon={<PlusIcon className="w-4 h-4" />}
                variant="primary"
              >
                + Nieuw Ingrediënt
              </AdminButton>
            </div>

            {filteredFoodItems.length === 0 ? (
              <div className="text-center py-12">
                <BoltIcon className="mx-auto h-12 w-12 text-gray-400" />
                {searchTerm ? (
                  <>
                    <h3 className="mt-2 text-sm font-medium text-gray-300">Geen ingrediënten gevonden</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Er zijn geen ingrediënten die overeenkomen met "{searchTerm}".
                    </p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-3 px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors font-medium"
                    >
                      Toon alle ingrediënten ({foodItems.length})
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="mt-2 text-sm font-medium text-gray-300">Geen ingrediënten</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Voeg je eerste ingrediënt toe om te beginnen.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-[#232D1A] rounded-lg border border-[#3A4D23]/40 overflow-hidden">
                {/* Desktop Table Header */}
                <div className="hidden lg:grid grid-cols-13 gap-3 p-4 bg-[#1A2313] border-b border-[#3A4D23]/40 text-sm font-semibold text-[#8BAE5A]">
                  <div className="col-span-2">Naam</div>
                  <div className="col-span-2">Categorie</div>
                  <div className="col-span-1">Carnivoor</div>
                  <div className="col-span-1">Type<br/><span className="text-xs text-[#8BAE5A]/60">(per handje 25g)</span></div>
                  <div className="col-span-1">Kcal/100g</div>
                  <div className="col-span-1">Protein</div>
                  <div className="col-span-1">Carbs</div>
                  <div className="col-span-1">Fat</div>
                  <div className="col-span-3">Acties</div>
                </div>
                
                {/* Table Body */}
                <div className="divide-y divide-[#3A4D23]/40">
                  {filteredFoodItems.map((item) => (
                    <div key={item.id}>
                      {/* Desktop View */}
                      <div className="hidden lg:grid grid-cols-13 gap-3 p-4 hover:bg-[#1A2313] transition-colors">
                        <div className="col-span-2">
                          <h3 className="text-white font-medium">{item.name}</h3>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-300 text-sm capitalize">{item.category}</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            (item as any).is_carnivore 
                              ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                              : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                          }`}>
                            {(item as any).is_carnivore ? 'Ja' : 'Nee'}
                          </span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-xs px-2 py-1 rounded-md bg-blue-600/20 text-blue-400 border border-blue-600/30 font-medium">
                            {getUnitTypeLabel((item as any).unit_type)}
                          </span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-white font-medium">{item.calories_per_100g || 0}</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-white">{item.protein_per_100g || 0}g</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-white">{item.carbs_per_100g || 0}g</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-white">{item.fat_per_100g || 0}g</span>
                        </div>
                        <div className="col-span-3">
                          <div className="flex gap-2">
                            <AdminButton
                              onClick={() => handleEditFoodItem(item)}
                              variant="secondary"
                              size="sm"
                              icon={<PencilIcon className="w-4 h-4" />}
                            >
                              Bewerken
                            </AdminButton>
                            <AdminButton
                              onClick={() => handleDeleteFoodItem(item.id)}
                              variant="danger"
                              size="sm"
                              icon={<TrashIcon className="w-4 h-4" />}
                            >
                              Verwijderen
                            </AdminButton>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile/Tablet View */}
                      <div className="lg:hidden p-4 hover:bg-[#1A2313] transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-white font-medium text-lg">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-gray-300 text-sm capitalize">{item.category}</p>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                (item as any).is_carnivore 
                                  ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                                  : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                              }`}>
                                {(item as any).is_carnivore ? 'Carnivoor' : 'Standaard'}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-md bg-blue-600/20 text-blue-400 border border-blue-600/30 font-medium">
                                {getUnitTypeLabel((item as any).unit_type)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <AdminButton
                              onClick={() => handleEditFoodItem(item)}
                              variant="secondary"
                              size="sm"
                              icon={<PencilIcon className="w-4 h-4" />}
                            >
                              Bewerken
                            </AdminButton>
                            <AdminButton
                              onClick={() => handleDeleteFoodItem(item.id)}
                              variant="danger"
                              size="sm"
                              icon={<TrashIcon className="w-4 h-4" />}
                            >
                              Verwijderen
                            </AdminButton>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-gray-400 text-xs">Kcal/100g</div>
                            <div className="text-white font-medium">{item.calories_per_100g || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400 text-xs">Protein</div>
                            <div className="text-white">{item.protein_per_100g || 0}g</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400 text-xs">Carbs</div>
                            <div className="text-white">{item.carbs_per_100g || 0}g</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400 text-xs">Fat</div>
                            <div className="text-white">{item.fat_per_100g || 0}g</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'maaltijden' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Maaltijden</h2>
              <AdminButton
                onClick={() => {
                  setSelectedMeal(null);
                  setShowMealModal(true);
                }}
                icon={<PlusIcon className="w-4 h-4" />}
                variant="primary"
              >
                + Nieuwe Maaltijd
              </AdminButton>
            </div>

            {filteredMeals.length === 0 ? (
              <div className="text-center py-12">
                <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">Geen maaltijden</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Maak je eerste maaltijd aan om te beginnen.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {filteredMeals.map((meal) => (
                   <AdminCard key={meal.id} className="p-6">
                     <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">{meal.name}</h3>
                     <p className="text-gray-300 text-sm mb-2">Type: {meal.meal_type}</p>
                     <p className="text-gray-300 text-sm mb-4">{meal.description}</p>
                     
                     <div className="flex space-x-2">
                       <AdminButton
                         onClick={() => handleEditMeal(meal)}
                         variant="secondary"
                         size="sm"
                         icon={<PencilIcon className="w-4 h-4" />}
                       >
                         Bewerken
                       </AdminButton>
                       <AdminButton
                         onClick={() => handleDeleteMeal(meal.id)}
                         variant="danger"
                         size="sm"
                         icon={<TrashIcon className="w-4 h-4" />}
                       >
                         Verwijderen
                       </AdminButton>
                     </div>
                   </AdminCard>
                 ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'weekplannen' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Weekplannen</h2>
            </div>

            {filteredWeekplans.length === 0 ? (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">Geen weekplannen</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Er zijn nog geen weekplannen beschikbaar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {filteredWeekplans.map((weekplan) => (
                   <AdminCard key={weekplan.id} className="p-6">
                     <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">{weekplan.name}</h3>
                     <p className="text-gray-300 text-sm mb-4">{weekplan.description}</p>
                   </AdminCard>
                 ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {showPlanBuilder && (
          <PlanBuilder
            isOpen={showPlanBuilder}
            plan={selectedPlan}
            foodItems={foodItems}
            onSave={handleSavePlan}
            onClose={() => {
              setShowPlanBuilder(false);
              setSelectedPlan(null);
            }}
          />
        )}

        {showFoodItemModal && (
          <FoodItemModal
            isOpen={showFoodItemModal}
            foodItem={selectedFoodItem}
            onSave={async () => {
              console.log('🔄 Refreshing ingredient data after save...');
              await fetchFoodItems();
              setShowFoodItemModal(false);
              setSelectedFoodItem(null);
            }}
            onClose={() => {
              setShowFoodItemModal(false);
              setSelectedFoodItem(null);
            }}
          />
        )}

        {showMealModal && (
          <MealModal
            isOpen={showMealModal}
            meal={selectedMeal}
            onSave={handleSaveMeal}
            onClose={() => {
              setShowMealModal(false);
              setSelectedMeal(null);
            }}
          />
        )}
      </div>
    </div>
  );
}