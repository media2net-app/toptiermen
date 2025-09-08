'use client';
import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, CalendarIcon, PencilIcon } from '@heroicons/react/24/outline';
import AdminButton from '@/components/admin/AdminButton';
import MealEditModal from './MealEditModal';

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

interface NutritionPlan {
  id?: string;
  plan_id?: string;
  name: string;
  description: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  protein_percentage?: number;
  carbs_percentage?: number;
  fat_percentage?: number;
  duration_weeks?: number;
  difficulty?: string;
  goal?: string;
  fitness_goal?: 'droogtrainen' | 'spiermassa' | 'onderhoud';
  is_featured?: boolean;
  is_public?: boolean;
  meals?: {
    weekly_plan: {
      [key: string]: {
        [key: string]: {
          time: string;
          ingredients: Array<{
            id: string;
            name: string;
            amount: number;
            unit: string;
            calories_per_100g: number;
            protein_per_100g: number;
            carbs_per_100g: number;
            fat_per_100g: number;
          }>;
          nutrition: {
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
          };
        };
      };
    };
    weekly_averages: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  };
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  description?: string;
  is_carnivore: boolean;
  unit_type: string;
}

interface PlanBuilderProps {
  plan: NutritionPlan;
  onClose: () => void;
  onSave: (plan: NutritionPlan) => void;
  isPageMode?: boolean;
}

const DAYS = [
  { key: 'maandag', label: 'Maandag', theme: 'Energie Boost', focus: 'Start de week sterk' },
  { key: 'dinsdag', label: 'Dinsdag', theme: 'Consistentie', focus: 'Behoud momentum' },
  { key: 'woensdag', label: 'Woensdag', theme: 'Middenweek Push', focus: 'Over de helft' },
  { key: 'donderdag', label: 'Donderdag', theme: 'Doorzetten', focus: 'Bijna weekend' },
  { key: 'vrijdag', label: 'Vrijdag', theme: 'Weekend Voorbereiding', focus: 'Klaar voor rust' },
  { key: 'zaterdag', label: 'Zaterdag', theme: 'Herstel & Groei', focus: 'Tijd voor herstel' },
  { key: 'zondag', label: 'Zondag', theme: 'Voorbereiding', focus: 'Nieuwe week voorbereiden' }
];

const MEALS = [
  { key: 'ontbijt', label: 'Ontbijt', time: '08:00', icon: '🌅' },
  { key: 'ochtend_snack', label: 'Ochtend Snack', time: '10:00', icon: '🥜' },
  { key: 'lunch', label: 'Lunch', time: '12:30', icon: '🍽️' },
  { key: 'lunch_snack', label: 'Lunch Snack', time: '15:00', icon: '🍎' },
  { key: 'diner', label: 'Diner', time: '18:30', icon: '🌙' },
  { key: 'avond_snack', label: 'Avond Snack', time: '21:00', icon: '🌙' }
];

