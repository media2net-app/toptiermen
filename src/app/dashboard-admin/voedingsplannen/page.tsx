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

  const fetchWeekplans = async () => {
    try {
      const response = await fetch('/api/admin/nutrition-weekplans');
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error fetching weekplans:', result.error);
        setWeekplans([]);
      } else {
        setWeekplans(result.weekplans || []);
      }
    } catch (error) {
      console.error('❌ Error fetching weekplans:', error);
      setWeekplans([]);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchFoodItems(),
      fetchPlans(),
      fetchMeals(),
      fetchWeekplans()
    ]);
    setIsLoading(false);
  };

  // Load all data on component mount
  useEffect(() => {
    fetchAllData();
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
    try {
      console.log('💾 Food item saved successfully');
      await fetchAllData();
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
      setShowPlanBuilder(false);
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
      
      const url = '/api/admin/meals';
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
        alert(`Fout bij opslaan: ${result.error}`);
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

  // Filter functions
  const filteredFoodItems = foodItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meal.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (mealsFilter === 'alle') return matchesSearch;
    return matchesSearch && meal.meal_type === mealsFilter;
  });

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
            value={plans.length}
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="blue"
          />
          <AdminStatsCard
            title="Ingrediënten"
            value={foodItems.length}
            icon={<BoltIcon className="w-6 h-6" />}
            color="green"
          />
          <AdminStatsCard
            title="Maaltijden"
            value={meals.length}
            icon={<LightBulbIcon className="w-6 h-6" />}
            color="orange"
          />
          <AdminStatsCard
            title="Weekplannen"
            value={weekplans.length}
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
              onClick={() => setActiveTab(tab.id)}
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
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoeken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:border-[#8BAE5A] focus:outline-none"
            />
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'voeding' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Voedingsplannen</h2>
              <AdminButton
                onClick={handleAddPlan}
                variant="primary"
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Nieuw Plan
              </AdminButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <AdminCard key={plan.id} className="p-6">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">{plan.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{plan.description}</p>
                  
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
          </div>
        )}

        {activeTab === 'ingredienten' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Ingrediënten</h2>
              <AdminButton
                onClick={handleAddFoodItem}
                variant="primary"
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Nieuw Ingrediënt
              </AdminButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFoodItems.map((item) => (
                <AdminCard key={item.id} className="p-6">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">{item.name}</h3>
                  <p className="text-gray-300 text-sm mb-2">Categorie: {item.category}</p>
                  <p className="text-gray-300 text-sm mb-4">
                    {item.calories_per_100g} kcal per 100g
                  </p>
                  
                  <div className="flex space-x-2">
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
                </AdminCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'maaltijden' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Maaltijden</h2>
              <div className="flex space-x-4">
                <select
                  value={mealsFilter}
                  onChange={(e) => setMealsFilter(e.target.value)}
                  className="px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                >
                  <option value="alle">Alle maaltijden</option>
                  <option value="ontbijt">Ontbijt</option>
                  <option value="lunch">Lunch</option>
                  <option value="diner">Diner</option>
                  <option value="snack">Snack</option>
                </select>
                <AdminButton
                  onClick={handleAddMeal}
                  variant="primary"
                  icon={<PlusIcon className="w-4 h-4" />}
                >
                  Nieuwe Maaltijd
                </AdminButton>
              </div>
            </div>

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
          </div>
        )}

        {activeTab === 'weekplannen' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Weekplannen</h2>
              <AdminButton
                variant="primary"
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Nieuw Weekplan
              </AdminButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weekplans.map((weekplan) => (
                <AdminCard key={weekplan.id} className="p-6">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">{weekplan.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{weekplan.description}</p>
                  
                  <div className="flex space-x-2">
                    <AdminButton
                      variant="secondary"
                      size="sm"
                      icon={<PencilIcon className="w-4 h-4" />}
                    >
                      Bewerken
                    </AdminButton>
                    <AdminButton
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
          </div>
        )}
      </div>

      {/* Modals */}
      {showPlanBuilder && (
        <PlanBuilder
          isOpen={showPlanBuilder}
          onClose={() => {
            setShowPlanBuilder(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onSave={handleSavePlan}
        />
      )}

      {showFoodItemModal && (
        <FoodItemModal
          isOpen={showFoodItemModal}
          onClose={() => {
            setShowFoodItemModal(false);
            setSelectedFoodItem(null);
          }}
          foodItem={selectedFoodItem}
          onSave={handleSaveFoodItem}
        />
      )}

      {showMealModal && (
        <MealModal
          isOpen={showMealModal}
          onClose={() => {
            setShowMealModal(false);
            setSelectedMeal(null);
          }}
          meal={selectedMeal}
          onSave={handleSaveMeal}
        />
      )}
    </div>
  );
}