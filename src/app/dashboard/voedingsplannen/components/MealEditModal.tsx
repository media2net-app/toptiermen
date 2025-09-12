"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface MealIngredient {
  name: string;
  unit: string;
  amount: number | string;
}

interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: string;
  mealType: string;
  currentIngredients: MealIngredient[];
  onSave: (ingredients: MealIngredient[]) => void;
}

// Ingredient database will be loaded from API

const MEAL_TYPES_NL = {
  ontbijt: 'Ontbijt',
  snack1: 'Ochtend Snack',
  lunch: 'Lunch',
  snack2: 'Lunch Snack',
  diner: 'Diner',
  avondsnack: 'Avond Snack'
};

const DAYS_NL = {
  maandag: 'Maandag',
  dinsdag: 'Dinsdag',
  woensdag: 'Woensdag',
  donderdag: 'Donderdag',
  vrijdag: 'Vrijdag',
  zaterdag: 'Zaterdag',
  zondag: 'Zondag'
};

export default function MealEditModal({ 
  isOpen, 
  onClose, 
  day, 
  mealType, 
  currentIngredients, 
  onSave 
}: MealEditModalProps) {
  const [ingredients, setIngredients] = useState<MealIngredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showIngredientSearch, setShowIngredientSearch] = useState(false);
  const [ingredientDatabase, setIngredientDatabase] = useState<any>({});
  const [isDatabaseLoaded, setIsDatabaseLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIngredients([...currentIngredients]);
    }
  }, [isOpen, currentIngredients]);

  // Enrich ingredients with database data when both are available
  useEffect(() => {
    if (isOpen && isDatabaseLoaded && ingredients.length > 0) {
      console.log('🔍 Checking ingredients for enrichment:', ingredients);
      console.log('🔍 Ingredient database keys:', Object.keys(ingredientDatabase));
      
      const enrichedIngredients = ingredients.map(ingredient => {
        console.log(`🔍 Processing ingredient: "${ingredient.name}" with unit: "${ingredient.unit}"`);
        const data = ingredientDatabase[ingredient.name];
        console.log(`🔍 Database data for "${ingredient.name}":`, data);
        
        if (data) {
          // Calculate new amount based on unit change
          let newAmount = ingredient.amount;
          
          // If unit changed from per_piece to per_100g, adjust amount
          if (ingredient.unit === 'per_piece' && data.unit_type === 'per_100g') {
            // Convert from pieces to grams (assuming 1 piece = 100g for banana)
            newAmount = Number(ingredient.amount) * 100;
            console.log(`🔄 Converting "${ingredient.name}" from ${ingredient.amount} pieces to ${newAmount}g`);
          }
          // If unit changed from per_100g to per_piece, adjust amount
          else if (ingredient.unit === 'per_100g' && data.unit_type === 'per_piece') {
            // Convert from grams to pieces (assuming 1 piece = 100g for banana)
            newAmount = Number(ingredient.amount) / 100;
            console.log(`🔄 Converting "${ingredient.name}" from ${ingredient.amount}g to ${newAmount} pieces`);
          }
          
          const enriched = {
            ...ingredient,
            unit: data.unit_type, // Use database unit_type as source of truth
            name: data.name, // Use database name as source of truth
            amount: newAmount // Use calculated amount
          };
          console.log(`✅ Enriched "${ingredient.name}": unit "${ingredient.unit}" → "${data.unit_type}", amount ${ingredient.amount} → ${newAmount}`);
          return enriched;
        } else {
          console.log(`❌ No database data found for "${ingredient.name}"`);
          return ingredient;
        }
      });
      
      // Only update if there are actual changes
      const hasChanges = enrichedIngredients.some((enriched, index) => 
        enriched.unit !== ingredients[index].unit || 
        enriched.name !== ingredients[index].name ||
        enriched.amount !== ingredients[index].amount
      );
      
      console.log('🔍 Has changes:', hasChanges);
      
      if (hasChanges) {
        console.log('🔄 Enriching ingredients with database data:', enrichedIngredients);
        setIngredients(enrichedIngredients);
      } else {
        console.log('ℹ️ No changes needed, ingredients already enriched');
      }
    }
  }, [isOpen, isDatabaseLoaded, ingredientDatabase, currentIngredients]);

  // Load ingredient database from API
  useEffect(() => {
    const loadIngredientDatabase = async () => {
      try {
        // Add cache-busting parameter with random number
        const response = await fetch(`/api/nutrition-ingredients?t=${Date.now()}&r=${Math.random()}`);
        const data = await response.json();
        if (data.success && data.ingredients) {
          setIngredientDatabase(data.ingredients);
          setIsDatabaseLoaded(true);
          console.log('✅ MealEditModal loaded ingredient database:', Object.keys(data.ingredients).length, 'ingredients');
          if (data.lastUpdated) {
            console.log('📅 Ingredients last updated:', new Date(data.lastUpdated).toISOString());
          }
        }
      } catch (error) {
        console.error('❌ Error loading ingredient database in MealEditModal:', error);
      }
    };

    loadIngredientDatabase();
  }, []);

  const calculateIngredientNutrition = (ingredient: MealIngredient) => {
    if (!isDatabaseLoaded || !ingredientDatabase[ingredient.name]) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    
    const data = ingredientDatabase[ingredient.name];

    // Handle empty or invalid amounts
    const amount = typeof ingredient.amount === 'string' ? parseFloat(ingredient.amount) || 0 : ingredient.amount;
    if (amount <= 0) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    // Use database unit_type as source of truth
    const unit = data.unit_type || ingredient.unit || 'per_100g';

    let multiplier = 1;
    switch (unit) {
      case 'per_100g':
        multiplier = amount / 100;
        break;
      case 'per_piece':
      case 'stuk':
        multiplier = amount; // For pieces, use amount directly
        break;
      case 'per_ml':
        multiplier = amount / 100; // Assuming 1ml = 1g for liquids
        break;
      case 'per_tbsp':
        multiplier = (amount * 15) / 100; // 1 tbsp = 15ml
        break;
      case 'per_tsp':
        multiplier = (amount * 5) / 100; // 1 tsp = 5ml
        break;
      case 'per_cup':
        multiplier = (amount * 240) / 100; // 1 cup = 240ml
        break;
      case 'per_plakje':
        multiplier = amount; // For slices, use amount directly
        break;
      default:
        multiplier = amount / 100;
    }

    const calories = Math.round(data.calories_per_100g * multiplier * 10) / 10;
    const protein = Math.round(data.protein_per_100g * multiplier * 10) / 10;
    const carbs = Math.round(data.carbs_per_100g * multiplier * 10) / 10;
    const fat = Math.round(data.fat_per_100g * multiplier * 10) / 10;

    // Debug logging for Kaas 30+
    if (ingredient.name === 'Kaas 30+') {
      console.log(`🧀 Kaas 30+ calculation:`, {
        name: ingredient.name,
        amount: amount,
        unit: unit,
        multiplier: multiplier,
        calories_per_100g: data.calories_per_100g,
        protein_per_100g: data.protein_per_100g,
        carbs_per_100g: data.carbs_per_100g,
        fat_per_100g: data.fat_per_100g,
        calculated_calories: calories,
        calculated_protein: protein,
        calculated_carbs: carbs,
        calculated_fat: fat
      });
    }

    return { calories, protein, carbs, fat };
  };

  const calculateTotalNutrition = () => {
    return ingredients.reduce((total, ingredient) => {
      const nutrition = calculateIngredientNutrition(ingredient);
      return {
        calories: total.calories + nutrition.calories,
        protein: total.protein + nutrition.protein,
        carbs: total.carbs + nutrition.carbs,
        fat: total.fat + nutrition.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleIngredientChange = (index: number, field: keyof MealIngredient, value: string | number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleAddIngredient = (ingredientName: string) => {
    const data = ingredientDatabase[ingredientName];
    if (!data) return;

    const newIngredient: MealIngredient = {
      name: ingredientName,
      unit: data.unit_type,
      amount: 1
    };

    setIngredients([...ingredients, newIngredient]);
    setShowIngredientSearch(false);
    setSearchTerm('');
  };

  const handleSave = () => {
    onSave(ingredients);
    onClose();
    toast.success('Maaltijd opgeslagen!');
  };

  const getAvailableIngredients = () => {
    return Object.keys(ingredientDatabase).filter(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatUnitDisplay = (unit: string) => {
    switch (unit) {
      case 'per_100g': return 'g';
      case 'per_piece': return 'stuk';
      case 'per_ml': return 'ml';
      case 'per_tbsp': return 'eetlepel';
      case 'per_tsp': return 'theelepel';
      case 'per_cup': return 'kop';
      case 'per_plakje': return 'plakje';
      default: return unit;
    }
  };

  const totalNutrition = calculateTotalNutrition();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                {DAYS_NL[day as keyof typeof DAYS_NL]} - {MEAL_TYPES_NL[mealType as keyof typeof MEAL_TYPES_NL]}
              </h2>
              <p className="text-gray-400 text-sm">Bewerk ingrediënten en hoeveelheden</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Nutrition Summary */}
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Voedingswaarde</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{Math.round(totalNutrition.calories)}</div>
                <div className="text-sm text-gray-400">Calorieën</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{Math.round(totalNutrition.protein * 10) / 10}g</div>
                <div className="text-sm text-gray-400">Eiwit</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{Math.round(totalNutrition.carbs * 10) / 10}g</div>
                <div className="text-sm text-gray-400">Koolhydraten</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{Math.round(totalNutrition.fat * 10) / 10}g</div>
                <div className="text-sm text-gray-400">Vet</div>
              </div>
            </div>
          </div>

          {/* Current Ingredients */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Huidige Ingrediënten</h3>
              <button
                onClick={() => setShowIngredientSearch(true)}
                disabled={!isDatabaseLoaded}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-semibold ${
                  isDatabaseLoaded 
                    ? 'bg-[#8BAE5A] text-[#232D1A] hover:bg-[#7A9D4A]' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <PlusIcon className="w-4 h-4" />
                {isDatabaseLoaded ? 'Ingrediënt Toevoegen' : 'Database Laden...'}
              </button>
            </div>

            {ingredients.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>Geen ingrediënten toegevoegd</p>
                <p className="text-sm">Klik op "Ingrediënt Toevoegen" om te beginnen</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => {
                  const nutrition = calculateIngredientNutrition(ingredient);
                  return (
                    <div key={index} className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-3">
                          <div className="font-medium text-white">{ingredient.name}</div>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={parseFloat(ingredient.amount.toString()) || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                handleIngredientChange(index, 'amount', '');
                              } else {
                                const numValue = parseFloat(value);
                                if (!isNaN(numValue) && numValue >= 0) {
                                  handleIngredientChange(index, 'amount', numValue);
                                }
                              }
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (value === '' || parseFloat(value) === 0) {
                                handleIngredientChange(index, 'amount', 1); // Default to 1 instead of 0
                              }
                            }}
                            className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                            min="0"
                            step="0.1"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-2">
                          <select
                            value={(() => {
                              const data = ingredientDatabase[ingredient.name];
                              return data?.unit_type || ingredient.unit || 'per_100g';
                            })()}
                            onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                            className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                          >
                            <option value="per_100g">{formatUnitDisplay('per_100g')}</option>
                            <option value="per_piece">{formatUnitDisplay('per_piece')}</option>
                            <option value="per_ml">{formatUnitDisplay('per_ml')}</option>
                            <option value="per_tbsp">{formatUnitDisplay('per_tbsp')}</option>
                            <option value="per_tsp">{formatUnitDisplay('per_tsp')}</option>
                            <option value="per_cup">{formatUnitDisplay('per_cup')}</option>
                            <option value="per_plakje">{formatUnitDisplay('per_plakje')}</option>
                          </select>
                        </div>
                        <div className="col-span-4 text-sm text-gray-300">
                          <div className="grid grid-cols-4 gap-2">
                            <div>{Math.round(nutrition.calories)} kcal</div>
                            <div>{Math.round(nutrition.protein * 10) / 10}g eiwit</div>
                            <div>{Math.round(nutrition.carbs * 10) / 10}g koolhydraten</div>
                            <div>{Math.round(nutrition.fat * 10) / 10}g vet</div>
                          </div>
                        </div>
                        <div className="col-span-1">
                          <button
                            onClick={() => handleRemoveIngredient(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ingredient Search */}
          {showIngredientSearch && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Zoek ingrediënten..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:ring-1 focus:ring-[#8BAE5A] transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowIngredientSearch(false)}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Annuleren
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {getAvailableIngredients().map((ingredientName) => (
                  <button
                    key={ingredientName}
                    onClick={() => handleAddIngredient(ingredientName)}
                    className="p-3 text-left bg-[#232D1A] border border-[#3A4D23] rounded-lg hover:bg-[#2A3A23] transition-colors"
                  >
                    <div className="font-medium text-white">{ingredientName}</div>
                    <div className="text-sm text-gray-400">
                      {ingredientDatabase[ingredientName]?.calories_per_100g || 0} kcal per 100g
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
            >
              Opslaan
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
