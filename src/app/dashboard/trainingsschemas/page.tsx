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
  AcademicCapIcon
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

interface TrainingProfile {
  id?: string;
  user_id: string;
  training_goal: 'spiermassa' | 'kracht_uithouding' | 'power_kracht';
  training_frequency: 3 | 4 | 5 | 6;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  equipment_type: 'gym' | 'home' | 'outdoor';
  created_at?: string;
  updated_at?: string;
}

interface WorkoutSchema {
  id: string;
  name: string;
  frequency: number;
  style: string;
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

export default function TrainingschemasPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { isOnboarding, currentStep: onboardingStep, completeStep } = useOnboarding();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<'training' | null>('training');
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
  const [currentWorkoutData, setCurrentWorkoutData] = useState<any>(null);
  const [customSchemas, setCustomSchemas] = useState<{[key: string]: any}>({});
  const [editingSchema, setEditingSchema] = useState<string | null>(null);
  
  // Training Profile State
  const [userTrainingProfile, setUserTrainingProfile] = useState<TrainingProfile | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [calculatorData, setCalculatorData] = useState({
    training_goal: 'spiermassa' as 'spiermassa' | 'kracht_uithouding' | 'power_kracht',
    training_frequency: 3 as 3 | 4 | 5 | 6,
    experience_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    equipment_type: 'gym' as 'gym' | 'home' | 'outdoor'
  });

  const steps = [
    {
      id: 'training_goal',
      title: 'Wat is je trainingsdoel?',
      subtitle: 'Kies het doel dat het beste bij jou past',
      options: [
        { value: 'spiermassa', label: 'Spiermassa', description: '8-12 reps, 4 sets, 90s rust', icon: '💪' },
        { value: 'kracht_uithouding', label: 'Kracht & Uithouding', description: '15-20 reps, 4 sets, 40-60s rust', icon: '🏃' },
        { value: 'power_kracht', label: 'Power & Kracht', description: '3-6 reps, 4 sets, 150-180s rust', icon: '⚡' }
      ]
    },
    {
      id: 'training_frequency',
      title: 'Hoe vaak wil je per week trainen?',
      subtitle: 'Selecteer je gewenste trainingsfrequentie',
      options: [
        { value: 3, label: '3x per week', description: 'Perfect voor beginners', icon: '📅' },
        { value: 4, label: '4x per week', description: 'Ideaal voor consistentie', icon: '📅' },
        { value: 5, label: '5x per week', description: 'Voor gevorderden', icon: '📅' },
        { value: 6, label: '6x per week', description: 'Maximale intensiteit', icon: '📅' }
      ]
    },
    {
      id: 'experience_level',
      title: 'Wat is je ervaringsniveau?',
      subtitle: 'Help ons je het juiste schema te vinden',
      options: [
        { value: 'beginner', label: 'Beginner', description: 'Minder dan 1 jaar ervaring', icon: '🌱' },
        { value: 'intermediate', label: 'Gemiddeld', description: '1-3 jaar ervaring', icon: '📈' },
        { value: 'advanced', label: 'Gevorderd', description: 'Meer dan 3 jaar ervaring', icon: '🏆' }
      ]
    },
    {
      id: 'equipment_type',
      title: 'Waar ga je trainen?',
      subtitle: 'Kies je trainingsomgeving',
      options: [
        { value: 'gym', label: 'Gym', description: 'Volledige gym met alle apparaten', icon: '🏋️' },
        { value: 'home', label: 'Thuis', description: 'Beperkte apparaten of bodyweight', icon: '🏠' },
        { value: 'outdoor', label: 'Buiten', description: 'Outdoor training en bootcamp', icon: '🌳' }
      ]
    }
  ];

