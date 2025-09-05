'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import AdminButton from '@/components/admin/AdminButton';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Ingredient[];
}

interface MealEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
  mealType: string; // 'ontbijt', 'lunch', 'diner', 'snack'
  onSave: (meal: Meal) => void;
  onDelete: (mealId: string) => void;
  baseCalories?: number; // Basis calorieën van het plan (bijv. 1870)
  planType?: string; // 'Carnivoor' of 'Voedingsplan op Maat'
}

interface DatabaseMeal {
  id: string;
  name: string;
  description: string;
  meal_type: string;
  category: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  prep_time: number;
  difficulty: string;
}

export default function MealEditModal({ isOpen, onClose, meal, mealType, onSave, onDelete, baseCalories, planType }: MealEditModalProps) {
  const [formData, setFormData] = useState<Meal>({
    id: '',
    name: '',
    time: '08:00',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    ingredients: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [availableMeals, setAvailableMeals] = useState<DatabaseMeal[]>([]);
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ingredientsDatabase, setIngredientsDatabase] = useState<any[]>([]);

  // Load ingredients database once when modal opens
  useEffect(() => {
    const loadIngredientsDatabase = async () => {
      try {
        const response = await fetch('/api/admin/nutrition-ingredients');
        const result = await response.json();
        if (result.success && result.ingredients) {
          setIngredientsDatabase(result.ingredients);
          console.log('✅ Ingredients database loaded:', result.ingredients.length, 'ingredients');
        }
      } catch (error) {
        console.error('❌ Error loading ingredients database:', error);
      }
    };

    if (isOpen) {
      loadIngredientsDatabase();
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('🍽️ MealEditModal: Loading meal data:', meal);
    console.log('🔍 MealEditModal: Meal type:', mealType);
    
    if (meal) {
      // If meal has suggestions (from daily_plans conversion), convert them to ingredients
      if ((meal as any).suggestions && Array.isArray((meal as any).suggestions) && (meal as any).suggestions.length > 0) {
        console.log('📋 Converting suggestions to ingredients:', (meal as any).suggestions);
        
        const convertedIngredients = (meal as any).suggestions.map((suggestion: string, index: number) => {
          // Parse suggestion format: "Runderlever (43.35g)"
          const match = suggestion.match(/^(.+)\s*\((.+)\)$/);
          if (match) {
            const [, name, amountWithUnit] = match;
            const amountMatch = amountWithUnit.match(/^([\d.,]+)(\w+)$/);
            if (amountMatch) {
              const [, amount, unit] = amountMatch;
              return {
                id: `ingredient-${index}`,
                name: name.trim(),
                amount: parseFloat(amount.replace(',', '.')),
                unit: unit,
                calories: 0, // Will be calculated
                protein: 0,
                carbs: 0,
                fat: 0
              };
            }
          }
          
          // Fallback for malformed suggestions
          return {
            id: `ingredient-${index}`,
            name: suggestion,
            amount: 100,
            unit: 'g',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          };
        });
        
        setFormData({
          ...meal,
          ingredients: convertedIngredients
        });
      } else {
        setFormData({
          ...meal,
          ingredients: meal.ingredients || []
        });
      }
    } else {
      setFormData({
        id: `meal-${Date.now()}`,
        name: '',
        time: '08:00',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        ingredients: []
      });
    }
  }, [meal, mealType]);

  // Load available meals from database
  useEffect(() => {
    if (isOpen && mealType) {
      loadAvailableMeals();
    }
  }, [isOpen, mealType]);

  const loadAvailableMeals = async () => {
    try {
      console.log('🔍 Loading available ingredients from database...');
      console.log('📋 Plan type:', planType);
      
      // Fetch nutrition ingredients instead of meals
      const response = await fetch('/api/admin/nutrition-ingredients');
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Error fetching nutrition ingredients:', result.error);
        return;
      }
      
      let ingredients = result.ingredients || [];
      
      // Filter by diet type if planType is specified
      if (planType && planType.includes('Carnivoor')) {
        ingredients = ingredients.filter((ing: any) => 
          ing.is_carnivore === true || 
          ['vlees', 'vis', 'eieren', 'zuivel', 'orgaanvlees'].includes(ing.category?.toLowerCase())
        );
        console.log('🥩 Filtering for Carnivore ingredients:', ingredients.length);
      } else if (planType && planType.includes('Voedingsplan op Maat')) {
        // For regular diet plans, show all ingredients
        console.log('🥗 Showing all ingredients for regular diet plan:', ingredients.length);
      }
      
      // Convert ingredients to meal format for compatibility
      const convertedMeals = ingredients.map((ingredient: any) => ({
        id: ingredient.id,
        name: ingredient.name,
        description: ingredient.description || `${ingredient.name} ingredient`,
        nutrition_info: {
          calories: ingredient.calories_per_100g || 0,
          protein: ingredient.protein_per_100g || 0,
          carbs: ingredient.carbs_per_100g || 0,
          fat: ingredient.fat_per_100g || 0
        },
        ingredients: [{
          id: ingredient.id,
          name: ingredient.name,
          amount: 100,
          unit: ingredient.unit || 'g',
          calories: ingredient.calories_per_100g || 0,
          protein: ingredient.protein_per_100g || 0,
          carbs: ingredient.carbs_per_100g || 0,
          fat: ingredient.fat_per_100g || 0
        }],
        prep_time: 5,
        difficulty: 'easy'
      }));
      
      setAvailableMeals(convertedMeals);
      console.log('✅ Available ingredients loaded:', convertedMeals.length);
    } catch (error) {
      console.error('❌ Error loading ingredients:', error);
    }
  };

  const selectMealFromDatabase = (dbMeal: DatabaseMeal) => {
    setFormData({
      id: dbMeal.id,
      name: dbMeal.name,
      time: '08:00', // Default time
      calories: dbMeal.nutrition_info.calories,
      protein: dbMeal.nutrition_info.protein,
      carbs: dbMeal.nutrition_info.carbs,
      fat: dbMeal.nutrition_info.fat,
      ingredients: dbMeal.ingredients
    });
    setShowMealSelector(false);
  };

  const filteredMeals = availableMeals.filter(meal =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meal.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: keyof Meal, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const updatedIngredients = [...(formData.ingredients || [])];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: field === 'amount' ? Number(value) : value
    };
    
    // Calculate nutrition based on ingredients
    const nutrition = calculateNutritionFromIngredients(updatedIngredients);
    
    setFormData(prev => ({
      ...prev,
      ingredients: updatedIngredients,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    }));
  };

  // Calculate nutrition values based on ingredients using loaded database
  const calculateNutritionFromIngredients = (ingredients: Ingredient[]) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    // Use loaded ingredients database for nutrition calculation
    for (const ingredient of ingredients || []) {
      // Find matching ingredient in database (flexible matching)
      const dbIngredient = ingredientsDatabase.find((dbIng: any) => 
        dbIng.name.toLowerCase() === ingredient.name.toLowerCase() ||
        dbIng.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
        ingredient.name.toLowerCase().includes(dbIng.name.toLowerCase())
      );
      
      if (dbIngredient) {
        // Calculate based on unit type
        let multiplier = 1;
        if (ingredient.unit === 'stuks' && ingredient.name.toLowerCase().includes('ei')) {
          // Special case for eggs: 1 egg = ~50g
          multiplier = (ingredient.amount * 50) / 100;
        } else if (ingredient.unit === 'stuks') {
          // General case for pieces: assume per piece values if available
          multiplier = ingredient.amount;
        } else {
          // Weight-based: calculate per 100g
          multiplier = ingredient.amount / 100;
        }
        
        totalCalories += (dbIngredient.calories_per_100g || 0) * multiplier;
        totalProtein += (dbIngredient.protein_per_100g || 0) * multiplier;
        totalCarbs += (dbIngredient.carbs_per_100g || 0) * multiplier;
        totalFat += (dbIngredient.fat_per_100g || 0) * multiplier;
        
        console.log(`✅ Found nutrition for ${ingredient.name}:`, {
          amount: ingredient.amount,
          unit: ingredient.unit,
          multiplier,
          calories: (dbIngredient.calories_per_100g || 0) * multiplier
        });
      } else {
        console.warn(`⚠️ No nutrition data found for ingredient: ${ingredient.name}`);
      }
    }

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10
    };
  };

  const addIngredient = () => {
    const newIngredient = { 
      id: `ingredient-${Date.now()}`, 
      name: '', 
      amount: 100, 
      unit: 'g', 
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fat: 0 
    };
    
    const updatedIngredients = [...(formData.ingredients || []), newIngredient];
    const nutrition = calculateNutritionFromIngredients(updatedIngredients);
    
    setFormData(prev => ({
      ...prev,
      ingredients: updatedIngredients,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    }));
    
    console.log('➕ Added new ingredient to meal');
  };

  const addIngredientFromDatabase = (dbIngredient: any) => {
    const newIngredient = {
      id: `ingredient-${Date.now()}`,
      name: dbIngredient.name,
      amount: 100,
      unit: dbIngredient.unit || 'g',
      calories: dbIngredient.calories || 0,
      protein: dbIngredient.protein || 0,
      carbs: dbIngredient.carbs || 0,
      fat: dbIngredient.fat || 0
    };
    
    const updatedIngredients = [...(formData.ingredients || []), newIngredient];
    const nutrition = calculateNutritionFromIngredients(updatedIngredients);
    
    setFormData(prev => ({
      ...prev,
      ingredients: updatedIngredients,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    }));
    
    console.log('✅ Added ingredient from database:', dbIngredient.name);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = (formData.ingredients || []).filter((_, i) => i !== index);
    const nutrition = calculateNutritionFromIngredients(newIngredients);
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Maaltijd naam is verplicht');
      return;
    }

    if (!formData.ingredients || formData.ingredients.length === 0) {
      alert('Voeg minimaal één ingrediënt toe');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Fout bij opslaan van maaltijd');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!meal?.id) return;
    
    if (confirm('Weet je zeker dat je deze maaltijd wilt verwijderen?')) {
      setIsLoading(true);
      try {
        await onDelete(meal.id);
        onClose();
      } catch (error) {
        console.error('Error deleting meal:', error);
        alert('Fout bij verwijderen van maaltijd');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181F17] rounded-xl border border-[#3A4D23] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
          <h2 className="text-[#8BAE5A] font-semibold text-xl">
            {meal ? 'Bewerk Maaltijd' : 'Nieuwe Maaltijd'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#8BAE5A] hover:text-[#7A9D4B] transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Meal Selector */}
          <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#8BAE5A] font-semibold">Kies uit Carnivor Maaltijden</h3>
              <button
                onClick={() => setShowMealSelector(!showMealSelector)}
                className="text-[#8BAE5A] hover:text-[#7A9D4B] transition-colors"
              >
                {showMealSelector ? 'Verberg' : 'Toon'} Database
              </button>
            </div>
            
            {showMealSelector && (
              <div className="space-y-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8BAE5A]" />
                  <input
                    type="text"
                    placeholder="Zoek maaltijden..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredMeals.length > 0 ? (
                    filteredMeals.map((dbMeal) => (
                      <button
                        key={dbMeal.id}
                        onClick={() => selectMealFromDatabase(dbMeal)}
                        className="w-full text-left p-3 rounded-lg bg-[#181F17] border border-[#3A4D23] hover:border-[#8BAE5A] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[#8BAE5A] font-semibold">{dbMeal.name}</div>
                            <div className="text-[#B6C948] text-sm">{dbMeal.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#8BAE5A] font-semibold">{dbMeal.nutrition_info.calories} cal</div>
                            <div className="text-[#B6C948] text-xs">
                              P: {dbMeal.nutrition_info.protein}g | C: {dbMeal.nutrition_info.carbs}g | F: {dbMeal.nutrition_info.fat}g
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center text-[#B6C948] py-4">
                      {searchTerm ? 'Geen maaltijden gevonden' : 'Laden...'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8BAE5A] font-semibold mb-2">
                Maaltijd Naam
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                placeholder="Bijv. Ribeye Steak & Eieren"
              />
            </div>
            <div>
              <label className="block text-[#8BAE5A] font-semibold mb-2">
                Tijd
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              />
            </div>
          </div>

          {/* Nutrition Info */}
          <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
            <h3 className="text-[#8BAE5A] font-semibold mb-4">Voedingswaarden</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[#B6C948] text-sm mb-1">Calorieën</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => handleInputChange('calories', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A]"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-[#B6C948] text-sm mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => handleInputChange('protein', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A]"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-[#B6C948] text-sm mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => handleInputChange('carbs', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A]"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-[#B6C948] text-sm mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={formData.fat}
                  onChange={(e) => handleInputChange('fat', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A]"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#8BAE5A] font-semibold">Ingrediënten</h3>
              <button
                onClick={addIngredient}
                className="flex items-center gap-2 text-[#8BAE5A] hover:text-[#7A9D4B] text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Toevoegen
              </button>
            </div>
            
            <div className="space-y-3">
              {(formData.ingredients || []).map((ingredient, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A]"
                    placeholder="Ingrediënt naam"
                  />
                  <input
                    type="number"
                    value={ingredient.amount}
                    onChange={(e) => handleIngredientChange(index, 'amount', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 rounded bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A]"
                    min="0"
                  />
                  <select
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    className="px-3 py-2 rounded bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A]"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="stuks">stuks</option>
                    <option value="eetlepel">eetlepel</option>
                    <option value="theelepel">theelepel</option>
                  </select>
                  <button
                    onClick={() => removeIngredient(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {(!formData.ingredients || formData.ingredients.length === 0) && (
                <div className="text-[#B6C948] text-sm text-center py-4">
                  Nog geen ingrediënten toegevoegd
                </div>
              )}
            </div>
          </div>

          {/* Database Ingredients Selector */}
          <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#8BAE5A] font-semibold">Ingrediënten uit Database</h3>
              <button
                onClick={() => setShowMealSelector(!showMealSelector)}
                className="text-[#8BAE5A] hover:text-[#7A9D4B] text-sm"
              >
                {showMealSelector ? 'Verbergen' : 'Tonen'}
              </button>
            </div>
            
            {showMealSelector && (
              <>
                <div className="mb-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A]"
                    placeholder="Zoek ingrediënten..."
                  />
                </div>
                
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredMeals.slice(0, 20).map((dbMeal, index) => (
                    <button
                      key={index}
                      onClick={() => addIngredientFromDatabase(dbMeal.ingredients?.[0] || dbMeal)}
                      className="w-full text-left px-3 py-2 text-sm bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] rounded hover:bg-[#3A4D23] transition-colors"
                    >
                      <div className="font-medium">{dbMeal.name}</div>
                      <div className="text-xs text-[#B6C948]">
                        {dbMeal.nutrition_info.calories} cal • {dbMeal.nutrition_info.protein}g protein
                      </div>
                    </button>
                  ))}
                  
                  {filteredMeals.length === 0 && (
                    <div className="text-[#B6C948] text-sm text-center py-4">
                      Geen ingrediënten gevonden
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Quick Add Carnivor Ingredients */}
          <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
            <h3 className="text-[#8BAE5A] font-semibold mb-3">Snelle Toevoeging - Populaire Ingrediënten</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                             {[
                 { name: 'Ribeye Steak', amount: 200, unit: 'g' },
                 { name: 'Eieren', amount: 3, unit: 'stuks' },
                 { name: 'Roomboter', amount: 30, unit: 'g' },
                 { name: 'Runderlever', amount: 100, unit: 'g' },
                 { name: 'Gerookte Zalm', amount: 120, unit: 'g' },
                 { name: 'Spek', amount: 80, unit: 'g' },
                 { name: 'Lamskotelet', amount: 250, unit: 'g' },
                 { name: 'Kipfilet', amount: 200, unit: 'g' },
                 { name: 'Honing', amount: 15, unit: 'g' }
               ].map((quickIngredient, index) => (
                 <button
                   key={index}
                   onClick={() => addIngredientFromDatabase(quickIngredient)}
                   className="px-3 py-2 text-sm bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] rounded hover:bg-[#3A4D23] transition-colors"
                 >
                   {quickIngredient.name} ({quickIngredient.amount}{quickIngredient.unit})
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#3A4D23]">
          <div className="flex gap-3">
            {meal && (
              <AdminButton
                onClick={handleDelete}
                variant="danger"
                disabled={isLoading}
              >
                Verwijderen
              </AdminButton>
            )}
          </div>
          <div className="flex gap-3">
            <AdminButton
              onClick={onClose}
              variant="secondary"
              disabled={isLoading}
            >
              Annuleren
            </AdminButton>
            <AdminButton
              onClick={handleSave}
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Opslaan...' : (meal ? 'Bijwerken' : 'Toevoegen')}
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
}
