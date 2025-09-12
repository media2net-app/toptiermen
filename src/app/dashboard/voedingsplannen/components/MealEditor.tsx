"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Complete ingrediëntendatabase (dezelfde als in de API)
const INGREDIENT_DATABASE = {
  // Carnivoor ingrediënten
  'Eieren': { calories: 155, protein: 13, carbs: 1, fat: 11 },
  'Spek': { calories: 541, protein: 37, carbs: 0, fat: 42 },
  'Rundvlees': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Boter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  'Zalm': { calories: 208, protein: 25, carbs: 0, fat: 12 },
  'Ei': { calories: 155, protein: 13, carbs: 1, fat: 11 },
  'Ham': { calories: 145, protein: 21, carbs: 0, fat: 6 },
  'Kipfilet': { calories: 165, protein: 31, carbs: 0, fat: 4 },
  'Varkensvlees': { calories: 242, protein: 27, carbs: 0, fat: 14 },
  'Tonijn': { calories: 144, protein: 30, carbs: 0, fat: 1 },
  'Olijfolie': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'Biefstuk': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Salami': { calories: 336, protein: 20, carbs: 0, fat: 28 },
  'Makreel': { calories: 205, protein: 19, carbs: 0, fat: 14 },
  'Lamsvlees': { calories: 294, protein: 25, carbs: 0, fat: 21 },
  'Ribeye Steak': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Gerookte Zalm': { calories: 117, protein: 18, carbs: 0, fat: 4 }, // Alias met hoofdletter
  'Runderlever': { calories: 165, protein: 26, carbs: 4, fat: 4 }, // Orgaanvlees
  
  // Voedingsplan op maat ingrediënten
  'Havermout': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
  'Banaan': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  'Amandelen': { calories: 579, protein: 21, carbs: 22, fat: 50 },
  'Melk': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  'Volkoren brood': { calories: 247, protein: 13, carbs: 41, fat: 4 },
  'Avocado': { calories: 160, protein: 2, carbs: 9, fat: 15 },
  'Tomaat': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  'Bruine rijst': { calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  'Broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  'Griekse yoghurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  'Blauwe bessen': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  'Walnoten': { calories: 654, protein: 15, carbs: 14, fat: 65 },
  'Honing': { calories: 304, protein: 0.3, carbs: 82, fat: 0 },
  'Quinoa': { calories: 120, protein: 4.4, carbs: 22, fat: 1.9 },
  'Kikkererwten': { calories: 164, protein: 8, carbs: 27, fat: 2.6 },
  'Komkommer': { calories: 16, protein: 0.7, carbs: 4, fat: 0.1 },
  'Zoete aardappel': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  'Spinazie': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 }
};

interface MealIngredient {
  name: string;
  amount: number;
  unit: string;
  baseAmount: number;
}

interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealEditorProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string; // ontbijt, lunch, diner
  day: string; // monday, tuesday, etc
  ingredients: MealIngredient[];
  nutrition: MealNutrition;
  onSave: (ingredients: MealIngredient[], closeModal?: boolean) => void;
  planType: string; // carnivoor, etc
}