  // Training Profile functions
  const fetchUserTrainingProfile = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('training_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        setUserTrainingProfile(data);
        setCalculatorData({
          training_goal: data.training_goal,
          training_frequency: data.training_frequency,
          experience_level: data.experience_level,
          equipment_type: data.equipment_type
        });
      }
    } catch (error) {
      console.error('Error fetching training profile:', error);
    }
  };

  const saveTrainingProfile = async () => {
    try {
            console.log('💾 Saving training profile with data:', calculatorData);
      console.log('👤 Current user:', user);
      console.log('🆔 User ID:', user?.id, 'Type:', typeof user?.id);

      if (!user?.id) {
        toast.error('Je moet ingelogd zijn');
        return;
      }

      const profileData = {
        user_id: user.id, // This should be a valid UUID string
        training_goal: calculatorData.training_goal,
        training_frequency: calculatorData.training_frequency,
        experience_level: calculatorData.experience_level,
        equipment_type: calculatorData.equipment_type,
        updated_at: new Date().toISOString()
      };
      
      console.log('📤 Sending profile data to database:', profileData);

      console.log('🔄 Attempting database upsert...');
      const { data, error } = await supabase
        .from('training_profiles')
        .upsert(profileData)
        .select()
        .single();

      console.log('📊 Database response:', { data, error });

      if (error) {
        console.error('❌ Error saving training profile:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`Fout bij opslaan van trainingsprofiel: ${error.message}`);
        return;
      }

      console.log('✅ Training profile saved successfully:', data);
      setUserTrainingProfile(data);
      setShowCalculator(false);
      setCurrentStep(0);
      toast.success('Trainingsprofiel opgeslagen!');
      
      // Fetch training schemas with the new profile data
      console.log('🔍 Fetching training schemas with new profile...');
      await fetchTrainingSchemasWithProfile(data);
      
    } catch (error) {
      console.error('❌ Error in saveTrainingProfile:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      toast.error(`Er is een fout opgetreden: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    }
  };

  const handleStepAnswer = (stepId: string, value: any) => {
    console.log('🎯 Step answer:', { stepId, value, currentStep, totalSteps: steps.length });
    
    setCalculatorData(prev => {
      const newData = {
        ...prev,
        [stepId]: value
      };
      console.log('📊 Updated calculator data:', newData);
      return newData;
    });

    // Move to next step
    if (currentStep < steps.length - 1) {
      console.log('➡️ Moving to next step:', currentStep + 1);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 300);
    } else {
      // Last step - save profile
      console.log('💾 Last step reached, saving profile...');
      setTimeout(() => {
        saveTrainingProfile();
      }, 300);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const startCalculator = () => {
    setShowCalculator(true);
    setCurrentStep(0);
    setCalculatorData({
      training_goal: 'spiermassa',
      training_frequency: 3,
      experience_level: 'beginner',
      equipment_type: 'gym'
    });
  };

  const loadCustomSchema = async (schemaId: string) => {
    try {
      if (!user?.id) return null;

      const response = await fetch(`/api/training-schema-load?userId=${user.id}&schemaId=${schemaId}`);
      const data = await response.json();

      if (data.success && data.data) {
        return data.data.custom_data;
      }
      return null;
    } catch (error) {
      console.error('Error loading custom schema:', error);
      return null;
    }
  };

  const saveCustomSchema = async (schemaId: string, customData: any, customName?: string, customDescription?: string) => {
    try {
      if (!user?.id) {
        toast.error('Je moet ingelogd zijn');
        return false;
      }

      const response = await fetch('/api/training-schema-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          schemaId,
          customData,
          customName,
          customDescription
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCustomSchemas(prev => ({
          ...prev,
          [schemaId]: customData
        }));
        toast.success('Aangepast schema opgeslagen!');
        return true;
      } else {
        toast.error('Fout bij opslaan van aangepast schema');
        return false;
      }
    } catch (error) {
      console.error('Error saving custom schema:', error);
      toast.error('Er is een fout opgetreden');
      return false;
    }
  };

  // Training functions
  const fetchTrainingSchemas = async () => {
    try {
      let query = supabase
        .from('training_schemas')
        .select('*')
        .eq('status', 'published');
      
      // Filter based on user training profile if available
      if (userTrainingProfile) {
                // Map user profile to database fields
        const goalMapping = {
          'spiermassa': 'spiermassa',
          'kracht_uithouding': 'uithouding',
          'power_kracht': 'kracht'
        };
        
        const equipmentMapping = {
          'gym': 'Gym',
          'home': 'Home',
          'outdoor': 'Outdoor'
        };
        
        const difficultyMapping = {
          'beginner': 'Beginner',
          'intermediate': 'Intermediate', 
          'advanced': 'Advanced'
        };
        
        // Filter by training goal
        if (userTrainingProfile.training_goal) {
          query = query.eq('training_goal', goalMapping[userTrainingProfile.training_goal]);
        }
        
        // Filter by equipment type
        if (userTrainingProfile.equipment_type) {
          query = query.eq('category', equipmentMapping[userTrainingProfile.equipment_type]);
        }
        
        // Filter by difficulty level
        if (userTrainingProfile.experience_level) {
          query = query.eq('difficulty', difficultyMapping[userTrainingProfile.experience_level]);
        }
        
        // Filter by frequency (this would need to be added to the database schema)
        // For now, we'll filter client-side
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching training schemas:', error);
        return;
      }
      
      let filteredSchemas = data || [];
      
      // Client-side filtering for frequency if user profile exists
      if (userTrainingProfile) {
        filteredSchemas = filteredSchemas.filter(schema => {
          // Extract frequency from schema name (e.g., "3x Split Training")
          const frequencyMatch = schema.name.match(/(\d+)x/);
          if (frequencyMatch) {
            const schemaFrequency = parseInt(frequencyMatch[1]);
            return schemaFrequency === userTrainingProfile.training_frequency;
          }
          return true;
        });
      }
      
      setAvailableSchemas(filteredSchemas);
    } catch (error) {
      console.error('Error in fetchTrainingSchemas:', error);
    }
  };

  const fetchTrainingSchemasWithProfile = async (profile: TrainingProfile) => {
    try {
      let query = supabase
        .from('training_schemas')
        .select('*')
        .eq('status', 'published');
      
      // Map user profile to database fields
      const goalMapping = {
        'spiermassa': 'spiermassa',
        'kracht_uithouding': 'uithouding', 
        'power_kracht': 'kracht'
      };
      
      const equipmentMapping = {
        'gym': 'Gym',
        'home': 'Home',
        'outdoor': 'Outdoor'
      };
      
      const difficultyMapping = {
        'beginner': 'Beginner',
        'intermediate': 'Intermediate', 
        'advanced': 'Advanced'
      };
      
      // Filter by training goal
      if (profile.training_goal) {
        query = query.eq('training_goal', goalMapping[profile.training_goal]);
      }
      
      // Filter by equipment type
      if (profile.equipment_type) {
        query = query.eq('category', equipmentMapping[profile.equipment_type]);
      }
      
      // Filter by difficulty level
      if (profile.experience_level) {
        query = query.eq('difficulty', difficultyMapping[profile.experience_level]);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching training schemas:', error);
        return;
      }
      
      let filteredSchemas = data || [];
      
      // Client-side filtering for frequency
      filteredSchemas = filteredSchemas.filter(schema => {
        // Extract frequency from schema name (e.g., "3x Split Training")
        const frequencyMatch = schema.name.match(/(\d+)x/);
        if (frequencyMatch) {
          const schemaFrequency = parseInt(frequencyMatch[1]);
          return schemaFrequency === profile.training_frequency;
        }
        return true;
      });
      
      setAvailableSchemas(filteredSchemas);
      console.log('✅ Training schemas loaded:', filteredSchemas.length, 'schemas found');
    } catch (error) {
      console.error('Error in fetchTrainingSchemasWithProfile:', error);
    }
  };

  const fetchUserActiveSchema = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('user_training_schemas')
        .select(`
          *,
          training_schemas (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      if (!error && data) {
        setSelectedSchemaId(data.schema_id);
        setSelectedSchema(data.training_schemas);
      }
    } catch (error) {
      console.error('Error fetching user active schema:', error);
    }
  };

  const fetchCurrentWorkout = async () => {
    try {
      if (!user?.id || !selectedSchemaId) return;
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('user_workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('schema_id', selectedSchemaId)
        .eq('scheduled_date', today)
        .single();
      
      if (!error && data) {
        setCurrentWorkoutData(data);
      }
    } catch (error) {
      console.log('No workout scheduled for today');
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserTrainingProfile();
      fetchUserActiveSchema();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchTrainingSchemas();
    }
  }, [user?.id, userTrainingProfile]);

  useEffect(() => {
    if (user?.id && selectedSchemaId) {
      fetchCurrentWorkout();
    }
  }, [user?.id, selectedSchemaId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const generateWorkoutSchema = () => {
    if (!trainingPreferences.frequency || !trainingPreferences.style) {
      toast.error('Vul alle voorkeuren in');
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const allSchemas = Object.values(workoutData);
      const filteredSchemas = allSchemas.filter(schema => 
        schema.frequency === trainingPreferences.frequency && 
        schema.style === trainingPreferences.style
      );

      if (filteredSchemas.length > 0) {
        const randomSchema = filteredSchemas[Math.floor(Math.random() * filteredSchemas.length)];
        setWorkoutSchema(randomSchema);
        setPageStep(3);
      } else {
        toast.error('Geen schema gevonden voor deze voorkeuren');
      }
      
      setIsGenerating(false);
    }, 2000);
  };

  const handleSchemaSelection = async (schemaId: string) => {
    try {
      if (!user?.id) {
        toast.error('Je moet ingelogd zijn');
        return;
      }

      // Check if there's a custom version of this schema
      const customData = await loadCustomSchema(schemaId);
      
      if (customData) {
        // Use custom schema data
        setCustomSchemas(prev => ({
          ...prev,
          [schemaId]: customData
        }));
        toast.success('Aangepast trainingsschema geladen!');
      } else {
        // Use default schema
        toast.success('Trainingsschema geselecteerd!');
      }

      setSelectedSchemaId(schemaId);
      const selected = availableSchemas.find(s => s.id === schemaId);
      setSelectedSchema(selected || null);
      
      // Complete onboarding step if needed
      if (isOnboarding && onboardingStep === 3) {
        await completeStep(3);
      }
      
    } catch (error) {
      console.error('Error in handleSchemaSelection:', error);
      toast.error('Er is een fout opgetreden');
    }
  };

  const handleStartWorkout = () => {
    if (selectedSchema) {
      router.push(`/dashboard/trainingscentrum/workoutschema/${selectedSchema.category.toLowerCase()}`);
    }
  };

  const resetOnboarding = () => {
    setSelectedOption(null);
    setPageStep(1);
    setTrainingPreferences({ frequency: 0, style: 'gym' });
    setWorkoutSchema(null);
  };

  if (isLoading || authLoading) {
    return (
      <PageLayout 
        title="Trainingsschemas" 
        subtitle="Kies en beheer je trainingsschemas"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-[#8BAE5A] text-lg">Trainingsschemas laden...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show fallback if no user is logged in
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1411] via-[#181F17] to-[#232D1A] flex items-center justify-center">
        <div className="bg-[#232D1A] p-8 rounded-lg border border-[#3A4D23] max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Trainingsschemas
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-300 text-center">
              Je bent niet ingelogd. Log in om je trainingsschemas te bekijken.
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
      title="Trainingsschemas" 
      subtitle="Kies en beheer je trainingsschemas voor optimale resultaten"
    >
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Training Schema Selection */}
          {!isOnboarding && selectedOption === 'training' && (
            <motion.div
              key="training-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Trainingsschemas
                </h2>
                <p className="text-gray-300 text-lg">
                  Kies een trainingsschema dat past bij jouw doelen en niveau.
                </p>
              </div>

              {/* Training Profile Notice */}
              {userTrainingProfile && (
                <div className="mb-8 p-6 bg-[#232D1A] rounded-xl border border-[#3A4D23]">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <FireIcon className="w-6 h-6 text-[#8BAE5A] mr-2" />
                    Jouw Trainingsprofiel
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Doel:</span>
                      <p className="text-white font-semibold capitalize">
                        {userTrainingProfile.training_goal.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Frequentie:</span>
                      <p className="text-white font-semibold">
                        {userTrainingProfile.training_frequency}x per week
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Niveau:</span>
                      <p className="text-white font-semibold capitalize">
                        {userTrainingProfile.experience_level}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Equipment:</span>
                      <p className="text-white font-semibold capitalize">
                        {userTrainingProfile.equipment_type}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={startCalculator}
                      className="px-4 py-2 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors text-sm"
                    >
                      Bewerken
                    </button>
                  </div>
                </div>
              )}


              {/* No Profile - Show Calculator Button */}
              {!userTrainingProfile && !showCalculator && (
                <div className="mb-8 p-6 bg-[#232D1A] rounded-xl border border-[#3A4D23] text-center">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center">
                    <FireIcon className="w-6 h-6 text-[#8BAE5A] mr-2" />
                    Persoonlijk Trainingsprofiel
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Vul je trainingsvoorkeuren in om gepersonaliseerde trainingsschemas te krijgen die perfect bij jou passen.
                  </p>
                  <button
                    onClick={startCalculator}
                    className="px-8 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
                  >
                    Start Trainingsprofiel
                  </button>
                </div>
              )}

              {/* Step-by-Step Calculator Flow */}
              {showCalculator && (
                <div className="mb-8 min-h-[600px] flex flex-col">
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        Stap {currentStep + 1} van {steps.length}
                      </span>
                      <span className="text-sm text-gray-400">
                        {Math.round(((currentStep + 1) / steps.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#3A4D23] rounded-full h-2">
                      <div 
                        className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-full max-w-2xl"
                      >
                        <div className="text-center mb-8">
                          <h2 className="text-3xl font-bold text-white mb-4">
                            {steps[currentStep].title}
                          </h2>
                          <p className="text-gray-300 text-lg">
                            {steps[currentStep].subtitle}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {steps[currentStep].options.map((option, index) => (
                            <motion.button
                              key={option.value}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={() => handleStepAnswer(steps[currentStep].id, option.value)}
                              className="p-6 bg-[#232D1A] rounded-xl border-2 border-[#3A4D23] hover:border-[#8BAE5A]/50 transition-all duration-200 text-left group"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="text-3xl">{option.icon}</div>
                                <div className="flex-1">
                                  <h3 className="text-xl font-semibold text-white mb-1">
                                    {option.label}
                                  </h3>
                                  <p className="text-gray-400">
                                    {option.description}
                                  </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ArrowRightIcon className="w-6 h-6 text-[#8BAE5A]" />
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        {/* Back Button */}
                        {currentStep > 0 && (
                          <div className="mt-8 text-center">
                            <button
                              onClick={goToPreviousStep}
                              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                              ← Vorige stap
                            </button>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Current Schema Display */}
              {selectedSchema && (
                <div className="mb-8 p-6 bg-[#232D1A] rounded-xl border border-[#3A4D23]">
                  <h3 className="text-xl font-bold text-white mb-2">Actief Schema</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-[#8BAE5A]">{selectedSchema.name}</h4>
                      <p className="text-gray-300 text-sm">{selectedSchema.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {selectedSchema.estimated_duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <StarIcon className="w-4 h-4" />
                          {selectedSchema.difficulty}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleStartWorkout}
                      className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold flex items-center gap-2"
                    >
                      <PlayIcon className="w-5 h-5" />
                      Start Training
                    </button>
                  </div>
                </div>
              )}

              {/* Available Schemas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableSchemas.map((schema) => (
                  <motion.div
                    key={schema.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      selectedSchemaId === schema.id
                        ? 'bg-[#8BAE5A]/10 border-[#8BAE5A]'
                        : 'bg-[#232D1A] border-[#3A4D23] hover:border-[#8BAE5A]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{schema.name}</h3>
                        <p className="text-gray-300 text-sm mb-3">{schema.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {schema.estimated_duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4" />
                            {schema.difficulty}
                          </span>
                        </div>
                        
                        {schema.target_audience && (
                          <div className="mt-2">
                            <span className="text-xs bg-[#3A4D23] text-[#8BAE5A] px-2 py-1 rounded-full">
                              {schema.target_audience}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        {selectedSchemaId === schema.id ? (
                          <div className="w-12 h-12 bg-[#8BAE5A] rounded-lg flex items-center justify-center">
                            <CheckIcon className="w-6 h-6 text-[#232D1A]" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-[#3A4D23] rounded-lg flex items-center justify-center">
                            <AcademicCapIcon className="w-6 h-6 text-[#8BAE5A]" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-400 capitalize">
                        {schema.category}
                      </span>
                      {selectedSchemaId === schema.id && (
                        <span className="text-sm text-[#8BAE5A] font-semibold">
                          Geselecteerd plan
                        </span>
                      )}
                    </div>

                    {/* Select Plan Button */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSchemaSelection(schema.id)}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors font-semibold ${
                          selectedSchemaId === schema.id
                            ? 'bg-[#8BAE5A] text-[#232D1A]'
                            : 'bg-[#3A4D23] text-white hover:bg-[#4A5D33]'
                        }`}
                      >
                        {selectedSchemaId === schema.id ? 'Geselecteerd' : '🎯 Selecteer dit plan'}
                      </button>
                      
                      {selectedSchemaId === schema.id && (
                        <button
                          onClick={() => setEditingSchema(schema.id)}
                          className="px-4 py-2 bg-[#8BAE5A]/20 text-[#8BAE5A] border border-[#8BAE5A] rounded-lg hover:bg-[#8BAE5A]/30 transition-colors"
                        >
                          Bewerken
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {availableSchemas.length === 0 && (
                <div className="text-center py-12">
                  <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-300">Geen trainingsschemas beschikbaar</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Er zijn momenteel geen actieve trainingsschemas beschikbaar.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Onboarding Flow for Training */}
          {isOnboarding && onboardingStep === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Kies je Trainingsschema
                </h2>
                <p className="text-gray-300 text-lg">
                  Selecteer het trainingsschema dat het beste past bij jouw niveau en doelen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableSchemas.map((schema) => (
                  <motion.div
                    key={schema.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-6 bg-[#232D1A] rounded-xl border-2 border-[#3A4D23] hover:border-[#8BAE5A]/50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{schema.name}</h3>
                        <p className="text-gray-300 text-sm mb-3">{schema.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {schema.estimated_duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4" />
                            {schema.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-12 h-12 bg-[#3A4D23] rounded-lg flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-[#8BAE5A]" />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <button 
                        onClick={() => handleSchemaSelection(schema.id)}
                        className="w-full px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
                      >
                        🎯 Selecteer dit plan
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Schema Edit Modal */}
        {editingSchema && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[#232D1A] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Schema Bewerken
                </h3>
                <button
                  onClick={() => setEditingSchema(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Aangepaste naam (optioneel)
                  </label>
                  <input
                    type="text"
                    placeholder="Bijv. Mijn Personalisatie Schema"
                    className="w-full px-4 py-3 bg-[#3A4D23] border border-[#4A5D33] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A]"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-3">
                    Aangepaste beschrijving (optioneel)
                  </label>
                  <textarea
                    placeholder="Beschrijf je aanpassingen..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#3A4D23] border border-[#4A5D33] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8BAE5A] resize-none"
                  />
                </div>

                <div className="bg-[#3A4D23] p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Schema Details</h4>
                  <p className="text-gray-300 text-sm">
                    Hier kun je in de toekomst specifieke oefeningen, sets, reps en andere details aanpassen.
                    Deze functionaliteit wordt binnenkort toegevoegd.
                  </p>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    onClick={() => setEditingSchema(null)}
                    className="px-6 py-3 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={async () => {
                      // For now, just save a basic custom schema
                      const success = await saveCustomSchema(
                        editingSchema, 
                        { 
                          customizations: 'Basic customizations applied',
                          lastModified: new Date().toISOString()
                        },
                        'Aangepast Schema',
                        'Dit schema is aangepast door de gebruiker'
                      );
                      
                      if (success) {
                        setEditingSchema(null);
                      }
                    }}
                    className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
                  >
                    Opslaan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
