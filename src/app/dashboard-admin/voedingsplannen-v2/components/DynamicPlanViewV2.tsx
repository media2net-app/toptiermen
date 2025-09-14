"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  PencilIcon,
  PlusIcon,
  BugAntIcon,
  ScaleIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface DynamicPlanViewV2Props {
  planId: string;
  planName: string;
  onBack: () => void;
}

// Exact match with backend API structure
interface MealIngredient {
  name: string;
  unit: string;
  amount: number;
  originalAmount?: number;
  adjustmentFactor?: number;
  adjustmentReason?: string;
}

interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  name: string;
  ingredients: MealIngredient[];
  nutrition: MealNutrition;
}

interface DayPlan {
  ontbijt: Meal;
  snack1: Meal;
  lunch: Meal;
  snack2: Meal;
  diner: Meal;
  avondsnack: Meal;
  dailyTotals: MealNutrition;
}

interface UserProfile {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  age: number;
  weight: number;
  height: number;
  goal: string;
  activityLevel?: string;
}

interface ScalingInfo {
  scaleFactor: number;
  originalTotals: MealNutrition;
  finalTotals: MealNutrition;
  targetTotals: MealNutrition;
  planPercentages: {
    protein: number;
    carbs: number;
    fat: number;
  };
  weightScaleFactor: number;
  userWeight: number;
  planBaseWeight: number;
  macroAdjustments: {
    protein: number;
    carbs: number;
    fat: number;
  };
  debugInfo: any;
}

interface PlanData {
  planId: string;
  planName: string;
  userProfile: UserProfile | null;
  scalingInfo: ScalingInfo | null;
  weekPlan: Record<string, DayPlan>;
  weeklyAverages: WeeklyAverages;
  generatedAt: string;
}

interface WeeklyAverages {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const DAYS_NL = {
  maandag: 'Maandag',
  dinsdag: 'Dinsdag', 
  woensdag: 'Woensdag',
  donderdag: 'Donderdag',
  vrijdag: 'Vrijdag',
  zaterdag: 'Zaterdag',
  zondag: 'Zondag'
};

const MEAL_TYPES_NL = {
  ontbijt: 'Ontbijt',
  snack1: 'Ochtend Snack',
  lunch: 'Lunch',
  snack2: 'Lunch Snack',
  diner: 'Diner',
  avondsnack: 'Avond Snack'
};

export default function DynamicPlanViewV2({ planId, planName, onBack }: DynamicPlanViewV2Props) {
  const { user } = useSupabaseAuth();
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [originalPlanData, setOriginalPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [originalLoading, setOriginalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState('maandag');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showOriginalValues, setShowOriginalValues] = useState(false);
  
  // Weight input for testing
  const [testWeight, setTestWeight] = useState(100);
  const [useSmartScaling, setUseSmartScaling] = useState(true);

  const fetchDynamicPlan = async (weight?: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use smart scaling API with weight parameter
      const apiEndpoint = `/api/nutrition-plan-smart-scaling?planId=${planId}&userId=${user?.id}&weight=${weight || 100}`;
      
      console.log('🧠 V2 Using API endpoint:', apiEndpoint);
      
      const response = await fetch(apiEndpoint);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dynamic plan');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Handle smart scaling response
        const planData = {
          planId: planId,
          planName: planName,
          weekPlan: data.plan,
          scalingInfo: data.scalingInfo,
          userProfile: data.userProfile,
          weeklyAverages: {
            calories: data.scalingInfo?.finalTotals?.calories || 0,
            protein: data.scalingInfo?.finalTotals?.protein || 0,
            carbs: data.scalingInfo?.finalTotals?.carbs || 0,
            fat: data.scalingInfo?.finalTotals?.fat || 0
          },
          generatedAt: new Date().toISOString()
        };
        
        console.log('🧠 V2 Smart scaling applied:', data.scalingInfo);
        setPlanData(planData);
      } else {
        throw new Error(data.error || 'Failed to load dynamic plan');
      }
      
    } catch (error) {
      console.error('❌ Error fetching dynamic plan:', error);
      setError(`Kon voedingsplan niet laden: ${error.message}`);
      toast.error('Fout bij laden voedingsplan');
    } finally {
      setLoading(false);
    }
  };

