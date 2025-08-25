'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface Meal {
  id?: string;
  name: string;
  description: string;
  meal_type: 'ontbijt' | 'lunch' | 'diner' | 'snack';
  category: 'carnivoor' | 'flexibel' | 'vegetarisch';
  plan_type: string;
  goal: string;
  day?: string;
  is_cheat_day?: boolean;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  prep_time: number;
  difficulty: 'makkelijk' | 'gemiddeld' | 'moeilijk';
  is_featured: boolean;
  is_active: boolean;
}

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
  onSave: (meal: Meal) => void;
}

export default function MealModal({ isOpen, onClose, meal, onSave }: MealModalProps) {
  const [formData, setFormData] = useState<Meal>({
    name: '',
    description: '',
    meal_type: 'ontbijt',
    category: 'carnivoor',
    plan_type: 'Carnivoor / Animal Based',
    goal: 'Spiermassa',
    ingredients: [],
    instructions: [],
    nutrition_info: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    prep_time: 15,
    difficulty: 'makkelijk',
    is_featured: false,
    is_active: true
  });

  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: 0, unit: 'gram' });
  const [newInstruction, setNewInstruction] = useState('');

  useEffect(() => {
    if (meal) {
      setFormData(meal);
    } else {
      setFormData({
        name: '',
        description: '',
        meal_type: 'ontbijt',
        category: 'carnivoor',
        plan_type: 'Carnivoor / Animal Based',
        goal: 'Spiermassa',
        ingredients: [],
        instructions: [],
        nutrition_info: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        },
        prep_time: 15,
        difficulty: 'makkelijk',
        is_featured: false,
        is_active: true
      });
    }
  }, [meal]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNutritionChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      nutrition_info: {
        ...prev.nutrition_info,
        [field]: value
      }
    }));
  };

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.quantity > 0) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, { ...newIngredient }]
      }));
      setNewIngredient({ name: '', quantity: 0, unit: 'gram' });
    }
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setFormData(prev => ({
        ...prev,
        instructions: [...prev.instructions, newInstruction.trim()]
      }));
      setNewInstruction('');
    }
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      alert('Vul alle verplichte velden in');
      return;
    }
    onSave(formData);
    onClose();
  };

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
                {meal ? 'Bewerk Maaltijd' : 'Nieuwe Maaltijd'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                    Naam *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-[#8BAE5A] focus:outline-none"
                    placeholder="Maaltijd naam"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                    Beschrijving *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-[#8BAE5A] focus:outline-none"
                    placeholder="Beschrijving van de maaltijd"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Maaltijd Type
                    </label>
                    <select
                      value={formData.meal_type}
                      onChange={(e) => handleInputChange('meal_type', e.target.value)}
                      className="w-full bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                    >
                      <option value="ontbijt">Ontbijt</option>
                      <option value="lunch">Lunch</option>
                      <option value="diner">Diner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Categorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                    >
                      <option value="carnivoor">Carnivoor</option>
                      <option value="flexibel">Flexibel</option>
                      <option value="vegetarisch">Vegetarisch</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Plan Type
                    </label>
                    <select
                      value={formData.plan_type}
                      onChange={(e) => handleInputChange('plan_type', e.target.value)}
                      className="w-full bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                    >
                      <option value="Carnivoor / Animal Based">Carnivoor / Animal Based</option>
                      <option value="Voedingsplan op Maat">Voedingsplan op Maat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Doel
                    </label>
                    <select
                      value={formData.goal}
                      onChange={(e) => handleInputChange('goal', e.target.value)}
                      className="w-full bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                    >
                      <option value="Spiermassa">Spiermassa</option>
                      <option value="Onderhoud">Onderhoud</option>
                      <option value="Droogtrainen">Droogtrainen</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Prep Tijd (min)
                    </label>
                    <input
                      type="number"
                      value={formData.prep_time}
                      onChange={(e) => handleInputChange('prep_time', parseInt(e.target.value))}
                      className="w-full bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Moeilijkheid
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                    >
                      <option value="makkelijk">Makkelijk</option>
                      <option value="gemiddeld">Gemiddeld</option>
                      <option value="moeilijk">Moeilijk</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-[#8BAE5A]">Aanbevolen</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_cheat_day}
                        onChange={(e) => handleInputChange('is_cheat_day', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-[#8BAE5A]">Cheat Day</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Nutrition Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Voedingswaarden</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Calorieën
                    </label>
                    <input
                      type="number"
                      value={formData.nutrition_info.calories}
                      onChange={(e) => handleNutritionChange('calories', parseInt(e.target.value))}
                      className="w-full bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Eiwitten (g)
                    </label>
                    <input
                      type="number"
                      value={formData.nutrition_info.protein}
                      onChange={(e) => handleNutritionChange('protein', parseInt(e.target.value))}
                      className="w-full bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Koolhydraten (g)
                    </label>
                    <input
                      type="number"
                      value={formData.nutrition_info.carbs}
                      onChange={(e) => handleNutritionChange('carbs', parseInt(e.target.value))}
                      className="w-full bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Vetten (g)
                    </label>
                    <input
                      type="number"
                      value={formData.nutrition_info.fat}
                      onChange={(e) => handleNutritionChange('fat', parseInt(e.target.value))}
                      className="w-full bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Ingrediënten</h3>
                  
                  <div className="space-y-2 mb-3">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-white text-sm flex-1">{ingredient.name}</span>
                        <span className="text-[#8BAE5A] text-sm">{ingredient.quantity} {ingredient.unit}</span>
                        <button
                          onClick={() => removeIngredient(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ingrediënt naam"
                      className="flex-1 bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-[#8BAE5A] focus:outline-none"
                    />
                    <input
                      type="number"
                      value={newIngredient.quantity}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                      placeholder="Hoeveelheid"
                      className="w-20 bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-[#8BAE5A] focus:outline-none"
                    />
                    <select
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-20 bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:border-[#8BAE5A] focus:outline-none"
                    >
                      <option value="gram">gram</option>
                      <option value="ml">ml</option>
                      <option value="stuk">stuk</option>
                      <option value="theelepel">theelepel</option>
                      <option value="eetlepel">eetlepel</option>
                      <option value="snufje">snufje</option>
                      <option value="takje">takje</option>
                      <option value="teentjes">teentjes</option>
                      <option value="bessen">bessen</option>
                    </select>
                    <button
                      onClick={addIngredient}
                      className="bg-[#8BAE5A] text-white px-3 py-2 rounded-lg hover:bg-[#7A9D4B] transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Bereidingsinstructies</h3>
                  
                  <div className="space-y-2 mb-3">
                    {formData.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <span className="text-[#8BAE5A] text-sm font-bold">{index + 1}.</span>
                        <span className="text-white text-sm flex-1">{instruction}</span>
                        <button
                          onClick={() => removeInstruction(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInstruction}
                      onChange={(e) => setNewInstruction(e.target.value)}
                      placeholder="Nieuwe instructie"
                      className="flex-1 bg-[#2A2A2A] border border-[#3A4D23] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-[#8BAE5A] focus:outline-none"
                      onKeyPress={(e) => e.key === 'Enter' && addInstruction()}
                    />
                    <button
                      onClick={addInstruction}
                      className="bg-[#8BAE5A] text-white px-3 py-2 rounded-lg hover:bg-[#7A9D4B] transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
