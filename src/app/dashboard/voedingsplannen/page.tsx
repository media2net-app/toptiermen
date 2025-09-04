"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon,
  CalculatorIcon,
  ChartBarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import PageLayout from '@/components/PageLayout';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useRouter } from 'next/navigation';

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
}

const dietTypes = [
  {
    id: 'balanced',
    name: 'Gebalanceerd',
    subtitle: 'Voor duurzame energie en algehele gezondheid',
    description: 'Een mix van alle macronutriënten',
    icon: '🥗',
  },
  {
    id: 'low_carb',
    name: 'Koolhydraatarm / Keto',
    subtitle: 'Focus op vetverbranding en een stabiele bloedsuikerspiegel',
    description: 'Minimale koolhydraten, hoog in gezonde vetten',
    icon: '🥑',
  },
  {
    id: 'carnivore',
    name: 'Carnivoor (Rick\'s Aanpak)',
    subtitle: 'Voor maximale eenvoud en het elimineren van potentiële triggers',
    description: 'Eet zoals de oprichter',
    icon: '🥩',
  },
  {
    id: 'high_protein',
    name: 'High Protein',
    subtitle: 'Geoptimaliseerd voor maximale spieropbouw en herstel',
    description: 'Maximale eiwitinname voor spiergroei',
    icon: '💪',
  }
];

