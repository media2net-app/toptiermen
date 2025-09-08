'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, CalendarIcon, PencilIcon } from '@heroicons/react/24/outline';
import AdminButton from '@/components/admin/AdminButton';
import MealEditModal from './MealEditModal';

interface NutritionPlan {
  id?: string;
  plan_id?: string;
  name: string;
  description: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  duration_weeks?: number;
  difficulty?: string;
  goal?: string;
  fitness_goal?: 'droogtrainen' | 'spiermassa' | 'onderhoud';
  is_featured?: boolean;
  is_public?: boolean;
  meals?: {
    weekly_plan: {
      [key: string]: {
        [key: string]: {
          time: string;
          ingredients: Array<{
            id: string;
            name: string;
            amount: number;
            unit: string;
            calories_per_100g: number;
            protein_per_100g: number;
            carbs_per_100g: number;
            fat_per_100g: number;
          }>;
          nutrition: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
          };
        };
      };
    };
    weekly_averages: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  };
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  description?: string;
  is_carnivore: boolean;
  unit_type: string;
}

interface PlanBuilderProps {
  plan: NutritionPlan;
  onClose: () => void;
  onSave: (plan: NutritionPlan) => void;
}

const DAYS = [
  { key: 'maandag', label: 'Maandag', theme: 'Energie Boost', focus: 'Start de week sterk' },
  { key: 'dinsdag', label: 'Dinsdag', theme: 'Consistentie', focus: 'Behoud momentum' },
  { key: 'woensdag', label: 'Woensdag', theme: 'Middenweek Push', focus: 'Over de helft' },
  { key: 'donderdag', label: 'Donderdag', theme: 'Doorzetten', focus: 'Bijna weekend' },
  { key: 'vrijdag', label: 'Vrijdag', theme: 'Weekend Voorbereiding', focus: 'Klaar voor rust' },
  { key: 'zaterdag', label: 'Zaterdag', theme: 'Herstel & Groei', focus: 'Tijd voor herstel' },
  { key: 'zondag', label: 'Zondag', theme: 'Voorbereiding', focus: 'Nieuwe week voorbereiden' }
];

const MEALS = [
  { key: 'ontbijt', label: 'Ontbijt', time: '08:00', icon: '🌅' },
  { key: 'ochtend_snack', label: 'Ochtend Snack', time: '10:00', icon: '🥜' },
  { key: 'lunch', label: 'Lunch', time: '12:30', icon: '🍽️' },
  { key: 'lunch_snack', label: 'Lunch Snack', time: '15:00', icon: '🍎' },
  { key: 'diner', label: 'Diner', time: '18:30', icon: '🌙' },
  { key: 'avond_snack', label: 'Avond Snack', time: '21:00', icon: '🌙' }
];

