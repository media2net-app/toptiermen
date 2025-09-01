"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon, 
  FireIcon, 
  StarIcon,
  PlayIcon,
  CheckIcon,
  ArrowRightIcon,
  ClockIcon,
  HeartIcon,
  CalculatorIcon,
  BookOpenIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import PageLayout from '@/components/PageLayout';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboarding } from "@/contexts/OnboardingContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

// Import workout data
import workoutData from '@/data/training-schema-workouts.json';

interface TrainingPreferences {
  frequency: number;
  style: 'gym' | 'bodyweight';
}

interface WorkoutSchema {
  id: string;
  name: string;
  frequency: number;
  style: 'gym' | 'bodyweight';
  description: string;
  days: {
    day: number;
    name: string;
    focus: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      rest: string;
      alternatives: { name: string; reason: string }[];
      feedback: string;
    }[];
  }[];
}

interface TrainingSchemaDb {
  id: string;
  name: string;
  description: string;
  category: string;
  cover_image: string | null;
  status: string;
  difficulty: string;
  estimated_duration: string;
  target_audience: string | null;
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

export default function TrainingscentrumPage() {
  const { user } = useSupabaseAuth();
  const { isOnboarding, currentStep: onboardingStep, completeStep } = useOnboarding();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<'training' | 'nutrition' | null>(null);
  const [pageStep, setPageStep] = useState(1);
  const [trainingPreferences, setTrainingPreferences] = useState<TrainingPreferences>({
    frequency: 0,
    style: 'gym'
  });
  const [workoutSchema, setWorkoutSchema] = useState<WorkoutSchema | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);
  const [showPreWorkoutModal, setShowPreWorkoutModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);
  const [availableSchemas, setAvailableSchemas] = useState<TrainingSchemaDb[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<TrainingSchemaDb | null>(null);
  const [selectedNutritionPlan, setSelectedNutritionPlan] = useState<string | null>(null);
  const [currentWorkoutData, setCurrentWorkoutData] = useState<any>(null);
  
  // Nutrition plans state
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  const [nutritionError, setNutritionError] = useState<string | null>(null);
  const [showNutritionIntake, setShowNutritionIntake] = useState(false);
  const [userNutritionProfile, setUserNutritionProfile] = useState<any>(null);
  const [activeNutritionTab, setActiveNutritionTab] = useState<'plans' | 'intake' | 'profile'>('plans');

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
    return (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    );
  };

