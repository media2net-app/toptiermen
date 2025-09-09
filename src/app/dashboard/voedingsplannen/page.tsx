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
import DynamicPlanViewNew from './components/DynamicPlanViewNew';

// Function to map activity level to Dutch display text
function getActivityLevelDisplay(activityLevel: string): string {
  switch (activityLevel) {
    case 'sedentary':
      return 'Zittend (Licht actief)';
    case 'moderate':
      return 'Staand (Matig actief)';
    case 'very_active':
      return 'Lopend (Zeer actief)';
    default:
      return activityLevel;
  }
}

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
  // New macro percentage fields
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
  
  // Onboarding state
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [showOnboardingStep4, setShowOnboardingStep4] = useState(false);
  
  // Nutrition calculator state
  const [calculatorData, setCalculatorData] = useState({
    age: '',
    weight: '',
    height: '',
    activityLevel: '', // sedentary, light, moderate, active
    goal: '' // droogtrainen, behoud, spiermassa
  });

  // Calculate macro values based on selected plan
  const calculateMacroValues = (plan: NutritionPlan, targetCalories: number) => {
    if (!plan.protein_percentage || !plan.carbs_percentage || !plan.fat_percentage) {
      return { protein: 0, carbs: 0, fats: 0 };
    }
    
    const proteinCalories = (targetCalories * plan.protein_percentage) / 100;
    const carbsCalories = (targetCalories * plan.carbs_percentage) / 100;
    const fatCalories = (targetCalories * plan.fat_percentage) / 100;
    
    return {
      protein: Math.round(proteinCalories / 4), // 4 calories per gram protein
      carbs: Math.round(carbsCalories / 4),     // 4 calories per gram carbs
      fats: Math.round(fatCalories / 9)         // 9 calories per gram fat
    };
  };

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
        
        // Check if user has a goal (either from profile or from calculator)
        const userGoal = userNutritionProfile?.goal || calculatorData.goal;
        
        if (userGoal) {
          const normalizedGoal = userGoal.toLowerCase();
          console.log('🎯 Filtering plans for user goal:', normalizedGoal);
          console.log('📊 User nutrition profile:', userNutritionProfile);
          console.log('🧮 Calculator data:', calculatorData);
          
          // Map user goals to plan goals (case-insensitive)
          const goalMapping = {
            'cut': 'droogtrainen',
            'bulk': 'spiermassa', 
            'maintain': 'onderhoud',
            'maintenance': 'onderhoud',
            'droogtrainen': 'droogtrainen',
            'spiermassa': 'spiermassa',
            'behoud': 'onderhoud',
            'onderhoud': 'onderhoud'
          };
          
          const mappedGoal = goalMapping[normalizedGoal] || normalizedGoal;
          console.log(`🗺️ Mapping user goal "${normalizedGoal}" to plan goal "${mappedGoal}"`);
          
          filteredPlans = data.plans.filter(plan => {
            // Use goal field for filtering (not fitness_goal)
            const planGoal = plan.goal?.toLowerCase();
            const matches = planGoal === mappedGoal;
            console.log(`Plan "${plan.name}" (goal: ${plan.goal}) matches mapped goal (${mappedGoal}):`, matches);
            return matches;
          });
          
          console.log(`✅ Filtered from ${data.plans.length} to ${filteredPlans.length} plans`);
        }
        
        // Sort plans: Carnivoor always first, then by name
        filteredPlans.sort((a, b) => {
          const aIsCarnivore = a.name.toLowerCase().includes('carnivoor');
          const bIsCarnivore = b.name.toLowerCase().includes('carnivoor');
          
          if (aIsCarnivore && !bIsCarnivore) return -1;
          if (!aIsCarnivore && bIsCarnivore) return 1;
          
          return a.name.localeCompare(b.name);
        });
        
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

  const checkOnboardingStatus = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/onboarding?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setOnboardingStatus(data);
        
        // Only show onboarding step 4 if onboarding is not completed and user is on step 4
        setShowOnboardingStep4(!data.onboarding_completed && data.current_step === 4);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
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
          goal: data.profile.goal === 'cut' ? 'droogtrainen' : data.profile.goal === 'bulk' ? 'spiermassa' : 'behoud',
          activityLevel: data.profile.activity_level
        };
        console.log('✅ Profile found, setting user profile:', profile);
        setUserNutritionProfile(profile);
        
        // During onboarding step 4, only show calculator if no profile exists
        if (showOnboardingStep4) {
          console.log('🎯 Onboarding step 4: profile exists, hiding calculator to show nutrition plans');
          setShowRequiredIntake(false);
        } else {
          setShowRequiredIntake(false);
        }
        
        // Pre-populate calculator form with existing data (only if not in onboarding step 4)
        if (!showOnboardingStep4) {
          setCalculatorData({
            age: data.profile.age?.toString() || '',
            weight: data.profile.weight?.toString() || '',
            height: data.profile.height?.toString() || '',
            activityLevel: data.profile.activity_level || 'moderate', // Default to moderate if not set
            goal: data.profile.goal === 'cut' ? 'droogtrainen' : 
                  data.profile.goal === 'bulk' ? 'spiermassa' : 
                  data.profile.goal === 'maintenance' ? 'behoud' : ''
          });
          console.log('📝 Calculator form pre-populated with existing profile data');
        } else {
          console.log('🎯 Onboarding step 4: keeping calculator form empty for user input');
        }
        
        // Also fetch the active nutrition plan
        try {
          const activePlanResponse = await fetch(`/api/nutrition-plan-active?userId=${user.id}`);
          const activePlanData = await activePlanResponse.json();
          
          if (activePlanData.success && activePlanData.hasActivePlan) {
            console.log('✅ Active plan found:', activePlanData.activePlanId);
            setSelectedNutritionPlan(activePlanData.activePlanId);
          } else {
            console.log('ℹ️ No active plan found');
            setSelectedNutritionPlan(null);
          }
        } catch (activePlanError) {
          console.error('❌ Error fetching active plan:', activePlanError);
          setSelectedNutritionPlan(null);
        }
      } else {
        // No profile found, show required intake calculator
        console.log('❌ No profile found, showing calculator');
        setShowRequiredIntake(true);
        setSelectedNutritionPlan(null);
      }
    } catch (error) {
      console.error('❌ Error checking user nutrition profile:', error);
      setShowRequiredIntake(true);
      setSelectedNutritionPlan(null);
    }
  };

  const handleNutritionPlanClick = async (planId: string) => {
    // If this plan is already selected, deselect it
    if (selectedNutritionPlan === planId) {
      await handleDeselectPlan();
      return;
    }
    
    // Mark plan as selected
    setSelectedNutritionPlan(planId);
    
    // Always save the selection to database
    try {
      const response = await fetch('/api/nutrition-plan-select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          planId: planId
        }),
      });

      if (response.ok) {
        toast.success('Voedingsplan geselecteerd!');
        // Refresh the active plan selection
        checkUserNutritionProfile();
        // Force re-render of daily needs section
        setSelectedNutritionPlan(planId);
      } else {
        toast.error('Er is een fout opgetreden bij het selecteren van het plan');
      }
    } catch (error) {
      console.error('Error selecting nutrition plan:', error);
      toast.error('Er is een fout opgetreden');
    }
    
    // Navigate to plan details (you can uncomment this if you want navigation)
    // router.push(`/dashboard/trainingscentrum/nutrition/${planId}`);
  };

  const handleDeselectPlan = async () => {
    try {
      const response = await fetch('/api/nutrition-plan-select', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        }),
      });

      if (response.ok) {
        toast.success('Voedingsplan gedeselecteerd!');
        // Clear the selected plan
        setSelectedNutritionPlan(null);
        // Refresh the active plan selection
        checkUserNutritionProfile();
      } else {
        toast.error('Er is een fout opgetreden bij het deselecteren van het plan');
      }
    } catch (error) {
      console.error('Error deselecting nutrition plan:', error);
      toast.error('Er is een fout opgetreden');
    }
  };

  const handleViewDynamicPlan = (planId: string, planName: string) => {
    if (!userNutritionProfile) {
      toast.error('Vul eerst je dagelijkse behoefte in om het plan te kunnen bekijken');
      setShowRequiredIntake(true);
      return;
    }
    
    // All plans with meals data support dynamic viewing
    setViewingDynamicPlan({ planId, planName });
  };

  const handleBackFromDynamicPlan = () => {
    setViewingDynamicPlan(null);
    // Refresh the active plan selection to show the updated selection
    checkUserNutritionProfile();
  };

  const calculateNutrition = async () => {
    const { age, weight, height, activityLevel, goal } = calculatorData;
    
    console.log('🧮 Calculating nutrition with data:', calculatorData);
    
    if (!age || !weight || !height || !activityLevel || !goal) {
      toast.error('Vul alle velden in om je dagelijkse behoefte te berekenen');
      return;
    }

    try {
      // Map frontend goal to API goal format
      const apiGoal = goal === 'droogtrainen' ? 'cut' : 
                     goal === 'spiermassa' ? 'bulk' : 'maintain'; // Use 'maintain' for 'behoud'

      // Use the API for calculation
      const response = await fetch('/api/nutrition-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          age: parseInt(age),
          height: parseInt(height),
          weight: parseFloat(weight),
          gender: 'male', // Assuming male for now, could be added to form
          activityLevel,
          goal: apiGoal
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate nutrition');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to calculate nutrition');
      }

      const profile = {
        dailyCalories: data.calculations.targetCalories,
        protein: data.calculations.targetProtein,
        carbs: data.calculations.targetCarbs,
        fats: data.calculations.targetFat,
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        goal,
        activityLevel,
        bmr: data.calculations.bmr,
        tdee: data.calculations.tdee
      };

      console.log('💾 Profile calculated via API:', profile);
      setUserNutritionProfile(profile);
      
      // During onboarding step 4, hide calculator after calculation to show nutrition plans
      if (showOnboardingStep4) {
        console.log('🎯 Onboarding step 4: hiding calculator after calculation to show nutrition plans');
        setShowRequiredIntake(false);
      } else {
        setShowRequiredIntake(false);
      }
      
      // Reset calculator data
      setCalculatorData({ age: '', weight: '', height: '', activityLevel: '', goal: '' });
      
      toast.success('Dagelijkse behoefte berekend! 📊');
      
    } catch (error) {
      console.error('Error calculating nutrition:', error);
      toast.error('Fout bij berekenen van dagelijkse behoefte');
    }
  };

  const saveNutritionProfile = async (profile: any) => {
    if (!user?.id) return;
    
    try {
      // Check if this is an update (if user already has a profile)
      const isUpdate = userNutritionProfile !== null;
      let hasSignificantChange = false;
      
      if (isUpdate && userNutritionProfile) {
        // Check for significant changes (weight difference of 5kg+ or goal change)
        const weightDiff = Math.abs(profile.weight - userNutritionProfile.weight);
        const goalChanged = profile.goal !== userNutritionProfile.goal;
        
        hasSignificantChange = weightDiff >= 5 || goalChanged;
        
        if (hasSignificantChange) {
          console.log('🔄 Significant profile change detected:', {
            weightDiff,
            goalChanged,
            oldWeight: userNutritionProfile.weight,
            newWeight: profile.weight,
            oldGoal: userNutritionProfile.goal,
            newGoal: profile.goal
          });
        }
      }
      
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
        
        // Show appropriate success message based on whether there were significant changes
        if (hasSignificantChange) {
          toast.success(
            'Je voedingsprofiel is bijgewerkt! Let op: je hebt significante wijzigingen gemaakt in je gewicht of doel. Je aangepaste plannen behouden hun huidige instellingen. Voor automatisch herberekende plannen, bekijk je voedingsplannen opnieuw.',
            { duration: 8000 }
          );
        } else {
          toast.success('Je voedingsprofiel is opgeslagen!');
        }
        
        // During onboarding step 4, hide calculator after successful save to show nutrition plans
        if (showOnboardingStep4) {
          console.log('🎯 Onboarding step 4: hiding calculator after save to show nutrition plans');
          setShowRequiredIntake(false);
        } else {
          setShowRequiredIntake(false);
        }
      } else {
        throw new Error(data.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving nutrition profile:', error);
      toast.error('Er is een fout opgetreden bij het opslaan');
    }
  };



  useEffect(() => {
    if (user?.id) {
      console.log('🔍 Checking user nutrition profile for user:', user.id);
      checkOnboardingStatus();
    }
  }, [user?.id]);

  // Check nutrition profile after onboarding status is set
  useEffect(() => {
    if (user?.id && onboardingStatus !== null) {
      console.log('🔍 Checking user nutrition profile after onboarding status:', user.id);
      checkUserNutritionProfile();
    }
  }, [user?.id, onboardingStatus, showOnboardingStep4]);

  // Auto-refresh profile data when user returns to page (e.g., after editing profile elsewhere)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id && userNutritionProfile) {
        console.log('🔄 Page focused, refreshing nutrition profile data');
        checkUserNutritionProfile();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id, userNutritionProfile]);

  // Fetch plans when user profile changes or initially
  useEffect(() => {
    if (user?.id) {
      fetchNutritionPlans();
    }
  }, [user?.id, userNutritionProfile]);

  // Re-check selected plan when nutrition plans are loaded
  useEffect(() => {
    if (user?.id && nutritionPlans.length > 0 && userNutritionProfile) {
      // Re-check if we have an active plan and it exists in the loaded plans
      const checkActivePlan = async () => {
        try {
          const response = await fetch(`/api/nutrition-plan-active?userId=${user.id}`);
          const data = await response.json();
          
          if (data.success && data.hasActivePlan) {
            const planExists = nutritionPlans.find(p => p.plan_id === data.activePlanId);
            if (planExists) {
              console.log('✅ Active plan confirmed after plans loaded:', data.activePlanId);
              setSelectedNutritionPlan(data.activePlanId);
            } else {
              console.log('⚠️ Active plan not found in loaded plans:', data.activePlanId);
              setSelectedNutritionPlan(null);
            }
          } else {
            setSelectedNutritionPlan(null);
          }
        } catch (error) {
          console.error('❌ Error re-checking active plan:', error);
        }
      };
      
      checkActivePlan();
    }
  }, [user?.id, nutritionPlans, userNutritionProfile]);

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
        {/* Onboarding Progress - Step 4: Nutrition Plans */}
        {showOnboardingStep4 && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 border-2 border-[#8BAE5A] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl">🍽️</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Onboarding Stap 4: Voedingsplan Selecteren</h2>
                    <p className="text-[#8BAE5A] text-xs sm:text-sm">Vul je voedingsprofiel in en selecteer een voedingsplan</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-[#FFD700]">4/6</div>
                  <div className="text-[#8BAE5A] text-xs sm:text-sm">Stappen voltooid</div>
                </div>
              </div>
              
              {!userNutritionProfile ? (
                <div className="bg-[#181F17]/80 rounded-xl p-4 border border-[#3A4D23]">
                  <p className="text-[#f0a14f] text-sm font-semibold mb-2">
                    ⚠️ Je moet eerst je voedingsprofiel invullen
                  </p>
                  <p className="text-gray-300 text-sm">
                    Vul je lichaamsgegevens in om je dagelijkse voedingsbehoeften te berekenen en gepersonaliseerde voedingsplannen te krijgen.
                  </p>
                </div>
              ) : !selectedNutritionPlan ? (
                <div className="bg-[#181F17]/80 rounded-xl p-4 border border-[#3A4D23]">
                  <p className="text-[#f0a14f] text-sm font-semibold mb-2">
                    ⚠️ Selecteer een voedingsplan om door te gaan
                  </p>
                  <p className="text-gray-300 text-sm">
                    Kies een voedingsplan dat past bij je doelen en voorkeuren.
                  </p>
                </div>
              ) : (
                <div className="bg-[#8BAE5A]/20 rounded-xl p-4 border border-[#8BAE5A]">
                  <p className="text-[#8BAE5A] text-sm font-semibold mb-2">
                    ✅ Perfect! Je hebt een voedingsplan geselecteerd
                  </p>
                  <p className="text-gray-300 text-sm mb-4">
                    Je kunt nu door naar de volgende stap van de onboarding.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        // Mark step 4 as completed
                        const response = await fetch('/api/onboarding', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            userId: user?.id,
                            step: 4,
                            action: 'complete_step',
                            selectedNutritionPlan: selectedNutritionPlan
                          }),
                        });

                        if (response.ok) {
                          toast.success('Voedingsplan opgeslagen! Doorsturen naar challenges...');
                          // Navigate to challenges
                          setTimeout(() => {
                            window.location.href = '/dashboard/challenges';
                          }, 1500);
                        } else {
                          toast.error('Er is een fout opgetreden');
                        }
                      } catch (error) {
                        console.error('Error completing step:', error);
                        toast.error('Er is een fout opgetreden');
                      }
                    }}
                    className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#181F17] px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    Volgende Stap
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
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
              <DynamicPlanViewNew
                planId={viewingDynamicPlan.planId}
                planName={viewingDynamicPlan.planName}
                userId={user?.id || 'anonymous'}
                onBack={handleBackFromDynamicPlan}
              />
            </motion.div>
          ) : showRequiredIntake || (showOnboardingStep4 && !userNutritionProfile) ? (
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
                    <label className="block text-white font-semibold mb-2">
                      Leeftijd <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="bijv. 30"
                      value={calculatorData.age}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Gewicht (kg) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="bijv. 80"
                      value={calculatorData.weight}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Lengte (cm) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="bijv. 180"
                      value={calculatorData.height}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, height: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Dagelijkse Activiteit <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={calculatorData.activityLevel}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, activityLevel: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      required
                    >
                      <option value="">Selecteer je activiteitsniveau</option>
                      <option value="sedentary">Zittend (Licht actief) - Kantoorbaan, weinig beweging</option>
                      <option value="moderate">Staand (Matig actief) - Staand werk, matige beweging</option>
                      <option value="very_active">Lopend (Zeer actief) - Fysiek werk, veel beweging</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Doel <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={calculatorData.goal}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, goal: e.target.value }))}
                      className="w-full px-4 py-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:border-[#8BAE5A]"
                      required
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
{(() => {
                      // Check if we have filled form data that differs from existing profile  
                      const hasFormData = calculatorData.age || calculatorData.weight || calculatorData.height || calculatorData.activityLevel || calculatorData.goal;
                      
                      if (userNutritionProfile && hasFormData) {
                        return '🔄 Update Mijn Dagelijkse Behoefte';
                      } else if (userNutritionProfile) {
                        return '📝 Wijzig Mijn Gegevens';
                      } else {
                        return '🧮 Bereken Mijn Dagelijkse Behoefte';
                      }
                    })()}
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
                  {!showOnboardingStep4 && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={checkUserNutritionProfile}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors text-sm"
                        title="Ververs profiel data"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Ververs
                      </button>
                      <button
                        onClick={() => {
                          // Pre-fill calculator with existing data
                          setCalculatorData({
                            age: userNutritionProfile.age?.toString() || '',
                            weight: userNutritionProfile.weight?.toString() || '',
                            height: userNutritionProfile.height?.toString() || '',
                            activityLevel: userNutritionProfile.activity_level || 'moderate',
                            goal: userNutritionProfile.goal || ''
                          });
                          setShowRequiredIntake(true);
                        }}
                        className="text-[#8BAE5A] hover:text-[#B6C948] text-sm font-semibold transition-colors"
                      >
                        ✏️ Bewerken
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-[#181F17] rounded-lg p-4 text-center">
                    <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Calorieën</h4>
                    <p className="text-2xl font-bold text-white">{userNutritionProfile.dailyCalories}</p>
                    <p className="text-xs text-gray-400">per dag</p>
                  </div>
                  <div className="bg-[#181F17] rounded-lg p-4 text-center">
                    <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Eiwitten</h4>
                    {selectedNutritionPlan ? (() => {
                      const selectedPlan = nutritionPlans.find(p => p.plan_id === selectedNutritionPlan);
                      if (selectedPlan) {
                        // Use direct target values if available, otherwise calculate from percentages
                        if (selectedPlan.target_protein) {
                          return <p className="text-2xl font-bold text-white">{selectedPlan.target_protein}g</p>;
                        } else {
                          const macroValues = calculateMacroValues(selectedPlan, userNutritionProfile.dailyCalories);
                          return <p className="text-2xl font-bold text-white">{macroValues.protein}g</p>;
                        }
                      }
                      return <p className="text-sm text-gray-500">Plan niet gevonden</p>;
                    })() : (
                      <p className="text-sm text-gray-500">Selecteer eerst plan</p>
                    )}
                    <p className="text-xs text-gray-400">per dag</p>
                  </div>
                  <div className="bg-[#181F17] rounded-lg p-4 text-center">
                    <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Koolhydraten</h4>
                    {selectedNutritionPlan ? (() => {
                      const selectedPlan = nutritionPlans.find(p => p.plan_id === selectedNutritionPlan);
                      if (selectedPlan) {
                        // Use direct target values if available, otherwise calculate from percentages
                        if (selectedPlan.target_carbs) {
                          return <p className="text-2xl font-bold text-white">{selectedPlan.target_carbs}g</p>;
                        } else {
                          const macroValues = calculateMacroValues(selectedPlan, userNutritionProfile.dailyCalories);
                          return <p className="text-2xl font-bold text-white">{macroValues.carbs}g</p>;
                        }
                      }
                      return <p className="text-sm text-gray-500">Plan niet gevonden</p>;
                    })() : (
                      <p className="text-sm text-gray-500">Selecteer eerst plan</p>
                    )}
                    <p className="text-xs text-gray-400">per dag</p>
                  </div>
                  <div className="bg-[#181F17] rounded-lg p-4 text-center">
                    <h4 className="text-[#8BAE5A] font-semibold mb-1 text-sm">Vetten</h4>
                    {selectedNutritionPlan ? (() => {
                      const selectedPlan = nutritionPlans.find(p => p.plan_id === selectedNutritionPlan);
                      if (selectedPlan) {
                        // Use direct target values if available, otherwise calculate from percentages
                        if (selectedPlan.target_fat) {
                          return <p className="text-2xl font-bold text-white">{selectedPlan.target_fat}g</p>;
                        } else {
                          const macroValues = calculateMacroValues(selectedPlan, userNutritionProfile.dailyCalories);
                          return <p className="text-2xl font-bold text-white">{macroValues.fats}g</p>;
                        }
                      }
                      return <p className="text-sm text-gray-500">Plan niet gevonden</p>;
                    })() : (
                      <p className="text-sm text-gray-500">Selecteer eerst plan</p>
                    )}
                    <p className="text-xs text-gray-400">per dag</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-400">
                    <div className="mb-1">
                      <span className="text-[#8BAE5A] font-semibold capitalize">{userNutritionProfile.goal}</span>
                      {userNutritionProfile.weight && userNutritionProfile.age && (
                        <> • {userNutritionProfile.weight}kg • {userNutritionProfile.age} jaar</>
                      )}
                    </div>
                    {userNutritionProfile.height && (
                      <div className="text-xs text-gray-500">
                        Lengte: {userNutritionProfile.height}cm
                        {userNutritionProfile.activityLevel && (
                          <> • Activiteit: <span className="text-[#8BAE5A]">{getActivityLevelDisplay(userNutritionProfile.activityLevel)}</span></>
                        )}
                      </div>
                    )}
                    {selectedNutritionPlan && (() => {
                      const selectedPlan = nutritionPlans.find(p => p.plan_id === selectedNutritionPlan);
                      if (selectedPlan && (selectedPlan.protein_percentage || selectedPlan.carbs_percentage || selectedPlan.fat_percentage)) {
                        return (
                          <div className="mt-2 pt-2 border-t border-[#3A4D23]">
                            <div className="text-xs text-gray-500">
                              <span className="text-gray-400">Macro verdeling: </span>
                              <span className="text-[#8BAE5A] font-semibold">
                                {selectedPlan.protein_percentage ? `${selectedPlan.protein_percentage}% Eiwit` : ''}
                                {selectedPlan.protein_percentage && selectedPlan.carbs_percentage ? ' • ' : ''}
                                {selectedPlan.carbs_percentage ? `${selectedPlan.carbs_percentage}% Koolhydraten` : ''}
                                {selectedPlan.carbs_percentage && selectedPlan.fat_percentage ? ' • ' : ''}
                                {selectedPlan.fat_percentage ? `${selectedPlan.fat_percentage}% Vet` : ''}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Nutrition Plans - Show if user has profile OR if in onboarding step 4 */}
            {(userNutritionProfile || showOnboardingStep4) && (
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
                        className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 relative ${
                          selectedNutritionPlan === plan.plan_id
                            ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                            : 'border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50'
                        }`}
                      >
                        {/* Popular Badge - Top Right Corner */}
                        {plan.name.toLowerCase().includes('carnivoor') && (
                          <div className="absolute -top-2 -right-2 transform rotate-12">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-lg shadow-lg text-xs font-bold">
                              🔥 Populair
                            </div>
                          </div>
                        )}
                        
                        {/* Active Badge */}
                        {selectedNutritionPlan === plan.plan_id && (
                          <div className="absolute top-4 left-4">
                            <div className="inline-flex items-center px-2 py-1 bg-[#8BAE5A]/20 border border-[#8BAE5A] text-[#8BAE5A] rounded-md text-xs font-semibold">
                              <CheckIcon className="w-3 h-3 mr-1" />
                              Actief
                            </div>
                          </div>
                        )}
                        
                        <h3 className="text-xl font-bold text-white mb-2 text-center">{plan.name}</h3>
                        {plan.subtitle && (
                          <p className="text-[#8BAE5A] text-sm text-center mb-3">{plan.subtitle}</p>
                        )}
                        <p className="text-gray-300 text-center text-sm mb-4">{plan.description}</p>
                        
                        {/* Macro Percentages */}
                        {(plan.protein_percentage || plan.carbs_percentage || plan.fat_percentage) && (
                          <div className="mb-4 p-3 bg-[#1a1f17] border border-[#3a4d23] rounded-lg">
                            <div className="text-xs text-[#8bae5a] font-semibold mb-2 text-center">Macro Verdeling</div>
                            <div className="flex justify-between text-xs">
                              <div className="text-center">
                                <div className="text-white font-bold">{plan.protein_percentage || 0}%</div>
                                <div className="text-gray-400">Eiwit</div>
                              </div>
                              <div className="text-center">
                                <div className="text-white font-bold">{plan.carbs_percentage || 0}%</div>
                                <div className="text-gray-400">Koolhydraten</div>
                              </div>
                              <div className="text-center">
                                <div className="text-white font-bold">{plan.fat_percentage || 0}%</div>
                                <div className="text-gray-400">Vet</div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Target Values - Calculated based on user's daily needs and plan percentages */}
                        {userNutritionProfile && (
                          <div className="mb-4 p-3 bg-[#1a1f17] border border-[#3a4d23] rounded-lg">
                            <div className="text-xs text-[#8bae5a] font-semibold mb-2 text-center">Doelwaarden</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-center">
                                <div className="text-white font-bold">{userNutritionProfile.dailyCalories}</div>
                                <div className="text-gray-400">kcal</div>
                              </div>
                              <div className="text-center">
                                <div className="text-white font-bold">
                                  {(() => {
                                    const calculated = calculateMacroValues(plan, userNutritionProfile.dailyCalories);
                                    return calculated.protein > 0 ? calculated.protein : (plan.target_protein || 0);
                                  })()}g
                                </div>
                                <div className="text-gray-400">Eiwit</div>
                              </div>
                              <div className="text-center">
                                <div className="text-white font-bold">
                                  {(() => {
                                    const calculated = calculateMacroValues(plan, userNutritionProfile.dailyCalories);
                                    return calculated.carbs > 0 ? calculated.carbs : (plan.target_carbs || 0);
                                  })()}g
                                </div>
                                <div className="text-gray-400">Koolhydraten</div>
                              </div>
                              <div className="text-center">
                                <div className="text-white font-bold">
                                  {(() => {
                                    const calculated = calculateMacroValues(plan, userNutritionProfile.dailyCalories);
                                    return calculated.fats > 0 ? calculated.fats : (plan.target_fat || 0);
                                  })()}g
                                </div>
                                <div className="text-gray-400">Vet</div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          
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
                      
                      {/* Select Plan Button - Always visible */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNutritionPlanClick(plan.plan_id);
                        }}
                        className={`w-full px-4 py-2 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${
                          selectedNutritionPlan === plan.plan_id
                            ? 'bg-[#8BAE5A] text-[#232D1A]'
                            : 'bg-[#3A4D23] text-white hover:bg-[#4A5D33]'
                        }`}
                      >
                        {selectedNutritionPlan === plan.plan_id ? (
                          <>
                            <CheckIcon className="w-4 h-4" />
                            Geselecteerd - Klik om te deselecteren
                          </>
                        ) : (
                          'Selecteer dit plan'
                        )}
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
            )}
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}