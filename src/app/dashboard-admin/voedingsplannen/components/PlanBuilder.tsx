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
  onSave: (plan: NutritionPlan) => void;
}

export default function PlanBuilder({ isOpen, onClose, plan, onSave }: PlanBuilderProps) {
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

  // Standaard profiel: Man 30 jaar, 90kg, 192cm
  const getStandardProfile = (fitnessGoal: 'droogtrainen' | 'spiermassa' | 'onderhoud' = 'spiermassa') => {
    // Realistische waarden gebaseerd op Top Tier Men standaarden
    const configs = {
      droogtrainen: {
        calories: 1900, // Agressief deficit voor droogtrainen
        protein: 180,   // Hoog eiwit voor spierretentie
        carbs: 20,      // Zeer laag voor carnivoor/keto
        description: 'Vetverlies met behoud van spiermassa'
      },
      spiermassa: {
        calories: 2800, // Surplus voor groei
        protein: 180,   // Hoog eiwit voor groei
        carbs: 300,     // Meer carbs voor energie
        description: 'Spiergroei en krachttoename'
      },
      onderhoud: {
        calories: 2400, // Onderhoudscalorieën
        protein: 160,   // Matig eiwit
        carbs: 200,     // Gematigde carbs
        description: 'Behoud van lichaamscompositie'
      }
    };
    
    const config = configs[fitnessGoal];
    const remainingCalories = config.calories - (config.protein * 4) - (config.carbs * 4);
    const fat = Math.round(remainingCalories / 9);
    
    return {
      target_calories: config.calories,
      target_protein: config.protein,
      target_carbs: config.carbs,
      target_fat: Math.max(fat, 60), // Minimum 60g vet
      description: config.description
    };
  };

  const [formData, setFormData] = useState<NutritionPlan>({
    name: '',
    ...getStandardProfile('spiermassa'), // Default naar spiermassa
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
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [editingMealType, setEditingMealType] = useState<string>('');

  // Convert weekly_plan format to daily_plans format
  const convertWeeklyPlanToDailyPlans = (weeklyPlan: any): DailyPlan[] => {
    console.log('🔄 Converting weekly_plan to daily_plans format');
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
    
    return days.map((dayKey, index) => {
      const dayData = weeklyPlan[dayKey];
      console.log(`📅 Processing ${dayKey}:`, dayData);
      
      if (!dayData) {
        console.log(`⚠️ No data for ${dayKey}, using defaults`);
        return {
          day: dayKey,
          theme: 'Training Dag',
          focus: 'protein',
          meals: {
            ontbijt: { name: 'Ontbijt', calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
            snack1: { name: 'Ochtend Snack', calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
            lunch: { name: 'Lunch', calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
            snack2: { name: 'Middag Snack', calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] },
            diner: { name: 'Diner', calories: 0, protein: 0, carbs: 0, fat: 0, suggestions: [] }
          }
        };
      }
      
      // Calculate nutrition for each meal type
      const calculateMealNutrition = (ingredients: any[]) => {
        if (!ingredients || !Array.isArray(ingredients)) {
          return { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        
        ingredients.forEach(ingredient => {
          totalCalories += ingredient.calories || 0;
          totalProtein += ingredient.protein || 0;
          totalCarbs += ingredient.carbs || 0;
          totalFat += ingredient.fat || 0;
        });
        
        return {
          calories: Math.round(totalCalories),
          protein: Math.round(totalProtein * 10) / 10,
          carbs: Math.round(totalCarbs * 10) / 10,
          fat: Math.round(totalFat * 10) / 10
        };
      };
      
      // Convert ingredients to suggestions format
      const convertToSuggestions = (ingredients: any[]) => {
        if (!ingredients || !Array.isArray(ingredients)) return [];
        
        return ingredients.map(ingredient => `${ingredient.name} (${ingredient.amount}${ingredient.unit})`);
      };
      
      const ontbijtNutrition = calculateMealNutrition(dayData.ontbijt || []);
      const lunchNutrition = calculateMealNutrition(dayData.lunch || []);
      const dinerNutrition = calculateMealNutrition(dayData.diner || []);
      const ochtendSnackNutrition = calculateMealNutrition(dayData.ochtend_snack || []);
      const lunchSnackNutrition = calculateMealNutrition(dayData.lunch_snack || []);
      
      return {
        day: dayKey,
        theme: `${dayNames[index]} Plan`,
        focus: 'protein',
        meals: {
          ontbijt: {
            name: dayData.ontbijt?.length > 0 ? 'Carnivoor Ontbijt' : 'Ontbijt',
            ...ontbijtNutrition,
            suggestions: convertToSuggestions(dayData.ontbijt || [])
          },
          snack1: {
            name: dayData.ochtend_snack?.length > 0 ? 'Ochtend Snack' : 'Ochtend Snack',
            ...ochtendSnackNutrition,
            suggestions: convertToSuggestions(dayData.ochtend_snack || [])
          },
          lunch: {
            name: dayData.lunch?.length > 0 ? 'Carnivoor Lunch' : 'Lunch',
            ...lunchNutrition,
            suggestions: convertToSuggestions(dayData.lunch || [])
          },
          snack2: {
            name: dayData.lunch_snack?.length > 0 ? 'Lunch Snack' : 'Middag Snack',
            ...lunchSnackNutrition,
            suggestions: convertToSuggestions(dayData.lunch_snack || [])
          },
          diner: {
            name: dayData.diner?.length > 0 ? 'Carnivoor Diner' : 'Diner',
            ...dinerNutrition,
            suggestions: convertToSuggestions(dayData.diner || [])
          }
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
        existingDailyPlans = convertWeeklyPlanToDailyPlans((plan as any).meals.weekly_plan);
        console.log('✅ PlanBuilder: Converted to daily_plans:', existingDailyPlans);
      } else if (!existingDailyPlans) {
        console.log('📋 PlanBuilder: No existing daily_plans, generating defaults');
        existingDailyPlans = generateDefaultDailyPlans();
      } else {
        console.log('✅ PlanBuilder: Using existing daily_plans from plan');
      }
      
      // Get macro targets from database or calculate based on plan type
      const mealTargets = (plan as any).meals;
      const standardProfile = getStandardProfile(fitnessGoal);
      
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
        const standardProfile = getStandardProfile(fitnessGoal);
        updated.target_calories = standardProfile.target_calories;
        updated.target_protein = standardProfile.target_protein;
        updated.target_carbs = standardProfile.target_carbs;
        updated.target_fat = standardProfile.target_fat;
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
      
      formData.daily_plans?.forEach(dayPlan => {
        const dayKey = dayPlan.day;
        
        // Map meal types from UI to database format
        const dayMeals: any = {};
        
        if (dayPlan.meals.ontbijt?.ingredients && dayPlan.meals.ontbijt.ingredients.length > 0) {
          dayMeals.ontbijt = dayPlan.meals.ontbijt.ingredients;
        }
        if (dayPlan.meals.snack1?.ingredients && dayPlan.meals.snack1.ingredients.length > 0) {
          dayMeals.ochtend_snack = dayPlan.meals.snack1.ingredients;
        }
        if (dayPlan.meals.lunch?.ingredients && dayPlan.meals.lunch.ingredients.length > 0) {
          dayMeals.lunch = dayPlan.meals.lunch.ingredients;
        }
        if (dayPlan.meals.snack2?.ingredients && dayPlan.meals.snack2.ingredients.length > 0) {
          dayMeals.lunch_snack = dayPlan.meals.snack2.ingredients;
        }
        if (dayPlan.meals.diner?.ingredients && dayPlan.meals.diner.ingredients.length > 0) {
          dayMeals.diner = dayPlan.meals.diner.ingredients;
        }
        
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
      
      // Prepare final form data with converted structure
      const finalFormData = {
        ...formData,
        daily_plans: formData.daily_plans // Keep daily_plans for API processing
        // Remove weekly_plan and weekly_averages from top level - they will be handled by the API
      };
      
      console.log('🔄 Converted weekly plan:', weeklyPlan);
      console.log('📊 Weekly averages:', weeklyAverages);
      
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
    
    setEditingMealType(mealType);
    setEditingMeal(currentMeal || null);
    setIsMealModalOpen(true);
  };

  const handleSaveMeal = async (meal: any) => {
    console.log('💾 Saving meal:', meal);
    console.log('📅 Selected day:', selectedDay);
    console.log('🍽️ Meal type:', editingMealType);
    
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

  const dayThemes = {
    monday: 'Dag 1',
    tuesday: 'Dag 2', 
    wednesday: 'Dag 3',
    thursday: 'Dag 4',
    friday: 'Dag 5',
    saturday: 'Dag 6',
    sunday: 'Dag 7'
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
                {formData.fitness_goal && (
                  <div className="text-sm mt-1 text-[#8BAE5A]">
                    💡 Calorieën zijn vooraf ingesteld op basis van het fitness doel
                  </div>
                )}
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
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[#8BAE5A] font-semibold">Macro Overzicht</h4>
                  <button
                    onClick={() => {
                      const standardProfile = getStandardProfile(formData.fitness_goal || 'spiermassa');
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
                  </div>
                  <div>
                    <div className="text-[#8BAE5A] font-semibold">{formData.target_carbs}g</div>
                    <div className="text-[#B6C948] text-sm">Carbs</div>
                  </div>
                  <div>
                    <div className="text-[#8BAE5A] font-semibold">{formData.target_fat}g</div>
                    <div className="text-[#B6C948] text-sm">Fat</div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="text-[#8BAE5A] font-semibold">{formData.target_calories} calorieën</div>
                  <div className="text-[#B6C948] text-sm">Totaal per dag</div>
                </div>
                <div className="mt-3 text-xs text-[#B6C948] text-center">
                  💡 Standaard profiel: Man 30 jaar, 90kg, 192cm - Klik "Herbereken" om naar standaard waarden terug te gaan
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
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-[#8BAE5A] text-[#181F17] rounded text-xs font-semibold">
                        Carnivor Animal Based
                      </span>
                    </div>
                  </div>

                  {/* Meals - Now showing actual ingredients from database */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {['ontbijt', 'snack1', 'lunch', 'snack2', 'diner'].map((mealType) => {
                      const currentDay = getCurrentDayPlan();
                      const meal = currentDay?.meals?.[mealType as keyof typeof currentDay.meals];
                      const mealNames = {
                        ontbijt: 'Ontbijt',
                        snack1: 'Ochtend Snack',
                        lunch: 'Lunch', 
                        snack2: 'Middag Snack',
                        diner: 'Diner'
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
                            
                            {/* Ingredients from database */}
                            {hasIngredients ? (
                              <div className="space-y-2">
                                <div className="text-xs text-[#8BAE5A] font-semibold">Ingrediënten:</div>
                                <div className="space-y-1">
                                  {ingredients.map((ingredient: string, idx: number) => (
                                    <div key={idx} className="text-xs text-[#B6C948] flex items-center gap-2">
                                      <span className="w-1 h-1 bg-[#8BAE5A] rounded-full"></span>
                                      {ingredient}
                                    </div>
                                  ))}
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