'use client';

import React, { useState, useEffect } from 'react';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface Meal {
  name: string;
  time: string;
  main: string;
  options: string[];
  ingredients: Ingredient[];
}

interface MealEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
  onSave: (updatedMeal: Meal) => void;
}

export default function MealEditModal({ isOpen, onClose, meal, onSave }: MealEditModalProps) {
  const [editedMeal, setEditedMeal] = useState<Meal | null>(null);
  const [newOption, setNewOption] = useState('');
  const [newIngredient, setNewIngredient] = useState({ name: '', amount: 0, unit: 'g' });

  useEffect(() => {
    if (meal) {
      setEditedMeal({ ...meal });
    }
  }, [meal]);

  if (!isOpen || !editedMeal) return null;

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const updatedIngredients = [...editedMeal.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: field === 'amount' ? Number(value) : value
    };
    setEditedMeal({ ...editedMeal, ingredients: updatedIngredients });
  };

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.amount > 0) {
      setEditedMeal({
        ...editedMeal,
        ingredients: [...editedMeal.ingredients, { ...newIngredient }]
      });
      setNewIngredient({ name: '', amount: 0, unit: 'g' });
    }
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = editedMeal.ingredients.filter((_, i) => i !== index);
    setEditedMeal({ ...editedMeal, ingredients: updatedIngredients });
  };

  const addOption = () => {
    if (newOption.trim()) {
      setEditedMeal({
        ...editedMeal,
        options: [...editedMeal.options, newOption.trim()]
      });
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    const updatedOptions = editedMeal.options.filter((_, i) => i !== index);
    setEditedMeal({ ...editedMeal, options: updatedOptions });
  };

  const handleSave = () => {
    onSave(editedMeal);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181F17] rounded-xl border border-[#3A4D23] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
          <h2 className="text-[#B6C948] font-semibold text-xl">Maaltijd Bewerken</h2>
          <button
            onClick={onClose}
            className="text-[#8BAE5A] hover:text-[#7A9D4B] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-[#B6C948] font-medium mb-2">Maaltijd Naam</label>
              <input
                type="text"
                value={editedMeal.name}
                onChange={(e) => setEditedMeal({ ...editedMeal, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#B6C948] font-medium mb-2">Tijd</label>
              <input
                type="time"
                value={editedMeal.time}
                onChange={(e) => setEditedMeal({ ...editedMeal, time: e.target.value })}
                className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#B6C948] font-medium mb-2">Hoofdgerecht</label>
              <input
                type="text"
                value={editedMeal.main}
                onChange={(e) => setEditedMeal({ ...editedMeal, main: e.target.value })}
                className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
              />
            </div>
          </div>

          {/* Alternatives */}
          <div>
            <label className="block text-[#B6C948] font-medium mb-2">Alternatieven</label>
            <div className="space-y-2">
              {editedMeal.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const updatedOptions = [...editedMeal.options];
                      updatedOptions[index] = e.target.value;
                      setEditedMeal({ ...editedMeal, options: updatedOptions });
                    }}
                    className="flex-1 px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Verwijder
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Nieuwe alternatief toevoegen"
                  className="flex-1 px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                />
                <button
                  onClick={addOption}
                  className="px-4 py-2 bg-[#8BAE5A] hover:bg-[#7A9D4B] text-white rounded-lg transition-colors"
                >
                  Toevoegen
                </button>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-[#B6C948] font-medium mb-2">Ingrediënten</label>
            <div className="space-y-2">
              {editedMeal.ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    placeholder="Ingrediënt naam"
                    className="px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                  />
                  <input
                    type="number"
                    value={ingredient.amount}
                    onChange={(e) => handleIngredientChange(index, 'amount', Number(e.target.value))}
                    placeholder="Hoeveelheid"
                    className="px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <select
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="stuks">stuks</option>
                      <option value="eetlepel">eetlepel</option>
                      <option value="theelepel">theelepel</option>
                    </select>
                    <button
                      onClick={() => removeIngredient(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  placeholder="Nieuw ingrediënt"
                  className="px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                />
                <input
                  type="number"
                  value={newIngredient.amount}
                  onChange={(e) => setNewIngredient({ ...newIngredient, amount: Number(e.target.value) })}
                  placeholder="Hoeveelheid"
                  className="px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                />
                <div className="flex gap-2">
                  <select
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="stuks">stuks</option>
                    <option value="eetlepel">eetlepel</option>
                    <option value="theelepel">theelepel</option>
                  </select>
                  <button
                    onClick={addIngredient}
                    className="px-3 py-2 bg-[#8BAE5A] hover:bg-[#7A9D4B] text-white rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#3A4D23]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#8BAE5A] hover:text-[#7A9D4B] transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#B6C948] hover:bg-[#A5B837] text-white rounded-lg transition-colors"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
} 