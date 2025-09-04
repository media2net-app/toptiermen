"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon,
  CalculatorIcon,
  ChartBarIcon,
  CheckIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import PageLayout from '@/components/PageLayout';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useRouter } from 'next/navigation';
import DynamicPlanView from './components/DynamicPlanView';

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
  const { user, loading: authLoading } = useSupabaseAuth();
  const { isOnboarding, currentStep: onboardingStep, completeStep } = useOnboarding();
  const router = useRouter();

  // Nutrition plans state
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  const [nutritionError, setNutritionError] = useState<string | null>(null);
  const [userNutritionProfile, setUserNutritionProfile] = useState<any>(null);
  const [selectedNutritionPlan, setSelectedNutritionPlan] = useState<string | null>(null);
  const [showRequiredIntake, setShowRequiredIntake] = useState(false);
  const [viewingDynamicPlan, setViewingDynamicPlan] = useState<{planId: string, planName: string} | null>(null);
  
  // Nutrition calculator state
  const [calculatorData, setCalculatorData] = useState({
    age: '',
    weight: '',
    height: '',
    goal: '' // droogtrainen, behoud, spiermassa
  });

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
        // Filter plans based on user's goal if they have a nutrition profile
        let filteredPlans = data.plans;
        
        if (userNutritionProfile?.goal) {
          const userGoal = userNutritionProfile.goal.toLowerCase();
          console.log('🎯 Filtering plans for user goal:', userGoal);
          
          // Map user goals to plan goals
          const goalMapping = {
            'cut': 'droogtrainen',
            'bulk': 'spiermassa', 
            'maintenance': 'balans',
            'droogtrainen': 'droogtrainen',
            'spiermassa': 'spiermassa',
            'balans': 'balans'
          };
          
          const mappedGoal = goalMapping[userGoal] || userGoal;
          console.log(`🗺️ Mapping user goal "${userGoal}" to plan goal "${mappedGoal}"`);
          
          filteredPlans = data.plans.filter(plan => {
            const planGoal = plan.goal?.toLowerCase() || plan.fitness_goal?.toLowerCase();
            const matches = planGoal === mappedGoal;
            console.log(`Plan "${plan.name}" (${planGoal}) matches mapped goal (${mappedGoal}):`, matches);
            return matches;
          });
          
          console.log(`✅ Filtered from ${data.plans.length} to ${filteredPlans.length} plans`);
        }
        
        setNutritionPlans(filteredPlans);
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
      console.log('📡 Fetching nutrition profile for user:', user.id);
      const response = await fetch(`/api/nutrition-profile?userId=${user.id}`);
      const data = await response.json();
      
      console.log('📊 API Response:', data);
      
      if (data.success && data.profile) {
        // Convert API profile to frontend format
        const profile = {
          dailyCalories: data.profile.target_calories,
          protein: data.profile.target_protein,
          carbs: data.profile.target_carbs,
          fats: data.profile.target_fat,
          age: data.profile.age,
          weight: data.profile.weight,
          height: data.profile.height,
          goal: data.profile.goal === 'cut' ? 'droogtrainen' : data.profile.goal === 'bulk' ? 'spiermassa' : 'behoud'
        };
        console.log('✅ Profile found, setting user profile:', profile);
        setUserNutritionProfile(profile);
        setShowRequiredIntake(false);
      } else {
        // No profile found, show required intake calculator
        console.log('❌ No profile found, showing calculator');
        setShowRequiredIntake(true);
      }
    } catch (error) {
      console.error('❌ Error checking user nutrition profile:', error);
      setShowRequiredIntake(true);
    }
  };

  const handleNutritionPlanClick = (planId: string) => {
    // Mark plan as selected
    setSelectedNutritionPlan(planId);
    // Navigate to plan details (you can uncomment this if you want navigation)
    // router.push(`/dashboard/trainingscentrum/nutrition/${planId}`);
  };

  const handleViewDynamicPlan = (planId: string, planName: string) => {
    if (!userNutritionProfile) {
      toast.error('Vul eerst je dagelijkse behoefte in om het plan te kunnen bekijken');
      setShowRequiredIntake(true);
      return;
    }
    
    // All plans with meals data support dynamic viewing
    console.log('✅ Setting viewingDynamicPlan to:', { planId, planName });
    setViewingDynamicPlan({ planId, planName });
  };

  const handleBackFromDynamicPlan = () => {
    setViewingDynamicPlan(null);
  };

  const calculateNutrition = () => {
    const { age, weight, height, goal } = calculatorData;
    
    console.log('🧮 Calculating nutrition with data:', calculatorData);
    
    if (!age || !weight || !height || !goal) {
      toast.error('Vul alle velden in om je dagelijkse behoefte te berekenen');
      return;
    }

    // Calculate BMR using Mifflin-St Jeor equation (for men)
    const bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) + 5;
    
    // Activity factor (assuming moderate activity)
    const activityFactor = 1.55;
    const tdee = bmr * activityFactor;

    // Adjust based on goal
    let calories = tdee;
    let protein, carbs, fats;

    switch (goal) {
      case 'droogtrainen':
        calories = tdee * 0.8; // 20% deficit
        protein = parseFloat(weight) * 2.2; // High protein for cutting
        fats = parseFloat(weight) * 0.8;
        carbs = (calories - (protein * 4) - (fats * 9)) / 4;
        break;
      case 'behoud':
        calories = tdee; // Maintenance
        protein = parseFloat(weight) * 1.8;
        fats = parseFloat(weight) * 1.0;
        carbs = (calories - (protein * 4) - (fats * 9)) / 4;
        break;
      case 'spiermassa':
        calories = tdee * 1.1; // 10% surplus
        protein = parseFloat(weight) * 2.0;
        fats = parseFloat(weight) * 1.2;
        carbs = (calories - (protein * 4) - (fats * 9)) / 4;
        break;
      default:
        return;
    }

    const profile = {
      dailyCalories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(Math.max(0, carbs)),
      fats: Math.round(fats),
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      goal
    };

    console.log('💾 Saving profile locally and to API:', profile);
    setUserNutritionProfile(profile);
    setShowRequiredIntake(false);
    // Reset calculator data
    setCalculatorData({ age: '', weight: '', height: '', goal: '' });
    saveNutritionProfile(profile);
  };

  const saveNutritionProfile = async (profile: any) => {
    if (!user?.id) return;
    
    try {
      const apiPayload = {
        userId: user.id,
        age: profile.age,
        weight: profile.weight,
        height: profile.height,
        gender: 'male', // Assuming male for Top Tier Men
        activityLevel: 'moderate', // Default moderate activity
        goal: profile.goal === 'droogtrainen' ? 'cut' : profile.goal === 'spiermassa' ? 'bulk' : 'maintain'
      };
      
      console.log('📤 Sending to API:', apiPayload);
      
      const response = await fetch('/api/nutrition-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      const data = await response.json();
      
      console.log('📥 API Response:', data);
      
      if (response.ok && data.success) {
        console.log('✅ Profile saved successfully');
        toast.success('Je voedingsprofiel is opgeslagen!');
        // Update local state with API response
        if (data.profile) {
          setUserNutritionProfile({
            dailyCalories: data.profile.target_calories,
            protein: data.profile.target_protein,
            carbs: data.profile.target_carbs,
            fats: data.profile.target_fat,
            age: data.profile.age,
            weight: data.profile.weight,
            height: data.profile.height,
            goal: profile.goal
          });
        }
      } else {
        throw new Error(data.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving nutrition profile:', error);
      toast.error('Er is een fout opgetreden bij het opslaan');
    }
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
      console.log('🔍 Checking user nutrition profile for user:', user.id);
      checkUserNutritionProfile();
    }
  }, [user?.id]);

  // Fetch plans when user profile changes or initially
  useEffect(() => {
    if (user?.id) {
      fetchNutritionPlans();
    }
  }, [user?.id, userNutritionProfile]);

  // Show fallback if no user is logged in
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1411] via-[#181F17] to-[#232D1A] flex items-center justify-center">
        <div className="bg-[#232D1A] p-8 rounded-lg border border-[#3A4D23] max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Voedingsplannen
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-300 text-center">
              Je bent niet ingelogd. Log in om je voedingsplannen te bekijken.
            </p>
            
            <div className="space-y-3">
              <a 
                href="/test-login"
                className="w-full bg-[#8BAE5A] text-[#232D1A] font-semibold py-3 px-4 rounded-lg hover:bg-[#7A9D4A] transition-colors block text-center"
              >
                Test Login (Localhost)
              </a>
              
              <a 
                href="/login"
                className="w-full bg-[#3A4D23] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#4A5D33] transition-colors block text-center"
              >
                Normale Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout 
      title="Voedingsplannen" 
      subtitle="Beheer je voedingsplannen en bereken je dagelijkse behoeften"
    >
      <div className="w-full">
        <AnimatePresence mode="wait">
          {/* Dynamic Plan View */}
          {viewingDynamicPlan ? (
            <motion.div
              key="dynamic-plan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <DynamicPlanView
                planId={viewingDynamicPlan.planId}
                planName={viewingDynamicPlan.planName}
                userId={user?.id || ''}
                onBack={handleBackFromDynamicPlan}
              />
            </motion.div>
          ) : showRequiredIntake ? (
            <motion.div
              key="required-calculator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {userNutritionProfile ? 'Update je Dagelijkse Behoefte' : 'Bereken je Dagelijkse Behoefte'}
                </h2>
                <p className="text-gray-300 text-lg">
                  {userNutritionProfile 
                    ? 'Pas je gegevens aan om je dagelijkse voedingsbehoeften opnieuw te berekenen.'
                    : 'Voor we je voedingsplannen kunnen tonen, moeten we eerst je dagelijkse voedingsbehoeften berekenen.'
                  }
                </p>
              </div>

              <div className="bg-[#232D1A] rounded-2xl p-8 border border-[#3A4D23]">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Leeftijd</label>
                    <input
                      type="number"
                      placeholder="bijv. 30"
                      value={calculatorData.age}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Gewicht (kg)</label>
                    <input
                      type="number"
                      placeholder="bijv. 80"
                      value={calculatorData.weight}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Lengte (cm)</label>
                    <input
                      type="number"
                      placeholder="bijv. 180"
                      value={calculatorData.height}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, height: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Doel</label>
                    <select
                      value={calculatorData.goal}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, goal: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                    >
                      <option value="">Selecteer je doel</option>
                      <option value="droogtrainen">Droogtrainen (Vetverbranding)</option>
                      <option value="behoud">Behoud (Onderhoud)</option>
                      <option value="spiermassa">Spiermassa (Opbouw)</option>
                    </select>
                  </div>
                </div>

      <div className="text-center">
                  <button
                    onClick={calculateNutrition}
                    className="px-8 py-4 bg-[#8BAE5A] text-[#232D1A] rounded-xl hover:bg-[#B6C948] transition-colors font-bold text-lg"
                  >
                    {userNutritionProfile ? 'Update Mijn Dagelijkse Behoefte' : 'Bereken Mijn Dagelijkse Behoefte'}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Main Nutrition Plans Interface */
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

            {/* Nutrition Profile Notice */}
            {userNutritionProfile && (
              <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <ChartBarIcon className="w-6 h-6 text-[#8BAE5A] mr-2" />
                    Jouw Dagelijkse Behoefte
                  </h3>
                  <button
                    onClick={() => {
                      // Pre-fill calculator with existing data
                      setCalculatorData({
                        age: userNutritionProfile.age?.toString() || '',
                        weight: userNutritionProfile.weight?.toString() || '',
                        height: userNutritionProfile.height?.toString() || '',
                        goal: userNutritionProfile.goal || ''
                      });
                      setShowRequiredIntake(true);
                    }}
                    className="text-[#8BAE5A] hover:text-[#B6C948] text-sm font-semibold transition-colors"
                  >
                    ✏️ Bewerken
                  </button>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-[#181F17] rounded-lg p-4 text-center">
                    <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Calorieën</h4>
                    <p className="text-2xl font-bold text-white">{userNutritionProfile.dailyCalories}</p>
                    <p className="text-xs text-gray-400">per dag</p>
                  </div>
                  <div className="bg-[#181F17] rounded-lg p-4 text-center">
                    <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Eiwitten</h4>
                    <p className="text-2xl font-bold text-white">{userNutritionProfile.protein}g</p>
                    <p className="text-xs text-gray-400">per dag</p>
                  </div>
                  <div className="bg-[#181F17] rounded-lg p-4 text-center">
                    <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Koolhydraten</h4>
                    <p className="text-2xl font-bold text-white">{userNutritionProfile.carbs}g</p>
                    <p className="text-xs text-gray-400">per dag</p>
                  </div>
                  <div className="bg-[#181F17] rounded-lg p-4 text-center">
                    <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Vetten</h4>
                    <p className="text-2xl font-bold text-white">{userNutritionProfile.fats}g</p>
                    <p className="text-xs text-gray-400">per dag</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-400">
                    Doel: <span className="text-[#8BAE5A] font-semibold capitalize">{userNutritionProfile.goal}</span>
                    {userNutritionProfile.weight && userNutritionProfile.age && (
                      <> • {userNutritionProfile.weight}kg • {userNutritionProfile.age} jaar</>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Nutrition Plans */}
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
                        
                        <div className="space-y-3">
                          {selectedNutritionPlan === plan.plan_id && (
                            <div className="flex justify-center">
                              <div className="inline-flex items-center px-3 py-1 bg-[#8BAE5A]/20 border border-[#8BAE5A] text-[#8BAE5A] rounded-lg text-sm font-semibold">
                                <CheckIcon className="w-4 h-4 mr-1" />
                                Geselecteerd plan
                              </div>
                            </div>
                          )}
                          
                          {/* Dynamic Plan View Button (only for carnivoor-droogtrainen) */}
                                                {/* Dynamische plan knop voor alle plannen met maaltijden */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('🔍 Clicking plan:', plan.plan_id, plan.name);
                          handleViewDynamicPlan(plan.plan_id, plan.name);
                        }}
                        className="w-full px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Bekijk Gepersonaliseerd Plan
                      </button>
                        </div>
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
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}