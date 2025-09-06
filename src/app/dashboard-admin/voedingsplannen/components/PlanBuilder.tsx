'use client';
import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, CalendarIcon, PencilIcon } from '@heroicons/react/24/outline';
import AdminButton from '@/components/admin/AdminButton';
import MealEditModal from './MealEditModal';

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
  fitness_goal?: 'droogtrainen' | 'spiermassa' | 'onderhoud';
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
    avondsnack: MealPlan;
  };
}

interface MealPlan {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  suggestions: string[];
  ingredients?: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
}

interface PlanBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: NutritionPlan | null;
  foodItems?: any[];
  onSave: (plan: NutritionPlan) => void;
}

export default function PlanBuilder({ isOpen, onClose, plan, foodItems = [], onSave }: PlanBuilderProps) {
  // Local state for fresh ingredients database
  const [localFoodItems, setLocalFoodItems] = useState<any[]>(foodItems);

  // Update local food items when modal opens to get fresh data
  useEffect(() => {
    const loadFreshIngredients = async () => {
      if (isOpen) {
        try {
          console.log('🔄 PlanBuilder: Loading fresh ingredients database...');
          const response = await fetch('/api/admin/nutrition-ingredients');
          const result = await response.json();
          if (result.success && result.ingredients) {
            setLocalFoodItems(result.ingredients);
            console.log('✅ PlanBuilder: Fresh ingredients loaded:', result.ingredients.length, 'ingredients');
          } else {
            console.error('❌ PlanBuilder: Failed to load fresh ingredients:', result.error);
            // Fallback to prop data
            setLocalFoodItems(foodItems);
          }
        } catch (error) {
          console.error('❌ PlanBuilder: Error loading fresh ingredients:', error);
          // Fallback to prop data
          setLocalFoodItems(foodItems);
        }
      }
    };

    loadFreshIngredients();
  }, [isOpen, foodItems]);

  // Load plan data when component opens with existing plan
  useEffect(() => {
    if (isOpen && plan) {
      console.log('🔄 PlanBuilder: Loading existing plan data:', plan.name);
      console.log('📊 Plan target macros from prop:', {
        calories: (plan as any).meals?.target_calories || plan.target_calories,
        protein: (plan as any).meals?.target_protein || plan.target_protein,
        carbs: (plan as any).meals?.target_carbs || plan.target_carbs,
        fat: (plan as any).meals?.target_fat || plan.target_fat
      });

      // For carnivore plans, force refresh from database to get latest values
      const isCarnivore = plan.name?.toLowerCase().includes('carnivoor');
      
      if (isCarnivore) {
        console.log('🥩 Carnivore plan detected, fetching fresh data from database...');
        
        // Fetch fresh data from database for carnivore plans
        fetch('/api/admin/nutrition-plans')
          .then(res => res.json())
          .then(data => {
            if (data.success && data.plans) {
              const freshPlan = data.plans.find((p: any) => p.id === plan.id || p.name === plan.name);
              if (freshPlan) {
                console.log('✅ Fresh carnivore plan data loaded:', {
                  name: freshPlan.name,
                  calories: freshPlan.target_calories,
                  protein: freshPlan.target_protein,
                  carbs: freshPlan.target_carbs,
                  fat: freshPlan.target_fat
                });
                
                setFormData({
                  id: freshPlan.id,
                  name: freshPlan.name || '',
                  description: freshPlan.description || '',
                  target_calories: freshPlan.target_calories,
                  target_protein: freshPlan.target_protein,
                  target_carbs: freshPlan.target_carbs,
                  target_fat: freshPlan.target_fat,
                  duration_weeks: freshPlan.duration_weeks || 12,
                  difficulty: freshPlan.difficulty || 'beginner',
                  goal: freshPlan.goal || 'spiermassa',
                  fitness_goal: (freshPlan.goal?.toLowerCase().includes('droog') ? 'droogtrainen' : 
                                freshPlan.goal?.toLowerCase().includes('massa') ? 'spiermassa' : 'onderhoud') as any,
                  is_featured: freshPlan.is_featured || false,
                  is_public: freshPlan.is_public !== false,
                  daily_plans: (freshPlan as any).meals?.weekly_plan 
                    ? convertWeeklyPlanToDailyPlans((freshPlan as any).meals.weekly_plan)
                    : []
                });
                return;
              }
            }
            
            // Fallback to prop data if API fails
            console.log('⚠️ Using fallback prop data for carnivore plan');
            loadPlanFromProps();
          })
          .catch(error => {
            console.error('❌ Error fetching fresh carnivore data:', error);
            loadPlanFromProps();
          });
      } else {
        loadPlanFromProps();
      }

      function loadPlanFromProps() {
        if (!plan) return;
        
        // Use data from plan.meals if available, otherwise fallback to plan properties
        const targetCalories = (plan as any).meals?.target_calories || plan.target_calories || 2200;
        const targetProtein = (plan as any).meals?.target_protein || plan.target_protein || 165;
        const targetCarbs = (plan as any).meals?.target_carbs || plan.target_carbs || 220;
        const targetFat = (plan as any).meals?.target_fat || plan.target_fat || 73;

        setFormData({
          id: plan.id,
          name: plan.name || '',
          description: plan.description || '',
          target_calories: targetCalories,
          target_protein: targetProtein,
          target_carbs: targetCarbs,
          target_fat: targetFat,
          duration_weeks: plan.duration_weeks || 12,
          difficulty: plan.difficulty || 'beginner',
          goal: plan.goal || 'spiermassa',
          fitness_goal: (plan.goal?.toLowerCase().includes('droog') ? 'droogtrainen' : 
                        plan.goal?.toLowerCase().includes('massa') ? 'spiermassa' : 'onderhoud') as any,
          is_featured: plan.is_featured || false,
          is_public: plan.is_public !== false,
          daily_plans: (plan as any).meals?.weekly_plan 
            ? convertWeeklyPlanToDailyPlans((plan as any).meals.weekly_plan)
            : []
        });

        console.log('✅ PlanBuilder: Plan data loaded with macros:', {
          calories: targetCalories,
          protein: targetProtein,
          carbs: targetCarbs,
          fat: targetFat
        });
      }
    } else if (isOpen && !plan) {
      // Reset to default when opening without a plan
      console.log('🔄 PlanBuilder: Resetting to default values');
      setFormData({
        name: '',
        ...getStandardProfile('spiermassa', false),
        duration_weeks: 12,
        difficulty: 'beginner',
        goal: 'spiermassa',
        fitness_goal: 'spiermassa',
        is_featured: false,
        is_public: true,
        daily_plans: []
      });
    }
  }, [isOpen, plan]);

  // Fitness goal configurations
  const fitnessGoalConfigs = {
    droogtrainen: {
      calories_multiplier: 0.85,
      protein_multiplier: 1.2,
      carbs_multiplier: 0.7,
      fat_multiplier: 0.9,
      description: 'Focus op vetverlies met behoud van spiermassa',
      color: 'text-red-400'
    },
    spiermassa: {
      calories_multiplier: 1.15,
      protein_multiplier: 1.3,
      carbs_multiplier: 1.2,
      fat_multiplier: 1.1,
      description: 'Focus op spiergroei en krachttoename',
      color: 'text-green-400'
    },
    onderhoud: {
      calories_multiplier: 1.0,
      protein_multiplier: 1.0,
      carbs_multiplier: 1.0,
      fat_multiplier: 1.0,
      description: 'Behoud van huidige lichaamscompositie',
      color: 'text-blue-400'
    }
  };

  // Standaard profiel: Man 40 jaar, 100kg, 190cm, Matig actief
  const getStandardProfile = (fitnessGoal: 'droogtrainen' | 'spiermassa' | 'onderhoud' = 'spiermassa', isCarnivore: boolean = false) => {
    const standardWeight = 100; // kg - standaard man profiel
    const standardAge = 40; // jaar
    const standardHeight = 190; // cm
    
    // Rick's gewenste eiwit factoren:
    // - Normale plannen: 2.2x gewicht  
    // - Carnivoor plannen: 3.0x gewicht
    const proteinFactor = isCarnivore ? 3.0 : 2.2;
    const baseProtein = Math.round(standardWeight * proteinFactor);
    
    // Calculate BMR using Mifflin-St Jeor equation for men
    const bmr = 10 * standardWeight + 6.25 * standardHeight - 5 * standardAge + 5;
    
    // Activity multiplier for "matig actief" (moderate active: 3-5x sport per week)
    const activityMultiplier = 1.55;
    const tdee = bmr * activityMultiplier;
    
    // Realistische waarden gebaseerd op TDEE berekening
    const configs = {
      droogtrainen: {
        calories: Math.round(tdee * 0.8), // 20% deficit voor droogtrainen
        protein: baseProtein, // 2.2x of 3.0x gewicht afhankelijk van plan type
        carbs: isCarnivore ? 5 : 80,      // Zeer laag voor carnivoor, matig voor normaal
        description: 'Vetverlies met behoud van spiermassa'
      },
      spiermassa: {
        calories: Math.round(tdee * 1.15), // 15% surplus voor groei
        protein: baseProtein, // 2.2x of 3.0x gewicht afhankelijk van plan type
        carbs: isCarnivore ? 10 : 350,     // Minimaal voor carnivoor, hoog voor normaal
        description: 'Spiergroei en krachttoename'
      },
      onderhoud: {
        calories: Math.round(tdee), // Onderhoudscalorieën = TDEE
        protein: baseProtein, // 2.2x of 3.0x gewicht afhankelijk van plan type
        carbs: isCarnivore ? 8 : 200,     // Laag voor carnivoor, gematigde voor normaal
        description: 'Behoud van lichaamscompositie'
      }
    };
    
    // Voor carnivoor plannen: gebruik 45/5/50% verdeling voor droogtrainen en onderhoud
    if (isCarnivore && (fitnessGoal === 'droogtrainen' || fitnessGoal === 'onderhoud')) {
      const targetCalories = configs[fitnessGoal].calories;
      
      // 45% eiwit, 5% koolhydraten, 50% vet
      const protein45 = Math.round((targetCalories * 0.45) / 4); // 45% van calories
      const carbs5 = Math.round((targetCalories * 0.05) / 4);    // 5% van calories
      const fat50 = Math.round((targetCalories * 0.50) / 9);     // 50% van calories
      
      (configs[fitnessGoal] as any) = {
        ...configs[fitnessGoal],
        protein: protein45,
        carbs: carbs5,
        fat: fat50
      };
    }
    
    const config = configs[fitnessGoal];
    
    // Voor carnivoor plannen met custom macro verdeling, gebruik de voorgedefinieerde fat waarde
    let calculatedFat;
    if (isCarnivore && (fitnessGoal === 'droogtrainen' || fitnessGoal === 'onderhoud') && (config as any).fat) {
      calculatedFat = (config as any).fat; // Gebruik de 50% fat berekening
    } else {
      // Standaard berekening voor andere plannen
    const remainingCalories = config.calories - (config.protein * 4) - (config.carbs * 4);
      calculatedFat = Math.max(Math.round(remainingCalories / 9), 60); // Minimum 60g vet
    }
    
    return {
      target_calories: config.calories,
      target_protein: config.protein,
      target_carbs: config.carbs,
      target_fat: calculatedFat,
      description: config.description
    };
  };

  const [formData, setFormData] = useState<NutritionPlan>({
    name: '',
    ...getStandardProfile('spiermassa', false), // Default naar spiermassa, niet-carnivoor
    duration_weeks: 12,
    difficulty: 'beginner',
    goal: 'spiermassa',
    fitness_goal: 'spiermassa',
    is_featured: false,
    is_public: true,
    daily_plans: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('maandag');
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [editingMealType, setEditingMealType] = useState<string>('');

  // Convert weekly_plan format to daily_plans format
  const convertWeeklyPlanToDailyPlans = (weeklyPlan: any): DailyPlan[] => {
    console.log('🔄 Converting weekly_plan to daily_plans format');
    console.log('🔍 Available days in weeklyPlan:', Object.keys(weeklyPlan));
    
    const days = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
    const dayNames = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
    
    return days.map((dayKey, index) => {
      const dayData = weeklyPlan[dayKey];
      console.log(`📅 Processing ${dayKey}:`, !!dayData);
      
      if (!dayData) {
        console.log(`⚠️ No data for ${dayKey}, using defaults`);
        return {
          day: dayKey,
          theme: 'Training Dag',
          focus: 'protein',
          meals: {
            ontbijt: { name: 'Ontbijt', calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [], ingredients: [] },
            snack1: { name: 'Ochtend Snack', calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [], ingredients: [] },
            lunch: { name: 'Lunch', calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [], ingredients: [] },
            snack2: { name: 'Middag Snack', calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [], ingredients: [] },
            diner: { name: 'Diner', calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [], ingredients: [] },
            avondsnack: { name: 'Avond Snack', calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [], ingredients: [] }
          }
        };
      }
      
      // Convert meal data from new weekly_plan format
      const convertMeal = (mealData: any, defaultName: string) => {
        if (!mealData) {
          return {
            name: defaultName,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            suggestions: [],
            ingredients: []
          };
        }
        
        // Extract nutrition from the meal data
        const nutrition = mealData.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 };
        
        // Convert ingredients format for PlanBuilder
        const ingredients = (mealData.ingredients || []).map((ing: any) => ({
          name: ing.name,
          amount: ing.amount,
          unit: 'g'
        }));
        
        // Create suggestions format
        const suggestions = ingredients.map((ing: any) => `${ing.name} (${ing.amount}g)`);
        
        return {
          name: defaultName,
          calories: Math.round(nutrition.calories || 0),
          protein: Math.round((nutrition.protein || 0) * 10) / 10,
          carbs: Math.round((nutrition.carbs || 0) * 10) / 10,
          fat: Math.round((nutrition.fat || 0) * 10) / 10,
          suggestions,
          ingredients
        };
      };
      
      return {
        day: dayKey,
        theme: `${dayNames[index]} Plan`,
        focus: 'protein',
        meals: {
          ontbijt: convertMeal(dayData.ontbijt, 'Carnivoor Ontbijt'),
          snack1: convertMeal(dayData.ochtend_snack, 'Ochtend Snack'),
          lunch: convertMeal(dayData.lunch, 'Carnivoor Lunch'),
          snack2: convertMeal(dayData.lunch_snack, 'Middag Snack'),
          diner: convertMeal(dayData.diner, 'Carnivoor Diner'),
          avondsnack: convertMeal(dayData.avond_snack, 'Avond Snack')
        }
      };
    });
  };

  // Initialize form data when plan changes
  useEffect(() => {
    if (plan) {
      console.log('📝 PlanBuilder: Loading plan for editing:', plan.name);
      console.log('🔍 PlanBuilder: Full plan object:', plan);
      console.log('🍽️ PlanBuilder: Plan meals data:', (plan as any).meals);
      
      // Determine fitness goal from plan name
      const fitnessGoal = plan.name?.toLowerCase().includes('droogtrainen') ? 'droogtrainen' :
                         plan.name?.toLowerCase().includes('spiermassa') ? 'spiermassa' : 'onderhoud';
      
      // Check if we have existing daily_plans or need to generate from meals data
      let existingDailyPlans = plan.daily_plans;
      
      if (!existingDailyPlans && (plan as any).meals && (plan as any).meals.weekly_plan) {
        console.log('📊 PlanBuilder: Found weekly_plan in plan meals, converting to daily_plans');
        console.log('📅 PlanBuilder: Weekly plan data:', (plan as any).meals.weekly_plan);
        console.log('🔍 PlanBuilder: Monday ingredients before conversion:', (plan as any).meals.weekly_plan.monday?.ontbijt);
        existingDailyPlans = convertWeeklyPlanToDailyPlans((plan as any).meals.weekly_plan);
        console.log('✅ PlanBuilder: Converted to daily_plans:', existingDailyPlans);
        console.log('🔍 PlanBuilder: Monday ontbijt after conversion:', existingDailyPlans[0]?.meals?.ontbijt);
      } else if (!existingDailyPlans) {
        console.log('📋 PlanBuilder: No existing daily_plans, generating defaults');
        existingDailyPlans = generateDefaultDailyPlans();
      } else {
        console.log('✅ PlanBuilder: Using existing daily_plans from plan');
      }
      
      // Get macro targets from database or calculate based on plan type
      const mealTargets = (plan as any).meals;
      const isCarnivore = plan.name?.toLowerCase().includes('carnivoor') || false;
      const standardProfile = getStandardProfile(fitnessGoal, isCarnivore);
      
      setFormData({
        id: plan.id,
        name: plan.name || '',
        description: plan.description || '',
        target_calories: mealTargets?.target_calories || plan.target_calories || standardProfile.target_calories,
        target_protein: mealTargets?.target_protein || plan.target_protein || standardProfile.target_protein,
        target_carbs: mealTargets?.target_carbs || plan.target_carbs || standardProfile.target_carbs,
        target_fat: mealTargets?.target_fat || plan.target_fat || standardProfile.target_fat,
        duration_weeks: plan.duration_weeks || 12,
        difficulty: plan.difficulty || 'intermediate',
        goal: plan.goal || fitnessGoal,
        fitness_goal: fitnessGoal,
        is_featured: plan.is_featured || false,
        is_public: plan.is_public !== false,
        daily_plans: existingDailyPlans
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
        difficulty: 'intermediate',
        goal: 'onderhoud',
        fitness_goal: 'onderhoud',
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
          suggestions: getMealSuggestions(formData.name, 'ontbijt', focuses[index]),
          ingredients: []
        },
        snack1: {
          name: `${themes[index]} Snack`,
          calories: Math.round((formData.target_calories || 2200) * 0.10),
          protein: Math.round((formData.target_protein || 165) * 0.10),
          carbs: Math.round((formData.target_carbs || 220) * 0.10),
          fat: Math.round((formData.target_fat || 73) * 0.10),
          suggestions: getMealSuggestions(formData.name, 'snack', focuses[index]),
          ingredients: []
        },
        lunch: {
          name: `${themes[index]} Lunch`,
          calories: Math.round((formData.target_calories || 2200) * 0.30),
          protein: Math.round((formData.target_protein || 165) * 0.30),
          carbs: Math.round((formData.target_carbs || 220) * 0.30),
          fat: Math.round((formData.target_fat || 73) * 0.30),
          suggestions: getMealSuggestions(formData.name, 'lunch', focuses[index]),
          ingredients: []
        },
        snack2: {
          name: `${themes[index]} Snack`,
          calories: Math.round((formData.target_calories || 2200) * 0.10),
          protein: Math.round((formData.target_protein || 165) * 0.10),
          carbs: Math.round((formData.target_carbs || 220) * 0.10),
          fat: Math.round((formData.target_fat || 73) * 0.10),
          suggestions: getMealSuggestions(formData.name, 'snack', focuses[index]),
          ingredients: []
        },
        diner: {
          name: `${themes[index]} Diner`,
          calories: Math.round((formData.target_calories || 2200) * 0.20),
          protein: Math.round((formData.target_protein || 165) * 0.20),
          carbs: Math.round((formData.target_carbs || 220) * 0.20),
          fat: Math.round((formData.target_fat || 73) * 0.20),
          suggestions: getMealSuggestions(formData.name, 'diner', focuses[index]),
          ingredients: []
        },
        avondsnack: {
          name: `${themes[index]} Avond Snack`,
          calories: Math.round((formData.target_calories || 2200) * 0.05),
          protein: Math.round((formData.target_protein || 165) * 0.05),
          carbs: Math.round((formData.target_carbs || 220) * 0.05),
          fat: Math.round((formData.target_fat || 73) * 0.05),
          suggestions: getMealSuggestions(formData.name, 'snack', focuses[index]),
          ingredients: []
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
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      if (field === 'name' && typeof value === 'string') {
        const fitnessGoal = value.toLowerCase().includes('droogtrainen') ? 'droogtrainen' :
                           value.toLowerCase().includes('spiermassa') ? 'spiermassa' : 'onderhoud';
        
        updated.fitness_goal = fitnessGoal;
        updated.goal = fitnessGoal;
        
        // Set macro's based on fitness goal using standard profile
        const isCarnivore = value.toLowerCase().includes('carnivoor');
        const standardProfile = getStandardProfile(fitnessGoal, isCarnivore);
        updated.target_calories = standardProfile.target_calories;
        updated.target_protein = standardProfile.target_protein;
        updated.target_carbs = standardProfile.target_carbs;
        updated.target_fat = standardProfile.target_fat;
      }

      // Auto-calculate macros when calories change, maintaining current ratios
      if (field === 'target_calories' && value) {
        const newCalories = parseInt(value);
        
        if (newCalories > 0) {
          // Check if we have existing macro values to maintain ratios
          const currentProtein = prev.target_protein || 0;
          const currentCarbs = prev.target_carbs || 0;
          const currentFat = prev.target_fat || 0;
          
          // Calculate current total calories from macros (4 cal/g for protein and carbs, 9 cal/g for fat)
          const currentCaloriesFromMacros = (currentProtein * 4) + (currentCarbs * 4) + (currentFat * 9);
          
          // Always use the correct percentages based on plan type, not existing values
          const isCarnivore = prev.name?.toLowerCase().includes('carnivoor') || false;
          const fitnessGoal = prev.fitness_goal || 'onderhoud';
          
          let proteinPercent, carbsPercent, fatPercent;
          
          if (isCarnivore) {
            // Carnivoor: 45% protein, 5% carbs, 50% fat
            proteinPercent = 0.45;
            carbsPercent = 0.05;
            fatPercent = 0.50;
          } else {
            // Normal meal plans based on fitness goal
            switch (fitnessGoal) {
              case 'droogtrainen':
                proteinPercent = 0.40;
                carbsPercent = 0.40;
                fatPercent = 0.20;
                break;
              case 'spiermassa':
                proteinPercent = 0.30;
                carbsPercent = 0.50;
                fatPercent = 0.20;
                break;
              case 'onderhoud':
              default:
                proteinPercent = 0.35;
                carbsPercent = 0.40;
                fatPercent = 0.25;
                break;
            }
          }
          
          // Calculate macros based on correct percentages
          const newProteinCals = newCalories * proteinPercent;
          const newCarbsCals = newCalories * carbsPercent;
          const newFatCals = newCalories * fatPercent;
          
          // Convert back to grams
          updated.target_protein = Math.round(newProteinCals / 4);
          updated.target_carbs = Math.round(newCarbsCals / 4);
          updated.target_fat = Math.round(newFatCals / 9);
          
          console.log('🧮 Auto-calculated macros for', newCalories, 'kcal (correct percentages):', {
            protein: `${updated.target_protein}g (${Math.round(proteinPercent * 100)}%)`,
            carbs: `${updated.target_carbs}g (${Math.round(carbsPercent * 100)}%)`,
            fat: `${updated.target_fat}g (${Math.round(fatPercent * 100)}%)`,
            planType: isCarnivore ? 'Carnivoor' : 'Maaltijdplan normaal',
            fitnessGoal: fitnessGoal
          });
        }
      }
      
      return updated;
    });
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
      console.log('💾 Saving nutrition plan with daily_plans:', formData);
      
      // Transform daily_plans back to weekly_plan structure for database storage
      const weeklyPlan: any = {};
      const dailyTotals: any = {};
      
      // Use Dutch days to match database structure
      const allDays = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
      const dailyPlansMap = new Map();
      
      // Create map of existing daily plans
      formData.daily_plans?.forEach(dayPlan => {
        dailyPlansMap.set(dayPlan.day, dayPlan);
      });
      
      // Process all 7 days, creating empty structure for missing days
      allDays.forEach(dayKey => {
        const dayPlan = dailyPlansMap.get(dayKey) || {
          day: dayKey,
          theme: 'Training Dag',
          focus: 'protein',
          meals: {
            ontbijt: { ingredients: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
            snack1: { ingredients: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
            lunch: { ingredients: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
            snack2: { ingredients: [], calories: 0, protein: 0, carbs: 0, fat: 0 },
            diner: { ingredients: [], calories: 0, protein: 0, carbs: 0, fat: 0 }
          }
        };
        
        // Create meal objects in database format (with ingredients, nutrition, and time)
        const createMealObject = (meal: any, defaultTime: string) => {
          if (!meal || !meal.ingredients || meal.ingredients.length === 0) {
            return {
              time: defaultTime,
              ingredients: [],
              nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
            };
          }
          
          return {
            time: defaultTime,
            ingredients: meal.ingredients.map((ing: any) => ({
              name: ing.name,
              amount: ing.amount
            })),
            nutrition: {
              calories: meal.calories || 0,
              protein: meal.protein || 0,
              carbs: meal.carbs || 0,
              fat: meal.fat || 0
            }
          };
        };
        
        const dayMeals: any = {
          ontbijt: createMealObject(dayPlan.meals.ontbijt, '07:00'),
          lunch: createMealObject(dayPlan.meals.lunch, '12:00'),
          diner: createMealObject(dayPlan.meals.diner, '18:00'),
          snack: createMealObject(dayPlan.meals.snack1, '15:00') // Use snack1 as main snack
        };
        
        // Calculate daily totals
        const totalCalories = (dayPlan.meals.ontbijt?.calories || 0) + 
                             (dayPlan.meals.snack1?.calories || 0) + 
                             (dayPlan.meals.lunch?.calories || 0) + 
                             (dayPlan.meals.snack2?.calories || 0) + 
                             (dayPlan.meals.diner?.calories || 0);
        
        const totalProtein = (dayPlan.meals.ontbijt?.protein || 0) + 
                            (dayPlan.meals.snack1?.protein || 0) + 
                            (dayPlan.meals.lunch?.protein || 0) + 
                            (dayPlan.meals.snack2?.protein || 0) + 
                            (dayPlan.meals.diner?.protein || 0);
        
        const totalCarbs = (dayPlan.meals.ontbijt?.carbs || 0) + 
                          (dayPlan.meals.snack1?.carbs || 0) + 
                          (dayPlan.meals.lunch?.carbs || 0) + 
                          (dayPlan.meals.snack2?.carbs || 0) + 
                          (dayPlan.meals.diner?.carbs || 0);
        
        const totalFat = (dayPlan.meals.ontbijt?.fat || 0) + 
                        (dayPlan.meals.snack1?.fat || 0) + 
                        (dayPlan.meals.lunch?.fat || 0) + 
                        (dayPlan.meals.snack2?.fat || 0) + 
                        (dayPlan.meals.diner?.fat || 0);
        
        dayMeals.dailyTotals = {
          calories: Math.round(totalCalories),
          protein: Math.round(totalProtein * 10) / 10,
          carbs: Math.round(totalCarbs * 10) / 10,
          fat: Math.round(totalFat * 10) / 10
        };
        
        weeklyPlan[dayKey] = dayMeals;
        dailyTotals[dayKey] = dayMeals.dailyTotals;
      });
      
      // Calculate weekly averages
      const daysCount = Object.keys(dailyTotals).length || 7;
      const weeklyAverages = {
        calories: Math.round((Object.values(dailyTotals) as any[]).reduce((sum: number, day: any) => sum + day.calories, 0) / daysCount),
        protein: Math.round(((Object.values(dailyTotals) as any[]).reduce((sum: number, day: any) => sum + day.protein, 0) / daysCount) * 10) / 10,
        carbs: Math.round(((Object.values(dailyTotals) as any[]).reduce((sum: number, day: any) => sum + day.carbs, 0) / daysCount) * 10) / 10,
        fat: Math.round(((Object.values(dailyTotals) as any[]).reduce((sum: number, day: any) => sum + day.fat, 0) / daysCount) * 10) / 10
      };
      
      // Prepare final form data - send only essential data to avoid conflicts
      const finalFormData = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        target_calories: formData.target_calories,
        target_protein: formData.target_protein,
        target_carbs: formData.target_carbs,
        target_fat: formData.target_fat,
        goal: formData.goal,
        fitness_goal: formData.fitness_goal,
        difficulty: formData.difficulty,
        duration_weeks: formData.duration_weeks,
        daily_plans: formData.daily_plans,
        updated_at: new Date().toISOString()
      };
      
      console.log('🔄 Sending plan data:', finalFormData);
      console.log('📊 Daily plans count:', finalFormData.daily_plans?.length || 0);
      
      await onSave(finalFormData);
      onClose();
    } catch (error) {
      console.error('❌ Error saving plan:', error);
      alert('Fout bij opslaan van plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMeal = (mealType: string) => {
    console.log('🍽️ Editing meal:', mealType, 'for day:', selectedDay);
    
    // Get current meal data for editing
    const currentDay = getCurrentDayPlan();
    const currentMeal = currentDay?.meals?.[mealType as keyof typeof currentDay.meals];
    
    console.log('📊 Current meal data:', currentMeal);
    console.log('🧩 Current meal ingredients structure:', currentMeal?.ingredients);
    console.log('🧩 Current meal suggestions structure:', (currentMeal as any)?.suggestions);
    
    setEditingMealType(mealType);
    setEditingMeal(currentMeal || null);
    setIsMealModalOpen(true);
  };

  const handleSaveMeal = async (meal: any) => {
    console.log('💾 Saving meal:', meal);
    console.log('📅 Selected day:', selectedDay);
    console.log('🍽️ Meal type:', editingMealType);
    console.log('🧩 Saving meal ingredients with units:', meal.ingredients?.map(ing => ({name: ing.name, amount: ing.amount, unit: ing.unit})));
    
    // Update the form data with the new meal
    setFormData(prev => ({
      ...prev,
      daily_plans: prev.daily_plans?.map(dailyPlan => {
        if (dailyPlan.day === selectedDay) {
          // Convert ingredients to suggestions format for display
          const suggestions = meal.ingredients?.map((ing: any) => 
            `${ing.name} (${ing.amount}${ing.unit})`
          ) || [];
          
          return {
            ...dailyPlan,
            meals: {
              ...dailyPlan.meals,
              [editingMealType]: {
                name: meal.name,
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fat: meal.fat,
                ingredients: meal.ingredients,
                suggestions: suggestions
              }
            }
          };
        }
        return dailyPlan;
      })
    }));
    
    // Close the modal
    setIsMealModalOpen(false);
    setEditingMeal(null);
    setEditingMealType('');
    
    console.log('✅ Meal saved successfully');
  };

  const handleDeleteMeal = async (mealId: string) => {
    // Remove the meal from the current day
    setFormData(prev => ({
      ...prev,
      daily_plans: prev.daily_plans?.map(dailyPlan => {
        if (dailyPlan.day === selectedDay) {
          return {
            ...dailyPlan,
            meals: {
              ...dailyPlan.meals,
              [editingMealType]: {
                name: '',
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                ingredients: []
              }
            }
          };
        }
        return dailyPlan;
      })
    }));
  };

  const calculateMacroPercentages = () => {
    const total = (formData.target_protein || 0) * 4 + (formData.target_carbs || 0) * 4 + (formData.target_fat || 0) * 9;
    const proteinPct = total > 0 ? Math.round(((formData.target_protein || 0) * 4 / total) * 100) : 0;
    const carbsPct = total > 0 ? Math.round(((formData.target_carbs || 0) * 4 / total) * 100) : 0;
    const fatPct = total > 0 ? Math.round(((formData.target_fat || 0) * 9 / total) * 100) : 0;
    
    return { proteinPct, carbsPct, fatPct };
  };

  const { proteinPct, carbsPct, fatPct } = calculateMacroPercentages();
  
  // Debug logging for macro percentages
  console.log('🧮 PlanBuilder current formData macros:', {
    calories: formData.target_calories,
    protein: formData.target_protein,
    carbs: formData.target_carbs,
    fat: formData.target_fat,
    percentages: { proteinPct, carbsPct, fatPct }
  });
  
  // Extra debugging for carnivore plans
  if (formData.name?.toLowerCase().includes('carnivoor')) {
    const isCarnivoreExpected = (proteinPct === 45 && carbsPct === 5 && fatPct === 50);
    console.log(`🥩 Carnivore plan "${formData.name}" percentages ${isCarnivoreExpected ? '✅ CORRECT' : '❌ WRONG'}:`, {
      expected: '45% protein, 5% carbs, 50% fat',
      actual: `${proteinPct}% protein, ${carbsPct}% carbs, ${fatPct}% fat`
    });
  }

  const getCurrentDayPlan = () => {
    return formData.daily_plans?.find(dp => dp.day === selectedDay);
  };

  const dayNames = {
    maandag: 'Maandag',
    dinsdag: 'Dinsdag', 
    woensdag: 'Woensdag',
    donderdag: 'Donderdag',
    vrijdag: 'Vrijdag',
    zaterdag: 'Zaterdag',
    zondag: 'Zondag'
  };

  const dayThemes = {
    maandag: 'Dag 1',
    dinsdag: 'Dag 2', 
    woensdag: 'Dag 3',
    donderdag: 'Dag 4',
    vrijdag: 'Dag 5',
    zaterdag: 'Dag 6',
    zondag: 'Dag 7'
  };

  // Helper function to get nutrition values from database
  const getEstimatedNutrition = (ingredientName: string) => {
    // First try to find exact match in database
    const dbIngredient = localFoodItems.find(item => 
      item.name.toLowerCase().trim() === ingredientName.toLowerCase().trim()
    );
    
    if (dbIngredient) {
      console.log('🎯 Found exact match for', ingredientName, ':', dbIngredient);
      return {
        calories: dbIngredient.calories_per_100g || 0,
        protein: dbIngredient.protein_per_100g || 0,
        carbs: dbIngredient.carbs_per_100g || 0,
        fat: dbIngredient.fat_per_100g || 0,
        unit_type: dbIngredient.unit_type || 'per_100g'
      };
    }
    
    // Try partial matches in database
    const partialMatch = localFoodItems.find(item => 
      item.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
      ingredientName.toLowerCase().includes(item.name.toLowerCase())
    );
    
    if (partialMatch) {
      return {
        calories: partialMatch.calories_per_100g || 0,
        protein: partialMatch.protein_per_100g || 0,
        carbs: partialMatch.carbs_per_100g || 0,
        fat: partialMatch.fat_per_100g || 0,
        unit_type: partialMatch.unit_type || 'per_100g'
      };
    }
    
    // Fallback to hardcoded values for common ingredients
    const nutritionData: { [key: string]: { calories: number; protein: number; carbs: number; fat: number } } = {
      'ribeye steak': { calories: 291, protein: 25.0, carbs: 0, fat: 21.0 },
      'ribeye': { calories: 291, protein: 25.0, carbs: 0, fat: 21.0 },
      'runderlever': { calories: 135, protein: 20.4, carbs: 3.9, fat: 3.6 },
      'lamskotelet': { calories: 294, protein: 25.6, carbs: 0, fat: 20.9 },
      'kipfilet': { calories: 165, protein: 31.0, carbs: 0, fat: 3.6 },
      'spek': { calories: 541, protein: 37.0, carbs: 1.4, fat: 42.0 },
      'gerookte zalm': { calories: 142, protein: 25.4, carbs: 0, fat: 4.3 },
      'zalm': { calories: 208, protein: 20.4, carbs: 0, fat: 13.4 },
      'goudse kaas': { calories: 356, protein: 25.0, carbs: 2.2, fat: 27.4 },
      'roomboter': { calories: 717, protein: 0.9, carbs: 0.7, fat: 81.1 },
      'boter': { calories: 717, protein: 0.9, carbs: 0.7, fat: 81.1 },
      'eieren': { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0 },
      'olijfolie': { calories: 884, protein: 0, carbs: 0, fat: 100.0 },
      'honing': { calories: 304, protein: 0.3, carbs: 82.4, fat: 0 },
      'biefstuk': { calories: 271, protein: 26.0, carbs: 0, fat: 18.0 },
    };
    
    const normalizedName = ingredientName.toLowerCase().trim();
    
    // Try exact match in fallback data
    if (nutritionData[normalizedName]) {
      return { ...nutritionData[normalizedName], unit_type: 'per_100g' };
    }
    
    // Try partial matches in fallback data
    for (const [key, value] of Object.entries(nutritionData)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return { ...value, unit_type: 'per_100g' };
      }
    }
    
    // Final fallback for unknown ingredients
    return { calories: 250, protein: 20.0, carbs: 0, fat: 18.0, unit_type: 'per_100g' };
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
                    placeholder="Bijv. Carnivoor - Droogtrainen, Carnivoor - Spiermassa..."
                  />
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
              {/* Fitness Goal Display - Read Only */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-3">
                  Fitness Doel (Automatisch bepaald op basis van plan naam)
                </label>
                <div className="p-4 rounded-lg bg-[#232D1A] border border-[#3A4D23]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {formData.fitness_goal === 'droogtrainen' ? '🔥' : 
                       formData.fitness_goal === 'spiermassa' ? '💪' : '⚖️'}
                    </span>
                    <div className="font-semibold text-[#8BAE5A] capitalize">
                      {formData.fitness_goal || 'Onderhoud'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {formData.fitness_goal === 'droogtrainen' ? 'Vetverlies met behoud van spiermassa' :
                     formData.fitness_goal === 'spiermassa' ? 'Spiergroei en krachttoename' :
                     'Behoud van lichaamscompositie'}
                  </div>
                  <div className="text-xs mt-2 text-[#B6C948]">
                    💡 Het fitness doel wordt automatisch bepaald op basis van de plan naam (Carnivoor - Droogtrainen/Onderhoud/Spiermassa)
                  </div>
                </div>
              </div>

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
                <div className="text-sm mt-1 space-y-1">
                {formData.fitness_goal && (
                    <div className="text-[#8BAE5A]">
                    💡 Calorieën zijn vooraf ingesteld op basis van het fitness doel
                  </div>
                )}
                  <div className="text-[#B6C948]">
                    🧮 Macro's worden automatisch herberekend bij aanpassing (verhoudingen behouden)
                  </div>
                </div>
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

              {/* Standard Profile Info */}
              <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23] mb-6">
                <h4 className="text-[#8BAE5A] font-semibold mb-3 flex items-center">
                  👤 Standaard Profiel Basis
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-[#181F17] rounded-lg p-3 border border-[#3A4D23]">
                    <div className="text-[#8BAE5A] font-semibold text-lg">40</div>
                    <div className="text-[#B6C948] text-sm">Jaar</div>
                  </div>
                  <div className="bg-[#181F17] rounded-lg p-3 border border-[#3A4D23]">
                    <div className="text-[#8BAE5A] font-semibold text-lg">100kg</div>
                    <div className="text-[#B6C948] text-sm">Gewicht</div>
                  </div>
                  <div className="bg-[#181F17] rounded-lg p-3 border border-[#3A4D23]">
                    <div className="text-[#8BAE5A] font-semibold text-lg">190cm</div>
                    <div className="text-[#B6C948] text-sm">Lengte</div>
                  </div>
                  <div className="bg-[#181F17] rounded-lg p-3 border border-[#3A4D23]">
                    <div className="text-[#8BAE5A] font-semibold text-sm">Matig Actief</div>
                    <div className="text-[#B6C948] text-xs">3-5x per week sporten</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-[#B6C948] space-y-2">
                  <div className="text-center font-semibold text-[#8BAE5A]">🧮 Formule Berekening</div>
                  <div className="bg-[#0F150E] rounded p-3 border border-[#2A3520] space-y-1">
                    <div><span className="text-[#8BAE5A]">BMR (Mannen):</span> 10 × gewicht + 6.25 × lengte - 5 × leeftijd + 5</div>
                    <div><span className="text-[#8BAE5A]">BMR:</span> 10 × 100 + 6.25 × 190 - 5 × 40 + 5 = <span className="text-[#B6C948] font-semibold">1,993 kcal</span></div>
                    <div><span className="text-[#8BAE5A]">TDEE:</span> BMR × 1.55 (Matig Actief) = 1,993 × 1.55 = <span className="text-[#B6C948] font-semibold">3,089 kcal</span></div>
                    <div className="border-t border-[#3A4D23] pt-2 mt-2">
                      <div><span className="text-[#8BAE5A]">🔥 Droogtrainen:</span> 3,089 × 0.8 = <span className="text-yellow-400 font-semibold">2,471 kcal</span> (-20%)</div>
                      <div><span className="text-[#8BAE5A]">⚖️ Onderhoud:</span> 3,089 × 1.0 = <span className="text-green-400 font-semibold">3,089 kcal</span> (0%)</div>
                      <div><span className="text-[#8BAE5A]">💪 Spiermassa:</span> 3,089 × 1.15 = <span className="text-blue-400 font-semibold">3,552 kcal</span> (+15%)</div>
                    </div>
                  </div>
                  <div className="text-center">
                    📊 Alle voedingsplannen zijn gebaseerd op dit standaard profiel voor consistentie
                  </div>
                </div>
              </div>

              {/* Macro Summary */}
              <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[#8BAE5A] font-semibold">Macro Overzicht</h4>
                  <button
                    onClick={() => {
                      const isCarnivore = formData.name?.toLowerCase().includes('carnivoor') || false;
                      const standardProfile = getStandardProfile(formData.fitness_goal || 'spiermassa', isCarnivore);
                      setFormData(prev => ({
                        ...prev,
                        target_calories: standardProfile.target_calories,
                        target_protein: standardProfile.target_protein,
                        target_carbs: standardProfile.target_carbs,
                        target_fat: standardProfile.target_fat
                      }));
                    }}
                    className="px-3 py-1 bg-[#8BAE5A] text-[#181F17] rounded text-sm font-semibold hover:bg-[#B6C948] transition-colors"
                  >
                    ⚖️ Herbereken
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-[#8BAE5A] font-semibold">{formData.target_protein}g</div>
                    <div className="text-[#B6C948] text-sm">Protein</div>
                    <div className="text-xs text-gray-400 mt-1">{proteinPct}%</div>
                  </div>
                  <div>
                    <div className="text-[#8BAE5A] font-semibold">{formData.target_carbs}g</div>
                    <div className="text-[#B6C948] text-sm">Carbs</div>
                    <div className="text-xs text-gray-400 mt-1">{carbsPct}%</div>
                  </div>
                  <div>
                    <div className="text-[#8BAE5A] font-semibold">{formData.target_fat}g</div>
                    <div className="text-[#B6C948] text-sm">Fat</div>
                    <div className="text-xs text-gray-400 mt-1">{fatPct}%</div>
                  </div>
                </div>
                <div className="mt-4 text-center bg-[#232D1A] rounded-lg p-3 border border-[#3A4D23]">
                  <div className="text-[#8BAE5A] font-bold text-xl">{formData.target_calories}</div>
                  <div className="text-[#B6C948] text-sm">Calorieën per dag</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Gebaseerd op {formData.fitness_goal === 'droogtrainen' ? 'vetverlies' : 
                                 formData.fitness_goal === 'spiermassa' ? 'spiergroei' : 'onderhoud'} doel
                  </div>
                </div>
                <div className="mt-3 text-xs text-[#B6C948] text-center">
                  💡 Klik "Herbereken" om terug te gaan naar de standaard waarden voor dit fitness doel
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
                        {dayNames[selectedDay as keyof typeof dayNames]} - {dayThemes[selectedDay as keyof typeof dayThemes]}
                      </h3>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <span className="px-2 py-1 bg-[#8BAE5A] text-[#181F17] rounded text-xs font-semibold">
                        {formData.name || 'Voedingsplan'}
                      </span>
                      {formData.fitness_goal && (
                        <span className="px-2 py-1 bg-[#B6C948] text-[#181F17] rounded text-xs font-semibold">
                          {formData.fitness_goal === 'droogtrainen' ? '🔥 Droogtrainen' : 
                           formData.fitness_goal === 'spiermassa' ? '💪 Spiermassa' : '⚖️ Onderhoud'}
                        </span>
                      )}
                    </div>

                    {/* Daily Totals Summary */}
                    {(() => {
                      const currentDay = getCurrentDayPlan();
                      const meals = currentDay?.meals;
                      
                      const totalCalories = (meals?.ontbijt?.calories || 0) + 
                                          (meals?.snack1?.calories || 0) + 
                                          (meals?.lunch?.calories || 0) + 
                                          (meals?.snack2?.calories || 0) + 
                                          (meals?.diner?.calories || 0);
                      
                      const totalProtein = (meals?.ontbijt?.protein || 0) + 
                                         (meals?.snack1?.protein || 0) + 
                                         (meals?.lunch?.protein || 0) + 
                                         (meals?.snack2?.protein || 0) + 
                                         (meals?.diner?.protein || 0);
                      
                      const totalCarbs = (meals?.ontbijt?.carbs || 0) + 
                                       (meals?.snack1?.carbs || 0) + 
                                       (meals?.lunch?.carbs || 0) + 
                                       (meals?.snack2?.carbs || 0) + 
                                       (meals?.diner?.carbs || 0);
                      
                      const totalFat = (meals?.ontbijt?.fat || 0) + 
                                     (meals?.snack1?.fat || 0) + 
                                     (meals?.lunch?.fat || 0) + 
                                     (meals?.snack2?.fat || 0) + 
                                     (meals?.diner?.fat || 0);

                      // Get target values from actual plan or fallback to standard profile
                      const isCarnivore = formData.name?.toLowerCase().includes('carnivoor') || false;
                      const standardProfile = getStandardProfile(formData.fitness_goal || 'spiermassa', isCarnivore);
                      const targetCalories = formData.target_calories || standardProfile.target_calories;
                      const caloriesDifference = Math.round(totalCalories - targetCalories);
                      const percentageOfTarget = targetCalories > 0 ? Math.round((totalCalories / targetCalories) * 100) : 0;
                      
                      return (
                        <div className="space-y-4">
                          {/* Daily Totals */}
                          <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
                            <h4 className="text-[#8BAE5A] font-semibold mb-3 flex items-center gap-2">
                              📊 Dagelijkse Totalen - {dayNames[selectedDay as keyof typeof dayNames]}
                            </h4>
                            <div className="grid grid-cols-4 gap-3">
                              <div className="bg-[#181F17] p-3 rounded border border-[#3A4D23] text-center">
                                <div className="text-[#8BAE5A] font-bold text-lg">{Math.round(totalCalories)}</div>
                                <div className="text-[#B6C948] text-xs">Calorieën</div>
                              </div>
                              <div className="bg-[#181F17] p-3 rounded border border-[#3A4D23] text-center">
                                <div className="text-[#8BAE5A] font-bold text-lg">{Math.round(totalProtein * 10) / 10}g</div>
                                <div className="text-[#B6C948] text-xs">Protein</div>
                              </div>
                              <div className="bg-[#181F17] p-3 rounded border border-[#3A4D23] text-center">
                                <div className="text-[#8BAE5A] font-bold text-lg">{Math.round(totalCarbs * 10) / 10}g</div>
                                <div className="text-[#B6C948] text-xs">Carbs</div>
                              </div>
                              <div className="bg-[#181F17] p-3 rounded border border-[#3A4D23] text-center">
                                <div className="text-[#8BAE5A] font-bold text-lg">{Math.round(totalFat * 10) / 10}g</div>
                                <div className="text-[#B6C948] text-xs">Fat</div>
                              </div>
                            </div>
                          </div>

                          {/* Standard Profile Comparison */}
                          <div className="bg-[#232D1A] rounded-lg p-4 border border-[#3A4D23]">
                            <h4 className="text-[#8BAE5A] font-semibold mb-3 flex items-center gap-2">
                              👤 Standaard Profiel Vergelijking
                            </h4>
                            
                            {/* Target Values Row */}
                            <div className="mb-4">
                              <div className="text-[#B6C948] text-sm mb-2 text-center">
                                🎯 Dagelijkse Doelen ({formData.fitness_goal === 'droogtrainen' ? 'Droogtrainen' : 
                                                      formData.fitness_goal === 'spiermassa' ? 'Spiermassa' : 'Onderhoud'})
                              </div>
                              <div className="grid grid-cols-4 gap-3">
                                <div className="bg-[#181F17] rounded-lg p-3 border border-[#3A4D23] text-center">
                                  <div className="text-[#8BAE5A] font-bold text-lg">{formData.target_calories || targetCalories}</div>
                                  <div className="text-[#B6C948] text-xs">Calorieën</div>
                                </div>
                                <div className="bg-[#181F17] rounded-lg p-3 border border-[#3A4D23] text-center">
                                  <div className="text-[#8BAE5A] font-bold text-lg">{formData.target_protein || standardProfile.target_protein}g</div>
                                  <div className="text-[#B6C948] text-xs">Protein</div>
                                </div>
                                <div className="bg-[#181F17] rounded-lg p-3 border border-[#3A4D23] text-center">
                                  <div className="text-[#8BAE5A] font-bold text-lg">{formData.target_carbs || standardProfile.target_carbs}g</div>
                                  <div className="text-[#B6C948] text-xs">Carbs</div>
                                </div>
                                <div className="bg-[#181F17] rounded-lg p-3 border border-[#3A4D23] text-center">
                                  <div className="text-[#8BAE5A] font-bold text-lg">{formData.target_fat || standardProfile.target_fat}g</div>
                                  <div className="text-[#B6C948] text-xs">Fat</div>
                                </div>
                              </div>
                            </div>

                            {/* Difference Values Row */}
                            <div className="mb-3">
                              <div className="text-[#B6C948] text-sm mb-2 text-center">
                                📊 Verschil (Plan vs Doel)
                              </div>
                              <div className="grid grid-cols-4 gap-3">
                                <div className="bg-[#181F17] rounded-lg p-3 border border-[#3A4D23] text-center">
                                  <div className={`font-bold text-lg ${
                                    Math.abs(caloriesDifference) > 200 ? 'text-red-400' : 
                                    caloriesDifference >= 0 ? 'text-[#8BAE5A]' : 'text-orange-400'
                                  }`}>
                                    {caloriesDifference >= 0 ? '+' : ''}{caloriesDifference}
                                  </div>
                                  <div className="text-[#B6C948] text-xs">Calorieën</div>
                                  <div className="text-xs text-gray-400">{percentageOfTarget}%</div>
                                  {Math.abs(caloriesDifference) > 200 && (
                                    <div className="text-xs text-red-400 mt-1 font-semibold">⚠️ BUITEN MARGE</div>
                                  )}
                                </div>
                                <div className="bg-[#181F17] rounded-lg p-3 border border-[#3A4D23] text-center">
                                  {(() => {
                                    const targetProtein = formData.target_protein || standardProfile.target_protein;
                                    const proteinDiff = totalProtein - targetProtein;
                                    return (
                                      <>
                                        <div className={`font-bold text-lg ${
                                          Math.abs(proteinDiff) > (targetProtein * 0.2) ? 'text-red-400' : 
                                          proteinDiff >= 0 ? 'text-[#8BAE5A]' : 'text-orange-400'
                                        }`}>
                                          {proteinDiff >= 0 ? '+' : ''}{Math.round(proteinDiff * 10) / 10}g
                                        </div>
                                        <div className="text-[#B6C948] text-xs">Protein</div>
                                        <div className="text-xs text-gray-400">
                                          {targetProtein > 0 ? Math.round((totalProtein / targetProtein) * 100) : 0}%
                                        </div>
                                        {Math.abs(proteinDiff) > (targetProtein * 0.2) && (
                                          <div className="text-xs text-red-400 mt-1 font-semibold">⚠️ BUITEN MARGE</div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                                <div className="bg-[#181F17] rounded-lg p-3 border border-[#3A4D23] text-center">
                                  {(() => {
                                    const targetCarbs = formData.target_carbs || standardProfile.target_carbs;
                                    const carbsDiff = totalCarbs - targetCarbs;
                                    return (
                                      <>
                                        <div className={`font-bold text-lg ${
                                          Math.abs(carbsDiff) > Math.max(5, targetCarbs * 0.5) ? 'text-red-400' : 
                                          carbsDiff >= 0 ? 'text-[#8BAE5A]' : 'text-orange-400'
                                        }`}>
                                          {carbsDiff >= 0 ? '+' : ''}{Math.round(carbsDiff * 10) / 10}g
                                        </div>
                                        <div className="text-[#B6C948] text-xs">Carbs</div>
                                        <div className="text-xs text-gray-400">
                                          {targetCarbs > 0 ? Math.round((totalCarbs / targetCarbs) * 100) : 0}%
                                        </div>
                                        {Math.abs(carbsDiff) > Math.max(5, targetCarbs * 0.5) && (
                                          <div className="text-xs text-red-400 mt-1 font-semibold">⚠️ BUITEN MARGE</div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                                <div className="bg-[#181F17] rounded-lg p-3 border border-[#3A4D23] text-center">
                                  {(() => {
                                    const targetFat = formData.target_fat || standardProfile.target_fat;
                                    const fatDiff = totalFat - targetFat;
                                    return (
                                      <>
                                        <div className={`font-bold text-lg ${
                                          Math.abs(fatDiff) > (targetFat * 0.25) ? 'text-red-400' : 
                                          fatDiff >= 0 ? 'text-[#8BAE5A]' : 'text-orange-400'
                                        }`}>
                                          {fatDiff >= 0 ? '+' : ''}{Math.round(fatDiff * 10) / 10}g
                                        </div>
                                        <div className="text-[#B6C948] text-xs">Fat</div>
                                        <div className="text-xs text-gray-400">
                                          {targetFat > 0 ? Math.round((totalFat / targetFat) * 100) : 0}%
                                        </div>
                                        {Math.abs(fatDiff) > (targetFat * 0.25) && (
                                          <div className="text-xs text-red-400 mt-1 font-semibold">⚠️ BUITEN MARGE</div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>

                            <div className="text-xs text-center">
                              <div className="text-[#B6C948] mb-1">
                                💡 Profiel: 40 jaar, 100kg, 190cm, Matig actief
                              </div>
                              <div className={`font-semibold ${
                                Math.abs(caloriesDifference) > 200 ? 'text-red-400' : 
                                Math.abs(caloriesDifference) <= 200 ? 'text-[#8BAE5A]' : 'text-orange-400'
                              }`}>
                                {Math.abs(caloriesDifference) > 200 ? 
                                  `⚠️ WAARSCHUWING: ${Math.abs(caloriesDifference)} kcal buiten veilige marge (±200 kcal)` :
                                  Math.abs(caloriesDifference) <= 200 ? 
                                    '✅ Plan zit binnen veilige marge (±200 kcal)' : 
                                    'Plan zit dicht bij doel'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Meals - Now showing actual ingredients from database */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {['ontbijt', 'snack1', 'lunch', 'snack2', 'diner', 'avondsnack'].map((mealType) => {
                      const currentDay = getCurrentDayPlan();
                      const meal = currentDay?.meals?.[mealType as keyof typeof currentDay.meals];
                      const mealNames = {
                        ontbijt: 'Ontbijt',
                        snack1: 'Ochtend Snack',
                        lunch: 'Lunch', 
                        snack2: 'Middag Snack',
                        diner: 'Diner',
                        avondsnack: 'Avond Snack'
                      };
                      
                      // Get suggestions (which are the actual ingredients from database)
                      const ingredients = meal?.suggestions || [];
                      const hasIngredients = ingredients.length > 0;
                      
                      return (
                        <div key={mealType} className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[#8BAE5A] font-semibold flex items-center gap-2">
                              {mealType === 'ontbijt' && '🍳'}
                              {mealType === 'snack1' && '🥜'}
                              {mealType === 'lunch' && '🥩'}
                              {mealType === 'snack2' && '🧀'}
                              {mealType === 'diner' && '🍽️'}
                              {mealType === 'avondsnack' && '🌙'}
                              {mealNames[mealType as keyof typeof mealNames]}
                            </h4>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditMeal(mealType)}
                                className="text-[#8BAE5A] hover:text-[#7A9D4B] text-sm"
                                title="Maaltijd bewerken"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {/* Meal name and nutrition */}
                            <div className="text-[#B6C948] font-medium">
                              {meal?.name || `${mealNames[mealType as keyof typeof mealNames]} - Nog niet ingesteld`}
                            </div>
                            
                            {/* Nutrition info */}
                            <div className="bg-[#0F150E] rounded-lg p-3 border border-[#2A3520]">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-[#8BAE5A]">
                                  <span className="font-semibold">{meal?.calories || 0}</span> cal
                                </div>
                                <div className="text-[#8BAE5A]">
                                  <span className="font-semibold">{meal?.protein || 0}g</span> protein
                                </div>
                                <div className="text-[#8BAE5A]">
                                  <span className="font-semibold">{meal?.carbs || 0}g</span> carbs
                                </div>
                                <div className="text-[#8BAE5A]">
                                  <span className="font-semibold">{meal?.fat || 0}g</span> fat
                                </div>
                              </div>
                            </div>
                            
                            {/* Ingredients Table */}
                            {meal?.ingredients && meal.ingredients.length > 0 ? (
                              <div className="space-y-2">
                                <div className="text-xs text-[#8BAE5A] font-semibold">Ingrediënten:</div>
                                <div className="bg-[#0F150E] rounded-lg border border-[#2A3520] overflow-hidden">
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="bg-[#232D1A] border-b border-[#3A4D23]">
                                          <th className="text-left p-2 text-[#8BAE5A] font-semibold">Ingrediënt</th>
                                          <th className="text-center p-2 text-[#8BAE5A] font-semibold">Hoeveelheid</th>
                                          <th className="text-center p-2 text-[#8BAE5A] font-semibold">Kcal</th>
                                          <th className="text-center p-2 text-[#8BAE5A] font-semibold">Protein</th>
                                          <th className="text-center p-2 text-[#8BAE5A] font-semibold">Carbs</th>
                                          <th className="text-center p-2 text-[#8BAE5A] font-semibold">Fat</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {meal.ingredients.map((ingredient: any, idx: number) => {
                                          // Apply legacy unit correction for display
                                          const correctedIngredient = (() => {
                                            // Check if this ingredient exists in database with different unit_type
                                            const dbIngredient = localFoodItems.find(db => 
                                              db.name.toLowerCase() === ingredient.name.toLowerCase()
                                            );

                                            if (dbIngredient) {
                                              const correctUnit = dbIngredient.unit_type === 'per_piece' ? 'stuk' :
                                                 dbIngredient.unit_type === 'per_handful' ? 'handje' :
                                                 dbIngredient.unit_type === 'per_30g' ? 'g' : 'g';
                                              // ALWAYS keep original amount - never reset to 1
                                              const correctAmount = ingredient.amount;

                                              // Check if current ingredient has wrong unit for per_piece items
                                              if (dbIngredient.unit_type === 'per_piece' && ingredient.unit === 'g') {
                                                console.log(`🔧 Daily Plans: Correcting ${ingredient.name} from ${ingredient.amount}g to ${correctAmount}${correctUnit}`);
                                                return {
                                                  ...ingredient,
                                                  amount: correctAmount,
                                                  unit: correctUnit
                                                };
                                              }
                                              
                                              // Check if current ingredient has wrong unit for per_handful items
                                              if (dbIngredient.unit_type === 'per_handful' && ingredient.unit === 'g') {
                                                console.log(`🔧 Daily Plans: Correcting ${ingredient.name} from ${ingredient.amount}g to ${correctAmount}${correctUnit}`);
                                                return {
                                                  ...ingredient,
                                                  amount: correctAmount,
                                                  unit: correctUnit
                                                };
                                              }
                                            }

                                            return ingredient;
                                          })();

                                          // Calculate nutrition values for this ingredient based on unit type
                                          const amount = correctedIngredient.amount || 0;
                                          const unit = correctedIngredient.unit || 'g';
                                          
                                          // Get nutrition data from database
                                          const estimatedNutrition = getEstimatedNutrition(ingredient.name);
                                          
                                          let calories, protein, carbs, fat;
                                          
                                          // Calculate nutrition based on unit_type from database
                                          if (estimatedNutrition.unit_type === 'per_piece' && unit === 'stuk') {
                                            // For per_piece items, database values are already per piece
                                            // ALWAYS use fresh database values, ignore stored meal values
                                            calories = Math.round(estimatedNutrition.calories * amount);
                                            protein = Math.round(estimatedNutrition.protein * amount * 10) / 10;
                                            carbs = Math.round(estimatedNutrition.carbs * amount * 10) / 10;
                                            fat = Math.round(estimatedNutrition.fat * amount * 10) / 10;
                                            
                                            console.log(`🥚 Per piece calculation for ${ingredient.name}:`, {
                                              originalAmount: ingredient.amount,
                                              correctedAmount: amount,
                                              unit: unit,
                                              dbValues: estimatedNutrition,
                                              calculated: { calories, protein, carbs, fat }
                                            });
                                          } else if (estimatedNutrition.unit_type === 'per_handful' && unit === 'handje') {
                                            // For per_handful items, database values are per handful
                                            calories = Math.round(estimatedNutrition.calories * amount);
                                            protein = Math.round(estimatedNutrition.protein * amount * 10) / 10;
                                            carbs = Math.round(estimatedNutrition.carbs * amount * 10) / 10;
                                            fat = Math.round(estimatedNutrition.fat * amount * 10) / 10;
                                          } else if (estimatedNutrition.unit_type === 'per_30g') {
                                            // For per_30g items, database values are per 30g
                                            const multiplier = amount / 30;
                                            calories = Math.round(estimatedNutrition.calories * multiplier);
                                            protein = Math.round(estimatedNutrition.protein * multiplier * 10) / 10;
                                            carbs = Math.round(estimatedNutrition.carbs * multiplier * 10) / 10;
                                            fat = Math.round(estimatedNutrition.fat * multiplier * 10) / 10;
                                          } else {
                                            // For per_100g items (default), calculate based on grams
                                            let gramAmount = amount;
                                            if (unit === 'kg') gramAmount = amount * 1000;
                                            else if (unit === 'handje') gramAmount = amount * 25;
                                            else if (unit === 'stuk') {
                                              // Use database unit conversion if available
                                              const dbIngredient = localFoodItems.find(item => 
                                                item.name.toLowerCase().trim() === ingredient.name.toLowerCase().trim()
                                              );
                                              if (dbIngredient?.unit_type === 'per_piece') {
                                                // This shouldn't happen, but fallback to estimation
                                                gramAmount = amount * 50; // default piece weight
                                              } else {
                                                gramAmount = amount; // assume grams
                                              }
                                            }
                                            
                                            const multiplier = gramAmount / 100;
                                            calories = Math.round(estimatedNutrition.calories * multiplier);
                                            protein = Math.round(estimatedNutrition.protein * multiplier * 10) / 10;
                                            carbs = Math.round(estimatedNutrition.carbs * multiplier * 10) / 10;
                                            fat = Math.round(estimatedNutrition.fat * multiplier * 10) / 10;
                                          }
                                          
                                          return (
                                            <tr key={idx} className="border-b border-[#3A4D23] hover:bg-[#232D1A]/50">
                                              <td className="p-2 text-[#B6C948]">{correctedIngredient.name}</td>
                                              <td className="p-2 text-center text-[#8BAE5A]">{correctedIngredient.amount}{correctedIngredient.unit || 'g'}</td>
                                              <td className="p-2 text-center text-[#8BAE5A]">{calories}</td>
                                              <td className="p-2 text-center text-[#8BAE5A]">{protein}g</td>
                                              <td className="p-2 text-center text-[#8BAE5A]">{carbs}g</td>
                                              <td className="p-2 text-center text-[#8BAE5A]">{fat}g</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                    </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 italic p-3 bg-[#0F150E] rounded border border-[#2A3520]">
                                💡 Geen ingrediënten gevonden - klik op bewerken om toe te voegen
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Daily Nutrition Summary */}
                  <div className="bg-[#181F17] rounded-lg p-4 border border-[#3A4D23]">
                    <h4 className="text-[#8BAE5A] font-semibold mb-3 flex items-center gap-2">
                      📊 Dagelijkse Voeding Overzicht - {dayNames[selectedDay as keyof typeof dayNames]}
                    </h4>
                    
                    {(() => {
                      const currentDay = getCurrentDayPlan();
                      const meals = currentDay?.meals;
                      
                      const totalCalories = (meals?.ontbijt?.calories || 0) + 
                                          (meals?.snack1?.calories || 0) + 
                                          (meals?.lunch?.calories || 0) + 
                                          (meals?.snack2?.calories || 0) + 
                                          (meals?.diner?.calories || 0);
                      
                      const totalProtein = (meals?.ontbijt?.protein || 0) + 
                                         (meals?.snack1?.protein || 0) + 
                                         (meals?.lunch?.protein || 0) + 
                                         (meals?.snack2?.protein || 0) + 
                                         (meals?.diner?.protein || 0);
                      
                      const totalCarbs = (meals?.ontbijt?.carbs || 0) + 
                                       (meals?.snack1?.carbs || 0) + 
                                       (meals?.lunch?.carbs || 0) + 
                                       (meals?.snack2?.carbs || 0) + 
                                       (meals?.diner?.carbs || 0);
                      
                      const totalFat = (meals?.ontbijt?.fat || 0) + 
                                     (meals?.snack1?.fat || 0) + 
                                     (meals?.lunch?.fat || 0) + 
                                     (meals?.snack2?.fat || 0) + 
                                     (meals?.diner?.fat || 0);
                      
                      return (
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div className="bg-[#0F150E] p-3 rounded border border-[#2A3520]">
                            <div className="text-[#8BAE5A] font-bold text-lg">{Math.round(totalCalories)}</div>
                            <div className="text-[#B6C948] text-sm">Totaal Calorieën</div>
                          </div>
                          <div className="bg-[#0F150E] p-3 rounded border border-[#2A3520]">
                            <div className="text-[#8BAE5A] font-bold text-lg">{Math.round(totalProtein * 10) / 10}g</div>
                            <div className="text-[#B6C948] text-sm">Totaal Protein</div>
                          </div>
                          <div className="bg-[#0F150E] p-3 rounded border border-[#2A3520]">
                            <div className="text-[#8BAE5A] font-bold text-lg">{Math.round(totalCarbs * 10) / 10}g</div>
                            <div className="text-[#B6C948] text-sm">Totaal Carbs</div>
                          </div>
                          <div className="bg-[#0F150E] p-3 rounded border border-[#2A3520]">
                            <div className="text-[#8BAE5A] font-bold text-lg">{Math.round(totalFat * 10) / 10}g</div>
                            <div className="text-[#B6C948] text-sm">Totaal Fat</div>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="mt-3 text-center">
                      <div className="text-[#8BAE5A] text-sm font-semibold">
                        🥩 100% Carnivor Animal Based Compliant
                      </div>
                      <div className="text-[#B6C948] text-xs">
                        Orgaanvlees • Vette vis • Dierlijke vetten • Beperkte koolhydraten
                      </div>
                      <div className="text-[#B6C948] text-xs mt-2">
                        💡 Tip: Wijzig dagelijkse calorieën om portie groottes automatisch aan te passen
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

                  {/* Meal Edit Modal */}
            <MealEditModal
              isOpen={isMealModalOpen}
              onClose={() => setIsMealModalOpen(false)}
              meal={editingMeal}
              mealType={editingMealType}
              onSave={handleSaveMeal}
              onDelete={handleDeleteMeal}
              baseCalories={formData.target_calories}
              planType={plan?.name}
            />
    </div>
  );
} 
