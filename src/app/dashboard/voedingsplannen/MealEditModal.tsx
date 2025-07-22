'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface Meal {
  id: string;
  name: string;
  image: string;
  ingredients: Ingredient[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface MealEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
  onSave: (updatedMeal: Meal) => void;
  nutritionGoals: { calories: number; protein: number; carbs: number; fat: number } | null;
}

// Alternative meal options for each meal type
const alternativeMeals = {
  breakfast: [
    {
      name: 'Havermout met Bessen & Noten',
      image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Havermout', amount: 60, unit: 'gram' },
        { name: 'Melk', amount: 250, unit: 'ml' },
        { name: 'Blauwe bessen', amount: 50, unit: 'gram' },
        { name: 'Walnoten', amount: 15, unit: 'gram' }
      ]
    },
    {
      name: 'Griekse Yoghurt Bowl',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Griekse yoghurt', amount: 200, unit: 'gram' },
        { name: 'Muesli', amount: 40, unit: 'gram' },
        { name: 'Honing', amount: 10, unit: 'gram' },
        { name: 'Bessen', amount: 50, unit: 'gram' }
      ]
    },
    {
      name: 'Proteïne Pannenkoeken',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Proteïne poeder', amount: 30, unit: 'gram' },
        { name: 'Havermout', amount: 40, unit: 'gram' },
        { name: 'Ei', amount: 1, unit: 'stuk' },
        { name: 'Magere kwark', amount: 100, unit: 'gram' }
      ]
    },
    {
      name: 'Gebakken Eieren met Spek',
      image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Eieren', amount: 3, unit: 'stuks' },
        { name: 'Spek', amount: 30, unit: 'gram' }
      ]
    }
  ],
  lunch: [
    {
      name: 'Volkoren Wrap met Kip',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Volkoren wrap', amount: 1, unit: 'stuk' },
        { name: 'Kipfilet', amount: 100, unit: 'gram' },
        { name: 'Paprika', amount: 50, unit: 'gram' },
        { name: 'Komkommer', amount: 50, unit: 'gram' },
        { name: 'Hummus', amount: 30, unit: 'gram' }
      ]
    },
    {
      name: 'Omelet met Groenten',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Eieren', amount: 3, unit: 'stuks' },
        { name: 'Spinazie', amount: 50, unit: 'gram' },
        { name: 'Tomaat', amount: 50, unit: 'gram' },
        { name: 'Feta', amount: 30, unit: 'gram' }
      ]
    },
    {
      name: 'Tonijnsalade',
      image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Tonijn uit blik', amount: 1, unit: 'blik' },
        { name: 'Kidneybonen', amount: 50, unit: 'gram' },
        { name: 'Paprika', amount: 50, unit: 'gram' },
        { name: 'Olijfolie', amount: 10, unit: 'ml' }
      ]
    },
    {
      name: 'Gegrilde Ribeye',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Ribeye Steak', amount: 150, unit: 'gram' },
        { name: 'Boter', amount: 15, unit: 'gram' }
      ]
    }
  ],
  dinner: [
    {
      name: 'Zalmfilet met Groenten',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Zalmfilet', amount: 150, unit: 'gram' },
        { name: 'Zoete aardappel', amount: 200, unit: 'gram' },
        { name: 'Broccoli', amount: 150, unit: 'gram' }
      ]
    },
    {
      name: 'Kipfilet met Courgette',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Kipfilet', amount: 150, unit: 'gram' },
        { name: 'Courgette', amount: 100, unit: 'gram' },
        { name: 'Avocado', amount: 50, unit: 'gram' }
      ]
    },
    {
      name: 'Biefstuk met Sperziebonen',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Biefstuk', amount: 150, unit: 'gram' },
        { name: 'Sperziebonen', amount: 100, unit: 'gram' },
        { name: 'Zoete aardappel', amount: 150, unit: 'gram' }
      ]
    },
    {
      name: 'Gehaktballen met Kaas',
      image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Rundergehakt', amount: 150, unit: 'gram' },
        { name: 'Kaas', amount: 30, unit: 'gram' }
      ]
    }
  ],
  snack: [
    {
      name: 'Noten & Fruit Mix',
      image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Amandelen', amount: 20, unit: 'gram' },
        { name: 'Appel', amount: 1, unit: 'stuk' }
      ]
    },
    {
      name: 'Yoghurt met Bessen',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Griekse yoghurt', amount: 150, unit: 'gram' },
        { name: 'Bessen', amount: 50, unit: 'gram' }
      ]
    },
    {
      name: 'Proteïne Shake',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
      ingredients: [
        { name: 'Proteïne poeder', amount: 25, unit: 'gram' },
        { name: 'Melk', amount: 250, unit: 'ml' },
        { name: 'Banaan', amount: 0.5, unit: 'stuk' }
      ]
    }
  ]
};

