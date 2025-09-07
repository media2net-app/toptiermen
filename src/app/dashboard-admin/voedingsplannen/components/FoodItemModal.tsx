'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import UnitTypeModal from './UnitTypeModal';
import CategoryModal from './CategoryModal';

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
  is_carnivore?: boolean;
  unit_type?: string;
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
    is_active: true,
    is_carnivore: false,
    unit_type: 'per_100g'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [unitTypes, setUnitTypes] = useState<any[]>([]);
  const [showUnitTypeModal, setShowUnitTypeModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Fallback categories if API fails
  const fallbackCategories = [
    'Granen', 'Eiwitten', 'Vetten', 'Fruit', 'Zuivel', 'Vlees', 'Vis', 'Groente', 'Noten', 'Carnivoor', 'Eieren', 'Supplementen'
  ];

  // Fetch unit types and categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUnitTypes();
      fetchCategories();
    }
  }, [isOpen]);

  const fetchUnitTypes = async () => {
    try {
      const response = await fetch('/api/admin/unit-types');
      const result = await response.json();
      
      if (response.ok) {
        setUnitTypes(result.unitTypes || []);
      } else {
        console.error('Error fetching unit types:', result.error);
        // Fallback to hardcoded unit types if API fails
        setUnitTypes([
          { name: 'Per 100 gram', value: 'per_100g' },
          { name: 'Per 30 gram', value: 'per_30g' },
          { name: 'Per stuk', value: 'per_piece' },
          { name: 'Per handje', value: 'per_handful' }
        ]);
      }
    } catch (error) {
      console.error('Exception fetching unit types:', error);
      // Fallback to hardcoded unit types
      setUnitTypes([
        { name: 'Per 100 gram', value: 'per_100g' },
        { name: 'Per 30 gram', value: 'per_30g' },
        { name: 'Per stuk', value: 'per_piece' },
        { name: 'Per handje', value: 'per_handful' }
      ]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const result = await response.json();
      
      if (response.ok) {
        setCategories(result.categories || []);
      } else {
        console.error('Error fetching categories:', result.error);
        // Fallback to hardcoded categories if API fails
        setCategories(fallbackCategories.map(name => ({ name, value: name })));
      }
    } catch (error) {
      console.error('Exception fetching categories:', error);
      // Fallback to hardcoded categories
      setCategories(fallbackCategories.map(name => ({ name, value: name })));
    }
  };

  const getUnitLabel = (unitType: string) => {
    // First try to find in the dynamic unit types
    const unitTypeObj = unitTypes.find(ut => ut.value === unitType);
    if (unitTypeObj) {
      return unitTypeObj.name;
    }
    
    // Fallback to hardcoded mapping
    switch (unitType) {
      case 'per_piece': return 'Per stuk';
      case 'per_handful': return 'Per handje';
      case 'per_30g': return 'Per 30 gram';
      case 'per_100g': return 'Per 100 gram';
      default: return unitType || 'Per 100 gram';
    }
  };

  const getNutritionLabel = (unitType: string) => {
    // First try to find in the dynamic unit types
    const unitTypeObj = unitTypes.find(ut => ut.value === unitType);
    if (unitTypeObj) {
      return `Kcal (${unitTypeObj.name.toLowerCase()})`;
    }
    
    // Fallback to hardcoded mapping
    switch (unitType) {
      case 'per_piece': return 'Kcal (per stuk)';
      case 'per_handful': return 'Kcal (per handje)';
      case 'per_30g': return 'Kcal (per 30g)';
      case 'per_100g': return 'Kcal (per 100g)';
      default: return 'Kcal (per 100g)';
    }
  };

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
        is_active: foodItem.is_active,
        is_carnivore: foodItem.is_carnivore || false,
        unit_type: foodItem.unit_type || 'per_100g'
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
        is_active: true,
        is_carnivore: false
      });
    }
    setError('');
  }, [foodItem]);

  const handleInputChange = (field: keyof FoodItem, value: any) => {
    let updatedData = {
      ...formData,
      [field]: value
    };

    // Auto-detect unit_type based on category and name
    if (field === 'category') {
      if (value === 'Fruit') {
        updatedData.unit_type = 'per_piece';
      } else if (value === 'Noten') {
        updatedData.unit_type = 'per_handful';
      } else if (value === 'Eieren') {
        updatedData.unit_type = 'per_piece';
      } else if (value === 'Supplementen') {
        updatedData.unit_type = 'per_piece'; // Capsules, scoops, tablets per stuk
      } else {
        updatedData.unit_type = 'per_100g';
      }
    }

    // Special case: Check for whey protein when name changes
    if (field === 'name' && typeof value === 'string') {
      const name = value.toLowerCase();
      if ((name.includes('whey') || name.includes('wei')) && (name.includes('eiwit') || name.includes('protein') || name.includes('shake'))) {
        updatedData.unit_type = 'per_30g'; // Whey protein per 30g serving
      }
    }

    setFormData(updatedData);
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-[#8BAE5A]">
                  Categorie *
                </label>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="text-xs text-[#8BAE5A] hover:text-[#B6C948] transition-colors flex items-center gap-1"
                >
                  <PlusIcon className="w-3 h-3" />
                  Nieuwe categorie
                </button>
              </div>
              <select
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] transition-colors"
              >
                <option value="">Selecteer categorie</option>
                {categories.map(category => (
                  <option key={category.name || category} value={category.name || category}>
                    {category.name || category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-[#8BAE5A]">
                  Eenheid Type *
                </label>
                <button
                  type="button"
                  onClick={() => setShowUnitTypeModal(true)}
                  className="text-xs text-[#8BAE5A] hover:text-[#B6C948] transition-colors flex items-center gap-1"
                >
                  <PlusIcon className="w-3 h-3" />
                  Nieuwe eenheid
                </button>
              </div>
              <select
                value={formData.unit_type || 'per_100g'}
                onChange={(e) => handleInputChange('unit_type', e.target.value)}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] transition-colors"
              >
                {unitTypes.map((unitType) => (
                  <option key={unitType.value} value={unitType.value}>
                    {unitType.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Bepaalt hoe voedingswaarden worden weergegeven (auto-detectie op basis van categorie)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-1">
                Carnivoor Geschikt *
              </label>
              <select
                value={formData.is_carnivore ? 'true' : 'false'}
                onChange={(e) => handleInputChange('is_carnivore', e.target.value === 'true')}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-[#8BAE5A] transition-colors"
              >
                <option value="false">Nee - Niet carnivoor geschikt</option>
                <option value="true">Ja - Carnivoor geschikt</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Bepaalt of dit ingredient wordt getoond in carnivoor voedingsplannen
              </p>
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
                {getNutritionLabel(formData.unit_type || 'per_100g')}
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
                  Protein (g) {getUnitLabel(formData.unit_type || 'per_100g')}
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
                  Carbs (g) {getUnitLabel(formData.unit_type || 'per_100g')}
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
                  Fat (g) {getUnitLabel(formData.unit_type || 'per_100g')}
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

      {/* Unit Type Modal */}
      <UnitTypeModal
        isOpen={showUnitTypeModal}
        onClose={() => setShowUnitTypeModal(false)}
        onSave={() => {
          fetchUnitTypes(); // Refresh unit types after saving
          setShowUnitTypeModal(false);
        }}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={() => {
          fetchCategories(); // Refresh categories after saving
          setShowCategoryModal(false);
        }}
      />
    </div>
  );
}
