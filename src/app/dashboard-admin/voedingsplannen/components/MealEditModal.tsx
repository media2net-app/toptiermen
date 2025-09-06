'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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

interface DatabaseIngredient {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  is_carnivore?: boolean;
  unit_type?: 'per_100g' | 'per_piece' | 'per_handful' | 'per_30g';
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
  const [ingredientsDatabase, setIngredientsDatabase] = useState<DatabaseIngredient[]>([]);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');

  // Unit conversion utilities
  const getUnitLabel = (ingredient: DatabaseIngredient) => {
    switch (ingredient.unit_type) {
      case 'per_piece': return 'stuk';
      case 'per_handful': return 'handje';
      case 'per_30g': return 'g';
      case 'per_100g':
      default: return 'g';
    }
  };

  // Function to detect and correct legacy ingredient units
  const correctLegacyIngredientUnits = (ingredients: any[]) => {
    if (!ingredients || ingredients.length === 0 || ingredientsDatabase.length === 0) return ingredients;

    console.log('🔧 Checking for legacy unit corrections...');
    
    const correctedIngredients = ingredients.map((ingredient) => {
      // Check if this ingredient exists in database with different unit_type
      const dbIngredient = ingredientsDatabase.find(db => 
        db.name.toLowerCase() === ingredient.name.toLowerCase()
      );

      if (dbIngredient) {
        const correctUnit = getUnitLabel(dbIngredient);
        const correctAmount = getDefaultAmountForUnit(dbIngredient);

        // Check if current ingredient has wrong unit for per_piece items
        if (dbIngredient.unit_type === 'per_piece' && ingredient.unit === 'g') {
          console.log(`🔧 Correcting legacy unit for ${ingredient.name}: ${ingredient.amount}g → ${correctAmount} ${correctUnit}`);
          return {
            ...ingredient,
            amount: correctAmount,
            unit: correctUnit
          };
        }
        
        // Check if current ingredient has wrong unit for per_handful items
        if (dbIngredient.unit_type === 'per_handful' && ingredient.unit === 'g') {
          console.log(`🔧 Correcting legacy unit for ${ingredient.name}: ${ingredient.amount}g → ${correctAmount} ${correctUnit}`);
          return {
            ...ingredient,
            amount: correctAmount,
            unit: correctUnit
          };
        }
        
        // Check if current ingredient has wrong unit for per_30g items
        if (dbIngredient.unit_type === 'per_30g' && ingredient.unit !== 'g') {
          console.log(`🔧 Correcting legacy unit for ${ingredient.name}: ${ingredient.amount}${ingredient.unit} → ${correctAmount}g`);
          return {
            ...ingredient,
            amount: correctAmount,
            unit: 'g'
          };
        }
      }

      return ingredient;
    });

    return correctedIngredients;
  };

  const getDefaultAmountForUnit = (ingredient: DatabaseIngredient) => {
    switch (ingredient.unit_type) {
      case 'per_piece': return 1; // 1 stuk
      case 'per_handful': return 1; // 1 handje
      case 'per_30g': return 30; // 30 gram (voor whey protein)
      case 'per_100g':
      default: return 100; // 100 gram
    }
  };

  const getWeightPerPiece = (ingredient: DatabaseIngredient) => {
    const name = ingredient.name.toLowerCase();
    const category = ingredient.category?.toLowerCase();
    
    // Special case for whey protein (per_100g but shown as gram amounts)
    if ((name.includes('whey') || name.includes('wei')) && (name.includes('eiwit') || name.includes('protein') || name.includes('shake'))) {
      return 1; // 1 gram = 1 gram (direct weight)
    }
    
    // Supplementen have very small weights per piece
    if (category === 'supplementen') {
      if (name.includes('capsule') || name.includes('tablet') || name.includes('pil')) return 0.5; // 0.5g per capsule/tablet
      if (name.includes('scoop') || name.includes('schep')) return 30; // 30g per scoop
      return 1; // 1g default voor supplementen
    }
    
    // Specific weights per piece based on common Dutch food standards
    if (name.includes('ei')) return 50; // 1 ei = 50g
    if (name.includes('appel')) return 182; // 1 appel = 182g gemiddeld
    if (name.includes('banaan')) return 118; // 1 banaan = 118g gemiddeld
    if (name.includes('sinaasappel')) return 154; // 1 sinaasappel = 154g gemiddeld
    if (name.includes('peer')) return 178; // 1 peer = 178g gemiddeld
    
    // Default for unknown pieces
    return 100; // 100g default
  };