export default function PlanBuilder({ plan, onClose, onSave, isPageMode = false }: PlanBuilderProps) {
  const [formData, setFormData] = useState<NutritionPlan>(plan);
  const [activeTab, setActiveTab] = useState<'overview' | 'daily_plans' | 'ingredients'>('overview');
  const [selectedDay, setSelectedDay] = useState<string>('maandag');
  const [selectedMeal, setSelectedMeal] = useState<string>('ontbijt');
  const [showMealModal, setShowMealModal] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  // AutoSaveStatus removed for better performance
  
  // Ingredients management state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCarnivoreFilter, setSelectedCarnivoreFilter] = useState('all');
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<any>(null);
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    category: '',
    is_carnivore: false,
    unit_type: 'per_100g',
    calories_per_100g: '',
    protein_per_100g: '',
    carbs_per_100g: '',
    fat_per_100g: ''
  });
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddUnitTypeModal, setShowAddUnitTypeModal] = useState(false);
  const [showCopyDayModal, setShowCopyDayModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newUnitType, setNewUnitType] = useState('');
  const [selectedSourceDay, setSelectedSourceDay] = useState<string>('');
  const [selectedTargetDays, setSelectedTargetDays] = useState<string[]>([]);
  const [copyingDay, setCopyingDay] = useState(false);
  const [mealsData, setMealsData] = useState<any>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableUnitTypes, setAvailableUnitTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchIngredients();
  }, []);

  // Initialize formData and mealsData when plan changes
  useEffect(() => {
    if (plan) {
      console.log('🔄 PlanBuilder: Plan changed, updating formData:', plan.name);
      
      // Always use plan properties for target values (not meals data which may be outdated)
      const targetCalories = plan.target_calories;
      const targetProtein = plan.target_protein;
      const targetCarbs = plan.target_carbs;
      const targetFat = plan.target_fat;
      
      // Use stored percentages if available, otherwise calculate from macros
      let proteinPercentage = plan.protein_percentage;
      let carbsPercentage = plan.carbs_percentage;
      let fatPercentage = plan.fat_percentage;
      
      // Only calculate if percentages are not stored in database (null, undefined, or 0)
      if (targetCalories && targetProtein && targetCarbs && targetFat && 
          (proteinPercentage === null || proteinPercentage === undefined || proteinPercentage === 0)) {
        proteinPercentage = Math.round((targetProtein * 4 / targetCalories) * 100);
        carbsPercentage = Math.round((targetCarbs * 4 / targetCalories) * 100);
        fatPercentage = Math.round((targetFat * 9 / targetCalories) * 100);
      }
      
      const updatedFormData = {
        ...plan,
        target_calories: targetCalories,
        target_protein: targetProtein,
        target_carbs: targetCarbs,
        target_fat: targetFat,
        protein_percentage: proteinPercentage,
        carbs_percentage: carbsPercentage,
        fat_percentage: fatPercentage
      };
      
      setFormData(updatedFormData);
      
      if (plan.meals) {
        setMealsData(plan.meals);
        console.log('🍽️ PlanBuilder: Meals data updated:', plan.meals);
      }
      
      console.log('✅ PlanBuilder: Target macros loaded:', {
        calories: targetCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
        proteinPercentage,
        carbsPercentage,
        fatPercentage,
        storedPercentages: {
          protein: plan.protein_percentage,
          carbs: plan.carbs_percentage,
          fat: plan.fat_percentage
        }
      });
    }
  }, [plan]);

  // Initialize mealsData when formData changes
  useEffect(() => {
    if (formData.meals) {
      setMealsData(formData.meals);
    }
  }, [formData.meals]);

  // Update available categories and unit types when ingredients change
  useEffect(() => {
    const categories = [...new Set(ingredients.map(ingredient => ingredient.category))];
    const unitTypes = [...new Set(ingredients.map(ingredient => ingredient.unit_type))];
    setAvailableCategories(categories);
    setAvailableUnitTypes(unitTypes);
  }, [ingredients]);

  // Autosave disabled for better performance - use manual save button instead


  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/admin/nutrition-ingredients');
      const result = await response.json();
      if (result.success) {
        setIngredients(result.ingredients);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const refreshPlanData = async () => {
    try {
      console.log('🔄 Refreshing plan data from database...');
      const response = await fetch(`/api/admin/plan-meals?planId=${plan.id}`);
      const result = await response.json();
      
      if (result.success && result.plan) {
        console.log('✅ Plan data refreshed:', result.plan.name);
        setFormData(result.plan);
        if (result.plan.meals) {
          setMealsData(result.plan.meals);
          console.log('🍽️ Meals data refreshed:', result.plan.meals);
        }
      } else {
        console.error('❌ Failed to refresh plan data:', result.error);
        alert('Fout bij vernieuwen van data: ' + (result.error || 'Onbekende fout'));
      }
    } catch (error) {
      console.error('❌ Error refreshing plan data:', error);
      alert('Fout bij vernieuwen van data: ' + error.message);
    }
  };

  const handleSave = async () => {
    try {
      console.log('💾 Manual save initiated...');
      
      // Clean payload - remove invalid columns and only include valid database fields
      const { weekly_plan, created_at, updated_at, ...cleanFormData } = formData as any;
      const requestBody = { ...cleanFormData, id: plan.id };
      
      const response = await fetch('/api/admin/nutrition-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        console.log('✅ Plan saved successfully via manual save button');
        onSave(formData);
        alert('Plan succesvol opgeslagen!');
      } else {
        const errorText = await response.text();
        console.error('❌ Save failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        alert('Fout bij opslaan van plan: ' + errorText);
      }
    } catch (error) {
      console.error('💥 Save error:', error);
      alert('Fout bij opslaan van plan: ' + error.message);
    }
  };

  const handleMealEdit = (day: string, meal: string) => {
    setSelectedDay(day);
    setSelectedMeal(meal);
    setShowMealModal(true);
  };

  const handleMealSave = async (ingredients: any[]) => {
    console.log('🍽️ PlanBuilder handleMealSave called with ingredients:', ingredients);
    try {
      const response = await fetch('/api/admin/plan-meals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          day: selectedDay,
          meal: selectedMeal,
          ingredients: ingredients
        })
      });
      
      const result = await response.json();

      if (result.success) {
        console.log('✅ Meal save successful, updating state...');
        // Update the formData with the new meals data
        setFormData(prevData => ({
          ...prevData,
          meals: result.meals
        }));
        // Also update the mealsData state for immediate UI updates
        setMealsData(result.meals);
        setShowMealModal(false);
        console.log('✅ State updated, modal closed');
      } else {
        console.error('❌ Meal save failed:', result);
        alert('Fout bij opslaan van maaltijd: ' + (result.error || 'Onbekende fout'));
      }
    } catch (error) {
      console.error('💥 Error saving meal:', error);
      alert('Fout bij opslaan van maaltijd: ' + error.message);
    }
  };

  const getMealData = (day: string, meal: string) => {
    const meals = mealsData || formData.meals;
    const mealData = meals?.weekly_plan?.[day]?.[meal] || {
      time: MEALS.find(m => m.key === meal)?.time || '12:00',
      ingredients: [],
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    };
    
    return mealData;
  };

  const getDayTotal = (day: string) => {
    let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    MEALS.forEach(meal => {
      const mealData = getMealData(day, meal.key);
      total.calories += mealData.nutrition.calories;
      total.protein += mealData.nutrition.protein;
      total.carbs += mealData.nutrition.carbs;
      total.fat += mealData.nutrition.fat;
    });
    
    return total;
  };

  const getWeeklyTotal = () => {
    let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    DAYS.forEach(day => {
      const dayTotal = getDayTotal(day.key);
      total.calories += dayTotal.calories;
      total.protein += dayTotal.protein;
      total.carbs += dayTotal.carbs;
      total.fat += dayTotal.fat;
    });
    return {
      calories: Math.round(total.calories / 7),
      protein: Math.round((total.protein / 7) * 10) / 10,
      carbs: Math.round((total.carbs / 7) * 10) / 10,
      fat: Math.round((total.fat / 7) * 10) / 10
    };
  };

  // Helper function to get progress bar color based on target accuracy
  const getProgressBarColor = (current: number, target: number) => {
    if (!target || target === 0) return 'bg-gray-500';
    
    const percentage = (current / target) * 100;
    const deviation = Math.abs(percentage - 100);
    
    if (deviation <= 5) {
      return 'bg-green-500'; // ±5% = Groen
    } else if (deviation <= 10) {
      return 'bg-orange-500'; // ±10% = Oranje
    } else {
      return 'bg-red-500'; // >10% = Rood
    }
  };

  // Helper function to get unit type label in Dutch
  const getUnitTypeLabel = (unitType: string) => {
    switch (unitType) {
      case 'per_piece': return 'per stuk';
      case 'per_handful': return 'per handje';
      case 'per_plakje': return 'per plakje';
      case 'per_30g': return 'per 30g';
      case 'per_100g': return 'per 100g';
      default: return 'per 100g';
    }
  };

  // Ingredients management functions
  const handleAddIngredient = () => {
    setEditingIngredient(null);
    setIngredientForm({
      name: '',
      category: '',
      is_carnivore: false,
      unit_type: 'per_100g',
      calories_per_100g: '',
      protein_per_100g: '',
      carbs_per_100g: '',
      fat_per_100g: ''
    });
    setShowIngredientModal(true);
  };

  const handleEditIngredient = (ingredient: any) => {
    setEditingIngredient(ingredient);
    setIngredientForm({
      name: ingredient.name,
      category: ingredient.category,
      is_carnivore: ingredient.is_carnivore,
      unit_type: ingredient.unit_type,
      calories_per_100g: ingredient.calories_per_100g?.toString() || '',
      protein_per_100g: ingredient.protein_per_100g?.toString() || '',
      carbs_per_100g: ingredient.carbs_per_100g?.toString() || '',
      fat_per_100g: ingredient.fat_per_100g?.toString() || ''
    });
    setShowIngredientModal(true);
  };

  const handleSaveIngredient = async () => {
    try {
      const url = '/api/admin/nutrition-ingredients';
      const method = editingIngredient ? 'PUT' : 'POST';
      
      // Convert string values to numbers for the API
      const formData = {
        ...ingredientForm,
        calories_per_100g: parseFloat(ingredientForm.calories_per_100g) || 0,
        protein_per_100g: parseFloat(ingredientForm.protein_per_100g) || 0,
        carbs_per_100g: parseFloat(ingredientForm.carbs_per_100g) || 0,
        fat_per_100g: parseFloat(ingredientForm.fat_per_100g) || 0
      };
      
      // Add ID to body for PUT requests
      if (editingIngredient) {
        (formData as any).id = editingIngredient.id;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowIngredientModal(false);
        setEditingIngredient(null);
        fetchIngredients(); // Refresh the list
        console.log('✅ Ingredient saved successfully');
      } else {
        console.error('❌ Error saving ingredient:', result.error);
        alert('Fout bij opslaan van ingrediënt: ' + (result.error || 'Onbekende fout'));
      }
    } catch (error) {
      console.error('💥 Error saving ingredient:', error);
      alert('Fout bij opslaan van ingrediënt: ' + error.message);
    }
  };

  const handleDeleteIngredient = async (ingredientId: string) => {
    if (!confirm('Weet je zeker dat je dit ingrediënt wilt verwijderen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/nutrition-ingredients?id=${ingredientId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        fetchIngredients(); // Refresh the list
      } else {
        console.error('Error deleting ingredient:', result.error);
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
    }
  };

  // Filter ingredients based on search and filters
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ingredient.category === selectedCategory;
    const matchesCarnivore = selectedCarnivoreFilter === 'all' || 
      (selectedCarnivoreFilter === 'carnivore' && ingredient.is_carnivore) ||
      (selectedCarnivoreFilter === 'standard' && !ingredient.is_carnivore);
    
    return matchesSearch && matchesCategory && matchesCarnivore;
  });

  // Categories and unit types are now managed via state (availableCategories, availableUnitTypes)

  // Add new category
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const categoryName = newCategory.trim();
      setIngredientForm({ ...ingredientForm, category: categoryName });
      // Add to available categories immediately
      setAvailableCategories(prev => [...prev, categoryName]);
      setNewCategory('');
      setShowAddCategoryModal(false);
    }
  };

  // Add new unit type
  const handleAddUnitType = () => {
    if (newUnitType.trim()) {
      const unitTypeName = newUnitType.trim();
      setIngredientForm({ ...ingredientForm, unit_type: unitTypeName });
      // Add to available unit types immediately
      setAvailableUnitTypes(prev => [...prev, unitTypeName]);
      setNewUnitType('');
      setShowAddUnitTypeModal(false);
    }
  };

  // Copy day plan from source day to target day(s)
  const handleCopyDayPlan = async () => {
    if (!selectedSourceDay) {
      alert('Selecteer een bron dag om te kopiëren');
      return;
    }

    if (selectedTargetDays.length === 0) {
      alert('Selecteer minimaal één doeldag om naar te kopiëren');
      return;
    }

    if (selectedTargetDays.includes(selectedSourceDay)) {
      alert('Je kunt niet een dag naar zichzelf kopiëren');
      return;
    }

    setCopyingDay(true);

    try {
      // Get the source day's meal data
      const sourceMealsData = mealsData?.weekly_plan?.[selectedSourceDay] || {};

      if (!sourceMealsData || Object.keys(sourceMealsData).length === 0) {
        alert(`Geen maaltijddata gevonden voor ${DAYS.find(d => d.key === selectedSourceDay)?.label}`);
        return;
      }

      // Create updated meals data with copied days
      const updatedMeals = {
        ...mealsData,
        weekly_plan: {
          ...mealsData?.weekly_plan
        }
      };

      // Copy to all selected target days
      selectedTargetDays.forEach(targetDay => {
        updatedMeals.weekly_plan[targetDay] = sourceMealsData;
      });

      // Update local state immediately
      setMealsData(updatedMeals);
      setFormData(prevData => ({
        ...prevData,
        meals: updatedMeals
      }));

      // Save to database using the nutrition-plans API instead of daily-plans
      const response = await fetch('/api/admin/nutrition-plans', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: formData.id,
          meals: updatedMeals
        }),
      });

      if (response.ok) {
        const targetDayNames = selectedTargetDays.map(day => DAYS.find(d => d.key === day)?.label).join(', ');
        alert(`Maaltijden van ${DAYS.find(d => d.key === selectedSourceDay)?.label} succesvol gekopieerd naar ${targetDayNames}`);
        setShowCopyDayModal(false);
        setSelectedSourceDay('');
        setSelectedTargetDays([]);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to copy day plan:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        alert('Er is een fout opgetreden bij het kopiëren van de dag');
      }
    } catch (error) {
      console.error('💥 Error copying day plan:', error);
      alert('Er is een fout opgetreden bij het kopiëren van de dag');
    } finally {
      setCopyingDay(false);
    }
  };

  return (
    <div className={isPageMode ? "flex flex-col" : "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"}>
      <div className={`${isPageMode ? "" : "bg-[#0F150E] rounded-xl border border-[#3A4D23] w-full max-w-7xl h-[90vh]"} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
          <div>
            <h2 className="text-2xl font-bold text-[#8BAE5A]">{formData.name}</h2>
            <p className="text-gray-300 mt-1">{formData.description}</p>
          </div>
            <div className="flex items-center space-x-4">
              {/* Manual Save Button */}
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 bg-[#8BAE5A] text-[#232D1A] hover:bg-[#B6C948]"
                title="Opslaan naar database"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Opslaan</span>
              </button>
            
            {/* Refresh Button */}
            <button
              onClick={refreshPlanData}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Vernieuw data vanuit database"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Vernieuwen</span>
            </button>
            {!isPageMode && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#3A4D23]">
          {[
            { key: 'overview', label: 'Overzicht', icon: '📊' },
            { key: 'daily_plans', label: 'Dagelijkse Plannen', icon: '📅' },
            { key: 'ingredients', label: 'Ingredienten', icon: '🥗' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[#8BAE5A] border-b-2 border-[#8BAE5A] bg-[#8BAE5A]/5'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'overview' && (
            <div className="p-6 h-full overflow-y-auto">
              {/* Weekly Summary - Compact Version */}
              <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23] mb-6">
                <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Wekelijks Overzicht</h3>
                
                {/* Weekly Progress Dashboard - Compact */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {/* Weekly Calories Average */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#8BAE5A] mb-1">
                      {getWeeklyTotal().calories}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">kcal gemiddeld</div>
                    <div className="text-xs text-[#B6C948]">
                      {formData.target_calories ? 
                        `${Math.round((getWeeklyTotal().calories / formData.target_calories) * 100)}% van doel` : 
                        'Geen doel'
                      }
                    </div>
                    {formData.target_calories && (
                      <div className="w-full bg-[#0F150E] rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(getWeeklyTotal().calories, formData.target_calories)}`}
                          style={{ 
                            width: `${Math.min((getWeeklyTotal().calories / formData.target_calories) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Weekly Protein Average */}
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-400 mb-1">
                      {Math.round(getWeeklyTotal().protein * 10) / 10}g
                    </div>
                    <div className="text-xs text-gray-400 mb-1">Eiwit gemiddeld</div>
                    <div className="text-xs text-[#B6C948]">
                      {formData.target_protein ? 
                        `${Math.round((getWeeklyTotal().protein / formData.target_protein) * 100)}% van doel` : 
                        'Geen doel'
                      }
                    </div>
                    {formData.target_protein && (
                      <div className="w-full bg-[#0F150E] rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(getWeeklyTotal().protein, formData.target_protein)}`}
                          style={{ 
                            width: `${Math.min((getWeeklyTotal().protein / formData.target_protein) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Weekly Carbs Average */}
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-400 mb-1">
                      {Math.round(getWeeklyTotal().carbs * 10) / 10}g
                    </div>
                    <div className="text-xs text-gray-400 mb-1">Koolhydraten gemiddeld</div>
                    <div className="text-xs text-[#B6C948]">
                      {formData.target_carbs ? 
                        `${Math.round((getWeeklyTotal().carbs / formData.target_carbs) * 100)}% van doel` : 
                        'Geen doel'
                      }
                    </div>
                    {formData.target_carbs && (
                      <div className="w-full bg-[#0F150E] rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(getWeeklyTotal().carbs, formData.target_carbs)}`}
                          style={{ 
                            width: `${Math.min((getWeeklyTotal().carbs / formData.target_carbs) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Weekly Fat Average */}
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-400 mb-1">
                      {Math.round(getWeeklyTotal().fat * 10) / 10}g
                    </div>
                    <div className="text-xs text-gray-400 mb-1">Vet gemiddeld</div>
                    <div className="text-xs text-[#B6C948]">
                      {formData.target_fat ? 
                        `${Math.round((getWeeklyTotal().fat / formData.target_fat) * 100)}% van doel` : 
                        'Geen doel'
                      }
                    </div>
                    {formData.target_fat && (
                      <div className="w-full bg-[#0F150E] rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(getWeeklyTotal().fat, formData.target_fat)}`}
                          style={{ 
                            width: `${Math.min((getWeeklyTotal().fat / formData.target_fat) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Daily Breakdown - Compact */}
                <div className="border-t border-[#3A4D23] pt-4">
                  <h4 className="text-sm font-semibold text-[#8BAE5A] mb-3">Dagelijkse Breakdown</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS.map(day => {
                      const dayTotal = getDayTotal(day.key);
                      return (
                        <div key={day.key} className="text-center">
                          <div className="text-xs font-medium text-[#8BAE5A] mb-1">{day.label}</div>
                          <div className="bg-[#0F150E] rounded p-2 border border-[#3A4D23]">
                            <div className="text-sm font-bold text-white">{dayTotal.calories}</div>
                            <div className="text-xs text-gray-400">kcal</div>
                            <div className="text-xs text-[#B6C948] mt-1">
                              Eiwit: {Math.round(dayTotal.protein * 10) / 10}g | Koolhydraten: {Math.round(dayTotal.carbs * 10) / 10}g | Vet: {Math.round(dayTotal.fat * 10) / 10}g
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plan Details */}
                <div className="bg-[#181F17] rounded-lg p-6 border border-[#3A4D23]">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Plan Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Naam</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Beschrijving</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Doel</label>
                      <select
                        value={formData.goal || ''}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      >
                        <option value="Droogtrainen">Droogtrainen</option>
                        <option value="Onderhoud">Onderhoud</option>
                        <option value="Spiermassa">Spiermassa</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Target Macros */}
                <div className="bg-[#181F17] rounded-lg p-6 border border-[#3A4D23]">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Target Macros</h3>
                  
                  {/* Calorieën */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Calorieën</label>
                    <input
                      type="number"
                      value={formData.target_calories || ''}
                      onChange={(e) => setFormData({ ...formData, target_calories: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                    />
                  </div>

                  {/* Macro Percentages */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Eiwit (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.protein_percentage || ''}
                        onChange={(e) => {
                          const proteinPct = parseInt(e.target.value) || 0;
                          setFormData({ 
                            ...formData, 
                            protein_percentage: proteinPct,
                            target_protein: formData.target_calories ? Math.round((proteinPct / 100) * formData.target_calories / 4) : 0
                          });
                        }}
                        className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      />
                      {formData.target_protein && (
                        <div className="text-xs text-[#B6C948] mt-1">
                          {formData.target_protein}g eiwit
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Koolhydraten (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.carbs_percentage || ''}
                        onChange={(e) => {
                          const carbsPct = parseInt(e.target.value) || 0;
                          setFormData({ 
                            ...formData, 
                            carbs_percentage: carbsPct,
                            target_carbs: formData.target_calories ? Math.round((carbsPct / 100) * formData.target_calories / 4) : 0
                          });
                        }}
                        className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      />
                      {formData.target_carbs && (
                        <div className="text-xs text-[#B6C948] mt-1">
                          {formData.target_carbs}g koolhydraten
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Vet (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.fat_percentage || ''}
                        onChange={(e) => {
                          const fatPct = parseInt(e.target.value) || 0;
                          setFormData({ 
                            ...formData, 
                            fat_percentage: fatPct,
                            target_fat: formData.target_calories ? Math.round((fatPct / 100) * formData.target_calories / 9) : 0
                          });
                        }}
                        className="w-full px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      />
                      {formData.target_fat && (
                        <div className="text-xs text-[#B6C948] mt-1">
                          {formData.target_fat}g vet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Percentage Validation */}
                  {(() => {
                    const totalPercentage = (formData.protein_percentage || 0) + (formData.carbs_percentage || 0) + (formData.fat_percentage || 0);
                    if (totalPercentage > 100) {
                      return (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-red-400">⚠️</span>
                            <span className="text-red-400 font-medium">
                              Totaal percentage is {totalPercentage}%. Dit moet 100% zijn.
                            </span>
                          </div>
                        </div>
                      );
                    } else if (totalPercentage < 100 && totalPercentage > 0) {
                      return (
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">ℹ️</span>
                            <span className="text-yellow-400 font-medium">
                              Totaal percentage is {totalPercentage}%. Nog {100 - totalPercentage}% te verdelen.
                            </span>
                          </div>
                        </div>
                      );
                    } else if (totalPercentage === 100) {
                      return (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">✅</span>
                            <span className="text-green-400 font-medium">
                              Macro verdeling is correct (100%)
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Formula Calculation */}
                <div className="bg-[#181F17] rounded-lg p-6 border border-[#3A4D23]">
                  <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Formule Berekening</h3>
                  <div className="space-y-4">
                    <div className="bg-[#0F150E] rounded-lg p-4 border border-[#3A4D23]">
                      <div className="text-sm font-medium text-[#8BAE5A] mb-2">Dagelijkse Calorieën</div>
                      <div className="text-lg font-bold text-white mb-1">
                        Gewicht × 22 × Activiteitniveau
                      </div>
                      <div className="text-xs text-gray-400">
                        Voorbeeld: 100kg × 22 × 1.3 = 2,860 kcal
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-[#8BAE5A] mb-2">Activiteitsniveaus</div>
                      
                      <div className="flex items-center justify-between p-3 bg-[#0F150E] rounded-lg border border-[#3A4D23]">
                        <div>
                          <div className="text-sm font-medium text-white">Zittend (Licht actief)</div>
                          <div className="text-xs text-gray-400">Kantoorbaan, weinig beweging</div>
                        </div>
                        <div className="text-lg font-bold text-[#8BAE5A]">1.1</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-[#0F150E] rounded-lg border border-[#3A4D23]">
                        <div>
                          <div className="text-sm font-medium text-white">Staand (Matig actief)</div>
                          <div className="text-xs text-gray-400">Staand werk, matige beweging</div>
                        </div>
                        <div className="text-lg font-bold text-[#8BAE5A]">1.3</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-[#0F150E] rounded-lg border border-[#3A4D23]">
                        <div>
                          <div className="text-sm font-medium text-white">Lopend (Zeer actief)</div>
                          <div className="text-xs text-gray-400">Fysiek werk, veel beweging</div>
                        </div>
                        <div className="text-lg font-bold text-[#8BAE5A]">1.6</div>
                      </div>
                    </div>

                    <div className="bg-[#0F150E] rounded-lg p-4 border border-[#3A4D23]">
                      <div className="text-sm font-medium text-[#8BAE5A] mb-2">Calorie Doelen</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Droogtrainen:</span>
                          <span className="text-white font-medium">-500 kcal van onderhoud</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Onderhoud:</span>
                          <span className="text-white font-medium">Dagelijkse calorieën</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Spiermassa:</span>
                          <span className="text-white font-medium">+400 kcal van onderhoud</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'daily_plans' && (
            <div className="flex-1 overflow-hidden">
              {/* Horizontal Day Navigation */}
              <div className="p-6 border-b border-[#3A4D23]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#8BAE5A]">Selecteer Dag</h3>
                  <button
                    onClick={() => setShowCopyDayModal(true)}
                    className="px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Plan kopieren van andere dag
                  </button>
                </div>
                <div className="flex space-x-2 overflow-x-auto">
                  {DAYS.map(day => (
                    <button
                      key={day.key}
                      onClick={() => setSelectedDay(day.key)}
                      className={`flex-shrink-0 p-3 rounded-lg text-center transition-colors min-w-[100px] ${
                        selectedDay === day.key
                          ? 'bg-[#8BAE5A] text-white'
                          : 'bg-[#0F150E] text-gray-300 hover:bg-[#3A4D23]'
                      }`}
                    >
                      <div className="font-medium text-sm">{day.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Meals Table */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">
                      {DAYS.find(d => d.key === selectedDay)?.label} - Maaltijden
                    </h3>
                    
                    {/* Daily Progress Section */}
                    <div className="bg-[#181F17] rounded-lg border border-[#3A4D23] p-6 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Calories Progress */}
                        <div className="text-center">
                          <div className="text-sm text-white mb-1">
                            Doel: {formData.target_calories || 0} kcal
                          </div>
                          <div className="text-3xl font-bold text-[#8BAE5A] mb-2">
                            {getDayTotal(selectedDay).calories}
                          </div>
                          <div className="text-sm text-gray-400 mb-1">kcal</div>
                          <div className="text-xs text-[#B6C948]">
                            {formData.target_calories ? (() => {
                              const current = getDayTotal(selectedDay).calories;
                              const target = formData.target_calories;
                              const difference = current - target;
                              const percentage = Math.round((current / target) * 100);
                              
                              if (difference > 0) {
                                return `+${Math.round(difference)} kcal te veel (${percentage}%)`;
                              } else if (difference < 0) {
                                return `${Math.round(Math.abs(difference))} kcal te weinig (${percentage}%)`;
                              } else {
                                return `Doel bereikt! (${percentage}%)`;
                              }
                            })() : 'Geen doel ingesteld'}
                          </div>
                          {formData.target_calories && (
                            <div className="w-full bg-[#0F150E] rounded-full h-2 mt-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(getDayTotal(selectedDay).calories, formData.target_calories)}`}
                                style={{ 
                                  width: `${Math.min((getDayTotal(selectedDay).calories / formData.target_calories) * 100, 100)}%`
                                }}
                              ></div>
                            </div>
                          )}
                        </div>

                        {/* Protein Progress */}
                        <div className="text-center">
                          <div className="text-sm text-white mb-1">
                            Doel: {formData.target_protein || 0}g
                          </div>
                          <div className="text-2xl font-bold text-blue-400 mb-2">
                            {Math.round(getDayTotal(selectedDay).protein * 10) / 10}g
                          </div>
                          <div className="text-sm text-gray-400 mb-1">Eiwit</div>
                          <div className="text-xs text-[#B6C948]">
                            {formData.target_protein ? (() => {
                              const current = getDayTotal(selectedDay).protein;
                              const target = formData.target_protein;
                              const difference = current - target;
                              const percentage = Math.round((current / target) * 100);
                              
                              if (difference > 0) {
                                return `+${Math.round(difference * 10) / 10}g te veel (${percentage}%)`;
                              } else if (difference < 0) {
                                return `${Math.round(Math.abs(difference) * 10) / 10}g te weinig (${percentage}%)`;
                              } else {
                                return `Doel bereikt! (${percentage}%)`;
                              }
                            })() : 'Geen doel ingesteld'}
                          </div>
                          {formData.target_protein && (
                            <div className="w-full bg-[#0F150E] rounded-full h-2 mt-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(getDayTotal(selectedDay).protein, formData.target_protein)}`}
                                style={{ 
                                  width: `${Math.min((getDayTotal(selectedDay).protein / formData.target_protein) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          )}
                        </div>

                        {/* Carbs Progress */}
                        <div className="text-center">
                          <div className="text-sm text-white mb-1">
                            Doel: {formData.target_carbs || 0}g
                          </div>
                          <div className="text-2xl font-bold text-orange-400 mb-2">
                            {Math.round(getDayTotal(selectedDay).carbs * 10) / 10}g
                          </div>
                          <div className="text-sm text-gray-400 mb-1">Koolhydraten</div>
                          <div className="text-xs text-[#B6C948]">
                            {formData.target_carbs ? (() => {
                              const current = getDayTotal(selectedDay).carbs;
                              const target = formData.target_carbs;
                              const difference = current - target;
                              const percentage = Math.round((current / target) * 100);
                              
                              if (difference > 0) {
                                return `+${Math.round(difference * 10) / 10}g te veel (${percentage}%)`;
                              } else if (difference < 0) {
                                return `${Math.round(Math.abs(difference) * 10) / 10}g te weinig (${percentage}%)`;
                              } else {
                                return `Doel bereikt! (${percentage}%)`;
                              }
                            })() : 'Geen doel ingesteld'}
                          </div>
                          {formData.target_carbs && (
                            <div className="w-full bg-[#0F150E] rounded-full h-2 mt-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(getDayTotal(selectedDay).carbs, formData.target_carbs)}`}
                                style={{ 
                                  width: `${Math.min((getDayTotal(selectedDay).carbs / formData.target_carbs) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          )}
                        </div>

                        {/* Fat Progress */}
                        <div className="text-center">
                          <div className="text-sm text-white mb-1">
                            Doel: {formData.target_fat || 0}g
                          </div>
                          <div className="text-2xl font-bold text-yellow-400 mb-2">
                            {Math.round(getDayTotal(selectedDay).fat * 10) / 10}g
                          </div>
                          <div className="text-sm text-gray-400 mb-1">Vet</div>
                          <div className="text-xs text-[#B6C948]">
                            {formData.target_fat ? (() => {
                              const current = getDayTotal(selectedDay).fat;
                              const target = formData.target_fat;
                              const difference = current - target;
                              const percentage = Math.round((current / target) * 100);
                              
                              if (difference > 0) {
                                return `+${Math.round(difference * 10) / 10}g te veel (${percentage}%)`;
                              } else if (difference < 0) {
                                return `${Math.round(Math.abs(difference) * 10) / 10}g te weinig (${percentage}%)`;
                              } else {
                                return `Doel bereikt! (${percentage}%)`;
                              }
                            })() : 'Geen doel ingesteld'}
                          </div>
                          {formData.target_fat && (
                            <div className="w-full bg-[#0F150E] rounded-full h-2 mt-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(getDayTotal(selectedDay).fat, formData.target_fat)}`}
                                style={{ 
                                  width: `${Math.min((getDayTotal(selectedDay).fat / formData.target_fat) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Meals Table */}
                  <div className="bg-[#181F17] rounded-lg border border-[#3A4D23] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#0F150E] border-b border-[#3A4D23]">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Maaltijd</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Tijd</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Calorieën</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Eiwit</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Koolhydraten</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Vet</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Ingredienten</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Acties</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3A4D23]">
                          {MEALS.map(meal => {
                            const mealData = getMealData(selectedDay, meal.key);
                            const hasIngredients = mealData.ingredients.length > 0;
                            
                            return (
                              <tr key={meal.key} className="hover:bg-[#0F150E]/50 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-xl">{meal.icon}</span>
                                    <span className="font-medium text-white">{meal.label}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-gray-300">{meal.time}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`font-semibold ${hasIngredients ? 'text-[#8BAE5A]' : 'text-gray-500'}`}>
                                    {mealData.nutrition.calories} kcal
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center text-blue-400">{Math.round(mealData.nutrition.protein * 10) / 10}g</td>
                                <td className="px-4 py-3 text-center text-orange-400">{Math.round(mealData.nutrition.carbs * 10) / 10}g</td>
                                <td className="px-4 py-3 text-center text-yellow-400">{Math.round(mealData.nutrition.fat * 10) / 10}g</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-sm ${hasIngredients ? 'text-white' : 'text-gray-500'}`}>
                                    {mealData.ingredients.length}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => handleMealEdit(selectedDay, meal.key)}
                                    className="p-2 bg-[#8BAE5A] hover:bg-[#8BAE5A]/80 text-white rounded-lg transition-colors"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Ingredients Details for Selected Meal (if any) */}
                  {MEALS.some(meal => getMealData(selectedDay, meal.key).ingredients.length > 0) && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-[#8BAE5A] mb-3">Ingredienten Details</h4>
                      <div className="space-y-3">
                        {MEALS.map(meal => {
                          const mealData = getMealData(selectedDay, meal.key);
                          if (mealData.ingredients.length === 0) return null;
                          
                          return (
                            <div key={meal.key} className="bg-[#181F17] rounded-lg border border-[#3A4D23] p-4">
                              <div className="flex items-center space-x-2 mb-3">
                                <span className="text-lg">{meal.icon}</span>
                                <span className="font-medium text-white">{meal.label}</span>
                                <span className="text-sm text-gray-400">({mealData.ingredients.length} ingredienten)</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {mealData.ingredients.map((ingredient, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-[#0F150E] rounded border border-[#3A4D23]"
                                  >
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-white">{ingredient.name}</div>
                                      <div className="text-xs text-gray-400">
                                        {ingredient.amount} {ingredient.unit === 'per_piece' ? 'stuk' : 
                                                         ingredient.unit === 'per_handful' ? 'handje' : 
                                                         ingredient.unit === 'per_plakje' ? 'plakje' : 
                                                         ingredient.unit === 'per_30g' ? '30g' : 
                                                         ingredient.unit === 'per_100g' ? '100g' : ingredient.unit}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-[#8BAE5A]">
                                        {ingredient.unit === 'per_100g' 
                                          ? Math.round((ingredient.calories_per_100g * ingredient.amount) / 100)
                                          : Math.round(ingredient.calories_per_100g * ingredient.amount)
                                        } kcal
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="p-6 h-full overflow-y-auto">
              {/* Ingredienten Management Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-[#8BAE5A]">Ingrediënten Beheer</h3>
                <button
                  onClick={handleAddIngredient}
                  className="px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors font-medium flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Nieuw Ingrediënt</span>
                </button>
              </div>

              {/* Search and Filter */}
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Zoeken naar ingrediënten..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <div className="flex gap-4">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  >
                    <option value="all">Alle categorieën</option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  <select 
                    value={selectedCarnivoreFilter}
                    onChange={(e) => setSelectedCarnivoreFilter(e.target.value)}
                    className="px-3 py-2 bg-[#0F150E] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  >
                    <option value="all">Alle ingrediënten</option>
                    <option value="carnivore">Alleen carnivoor</option>
                    <option value="standard">Alleen standaard</option>
                  </select>
                </div>
              </div>

              {/* Ingredients Table */}
              <div className="bg-[#181F17] rounded-lg border border-[#3A4D23] overflow-hidden">
                {/* Desktop Table Header */}
                <div className="hidden lg:grid grid-cols-13 gap-3 p-4 bg-[#1A2313] border-b border-[#3A4D23] text-sm font-semibold text-[#8BAE5A]">
                  <div className="col-span-2">Naam</div>
                  <div className="col-span-2">Categorie</div>
                  <div className="col-span-1">Carnivoor</div>
                  <div className="col-span-1">Type</div>
                  <div className="col-span-1">Kcal</div>
                  <div className="col-span-1">Protein</div>
                  <div className="col-span-1">Carbs</div>
                  <div className="col-span-1">Fat</div>
                  <div className="col-span-3">Acties</div>
                </div>
                
                {/* Table Body */}
                <div className="divide-y divide-[#3A4D23]">
                  {filteredIngredients.map((item) => (
                    <div key={item.id}>
                      {/* Desktop View */}
                      <div className="hidden lg:grid grid-cols-13 gap-3 p-4 hover:bg-[#1A2313] transition-colors">
                        <div className="col-span-2">
                          <h3 className="text-white font-medium">{item.name}</h3>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-300 text-sm capitalize">{item.category}</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            item.is_carnivore 
                              ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                              : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                          }`}>
                            {item.is_carnivore ? 'Ja' : 'Nee'}
                          </span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-xs px-2 py-1 rounded-md bg-blue-600/20 text-blue-400 border border-blue-600/30 font-medium">
                            {getUnitTypeLabel(item.unit_type)}
                          </span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-white font-medium">{item.calories_per_100g || 0}</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-white">{item.protein_per_100g || 0}g</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-white">{item.carbs_per_100g || 0}g</span>
                        </div>
                        <div className="col-span-1 text-center">
                          <span className="text-white">{item.fat_per_100g || 0}g</span>
                        </div>
                        <div className="col-span-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditIngredient(item)}
                              className="px-3 py-1 bg-[#8BAE5A] text-[#232D1A] rounded text-xs hover:bg-[#B6C948] transition-colors"
                            >
                              Bewerken
                            </button>
                            <button
                              onClick={() => handleDeleteIngredient(item.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                            >
                              Verwijderen
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile/Tablet View */}
                      <div className="lg:hidden p-4 hover:bg-[#1A2313] transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-white font-medium text-lg">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-gray-300 text-sm capitalize">{item.category}</p>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                item.is_carnivore 
                                  ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                                  : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                              }`}>
                                {item.is_carnivore ? 'Carnivoor' : 'Standaard'}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-md bg-blue-600/20 text-blue-400 border border-blue-600/30 font-medium">
                                {getUnitTypeLabel(item.unit_type)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditIngredient(item)}
                              className="px-3 py-1 bg-[#8BAE5A] text-[#232D1A] rounded text-xs hover:bg-[#B6C948] transition-colors"
                            >
                              Bewerken
                            </button>
                            <button
                              onClick={() => handleDeleteIngredient(item.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                            >
                              Verwijderen
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-gray-400 text-xs">
                              {item.unit_type === 'per_handful' ? 'Kcal/handje' : 
                               item.unit_type === 'per_piece' ? 'Kcal/stuk' : 
                               item.unit_type === 'per_plakje' ? 'Kcal/plakje' :
                               item.unit_type === 'per_30g' ? 'Kcal/30g' : 'Kcal/100g'}
                            </div>
                            <div className="text-white font-medium">{item.calories_per_100g || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400 text-xs">Protein</div>
                            <div className="text-white">{item.protein_per_100g || 0}g</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400 text-xs">Carbs</div>
                            <div className="text-white">{item.carbs_per_100g || 0}g</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-400 text-xs">Fat</div>
                            <div className="text-white">{item.fat_per_100g || 0}g</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#3A4D23]">
          <div className="text-sm text-gray-400">
            {activeTab === 'daily_plans' && (
              <div>
                <div className="font-medium text-white mb-1">
                  {DAYS.find(d => d.key === selectedDay)?.label} - Dagelijkse Totaal
                </div>
                <div className="text-xs">
                  {getDayTotal(selectedDay).calories} kcal | 
                  Eiwit: {getDayTotal(selectedDay).protein}g | 
                  Koolhydraten: {getDayTotal(selectedDay).carbs}g | 
                  Vet: {getDayTotal(selectedDay).fat}g
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meal Edit Modal */}
      {showMealModal && (
        <MealEditModal
          day={selectedDay}
          meal={selectedMeal}
          ingredients={getMealData(selectedDay, selectedMeal).ingredients}
          availableIngredients={ingredients}
          onSave={handleMealSave}
          onClose={() => setShowMealModal(false)}
        />
      )}

      {/* Ingredient Modal */}
      {showIngredientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F150E] rounded-xl border border-[#3A4D23] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
              <h3 className="text-xl font-bold text-[#8BAE5A]">
                {editingIngredient ? 'Ingrediënt Bewerken' : 'Nieuw Ingrediënt'}
              </h3>
              <button
                onClick={() => setShowIngredientModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Naam</label>
                <input
                  type="text"
                  value={ingredientForm.name}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Categorie</label>
                <div className="flex gap-2">
                  <select
                    value={ingredientForm.category}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, category: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  >
                    <option value="">Selecteer categorie</option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(true)}
                    className="px-3 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors text-sm font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <div className="flex gap-2">
                  <select
                    value={ingredientForm.unit_type}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, unit_type: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  >
                    <option value="">Selecteer type</option>
                    <option value="per_100g">per 100g</option>
                    <option value="per_piece">per stuk</option>
                    <option value="per_handful">per handje</option>
                    <option value="per_plakje">per plakje</option>
                    <option value="per_30g">per 30g</option>
                    {availableUnitTypes.filter(type => !['per_100g', 'per_piece', 'per_handful', 'per_plakje', 'per_30g'].includes(type)).map(type => (
                      <option key={type} value={type}>{getUnitTypeLabel(type)}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddUnitTypeModal(true)}
                    className="px-3 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors text-sm font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_carnivore"
                  checked={ingredientForm.is_carnivore}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, is_carnivore: e.target.checked })}
                  className="w-4 h-4 text-[#8BAE5A] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#8BAE5A]"
                />
                <label htmlFor="is_carnivore" className="text-sm text-gray-300">Carnivoor</label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Calorieën</label>
                  <input
                    type="number"
                    value={ingredientForm.calories_per_100g}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, calories_per_100g: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Eiwit (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ingredientForm.protein_per_100g}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, protein_per_100g: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Koolhydraten (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ingredientForm.carbs_per_100g}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, carbs_per_100g: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Vet (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ingredientForm.fat_per_100g}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, fat_per_100g: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-4 p-6 border-t border-[#3A4D23]">
              <button
                onClick={() => setShowIngredientModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveIngredient}
                className="px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors font-medium"
              >
                {editingIngredient ? 'Bijwerken' : 'Toevoegen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F150E] rounded-xl border border-[#3A4D23] w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
              <h3 className="text-xl font-bold text-[#8BAE5A]">Nieuwe Categorie</h3>
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategory('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Categorie Naam</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Bijv. Groenten, Vlees, etc."
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-4 p-6 border-t border-[#3A4D23]">
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategory('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors font-medium"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Unit Type Modal */}
      {showAddUnitTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F150E] rounded-xl border border-[#3A4D23] w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
              <h3 className="text-xl font-bold text-[#8BAE5A]">Nieuw Type</h3>
              <button
                onClick={() => {
                  setShowAddUnitTypeModal(false);
                  setNewUnitType('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type Naam</label>
                <input
                  type="text"
                  value={newUnitType}
                  onChange={(e) => setNewUnitType(e.target.value)}
                  placeholder="Bijv. per_100g, per_piece, etc."
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Gebruik underscore voor spaties (bijv. per_100g, per_piece)
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-4 p-6 border-t border-[#3A4D23]">
              <button
                onClick={() => {
                  setShowAddUnitTypeModal(false);
                  setNewUnitType('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleAddUnitType}
                className="px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors font-medium"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Day Plan Modal */}
      {showCopyDayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F150E] rounded-xl border border-[#3A4D23] w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
              <h3 className="text-xl font-bold text-[#8BAE5A]">Plan Kopiëren</h3>
              <button
                onClick={() => {
                  setShowCopyDayModal(false);
                  setSelectedSourceDay('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-300 mb-4">
                  Kopieer maaltijden van een bron dag naar meerdere doeldagen
                </p>
              </div>
              
              {/* Step 1: Select Source Day */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Stap 1: Selecteer bron dag</label>
                <div className="space-y-2">
                  {DAYS.map(day => {
                    const hasData = mealsData?.weekly_plan?.[day.key] && Object.keys(mealsData.weekly_plan[day.key]).length > 0;
                    return (
                      <label key={day.key} className="flex items-center p-3 bg-[#181F17] rounded-lg border border-[#3A4D23] hover:bg-[#1F2D17] transition-colors cursor-pointer">
                        <input
                          type="radio"
                          name="sourceDay"
                          value={day.key}
                          checked={selectedSourceDay === day.key}
                          onChange={(e) => setSelectedSourceDay(e.target.value)}
                          className="w-4 h-4 text-[#8BAE5A] bg-[#181F17] border-[#3A4D23] focus:ring-[#8BAE5A] focus:ring-2"
                        />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-white">{day.label}</div>
                          <div className="text-xs text-gray-400">
                            {hasData ? '✓ Heeft maaltijden' : '⚠ Geen maaltijden'}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Target Days */}
              {selectedSourceDay && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-300">Stap 2: Selecteer doeldagen</label>
                    <button
                      onClick={() => {
                        const availableDays = DAYS.filter(day => day.key !== selectedSourceDay);
                        const allSelected = availableDays.every(day => selectedTargetDays.includes(day.key));
                        if (allSelected) {
                          setSelectedTargetDays([]);
                        } else {
                          setSelectedTargetDays(availableDays.map(day => day.key));
                        }
                      }}
                      className="text-xs text-[#8BAE5A] hover:text-[#B6C948] transition-colors"
                    >
                      {DAYS.filter(day => day.key !== selectedSourceDay).every(day => selectedTargetDays.includes(day.key)) ? 'Alles deselecteren' : 'Alles selecteren'}
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {DAYS.filter(day => day.key !== selectedSourceDay).map(day => {
                      const hasData = mealsData?.weekly_plan?.[day.key] && Object.keys(mealsData.weekly_plan[day.key]).length > 0;
                      return (
                        <label key={day.key} className="flex items-center p-3 bg-[#181F17] rounded-lg border border-[#3A4D23] hover:bg-[#1F2D17] transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTargetDays.includes(day.key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTargetDays([...selectedTargetDays, day.key]);
                              } else {
                                setSelectedTargetDays(selectedTargetDays.filter(d => d !== day.key));
                              }
                            }}
                            className="w-4 h-4 text-[#8BAE5A] bg-[#181F17] border-[#3A4D23] rounded focus:ring-[#8BAE5A] focus:ring-2"
                          />
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-white">{day.label}</div>
                            <div className="text-xs text-gray-400">
                              {hasData ? '✓ Heeft maaltijden' : '⚠ Geen maaltijden'}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedSourceDay && selectedTargetDays.length > 0 && (
                <div className="mt-4 p-4 bg-[#181F17] rounded-lg border border-[#3A4D23]">
                  <h4 className="text-sm font-medium text-[#8BAE5A] mb-2">Waarschuwing:</h4>
                  <p className="text-sm text-gray-300">
                    Dit zal alle bestaande maaltijden van <strong className="text-white">{selectedTargetDays.map(day => DAYS.find(d => d.key === day)?.label).join(', ')}</strong> overschrijven 
                    met de maaltijden van <strong className="text-white">{DAYS.find(d => d.key === selectedSourceDay)?.label}</strong>.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-4 p-6 border-t border-[#3A4D23]">
              <button
                onClick={() => {
                  setShowCopyDayModal(false);
                  setSelectedSourceDay('');
                  setSelectedTargetDays([]);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleCopyDayPlan}
                disabled={!selectedSourceDay || selectedTargetDays.length === 0 || copyingDay}
                className="px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {copyingDay && (
                  <div className="w-4 h-4 border-2 border-[#232D1A] border-t-transparent rounded-full animate-spin"></div>
                )}
                {copyingDay ? 'Kopiëren...' : `Kopiëren naar ${selectedTargetDays.length} dag(en)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
