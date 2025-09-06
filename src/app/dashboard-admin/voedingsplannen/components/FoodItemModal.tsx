'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

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

interface FoodItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodItem?: FoodItem | null;
  onSave: () => void;
}

export default function FoodItemModal({ isOpen, onClose, foodItem, onSave }: FoodItemModalProps) {
  const [formData, setFormData] = useState<Partial<FoodItem>>({
    name: '',
    category: '',
    calories_per_100g: 0,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fat_per_100g: 0,
    description: '',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Granen', 'Eiwitten', 'Vetten', 'Fruit', 'Zuivel', 'Vlees', 'Vis', 'Groente', 'Noten', 'Carnivoor', 'Eieren'
  ];

  useEffect(() => {
    if (foodItem) {
      setFormData({
        name: foodItem.name,
        category: foodItem.category,
        calories_per_100g: foodItem.calories_per_100g,
        protein_per_100g: foodItem.protein_per_100g,
        carbs_per_100g: foodItem.carbs_per_100g,
        fat_per_100g: foodItem.fat_per_100g,
        description: foodItem.description,
        is_active: foodItem.is_active
      });
    } else {
      setFormData({
        name: '',
        category: '',
        calories_per_100g: 0,
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fat_per_100g: 0,
        description: '',
        is_active: true
      });
    }
    setError('');
  }, [foodItem]);

  const handleInputChange = (field: keyof FoodItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category) {
      setError('Naam en categorie zijn verplicht');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (foodItem) {
        // Update existing item using API
        const response = await fetch('/api/admin/nutrition-ingredients', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: foodItem.id,
            ...formData,
            updated_at: new Date().toISOString()
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update food item');
        }
      } else {
        // Create new item using API
        const response = await fetch('/api/admin/nutrition-ingredients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create food item');
        }
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#3A4D23]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            {foodItem ? 'Bewerk Voedingsitem' : 'Nieuw Voedingsitem'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#8BAE5A] hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-400 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-1">
                Naam *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] transition-colors"
                placeholder="Voedingsitem naam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-1">
                Categorie *
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] transition-colors"
              >
                <option value="">Selecteer categorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-1">
                Beschrijving
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] transition-colors"
                rows={3}
                placeholder="Beschrijving van het voedingsitem"
              />
            </div>


          </div>

          {/* Nutritional Values */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-1">
                Calorieën (per 100g)
              </label>
              <input
                type="number"
                value={formData.calories_per_100g || ''}
                onChange={(e) => handleInputChange('calories_per_100g', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] transition-colors"
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-[#8BAE5A] mb-1">
                  Eiwit (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.protein_per_100g || ''}
                  onChange={(e) => handleInputChange('protein_per_100g', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] transition-colors"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8BAE5A] mb-1">
                  Koolhydraten (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.carbs_per_100g || ''}
                  onChange={(e) => handleInputChange('carbs_per_100g', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] transition-colors"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8BAE5A] mb-1">
                  Vet (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fat_per_100g || ''}
                  onChange={(e) => handleInputChange('fat_per_100g', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] transition-colors"
                  placeholder="0"
                />
              </div>
            </div>


          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-[#3A4D23]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#8BAE5A] bg-[#181F17] border border-[#3A4D23] rounded-lg hover:bg-[#232D1A] hover:text-white transition-colors"
            disabled={isLoading}
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-[#8BAE5A] text-[#181F17] font-semibold rounded-lg hover:bg-[#A6C97B] disabled:opacity-50 flex items-center space-x-2 transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#181F17]"></div>
                <span>Opslaan...</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                <span>Opslaan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
