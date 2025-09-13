"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon,
  CalculatorIcon,
  ChartBarIcon,
  CheckIcon,
  EyeIcon,
  RocketLaunchIcon,
  SparklesIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'next/navigation';
import DynamicPlanViewV2 from './components/DynamicPlanViewV2';

interface NutritionPlan {
  id: number;
  plan_id: string;
  name: string;
  subtitle?: string;
  description: string;
  icon?: string;
  color?: string;
  meals?: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Macro percentage fields
  protein_percentage?: number;
  carbs_percentage?: number;
  fat_percentage?: number;
  // Target macro values
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  // Goal field for filtering
  goal?: string;
}

export default function VoedingsplannenV2Page() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();

  // Nutrition plans state
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  const [nutritionError, setNutritionError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);

  // Fetch nutrition plans
  useEffect(() => {
    const fetchNutritionPlans = async () => {
      try {
        setNutritionLoading(true);
        const response = await fetch('/api/nutrition-plans');
        
        if (!response.ok) {
          throw new Error('Failed to fetch nutrition plans');
        }
        
        const data = await response.json();
        setNutritionPlans(data.plans || []);
      } catch (error) {
        console.error('Error fetching nutrition plans:', error);
        setNutritionError(error instanceof Error ? error.message : 'Unknown error');
        toast.error('Fout bij laden voedingsplannen');
      } finally {
        setNutritionLoading(false);
      }
    };

    if (user) {
      fetchNutritionPlans();
    }
  }, [user]);

  // Check if user is admin
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-white">Laden...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Toegang Geweigerd</h1>
          <p className="text-gray-400">Deze pagina is alleen beschikbaar voor administrators.</p>
        </div>
      </div>
    );
  }

  if (nutritionError) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Fout bij Laden</h1>
          <p className="text-gray-400">{nutritionError}</p>
        </div>
      </div>
    );
  }

  // If a plan is selected, show the detailed view
  if (selectedPlan) {
    return (
      <DynamicPlanViewV2 
        planId={selectedPlan.plan_id}
        planName={selectedPlan.name}
        onBack={() => setSelectedPlan(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f17] to-[#2d3a23] border-b border-[#3a4d23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-[#8BAE5A] to-[#A8D65A] rounded-xl">
              <RocketLaunchIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Voedingsplannen V2</h1>
              <p className="text-gray-300 mt-1">
                Nieuwe versie met slimme schalingsfactor en verbeterde macro verdeling
              </p>
            </div>
          </div>

          {/* V2 Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <ScaleIcon className="w-5 h-5 text-[#8BAE5A]" />
                <h3 className="font-semibold text-white">Slimme Schalingsfactor</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Automatische aanpassing op basis van gewicht met behoud van macro verdeling
              </p>
            </div>
            
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <ChartBarIcon className="w-5 h-5 text-[#8BAE5A]" />
                <h3 className="font-semibold text-white">Exacte Macro Verdeling</h3>
              </div>
              <p className="text-gray-300 text-sm">
                1:1 backend data met correcte macro percentages en ingrediënt units
              </p>
            </div>
            
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <SparklesIcon className="w-5 h-5 text-[#8BAE5A]" />
                <h3 className="font-semibold text-white">Admin Only</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Exclusieve toegang voor testing en ontwikkeling van nieuwe features
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {nutritionLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white">Laden van voedingsplannen...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nutritionPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#181F17] border border-[#3A4D23] rounded-xl p-6 hover:border-[#8BAE5A] transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-[#8BAE5A] to-[#A8D65A] rounded-lg">
                      <BookOpenIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#8BAE5A] transition-colors">
                        {plan.name}
                      </h3>
                      {plan.subtitle && (
                        <p className="text-sm text-gray-400">{plan.subtitle}</p>
                      )}
                    </div>
                  </div>
                  {plan.is_active && (
                    <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                      <CheckIcon className="w-3 h-3" />
                      Actief
                    </div>
                  )}
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {plan.description}
                </p>

                {/* Plan Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#8BAE5A]">
                      {plan.target_calories || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">Kcal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#8BAE5A]">
                      {plan.protein_percentage || 'N/A'}%
                    </div>
                    <div className="text-xs text-gray-400">Eiwit</div>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full bg-gradient-to-r from-[#8BAE5A] to-[#A8D65A] text-white py-2 px-4 rounded-lg font-semibold hover:from-[#7A9E4A] hover:to-[#98C64A] transition-all duration-300 flex items-center justify-center gap-2">
                  <EyeIcon className="w-4 h-4" />
                  Bekijk Plan V2
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {nutritionPlans.length === 0 && !nutritionLoading && (
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Geen voedingsplannen gevonden
            </h3>
            <p className="text-gray-500">
              Er zijn momenteel geen voedingsplannen beschikbaar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
