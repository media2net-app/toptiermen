'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Ingredient {
  id?: string;
  name: string;
  amount: number;
  unit: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

interface IngredientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  onSave: (ingredients: Ingredient[]) => void;
  mealType: string;
  day: string;
}

export default function IngredientEditModal({
  isOpen,
  onClose,
  ingredients,
  onSave,
  mealType,
  day
}: IngredientEditModalProps) {
  const [localIngredients, setLocalIngredients] = useState<Ingredient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);

  // Debug logging
  console.log('🔧 DEBUG: IngredientEditModal render:', { 
    isOpen, 
    ingredients: ingredients?.length, 
    mealType, 
    day,
    componentMounted: true
  });

  useEffect(() => {
    console.log('🔧 DEBUG: IngredientEditModal useEffect triggered:', { isOpen, ingredientsLength: ingredients?.length });
    if (isOpen) {
      console.log('🔧 DEBUG: Modal is open, setting local ingredients and fetching available ingredients');
      setLocalIngredients([...ingredients]);
      fetchAvailableIngredients();
    } else {
      console.log('🔧 DEBUG: Modal is closed');
    }
  }, [isOpen, ingredients]);

  const fetchAvailableIngredients = async () => {
    setLoading(true);
    try {
      // Fetch available ingredients from database
      const response = await fetch('/api/ingredients');
      if (response.ok) {
        const data = await response.json();
        setAvailableIngredients(data.ingredients || []);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addIngredient = (ingredient: Ingredient) => {
    const newIngredient = {
      ...ingredient,
      amount: 1,
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setLocalIngredients(prev => [...prev, newIngredient]);
  };

  const removeIngredient = (index: number) => {
    setLocalIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    setLocalIngredients(prev => prev.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    ));
  };

  const handleSave = () => {
    onSave(localIngredients);
    onClose();
  };

  const formatAmountDisplay = (amount: number, unit: string) => {
    if (unit === 'per_piece' || unit === 'per_plakje' || unit === 'stuk' || unit === 'per_100g' || unit === 'g') {
      return Math.round(amount).toString();
    }
    return amount.toFixed(1);
  };

  const getUnitLabel = (unit: string) => {
    switch (unit) {
      case 'per_piece': return 'Per stuk';
      case 'per_100g': return 'Per 100g';
      case 'per_plakje': return 'Per plakje';
      case 'per_ml': return 'Per ml';
      case 'handje': return 'Per handje';
      default: return `Per ${unit}`;
    }
  };

  console.log('🔧 IngredientEditModal render:', { isOpen, ingredients: ingredients?.length, mealType, day });
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          style={{ zIndex: 50 }}
        >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#232D1A] rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Bewerk Ingrediënten - {mealType} ({day})
              </h2>
              <p className="text-[#8BAE5A] text-sm mt-1">
                Voeg ingrediënten toe, verwijder ze of pas de hoeveelheden aan
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#8BAE5A] hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex gap-6">
            {/* Left side - Current ingredients */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4">
                Huidige Ingrediënten ({localIngredients.length})
              </h3>
              
              <div className="flex-1 overflow-y-auto">
                {localIngredients.length === 0 ? (
                  <div className="text-center py-8 text-[#8BAE5A]">
                    <p>Geen ingrediënten toegevoegd</p>
                    <p className="text-sm mt-1">Voeg ingrediënten toe uit de lijst rechts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {localIngredients.map((ingredient, index) => (
                      <div
                        key={ingredient.id || index}
                        className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">{ingredient.name}</h4>
                          <button
                            onClick={() => removeIngredient(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-[#8BAE5A] mb-1">Hoeveelheid</label>
                            <input
                              type="number"
                              value={formatAmountDisplay(ingredient.amount, ingredient.unit)}
                              onChange={(e) => {
                                const newValue = parseFloat(e.target.value) || 0;
                                let finalValue = newValue;
                                
                                if (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk' || ingredient.unit === 'per_100g' || ingredient.unit === 'g') {
                                  finalValue = Math.round(newValue);
                                }
                                
                                updateIngredient(index, 'amount', finalValue);
                              }}
                              className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded text-white text-sm focus:border-[#8BAE5A] focus:outline-none"
                              min="0"
                              step={ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk' || ingredient.unit === 'per_100g' || ingredient.unit === 'g' ? "1" : "0.1"}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-[#8BAE5A] mb-1">Eenheid</label>
                            <select
                              value={ingredient.unit}
                              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                              className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded text-white text-sm focus:border-[#8BAE5A] focus:outline-none"
                            >
                              <option value="per_piece">Per stuk</option>
                              <option value="per_100g">Per 100g</option>
                              <option value="per_plakje">Per plakje</option>
                              <option value="per_ml">Per ml</option>
                              <option value="handje">Per handje</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-[#8BAE5A]">kcal</div>
                            <div className="text-white font-medium">
                              {((ingredient.calories_per_100g * (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk' ? ingredient.amount : ingredient.amount / 100))).toFixed(0)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[#8BAE5A]">Eiwit</div>
                            <div className="text-white font-medium">
                              {((ingredient.protein_per_100g * (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk' ? ingredient.amount : ingredient.amount / 100))).toFixed(1)}g
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[#8BAE5A]">Koolhydraten</div>
                            <div className="text-white font-medium">
                              {((ingredient.carbs_per_100g * (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk' ? ingredient.amount : ingredient.amount / 100))).toFixed(1)}g
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[#8BAE5A]">Vet</div>
                            <div className="text-white font-medium">
                              {((ingredient.fat_per_100g * (ingredient.unit === 'per_piece' || ingredient.unit === 'per_plakje' || ingredient.unit === 'stuk' ? ingredient.amount : ingredient.amount / 100))).toFixed(1)}g
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Available ingredients */}
            <div className="w-80 flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4">
                Beschikbare Ingrediënten
              </h3>
              
              {/* Search */}
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8BAE5A]" />
                <input
                  type="text"
                  placeholder="Zoek ingrediënten..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white text-sm focus:border-[#8BAE5A] focus:outline-none"
                />
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8 text-[#8BAE5A]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto"></div>
                    <p className="mt-2">Laden...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredIngredients.map((ingredient) => (
                      <div
                        key={ingredient.id || ingredient.name}
                        className="bg-[#181F17] rounded-lg p-3 border border-[#3A4D23] hover:border-[#8BAE5A] transition-colors cursor-pointer"
                        onClick={() => addIngredient(ingredient)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white text-sm">{ingredient.name}</h4>
                            <p className="text-xs text-[#8BAE5A] mt-1">
                              {getUnitLabel(ingredient.unit)} • {ingredient.calories_per_100g} kcal/100g
                            </p>
                          </div>
                          <PlusIcon className="w-4 h-4 text-[#8BAE5A]" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#3A4D23]">
            <div className="text-sm text-[#8BAE5A]">
              {localIngredients.length} ingrediënt{localIngredients.length !== 1 ? 'en' : ''} geselecteerd
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-[#8BAE5A] hover:text-white transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#B6C948] transition-colors"
              >
                Opslaan
              </button>
            </div>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
