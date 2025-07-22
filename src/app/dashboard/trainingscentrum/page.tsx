"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon, 
  FireIcon, 
  SparklesIcon,
  PlayIcon,
  CheckIcon,
  ArrowRightIcon,
  ClockIcon,
  HeartIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import PageLayout from '@/components/PageLayout';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

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
  const { user } = useAuth();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<'training' | 'nutrition' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
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
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('selected_schema_id, selected_nutrition_plan')
        .eq('id', user.id)
        .single();

      if (userError) {
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

  const handleOptionSelect = (option: 'training' | 'nutrition') => {
    setSelectedOption(option);
    if (option === 'nutrition') {
      // Navigate to voedingsplannen
      window.location.href = '/dashboard/voedingsplannen';
    }
  };

  const saveSelectedSchema = async (schemaId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ selected_schema_id: schemaId })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving selected schema:', error);
        alert('Er is een fout opgetreden bij het opslaan van je schema.');
      } else {
        setSelectedSchemaId(schemaId);
        setShowConfirmation(false);
        // Mark training schema as completed for onboarding
        localStorage.setItem('trainingSchemaCompleted', 'true');
        // Navigate back to dashboard
        window.location.href = '/dashboard';
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
      setCurrentStep(3);
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
      // Navigate to the nutrition plan page to view the current plan
      router.push('/dashboard/voedingsplannen');
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

  if (!isLoading && selectedSchema && !showConfirmation && !workoutSchema && !currentStep) {
    // Toon direct het gekozen schema
    return (
      <PageLayout title="Trainingscentrum" description="Persoonlijke trainingsschema's en voedingsplannen op maat">
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
                setCurrentStep(1);
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
      description="Persoonlijke trainingsschema's en voedingsplannen op maat"
    >
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
                  setCurrentStep(1);
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
                onClick={() => window.location.href = '/dashboard/voedingsplannen'}
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

          {selectedOption === 'training' && currentStep === 1 && (
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
                      setCurrentStep(2);
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

          {selectedOption === 'training' && currentStep === 2 && (
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
                        setWorkoutSchema({
                          id: schema.id,
                          name: schema.name,
                          frequency: trainingPreferences.frequency,
                          style: schema.category === 'Gym' ? 'gym' : 'bodyweight',
                          description: schema.description,
                          days: [], // optioneel: kun je aanvullen als je dagdata wilt ophalen
                        });
                        setCurrentStep(3);
                      }}
                      className="cursor-pointer rounded-2xl p-8 border-2 transition-all duration-300 border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50"
                    >
                      <h3 className="text-2xl font-bold text-white mb-4 text-center">{schema.name}</h3>
                      <p className="text-gray-300 text-center mb-4">{schema.description}</p>
                      <div className="text-sm text-gray-400 text-center">Categorie: {schema.category}</div>
                      <div className="text-sm text-gray-400 text-center">Niveau: {schema.difficulty}</div>
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
                        onClick={() => setCurrentStep(1)}
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

          {selectedOption === 'training' && currentStep === 3 && workoutSchema && (
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
                <div className="inline-flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {workoutSchema.frequency} dagen per week
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    45-60 min per training
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                {workoutSchema.days.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Dag {day.day}: {day.name}
                        </h3>
                        <p className="text-gray-400">{day.focus}</p>
                      </div>
                      <div className="text-sm text-[#8BAE5A] font-medium">
                        {day.exercises.length} oefeningen
                      </div>
                    </div>

                    <div className="space-y-3">
                      {day.exercises.map((exercise, exerciseIndex) => (
                        <div
                          key={exerciseIndex}
                          className="flex items-center justify-between p-3 bg-[#1A2315] rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-white">{exercise.name}</div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{exercise.sets} sets</span>
                            <span>{exercise.reps} reps</span>
                            <span>{exercise.rest} rust</span>
                          </div>
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
                      setCurrentStep(1);
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