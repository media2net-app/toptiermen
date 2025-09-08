'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import AdminButton from '@/components/admin/AdminButton';

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

interface AvailableIngredient {
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

interface MealEditModalProps {
  day: string;
  meal: string;
  ingredients: Ingredient[];
  availableIngredients: AvailableIngredient[];
  onSave: (ingredients: Ingredient[]) => void;
  onClose: () => void;
}

const MEAL_LABELS: { [key: string]: string } = {
  ontbijt: 'Ontbijt',
  ochtend_snack: 'Ochtend Snack',
  lunch: 'Lunch',
  lunch_snack: 'Lunch Snack',
  diner: 'Diner',
  avond_snack: 'Avond Snack'
};

const DAY_LABELS: { [key: string]: string } = {
  maandag: 'Maandag',
  dinsdag: 'Dinsdag',
  woensdag: 'Woensdag',
  donderdag: 'Donderdag',
  vrijdag: 'Vrijdag',
  zaterdag: 'Zaterdag',
  zondag: 'Zondag'
};

export default function MealEditModal({ 
  day, 
  meal, 
  ingredients, 
  availableIngredients, 
  onSave, 
  onClose 
}: MealEditModalProps) {
  const [currentIngredients, setCurrentIngredients] = useState<Ingredient[]>(ingredients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIngredient, setSelectedIngredient] = useState<AvailableIngredient | null>(null);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('g');
  const [loading, setLoading] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);

  // Set unit and default amount based on selected ingredient's unit_type
  useEffect(() => {
    if (selectedIngredient) {
      if (selectedIngredient.unit_type) {
        setUnit(selectedIngredient.unit_type);
        // Set default amount based on unit type
        if (selectedIngredient.unit_type === 'per_piece' || selectedIngredient.unit_type === 'per_plakje') {
          setAmount('1'); // 1 stuk/plakje
        } else if (selectedIngredient.unit_type === 'per_handful') {
          setAmount('1'); // 1 handje
        } else if (selectedIngredient.unit_type === 'per_100g') {
          setAmount('100'); // 100 gram
        } else if (selectedIngredient.unit_type === 'per_30g') {
          setAmount('30'); // 30 gram
        } else {
          setAmount('100'); // Default to 100g
        }
      } else {
        setUnit('g');
        setAmount('100'); // Default to 100g
      }
    }
  }, [selectedIngredient]);

  const filteredIngredients = availableIngredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ingredient.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ingredient.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const addIngredient = () => {
    if (!selectedIngredient || !amount) return;

    const newIngredient: Ingredient = {
      id: selectedIngredient.id,
      name: selectedIngredient.name,
      amount: parseFloat(amount),
      unit: unit,
      calories_per_100g: selectedIngredient.calories_per_100g,
      protein_per_100g: selectedIngredient.protein_per_100g,
      carbs_per_100g: selectedIngredient.carbs_per_100g,
      fat_per_100g: selectedIngredient.fat_per_100g
    };

    setCurrentIngredients([...currentIngredients, newIngredient]);
    setSelectedIngredient(null);
    setAmount('');
  };

  const removeIngredient = (index: number) => {
    setCurrentIngredients(currentIngredients.filter((_, i) => i !== index));
  };

  const calculateMealNutrition = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    currentIngredients.forEach(ingredient => {
      const amount = typeof ingredient.amount === 'string' ? parseFloat(ingredient.amount) || 0 : ingredient.amount || 0;
      const unit = ingredient.unit || 'per_100g';
      let factor = 1;
      
      // Use the same calculation logic as the API
      if (unit === 'per_100g' || unit === 'gram') {
        factor = amount / 100;
      } else if (unit === 'per_piece' || unit === 'stuks' || unit === 'stuk') {
        factor = amount; // Use amount directly for pieces
      } else if (unit === 'per_handful' || unit === 'handje' || unit === 'handjes') {
        factor = amount;
      } else if (unit === 'per_plakje' || unit === 'plakje' || unit === 'plakjes') {
        factor = amount;
      } else {
        factor = amount / 100; // Default to per_100g calculation
      }
      
      totalCalories += (ingredient.calories_per_100g || 0) * factor;
      totalProtein += (ingredient.protein_per_100g || 0) * factor;
      totalCarbs += (ingredient.carbs_per_100g || 0) * factor;
      totalFat += (ingredient.fat_per_100g || 0) * factor;
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10
    };
  };


  const handleSave = async () => {
    console.log('💾 MealEditModal handleSave called with ingredients:', currentIngredients);
    setLoading(true);
    try {
      console.log('💾 Calling onSave function...');
      await onSave(currentIngredients);
      console.log('💾 onSave completed successfully');
    } catch (error) {
      console.error('💥 Error in handleSave:', error);
    } finally {
      setLoading(false);
    }
  };

