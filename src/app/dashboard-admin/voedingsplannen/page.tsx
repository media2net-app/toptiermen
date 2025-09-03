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
    if (!confirm('Weet je zeker dat je dit voedingsplan wilt verwijderen?')) {
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
      await fetchAllData();
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
      const response = await fetch('/api/admin/nutrition-ingredients', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: foodItemId })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error deleting food item:', result.error);
        alert('Fout bij verwijderen van ingrediënt: ' + (result.error || 'Onbekende fout'));
        return;
      }

      console.log('✅ Food item deleted successfully:', result);
      await fetchAllData();
      
    } catch (error) {
      console.error('❌ Error deleting food item:', error);
      alert('Fout bij verwijderen van ingrediënt');
    }
  };

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFoodItems = foodItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h3 className="mt-2 text-sm font-medium text-gray-300">Geen ingrediënten</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Voeg je eerste ingrediënt toe om te beginnen.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                 {filteredFoodItems.map((item) => (
                   <AdminCard key={item.id} className="p-6">
                     <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">{item.name}</h3>
                     <p className="text-gray-300 text-sm mb-2">Categorie: {item.category}</p>
                     <p className="text-gray-300 text-sm mb-4">
                       {item.calories_per_100g} kcal per 100g
                     </p>
                     
                     <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                       <div>
                         <span className="text-gray-400">Eiwit:</span>
                         <span className="ml-2 font-medium text-white">{item.protein_per_100g}g</span>
                       </div>
                       <div>
                         <span className="text-gray-400">Koolhydraten:</span>
                         <span className="ml-2 font-medium text-white">{item.carbs_per_100g}g</span>
                       </div>
                       <div>
                         <span className="text-gray-400">Vet:</span>
                         <span className="ml-2 font-medium text-white">{item.fat_per_100g}g</span>
                       </div>
                     </div>
                     
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
            onSave={() => {
              fetchAllData();
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