export default function PlanBuilder({ plan, onClose, onSave }: PlanBuilderProps) {
  const [formData, setFormData] = useState<NutritionPlan>(plan);
  const [activeTab, setActiveTab] = useState<'overview' | 'daily_plans' | 'ingredients'>('overview');
  const [selectedDay, setSelectedDay] = useState<string>('maandag');
  const [selectedMeal, setSelectedMeal] = useState<string>('ontbijt');
  const [showMealModal, setShowMealModal] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/admin/nutrition-ingredients');
      const result = await response.json();
      if (result.success) {
        setIngredients(result.ingredients);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/nutrition-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: plan.id, ...formData })
      });
      
      const result = await response.json();
      if (result.success) {
        onSave(result.plan);
      }
    } catch (error) {
      console.error('Error saving plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealEdit = (day: string, meal: string) => {
    setSelectedDay(day);
    setSelectedMeal(meal);
    setShowMealModal(true);
  };

  const handleMealSave = async (ingredients: any[]) => {
    try {
      const response = await fetch('/api/admin/plan-meals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          day: selectedDay,
          meal: selectedMeal,
          ingredients: ingredients
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setFormData(prevData => ({
          ...prevData,
          meals: result.meals
        }));
        setShowMealModal(false);
      } else {
        console.error('❌ Meal save failed:', result.error);
        alert('Fout bij opslaan van maaltijd: ' + (result.error || 'Onbekende fout'));
      }
    } catch (error) {
      console.error('💥 Error saving meal:', error);
      alert('Fout bij opslaan van maaltijd: ' + error.message);
    }
  };

  const getMealData = (day: string, meal: string) => {
    return formData.meals?.weekly_plan?.[day]?.[meal] || {
      time: MEALS.find(m => m.key === meal)?.time || '12:00',
      ingredients: [],
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    };
  };

  const getDayTotal = (day: string) => {
    let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    MEALS.forEach(meal => {
      const mealData = getMealData(day, meal.key);
      total.calories += mealData.nutrition.calories;
      total.protein += mealData.nutrition.protein;
      total.carbs += mealData.nutrition.carbs;
      total.fat += mealData.nutrition.fat;
    });
    return total;
  };

  const getWeeklyTotal = () => {
    let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    DAYS.forEach(day => {
      const dayTotal = getDayTotal(day.key);
      total.calories += dayTotal.calories;
      total.protein += dayTotal.protein;
      total.carbs += dayTotal.carbs;
      total.fat += dayTotal.fat;
    });
    return {
      calories: Math.round(total.calories / 7),
      protein: Math.round((total.protein / 7) * 10) / 10,
      carbs: Math.round((total.carbs / 7) * 10) / 10,
      fat: Math.round((total.fat / 7) * 10) / 10
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F150E] rounded-xl border border-[#3A4D23] w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
          <div>
            <h2 className="text-2xl font-bold text-[#8BAE5A]">{formData.name}</h2>
            <p className="text-gray-300 mt-1">{formData.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#3A4D23]">
          {[
            { key: 'overview', label: 'Overzicht', icon: '📊' },
            { key: 'daily_plans', label: 'Dagelijkse Plannen', icon: '📅' },
            { key: 'ingredients', label: 'Ingredienten', icon: '🥗' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[#8BAE5A] border-b-2 border-[#8BAE5A] bg-[#8BAE5A]/5'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Plan Details */}
                <div className="bg-[#181F17] rounded-lg p-6 border border-[#3A4D23]">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Plan Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Naam</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Beschrijving</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Doel</label>
                        <select
                          value={formData.goal || ''}
                          onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                        >
                          <option value="Droogtrainen">Droogtrainen</option>
                          <option value="Onderhoud">Onderhoud</option>
                          <option value="Spiermassa">Spiermassa</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Moeilijkheid</label>
                        <select
                          value={formData.difficulty || ''}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Macros */}
                <div className="bg-[#181F17] rounded-lg p-6 border border-[#3A4D23]">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Target Macros</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Calorieën</label>
                      <input
                        type="number"
                        value={formData.target_calories || ''}
                        onChange={(e) => setFormData({ ...formData, target_calories: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Eiwit (g)</label>
                      <input
                        type="number"
                        value={formData.target_protein || ''}
                        onChange={(e) => setFormData({ ...formData, target_protein: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Koolhydraten (g)</label>
                      <input
                        type="number"
                        value={formData.target_carbs || ''}
                        onChange={(e) => setFormData({ ...formData, target_carbs: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Vet (g)</label>
                      <input
                        type="number"
                        value={formData.target_fat || ''}
                        onChange={(e) => setFormData({ ...formData, target_fat: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Weekly Summary */}
                <div className="bg-[#181F17] rounded-lg p-6 border border-[#3A4D23] lg:col-span-2">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Wekelijks Overzicht</h3>
                  <div className="grid grid-cols-7 gap-4">
                    {DAYS.map(day => {
                      const dayTotal = getDayTotal(day.key);
                      return (
                        <div key={day.key} className="text-center">
                          <div className="text-sm font-medium text-[#8BAE5A] mb-2">{day.label}</div>
                          <div className="bg-[#0F150E] rounded p-3 border border-[#3A4D23]">
                            <div className="text-lg font-bold text-white">{dayTotal.calories}</div>
                            <div className="text-xs text-gray-400">kcal</div>
                            <div className="text-xs text-[#B6C948] mt-1">
                              P: {dayTotal.protein}g | C: {dayTotal.carbs}g | F: {dayTotal.fat}g
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-400">Gemiddeld per dag</div>
                    <div className="text-2xl font-bold text-[#8BAE5A]">{getWeeklyTotal().calories} kcal</div>
                    <div className="text-sm text-[#B6C948]">
                      P: {getWeeklyTotal().protein}g | C: {getWeeklyTotal().carbs}g | F: {getWeeklyTotal().fat}g
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'daily_plans' && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Day Selector */}
                <div className="bg-[#181F17] rounded-lg p-6 border border-[#3A4D23]">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Selecteer Dag</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {DAYS.map(day => (
                      <button
                        key={day.key}
                        onClick={() => setSelectedDay(day.key)}
                        className={`p-3 rounded-lg text-left transition-colors ${
                          selectedDay === day.key
                            ? 'bg-[#8BAE5A] text-white'
                            : 'bg-[#0F150E] text-gray-300 hover:bg-[#3A4D23]'
                        }`}
                      >
                        <div className="font-medium">{day.label}</div>
                        <div className="text-sm opacity-75">{day.theme}</div>
                        <div className="text-xs opacity-60">{day.focus}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meals for Selected Day */}
                <div className="bg-[#181F17] rounded-lg p-6 border border-[#3A4D23]">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">
                    {DAYS.find(d => d.key === selectedDay)?.label} - Maaltijden
                  </h3>
                  <div className="space-y-3">
                    {MEALS.map(meal => {
                      const mealData = getMealData(selectedDay, meal.key);
                      const hasIngredients = mealData.ingredients.length > 0;
                      
                      return (
                        <div
                          key={meal.key}
                          className={`p-4 rounded-lg border transition-colors ${
                            hasIngredients
                              ? 'bg-[#0F150E] border-[#3A4D23]'
                              : 'bg-[#0F150E]/50 border-[#3A4D23]/50 border-dashed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{meal.icon}</span>
                              <div>
                                <div className="font-medium text-white">{meal.label}</div>
                                <div className="text-sm text-gray-400">{meal.time}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {hasIngredients && (
                                <div className="text-right">
                                  <div className="text-sm font-medium text-[#8BAE5A]">{mealData.nutrition.calories} kcal</div>
                                  <div className="text-xs text-gray-400">
                                    P: {mealData.nutrition.protein}g | C: {mealData.nutrition.carbs}g | F: {mealData.nutrition.fat}g
                                  </div>
                                </div>
                              )}
                              <button
                                onClick={() => handleMealEdit(selectedDay, meal.key)}
                                className="p-2 bg-[#8BAE5A] hover:bg-[#8BAE5A]/80 text-white rounded-lg transition-colors"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {hasIngredients && (
                            <div className="mt-3 pt-3 border-t border-[#3A4D23]">
                              <div className="text-sm text-gray-400">Ingredienten:</div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {mealData.ingredients.map((ingredient, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-[#3A4D23] text-[#B6C948] rounded text-xs"
                                  >
                                    {ingredient.name} ({ingredient.amount}{ingredient.unit})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="bg-[#181F17] rounded-lg p-6 border border-[#3A4D23]">
                <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Beschikbare Ingredienten</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ingredients.map(ingredient => (
                    <div
                      key={ingredient.id}
                      className="bg-[#0F150E] rounded-lg p-4 border border-[#3A4D23]"
                    >
                      <div className="font-medium text-white">{ingredient.name}</div>
                      <div className="text-sm text-gray-400 mt-1">{ingredient.category}</div>
                      <div className="text-xs text-[#B6C948] mt-2">
                        {ingredient.calories_per_100g} kcal per 100g
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        P: {ingredient.protein_per_100g}g | C: {ingredient.carbs_per_100g}g | F: {ingredient.fat_per_100g}g
                      </div>
                      {ingredient.is_carnivore && (
                        <div className="text-xs text-orange-400 mt-1">🥩 Carnivoor</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#3A4D23]">
          <div className="text-sm text-gray-400">
            {activeTab === 'daily_plans' && `Bewerk maaltijden voor ${DAYS.find(d => d.key === selectedDay)?.label}`}
          </div>
          <div className="flex space-x-3">
            <AdminButton
              onClick={onClose}
              variant="secondary"
              className="px-6 py-2"
            >
              Annuleren
            </AdminButton>
            <AdminButton
              onClick={handleSave}
              loading={loading}
              className="px-6 py-2"
            >
              Opslaan
            </AdminButton>
          </div>
        </div>
      </div>

      {/* Meal Edit Modal */}
      {showMealModal && (
        <MealEditModal
          day={selectedDay}
          meal={selectedMeal}
          ingredients={getMealData(selectedDay, selectedMeal).ingredients}
          availableIngredients={ingredients}
          onSave={handleMealSave}
          onClose={() => setShowMealModal(false)}
        />
      )}
    </div>
  );
}