  const nutrition = calculateMealNutrition();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F150E] rounded-xl border border-[#3A4D23] w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
          <div>
            <h2 className="text-xl font-bold text-[#8BAE5A]">
              {DAY_LABELS[day]} - {MEAL_LABELS[meal]}
            </h2>
            <p className="text-gray-300 text-sm">Voeg ingredienten toe aan deze maaltijd</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Add Ingredients */}
          <div className="w-1/2 p-6 border-r border-[#3A4D23] overflow-y-auto">
            <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Ingredienten Toevoegen</h3>
            
            {/* Search */}
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek ingredienten..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
              />
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
              >
                <option value="all">Alle categorieën</option>
                {Array.from(new Set(availableIngredients.map(ing => ing.category))).sort().map(category => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Ingredient List */}
            <div className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto">
              {filteredIngredients.map(ingredient => (
                <button
                  key={ingredient.id}
                  onClick={() => {
                    setSelectedIngredient(ingredient);
                    setShowAmountModal(true);
                  }}
                  className="w-full p-3 rounded-lg text-left transition-colors bg-[#181F17] text-gray-300 hover:bg-[#3A4D23]"
                >
                  <div className="font-medium">{ingredient.name}</div>
                  <div className="text-sm opacity-75">{ingredient.category}</div>
                  <div className="text-xs opacity-60">
                    {ingredient.calories_per_100g} kcal per {ingredient.unit_type === 'per_piece' ? 'stuk' : ingredient.unit_type === 'per_handful' ? 'handje' : ingredient.unit_type === 'per_plakje' ? 'plakje' : ingredient.unit_type === 'per_30g' ? '30g' : ingredient.unit_type === 'per_100g' ? '100g' : '100g'}
                  </div>
                  {ingredient.is_carnivore && (
                    <div className="text-xs text-orange-400">🥩 Carnivoor</div>
                  )}
                </button>
              ))}
            </div>

          </div>

          {/* Right Panel - Current Ingredients */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Huidige Ingredienten</h3>
            
            {/* Nutrition Summary */}
            <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23] mb-4">
              <h4 className="font-medium text-white mb-2">Voedingswaarde</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Calorieën</div>
                  <div className="text-lg font-bold text-[#8BAE5A]">{nutrition.calories}</div>
                </div>
                <div>
                  <div className="text-gray-400">Eiwit</div>
                  <div className="text-lg font-bold text-blue-400">{nutrition.protein}g</div>
                </div>
                <div>
                  <div className="text-gray-400">Koolhydraten</div>
                  <div className="text-lg font-bold text-yellow-400">{nutrition.carbs}g</div>
                </div>
                <div>
                  <div className="text-gray-400">Vet</div>
                  <div className="text-lg font-bold text-orange-400">{nutrition.fat}g</div>
                </div>
              </div>
            </div>

            {/* Ingredients List */}
            <div className="space-y-2">
              {currentIngredients.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🥗</div>
                  <div>Nog geen ingredienten toegevoegd</div>
                  <div className="text-sm">Selecteer een ingredient links om te beginnen</div>
                </div>
              ) : (
                currentIngredients.map((ingredient, index) => {
                  // Correcte berekening afhankelijk van unit type
                  let calories, protein, carbs, fat;
                  
                  if (ingredient.unit === 'per_100g') {
                    calories = Math.round((ingredient.calories_per_100g * ingredient.amount) / 100);
                    protein = Math.round((ingredient.protein_per_100g * ingredient.amount) / 100 * 10) / 10;
                    carbs = Math.round((ingredient.carbs_per_100g * ingredient.amount) / 100 * 10) / 10;
                    fat = Math.round((ingredient.fat_per_100g * ingredient.amount) / 100 * 10) / 10;
                  } else {
                    calories = Math.round(ingredient.calories_per_100g * ingredient.amount);
                    protein = Math.round(ingredient.protein_per_100g * ingredient.amount * 10) / 10;
                    carbs = Math.round(ingredient.carbs_per_100g * ingredient.amount * 10) / 10;
                    fat = Math.round(ingredient.fat_per_100g * ingredient.amount * 10) / 10;
                  }

                  return (
                    <div
                      key={index}
                      className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-white">{ingredient.name}</div>
                          <div className="text-sm text-gray-400">
                            {ingredient.amount} {ingredient.unit === 'per_piece' ? 'stuk' : 
                             ingredient.unit === 'per_handful' ? 'handje' : 
                             ingredient.unit === 'per_plakje' ? 'plakje' : 
                             ingredient.unit === 'per_30g' ? '30g' : 
                             ingredient.unit === 'per_100g' ? '100g' : 
                             ingredient.unit}
                          </div>
                          <div className="text-xs text-[#B6C948] mt-1">
                            {calories} kcal | Eiwit: {protein}g | Koolhydraten: {carbs}g | Vet: {fat}g
                          </div>
                        </div>
                        <button
                          onClick={() => removeIngredient(index)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#3A4D23]">
          <div className="text-sm text-gray-400">
            {currentIngredients.length} ingredienten • {nutrition.calories} kcal
          </div>
          <div className="flex space-x-3">
            <AdminButton
              onClick={onClose}
              variant="secondary"
              className="px-6 py-2"
            >
              Annuleren
            </AdminButton>
            <AdminButton
              onClick={handleSave}
              loading={loading}
              className="px-6 py-2"
            >
              Opslaan
            </AdminButton>
          </div>
        </div>
      </div>

      {/* Amount Modal */}
      {showAmountModal && selectedIngredient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <div className="bg-[#0F150E] rounded-xl border border-[#3A4D23] w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">
                {selectedIngredient.name} toevoegen
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Hoeveelheid</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white focus:outline-none focus:border-[#8BAE5A]"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Eenheid</label>
                  <div className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded text-white">
                    {unit === 'per_piece' ? 'Per stuk' : 
                     unit === 'per_handful' ? 'Per handje' : 
                     unit === 'per_plakje' ? 'Per plakje' : 
                     unit === 'per_30g' ? 'Per 30g' : 
                     unit === 'per_100g' ? 'Per 100g' : 
                     unit}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <AdminButton
                  onClick={() => {
                    setShowAmountModal(false);
                    setSelectedIngredient(null);
                    setAmount('');
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Annuleren
                </AdminButton>
                <AdminButton
                  onClick={() => {
                    addIngredient();
                    setShowAmountModal(false);
                  }}
                  className="flex-1"
                >
                  Toevoegen
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