export default function VoedingsplannenPage() {
  const { user } = useSupabaseAuth();
  const { isOnboarding, currentStep: onboardingStep, completeStep } = useOnboarding();
  const router = useRouter();
  
  // Nutrition plans state
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  const [nutritionError, setNutritionError] = useState<string | null>(null);
  const [showNutritionIntake, setShowNutritionIntake] = useState(false);
  const [userNutritionProfile, setUserNutritionProfile] = useState<any>(null);
  const [activeNutritionTab, setActiveNutritionTab] = useState<'plans' | 'intake' | 'profile'>('plans');
  const [selectedNutritionPlan, setSelectedNutritionPlan] = useState<string | null>(null);

  // Nutrition functions
  const fetchNutritionPlans = async () => {
    try {
      setNutritionLoading(true);
      
      const response = await fetch('/api/nutrition-plans');
      
      if (!response.ok) {
        throw new Error('Failed to fetch nutrition plans');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setNutritionPlans(data.plans);
      } else {
        throw new Error(data.error || 'Failed to fetch nutrition plans');
      }
      
      setNutritionLoading(false);
    } catch (err) {
      console.error('Error fetching nutrition plans:', err);
      setNutritionError('Er is een fout opgetreden bij het laden van de voedingsplannen.');
      setNutritionLoading(false);
    }
  };

  const checkUserNutritionProfile = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/nutrition-profile?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success && data.profile) {
        setUserNutritionProfile(data.profile);
      }
    } catch (error) {
      console.error('Error checking user nutrition profile:', error);
    }
  };

  const handleNutritionPlanClick = (planId: string) => {
    router.push(`/dashboard/trainingscentrum/nutrition/${planId}`);
  };

  const handleNutritionIntakeComplete = (calculations: any) => {
    setUserNutritionProfile(calculations);
    setShowNutritionIntake(false);
    checkUserNutritionProfile();
  };

  const handleNutritionIntakeSkip = () => {
    setShowNutritionIntake(false);
  };

  const getNutritionPlanIcon = (plan: NutritionPlan) => {
    if (plan.icon) {
      return <span className="text-2xl">{plan.icon}</span>;
    }
    
    // Default icons based on plan name
    const name = plan.name.toLowerCase();
    if (name.includes('carnivoor') || name.includes('carnivore')) {
      return <span className="text-2xl">🥩</span>;
    } else if (name.includes('keto') || name.includes('low carb')) {
      return <span className="text-2xl">🥑</span>;
    } else if (name.includes('protein')) {
      return <span className="text-2xl">💪</span>;
    } else {
      return <span className="text-2xl">🥗</span>;
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNutritionPlans();
      checkUserNutritionProfile();
    }
  }, [user?.id]);

  return (
    <PageLayout 
      title="Voedingsplannen" 
      subtitle="Beheer je voedingsplannen en bereken je dagelijkse behoeften"
      breadcrumbItems={[
        { label: 'Voedingsplannen', isCurrent: true }
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Main Nutrition Plans Interface */}
          <motion.div
            key="nutrition-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Voedingsplannen
              </h2>
              <p className="text-gray-300 text-lg">
                Beheer je voedingsplannen en bereken je dagelijkse behoeften.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-[#232D1A] rounded-xl p-1 border border-[#3A4D23]">
                <button
                  onClick={() => setActiveNutritionTab('plans')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeNutritionTab === 'plans'
                      ? 'bg-[#8BAE5A] text-[#232D1A]'
                      : 'text-[#8BAE5A] hover:text-white'
                  }`}
                >
                  <BookOpenIcon className="w-5 h-5 inline mr-2" />
                  Voedingsplannen
                </button>
                <button
                  onClick={() => setActiveNutritionTab('intake')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeNutritionTab === 'intake'
                      ? 'bg-[#8BAE5A] text-[#232D1A]'
                      : 'text-[#8BAE5A] hover:text-white'
                  }`}
                >
                  <CalculatorIcon className="w-5 h-5 inline mr-2" />
                  Dagelijkse Behoefte
                </button>
                <button
                  onClick={() => setActiveNutritionTab('profile')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeNutritionTab === 'profile'
                      ? 'bg-[#8BAE5A] text-[#232D1A]'
                      : 'text-[#8BAE5A] hover:text-white'
                  }`}
                >
                  <ChartBarIcon className="w-5 h-5 inline mr-2" />
                  Mijn Profiel
                </button>
              </div>
            </div>

            {/* Nutrition Plans Tab */}
            {activeNutritionTab === 'plans' && (
              <div className="space-y-6">
                {nutritionLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
                    <p className="text-gray-300">Voedingsplannen laden...</p>
                  </div>
                ) : nutritionError ? (
                  <div className="text-center py-12">
                    <p className="text-red-400 mb-4">{nutritionError}</p>
                    <button
                      onClick={fetchNutritionPlans}
                      className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] font-semibold rounded-lg hover:bg-[#7A9D4A] transition-colors duration-200"
                    >
                      Opnieuw Proberen
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nutritionPlans.map((plan) => (
                      <motion.div
                        key={plan.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleNutritionPlanClick(plan.plan_id)}
                        className="cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50"
                      >
                        <div className="text-center mb-4">
                          {getNutritionPlanIcon(plan)}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 text-center">{plan.name}</h3>
                        {plan.subtitle && (
                          <p className="text-[#8BAE5A] text-sm text-center mb-3">{plan.subtitle}</p>
                        )}
                        <p className="text-gray-300 text-center text-sm mb-4">{plan.description}</p>
                        
                        {plan.is_active && (
                          <div className="flex justify-center">
                            <div className="inline-flex items-center px-3 py-1 bg-[#8BAE5A]/20 border border-[#8BAE5A] text-[#8BAE5A] rounded-lg text-sm">
                              <CheckIcon className="w-4 h-4 mr-1" />
                              Actief
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {!nutritionLoading && !nutritionError && nutritionPlans.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-300">Geen voedingsplannen beschikbaar</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Er zijn momenteel geen voedingsplannen beschikbaar.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Nutrition Intake Tab */}
            {activeNutritionTab === 'intake' && (
              <div className="space-y-6">
                {showNutritionIntake ? (
                  <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                    <h3 className="text-xl font-bold text-white mb-4">Bereken je Dagelijkse Behoefte</h3>
                    <p className="text-gray-300 mb-4">
                      Vul je gegevens in om je persoonlijke voedingsbehoeften te berekenen.
                    </p>
                    {/* NutritionIntake component would go here */}
                    <div className="text-center py-8">
                      <p className="text-[#8BAE5A] mb-4">Nutrition Intake Calculator</p>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => handleNutritionIntakeComplete({})}
                          className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] font-semibold rounded-lg hover:bg-[#7A9D4A] transition-colors duration-200"
                        >
                          Opslaan
                        </button>
                        <button
                          onClick={handleNutritionIntakeSkip}
                          className="px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] font-semibold rounded-lg hover:bg-[#4A5D33] transition-colors duration-200"
                        >
                          Overslaan
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalculatorIcon className="w-16 h-16 text-[#8BAE5A] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-4">Bereken je Dagelijkse Behoefte</h3>
                    <p className="text-gray-300 mb-6">
                      Vul je gegevens in om je persoonlijke voedingsbehoeften te berekenen.
                    </p>
                    <button
                      onClick={() => setShowNutritionIntake(true)}
                      className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] font-semibold rounded-lg hover:bg-[#7A9D4A] transition-colors duration-200"
                    >
                      Start Berekenen
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Nutrition Profile Tab */}
            {activeNutritionTab === 'profile' && (
              <div className="space-y-6">
                {userNutritionProfile ? (
                  <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                    <h3 className="text-xl font-bold text-white mb-4">Mijn Voedingsprofiel</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-[#181F17] rounded-lg p-4">
                          <h4 className="text-[#8BAE5A] font-semibold mb-2">Dagelijkse Calorieën</h4>
                          <p className="text-2xl font-bold text-white">{userNutritionProfile.dailyCalories || 'N/A'}</p>
                        </div>
                        <div className="bg-[#181F17] rounded-lg p-4">
                          <h4 className="text-[#8BAE5A] font-semibold mb-2">Eiwitten</h4>
                          <p className="text-2xl font-bold text-white">{userNutritionProfile.protein || 'N/A'}g</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-[#181F17] rounded-lg p-4">
                          <h4 className="text-[#8BAE5A] font-semibold mb-2">Koolhydraten</h4>
                          <p className="text-2xl font-bold text-white">{userNutritionProfile.carbs || 'N/A'}g</p>
                        </div>
                        <div className="bg-[#181F17] rounded-lg p-4">
                          <h4 className="text-[#8BAE5A] font-semibold mb-2">Vetten</h4>
                          <p className="text-2xl font-bold text-white">{userNutritionProfile.fats || 'N/A'}g</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setActiveNutritionTab('intake')}
                        className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] font-semibold rounded-lg hover:bg-[#7A9D4A] transition-colors duration-200"
                      >
                        Profiel Bijwerken
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ChartBarIcon className="w-16 h-16 text-[#8BAE5A] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-4">Geen Voedingsprofiel</h3>
                    <p className="text-gray-300 mb-6">
                      Je hebt nog geen voedingsprofiel aangemaakt. Bereken je dagelijkse behoefte om te beginnen.
                    </p>
                    <button
                      onClick={() => setActiveNutritionTab('intake')}
                      className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] font-semibold rounded-lg hover:bg-[#7A9D4A] transition-colors duration-200"
                    >
                      Bereken Behoefte
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}