// Carnivoor ingrediënten database
const CARNIVOOR_INGREDIENTS = {
  'Ribeye Steak': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Biefstuk': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'T-Bone Steak': { calories: 247, protein: 24, carbs: 0, fat: 16 },
  'Rundergehakt (15% vet)': { calories: 254, protein: 20, carbs: 0, fat: 18 },
  'Rundergehakt (20% vet)': { calories: 272, protein: 19, carbs: 0, fat: 21 },
  'Mager Rundergehakt': { calories: 220, protein: 22, carbs: 0, fat: 14 },
  'Eendenborst': { calories: 337, protein: 19, carbs: 0, fat: 28 },
  
  // Vis
  'Zalm (Wild)': { calories: 208, protein: 25, carbs: 0, fat: 12 },
  'Haring': { calories: 158, protein: 18, carbs: 0, fat: 9 },
  'Makreel': { calories: 205, protein: 19, carbs: 0, fat: 14 },
  'Sardines': { calories: 208, protein: 25, carbs: 0, fat: 11 },
  'Tonijn in Olijfolie': { calories: 189, protein: 25, carbs: 0, fat: 9 },
  'Witvis': { calories: 82, protein: 18, carbs: 0, fat: 1 },
  
  // Gevogelte
  'Kipfilet (Gegrild)': { calories: 165, protein: 31, carbs: 0, fat: 4 },
  'Kalkoenfilet (Gegrild)': { calories: 135, protein: 30, carbs: 0, fat: 1 },
  'Kippendijen': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'Gans': { calories: 259, protein: 25, carbs: 0, fat: 17 },
  
  // Varkensvlees
  'Varkenshaas': { calories: 143, protein: 26, carbs: 0, fat: 4 },
  'Spek': { calories: 541, protein: 37, carbs: 0, fat: 42 },
  'Ham': { calories: 145, protein: 21, carbs: 0, fat: 6 },
  'Worst': { calories: 300, protein: 20, carbs: 0, fat: 25 },
  'Duitse Biefstuk': { calories: 250, protein: 16, carbs: 0, fat: 20 },
  'Salami': { calories: 336, protein: 20, carbs: 0, fat: 28 },
  
  // Lam
  'Lamsvlees': { calories: 294, protein: 25, carbs: 0, fat: 21 },
  'Lamskotelet': { calories: 294, protein: 25, carbs: 0, fat: 21 },
  
  // Orgaanvlees
  'Orgaanvlees (Lever)': { calories: 135, protein: 20, carbs: 4, fat: 4 },
  'Orgaanvlees (Hart)': { calories: 112, protein: 17, carbs: 0, fat: 4 },
  'Runderlever': { calories: 135, protein: 20, carbs: 4, fat: 4 },
  'Runderhart': { calories: 112, protein: 17, carbs: 0, fat: 4 },
  
  // Overig
  'Tartaar': { calories: 220, protein: 22, carbs: 0, fat: 14 },
  'Carpaccio': { calories: 120, protein: 21, carbs: 0, fat: 4 },
  '1 Ei': { calories: 155, protein: 13, carbs: 1, fat: 11 },
  
  // Noten (kleine hoeveelheden)
  '1 Handje Walnoten': { calories: 26, protein: 0.6, carbs: 0.5, fat: 2.6 },
  '1 Handje Amandelen': { calories: 23, protein: 0.8, carbs: 0.9, fat: 2.0 },
  '1 Handje Cashewnoten': { calories: 22, protein: 0.7, carbs: 1.2, fat: 1.8 },
  '1 Handje Hazelnoten': { calories: 25, protein: 0.6, carbs: 0.7, fat: 2.4 },
  '1 Handje Pecannoten': { calories: 28, protein: 0.4, carbs: 0.6, fat: 2.8 },
  '1 Handje Pistachenoten': { calories: 23, protein: 0.8, carbs: 1.1, fat: 1.8 },
  '1 Handje Macadamia Noten': { calories: 30, protein: 0.3, carbs: 0.6, fat: 3.0 }
};

const MEAL_TYPES_NL = {
  ontbijt: 'Ontbijt',
  lunch: 'Lunch',
  diner: 'Diner'
};

const DAYS_NL = {
  monday: 'Maandag',
  tuesday: 'Dinsdag', 
  wednesday: 'Woensdag',
  thursday: 'Donderdag',
  friday: 'Vrijdag',
  saturday: 'Zaterdag',
  sunday: 'Zondag'
};

