'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import ImageUpload from './ImageUpload';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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

interface Recipe {
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

interface RecipeBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  recipe?: Recipe | null;
  ingredients: Ingredient[];
  onSave: (recipe: Recipe) => void;
}

const mealTypes = ['Ontbijt', 'Lunch', 'Diner', 'Snack', 'Hoofdgerecht'];
const units = ['g', 'kg', 'ml', 'l', 'stuks', 'eetlepel', 'theelepel'];

export default function RecipeBuilder({ isOpen, onClose, recipe, ingredients, onSave }: RecipeBuilderProps) {
  const [formData, setFormData] = useState<Partial<Recipe>>({
    name: '',
    description: '',
    mealType: 'Hoofdgerecht',
    prepTime: 30,
    servings: 1,
    ingredients: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  });

  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [ingredientAmount, setIngredientAmount] = useState(100);
  const [ingredientUnit, setIngredientUnit] = useState('g');

  useEffect(() => {
    if (recipe) {
      setFormData(recipe);
    } else {
      setFormData({
        name: '',
        description: '',
        mealType: 'Hoofdgerecht',
        prepTime: 30,
        servings: 1,
        ingredients: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      });
    }
  }, [recipe]);

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  const calculateIngredientNutrition = (ingredient: Ingredient, amount: number, unit: string) => {
    let multiplier = 1;
    
    // Convert to grams for calculation
    if (unit === 'kg') multiplier = 1000;
    else if (unit === 'l') multiplier = 1000;
    else if (unit === 'ml') multiplier = 1;
    else if (unit === 'g') multiplier = 1;
    else if (unit === 'eetlepel') multiplier = 15; // Approximate
    else if (unit === 'theelepel') multiplier = 5; // Approximate
    else if (unit === 'stuks') multiplier = 1; // Will need specific item weights
    
    const grams = amount * multiplier;
    const ratio = grams / 100; // Per 100g basis
    
    return {
      calories: Math.round(ingredient.calories * ratio),
      protein: Math.round(ingredient.protein * ratio * 10) / 10,
      carbs: Math.round(ingredient.carbs * ratio * 10) / 10,
      fat: Math.round(ingredient.fat * ratio * 10) / 10,
    };
  };

  const addIngredient = () => {
    if (!selectedIngredient) return;

    const nutrition = calculateIngredientNutrition(selectedIngredient, ingredientAmount, ingredientUnit);
    
    const newIngredient: RecipeIngredient = {
      ingredientId: selectedIngredient.id,
      ingredientName: selectedIngredient.name,
      amount: ingredientAmount,
      unit: ingredientUnit,
      ...nutrition,
    };

    const updatedIngredients = [...(formData.ingredients || []), newIngredient];
    const totals = updatedIngredients.reduce(
      (acc, ing) => ({
        calories: acc.calories + ing.calories,
        protein: acc.protein + ing.protein,
        carbs: acc.carbs + ing.carbs,
        fat: acc.fat + ing.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    setFormData({
      ...formData,
      ingredients: updatedIngredients,
      totalCalories: totals.calories,
      totalProtein: Math.round(totals.protein * 10) / 10,
      totalCarbs: Math.round(totals.carbs * 10) / 10,
      totalFat: Math.round(totals.fat * 10) / 10,
    });

    setShowIngredientModal(false);
    setSelectedIngredient(null);
    setIngredientAmount(100);
    setIngredientUnit('g');
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = formData.ingredients?.filter((_, i) => i !== index) || [];
    const totals = updatedIngredients.reduce(
      (acc, ing) => ({
        calories: acc.calories + ing.calories,
        protein: acc.protein + ing.protein,
        carbs: acc.carbs + ing.carbs,
        fat: acc.fat + ing.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    setFormData({
      ...formData,
      ingredients: updatedIngredients,
      totalCalories: totals.calories,
      totalProtein: Math.round(totals.protein * 10) / 10,
      totalCarbs: Math.round(totals.carbs * 10) / 10,
      totalFat: Math.round(totals.fat * 10) / 10,
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      alert('Vul alle verplichte velden in');
      return;
    }

    const recipeData: Recipe = {
      id: recipe?.id || Date.now().toString(),
      name: formData.name!,
      description: formData.description!,
      mealType: formData.mealType!,
      image: formData.image || '/images/recipes/placeholder.jpg',
      ingredients: formData.ingredients || [],
      totalCalories: formData.totalCalories || 0,
      totalProtein: formData.totalProtein || 0,
      totalCarbs: formData.totalCarbs || 0,
      totalFat: formData.totalFat || 0,
      prepTime: formData.prepTime || 30,
      servings: formData.servings || 1,
    };

    onSave(recipeData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#3A4D23]">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {recipe ? 'Recept Bewerken' : 'Nieuw Recept Toevoegen'}
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
                Naam Recept *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                placeholder="Bijv. Gegrilde Kipfilet met Broccoli"
              />
            </div>

            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">
                Type Maaltijd
              </label>
              <select
                value={formData.mealType || 'Hoofdgerecht'}
                onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
              >
                {mealTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">
                Bereidingstijd (minuten)
              </label>
              <input
                type="number"
                value={formData.prepTime || 30}
                onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                min="1"
              />
            </div>

            <div>
              <label className="block text-[#8BAE5A] text-sm font-medium mb-2">
                Aantal Porties
              </label>
              <input
                type="number"
                value={formData.servings || 1}
                onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                min="1"
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
              placeholder="Beschrijf het recept en de bereidingswijze..."
            />
          </div>

          {/* Image Upload */}
          <ImageUpload
            currentImage={formData.image}
            onImageChange={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
          />

          {/* Ingredients Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Ingrediënten</h3>
              <button
                onClick={() => setShowIngredientModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#8BAE5A] text-black rounded-lg text-sm font-medium hover:bg-[#A6C97B] transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Ingrediënt Toevoegen
              </button>
            </div>

            {formData.ingredients && formData.ingredients.length > 0 ? (
              <div className="space-y-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#181F17] rounded-lg border border-[#3A4D23]/40">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{ingredient.ingredientName}</span>
                        <span className="text-[#8BAE5A] text-sm">
                          {ingredient.amount} {ingredient.unit}
                        </span>
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        {ingredient.calories} kcal | {ingredient.protein}g eiwit | {ingredient.carbs}g koolhydraten | {ingredient.fat}g vet
                      </div>
                    </div>
                    <button
                      onClick={() => removeIngredient(index)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#8BAE5A]/60">
                Nog geen ingrediënten toegevoegd
              </div>
            )}
          </div>

          {/* Nutrition Summary */}
          {formData.ingredients && formData.ingredients.length > 0 && (
            <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]/40">
              <h4 className="text-white font-semibold mb-3">Voedingswaarden (Totaal)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#8BAE5A]">{formData.totalCalories}</div>
                  <div className="text-sm text-white/60">Calorieën</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#8BAE5A]">{formData.totalProtein}g</div>
                  <div className="text-sm text-white/60">Eiwitten</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#8BAE5A]">{formData.totalCarbs}g</div>
                  <div className="text-sm text-white/60">Koolhydraten</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#8BAE5A]">{formData.totalFat}g</div>
                  <div className="text-sm text-white/60">Vetten</div>
                </div>
              </div>
              {formData.servings && formData.servings > 1 && (
                <div className="mt-4 pt-4 border-t border-[#3A4D23]/40">
                  <h5 className="text-white font-semibold mb-2">Per Portie ({formData.servings} porties)</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#8BAE5A]">{Math.round((formData.totalCalories || 0) / (formData.servings || 1))}</div>
                      <div className="text-sm text-white/60">Calorieën</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#8BAE5A]">{Math.round(((formData.totalProtein || 0) / (formData.servings || 1)) * 10) / 10}g</div>
                      <div className="text-sm text-white/60">Eiwitten</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#8BAE5A]">{Math.round(((formData.totalCarbs || 0) / (formData.servings || 1)) * 10) / 10}g</div>
                      <div className="text-sm text-white/60">Koolhydraten</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#8BAE5A]">{Math.round(((formData.totalFat || 0) / (formData.servings || 1)) * 10) / 10}g</div>
                      <div className="text-sm text-white/60">Vetten</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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
            {recipe ? 'Bijwerken' : 'Opslaan'}
          </button>
        </div>
      </div>

      {/* Ingredient Selection Modal */}
      {showIngredientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] rounded-xl max-w-md w-full">
            <div className="p-4 border-b border-[#3A4D23]">
              <h3 className="text-lg font-semibold text-white">Ingrediënt Toevoegen</h3>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[#8BAE5A] text-sm font-medium mb-2">
                  Zoek Ingrediënt
                </label>
                <input
                  type="text"
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                  placeholder="Type om te zoeken..."
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredIngredients.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    onClick={() => setSelectedIngredient(ingredient)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedIngredient?.id === ingredient.id
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                        : 'border-[#3A4D23] bg-[#181F17] hover:border-[#8BAE5A]/40'
                    }`}
                  >
                    <div className="text-white font-medium">{ingredient.name}</div>
                    <div className="text-sm text-[#8BAE5A]">{ingredient.category}</div>
                    <div className="text-xs text-white/60">
                      {ingredient.calories} kcal | {ingredient.protein}g eiwit | {ingredient.carbs}g koolhydraten | {ingredient.fat}g vet (per 100g)
                    </div>
                  </button>
                ))}
              </div>

              {selectedIngredient && (
                <div className="space-y-3 p-3 bg-[#181F17] rounded-lg border border-[#3A4D23]/40">
                  <div className="text-white font-medium">Geselecteerd: {selectedIngredient.name}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#8BAE5A] text-sm font-medium mb-1">
                        Hoeveelheid
                      </label>
                      <input
                        type="number"
                        value={ingredientAmount}
                        onChange={(e) => setIngredientAmount(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                        min="0"
                        step="1"
                      />
                    </div>
                    <div>
                      <label className="block text-[#8BAE5A] text-sm font-medium mb-1">
                        Eenheid
                      </label>
                      <select
                        value={ingredientUnit}
                        onChange={(e) => setIngredientUnit(e.target.value)}
                        className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#3A4D23] flex justify-end gap-3">
              <button
                onClick={() => setShowIngredientModal(false)}
                className="px-4 py-2 text-[#8BAE5A] hover:text-white transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={addIngredient}
                disabled={!selectedIngredient}
                className="px-4 py-2 bg-[#8BAE5A] text-black font-semibold rounded-lg hover:bg-[#A6C97B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 