export default function MealEditModal({ isOpen, onClose, meal, onSave, nutritionGoals }: MealEditModalProps) {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [editingMode, setEditingMode] = useState<'alternatives' | 'custom'>('alternatives');
  const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    if (meal) {
      setSelectedMeal(meal);
      setCustomIngredients([...meal.ingredients]);
    }
  }, [meal]);

  const handleAlternativeSelect = (alternative: any) => {
    if (!selectedMeal || !nutritionGoals) return;

    // Calculate new nutritional values based on the alternative meal
    const totalCalories = nutritionGoals.calories * (selectedMeal.type === 'snack' ? 0.075 : 0.3);
    const calorieRatio = totalCalories / 400; // Base calories for calculation

    const newMeal: Meal = {
      ...selectedMeal,
      name: alternative.name,
      image: alternative.image,
      ingredients: alternative.ingredients.map((ing: Ingredient) => ({
        ...ing,
        amount: Math.round(ing.amount * calorieRatio * 10) / 10
      })),
      calories: Math.round(totalCalories),
      protein: Math.round(nutritionGoals.protein * (selectedMeal.type === 'snack' ? 0.075 : 0.3)),
      carbs: Math.round(nutritionGoals.carbs * (selectedMeal.type === 'snack' ? 0.075 : 0.3)),
      fat: Math.round(nutritionGoals.fat * (selectedMeal.type === 'snack' ? 0.075 : 0.3))
    };

    setSelectedMeal(newMeal);
    setCustomIngredients([...newMeal.ingredients]);
  };

  const handleIngredientChange = (index: number, field: 'name' | 'amount' | 'unit', value: string | number) => {
    const updatedIngredients = [...customIngredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: field === 'amount' ? Number(value) : value
    };
    setCustomIngredients(updatedIngredients);
  };

  const addIngredient = () => {
    setCustomIngredients([...customIngredients, { name: '', amount: 0, unit: 'gram' }]);
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = customIngredients.filter((_, i) => i !== index);
    setCustomIngredients(updatedIngredients);
  };

  const handleSave = () => {
    if (!selectedMeal) return;

    const updatedMeal: Meal = {
      ...selectedMeal,
      ingredients: editingMode === 'custom' ? customIngredients : selectedMeal.ingredients
    };

    onSave(updatedMeal);
    onClose();
  };

  if (!meal) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1A1A1A] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Wijzig {meal.type === 'breakfast' ? 'Ontbijt' : 
                       meal.type === 'lunch' ? 'Lunch' : 
                       meal.type === 'dinner' ? 'Diner' : 'Snack'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setEditingMode('alternatives')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  editingMode === 'alternatives'
                    ? 'bg-[#8BAE5A] text-white'
                    : 'bg-[#2A2A2A] text-gray-300 hover:text-white'
                }`}
              >
                Alternatieve Maaltijden
              </button>
              <button
                onClick={() => setEditingMode('custom')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  editingMode === 'custom'
                    ? 'bg-[#8BAE5A] text-white'
                    : 'bg-[#2A2A2A] text-gray-300 hover:text-white'
                }`}
              >
                Aangepaste Ingrediënten
              </button>
            </div>

            {editingMode === 'alternatives' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alternativeMeals[meal.type]?.map((alternative, index) => (
                    <button
                      key={index}
                      onClick={() => handleAlternativeSelect(alternative)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedMeal?.name === alternative.name
                          ? 'border-[#8BAE5A] bg-[#232D1A]'
                          : 'border-[#3A4D23] bg-[#2A2A2A] hover:border-[#5A6D43]'
                      }`}
                    >
                      <img
                        src={alternative.image}
                        alt={alternative.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h3 className="text-lg font-semibold text-white mb-2">{alternative.name}</h3>
                      <div className="text-sm text-gray-400">
                        {alternative.ingredients.map((ing, i) => (
                          <div key={i}>• {ing.name}: {ing.amount} {ing.unit}</div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#2A2A2A] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Huidige Maaltijd</h3>
                  <div className="flex gap-4">
                    <img
                      src={selectedMeal?.image}
                      alt={selectedMeal?.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="text-white font-medium">{selectedMeal?.name}</h4>
                      <div className="text-sm text-gray-400 mt-1">
                        {selectedMeal?.calories} kcal | {selectedMeal?.protein}g eiwit | {selectedMeal?.carbs}g koolhydraten | {selectedMeal?.fat}g vet
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Ingrediënten Aanpassen</h3>
                    <button
                      onClick={addIngredient}
                      className="flex items-center gap-2 bg-[#8BAE5A] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#7A9D4B] transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Toevoegen
                    </button>
                  </div>

                  <div className="space-y-3">
                    {customIngredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                          placeholder="Ingrediënt naam"
                          className="flex-1 bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-[#8BAE5A] focus:outline-none"
                        />
                        <input
                          type="number"
                          value={ingredient.amount}
                          onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                          placeholder="Hoeveelheid"
                          className="w-24 bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-[#8BAE5A] focus:outline-none"
                        />
                        <select
                          value={ingredient.unit}
                          onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                          className="w-20 bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                        >
                          <option value="gram">gram</option>
                          <option value="ml">ml</option>
                          <option value="stuk">stuk</option>
                          <option value="blik">blik</option>
                        </select>
                        <button
                          onClick={() => removeIngredient(index)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8 pt-6 border-t border-[#3A4D23]">
              <button
                onClick={onClose}
                className="flex-1 bg-[#2A2A2A] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#3A3A3A] transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#7A9D4B] hover:to-[#5A7D2A] transition-all"
              >
                Opslaan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 