  const calculateNutritionForAmount = (ingredient: DatabaseIngredient, amount: number) => {
    // Convert user input (handje/stuk/gram) to grams for nutrition calculation
    let gramAmount = amount;
    
    if (ingredient.unit_type === 'per_handful') {
      gramAmount = amount * 25; // Each handje = 25g
    } else if (ingredient.unit_type === 'per_piece') {
      const weightPerPiece = getWeightPerPiece(ingredient);
      gramAmount = amount * weightPerPiece; // Each stuk = specific weight
    } else if (ingredient.unit_type === 'per_30g') {
      gramAmount = amount; // Direct gram amount (30g = 30g)
    }
    // per_100g: gramAmount stays as entered by user
    
    // Calculate nutrition based on the gram amount (database values are per 100g)
    const factor = gramAmount / 100;
    
    return {
      calories: Math.round((ingredient.calories_per_100g || 0) * factor),
      protein: Math.round(((ingredient.protein_per_100g || 0) * factor) * 10) / 10,
      carbs: Math.round(((ingredient.carbs_per_100g || 0) * factor) * 10) / 10,
      fat: Math.round(((ingredient.fat_per_100g || 0) * factor) * 10) / 10
    };
  };

  // Load ingredients database once when modal opens
  useEffect(() => {
    const loadIngredientsDatabase = async () => {
      try {
        console.log('🔍 Loading nutrition ingredients database...');
        const response = await fetch('/api/admin/nutrition-ingredients');
        const result = await response.json();
        if (result.success && result.ingredients) {
          setIngredientsDatabase(result.ingredients);
          console.log('✅ Nutrition ingredients database loaded:', result.ingredients.length, 'ingredients');
        } else {
          console.error('❌ Failed to load ingredients:', result.error);
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
    // Only process meal data when ingredients database is loaded
    if (!meal || ingredientsDatabase.length === 0) return;
    
    console.log('🍽️ MealEditModal: Loading meal data:', meal);
    console.log('🔍 MealEditModal: Meal type:', mealType);
    console.log('🧩 MealEditModal: Meal ingredients structure:', meal?.ingredients);
    console.log('🧩 MealEditModal: Meal suggestions structure:', (meal as any)?.suggestions);
    
    if (meal) {
      // First priority: use meal.ingredients if they exist and have valid data
      if (meal.ingredients && Array.isArray(meal.ingredients) && meal.ingredients.length > 0) {
        console.log('📋 Using existing meal ingredients:', meal.ingredients);
        
        // Apply legacy unit corrections if needed
        const correctedIngredients = correctLegacyIngredientUnits(meal.ingredients);
        setFormData({
          ...meal,
          ingredients: correctedIngredients
        });
      }
      // Second priority: convert suggestions to ingredients (legacy format)
      else if ((meal as any).suggestions && Array.isArray((meal as any).suggestions) && (meal as any).suggestions.length > 0) {
        console.log('📋 Converting suggestions to ingredients:', (meal as any).suggestions);
        
        const convertedIngredients = (meal as any).suggestions.map((suggestion: string, index: number) => {
          // Parse suggestion format: "Runderlever (43.35g)" or "1 Ei (1stuk)" 
          const match = suggestion.match(/^(.+)\s*\((.+)\)$/);
          if (match) {
            const [, name, amountWithUnit] = match;
            // Handle different formats: "43.35g", "1stuk", "1handje", "30g"
            let amount = 1;
            let unit = 'g';
            
            if (amountWithUnit.includes('stuk')) {
              const amountMatch = amountWithUnit.match(/^([\d.,]+)stuk$/);
              amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 1;
              unit = 'stuk';
            } else if (amountWithUnit.includes('handje')) {
              const amountMatch = amountWithUnit.match(/^([\d.,]+)handje$/);
              amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 1;
              unit = 'handje';
            } else {
              // Default to grams
              const amountMatch = amountWithUnit.match(/^([\d.,]+)(\w+)$/);
              if (amountMatch) {
                amount = parseFloat(amountMatch[1].replace(',', '.'));
                unit = amountMatch[2];
              }
            }
            
            return {
              id: `ingredient-${index}`,
              name: name.trim(),
              amount: amount,
              unit: unit,
              calories: 0, // Will be calculated
              protein: 0,
              carbs: 0,
              fat: 0
            };
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
        
        // Apply legacy unit corrections to converted ingredients too
        const correctedIngredients = correctLegacyIngredientUnits(convertedIngredients);
        setFormData({
          ...meal,
          ingredients: correctedIngredients
        });
      } else {
        // No ingredients or suggestions, start fresh
        setFormData({
          ...meal,
          ingredients: []
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
  }, [meal, mealType, ingredientsDatabase]);

  // Recalculate nutrition when ingredients database is loaded and we have ingredients
  useEffect(() => {
    if (ingredientsDatabase.length > 0 && formData.ingredients.length > 0) {
      console.log('🔄 Recalculating nutrition with loaded database...');
      const nutrition = calculateNutritionFromIngredients(formData.ingredients);
      setFormData(prev => ({
        ...prev,
        ...nutrition
      }));
    }
  }, [ingredientsDatabase, formData.ingredients.length]);

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
          ['vlees', 'vis', 'eieren', 'zuivel', 'carnivoor', 'vetten', 'Vlees', 'Vis', 'Eieren', 'Zuivel', 'Carnivoor', 'Vetten'].includes(ing.category)
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
      
      console.log('✅ Available ingredients loaded:', convertedMeals.length);
    } catch (error) {
      console.error('❌ Error loading ingredients:', error);
    }
  };


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
        // Use the same nutrition calculation as for adding ingredients
        const nutrition = calculateNutritionForAmount(dbIngredient, ingredient.amount);
        
        totalCalories += nutrition.calories;
        totalProtein += nutrition.protein;
        totalCarbs += nutrition.carbs;
        totalFat += nutrition.fat;
        
        console.log(`✅ Found nutrition for ${ingredient.name}:`, {
          amount: ingredient.amount,
          unit: ingredient.unit,
          unit_type: dbIngredient.unit_type,
          calories: nutrition.calories
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


  const addIngredientFromDatabase = (dbIngredient: DatabaseIngredient) => {
    const defaultAmount = getDefaultAmountForUnit(dbIngredient);
    const unit = getUnitLabel(dbIngredient);
    const nutrition = calculateNutritionForAmount(dbIngredient, defaultAmount);
    
    const newIngredient = {
      id: `ingredient-${Date.now()}`,
      name: dbIngredient.name,
      amount: defaultAmount,
      unit: unit,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat
    };
    
    const updatedIngredients = [...(formData.ingredients || []), newIngredient];
    const totalNutrition = calculateNutritionFromIngredients(updatedIngredients);
    
    setFormData(prev => ({
      ...prev,
      ingredients: updatedIngredients,
      calories: totalNutrition.calories,
      protein: totalNutrition.protein,
      carbs: totalNutrition.carbs,
      fat: totalNutrition.fat
    }));
    
    console.log('✅ Added ingredient from database:', dbIngredient.name, 'with unit:', unit, 'amount:', defaultAmount);
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

  // Helper functions for smart suggestions
  const getMealTypeName = () => {
    const mealNames = {
      'ontbijt': 'Ontbijt',
      'snack1': 'Ochtend Snack', 
      'lunch': 'Lunch',
      'snack2': 'Middag Snack',
      'diner': 'Diner'
    };
    return mealNames[mealType] || 'Maaltijd';
  };

  const getSmartSuggestions = () => {
    const isCarnivore = planType?.toLowerCase().includes('carnivoor');
    
    console.log('🔍 getSmartSuggestions DEBUG:');
    console.log('- Database total:', ingredientsDatabase.length);
    console.log('- Meal type:', mealType);
    console.log('- Plan type:', planType);
    console.log('- Plan type (lowercase):', planType?.toLowerCase());
    console.log('- Contains carnivoor?:', planType?.toLowerCase().includes('carnivoor'));
    console.log('- Is carnivore:', isCarnivore);
    
    // Check if test1234 or test 1234 exists in database
    const test1234 = ingredientsDatabase.find(ing => ing.name.toLowerCase().includes('test1234') || ing.name.toLowerCase().includes('test 1234'));
    console.log('- test1234/test 1234 found:', test1234 ? `${test1234.name} (${test1234.protein_per_100g}g protein, category: ${test1234.category})` : 'NOT FOUND');
    
    // Filter database ingredients for this meal type and plan type
    let availableIngredients = ingredientsDatabase;
    
    // Filter by plan type if carnivore
    if (isCarnivore) {
      availableIngredients = availableIngredients.filter(ing => 
        ing.is_carnivore === true
      );
      console.log('- After carnivore filter (using is_carnivore flag):', availableIngredients.length);
      
      // Check if test1234/test 1234 survived carnivore filter
      const test1234AfterFilter = availableIngredients.find(ing => ing.name.toLowerCase().includes('test1234') || ing.name.toLowerCase().includes('test 1234'));
      console.log('- test1234/test 1234 after carnivore filter:', test1234AfterFilter ? 'STILL THERE' : 'FILTERED OUT');
    }
    
    // Get meal-specific preferences based on protein content and meal type
    const getMealPreferences = (mealType: string) => {
      switch (mealType) {
        case 'ontbijt':
          const ontbijtFiltered = availableIngredients
            .filter(ing => ing.protein_per_100g > 10 || ['eieren', 'spek', 'boter', 'zalm', 'kaas'].some(keyword => 
              ing.name.toLowerCase().includes(keyword)));
          console.log('- Ontbijt filtered (>10g protein):', ontbijtFiltered.length);
          return ontbijtFiltered.slice(0, 6);
        case 'snack1':
        case 'snack2':
        case 'avondsnack':
          const snackFiltered = availableIngredients
            .filter(ing => ing.protein_per_100g > 15 || ['kaas', 'zalm', 'spek', 'boter'].some(keyword => 
              ing.name.toLowerCase().includes(keyword)));
          console.log('- Snack filtered (>15g protein):', snackFiltered.length);
          const test1234InSnack = snackFiltered.find(ing => ing.name.toLowerCase().includes('test1234') || ing.name.toLowerCase().includes('test 1234'));
          console.log('- test1234/test 1234 in snack filter:', test1234InSnack ? 'YES' : 'NO');
          return snackFiltered.slice(0, 6);
        case 'lunch':
        case 'diner':
          const mainFiltered = availableIngredients
            .filter(ing => ing.protein_per_100g > 20 || ['ribeye', 'kipfilet', 'runderlever', 'lamskotelet', 'biefstuk'].some(keyword => 
              ing.name.toLowerCase().includes(keyword)));
          console.log('- Main meal filtered (>20g protein):', mainFiltered.length);
          const test1234InMain = mainFiltered.find(ing => ing.name.toLowerCase().includes('test1234') || ing.name.toLowerCase().includes('test 1234'));
          console.log('- test1234/test 1234 in main filter:', test1234InMain ? 'YES' : 'NO');
          return mainFiltered.slice(0, 6);
        default:
          return availableIngredients.slice(0, 6);
      }
    };
    
    const selectedIngredients = getMealPreferences(mealType);
    console.log('- Final selected ingredients:', selectedIngredients.map(ing => `${ing.name} (${ing.protein_per_100g}g protein)`));
    
    // Convert to suggestion format with smart default amounts based on unit_type
    return selectedIngredients.map(ing => ({
      ...ing, // Include all ingredient properties
      amount: getDefaultAmountForUnit(ing),
      unit: getUnitLabel(ing)
    }));
  };

  const getDefaultAmount = (ingredientName: string) => {
    // Default amounts based on ingredient type
    const defaults = {
      'eieren': 200,
      'spek': 50,
      'ribeye': 200,
      'kipfilet': 200,
      'lamskotelet': 200,
      'runderlever': 150,
      'zalm': 120,
      'kaas': 30,
      'boter': 15,
      'olijfolie': 10,
      'honing': 15
    };
    
    const lowerName = ingredientName.toLowerCase();
    for (const [key, amount] of Object.entries(defaults)) {
      if (lowerName.includes(key)) {
        return amount;
      }
    }
    return 100; // Default fallback
  };

  const getFilteredIngredients = () => {
    let filtered = ingredientsDatabase;
    
    // Filter by search term
    if (ingredientSearchTerm) {
      filtered = filtered.filter(ing => 
        ing.name.toLowerCase().includes(ingredientSearchTerm.toLowerCase()) ||
        ing.category.toLowerCase().includes(ingredientSearchTerm.toLowerCase())
      );
    }
    
    // Filter by plan type if carnivore
    const isCarnivore = planType?.toLowerCase().includes('carnivoor');
    console.log('🔍 getFilteredIngredients DEBUG:');
    console.log('- Plan type:', planType);
    console.log('- Is carnivore plan:', isCarnivore);
    console.log('- Before carnivore filter:', filtered.length);
    
    if (isCarnivore) {
      filtered = filtered.filter(ing => ing.is_carnivore === true);
      console.log('- After carnivore filter:', filtered.length);
    }
    
    return filtered.slice(0, 50); // Limit to 50 for performance
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
            <div className="mb-4">
              <h3 className="text-[#8BAE5A] font-semibold">Ingrediënten</h3>
              <p className="text-xs text-gray-400 mt-1">Kies ingrediënten uit de database hieronder</p>
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
                    <option value="stuk">stuk</option>
                    <option value="handje">handje</option>
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


          {/* Smart Ingredient Suggestions */}
          <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[#8BAE5A] font-semibold">Aanbevolen voor {getMealTypeName()}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Database: {ingredientsDatabase.length} ingrediënten | 
                  Gefilterd: {getFilteredIngredients().length} ingrediënten |
                  Suggesties: {getSmartSuggestions().length}
                </p>
              </div>
              <button
                onClick={() => setShowAllIngredients(!showAllIngredients)}
                className="text-[#8BAE5A] hover:text-[#7A9D4B] text-sm border border-[#3A4D23] px-3 py-1 rounded transition-colors"
              >
                {showAllIngredients ? 'Verberg alle' : 'Bekijk alle beschikbare ingrediënten'}
              </button>
            </div>
            
            {!showAllIngredients ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {getSmartSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => addIngredientFromDatabase(suggestion)}
                    className="px-3 py-2 text-sm bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] rounded hover:bg-[#3A4D23] transition-colors"
                  >
                    {suggestion.name} ({suggestion.amount}{suggestion.unit})
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Zoek ingrediënten..."
                    value={ingredientSearchTerm}
                    onChange={(e) => setIngredientSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-1 focus:ring-[#8BAE5A]"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2">
                  {getFilteredIngredients().map((ingredient, index) => (
                    <button
                      key={index}
                      onClick={() => addIngredientFromDatabase(ingredient)}
                      className="px-3 py-2 text-sm bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] rounded hover:bg-[#3A4D23] transition-colors text-left"
                    >
                      <div className="font-medium">{ingredient.name}</div>
                      <div className="text-xs text-[#B6C948]">{ingredient.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
