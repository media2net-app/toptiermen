'use client';

import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BookOpenIcon, 
  RocketLaunchIcon, 
  ChartBarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';

interface NutritionPlan {
  id: string | number;
  plan_id?: string;
  name: string;
  description: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  goal: string;
  difficulty: string;
  created_at: string;
}

interface OriginalPlanData {
  id: string;
  plan_id: string;
  name: string;
  description: string;
  meals: {
    weekly_plan: {
      [key: string]: {
        ontbijt: any;
        ochtend_snack: any;
        lunch: any;
        lunch_snack: any;
        diner: any;
      };
    };
  };
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
}

interface SmartScalingInfo {
  userWeight: number;
  baseWeight: number;
  scalingFactor: number;
  adjustedCalories: number;
  adjustedProtein: number;
  adjustedCarbs: number;
  adjustedFat: number;
  originalTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  finalTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function VoedingsplannenV2Page() {
  const { user, isAdmin } = useSupabaseAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);
  const [originalPlanData, setOriginalPlanData] = useState<OriginalPlanData | null>(null);
  const [scalingInfo, setScalingInfo] = useState<SmartScalingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingOriginal, setLoadingOriginal] = useState(false);
  const [loadingScaling, setLoadingScaling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOriginalData, setShowOriginalData] = useState(true);

  // Check if user is specifically chiel@media2net.nl
  const isChiel = user?.email === 'chiel@media2net.nl';

  useEffect(() => {
    // Only allow chiel@media2net.nl access
    if (!isChiel) {
      router.push('/dashboard');
      return;
    }

    fetchPlans();
  }, [isChiel, router]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nutrition-plans');
      
      if (!response.ok) {
        throw new Error('Failed to fetch nutrition plans');
      }
      
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadOriginalPlanData = async (planId: string) => {
    try {
      setLoadingOriginal(true);
      setError(null);
      
      const response = await fetch(`/api/nutrition-plan-original?planId=${planId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load original plan data');
      }
      
      const data = await response.json();
      setOriginalPlanData(data.plan);
      console.log('✅ Original plan data loaded:', data.plan.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load original plan data');
    } finally {
      setLoadingOriginal(false);
    }
  };

  const applySmartScaling = async (planId: string) => {
    try {
      setLoadingScaling(true);
      setError(null);
      
      const response = await fetch(`/api/nutrition-plan-smart-scaling?planId=${planId}&userId=${user?.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to apply smart scaling');
      }
      
      const data = await response.json();
      setScalingInfo(data.scalingInfo);
      console.log('✅ Smart scaling applied:', data.scalingInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Smart scaling failed');
    } finally {
      setLoadingScaling(false);
    }
  };

  const handlePlanSelect = (plan: NutritionPlan) => {
    console.log('🎯 Plan selected:', plan.name, 'ID:', plan.plan_id || plan.id);
    setSelectedPlan(plan);
    setShowOriginalData(true);
    setScalingInfo(null); // Reset scaling info
    loadOriginalPlanData(plan.plan_id || plan.id.toString());
  };

  // Show loading state
  if ((loading && plans.length === 0) || loadingOriginal) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <RocketLaunchIcon className="w-8 h-8 text-[#181F17]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {loadingOriginal ? 'Originele Plan Data Laden' : 'Voedingsplannen V2 Laden'}
          </h3>
          <p className="text-[#B6C948]">
            {loadingOriginal ? 'Backend data wordt geladen...' : 'Slimme schalingsfactor wordt voorbereid...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Fout</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#B6C948] text-[#181F17] rounded-lg hover:bg-[#8BAE5A] transition-colors"
          >
            Opnieuw Proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F0A] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center">
              <RocketLaunchIcon className="w-6 h-6 text-[#181F17]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Voedingsplannen V2</h1>
              <p className="text-[#B6C948]">Slimme schalingsfactor met AI-optimalisatie</p>
            </div>
          </div>
          
          <div className="bg-[#181F17] border border-[#B6C948] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#B6C948] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#181F17] text-xs font-bold">!</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Slimme Schalingsfactor</h3>
                <p className="text-[#8BAE5A] text-sm">
                  Deze V2 versie gebruikt geavanceerde AI-algoritmes om voedingsplannen automatisch 
                  te optimaliseren op basis van jouw gewicht en doelen. Elke portie wordt precies 
                  berekend voor maximale resultaten.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-[#181F17] border rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                selectedPlan?.id === plan.id 
                  ? 'border-[#B6C948] bg-[#181F17]/50' 
                  : 'border-[#3A4D23] hover:border-[#8BAE5A]'
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-lg flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 text-[#181F17]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{plan.name}</h3>
                    <p className="text-[#8BAE5A] text-sm capitalize">{plan.goal}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-1 bg-[#B6C948] text-[#181F17] text-xs font-bold rounded-full">
                    V2
                  </span>
                  {plan.difficulty === 'advanced' && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                      ADV
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-[#8BAE5A] text-sm mb-4">{plan.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#B6C948] font-semibold">{plan.target_calories} kcal</p>
                  <p className="text-gray-400">Calorieën</p>
                </div>
                <div>
                  <p className="text-[#B6C948] font-semibold">{plan.target_protein}g</p>
                  <p className="text-gray-400">Eiwit</p>
                </div>
                <div>
                  <p className="text-[#B6C948] font-semibold">{plan.target_carbs}g</p>
                  <p className="text-gray-400">Koolhydraten</p>
                </div>
                <div>
                  <p className="text-[#B6C948] font-semibold">{plan.target_fat}g</p>
                  <p className="text-gray-400">Vet</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-gray-800 text-white text-xs rounded">
            <p>Debug: selectedPlan={selectedPlan?.name || 'null'}, originalPlanData={originalPlanData?.name || 'null'}, showOriginalData={showOriginalData.toString()}</p>
            <p>Loading states: loading={loading.toString()}, loadingOriginal={loadingOriginal.toString()}, loadingScaling={loadingScaling.toString()}</p>
          </div>
        )}

        {/* Original Plan Data */}
        {selectedPlan && originalPlanData && showOriginalData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#3A4D23] to-[#8BAE5A] rounded-full flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Originele Backend Data</h3>
                  <p className="text-[#8BAE5A]">1:1 zoals opgeslagen in database</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowOriginalData(false);
                  if (!scalingInfo) {
                    applySmartScaling(selectedPlan.plan_id || selectedPlan.id.toString());
                  }
                }}
                disabled={loadingScaling}
                className="px-4 py-2 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] text-[#181F17] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {loadingScaling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#181F17] border-t-transparent rounded-full animate-spin"></div>
                    <span>Bezig...</span>
                  </>
                ) : (
                  <>
                    <RocketLaunchIcon className="w-4 h-4" />
                    <span>{scalingInfo ? 'Bekijk Smart Scaling' : 'Smart Scaling Toepassen'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Plan Info */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-3">Plan Informatie</h4>
                
                <div className="bg-[#0A0F0A] rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Naam:</span>
                    <span className="text-white font-semibold">{originalPlanData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Plan ID:</span>
                    <span className="text-white font-mono text-sm">{originalPlanData.plan_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Beschrijving:</span>
                    <span className="text-white text-sm">{originalPlanData.description}</span>
                  </div>
                </div>
              </div>

              {/* Macro Targets */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-3">Macro Doelen</h4>
                
                <div className="bg-[#0A0F0A] rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Calorieën:</span>
                    <span className="text-white font-semibold">{originalPlanData.target_calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Eiwit:</span>
                    <span className="text-white font-semibold">{originalPlanData.target_protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Koolhydraten:</span>
                    <span className="text-white font-semibold">{originalPlanData.target_carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8BAE5A]">Vet:</span>
                    <span className="text-white font-semibold">{originalPlanData.target_fat}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meal Structure */}
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-4">Eetmomenten Structuur</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {['ontbijt', 'ochtend_snack', 'lunch', 'lunch_snack', 'diner'].map((mealType) => (
                  <div key={mealType} className="bg-[#0A0F0A] rounded-lg p-4">
                    <h5 className="text-[#B6C948] font-semibold mb-2 capitalize">
                      {mealType === 'ochtend_snack' ? 'Ochtend Snack' :
                       mealType === 'lunch_snack' ? 'Lunch Snack' :
                       mealType === 'ontbijt' ? 'Ontbijt' :
                       mealType === 'lunch' ? 'Lunch' :
                       mealType === 'diner' ? 'Diner' : mealType}
                    </h5>
                    
                    {/* Show sample data from first day */}
                    {originalPlanData.meals?.weekly_plan && Object.keys(originalPlanData.meals.weekly_plan).length > 0 && (
                      <div className="text-sm text-gray-400">
                        {(() => {
                          const firstDay = Object.keys(originalPlanData.meals.weekly_plan)[0];
                          const mealData = originalPlanData.meals.weekly_plan[firstDay]?.[mealType];
                          if (mealData && mealData.ingredients) {
                            return `${mealData.ingredients.length} ingrediënten`;
                          }
                          return 'Geen data';
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-[#3A4D23]/20 to-[#8BAE5A]/20 rounded-lg border border-[#3A4D23]/30">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-[#8BAE5A]" />
                <p className="text-[#8BAE5A] font-semibold">
                  Dit is de exacte data zoals opgeslagen in de backend database - 1:1 mapping.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Smart Scaling Results */}
        {selectedPlan && scalingInfo && !showOriginalData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#181F17] border border-[#B6C948] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-[#181F17]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Slimme Schalingsresultaten</h3>
                  <p className="text-[#B6C948]">Voor {selectedPlan.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowOriginalData(true)}
                className="px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors flex items-center gap-2"
              >
                <BookOpenIcon className="w-4 h-4" />
                <span>Bekijk Originele Data</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Scaling Info */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-3">Schalingsinformatie</h4>
                
                <div className="bg-[#0A0F0A] rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#8BAE5A]">Jouw Gewicht</p>
                      <p className="text-white font-semibold">{scalingInfo.userWeight}kg</p>
                    </div>
                    <div>
                      <p className="text-[#8BAE5A]">Basis Gewicht</p>
                      <p className="text-white font-semibold">{scalingInfo.baseWeight}kg</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[#8BAE5A]">Schalingsfactor</p>
                      <p className="text-[#B6C948] font-bold text-lg">{scalingInfo.scalingFactor.toFixed(2)}x</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Macro Comparison */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold mb-3">Macro Optimalisatie</h4>
                
                <div className="space-y-3">
                  {/* Calories */}
                  <div className="flex items-center justify-between bg-[#0A0F0A] rounded-lg p-3">
                    <span className="text-[#8BAE5A]">Calorieën</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{scalingInfo.finalTotals.calories}</p>
                      <p className="text-xs text-gray-400">
                        {scalingInfo.originalTotals.calories} → {scalingInfo.finalTotals.calories}
                      </p>
                    </div>
                  </div>

                  {/* Protein */}
                  <div className="flex items-center justify-between bg-[#0A0F0A] rounded-lg p-3">
                    <span className="text-[#8BAE5A]">Eiwit</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{scalingInfo.finalTotals.protein}g</p>
                      <p className="text-xs text-gray-400">
                        {scalingInfo.originalTotals.protein}g → {scalingInfo.finalTotals.protein}g
                      </p>
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="flex items-center justify-between bg-[#0A0F0A] rounded-lg p-3">
                    <span className="text-[#8BAE5A]">Koolhydraten</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{scalingInfo.finalTotals.carbs}g</p>
                      <p className="text-xs text-gray-400">
                        {scalingInfo.originalTotals.carbs}g → {scalingInfo.finalTotals.carbs}g
                      </p>
                    </div>
                  </div>

                  {/* Fat */}
                  <div className="flex items-center justify-between bg-[#0A0F0A] rounded-lg p-3">
                    <span className="text-[#8BAE5A]">Vet</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{scalingInfo.finalTotals.fat}g</p>
                      <p className="text-xs text-gray-400">
                        {scalingInfo.originalTotals.fat}g → {scalingInfo.finalTotals.fat}g
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-[#B6C948]/20 to-[#8BAE5A]/20 rounded-lg border border-[#B6C948]/30">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-[#B6C948]" />
                <p className="text-[#B6C948] font-semibold">
                  Slimme schalingsfactor succesvol toegepast! Jouw voedingsplan is nu geoptimaliseerd.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <button
            onClick={() => router.push('/dashboard/voedingsplannen')}
            className="flex items-center gap-2 px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D33] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Terug naar Voedingsplannen
          </button>
        </motion.div>
      </div>
    </div>
  );
}
