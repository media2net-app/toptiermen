"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalculatorIcon, 
  HeartIcon, 
  SparklesIcon,
  ShoppingCartIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import PageLayout from '@/components/PageLayout';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface UserData {
  age: number;
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'cut' | 'maintain' | 'bulk';
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealPlan {
  breakfast: {
    name: string;
    image: string;
    ingredients: { name: string; amount: number; unit: string }[];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  lunch: {
    name: string;
    image: string;
    ingredients: { name: string; amount: number; unit: string }[];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  dinner: {
    name: string;
    image: string;
    ingredients: { name: string; amount: number; unit: string }[];
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const activityLevels = [
  { value: 'sedentary', label: 'Zittend werk', description: 'Weinig tot geen beweging' },
  { value: 'light', label: 'Licht actief', description: '1-3x per week sporten' },
  { value: 'moderate', label: 'Matig actief', description: '3-5x per week sporten' },
  { value: 'active', label: 'Actief', description: '6-7x per week sporten' },
  { value: 'very_active', label: 'Zeer actief', description: 'Dagelijks intensief sporten' }
];

const dietTypes = [
  {
    id: 'balanced',
    name: 'Gebalanceerd',
    subtitle: 'Voor duurzame energie en algehele gezondheid',
    description: 'Een mix van alle macronutriënten',
    icon: '🥗',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'low_carb',
    name: 'Koolhydraatarm / Keto',
    subtitle: 'Focus op vetverbranding en een stabiele bloedsuikerspiegel',
    description: 'Minimale koolhydraten, hoog in gezonde vetten',
    icon: '🥑',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'carnivore',
    name: 'Carnivoor (Rick\'s Aanpak)',
    subtitle: 'Voor maximale eenvoud en het elimineren van potentiële triggers',
    description: 'Eet zoals de oprichter',
    icon: '🥩',
    color: 'from-red-500 to-orange-600'
  },
  {
    id: 'high_protein',
    name: 'High Protein',
    subtitle: 'Geoptimaliseerd voor maximale spieropbouw en herstel',
    description: 'Maximale eiwitinname voor spiergroei',
    icon: '💪',
    color: 'from-blue-500 to-cyan-600'
  }
];



export default function VoedingsplannenPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserData>({
    age: 0,
    height: 0,
    weight: 0,
    activityLevel: 'moderate',
    goal: 'maintain'
  });
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<string>('');
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNutritionPlan, setSelectedNutritionPlan] = useState<string | null>(null);
  const [showPlanBanner, setShowPlanBanner] = useState(true);

  useEffect(() => {
    const fetchSelectedPlan = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('users')
        .select('selected_nutrition_plan')
        .eq('id', user.id)
        .single();
      if (!error && data?.selected_nutrition_plan) {
        setSelectedNutritionPlan(data.selected_nutrition_plan);
      }
    };
    fetchSelectedPlan();
  }, [user]);

  useEffect(() => {
    const fetchNutritionProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('users')
        .select('nutrition_profile')
        .eq('id', user.id)
        .single();
      if (!error && data?.nutrition_profile) {
        setUserData({
          ...userData,
          ...data.nutrition_profile
        });
      }
    };
    fetchNutritionProfile();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!userData.age && !userData.height && !userData.weight) return;
    const saveNutritionProfile = async () => {
      await supabase
        .from('users')
        .update({ nutrition_profile: userData })
        .eq('id', user.id);
    };
    saveNutritionProfile();
    // eslint-disable-next-line
  }, [userData]);

  const calculateNutritionGoals = (data: UserData): NutritionGoals => {
    // BMR berekening (Mifflin-St Jeor Equation) - Altijd voor mannen
    let bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5;

    // Activiteitsfactor
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    let tdee = bmr * activityFactors[data.activityLevel];

    // Doel aanpassing
    const goalFactors = {
      cut: 0.85,
      maintain: 1,
      bulk: 1.15
    };

    const targetCalories = Math.round(tdee * goalFactors[data.goal]);

    // Macro verdeling
    let protein, carbs, fat;

    if (data.goal === 'bulk') {
      protein = Math.round(data.weight * 2.2); // 2.2g per kg
      fat = Math.round((targetCalories * 0.25) / 9); // 25% vet
      carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
    } else if (data.goal === 'cut') {
      protein = Math.round(data.weight * 2.4); // 2.4g per kg
      fat = Math.round((targetCalories * 0.3) / 9); // 30% vet
      carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
    } else {
      protein = Math.round(data.weight * 2.0); // 2.0g per kg
      fat = Math.round((targetCalories * 0.25) / 9); // 25% vet
      carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);
    }

    return {
      calories: targetCalories,
      protein,
      carbs,
      fat
    };
  };

  const generateMealPlan = (goals: NutritionGoals, dietType: string): MealPlan => {
    // Realistische dagmenu's per dieettype
    if (dietType === 'balanced') {
      return {
        breakfast: {
          name: 'Havermout met Blauwe Bessen & Walnoten',
          image: '/images/mind/1.png',
          ingredients: [
            { name: 'Havermout', amount: 60, unit: 'gram' },
            { name: 'Melk', amount: 250, unit: 'ml' },
            { name: 'Blauwe bessen', amount: 50, unit: 'gram' },
            { name: 'Walnoten', amount: 15, unit: 'gram' }
          ],
          calories: Math.round(goals.calories * 0.25),
          protein: Math.round(goals.protein * 0.25),
          carbs: Math.round(goals.carbs * 0.3),
          fat: Math.round(goals.fat * 0.2)
        },
        lunch: {
          name: 'Volkoren Wrap met Kip, Groenten & Hummus',
          image: '/images/mind/2.png',
          ingredients: [
            { name: 'Volkoren wrap', amount: 1, unit: 'stuk' },
            { name: 'Kipfilet', amount: 100, unit: 'gram' },
            { name: 'Paprika', amount: 50, unit: 'gram' },
            { name: 'Komkommer', amount: 50, unit: 'gram' },
            { name: 'Hummus', amount: 30, unit: 'gram' }
          ],
          calories: Math.round(goals.calories * 0.35),
          protein: Math.round(goals.protein * 0.35),
          carbs: Math.round(goals.carbs * 0.35),
          fat: Math.round(goals.fat * 0.3)
        },
        dinner: {
          name: 'Zalmfilet met Zoete Aardappel & Broccoli',
          image: '/images/mind/3.png',
          ingredients: [
            { name: 'Zalmfilet', amount: 150, unit: 'gram' },
            { name: 'Zoete aardappel', amount: 200, unit: 'gram' },
            { name: 'Broccoli', amount: 150, unit: 'gram' }
          ],
          calories: Math.round(goals.calories * 0.4),
          protein: Math.round(goals.protein * 0.4),
          carbs: Math.round(goals.carbs * 0.35),
          fat: Math.round(goals.fat * 0.5)
        }
      };
    }
    if (dietType === 'low_carb') {
      return {
        breakfast: {
          name: 'Griekse Yoghurt met Noten & Lijnzaad',
          image: '/images/mind/4.png',
          ingredients: [
            { name: 'Griekse yoghurt', amount: 200, unit: 'gram' },
            { name: 'Gemengde noten', amount: 20, unit: 'gram' },
            { name: 'Lijnzaad', amount: 10, unit: 'gram' }
          ],
          calories: Math.round(goals.calories * 0.25),
          protein: Math.round(goals.protein * 0.3),
          carbs: Math.round(goals.carbs * 0.15),
          fat: Math.round(goals.fat * 0.3)
        },
        lunch: {
          name: 'Omelet met Spinazie, Tomaat & Feta',
          image: '/images/brotherhood/mastermind.png',
          ingredients: [
            { name: 'Eieren', amount: 3, unit: 'stuks' },
            { name: 'Spinazie', amount: 50, unit: 'gram' },
            { name: 'Tomaat', amount: 50, unit: 'gram' },
            { name: 'Feta', amount: 30, unit: 'gram' }
          ],
          calories: Math.round(goals.calories * 0.35),
          protein: Math.round(goals.protein * 0.35),
          carbs: Math.round(goals.carbs * 0.2),
          fat: Math.round(goals.fat * 0.35)
        },
        dinner: {
          name: 'Kipfilet met Courgette & Avocado',
          image: '/images/brotherhood/qena.png',
          ingredients: [
            { name: 'Kipfilet', amount: 150, unit: 'gram' },
            { name: 'Courgette', amount: 100, unit: 'gram' },
            { name: 'Avocado', amount: 50, unit: 'gram' }
          ],
          calories: Math.round(goals.calories * 0.4),
          protein: Math.round(goals.protein * 0.35),
          carbs: Math.round(goals.carbs * 0.2),
          fat: Math.round(goals.fat * 0.35)
        }
      };
    }
    if (dietType === 'high_protein') {
      return {
        breakfast: {
          name: 'Proteïne Pannenkoeken met Kwark',
          image: '/images/brotherhood/ardenne.png',
          ingredients: [
            { name: 'Proteïne poeder', amount: 30, unit: 'gram' },
            { name: 'Havermout', amount: 40, unit: 'gram' },
            { name: 'Ei', amount: 1, unit: 'stuk' },
            { name: 'Magere kwark', amount: 100, unit: 'gram' }
          ],
          calories: Math.round(goals.calories * 0.25),
          protein: Math.round(goals.protein * 0.35),
          carbs: Math.round(goals.carbs * 0.25),
          fat: Math.round(goals.fat * 0.2)
        },
        lunch: {
          name: 'Tonijnsalade met Kidneybonen & Paprika',
          image: '/images/mind/4.png',
          ingredients: [
            { name: 'Tonijn uit blik', amount: 1, unit: 'blik' },
            { name: 'Kidneybonen', amount: 50, unit: 'gram' },
            { name: 'Paprika', amount: 50, unit: 'gram' },
            { name: 'Olijfolie', amount: 10, unit: 'ml' }
          ],
          calories: Math.round(goals.calories * 0.35),
          protein: Math.round(goals.protein * 0.35),
          carbs: Math.round(goals.carbs * 0.25),
          fat: Math.round(goals.fat * 0.25)
        },
        dinner: {
          name: 'Biefstuk met Sperziebonen & Zoete Aardappel',
          image: '/images/mind/2.png',
          ingredients: [
            { name: 'Biefstuk', amount: 150, unit: 'gram' },
            { name: 'Sperziebonen', amount: 100, unit: 'gram' },
            { name: 'Zoete aardappel', amount: 150, unit: 'gram' }
          ],
          calories: Math.round(goals.calories * 0.4),
          protein: Math.round(goals.protein * 0.3),
          carbs: Math.round(goals.carbs * 0.3),
          fat: Math.round(goals.fat * 0.3)
        }
      };
    }
    // Default: carnivore
    return {
      breakfast: {
        name: 'Gebakken Eieren met Spek',
        image: '/images/mind/1.png',
        ingredients: [
          { name: 'Eieren', amount: Math.round(goals.protein * 0.3 / 6), unit: 'stuks' },
          { name: 'Spek', amount: Math.round(goals.fat * 0.4 / 9), unit: 'gram' }
        ],
        calories: Math.round(goals.calories * 0.3),
        protein: Math.round(goals.protein * 0.3),
        carbs: 0,
        fat: Math.round(goals.fat * 0.4)
      },
      lunch: {
        name: 'Gegrilde Ribeye',
        image: '/images/mind/2.png',
        ingredients: [
          { name: 'Ribeye Steak', amount: Math.round(goals.protein * 0.4 / 2.5), unit: 'gram' },
          { name: 'Boter', amount: Math.round(goals.fat * 0.3 / 9), unit: 'gram' }
        ],
        calories: Math.round(goals.calories * 0.4),
        protein: Math.round(goals.protein * 0.4),
        carbs: 0,
        fat: Math.round(goals.fat * 0.3)
      },
      dinner: {
        name: 'Gehaktballen met Kaas',
        image: '/images/mind/3.png',
        ingredients: [
          { name: 'Rundergehakt', amount: Math.round(goals.protein * 0.3 / 2.5), unit: 'gram' },
          { name: 'Kaas', amount: Math.round(goals.fat * 0.3 / 9), unit: 'gram' }
        ],
        calories: Math.round(goals.calories * 0.3),
        protein: Math.round(goals.protein * 0.3),
        carbs: 0,
        fat: Math.round(goals.fat * 0.3)
      }
    };
  };

  const handleCalculateGoals = () => {
    const goals = calculateNutritionGoals(userData);
    setNutritionGoals(goals);
    setCurrentStep(2);
  };

  const handleDietSelection = (dietId: string) => {
    setSelectedDiet(dietId);
  };

  const handleGeneratePlan = async () => {
    if (!nutritionGoals || !selectedDiet) return;
    
    setIsGenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const plan = generateMealPlan(nutritionGoals, selectedDiet);
    setMealPlan(plan);
    setCurrentStep(3);
    setIsGenerating(false);
  };

  const handleConfirmNutritionPlan = async () => {
    if (!user || !selectedDiet) return;
    const { error } = await supabase
      .from('users')
      .update({ selected_nutrition_plan: selectedDiet })
      .eq('id', user.id);
    if (!error) {
      setSelectedNutritionPlan(selectedDiet);
      setShowPlanBanner(true);
    }
  };

  const generateShoppingList = () => {
    if (!mealPlan) return;
    
    const ingredients = new Map<string, { amount: number; unit: string }>();
    
    [mealPlan.breakfast, mealPlan.lunch, mealPlan.dinner].forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        const existing = ingredients.get(ingredient.name);
        if (existing) {
          existing.amount += ingredient.amount;
        } else {
          ingredients.set(ingredient.name, { amount: ingredient.amount, unit: ingredient.unit });
        }
      });
    });

    const shoppingList = Array.from(ingredients.entries()).map(([name, { amount, unit }]) => 
      `${name}: ${amount} ${unit}`
    ).join('\n');

    // Create and download shopping list
    const blob = new Blob([shoppingList], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'boodschappenlijst.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout
      title="Top Tier Voedingsplan Generator"
      subtitle="Creëer jouw persoonlijke voedingsplan op maat"
    >
      <div className="max-w-4xl mx-auto">
        {!isGenerating && selectedNutritionPlan && showPlanBanner && (
          <div className="max-w-4xl mx-auto mt-8 mb-8">
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center md:text-left">
                <div className="text-sm text-[#8BAE5A] font-semibold mb-1">Je huidige voedingsplan</div>
                <div className="text-xl font-bold text-white mb-1">
                  {dietTypes.find(d => d.id === selectedNutritionPlan)?.name || selectedNutritionPlan}
                </div>
                <div className="text-gray-400 text-sm mb-1">
                  {dietTypes.find(d => d.id === selectedNutritionPlan)?.subtitle}
                </div>
                <div className="text-gray-300 text-sm">
                  {dietTypes.find(d => d.id === selectedNutritionPlan)?.description}
                </div>
              </div>
              <button
                className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#232D1A] font-bold rounded-xl hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => {
                  setCurrentStep(2);
                  setShowPlanBanner(false);
                }}
              >
                Wijzig voedingsplan
              </button>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Stap 1: Bereken jouw persoonlijke calorie- en macrobehoefte
                </h2>
                <p className="text-gray-300">
                  Vul je gegevens in om je persoonlijke voedingsdoelen te berekenen
                </p>
              </div>

              <div className="bg-[#1A1A1A] rounded-xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Leeftijd
                    </label>
                    <input
                      type="number"
                      value={userData.age === 0 ? '' : userData.age}
                      onChange={(e) => setUserData({...userData, age: e.target.value === '' ? 0 : Number(e.target.value)})}
                      className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8BAE5A]"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Lengte (cm)
                    </label>
                    <input
                      type="number"
                      value={userData.height === 0 ? '' : userData.height}
                      onChange={(e) => setUserData({...userData, height: e.target.value === '' ? 0 : Number(e.target.value)})}
                      className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8BAE5A]"
                      placeholder="180"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gewicht (kg)
                    </label>
                    <input
                      type="number"
                      value={userData.weight === 0 ? '' : userData.weight}
                      onChange={(e) => setUserData({...userData, weight: e.target.value === '' ? 0 : Number(e.target.value)})}
                      className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8BAE5A]"
                      placeholder="75"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Activiteitsniveau
                  </label>
                  <select
                    value={userData.activityLevel}
                    onChange={(e) => setUserData({...userData, activityLevel: e.target.value as any})}
                    className="w-full bg-[#232D1A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#8BAE5A]"
                  >
                    {activityLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label} - {level.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Jouw Doel
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'cut', label: 'Vet Verliezen', description: 'Calorie tekort' },
                      { value: 'maintain', label: 'Op Gewicht Blijven', description: 'Onderhoud' },
                      { value: 'bulk', label: 'Spier Opbouwen', description: 'Calorie overschot' }
                    ].map(goal => (
                      <button
                        key={goal.value}
                        onClick={() => setUserData({...userData, goal: goal.value as any})}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          userData.goal === goal.value
                            ? 'border-[#8BAE5A] bg-[#232D1A]'
                            : 'border-[#3A4D23] bg-[#1A1A1A] hover:border-[#5A6D43]'
                        }`}
                      >
                        <div className="text-white font-semibold">{goal.label}</div>
                        <div className="text-gray-400 text-sm">{goal.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center pt-4">
                  <button
                    onClick={handleCalculateGoals}
                    disabled={!userData.age || !userData.height || !userData.weight}
                    className="bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-[#7A9D4B] hover:to-[#5A7D2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                  >
                    <CalculatorIcon className="w-6 h-6 mr-2" />
                    Bereken Mijn Doelen
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="max-w-3xl mx-auto">
                <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                  <div className="flex-1 text-center md:text-left">
                    <div className="text-sm text-[#8BAE5A] font-semibold mb-1">Jouw Invoer</div>
                    <div className="flex flex-wrap gap-4 mb-2">
                      <div className="text-white text-sm">Leeftijd: <span className="font-bold">{userData.age}</span></div>
                      <div className="text-white text-sm">Lengte: <span className="font-bold">{userData.height} cm</span></div>
                      <div className="text-white text-sm">Gewicht: <span className="font-bold">{userData.weight} kg</span></div>
                      <div className="text-white text-sm">Activiteit: <span className="font-bold">{activityLevels.find(l => l.value === userData.activityLevel)?.label}</span></div>
                      <div className="text-white text-sm">Doel: <span className="font-bold">{userData.goal === 'cut' ? 'Vet verliezen' : userData.goal === 'bulk' ? 'Spier opbouwen' : 'Op gewicht blijven'}</span></div>
                    </div>
                    {nutritionGoals && (
                      <div className="flex flex-wrap gap-6 mt-2">
                        <div className="text-[#8BAE5A] text-lg font-bold">{nutritionGoals.calories} kcal</div>
                        <div className="text-[#8BAE5A] text-lg font-bold">{nutritionGoals.protein}g eiwit</div>
                        <div className="text-[#8BAE5A] text-lg font-bold">{nutritionGoals.carbs}g koolhydraten</div>
                        <div className="text-[#8BAE5A] text-lg font-bold">{nutritionGoals.fat}g vet</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Stap 2: Welke voedingsaanpak past bij jou?
                </h2>
                <p className="text-gray-300">
                  Kies de dieetfilosofie die het beste bij jouw levensstijl past
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dietTypes.map(diet => (
                  <button
                    key={diet.id}
                    onClick={() => handleDietSelection(diet.id)}
                    className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                      selectedDiet === diet.id
                        ? 'border-[#8BAE5A] bg-[#232D1A]'
                        : 'border-[#3A4D23] bg-[#1A1A1A] hover:border-[#5A6D43]'
                    }`}
                  >
                    {selectedDiet === diet.id && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className="text-4xl mb-4">{diet.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{diet.name}</h3>
                    <p className="text-[#8BAE5A] font-medium mb-2">{diet.subtitle}</p>
                    <p className="text-gray-400 text-sm">{diet.description}</p>
                  </button>
                ))}
              </div>

              <div className="text-center pt-6">
                <button
                  onClick={async () => {
                    await handleGeneratePlan();
                    await handleConfirmNutritionPlan();
                  }}
                  disabled={!selectedDiet}
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-[#7A9D4B] hover:to-[#5A7D2A] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                      Plan genereren...
                    </>
                  ) : (
                    'Genereer Mijn Persoonlijke Plan'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && mealPlan && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Jouw Persoonlijke {selectedDiet === 'carnivore' ? 'Carnivoor' : 'Voedings'} Plan op Maat
                </h2>
                <p className="text-gray-300">
                  Gebaseerd op jouw doel van {nutritionGoals?.calories} kcal en {nutritionGoals?.protein}g eiwit per dag
                </p>
              </div>

              <div className="text-center mb-8">
                <button
                  onClick={generateShoppingList}
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#6B8E3A] text-white px-6 py-3 rounded-lg font-semibold hover:from-[#7A9D4B] hover:to-[#5A7D2A] transition-all flex items-center justify-center mx-auto"
                >
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  Genereer Boodschappenlijst voor dit Plan
                </button>
              </div>

              <div className="space-y-6">
                {[
                  { meal: mealPlan.breakfast, time: '08:00', title: 'Ontbijt' },
                  { meal: mealPlan.lunch, time: '13:00', title: 'Lunch' },
                  { meal: mealPlan.dinner, time: '19:00', title: 'Diner' }
                ].map(({ meal, time, title }) => (
                  <div key={title} className="bg-[#1A1A1A] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{title} ({time})</h3>
                      <div className="text-sm text-gray-400">
                        {meal.calories} kcal | {meal.protein}g eiwit | {meal.carbs}g koolhydraten | {meal.fat}g vet
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3">
                        <img
                          src={meal.image}
                          alt={meal.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-3">{meal.name}</h4>
                        
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-[#8BAE5A] mb-2">Porties voor jou:</h5>
                          <div className="space-y-1">
                            {meal.ingredients.map((ingredient, index) => (
                              <div key={index} className="text-gray-300 text-sm">
                                • {ingredient.name}: {ingredient.amount} {ingredient.unit}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-6 space-y-4">
                <button
                  onClick={() => {
                    // Mark nutrition plan as completed for onboarding
                    localStorage.setItem('nutritionPlanCompleted', 'true');
                    // Navigate back to dashboard
                    window.location.href = '/dashboard';
                  }}
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#232D1A] px-8 py-4 rounded-xl font-bold hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto"
                >
                  <CheckIcon className="w-6 h-6 mr-2" />
                  Start met dit Plan
                </button>
                
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-[#3A4D23] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4A5D33] transition-all"
                >
                  Nieuw Plan Genereren
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
} 