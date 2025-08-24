'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import AdminButton from '@/components/admin/AdminButton';

interface NutritionPlan {
  id?: string;
  name: string;
  description: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  duration_weeks?: number;
  difficulty?: string;
  goal?: string;
  is_featured?: boolean;
  is_public?: boolean;
  daily_plans?: DailyPlan[];
}

interface DailyPlan {
  day: string;
  theme: string;
  focus: string;
  meals: {
    ontbijt: MealPlan;
    snack1: MealPlan;
    lunch: MealPlan;
    snack2: MealPlan;
    diner: MealPlan;
  };
}

interface MealPlan {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  suggestions: string[];
}

interface PlanBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: NutritionPlan | null;
  onSave: (plan: NutritionPlan) => void;
}

export default function PlanBuilder({ isOpen, onClose, plan, onSave }: PlanBuilderProps) {
  const [formData, setFormData] = useState<NutritionPlan>({
    name: '',
    description: '',
    target_calories: 2200,
    target_protein: 165,
    target_carbs: 220,
    target_fat: 73,
    duration_weeks: 12,
    difficulty: 'beginner',
    goal: 'spiermassa',
    is_featured: false,
    is_public: true,
    daily_plans: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('monday');

  // Initialize form data when plan changes
  useEffect(() => {
    if (plan) {
      setFormData({
        id: plan.id,
        name: plan.name || '',
        description: plan.description || '',
        target_calories: plan.target_calories || 2200,
        target_protein: plan.target_protein || 165,
        target_carbs: plan.target_carbs || 220,
        target_fat: plan.target_fat || 73,
        duration_weeks: plan.duration_weeks || 12,
        difficulty: plan.difficulty || 'beginner',
        goal: plan.goal || 'spiermassa',
        is_featured: plan.is_featured || false,
        is_public: plan.is_public !== false,
        daily_plans: plan.daily_plans || generateDefaultDailyPlans()
      });
    } else {
      setFormData({
        name: '',
        description: '',
        target_calories: 2200,
        target_protein: 165,
        target_carbs: 220,
        target_fat: 73,
        duration_weeks: 12,
        difficulty: 'beginner',
        goal: 'spiermassa',
        is_featured: false,
        is_public: true,
        daily_plans: generateDefaultDailyPlans()
      });
    }
  }, [plan]);

  const generateDefaultDailyPlans = (): DailyPlan[] => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const themes = ['Training Dag', 'Herstel', 'Rust Dag', 'Training Dag', 'Herstel', 'Weekend', 'Rust'];
    const focuses = ['protein', 'protein', 'protein', 'protein', 'protein', 'protein', 'protein'];
    
    return days.map((day, index) => ({
      day,
      theme: themes[index],
      focus: focuses[index],
      meals: {
        ontbijt: {
          name: `${themes[index]} Ontbijt`,
          calories: Math.round((formData.target_calories || 2200) * 0.25),
          protein: Math.round((formData.target_protein || 165) * 0.25),
          carbs: Math.round((formData.target_carbs || 220) * 0.25),
          fat: Math.round((formData.target_fat || 73) * 0.25),
          suggestions: getMealSuggestions(formData.name, 'ontbijt', focuses[index])
        },
        snack1: {
          name: `${themes[index]} Snack`,
          calories: Math.round((formData.target_calories || 2200) * 0.10),
          protein: Math.round((formData.target_protein || 165) * 0.10),
          carbs: Math.round((formData.target_carbs || 220) * 0.10),
          fat: Math.round((formData.target_fat || 73) * 0.10),
          suggestions: getMealSuggestions(formData.name, 'snack', focuses[index])
        },
        lunch: {
          name: `${themes[index]} Lunch`,
          calories: Math.round((formData.target_calories || 2200) * 0.30),
          protein: Math.round((formData.target_protein || 165) * 0.30),
          carbs: Math.round((formData.target_carbs || 220) * 0.30),
          fat: Math.round((formData.target_fat || 73) * 0.30),
          suggestions: getMealSuggestions(formData.name, 'lunch', focuses[index])
        },
        snack2: {
          name: `${themes[index]} Snack`,
          calories: Math.round((formData.target_calories || 2200) * 0.10),
          protein: Math.round((formData.target_protein || 165) * 0.10),
          carbs: Math.round((formData.target_carbs || 220) * 0.10),
          fat: Math.round((formData.target_fat || 73) * 0.10),
          suggestions: getMealSuggestions(formData.name, 'snack', focuses[index])
        },
        diner: {
          name: `${themes[index]} Diner`,
          calories: Math.round((formData.target_calories || 2200) * 0.25),
          protein: Math.round((formData.target_protein || 165) * 0.25),
          carbs: Math.round((formData.target_carbs || 220) * 0.25),
          fat: Math.round((formData.target_fat || 73) * 0.25),
          suggestions: getMealSuggestions(formData.name, 'diner', focuses[index])
        }
      }
    }));
  };

  const getMealSuggestions = (dietName: string, mealType: string, focus: string): string[] => {
    if (dietName === 'Carnivoor (Rick\'s Aanpak)') {
      const carnivoreSuggestions = {
        ontbijt: ['Orgaanvlees Mix', 'Gegrilde T-Bone Steak', 'Eieren met Spek'],
        lunch: ['Gegrilde T-Bone Steak', 'Gans met Eendenborst', 'Ribeye Steak'],
        diner: ['Gans met Eendenborst', 'T-Bone Steak', 'Orgaanvlees Mix'],
        snack: ['Spek', 'Kaas', 'Eieren']
      };
      return carnivoreSuggestions[mealType as keyof typeof carnivoreSuggestions] || ['Vlees'];
    }
    
    // Default suggestions for other diets
    return ['Standaard maaltijd'];
  };

  const handleInputChange = (field: keyof NutritionPlan, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMealChange = (day: string, mealType: string, field: keyof MealPlan, value: any) => {
    setFormData(prev => ({
      ...prev,
      daily_plans: prev.daily_plans?.map(dailyPlan => {
        if (dailyPlan.day === day) {
          return {
            ...dailyPlan,
            meals: {
              ...dailyPlan.meals,
              [mealType]: {
                ...dailyPlan.meals[mealType as keyof typeof dailyPlan.meals],
                [field]: value
              }
            }
          };
        }
        return dailyPlan;
      })
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Plan naam is verplicht');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Fout bij opslaan van plan');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMacroPercentages = () => {
    const total = (formData.target_protein || 0) * 4 + (formData.target_carbs || 0) * 4 + (formData.target_fat || 0) * 9;
    const proteinPct = total > 0 ? Math.round(((formData.target_protein || 0) * 4 / total) * 100) : 0;
    const carbsPct = total > 0 ? Math.round(((formData.target_carbs || 0) * 4 / total) * 100) : 0;
    const fatPct = total > 0 ? Math.round(((formData.target_fat || 0) * 9 / total) * 100) : 0;
    
    return { proteinPct, carbsPct, fatPct };
  };

  const { proteinPct, carbsPct, fatPct } = calculateMacroPercentages();

  const getCurrentDayPlan = () => {
    return formData.daily_plans?.find(dp => dp.day === selectedDay);
  };

  const dayNames = {
    monday: 'Maandag',
    tuesday: 'Dinsdag', 
    wednesday: 'Woensdag',
    thursday: 'Donderdag',
    friday: 'Vrijdag',
    saturday: 'Zaterdag',
    sunday: 'Zondag'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#232D1A] rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]">
          <h2 className="text-[#8BAE5A] font-semibold text-xl">
            {plan ? 'Bewerk Voedingsplan' : 'Nieuw Voedingsplan'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#B6C948] hover:text-[#8BAE5A] transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#3A4D23]">
          {[
            { id: 'basic', label: 'Basis Info', icon: '📋' },
            { id: 'macros', label: 'Macro\'s', icon: '⚖️' },
            { id: 'daily', label: 'Dagelijkse Plannen', icon: '📅' },
            { id: 'settings', label: 'Instellingen', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#8BAE5A] text-[#181F17]'
                  : 'text-[#8BAE5A] hover:bg-[#181F17]'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#8BAE5A] font-semibold mb-2">
                    Plan Naam *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    placeholder="Bijv. Gebalanceerd, High Protein..."
                  />
                </div>

                <div>
                  <label className="block text-[#8BAE5A] font-semibold mb-2">
                    Doel
                  </label>
                  <select
                    value={formData.goal}
                    onChange={(e) => handleInputChange('goal', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  >
                    <option value="spiermassa">Spiermassa</option>
                    <option value="afvallen">Afvallen</option>
                    <option value="uithouding">Uithouding</option>
                    <option value="kracht">Kracht</option>
                    <option value="gezondheid">Gezondheid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8BAE5A] font-semibold mb-2">
                    Moeilijkheidsgraad
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Gevorderd</option>
                    <option value="advanced">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8BAE5A] font-semibold mb-2">
                    Duur (weken)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_weeks}
                    onChange={(e) => handleInputChange('duration_weeks', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    min="1"
                    max="52"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">
                  Beschrijving
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] resize-none"
                  placeholder="Beschrijf het voedingsplan..."
                />
              </div>
            </div>
          )}

          {activeTab === 'macros' && (
            <div className="space-y-6">
              {/* Daily Calories */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">
                  Dagelijkse Calorieën
                </label>
                <input
                  type="number"
                  value={formData.target_calories}
                  onChange={(e) => handleInputChange('target_calories', parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  min="1000"
                  max="5000"
                  step="50"
                />
              </div>

              {/* Macro Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[#8BAE5A] font-semibold mb-2">
                    Eiwitten (g)
                  </label>
                  <input
                    type="number"
                    value={formData.target_protein}
                    onChange={(e) => handleInputChange('target_protein', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    min="50"
                    max="300"
                  />
                  <div className="text-[#B6C948] text-sm mt-1">{proteinPct}% van totale calorieën</div>
                </div>

                <div>
                  <label className="block text-[#8BAE5A] font-semibold mb-2">
                    Koolhydraten (g)
                  </label>
                  <input
                    type="number"
                    value={formData.target_carbs}
                    onChange={(e) => handleInputChange('target_carbs', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    min="0"
                    max="500"
                  />
                  <div className="text-[#B6C948] text-sm mt-1">{carbsPct}% van totale calorieën</div>
                </div>

                <div>
                  <label className="block text-[#8BAE5A] font-semibold mb-2">
                    Vetten (g)
                  </label>
                  <input
                    type="number"
                    value={formData.target_fat}
                    onChange={(e) => handleInputChange('target_fat', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    min="20"
                    max="200"
                  />
                  <div className="text-[#B6C948] text-sm mt-1">{fatPct}% van totale calorieën</div>
                </div>
              </div>

              {/* Macro Summary */}
              <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
                <h4 className="text-[#8BAE5A] font-semibold mb-3">Macro Overzicht</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-[#8BAE5A] font-semibold">{formData.target_protein}g</div>
                    <div className="text-[#B6C948] text-sm">Eiwitten</div>
                  </div>
                  <div>
                    <div className="text-[#8BAE5A] font-semibold">{formData.target_carbs}g</div>
                    <div className="text-[#B6C948] text-sm">Koolhydraten</div>
                  </div>
                  <div>
                    <div className="text-[#8BAE5A] font-semibold">{formData.target_fat}g</div>
                    <div className="text-[#B6C948] text-sm">Vetten</div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="text-[#8BAE5A] font-semibold">{formData.target_calories} calorieën</div>
                  <div className="text-[#B6C948] text-sm">Totaal per dag</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'daily' && (
            <div className="space-y-6">
              {/* Day Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.entries(dayNames).map(([dayKey, dayName]) => (
                  <button
                    key={dayKey}
                    onClick={() => setSelectedDay(dayKey)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      selectedDay === dayKey
                        ? 'bg-[#8BAE5A] text-[#181F17]'
                        : 'bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A]'
                    }`}
                  >
                    {dayName}
                  </button>
                ))}
              </div>

              {/* Daily Plan Editor */}
              {getCurrentDayPlan() && (
                <div className="space-y-6">
                  {/* Day Header */}
                  <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
                    <div className="flex items-center gap-3 mb-3">
                      <CalendarIcon className="w-6 h-6 text-[#8BAE5A]" />
                      <h3 className="text-[#8BAE5A] font-semibold text-lg">
                        {dayNames[selectedDay as keyof typeof dayNames]} - {getCurrentDayPlan()?.theme}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-[#8BAE5A] text-[#181F17] rounded text-xs font-semibold">
                        {getCurrentDayPlan()?.focus}
                      </span>
                    </div>
                  </div>

                  {/* Meals */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
                      <h4 className="text-[#8BAE5A] font-semibold mb-3">Ontbijt</h4>
                      <div className="text-[#B6C948] text-sm">
                        Dagelijkse maaltijd planning functionaliteit komt binnenkort
                      </div>
                    </div>
                    <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
                      <h4 className="text-[#8BAE5A] font-semibold mb-3">Lunch</h4>
                      <div className="text-[#B6C948] text-sm">
                        Dagelijkse maaltijd planning functionaliteit komt binnenkort
                      </div>
                    </div>
                    <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
                      <h4 className="text-[#8BAE5A] font-semibold mb-3">Diner</h4>
                      <div className="text-[#B6C948] text-sm">
                        Dagelijkse maaltijd planning functionaliteit komt binnenkort
                      </div>
                    </div>
                    <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
                      <h4 className="text-[#8BAE5A] font-semibold mb-3">Snacks</h4>
                      <div className="text-[#B6C948] text-sm">
                        Dagelijkse maaltijd planning functionaliteit komt binnenkort
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Visibility Settings */}
              <div className="space-y-4">
                <h4 className="text-[#8BAE5A] font-semibold">Zichtbaarheid</h4>
                
                <div className="flex items-center justify-between p-4 bg-[#181F17] rounded-lg border border-[#3A4D23]">
                  <div>
                    <div className="text-[#8BAE5A] font-semibold">Openbaar Plan</div>
                    <div className="text-[#B6C948] text-sm">Zichtbaar voor alle gebruikers</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) => handleInputChange('is_public', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#3A4D23] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8BAE5A]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#181F17] rounded-lg border border-[#3A4D23]">
                  <div>
                    <div className="text-[#8BAE5A] font-semibold">Uitgelicht Plan</div>
                    <div className="text-[#B6C948] text-sm">Toon als aanbevolen plan</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#3A4D23] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8BAE5A]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8BAE5A]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#3A4D23]">
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
            {isLoading ? 'Opslaan...' : (plan ? 'Bijwerken' : 'Aanmaken')}
          </AdminButton>
        </div>
      </div>
    </div>
  );
} 