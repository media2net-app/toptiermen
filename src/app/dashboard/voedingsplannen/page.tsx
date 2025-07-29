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
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import MealEditModal from './MealEditModal';
import WeekPlanView from './WeekPlanView';

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

interface Meal {
  id: string;
  name: string;
  image: string;
  ingredients: { name: string; amount: number; unit: string }[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface MealPlan {
  meals: Meal[];
}

interface WeekPlan {
  [day: string]: MealPlan;
}

interface DayPlan {
  day: string;
  date: string;
  meals: Meal[];
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
  const { user } = useSupabaseAuth();
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
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [originalWeekPlan, setOriginalWeekPlan] = useState<WeekPlan | null>(null); // Store original week plan
  const [selectedDay, setSelectedDay] = useState<string>('monday'); // Current selected day
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNutritionPlan, setSelectedNutritionPlan] = useState<string | null>(null);
  const [showPlanBanner, setShowPlanBanner] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  useEffect(() => {
    const fetchUserNutritionData = async () => {
      if (!user) return;
      
      try {
        // Fetch active nutrition plan
        const { data: planData, error: planError } = await supabase
          .from('user_nutrition_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (!planError && planData) {
          // Load the saved plan
          setSelectedNutritionPlan(planData.plan_type);
          setNutritionGoals(planData.nutrition_goals);
          setUserData(planData.user_data);
          setWeekPlan(planData.week_plan);
          setOriginalWeekPlan(planData.week_plan);
          setCurrentStep(3); // Show the plan
        } else {
          // Fallback to old method
          const { data, error } = await supabase
            .from('users')
            .select('selected_nutrition_plan')
            .eq('id', user.id)
            .single();
          if (!error && data?.selected_nutrition_plan) {
            setSelectedNutritionPlan(data.selected_nutrition_plan);
          }
        }
      } catch (error) {
        console.error('Error fetching nutrition data:', error);
      }
    };
    
    fetchUserNutritionData();
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
        meals: [
          {
            id: 'breakfast-1',
            name: 'Havermout met Blauwe Bessen & Walnoten',
            image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Havermout', amount: 60, unit: 'gram' },
              { name: 'Melk', amount: 250, unit: 'ml' },
              { name: 'Blauwe bessen', amount: 50, unit: 'gram' },
              { name: 'Walnoten', amount: 15, unit: 'gram' }
            ],
            calories: Math.round(goals.calories * 0.25),
            protein: Math.round(goals.protein * 0.25),
            carbs: Math.round(goals.carbs * 0.3),
            fat: Math.round(goals.fat * 0.2),
            time: '08:00',
            type: 'breakfast' as const
          },
          {
            id: 'lunch-1',
            name: 'Volkoren Wrap met Kip, Groenten & Hummus',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
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
            fat: Math.round(goals.fat * 0.3),
            time: '13:00',
            type: 'lunch' as const
          },
          {
            id: 'dinner-1',
            name: 'Zalmfilet met Zoete Aardappel & Broccoli',
            image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Zalmfilet', amount: 150, unit: 'gram' },
              { name: 'Zoete aardappel', amount: 200, unit: 'gram' },
              { name: 'Broccoli', amount: 150, unit: 'gram' }
            ],
            calories: Math.round(goals.calories * 0.4),
            protein: Math.round(goals.protein * 0.4),
            carbs: Math.round(goals.carbs * 0.35),
            fat: Math.round(goals.fat * 0.5),
            time: '19:00',
            type: 'dinner' as const
          }
        ]
      };
    }
    if (dietType === 'low_carb') {
      return {
        meals: [
          {
            id: 'breakfast-1',
            name: 'Griekse Yoghurt met Noten & Lijnzaad',
            image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Griekse yoghurt', amount: 200, unit: 'gram' },
              { name: 'Gemengde noten', amount: 20, unit: 'gram' },
              { name: 'Lijnzaad', amount: 10, unit: 'gram' }
            ],
            calories: Math.round(goals.calories * 0.25),
            protein: Math.round(goals.protein * 0.3),
            carbs: Math.round(goals.carbs * 0.15),
            fat: Math.round(goals.fat * 0.3),
            time: '08:00',
            type: 'breakfast' as const
          },
          {
            id: 'lunch-1',
            name: 'Omelet met Spinazie, Tomaat & Feta',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Eieren', amount: 3, unit: 'stuks' },
              { name: 'Spinazie', amount: 50, unit: 'gram' },
              { name: 'Tomaat', amount: 50, unit: 'gram' },
              { name: 'Feta', amount: 30, unit: 'gram' }
            ],
            calories: Math.round(goals.calories * 0.35),
            protein: Math.round(goals.protein * 0.35),
            carbs: Math.round(goals.carbs * 0.2),
            fat: Math.round(goals.fat * 0.35),
            time: '13:00',
            type: 'lunch' as const
          },
          {
            id: 'dinner-1',
            name: 'Kipfilet met Courgette & Avocado',
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Kipfilet', amount: 150, unit: 'gram' },
              { name: 'Courgette', amount: 100, unit: 'gram' },
              { name: 'Avocado', amount: 50, unit: 'gram' }
            ],
            calories: Math.round(goals.calories * 0.4),
            protein: Math.round(goals.protein * 0.35),
            carbs: Math.round(goals.carbs * 0.2),
            fat: Math.round(goals.fat * 0.35),
            time: '19:00',
            type: 'dinner' as const
          }
        ]
      };
    }
    if (dietType === 'high_protein') {
      return {
        meals: [
          {
            id: 'breakfast-1',
            name: 'Proteïne Pannenkoeken met Kwark',
            image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Proteïne poeder', amount: 30, unit: 'gram' },
              { name: 'Havermout', amount: 40, unit: 'gram' },
              { name: 'Ei', amount: 1, unit: 'stuk' },
              { name: 'Magere kwark', amount: 100, unit: 'gram' }
            ],
            calories: Math.round(goals.calories * 0.25),
            protein: Math.round(goals.protein * 0.35),
            carbs: Math.round(goals.carbs * 0.25),
            fat: Math.round(goals.fat * 0.2),
            time: '08:00',
            type: 'breakfast' as const
          },
          {
            id: 'lunch-1',
            name: 'Tonijnsalade met Kidneybonen & Paprika',
            image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Tonijn uit blik', amount: 1, unit: 'blik' },
              { name: 'Kidneybonen', amount: 50, unit: 'gram' },
              { name: 'Paprika', amount: 50, unit: 'gram' },
              { name: 'Olijfolie', amount: 10, unit: 'ml' }
            ],
            calories: Math.round(goals.calories * 0.35),
            protein: Math.round(goals.protein * 0.35),
            carbs: Math.round(goals.carbs * 0.25),
            fat: Math.round(goals.fat * 0.25),
            time: '13:00',
            type: 'lunch' as const
          },
          {
            id: 'dinner-1',
            name: 'Biefstuk met Sperziebonen & Zoete Aardappel',
            image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop',
            ingredients: [
              { name: 'Biefstuk', amount: 150, unit: 'gram' },
              { name: 'Sperziebonen', amount: 100, unit: 'gram' },
              { name: 'Zoete aardappel', amount: 150, unit: 'gram' }
            ],
            calories: Math.round(goals.calories * 0.4),
            protein: Math.round(goals.protein * 0.3),
            carbs: Math.round(goals.carbs * 0.3),
            fat: Math.round(goals.fat * 0.3),
            time: '19:00',
            type: 'dinner' as const
          }
        ]
      };
    }
    // Default: carnivore
    return {
      meals: [
        {
          id: 'breakfast-1',
          name: 'Gebakken Eieren met Spek',
          image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=600&fit=crop',
          ingredients: [
            { name: 'Eieren', amount: Math.round(goals.protein * 0.3 / 6), unit: 'stuks' },
            { name: 'Spek', amount: Math.round(goals.fat * 0.4 / 9), unit: 'gram' }
          ],
          calories: Math.round(goals.calories * 0.3),
          protein: Math.round(goals.protein * 0.3),
          carbs: 0,
          fat: Math.round(goals.fat * 0.4),
          time: '08:00',
          type: 'breakfast' as const
        },
        {
          id: 'lunch-1',
          name: 'Gegrilde Ribeye',
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
          ingredients: [
            { name: 'Ribeye Steak', amount: Math.round(goals.protein * 0.4 / 2.5), unit: 'gram' },
            { name: 'Boter', amount: Math.round(goals.fat * 0.3 / 9), unit: 'gram' }
          ],
          calories: Math.round(goals.calories * 0.4),
          protein: Math.round(goals.protein * 0.4),
          carbs: 0,
          fat: Math.round(goals.fat * 0.3),
          time: '13:00',
          type: 'lunch' as const
        },
        {
          id: 'dinner-1',
          name: 'Gehaktballen met Kaas',
          image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&h=600&fit=crop',
          ingredients: [
            { name: 'Rundergehakt', amount: Math.round(goals.protein * 0.3 / 2.5), unit: 'gram' },
            { name: 'Kaas', amount: Math.round(goals.fat * 0.3 / 9), unit: 'gram' }
          ],
          calories: Math.round(goals.calories * 0.3),
          protein: Math.round(goals.protein * 0.3),
          carbs: 0,
          fat: Math.round(goals.fat * 0.3),
          time: '19:00',
          type: 'dinner' as const
        }
      ]
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

  const generateWeekPlan = (goals: NutritionGoals, dietType: string): WeekPlan => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const weekPlan: WeekPlan = {};
    
    if (dietType === 'carnivore') {
      // Generate different carnivore meal plans for each day
      const carnivoreMeals = {
        monday: {
          meals: [
            createMealWithMacros(
              'monday-breakfast',
              'Rundvlees & Eieren Ontbijt',
              '/images/meals/beef-eggs.jpg',
              [
                { name: 'Rundvlees (biefstuk)', amount: 200, unit: 'g' },
                { name: 'Eieren', amount: 3, unit: 'stuks' },
                { name: 'Boter', amount: 30, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '08:00',
              'breakfast'
            ),
            createMealWithMacros(
              'monday-lunch',
              'Lamsvlees Lunch',
              '/images/meals/lamb.jpg',
              [
                { name: 'Lamsvlees (lende)', amount: 250, unit: 'g' },
                { name: 'Boter', amount: 25, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' },
                { name: 'Peper', amount: 3, unit: 'g' }
              ],
              '13:00',
              'lunch'
            ),
            createMealWithMacros(
              'monday-dinner',
              'Varkensvlees Avondeten',
              '/images/meals/pork.jpg',
              [
                { name: 'Varkensvlees (varkenshaas)', amount: 300, unit: 'g' },
                { name: 'Spek', amount: 50, unit: 'g' },
                { name: 'Boter', amount: 20, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '19:00',
              'dinner'
            )
          ]
        },
        tuesday: {
          meals: [
            createMealWithMacros(
              'tuesday-breakfast',
              'Eieren & Spek Ontbijt',
              '/images/meals/eggs-bacon.jpg',
              [
                { name: 'Eieren', amount: 4, unit: 'stuks' },
                { name: 'Spek', amount: 100, unit: 'g' },
                { name: 'Boter', amount: 25, unit: 'g' },
                { name: 'Zout', amount: 3, unit: 'g' }
              ],
              '08:00',
              'breakfast'
            ),
            createMealWithMacros(
              'tuesday-lunch',
              'Kipfilet Lunch',
              '/images/meals/chicken.jpg',
              [
                { name: 'Kipfilet', amount: 300, unit: 'g' },
                { name: 'Boter', amount: 30, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' },
                { name: 'Peper', amount: 3, unit: 'g' }
              ],
              '13:00',
              'lunch'
            ),
            createMealWithMacros(
              'tuesday-dinner',
              'Rundvlees & Lever Avondeten',
              '/images/meals/beef-liver.jpg',
              [
                { name: 'Rundvlees (gehakt)', amount: 250, unit: 'g' },
                { name: 'Runderlever', amount: 100, unit: 'g' },
                { name: 'Boter', amount: 25, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '19:00',
              'dinner'
            )
          ]
        },
        wednesday: {
          meals: [
            createMealWithMacros(
              'wednesday-breakfast',
              'Zalm & Eieren Ontbijt',
              '/images/meals/salmon-eggs.jpg',
              [
                { name: 'Zalm', amount: 200, unit: 'g' },
                { name: 'Eieren', amount: 3, unit: 'stuks' },
                { name: 'Boter', amount: 30, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '08:00',
              'breakfast'
            ),
            createMealWithMacros(
              'wednesday-lunch',
              'Kalkoen Lunch',
              '/images/meals/turkey.jpg',
              [
                { name: 'Kalkoenfilet', amount: 300, unit: 'g' },
                { name: 'Boter', amount: 25, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' },
                { name: 'Peper', amount: 3, unit: 'g' }
              ],
              '13:00',
              'lunch'
            ),
            createMealWithMacros(
              'wednesday-dinner',
              'Lamsvlees & Nieren Avondeten',
              '/images/meals/lamb-kidneys.jpg',
              [
                { name: 'Lamsvlees (schouder)', amount: 250, unit: 'g' },
                { name: 'Lamsnieren', amount: 100, unit: 'g' },
                { name: 'Boter', amount: 30, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '19:00',
              'dinner'
            )
          ]
        },
        thursday: {
          meals: [
            createMealWithMacros(
              'thursday-breakfast',
              'Eieren & Rundvlees Ontbijt',
              '/images/meals/eggs-beef.jpg',
              [
                { name: 'Eieren', amount: 4, unit: 'stuks' },
                { name: 'Rundvlees (gehakt)', amount: 150, unit: 'g' },
                { name: 'Boter', amount: 25, unit: 'g' },
                { name: 'Zout', amount: 3, unit: 'g' }
              ],
              '08:00',
              'breakfast'
            ),
            createMealWithMacros(
              'thursday-lunch',
              'Varkensvlees Lunch',
              '/images/meals/pork-lunch.jpg',
              [
                { name: 'Varkensvlees (varkenshaas)', amount: 300, unit: 'g' },
                { name: 'Spek', amount: 50, unit: 'g' },
                { name: 'Boter', amount: 20, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '13:00',
              'lunch'
            ),
            createMealWithMacros(
              'thursday-dinner',
              'Kip & Lever Avondeten',
              '/images/meals/chicken-liver.jpg',
              [
                { name: 'Kipfilet', amount: 250, unit: 'g' },
                { name: 'Kippenlever', amount: 100, unit: 'g' },
                { name: 'Boter', amount: 25, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '19:00',
              'dinner'
            )
          ]
        },
        friday: {
          meals: [
            createMealWithMacros(
              'friday-breakfast',
              'Tonijn & Eieren Ontbijt',
              '/images/meals/tuna-eggs.jpg',
              [
                { name: 'Tonijn', amount: 200, unit: 'g' },
                { name: 'Eieren', amount: 3, unit: 'stuks' },
                { name: 'Boter', amount: 30, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '08:00',
              'breakfast'
            ),
            createMealWithMacros(
              'friday-lunch',
              'Lamsvlees Lunch',
              '/images/meals/lamb-lunch.jpg',
              [
                { name: 'Lamsvlees (lende)', amount: 300, unit: 'g' },
                { name: 'Boter', amount: 25, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' },
                { name: 'Peper', amount: 3, unit: 'g' }
              ],
              '13:00',
              'lunch'
            ),
            createMealWithMacros(
              'friday-dinner',
              'Rundvlees & Nieren Avondeten',
              '/images/meals/beef-kidneys.jpg',
              [
                { name: 'Rundvlees (biefstuk)', amount: 250, unit: 'g' },
                { name: 'Rundernieren', amount: 100, unit: 'g' },
                { name: 'Boter', amount: 30, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '19:00',
              'dinner'
            )
          ]
        },
        saturday: {
          meals: [
            createMealWithMacros(
              'saturday-breakfast',
              'Spek & Eieren Ontbijt',
              '/images/meals/bacon-eggs.jpg',
              [
                { name: 'Spek', amount: 150, unit: 'g' },
                { name: 'Eieren', amount: 4, unit: 'stuks' },
                { name: 'Boter', amount: 25, unit: 'g' },
                { name: 'Zout', amount: 3, unit: 'g' }
              ],
              '08:00',
              'breakfast'
            ),
            createMealWithMacros(
              'saturday-lunch',
              'Kip & Kalkoen Lunch',
              '/images/meals/chicken-turkey.jpg',
              [
                { name: 'Kipfilet', amount: 200, unit: 'g' },
                { name: 'Kalkoenfilet', amount: 150, unit: 'g' },
                { name: 'Boter', amount: 25, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '13:00',
              'lunch'
            ),
            createMealWithMacros(
              'saturday-dinner',
              'Varkensvlees & Lever Avondeten',
              '/images/meals/pork-liver.jpg',
              [
                { name: 'Varkensvlees (varkenshaas)', amount: 250, unit: 'g' },
                { name: 'Varkenslever', amount: 100, unit: 'g' },
                { name: 'Boter', amount: 30, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '19:00',
              'dinner'
            )
          ]
        },
        sunday: {
          meals: [
            createMealWithMacros(
              'sunday-breakfast',
              'Gevogelte & Eieren Ontbijt',
              '/images/meals/poultry-eggs.jpg',
              [
                { name: 'Eend', amount: 200, unit: 'g' },
                { name: 'Eieren', amount: 3, unit: 'stuks' },
                { name: 'Boter', amount: 30, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '08:00',
              'breakfast'
            ),
            createMealWithMacros(
              'sunday-lunch',
              'Rundvlees & Lamsvlees Lunch',
              '/images/meals/beef-lamb.jpg',
              [
                { name: 'Rundvlees (gehakt)', amount: 200, unit: 'g' },
                { name: 'Lamsvlees (lende)', amount: 150, unit: 'g' },
                { name: 'Boter', amount: 25, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '13:00',
              'lunch'
            ),
            createMealWithMacros(
              'sunday-dinner',
              'Zalm & Kip Avondeten',
              '/images/meals/salmon-chicken.jpg',
              [
                { name: 'Zalm', amount: 200, unit: 'g' },
                { name: 'Kipfilet', amount: 150, unit: 'g' },
                { name: 'Boter', amount: 30, unit: 'g' },
                { name: 'Zout', amount: 5, unit: 'g' }
              ],
              '19:00',
              'dinner'
            )
          ]
        }
      };

      days.forEach(day => {
        weekPlan[day] = carnivoreMeals[day as keyof typeof carnivoreMeals];
      });
    } else {
      // For other diet types, use the original generateMealPlan function
      days.forEach(day => {
        weekPlan[day] = generateMealPlan(goals, dietType);
      });
    }
    
    return weekPlan;
  };

  const handleGeneratePlan = async () => {
    if (!nutritionGoals || !selectedDiet) return;
    
    setIsGenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const plan = generateWeekPlan(nutritionGoals, selectedDiet);
    setOriginalWeekPlan(plan); // Store original plan
    setWeekPlan(plan);
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

  // Helper function to redistribute calories when meals change
  const redistributeCalories = (meals: Meal[], nutritionGoals: NutritionGoals | null, originalMeals?: Meal[]): Meal[] => {
    if (!nutritionGoals) return meals;
    
    const mainMeals = meals.filter(m => m.type !== 'snack');
    const snacks = meals.filter(m => m.type === 'snack');
    
    // Redistribute calories: main meals get 85%, snacks get 15%
    const mainMealPercentage = mainMeals.length > 0 ? 0.85 / mainMeals.length : 1;
    const snackPercentage = snacks.length > 0 ? 0.15 / snacks.length : 0;
    
    return meals.map(meal => {
      // Find the original meal to get the base calories and ingredients
      const originalMeal = originalMeals?.find(m => m.id === meal.id) || meal;
      const originalCalories = originalMeal.calories;
      const newCalories = meal.type === 'snack' 
        ? Math.round(nutritionGoals.calories * snackPercentage)
        : Math.round(nutritionGoals.calories * mainMealPercentage);
      
      const calorieRatio = originalCalories > 0 ? newCalories / originalCalories : 1;
      
      // Adjust ingredients proportionally based on original meal
      const adjustedIngredients = originalMeal.ingredients.map(ingredient => ({
        ...ingredient,
        amount: Math.round(ingredient.amount * calorieRatio * 10) / 10 // Round to 1 decimal
      }));
      
      if (meal.type === 'snack') {
        return {
          ...meal,
          calories: newCalories,
          protein: Math.round(nutritionGoals.protein * snackPercentage),
          carbs: Math.round(nutritionGoals.carbs * snackPercentage),
          fat: Math.round(nutritionGoals.fat * snackPercentage),
          ingredients: adjustedIngredients
        };
      } else {
        return {
          ...meal,
          calories: newCalories,
          protein: Math.round(nutritionGoals.protein * mainMealPercentage),
          carbs: Math.round(nutritionGoals.carbs * mainMealPercentage),
          fat: Math.round(nutritionGoals.fat * mainMealPercentage),
          ingredients: adjustedIngredients
        };
      }
    });
  };

  const generateShoppingList = () => {
    if (!weekPlan) return;
    
    const ingredients = new Map<string, { amount: number; unit: string }>();
    
    Object.values(weekPlan).forEach(dayPlan => {
      dayPlan.meals.forEach(meal => {
        meal.ingredients.forEach((ingredient: { name: string; amount: number; unit: string }) => {
          const existing = ingredients.get(ingredient.name);
          if (existing) {
            existing.amount += ingredient.amount;
          } else {
            ingredients.set(ingredient.name, { amount: ingredient.amount, unit: ingredient.unit });
          }
        });
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

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setIsEditModalOpen(true);
  };

  const getDayName = (day: string): string => {
    const dayNames: { [key: string]: string } = {
      monday: 'Maandag',
      tuesday: 'Dinsdag', 
      wednesday: 'Woensdag',
      thursday: 'Donderdag',
      friday: 'Vrijdag',
      saturday: 'Zaterdag',
      sunday: 'Zondag'
    };
    return dayNames[day] || day;
  };

  const handleSaveMeal = async (updatedMeal: Meal) => {
    if (!weekPlan || !user) return;

    const currentDayPlan = weekPlan[selectedDay];
    const updatedMeals = currentDayPlan.meals.map(meal => 
      meal.id === updatedMeal.id ? updatedMeal : meal
    );

    // Redistribute calories to maintain total daily goals
    const redistributedMeals = redistributeCalories(updatedMeals, nutritionGoals, originalWeekPlan?.[selectedDay]?.meals);
    
    const updatedWeekPlan = {
      ...weekPlan,
      [selectedDay]: {
        ...currentDayPlan,
        meals: redistributedMeals
      }
    };

    setWeekPlan(updatedWeekPlan);

    // Save meal customization to database
    try {
      const { error } = await supabase
        .from('user_meal_customizations')
        .upsert({
          user_id: user.id,
          plan_id: 'current', // We'll need to get the actual plan ID
          day_of_week: selectedDay,
          meal_id: updatedMeal.id,
          original_meal: originalWeekPlan?.[selectedDay]?.meals.find(m => m.id === updatedMeal.id),
          customized_meal: updatedMeal,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving meal customization:', error);
      }
    } catch (error) {
      console.error('Error saving meal customization:', error);
    }
  };

  const handleAddSnack = (time: string, type: 'afternoon' | 'evening') => {
    if (!weekPlan || !nutritionGoals) return;

    const estimatedCalories = Math.round(nutritionGoals.calories * 0.075);
    
    const newSnack: Meal = {
      id: `snack-${Date.now()}`,
      name: type === 'afternoon' ? 'Gezonde Snack' : 'Avond Snack',
      image: type === 'afternoon' 
        ? 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=600&fit=crop'
        : 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop',
      ingredients: type === 'afternoon' 
        ? [
            { name: 'Amandelen', amount: Math.round(estimatedCalories * 0.3 / 6), unit: 'gram' },
            { name: 'Appel', amount: 1, unit: 'stuk' }
          ]
        : [
            { name: 'Griekse yoghurt', amount: Math.round(estimatedCalories * 0.6 / 0.6), unit: 'gram' },
            { name: 'Bessen', amount: Math.round(estimatedCalories * 0.4 / 0.5), unit: 'gram' }
          ],
      calories: estimatedCalories,
      protein: Math.round(estimatedCalories * (type === 'afternoon' ? 0.15 : 0.25)),
      carbs: Math.round(estimatedCalories * (type === 'afternoon' ? 0.6 : 0.55)),
      fat: Math.round(estimatedCalories * (type === 'afternoon' ? 0.25 : 0.2)),
      time,
      type: 'snack' as const
    };

    const allOriginalMeals = [...(originalWeekPlan?.[selectedDay]?.meals || []), newSnack];
    const updatedMeals = redistributeCalories([...weekPlan[selectedDay].meals, newSnack], nutritionGoals, allOriginalMeals);
    
    setWeekPlan(prev => ({
      ...prev!,
      [selectedDay]: {
        ...prev![selectedDay],
        meals: updatedMeals.sort((a, b) => a.time.localeCompare(b.time))
      }
    }));
  };

  const handleRemoveSnack = (mealId: string) => {
    if (!weekPlan) return;

    const remainingMeals = weekPlan[selectedDay].meals.filter(m => m.id !== mealId);
    const remainingOriginalMeals = originalWeekPlan?.[selectedDay]?.meals.filter(m => 
      remainingMeals.some(remaining => remaining.id === m.id)
    );
    const updatedMeals = redistributeCalories(remainingMeals, nutritionGoals, remainingOriginalMeals);
    
    setWeekPlan(prev => ({
      ...prev!,
      [selectedDay]: {
        ...prev![selectedDay],
        meals: updatedMeals.sort((a, b) => a.time.localeCompare(b.time))
      }
    }));
  };

  const handleStartPlan = async () => {
    if (!user || !weekPlan || !nutritionGoals || !selectedDiet) return;

    try {
      // Save the complete nutrition plan to database
      const { error } = await supabase
        .from('user_nutrition_plans')
        .upsert({
          user_id: user.id,
          plan_type: selectedDiet,
          nutrition_goals: nutritionGoals,
          user_data: userData,
          week_plan: weekPlan,
          is_active: true,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving nutrition plan:', error);
        return;
      }

      // Mark nutrition plan as completed for onboarding
      localStorage.setItem('nutritionPlanCompleted', 'true');
      
      // Navigate back to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error starting nutrition plan:', error);
    }
  };

  const handleNewPlan = () => {
    setCurrentStep(1);
  };

  // Calculate accurate macros based on ingredients
  const calculateMacrosFromIngredients = (ingredients: { name: string; amount: number; unit: string }[]) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    ingredients.forEach(ingredient => {
      const { name, amount, unit } = ingredient;
      
      // Convert to grams if needed
      let grams = amount;
      if (unit === 'stuks' && name.toLowerCase().includes('eieren')) {
        grams = amount * 50; // 1 egg = ~50g
      }

      // Macro values per 100g (approximate)
      const macroValues: { [key: string]: { calories: number; protein: number; carbs: number; fat: number } } = {
        'Rundvlees (biefstuk)': { calories: 250, protein: 26, carbs: 0, fat: 15 },
        'Rundvlees (gehakt)': { calories: 242, protein: 23, carbs: 0, fat: 15 },
        'Lamsvlees (lende)': { calories: 294, protein: 25, carbs: 0, fat: 21 },
        'Lamsvlees (schouder)': { calories: 282, protein: 25, carbs: 0, fat: 20 },
        'Varkensvlees (varkenshaas)': { calories: 143, protein: 21, carbs: 0, fat: 6 },
        'Kipfilet': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        'Kalkoenfilet': { calories: 157, protein: 30, carbs: 0, fat: 3.6 },
        'Zalm': { calories: 208, protein: 25, carbs: 0, fat: 12 },
        'Tonijn': { calories: 144, protein: 30, carbs: 0, fat: 1 },
        'Eend': { calories: 337, protein: 19, carbs: 0, fat: 28 },
        'Eieren': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
        'Spek': { calories: 541, protein: 37, carbs: 0, fat: 42 },
        'Runderlever': { calories: 135, protein: 20, carbs: 3.9, fat: 3.6 },
        'Kippenlever': { calories: 167, protein: 26, carbs: 0.7, fat: 6.5 },
        'Varkenslever': { calories: 134, protein: 21, carbs: 2.5, fat: 3.7 },
        'Rundernieren': { calories: 99, protein: 17, carbs: 0.3, fat: 3.1 },
        'Lamsnieren': { calories: 97, protein: 16, carbs: 0.8, fat: 3.2 },
        'Boter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
        'Zout': { calories: 0, protein: 0, carbs: 0, fat: 0 },
        'Peper': { calories: 0, protein: 0, carbs: 0, fat: 0 }
      };

      const macro = macroValues[name] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
      const multiplier = grams / 100;

      totalCalories += macro.calories * multiplier;
      totalProtein += macro.protein * multiplier;
      totalCarbs += macro.carbs * multiplier;
      totalFat += macro.fat * multiplier;
    });

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat)
    };
  };

  // Helper function to create meals with accurate macros
  const createMealWithMacros = (
    id: string,
    name: string,
    image: string,
    ingredients: { name: string; amount: number; unit: string }[],
    time: string,
    type: 'breakfast' | 'lunch' | 'dinner'
  ) => {
    return {
      id,
      name,
      image,
      ingredients,
      ...calculateMacrosFromIngredients(ingredients),
      time,
      type
    };
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

          {currentStep === 3 && weekPlan && (
            <WeekPlanView
              weekPlan={weekPlan}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              nutritionGoals={nutritionGoals}
              selectedDiet={selectedDiet}
              onEditMeal={handleEditMeal}
              onAddSnack={handleAddSnack}
              onRemoveSnack={handleRemoveSnack}
              onStartPlan={handleStartPlan}
              onNewPlan={handleNewPlan}
            />
          )}
        </AnimatePresence>

        {/* Meal Edit Modal */}
        <MealEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          meal={editingMeal}
          onSave={handleSaveMeal}
          nutritionGoals={nutritionGoals}
        />
      </div>
    </PageLayout>
  );
} 