  const fetchOriginalPlan = async () => {
    try {
      setOriginalLoading(true);
      console.log('📋 Fetching original plan data for comparison...');
      const response = await fetch(`/api/nutrition-plan-original?planId=${planId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch original plan');
      }
      
      const data = await response.json();
      console.log('✅ Original plan data loaded:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching original plan:', error);
      return null;
    } finally {
      setOriginalLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDynamicPlan(testWeight);
      fetchOriginalPlan().then(data => {
        console.log('📋 Setting original plan data:', data);
        setOriginalPlanData(data);
      });
    }
  }, [user, planId, testWeight]);

  const getDayTotal = (day: string) => {
    if (!planData?.weekPlan?.[day]) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return planData.weekPlan[day].dailyTotals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  };

  const getOriginalDayTotal = (day: string) => {
    if (!originalPlanData?.weekPlan?.[day]) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return originalPlanData.weekPlan[day].dailyTotals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  };

  const getMealData = (day: string, mealType: string) => {
    if (!planData?.weekPlan?.[day]) return null;
    return planData.weekPlan[day][mealType] || null;
  };

  const getOriginalMealData = (day: string, mealType: string) => {
    if (!originalPlanData?.weekPlan?.[day]) return null;
    return originalPlanData.weekPlan[day][mealType] || null;
  };

  const handleWeightChange = (newWeight: number) => {
    setTestWeight(newWeight);
    fetchDynamicPlan(newWeight);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p>Laden van voedingsplan V2...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Fout bij Laden</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-[#8BAE5A] text-white px-6 py-2 rounded-lg hover:bg-[#7A9E4A] transition-colors"
          >
            Terug naar Overzicht
          </button>
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Geen Data</h1>
          <p className="text-gray-400">Er zijn geen plan gegevens beschikbaar.</p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('🔍 Render debug:', {
    originalLoading,
    originalPlanData: !!originalPlanData,
    showOriginalValues,
    planData: !!planData
  });

  return (
    <div className="min-h-screen bg-[#0F1419]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f17] to-[#2d3a23] border-b border-[#3a4d23] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 bg-[#181F17] border border-[#3A4D23] rounded-lg hover:border-[#8BAE5A] transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-[#8BAE5A] to-[#A8D65A] rounded-lg">
                  <RocketLaunchIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{planName} V2</h1>
                  <p className="text-gray-300 text-sm">Slimme schalingsfactor geactiveerd</p>
                </div>
              </div>
            </div>

            {/* V2 Controls */}
            <div className="flex items-center gap-4">
              {/* Weight Input */}
              <div className="flex items-center gap-2">
                <ScaleIcon className="w-5 h-5 text-[#8BAE5A]" />
                <label className="text-white text-sm font-medium">Gewicht (kg):</label>
                <input
                  type="number"
                  value={testWeight}
                  onChange={(e) => handleWeightChange(parseInt(e.target.value) || 100)}
                  className="w-20 px-2 py-1 bg-[#181F17] border border-[#3A4D23] rounded text-white text-sm"
                  min="50"
                  max="150"
                />
              </div>

              {/* Smart Scaling Toggle */}
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-[#8BAE5A]" />
                <label className="text-white text-sm font-medium">Slimme Scaling:</label>
                <button
                  onClick={() => setUseSmartScaling(!useSmartScaling)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    useSmartScaling 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {useSmartScaling ? 'AAN' : 'UIT'}
                </button>
              </div>

              {/* Debug Toggle */}
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className={`p-2 border rounded-lg transition-colors ${
                  showDebugInfo 
                    ? 'bg-[#8BAE5A] border-[#8BAE5A]' 
                    : 'bg-[#181F17] border-[#3A4D23] hover:border-[#8BAE5A]'
                }`}
              >
                <BugAntIcon className="w-5 h-5 text-white" />
              </button>

              {/* Original Values Toggle */}
              <button
                onClick={() => setShowOriginalValues(!showOriginalValues)}
                disabled={originalLoading || !originalPlanData}
                className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  originalLoading || !originalPlanData
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : showOriginalValues 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {originalLoading ? 'Laden...' : showOriginalValues ? 'Origineel AAN' : 'Origineel UIT'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scaling Information */}
      {planData.scalingInfo && (
        <div className="bg-[#181F17] border-b border-[#3A4D23]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#8BAE5A]">
                  {planData.scalingInfo.scaleFactor.toFixed(2)}x
                </div>
                <div className="text-sm text-gray-400">Schalingsfactor</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {planData.scalingInfo.userWeight}kg
                </div>
                <div className="text-sm text-gray-400">Gebruiker Gewicht</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {planData.scalingInfo.planBaseWeight}kg
                </div>
                <div className="text-sm text-gray-400">Plan Basis</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-[#8BAE5A]">
                  {Math.round(planData.scalingInfo.weightScaleFactor * 100) / 100}x
                </div>
                <div className="text-sm text-gray-400">Gewicht Factor</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Day Selection */}
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Selecteer een dag</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
            {Object.entries(DAYS_NL).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedDay(key)}
                className={`p-3 rounded-lg font-medium transition-all ${
                  selectedDay === key
                    ? 'bg-[#8BAE5A] text-white'
                    : 'bg-[#232D1A] text-gray-300 hover:bg-[#3A4D23]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Totals */}
        <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Dagelijkse Totaal - {DAYS_NL[selectedDay]}</h3>
            {showOriginalValues && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-[#8BAE5A] rounded"></div>
                <span className="text-gray-300">Gescaled</span>
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-gray-300">Origineel</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8BAE5A]">
                {Math.round(getDayTotal(selectedDay).calories)}
              </div>
              {showOriginalValues && (
                <div className="text-lg font-semibold text-orange-500">
                  {Math.round(getOriginalDayTotal(selectedDay).calories)}
                </div>
              )}
              <div className="text-sm text-gray-400">Calorieën</div>
              {planData.scalingInfo && (
                <div className="text-xs text-gray-500 mt-1">
                  Doel: {Math.round(planData.scalingInfo.targetTotals.calories)} kcal
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8BAE5A]">
                {getDayTotal(selectedDay).protein.toFixed(1)}g
              </div>
              {showOriginalValues && (
                <div className="text-lg font-semibold text-orange-500">
                  {getOriginalDayTotal(selectedDay).protein.toFixed(1)}g
                </div>
              )}
              <div className="text-sm text-gray-400">Eiwit</div>
              {planData.scalingInfo && (
                <div className="text-xs text-gray-500 mt-1">
                  Doel: {Math.round(planData.scalingInfo.targetTotals.protein)}g
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8BAE5A]">
                {getDayTotal(selectedDay).carbs.toFixed(1)}g
              </div>
              {showOriginalValues && (
                <div className="text-lg font-semibold text-orange-500">
                  {getOriginalDayTotal(selectedDay).carbs.toFixed(1)}g
                </div>
              )}
              <div className="text-sm text-gray-400">Koolhydraten</div>
              {planData.scalingInfo && (
                <div className="text-xs text-gray-500 mt-1">
                  Doel: {Math.round(planData.scalingInfo.targetTotals.carbs)}g
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8BAE5A]">
                {getDayTotal(selectedDay).fat.toFixed(1)}g
              </div>
              {showOriginalValues && (
                <div className="text-lg font-semibold text-orange-500">
                  {getOriginalDayTotal(selectedDay).fat.toFixed(1)}g
                </div>
              )}
              <div className="text-sm text-gray-400">Vet</div>
              {planData.scalingInfo && (
                <div className="text-xs text-gray-500 mt-1">
                  Doel: {Math.round(planData.scalingInfo.targetTotals.fat)}g
                </div>
              )}
            </div>
          </div>

          {/* Progress Bars */}
          {planData.scalingInfo && (
            <div className="mt-8 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Calorieën</span>
                  <span className="text-white">
                    {Math.round(getDayTotal(selectedDay).calories)} / {Math.round(planData.scalingInfo.targetTotals.calories)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (getDayTotal(selectedDay).calories / planData.scalingInfo.targetTotals.calories) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Eiwit</span>
                  <span className="text-white">
                    {getDayTotal(selectedDay).protein.toFixed(1)}g / {Math.round(planData.scalingInfo.targetTotals.protein)}g
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (getDayTotal(selectedDay).protein / planData.scalingInfo.targetTotals.protein) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Koolhydraten</span>
                  <span className="text-white">
                    {getDayTotal(selectedDay).carbs.toFixed(1)}g / {Math.round(planData.scalingInfo.targetTotals.carbs)}g
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (getDayTotal(selectedDay).carbs / planData.scalingInfo.targetTotals.carbs) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Vet</span>
                  <span className="text-white">
                    {getDayTotal(selectedDay).fat.toFixed(1)}g / {Math.round(planData.scalingInfo.targetTotals.fat)}g
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (getDayTotal(selectedDay).fat / planData.scalingInfo.targetTotals.fat) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Meals */}
        <div className="space-y-6">
          {Object.entries(MEAL_TYPES_NL).map(([mealType, mealName]) => {
            const meal = getMealData(selectedDay, mealType);
            if (!meal) return null;

            return (
              <div key={mealType} className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{mealName}</h3>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#8BAE5A]">
                      {Math.round(meal.nutrition.calories)} kcal
                    </div>
                    <div className="text-sm text-gray-400">
                      {meal.nutrition.protein.toFixed(1)}g E • {meal.nutrition.carbs.toFixed(1)}g K • {meal.nutrition.fat.toFixed(1)}g V
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-3">Ingrediënten</h4>
                    <div className="space-y-2">
                      {meal.ingredients.map((ingredient, index) => {
                        const originalMeal = getOriginalMealData(selectedDay, mealType);
                        const originalIngredient = originalMeal?.ingredients?.[index];
                        
                        return (
                          <div key={index} className="flex justify-between items-center p-2 bg-[#232D1A] rounded">
                            <div>
                              <span className="text-white font-medium">{ingredient.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[#8BAE5A]">
                                  {ingredient.amount} {ingredient.unit}
                                </span>
                                {showOriginalValues && originalIngredient && (
                                  <span className="text-orange-500 text-sm">
                                    ({originalIngredient.amount} {originalIngredient.unit})
                                  </span>
                                )}
                                {ingredient.adjustmentFactor && (
                                  <span className="text-[#8BAE5A] ml-2 text-sm">
                                    ({ingredient.adjustmentFactor.toFixed(2)}x)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">Macro Verdeling</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Eiwit:</span>
                        <div className="text-right">
                          <span className="text-[#8BAE5A]">{meal.nutrition.protein.toFixed(1)}g</span>
                          {showOriginalValues && getOriginalMealData(selectedDay, mealType) && (
                            <div className="text-orange-500 text-sm">
                              ({getOriginalMealData(selectedDay, mealType)?.nutrition.protein.toFixed(1)}g)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Koolhydraten:</span>
                        <div className="text-right">
                          <span className="text-[#8BAE5A]">{meal.nutrition.carbs.toFixed(1)}g</span>
                          {showOriginalValues && getOriginalMealData(selectedDay, mealType) && (
                            <div className="text-orange-500 text-sm">
                              ({getOriginalMealData(selectedDay, mealType)?.nutrition.carbs.toFixed(1)}g)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Vet:</span>
                        <div className="text-right">
                          <span className="text-[#8BAE5A]">{meal.nutrition.fat.toFixed(1)}g</span>
                          {showOriginalValues && getOriginalMealData(selectedDay, mealType) && (
                            <div className="text-orange-500 text-sm">
                              ({getOriginalMealData(selectedDay, mealType)?.nutrition.fat.toFixed(1)}g)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Debug Info */}
        {showDebugInfo && (
          <div className="mt-8 space-y-6">
            {/* Scaling Info */}
            {planData.scalingInfo && (
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Scaling Informatie</h3>
                <pre className="text-sm text-gray-300 overflow-auto">
                  {JSON.stringify(planData.scalingInfo, null, 2)}
                </pre>
              </div>
            )}

            {/* Original Plan Data */}
            {originalPlanData && (
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Originele Plan Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-[#8BAE5A] mb-2">Plan Info</h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>Plan ID: {originalPlanData.planId}</div>
                      <div>Plan Name: {originalPlanData.planName}</div>
                      <div>Generated: {new Date(originalPlanData.generatedAt).toLocaleString('nl-NL')}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#8BAE5A] mb-2">Dagelijkse Totaal (Origineel)</h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>Calorieën: {Math.round(getOriginalDayTotal(selectedDay).calories)}</div>
                      <div>Eiwit: {getOriginalDayTotal(selectedDay).protein.toFixed(1)}g</div>
                      <div>Koolhydraten: {getOriginalDayTotal(selectedDay).carbs.toFixed(1)}g</div>
                      <div>Vet: {getOriginalDayTotal(selectedDay).fat.toFixed(1)}g</div>
                    </div>
                  </div>
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-[#8BAE5A] font-medium">Volledige Originele Data</summary>
                  <pre className="text-xs text-gray-400 overflow-auto mt-2 max-h-96">
                    {JSON.stringify(originalPlanData, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {/* Comparison Table */}
            {originalPlanData && planData.scalingInfo && (
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Vergelijking Origineel vs Gescaled</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#3A4D23]">
                        <th className="text-left py-2 text-gray-300">Macro</th>
                        <th className="text-right py-2 text-orange-500">Origineel</th>
                        <th className="text-right py-2 text-[#8BAE5A]">Gescaled</th>
                        <th className="text-right py-2 text-white">Doel</th>
                        <th className="text-right py-2 text-gray-300">Verschil %</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#232D1A]">
                        <td className="py-2 text-gray-300">Calorieën</td>
                        <td className="py-2 text-right text-orange-500">{Math.round(getOriginalDayTotal(selectedDay).calories)}</td>
                        <td className="py-2 text-right text-[#8BAE5A]">{Math.round(getDayTotal(selectedDay).calories)}</td>
                        <td className="py-2 text-right text-white">{Math.round(planData.scalingInfo.targetTotals.calories)}</td>
                        <td className="py-2 text-right text-gray-300">
                          {((getDayTotal(selectedDay).calories / planData.scalingInfo.targetTotals.calories) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="border-b border-[#232D1A]">
                        <td className="py-2 text-gray-300">Eiwit</td>
                        <td className="py-2 text-right text-orange-500">{getOriginalDayTotal(selectedDay).protein.toFixed(1)}g</td>
                        <td className="py-2 text-right text-[#8BAE5A]">{getDayTotal(selectedDay).protein.toFixed(1)}g</td>
                        <td className="py-2 text-right text-white">{Math.round(planData.scalingInfo.targetTotals.protein)}g</td>
                        <td className="py-2 text-right text-gray-300">
                          {((getDayTotal(selectedDay).protein / planData.scalingInfo.targetTotals.protein) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="border-b border-[#232D1A]">
                        <td className="py-2 text-gray-300">Koolhydraten</td>
                        <td className="py-2 text-right text-orange-500">{getOriginalDayTotal(selectedDay).carbs.toFixed(1)}g</td>
                        <td className="py-2 text-right text-[#8BAE5A]">{getDayTotal(selectedDay).carbs.toFixed(1)}g</td>
                        <td className="py-2 text-right text-white">{Math.round(planData.scalingInfo.targetTotals.carbs)}g</td>
                        <td className="py-2 text-right text-gray-300">
                          {((getDayTotal(selectedDay).carbs / planData.scalingInfo.targetTotals.carbs) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-300">Vet</td>
                        <td className="py-2 text-right text-orange-500">{getOriginalDayTotal(selectedDay).fat.toFixed(1)}g</td>
                        <td className="py-2 text-right text-[#8BAE5A]">{getDayTotal(selectedDay).fat.toFixed(1)}g</td>
                        <td className="py-2 text-right text-white">{Math.round(planData.scalingInfo.targetTotals.fat)}g</td>
                        <td className="py-2 text-right text-gray-300">
                          {((getDayTotal(selectedDay).fat / planData.scalingInfo.targetTotals.fat) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
