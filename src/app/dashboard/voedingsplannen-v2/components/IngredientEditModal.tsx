'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface IngredientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient?: any;
  meal?: { day: string; meal: string } | null;
  availableIngredients: any[];
  onSave: (ingredient: any) => void;
}

export default function IngredientEditModal({
  isOpen,
  onClose,
  ingredient,
  meal,
  availableIngredients,
  onSave
}: IngredientEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    unit: 'per_100g',
    calories_per_100g: 0,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fat_per_100g: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);

  useEffect(() => {
    if (ingredient) {
      // Editing existing ingredient
      setFormData({
        name: ingredient.name || '',
        amount: ingredient.amount?.toString() || '',
        unit: ingredient.unit || 'per_100g',
        calories_per_100g: ingredient.calories_per_100g || 0,
        protein_per_100g: ingredient.protein_per_100g || 0,
        carbs_per_100g: ingredient.carbs_per_100g || 0,
        fat_per_100g: ingredient.fat_per_100g || 0
      });
      setSelectedIngredient(ingredient);
    } else {
      // Adding new ingredient
      setFormData({
        name: '',
        amount: '',
        unit: 'per_100g',
        calories_per_100g: 0,
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fat_per_100g: 0
      });
      setSelectedIngredient(null);
    }
  }, [ingredient]);

  const filteredIngredients = availableIngredients.filter(ing => 
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIngredientSelect = (ing: any) => {
    setSelectedIngredient(ing);
    setFormData(prev => ({
      ...prev,
      name: ing.name,
      calories_per_100g: ing.calories_per_100g,
      protein_per_100g: ing.protein_per_100g,
      carbs_per_100g: ing.carbs_per_100g,
      fat_per_100g: ing.fat_per_100g,
      unit: ing.unit_type || 'per_100g'
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.amount) {
      alert('Naam en hoeveelheid zijn verplicht');
      return;
    }

    const ingredientData = {
      ...formData,
      amount: parseFloat(formData.amount),
      calories_per_100g: parseFloat(formData.calories_per_100g.toString()),
      protein_per_100g: parseFloat(formData.protein_per_100g.toString()),
      carbs_per_100g: parseFloat(formData.carbs_per_100g.toString()),
      fat_per_100g: parseFloat(formData.fat_per_100g.toString())
    };

    onSave(ingredientData);
  };

  const getUnitLabel = (unit: string) => {
    const labels: { [key: string]: string } = {
      'per_100g': 'Per 100g',
      'per_piece': 'Per stuk',
      'per_plakje': 'Per plakje',
      'per_ml': 'Per ml',
      'handje': 'Per handje'
    };
    return labels[unit] || unit;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-2xl shadow-2xl border border-[#3A4D23] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#B6C948]">
              {ingredient ? 'Bewerk ingrediënt' : 'Voeg ingrediënt toe'}
            </h2>
            <button
              onClick={onClose}
              className="text-[#8BAE5A] hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {meal && (
            <div className="mb-4 p-3 bg-[#181F17] rounded-lg border border-[#3A4D23]">
              <p className="text-[#8BAE5A] text-sm">
                <strong>Maaltijd:</strong> {meal.day} - {meal.meal}
              </p>
            </div>
          )}

          {/* Ingredient Search */}
          <div className="mb-6">
            <label className="block text-[#8BAE5A] font-medium mb-2">
              Zoek ingrediënt
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Typ om te zoeken..."
              className="w-full px-4 py-2 bg-[#181F17] text-[#B6C948] border border-[#3A4D23] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6C948]"
            />
            
            {searchTerm && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-[#3A4D23] rounded-lg">
                {filteredIngredients.map((ing, index) => (
                  <button
                    key={index}
                    onClick={() => handleIngredientSelect(ing)}
                    className="w-full text-left px-4 py-2 hover:bg-[#3A4D23] text-[#B6C948] border-b border-[#3A4D23] last:border-b-0"
                  >
                    <div className="font-medium">{ing.name}</div>
                    <div className="text-sm text-[#8BAE5A]">
                      {ing.calories_per_100g} kcal, {ing.protein_per_100g}g eiwit per 100g
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[#8BAE5A] font-medium mb-2">
                Naam
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-[#181F17] text-[#B6C948] border border-[#3A4D23] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6C948]"
                required
              />
            </div>

            <div>
              <label className="block text-[#8BAE5A] font-medium mb-2">
                Hoeveelheid
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-4 py-2 bg-[#181F17] text-[#B6C948] border border-[#3A4D23] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6C948]"
                required
              />
            </div>

            <div>
              <label className="block text-[#8BAE5A] font-medium mb-2">
                Eenheid
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-4 py-2 bg-[#181F17] text-[#B6C948] border border-[#3A4D23] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6C948]"
              >
                <option value="per_100g">Per 100g</option>
                <option value="per_piece">Per stuk</option>
                <option value="per_plakje">Per plakje</option>
                <option value="per_ml">Per ml</option>
                <option value="handje">Per handje</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8BAE5A] font-medium mb-2">
                Calorieën per 100g
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.calories_per_100g}
                onChange={(e) => setFormData(prev => ({ ...prev, calories_per_100g: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-[#181F17] text-[#B6C948] border border-[#3A4D23] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6C948]"
              />
            </div>

            <div>
              <label className="block text-[#8BAE5A] font-medium mb-2">
                Eiwit per 100g (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.protein_per_100g}
                onChange={(e) => setFormData(prev => ({ ...prev, protein_per_100g: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-[#181F17] text-[#B6C948] border border-[#3A4D23] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6C948]"
              />
            </div>

            <div>
              <label className="block text-[#8BAE5A] font-medium mb-2">
                Koolhydraten per 100g (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.carbs_per_100g}
                onChange={(e) => setFormData(prev => ({ ...prev, carbs_per_100g: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-[#181F17] text-[#B6C948] border border-[#3A4D23] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6C948]"
              />
            </div>

            <div>
              <label className="block text-[#8BAE5A] font-medium mb-2">
                Vet per 100g (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.fat_per_100g}
                onChange={(e) => setFormData(prev => ({ ...prev, fat_per_100g: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2 bg-[#181F17] text-[#B6C948] border border-[#3A4D23] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B6C948]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#B6C948] text-[#181F17] rounded-lg hover:bg-[#A5B83A] transition-colors font-medium"
            >
              {ingredient ? 'Bijwerken' : 'Toevoegen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
