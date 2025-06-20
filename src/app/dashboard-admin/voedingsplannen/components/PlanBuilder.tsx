'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Recipe {
  id: string;
  name: string;
  description: string;
  mealType: string;
  image: string;
  ingredients: any[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  prepTime: number;
  servings: number;
}

interface MealStructure {
  mealType: string;
  recipes: string[]; // Recipe IDs
}

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  meals: MealStructure[];
}

interface PlanBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: NutritionPlan | null;
  recipes: Recipe[];
  onSave: (plan: NutritionPlan) => void;
}

const mealTypes = ['Ontbijt', 'Lunch', 'Diner', 'Snack'];

export default function PlanBuilder({ isOpen, onClose, plan, recipes, onSave }: PlanBuilderProps) {
  const [formData, setFormData] = useState<Partial<NutritionPlan>>({
    name: '',
    description: '',
    meals: [],
  });

  const [showMealModal, setShowMealModal] = useState(false);
  const [editingMealIndex, setEditingMealIndex] = useState<number | null>(null);
  const [selectedMealType, setSelectedMealType] = useState('Ontbijt');
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

  useEffect(() => {
    if (plan) {
      setFormData(plan);
    } else {
      setFormData({
        name: '',
        description: '',
        meals: [],
      });
    }
  }, [plan]);

  const handleAddMeal = () => {
    setEditingMealIndex(null);
    setSelectedMealType('Ontbijt');
    setSelectedRecipes([]);
    setShowMealModal(true);
  };

  const handleEditMeal = (index: number) => {
    const meal = formData.meals?.[index];
    if (meal) {
      setEditingMealIndex(index);
      setSelectedMealType(meal.mealType);
      setSelectedRecipes(meal.recipes);
      setShowMealModal(true);
    }
  };

  const handleSaveMeal = () => {
    if (!selectedMealType || selectedRecipes.length === 0) {
      alert('Selecteer een maaltijdtype en ten minste één recept');
      return;
    }

    const newMeal: MealStructure = {
      mealType: selectedMealType,
      recipes: selectedRecipes,
    };

    const updatedMeals = [...(formData.meals || [])];
    
    if (editingMealIndex !== null) {
      updatedMeals[editingMealIndex] = newMeal;
    } else {
      updatedMeals.push(newMeal);
    }

    setFormData({
      ...formData,
      meals: updatedMeals,
    });

    setShowMealModal(false);
    setEditingMealIndex(null);
    setSelectedMealType('Ontbijt');
    setSelectedRecipes([]);
  };

  const handleRemoveMeal = (index: number) => {
    const updatedMeals = formData.meals?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      meals: updatedMeals,
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      alert('Vul alle verplichte velden in');
      return;
    }

    if (!formData.meals || formData.meals.length === 0) {
      alert('Voeg ten minste één maaltijd toe');
      return;
    }

    const planData: NutritionPlan = {
      id: plan?.id || Date.now().toString(),
      name: formData.name!,
      description: formData.description!,
      meals: formData.meals!,
    };

    onSave(planData);
    onClose();
  };

  const getRecipeById = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#3A4D23]">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {plan ? 'Voedingsplan Bewerken' : 'Nieuw Voedingsplan'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[#8BAE5A] hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* General Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">
                Naam Plan *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                placeholder="Bijv. Gebalanceerd Dieet"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#8BAE5A] text-sm font-medium mb-2">
              Omschrijving *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
              placeholder="Beschrijf het voedingsplan en de doelstellingen..."
            />
          </div>

          {/* Meals Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Maaltijden</h3>
              <button
                onClick={handleAddMeal}
                className="flex items-center gap-2 px-3 py-2 bg-[#8BAE5A] text-black rounded-lg text-sm font-medium hover:bg-[#A6C97B] transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Maaltijd Toevoegen
              </button>
            </div>

            {formData.meals && formData.meals.length > 0 ? (
              <div className="space-y-4">
                {formData.meals.map((meal, index) => (
                  <div key={index} className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]/40">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-semibold">{meal.mealType}</h4>
                        <p className="text-[#8BAE5A] text-sm">
                          {meal.recipes.length} recept{meal.recipes.length !== 1 ? 'en' : ''} geselecteerd
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditMeal(index)}
                          className="px-3 py-1 text-[#8BAE5A] hover:text-white transition-colors text-sm"
                        >
                          Bewerk
                        </button>
                        <button
                          onClick={() => handleRemoveMeal(index)}
                          className="px-3 py-1 text-red-400 hover:text-red-300 transition-colors text-sm"
                        >
                          Verwijder
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {meal.recipes.map((recipeId) => {
                        const recipe = getRecipeById(recipeId);
                        return recipe ? (
                          <div key={recipeId} className="flex items-center justify-between p-2 bg-[#232D1A] rounded border border-[#3A4D23]/40">
                            <div>
                              <div className="text-white font-medium">{recipe.name}</div>
                              <div className="text-xs text-[#8BAE5A]">
                                {recipe.totalCalories} kcal | {recipe.totalProtein}g eiwit | {recipe.totalCarbs}g koolhydraten | {recipe.totalFat}g vet
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#8BAE5A]/60">
                Nog geen maaltijden toegevoegd
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-[#3A4D23] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#8BAE5A] hover:text-white transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#8BAE5A] text-black font-semibold rounded-lg hover:bg-[#A6C97B] transition-colors"
          >
            {plan ? 'Bijwerken' : 'Opslaan'}
          </button>
        </div>
      </div>

      {/* Meal Selection Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] rounded-xl max-w-2xl w-full">
            <div className="p-4 border-b border-[#3A4D23]">
              <h3 className="text-lg font-semibold text-white">
                {editingMealIndex !== null ? 'Maaltijd Bewerken' : 'Maaltijd Toevoegen'}
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[#8BAE5A] text-sm font-medium mb-2">
                  Type Maaltijd
                </label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                >
                  {mealTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#8BAE5A] text-sm font-medium mb-2">
                  Selecteer Recepten
                </label>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {recipes.map((recipe) => (
                    <label key={recipe.id} className="flex items-center p-3 bg-[#181F17] rounded-lg border border-[#3A4D23]/40 hover:border-[#8BAE5A]/40 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRecipes.includes(recipe.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecipes([...selectedRecipes, recipe.id]);
                          } else {
                            setSelectedRecipes(selectedRecipes.filter(id => id !== recipe.id));
                          }
                        }}
                        className="mr-3 text-[#8BAE5A] focus:ring-[#8BAE5A]"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">{recipe.name}</div>
                        <div className="text-sm text-[#8BAE5A]">{recipe.mealType}</div>
                        <div className="text-xs text-white/60">
                          {recipe.totalCalories} kcal | {recipe.totalProtein}g eiwit | {recipe.totalCarbs}g koolhydraten | {recipe.totalFat}g vet
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#3A4D23] flex justify-end gap-3">
              <button
                onClick={() => setShowMealModal(false)}
                className="px-4 py-2 text-[#8BAE5A] hover:text-white transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveMeal}
                className="px-6 py-2 bg-[#8BAE5A] text-black font-semibold rounded-lg hover:bg-[#A6C97B] transition-colors"
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 