export default function MealEditor({ 
  isOpen, 
  onClose, 
  mealType, 
  day, 
  ingredients, 
  nutrition, 
  onSave, 
  planType 
}: MealEditorProps) {
  const [editingIngredients, setEditingIngredients] = useState<MealIngredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showIngredientSearch, setShowIngredientSearch] = useState(false);
  const [ingredientDatabase, setIngredientDatabase] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      setEditingIngredients([...ingredients]);
      // Log initial nutrition calculation
      const initialNutrition = calculateNutrition(ingredients);
      console.log('🍽️ Initial meal nutrition:', initialNutrition);
    }
  }, [isOpen, ingredients]);

  // Load ingredient database from API
  useEffect(() => {
    const loadIngredientDatabase = async () => {
      try {
        // Add cache-busting parameter
        const response = await fetch(`/api/nutrition-ingredients?t=${Date.now()}`);
        const data = await response.json();
        if (data.success && data.ingredients) {
          setIngredientDatabase(data.ingredients);
          console.log('✅ Loaded ingredient database in MealEditor:', Object.keys(data.ingredients).length, 'ingredients');
          if (data.lastUpdated) {
            console.log('📅 Ingredients last updated:', new Date(data.lastUpdated).toISOString());
          }
        }
      } catch (error) {
        console.error('❌ Error loading ingredient database in MealEditor:', error);
      }
    };

    loadIngredientDatabase();
  }, []);

  const getAvailableIngredients = () => {
    // Use the ingredient database from API
    return Object.keys(ingredientDatabase).filter(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getQuickAddIngredients = () => {
    // Get ingredients based on plan type and meal type from the database
    let ingredientNames: string[] = [];
    
    if (planType === 'carnivoor') {
      // Carnivoor quick add ingredients
      if (mealType === 'ontbijt') {
        ingredientNames = ['Ei', 'Spek', 'Ham', 'Salami', 'Kipfilet', 'Walnoten', 'Amandelen', 'Boter'];
      } else if (mealType === 'lunch') {
        ingredientNames = ['Ribeye Steak', 'Zalm', 'Kipfilet', 'Rundvlees', 'Tonijn', 'Varkensvlees', 'Lamsvlees', 'Olijfolie'];
      } else if (mealType === 'diner') {
        ingredientNames = ['Biefstuk', 'Zalm', 'Rundvlees', 'Kipfilet', 'Makreel', 'Lamsvlees', 'Runderlever', 'Boter'];
      } else if (mealType === 'ontbijt_snack') {
        ingredientNames = ['Walnoten', 'Amandelen', 'Ei', 'Ham', 'Salami', 'Tonijn', 'Kipfilet', 'Boter'];
      } else if (mealType === 'lunch_snack') {
        ingredientNames = ['Walnoten', 'Amandelen', 'Ei', 'Ham', 'Salami', 'Tonijn', 'Kipfilet', 'Boter'];
      } else if (mealType === 'diner_snack') {
        ingredientNames = ['Walnoten', 'Amandelen', 'Ei', 'Ham', 'Salami', 'Tonijn', 'Kipfilet', 'Boter'];
      }
    } else {
      // Voedingsplan op maat quick add ingredients
      if (mealType === 'ontbijt') {
        ingredientNames = ['Havermout', 'Banaan', 'Amandelen', 'Melk', 'Volkoren brood', 'Avocado', 'Griekse yoghurt', 'Blauwe bessen'];
      } else if (mealType === 'lunch') {
        ingredientNames = ['Bruine rijst', 'Kipfilet', 'Broccoli', 'Zoete aardappel', 'Quinoa', 'Kikkererwten', 'Tomaat', 'Komkommer'];
      } else if (mealType === 'diner') {
        ingredientNames = ['Zalm', 'Bruine rijst', 'Broccoli', 'Spinazie', 'Zoete aardappel', 'Avocado', 'Walnoten', 'Olijfolie'];
      } else if (mealType === 'ontbijt_snack') {
        ingredientNames = ['Amandelen', 'Walnoten', 'Banaan', 'Griekse yoghurt', 'Blauwe bessen', 'Honing', 'Chiazaad', 'Kokosmelk'];
      } else if (mealType === 'lunch_snack') {
        ingredientNames = ['Amandelen', 'Walnoten', 'Banaan', 'Griekse yoghurt', 'Blauwe bessen', 'Honing', 'Chiazaad', 'Kokosmelk'];
      } else if (mealType === 'diner_snack') {
        ingredientNames = ['Amandelen', 'Walnoten', 'Banaan', 'Griekse yoghurt', 'Blauwe bessen', 'Honing', 'Chiazaad', 'Kokosmelk'];
      }
    }
    
    // Convert ingredient names to database format
    return ingredientNames.map(name => {
      const dbData = ingredientDatabase[name];
      if (dbData) {
        return {
          name: name,
          calories: dbData.calories_per_100g,
          protein: dbData.protein_per_100g,
          carbs: dbData.carbs_per_100g,
          fat: dbData.fat_per_100g
        };
      }
      return null;
    }).filter(Boolean);
  };

  const calculateNutrition = (ingredients: MealIngredient[]) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    ingredients.forEach(ingredient => {
      // Use the ingredient database from API (same as MealEditModal)
      const nutritionData = ingredientDatabase[ingredient.name];
      
      if (nutritionData) {
        let multiplier = 1;
        
        // Handle different unit types based on database unit_type
        if (ingredient.unit === 'per_100g' && nutritionData.unit_type === 'per_100g') {
          multiplier = ingredient.amount / 100;
        } else if (ingredient.unit === 'per_piece' && nutritionData.unit_type === 'per_piece') {
          multiplier = ingredient.amount;
        } else if (ingredient.unit === 'per_100g' && nutritionData.unit_type === 'per_piece') {
          // Convert piece to 100g equivalent (assuming average piece weight)
          multiplier = (ingredient.amount * 50) / 100; // Average piece = 50g
        } else if (ingredient.unit === 'per_piece' && nutritionData.unit_type === 'per_100g') {
          // Convert 100g to piece equivalent
          multiplier = ingredient.amount / 50; // Average piece = 50g
        } else if (ingredient.unit === 'per_ml') {
          multiplier = ingredient.amount / 100; // Assuming 1ml = 1g for liquids
        } else {
          // Default to per 100g calculation for gram units
          multiplier = ingredient.amount / 100;
        }
        
        console.log(`🍽️ Calculating nutrition for ${ingredient.name}:`, {
          amount: ingredient.amount,
          unit: ingredient.unit,
          multiplier,
          baseNutrition: nutritionData,
          calculated: {
            calories: nutritionData.calories_per_100g * multiplier,
            protein: nutritionData.protein_per_100g * multiplier,
            carbs: nutritionData.carbs_per_100g * multiplier,
            fat: nutritionData.fat_per_100g * multiplier
          }
        });
        
        totalCalories += nutritionData.calories_per_100g * multiplier;
        totalProtein += nutritionData.protein_per_100g * multiplier;
        totalCarbs += nutritionData.carbs_per_100g * multiplier;
        totalFat += nutritionData.fat_per_100g * multiplier;
      } else {
        console.warn(`⚠️ Nutrition data not found for ingredient: ${ingredient.name}`);
        console.log('Available ingredients in database:', Object.keys(ingredientDatabase).slice(0, 10));
      }
    });
    
    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10
    };
  };

  const handleIngredientChange = (index: number, field: keyof MealIngredient, value: string | number) => {
    const updated = [...editingIngredients];
    if (field === 'amount') {
      updated[index] = { ...updated[index], [field]: Number(value) };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setEditingIngredients(updated);
    
    // Auto-save immediately when amount or unit changes (don't close modal)
    onSave(updated, false);
  };

  const addIngredient = (ingredientName: string) => {
    // Check if it's from quick add ingredients first
    const quickAddIngredients = getQuickAddIngredients();
    const quickAddIngredient = quickAddIngredients.find(ing => ing?.name === ingredientName);
    
    let nutritionData;
    if (quickAddIngredient) {
      nutritionData = quickAddIngredient;
    } else {
      // Check INGREDIENT_DATABASE first (most comprehensive), then CARNIVOOR_INGREDIENTS
      nutritionData = INGREDIENT_DATABASE[ingredientName] || CARNIVOOR_INGREDIENTS[ingredientName];
    }
    
    if (!nutritionData) return;

    let unit = 'gram';
    let amount = 100;

    if (ingredientName === '1 Ei') {
      unit = 'stuks';
      amount = 1;
    } else if (ingredientName.includes('Handje')) {
      unit = 'handje';
      amount = 1;
    } else if (ingredientName.includes('Honing') || ingredientName.includes('Olijfolie') || ingredientName.includes('Boter')) {
      unit = 'gram';
      amount = 10; // Smaller amounts for condiments
    }

    const newIngredient: MealIngredient = {
      name: ingredientName,
      amount,
      unit,
      baseAmount: amount
    };

    const updatedIngredients = [...editingIngredients, newIngredient];
    setEditingIngredients(updatedIngredients);
    setShowIngredientSearch(false);
    setSearchTerm('');
    
    // Auto-save immediately (don't close modal)
    onSave(updatedIngredients, false);
  };

  const removeIngredient = (index: number) => {
    const updated = editingIngredients.filter((_, i) => i !== index);
    setEditingIngredients(updated);
    
    // Auto-save immediately (don't close modal)
    onSave(updated, false);
  };

  const handleSave = () => {
    if (editingIngredients.length === 0) {
      toast.error('Voeg minimaal één ingredient toe');
      return;
    }

    // Manual save - close modal
    onSave(editingIngredients, true);
    onClose();
  };

  const currentNutrition = calculateNutrition(editingIngredients);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {MEAL_TYPES_NL[mealType]} bewerken
            </h2>
            <p className="text-gray-300">
              {DAYS_NL[day]} - Pas ingrediënten en hoeveelheden aan
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Current Nutrition */}
        <div className="bg-[#181F17] rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-3">Huidige Nutritionele Waarden</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Calorieën</p>
              <p className="text-white font-bold text-lg">{currentNutrition.calories}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Eiwit</p>
              <p className="text-white font-bold text-lg">{currentNutrition.protein}g</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">KH</p>
              <p className="text-white font-bold text-lg">{currentNutrition.carbs}g</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Vet</p>
              <p className="text-white font-bold text-lg">{currentNutrition.fat}g</p>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Ingrediënten</h3>
            <button
              onClick={() => setShowIngredientSearch(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
            >
              <PlusIcon className="w-4 h-4" />
              Alle ingrediënten
            </button>
          </div>

          {editingIngredients.map((ingredient, index) => (
            <div key={index} className="bg-[#181F17] rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Ingredient</label>
                  <p className="text-white font-medium">{ingredient.name}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Hoeveelheid</label>
                  <input
                    type="number"
                    value={ingredient.amount}
                    onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                    className="w-full px-3 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Eenheid</label>
                  <p className="text-white">{ingredient.unit}</p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {editingIngredients.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>Geen ingrediënten toegevoegd</p>
              <p className="text-sm">Klik op "Ingredient toevoegen" om te beginnen</p>
            </div>
          )}
        </div>

        {/* Quick Add Section */}
        <div className="bg-[#181F17] rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-3">Snelle Toevoeging</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {getQuickAddIngredients().map((ingredient) => (
              <button
                key={ingredient?.name}
                onClick={() => addIngredient(ingredient?.name || '')}
                className="px-3 py-2 bg-[#3A4D23] hover:bg-[#8BAE5A] hover:text-[#232D1A] rounded-lg text-white text-sm transition-colors font-medium"
              >
                {ingredient?.name}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredient Search Modal */}
        {showIngredientSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-[#232D1A] rounded-lg p-6 border border-[#3A4D23] w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Ingredient toevoegen</h3>
                <button
                  onClick={() => setShowIngredientSearch(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="relative mb-4">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Zoek ingredient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {getAvailableIngredients().map((ingredientName) => (
                  <button
                    key={ingredientName}
                    onClick={() => addIngredient(ingredientName)}
                    className="w-full text-left px-3 py-2 bg-[#181F17] hover:bg-[#3A4D23] rounded-lg text-white transition-colors"
                  >
                    {ingredientName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-end pt-4 border-t border-[#3A4D23]">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
          >
            Opslaan
          </button>
        </div>
      </motion.div>
    </div>
  );
}