  // Simplified data fetching function
  const fetchAllUserData = useCallback(async () => {
    if (!user) {
      console.log('Trainingscentrum: No user, skipping data fetch...');
      return;
    }

    console.log('Trainingscentrum: Fetching data for user:', user.email);
    setIsLoading(true);

    try {
      // Step 1: Fetch user data
      console.log('Trainingscentrum: Fetching user data...');
      let userData: any = null;
      let userError: any = null;
      
      // Try to fetch from profiles table first
      try {
        const result = await supabase
          .from('profiles')
          .select('selected_schema_id, selected_nutrition_plan')
          .eq('id', user.id)
          .single();
        
        userData = result.data;
        userError = result.error;
      } catch (error) {
        userError = error;
      }

      // If selected_schema_id column doesn't exist, try user_schema_selections table
      if (userError && userError.message.includes('selected_schema_id')) {
        console.log('Trainingscentrum: selected_schema_id column not found, trying user_schema_selections table...');
        
        try {
          const { data: schemaSelectionData, error: schemaSelectionError } = await supabase
            .from('user_schema_selections')
            .select('schema_id')
            .eq('user_id', user.id)
            .single();

          if (!schemaSelectionError && schemaSelectionData?.schema_id) {
            userData = { selected_schema_id: schemaSelectionData.schema_id, selected_nutrition_plan: null };
            userError = null;
          } else {
            console.log('Trainingscentrum: No schema selection found in database, checking localStorage...');
            
            // Check localStorage as fallback
            const localSchemaId = localStorage.getItem('selected_schema_id');
            if (localSchemaId) {
              console.log('Trainingscentrum: Found schema ID in localStorage:', localSchemaId);
              userData = { selected_schema_id: localSchemaId, selected_nutrition_plan: null };
              userError = null;
            }
          }
        } catch (error) {
          console.log('Trainingscentrum: user_schema_selections table not found, checking localStorage...');
          
          // Check localStorage as fallback
          const localSchemaId = localStorage.getItem('selected_schema_id');
          if (localSchemaId) {
            console.log('Trainingscentrum: Found schema ID in localStorage:', localSchemaId);
            userData = { selected_schema_id: localSchemaId, selected_nutrition_plan: null };
            userError = null;
          }
        }
      }

      if (userError && !userError.message.includes('selected_schema_id')) {
        console.warn('Trainingscentrum: User data fetch failed:', userError.message);
      }

      // Step 2: Fetch training schemas
      console.log('Trainingscentrum: Fetching training schemas...');
      const { data: schemasData, error: schemasError } = await supabase
        .from('training_schemas')
        .select('*')
        .eq('status', 'published');

      if (schemasError) {
        console.warn('Trainingscentrum: Schemas fetch failed:', schemasError.message);
      }

      // Update schemas
      setAvailableSchemas(schemasData || []);

      // Process user data if available
      if (userData) {
        // Set selected schema
        if (userData.selected_schema_id) {
          setSelectedSchemaId(userData.selected_schema_id);
          
          // Fetch the selected schema object
          try {
            const { data: schemaData, error: schemaError } = await supabase
              .from('training_schemas')
              .select('*')
              .eq('id', userData.selected_schema_id)
              .single();
            
            if (schemaError) {
              console.warn('Trainingscentrum: Selected schema fetch failed:', schemaError.message);
              setSelectedSchema(null);
            } else {
              setSelectedSchema(schemaData);
            }
          } catch (error) {
            console.error('Trainingscentrum: Error fetching selected schema:', error);
            setSelectedSchema(null);
          }
        } else {
          setSelectedSchema(null);
        }

        // Set selected nutrition plan
        if (userData.selected_nutrition_plan) {
          setSelectedNutritionPlan(userData.selected_nutrition_plan);
        }
      } else {
        // Reset if no user data
        setSelectedSchemaId(null);
        setSelectedSchema(null);
        setSelectedNutritionPlan(null);
      }

      console.log('Trainingscentrum: Data loaded successfully');

    } catch (error) {
      console.error('Trainingscentrum: Error during data fetch:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Single useEffect for all data loading
  useEffect(() => {
    if (user) {
      fetchAllUserData();
    } else if (user === null) {
      // User explicitly logged out
      setSelectedSchemaId(null);
      setSelectedSchema(null);
      setSelectedNutritionPlan(null);
      setAvailableSchemas([]);
      setIsLoading(false);
    }
    // If user is undefined, auth is still loading
  }, [user, fetchAllUserData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // No specific cleanup needed here as the simplified fetchAllUserData doesn't use refs
    };
  }, []);

  // Load nutrition data
  useEffect(() => {
    if (user) {
      fetchNutritionPlans();
      checkUserNutritionProfile();
    }
  }, [user]);

  const handleOptionSelect = async (option: 'training' | 'nutrition') => {
    setSelectedOption(option);
    if (option === 'nutrition') {
      // For onboarding, show nutrition selection on the same page
      if (isOnboarding && (onboardingStep === 4 || onboardingStep === 5)) {
        setPageStep(1); // Reset to step 1 for nutrition flow
      } else {
        // Show nutrition plans directly in trainingscentrum
        setActiveNutritionTab('plans');
        // Complete nutrition step if we're in onboarding mode
        if (isOnboarding && onboardingStep === 4) {
          await completeStep(4); // Complete nutrition step
        }
      }
    }
  };

  const saveSelectedSchema = async (schemaId: string) => {
    if (!user) return;

    try {
      // Try to save to profiles table first (if column exists)
      let { error } = await supabase
        .from('profiles')
        .update({ selected_schema_id: schemaId })
        .eq('id', user.id);

      // If that fails, try to save to user_schema_selections table
      if (error && error.message.includes('selected_schema_id')) {
        console.log('selected_schema_id column not found, trying user_schema_selections table...');
        
        const { error: schemaError } = await supabase
          .from('user_schema_selections')
          .upsert({
            user_id: user.id,
            schema_id: schemaId
          }, {
            onConflict: 'user_id'
          });

        if (schemaError) {
          console.error('Error saving to user_schema_selections:', schemaError);
          
          // If both fail, save to localStorage as fallback
          console.log('Saving to localStorage as fallback...');
          localStorage.setItem('selected_schema_id', schemaId);
          localStorage.setItem('selected_schema_timestamp', new Date().toISOString());
          
          error = null; // Clear error to continue
        } else {
          error = null; // Clear error to continue
        }
      }

      if (error) {
        console.error('Error saving selected schema:', error);
        alert('Er is een fout opgetreden bij het opslaan van je schema.');
      } else {
        setSelectedSchemaId(schemaId);
        setShowConfirmation(false);
        
        // Complete onboarding step if we're in onboarding mode
        if (isOnboarding && onboardingStep === 3) {
          await completeStep(4); // Complete training schema step (step 4)
        }
        
        // For onboarding, stay on the same page to continue with nutrition
        if (isOnboarding && (onboardingStep === 3 || onboardingStep === 4)) {
          toast.success('Trainingsschema opgeslagen! Nu kun je een voedingsplan kiezen.');
          setSelectedOption(null); // Reset to show both options again
        } else {
          // Navigate back to dashboard for non-onboarding
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      console.error('Error saving selected schema:', error);
      alert('Er is een fout opgetreden bij het opslaan van je schema.');
    }
  };

  const generateWorkoutSchema = () => {
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const schema: WorkoutSchema = {
        id: '1',
        name: `${trainingPreferences.frequency}-Daagse ${trainingPreferences.style === 'gym' ? 'Gym' : 'Bodyweight'} Schema`,
        frequency: trainingPreferences.frequency,
        style: trainingPreferences.style,
        description: `Een professioneel ${trainingPreferences.frequency}-daags schema geoptimaliseerd voor ${trainingPreferences.style === 'gym' ? 'gym training' : 'thuis training'} met focus op progressieve overload en balans.`,
        days: generateWorkoutDays(trainingPreferences.frequency, trainingPreferences.style)
      };
      
      setWorkoutSchema(schema);
      setPageStep(3);
      setIsGenerating(false);
    }, 2000);
  };

  const generateWorkoutDays = (frequency: number, style: 'gym' | 'bodyweight') => {
    const gymExercises = {
      upper: ['Bench Press', 'Pull-ups', 'Overhead Press', 'Barbell Rows', 'Dips'],
      lower: ['Squats', 'Deadlifts', 'Leg Press', 'Romanian Deadlifts', 'Lunges'],
      full: ['Deadlifts', 'Bench Press', 'Squats', 'Pull-ups', 'Overhead Press']
    };

    const bodyweightExercises = {
      upper: ['Push-ups', 'Pull-ups', 'Dips', 'Pike Push-ups', 'Inverted Rows'],
      lower: ['Squats', 'Lunges', 'Pistol Squats', 'Glute Bridges', 'Calf Raises'],
      full: ['Burpees', 'Mountain Climbers', 'Jump Squats', 'Push-ups', 'Pull-ups']
    };

    const exerciseAlternatives = {
      'Bench Press': [
        { name: 'Dumbbell Press', reason: 'Geen barbell beschikbaar' },
        { name: 'Machine Chest Press', reason: 'Barbell rack bezet' }
      ],
      'Pull-ups': [
        { name: 'Lat Pulldown', reason: 'Pull-up bar niet beschikbaar' },
        { name: 'Assisted Pull-ups', reason: 'Nog niet sterk genoeg' }
      ],
      'Squats': [
        { name: 'Leg Press', reason: 'Squat rack bezet' },
        { name: 'Goblet Squats', reason: 'Lichte blessure' }
      ],
      'Deadlifts': [
        { name: 'Romanian Deadlifts', reason: 'Lichte blessure' },
        { name: 'Good Mornings', reason: 'Geen barbell beschikbaar' }
      ],
      'Push-ups': [
        { name: 'Knee Push-ups', reason: 'Nog niet sterk genoeg' },
        { name: 'Incline Push-ups', reason: 'Makkelijkere variant' }
      ]
    };

    const exercises = style === 'gym' ? gymExercises : bodyweightExercises;
    
    const dayConfigs = {
      2: [
        { name: 'Full Body A', focus: 'Kracht & Hypertrofie', type: 'full' },
        { name: 'Full Body B', focus: 'Kracht & Hypertrofie', type: 'full' }
      ],
      3: [
        { name: 'Upper Body', focus: 'Bovenlichaam', type: 'upper' },
        { name: 'Lower Body', focus: 'Onderlichaam', type: 'lower' },
        { name: 'Full Body', focus: 'Volledige Lichaam', type: 'full' }
      ],
      4: [
        { name: 'Upper Body A', focus: 'Bovenlichaam (Push)', type: 'upper' },
        { name: 'Lower Body', focus: 'Onderlichaam', type: 'lower' },
        { name: 'Upper Body B', focus: 'Bovenlichaam (Pull)', type: 'upper' },
        { name: 'Full Body', focus: 'Volledige Lichaam', type: 'full' }
      ],
      5: [
        { name: 'Upper Body A', focus: 'Bovenlichaam (Push)', type: 'upper' },
        { name: 'Lower Body A', focus: 'Onderlichaam (Quad)', type: 'lower' },
        { name: 'Upper Body B', focus: 'Bovenlichaam (Pull)', type: 'upper' },
        { name: 'Lower Body B', focus: 'Onderlichaam (Posterior)', type: 'lower' },
        { name: 'Full Body', focus: 'Volledige Lichaam', type: 'full' }
      ],
      6: [
        { name: 'Upper Body A', focus: 'Bovenlichaam (Push)', type: 'upper' },
        { name: 'Lower Body A', focus: 'Onderlichaam (Quad)', type: 'lower' },
        { name: 'Upper Body B', focus: 'Bovenlichaam (Pull)', type: 'upper' },
        { name: 'Lower Body B', focus: 'Onderlichaam (Posterior)', type: 'lower' },
        { name: 'Full Body A', focus: 'Volledige Lichaam', type: 'full' },
        { name: 'Full Body B', focus: 'Volledige Lichaam', type: 'full' }
      ]
    };

    return dayConfigs[frequency as keyof typeof dayConfigs].map((config, index) => ({
      day: index + 1,
      name: config.name,
      focus: config.focus,
      exercises: exercises[config.type as keyof typeof exercises].slice(0, 5).map(exercise => ({
        name: exercise,
        sets: Math.floor(Math.random() * 3) + 3, // 3-5 sets
        reps: style === 'gym' ? '8-12' : '10-15',
        rest: '60-90 sec',
        alternatives: exerciseAlternatives[exercise as keyof typeof exerciseAlternatives] || [],
        feedback: ''
      }))
    }));
  };

  const startWorkout = async (workout: any) => {
    try {
      setCurrentWorkout(workout);
      setShowPreWorkoutModal(true);
    } catch (error) {
      console.error('Error starting workout:', error);
    }
  };

  const completeWorkout = async (workoutData: any) => {
    try {
      // Rest van de workout completion logica...
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const viewTrainingSchema = () => {
    if (selectedSchema) {
      // Navigate to a detailed view of the training schema
      router.push(`/dashboard/trainingscentrum/schema/${selectedSchema.id}`);
    }
  };

  const viewNutritionPlan = () => {
    if (selectedNutritionPlan) {
      // Show nutrition plans directly in trainingscentrum
      setSelectedOption('nutrition');
      setActiveNutritionTab('plans');
    }
  };

  // Filter schemas based on selected frequency
  const getFilteredSchemas = () => {
    if (!trainingPreferences.frequency) return availableSchemas;
    
    return availableSchemas.filter(schema => {
      // Extract frequency from schema name or target_audience
      const name = schema.name.toLowerCase();
      const audience = schema.target_audience?.toLowerCase() || '';
      
      // Check for frequency patterns in name
      if (name.includes(`${trainingPreferences.frequency}-daag`) || 
          name.includes(`${trainingPreferences.frequency} daag`) ||
          name.includes(`${trainingPreferences.frequency} dagen`)) {
        return true;
      }
      
      // Check for frequency patterns in target_audience
      if (audience.includes(`${trainingPreferences.frequency}-daag`) || 
          audience.includes(`${trainingPreferences.frequency} daag`) ||
          audience.includes(`${trainingPreferences.frequency} dagen`)) {
        return true;
      }
      
      // If no specific frequency is mentioned, show all schemas
      if (!name.includes('daag') && !audience.includes('daag')) {
        return true;
      }
      
      return false;
    });
  };

  if (!isLoading && selectedSchema && !showConfirmation && !workoutSchema && !pageStep) {
    // Toon direct het gekozen schema
    return (
              <PageLayout title="Trainingscentrum" description="Persoonlijke trainingsschema's en voedingsplannen geïntegreerd">
        <div className="w-full mt-12">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Jouw Gekozen Schema</h2>
            <h3 className="text-2xl font-bold text-[#8BAE5A] mb-2">{selectedSchema.name}</h3>
            <p className="text-gray-300 mb-4">{selectedSchema.description}</p>
            <div className="text-sm text-gray-400 mb-2">Categorie: {selectedSchema.category}</div>
            <div className="text-sm text-gray-400 mb-6">Niveau: {selectedSchema.difficulty}</div>
            <div className="flex gap-4 justify-center">
              <button
                className="inline-flex items-center px-6 py-3 bg-[#3A4D23] text-white font-semibold rounded-lg hover:bg-[#4A5D33] transition-all duration-200"
                onClick={viewTrainingSchema}
              >
                Bekijk schema
              </button>
                          <button
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#232D1A] font-bold rounded-xl hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => {
                setSelectedOption('training');
                setPageStep(1);
                setWorkoutSchema(null);
                setShowConfirmation(false);
              }}
            >
              Wijzig schema
            </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Trainingscentrum"
              description="Persoonlijke trainingsschema's en voedingsplannen geïntegreerd"
    >
      {/* Onboarding Indicator */}
      {isOnboarding && (onboardingStep === 3 || onboardingStep === 4 || onboardingStep === 5) && (
        <div className="w-full mb-6">
          <div className="bg-gradient-to-r from-[#8BAE5A]/20 to-[#3A4D23]/20 border-2 border-[#8BAE5A] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {onboardingStep === 3 ? '💪' : '🥗'}
              </span>
              <div className="flex-1">
                <h3 className="font-semibold text-[#8BAE5A]">
                  {onboardingStep === 3 ? 'Stap 4: Trainingsschema kiezen' : 'Stap 5: Voedingsplan kiezen'}
                </h3>
                <p className="text-sm text-gray-300">
                  {onboardingStep === 3 
                    ? 'Selecteer een trainingsschema dat bij jou past' 
                    : 'Kies een voedingsplan voor optimale resultaten'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {!isLoading && selectedSchema && (
        <div className="w-full mt-8 mb-8">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center md:text-left">
              <div className="text-sm text-[#8BAE5A] font-semibold mb-1">Je huidige schema</div>
              <div className="text-xl font-bold text-white mb-1">{selectedSchema.name}</div>
              <div className="text-gray-400 text-sm mb-1">Categorie: {selectedSchema.category} | Niveau: {selectedSchema.difficulty}</div>
              <div className="text-gray-300 text-sm">{selectedSchema.description}</div>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                className="px-4 py-3 bg-[#3A4D23] text-white font-semibold rounded-lg hover:bg-[#4A5D33] transition-all duration-200"
                onClick={viewTrainingSchema}
              >
                Bekijk schema
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#232D1A] font-bold rounded-xl hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => {
                  setSelectedOption('training');
                  setPageStep(1);
                  setWorkoutSchema(null);
                  setShowConfirmation(false);
                }}
              >
                Wijzig schema
              </button>
            </div>
          </div>
        </div>
      )}
      {!isLoading && selectedNutritionPlan && (
        <div className="w-full mt-8 mb-4">
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
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                className="px-4 py-3 bg-[#3A4D23] text-white font-semibold rounded-lg hover:bg-[#4A5D33] transition-all duration-200"
                onClick={viewNutritionPlan}
              >
                Bekijk plan
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#232D1A] font-bold rounded-xl hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => {
                  setSelectedOption('nutrition');
                  setActiveNutritionTab('plans');
                }}
              >
                Wijzig voedingsplan
              </button>
            </div>
          </div>
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-gray-300">Laden...</p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {!selectedOption && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Kies Jouw Focus
                </h2>
                <p className="text-gray-300 text-lg">
                  Wat wil je vandaag optimaliseren? Kies tussen een persoonlijk trainingsschema of een voedingsplan op maat.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Trainingsschema Option */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group cursor-pointer"
                  onClick={() => handleOptionSelect('training')}
                >
                  <div className="bg-gradient-to-br from-[#232D1A] to-[#1A2315] border-2 border-[#3A4D23] rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-[#8BAE5A] group-hover:shadow-2xl group-hover:shadow-[#8BAE5A]/20">
                    <div className="flex items-center justify-center w-16 h-16 bg-[#8BAE5A] rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                      <FireIcon className="w-8 h-8 text-[#232D1A]" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4 text-center">
                      Trainingsschema
                    </h3>
                    
                    <p className="text-gray-300 text-center mb-6">
                      Krijg een persoonlijk trainingsschema op basis van jouw beschikbaarheid en voorkeuren. Perfect voor zowel gym als thuis training.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-400">
                        <CheckIcon className="w-4 h-4 mr-2 text-[#8BAE5A]" />
                        Op maat voor jouw frequentie
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <CheckIcon className="w-4 h-4 mr-2 text-[#8BAE5A]" />
                        Gym of bodyweight opties
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <CheckIcon className="w-4 h-4 mr-2 text-[#8BAE5A]" />
                        Progressieve overload
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Voedingsplan Option */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group cursor-pointer"
                  onClick={() => handleOptionSelect('nutrition')}
                >
                  <div className="bg-gradient-to-br from-[#232D1A] to-[#1A2315] border-2 border-[#3A4D23] rounded-2xl p-8 h-full transition-all duration-300 group-hover:border-[#8BAE5A] group-hover:shadow-2xl group-hover:shadow-[#8BAE5A]/20">
                    <div className="flex items-center justify-center w-16 h-16 bg-[#8BAE5A] rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                      <HeartIcon className="w-8 h-8 text-[#232D1A]" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4 text-center">
                      Voedingsplan
                    </h3>
                    
                    <p className="text-gray-300 text-center mb-6">
                      Ontvang een compleet voedingsplan op basis van jouw doelen en voorkeuren. Van calorieën tot macronutriënten en maaltijdplanning.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-400">
                        <CheckIcon className="w-4 h-4 mr-2 text-[#8BAE5A]" />
                        Persoonlijke caloriebehoefte
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <CheckIcon className="w-4 h-4 mr-2 text-[#8BAE5A]" />
                        Macro-optimalisatie
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <CheckIcon className="w-4 h-4 mr-2 text-[#8BAE5A]" />
                        Dagelijkse maaltijdplanning
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {selectedOption === 'training' && pageStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Stap 1: Hoeveel dagen per week wil je committeren aan je training?
                </h2>
                <p className="text-gray-300 text-lg">
                  Kies de frequentie die het beste past bij jouw levensstijl en doelen.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {[2, 3, 4, 5, 6].map((days) => (
                  <motion.button
                    key={days}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setTrainingPreferences(prev => ({ ...prev, frequency: days }));
                      setPageStep(2);
                    }}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      trainingPreferences.frequency === days
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                        : 'border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50'
                    }`}
                  >
                    <div className="text-2xl font-bold text-white mb-2">{days}</div>
                    <div className="text-sm text-gray-400">dagen</div>
                    {days === 3 && (
                      <div className="text-xs text-[#8BAE5A] mt-2">
                        Aanbevolen voor een solide basis
                      </div>
                    )}
                    {days === 5 && (
                      <div className="text-xs text-[#8BAE5A] mt-2">
                        Voor serieuze progressie
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedOption === 'training' && pageStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Stap 2: Kies een trainingsschema
                </h2>
                <p className="text-gray-300 text-lg">
                  Selecteer een schema dat past bij jouw keuze van {trainingPreferences.frequency} dagen per week.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {getFilteredSchemas().length > 0 ? (
                  getFilteredSchemas().map((schema) => (
                    <motion.div
                      key={schema.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        // Load workout data for this schema
                        const schemaWorkoutData = workoutData[schema.id];
                        setCurrentWorkoutData(schemaWorkoutData);
                        
                        setWorkoutSchema({
                          id: schema.id,
                          name: schema.name,
                          frequency: schemaWorkoutData?.frequency || trainingPreferences.frequency,
                          style: schema.category === 'Gym' ? 'gym' : 'bodyweight',
                          description: schema.description,
                          days: schemaWorkoutData?.days || [],
                        });
                        setPageStep(3);
                      }}
                      className="cursor-pointer rounded-2xl p-8 border-2 transition-all duration-300 border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50 hover:shadow-xl hover:shadow-[#8BAE5A]/10"
                    >
                      {/* Schema Header */}
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-white mb-3">{schema.name}</h3>
                        <div className="flex items-center justify-center gap-4 text-sm">
                          <span className="px-3 py-1 bg-[#3A4D23] text-[#8BAE5A] rounded-full font-medium">
                            {schema.category}
                          </span>
                          <span className="px-3 py-1 bg-[#8BAE5A]/20 text-[#8BAE5A] rounded-full font-medium">
                            {schema.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Schema Description - Simplified */}
                      <div className="mb-6">
                        <p className="text-gray-300 text-center leading-relaxed">
                          {schema.description.split('.')[0].split('Rep range')[0].trim()}.
                        </p>
                      </div>

                      {/* Training Details */}
                      <div className="bg-[#1A2315] rounded-xl p-4 mb-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-[#8BAE5A] font-semibold mb-1">Rep Range</div>
                            <div className="text-white">8-12</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[#8BAE5A] font-semibold mb-1">Rust</div>
                            <div className="text-white">90s</div>
                          </div>
                        </div>
                      </div>

                      {/* Important Notice */}
                      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-yellow-500 font-semibold text-sm mb-1">BELANGRIJK</h4>
                            <p className="text-yellow-400 text-sm leading-relaxed">
                              Train tot spierfalen voor optimale resultaten
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Select Button */}
                      <div className="text-center">
                        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#7A9D4A] text-[#232D1A] font-bold rounded-xl hover:from-[#7A9D4A] hover:to-[#6A8D3A] transition-all duration-200 shadow-lg hover:shadow-xl">
                          <span>Selecteer Schema</span>
                          <ArrowRightIcon className="w-5 h-5 ml-2" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-8">
                      <h3 className="text-xl font-bold text-white mb-4">
                        Geen schema's gevonden voor {trainingPreferences.frequency} dagen per week
                      </h3>
                      <p className="text-gray-300 mb-6">
                        Er zijn momenteel geen trainingsschema's beschikbaar voor {trainingPreferences.frequency} dagen per week. 
                        Probeer een andere frequentie te kiezen of neem contact op voor een persoonlijk schema.
                      </p>
                      <button
                        onClick={() => setPageStep(1)}
                        className="bg-[#8BAE5A] text-white px-6 py-3 rounded-lg hover:bg-[#7A9D4A] transition-all"
                      >
                        Terug naar frequentie keuze
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {selectedOption === 'training' && pageStep === 3 && workoutSchema && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {workoutSchema.name}
                </h2>
                <p className="text-gray-300 text-lg mb-6">
                  {workoutSchema.description}
                </p>
                
                {/* Training Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-[#1A2315] border border-[#3A4D23] rounded-xl p-4 text-center">
                    <CalendarIcon className="w-8 h-8 text-[#8BAE5A] mx-auto mb-2" />
                    <div className="text-white font-semibold">{workoutSchema.frequency} dagen</div>
                    <div className="text-gray-400 text-sm">per week</div>
                  </div>
                  <div className="bg-[#1A2315] border border-[#3A4D23] rounded-xl p-4 text-center">
                    <ClockIcon className="w-8 h-8 text-[#8BAE5A] mx-auto mb-2" />
                    <div className="text-white font-semibold">45-60 min</div>
                    <div className="text-gray-400 text-sm">per training</div>
                  </div>
                  <div className="bg-[#1A2315] border border-[#3A4D23] rounded-xl p-4 text-center">
                    <FireIcon className="w-8 h-8 text-[#8BAE5A] mx-auto mb-2" />
                    <div className="text-white font-semibold">Progressief</div>
                    <div className="text-gray-400 text-sm">overload</div>
                  </div>
                </div>

                {/* Muscle Failure Warning */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-yellow-500 mb-2">
                        🎯 Belangrijke Training Tip
                      </h3>
                      <div className="text-yellow-400 leading-relaxed">
                        <p className="mb-2">
                          <strong>Train tot spierfalen</strong> voor optimale resultaten. Dit betekent dat je de laatste herhaling van elke set niet meer kunt voltooien met goede vorm.
                        </p>
                        <p className="text-sm">
                          Dit is essentieel voor maximale spiergroei en krachttoename.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Removed redundant summary line - info is already shown in cards above */}
              </div>

              <div className="grid gap-6">
                {workoutSchema.days.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 hover:border-[#8BAE5A]/30 transition-all duration-300"
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#8BAE5A] to-[#7A9D4A] rounded-full flex items-center justify-center">
                          <span className="text-[#232D1A] font-bold text-lg">{day.day}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {day.name}
                          </h3>
                          <p className="text-[#8BAE5A] font-medium">{day.focus}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">Totaal</div>
                        <div className="text-lg font-bold text-[#8BAE5A]">
                          {day.exercises.length} oefeningen
                        </div>
                      </div>
                    </div>

                    {/* Exercises */}
                    <div className="space-y-4">
                      {day.exercises.map((exercise, exerciseIndex) => (
                        <div
                          key={exerciseIndex}
                          className="bg-[#1A2315] border border-[#3A4D23] rounded-xl p-4 hover:border-[#8BAE5A]/30 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-white text-lg mb-1">
                                {exercise.name}
                              </div>
                              {exercise.feedback && (
                                <div className="text-[#8BAE5A] text-sm italic">
                                  💡 {exercise.feedback}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-center">
                                <div className="text-[#8BAE5A] font-semibold mb-1">Sets</div>
                                <div className="text-white font-bold">{exercise.sets}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-[#8BAE5A] font-semibold mb-1">Reps</div>
                                <div className="text-white font-bold">{exercise.reps}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-[#8BAE5A] font-semibold mb-1">Rust</div>
                                <div className="text-white font-bold">{exercise.rest}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Exercise alternatives */}
                          {exercise.alternatives && exercise.alternatives.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#3A4D23]">
                              <div className="text-[#8BAE5A] text-sm font-semibold mb-2">Alternatieven:</div>
                              <div className="space-y-1">
                                {exercise.alternatives.map((alt, altIndex) => (
                                  <div key={altIndex} className="text-gray-400 text-sm">
                                    • {alt.name} - {alt.reason}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 text-center space-y-4">
                {selectedSchemaId === workoutSchema.id ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center px-4 py-2 bg-[#8BAE5A]/20 border border-[#8BAE5A] text-[#8BAE5A] rounded-lg">
                      <CheckIcon className="w-5 h-5 mr-2" />
                      Dit is je geselecteerde schema
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Mark training schema as completed for onboarding
                        localStorage.setItem('trainingSchemaCompleted', 'true');
                        // Navigate back to dashboard
                        window.location.href = '/dashboard';
                      }}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#232D1A] font-bold rounded-xl hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <CheckIcon className="w-6 h-6 mr-2" />
                      Start met dit Schema
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirmation(true)}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#232D1A] font-bold rounded-xl hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <CheckIcon className="w-6 h-6 mr-2" />
                    Selecteer dit Schema
                  </motion.button>
                )}
                
                <div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedOption(null);
                      setPageStep(1);
                      setWorkoutSchema(null);
                      setShowConfirmation(false);
                    }}
                    className="inline-flex items-center px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] font-semibold rounded-lg hover:bg-[#4A5D33] transition-colors duration-200"
                  >
                    <ArrowRightIcon className="w-5 h-5 mr-2" />
                    Nieuw Schema Genereren
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
                )}

          {selectedOption === 'nutrition' && pageStep === 1 && (
            <motion.div
              key="nutrition-step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Stap 5: Kies een Voedingsplan
                </h2>
                <p className="text-gray-300 text-lg">
                  Selecteer een voedingsplan dat past bij jouw doelen en voorkeuren.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {dietTypes.map((diet) => (
                  <motion.div
                    key={diet.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      setSelectedNutritionPlan(diet.id);
                      
                      // Save to database
                      if (user) {
                        try {
                          const { error } = await supabase
                            .from('profiles')
                            .update({ selected_nutrition_plan: diet.id })
                            .eq('id', user.id);

                          if (error) {
                            console.error('Error saving nutrition plan:', error);
                            toast.error('Er is een fout opgetreden bij het opslaan van je voedingsplan.');
                          } else {
                            // Complete onboarding step if we're in onboarding mode
                            if (isOnboarding && (onboardingStep === 4 || onboardingStep === 5)) {
                              await completeStep(5); // Complete nutrition step
                            }
                            
                            toast.success('Voedingsplan opgeslagen! Doorsturen naar forum...');
                            
                            // Navigate to forum for next onboarding step
                            setTimeout(() => {
                              window.location.href = '/dashboard/brotherhood/forum';
                            }, 1500);
                          }
                        } catch (error) {
                          console.error('Error saving nutrition plan:', error);
                          toast.error('Er is een fout opgetreden bij het opslaan van je voedingsplan.');
                        }
                      }
                    }}
                    className="cursor-pointer rounded-2xl p-8 border-2 transition-all duration-300 border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50"
                  >
                    <div className="text-center mb-4">
                      <span className="text-4xl">{diet.icon}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 text-center">{diet.name}</h3>
                    <p className="text-[#8BAE5A] text-sm text-center mb-3">{diet.subtitle}</p>
                    <p className="text-gray-300 text-center mb-4">{diet.description}</p>
                    
                    {selectedNutritionPlan === diet.id && (
                      <div className="inline-flex items-center px-4 py-2 bg-[#8BAE5A]/20 border border-[#8BAE5A] text-[#8BAE5A] rounded-lg">
                        <CheckIcon className="w-5 h-5 mr-2" />
                        Geselecteerd
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Full Nutrition Plans Interface */}
          {selectedOption === 'nutrition' && !isOnboarding && (
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
                            <div className="inline-flex items-center px-3 py-1 bg-[#8BAE5A]/20 border border-[#8BAE5A] text-[#8BAE5A] rounded-lg text-sm">
                              <CheckIcon className="w-4 h-4 mr-1" />
                              Actief
                            </div>
                          )}
                        </motion.div>
                      ))}
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
                        <button
                          onClick={handleNutritionIntakeSkip}
                          className="px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] font-semibold rounded-lg hover:bg-[#4A5D33] transition-colors duration-200"
                        >
                          Overslaan
                        </button>
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
          )}

          {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-[#8BAE5A] rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckIcon className="w-8 h-8 text-[#232D1A]" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  Schema Bevestigen
                </h3>
                
                <p className="text-gray-300 mb-8">
                  Weet je zeker dat je dit trainingsschema wilt selecteren? Dit wordt je actieve schema en wordt opgeslagen in je profiel.
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] font-semibold rounded-lg hover:bg-[#4A5D33] transition-colors duration-200"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={() => saveSelectedSchema(workoutSchema!.id)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#232D1A] font-bold rounded-lg hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200"
                  >
                    Bevestigen
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
} 